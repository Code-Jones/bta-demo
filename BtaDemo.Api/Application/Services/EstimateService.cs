using BtaDemo.Api.Data;
using BtaDemo.Api.Domain.Entities;
using BtaDemo.Api.Application.Dtos;
using Microsoft.EntityFrameworkCore;
using BtaDemo.Api.Domain.Enum;
using BtaDemo.Api.Domain.StateMachines;
using BtaDemo.Api.Application.Events;
using BtaDemo.Api.Domain.Events;
using BtaDemo.Api.Domain.Exceptions;
using BtaDemo.Api.Application.Services.Builders;

namespace BtaDemo.Api.Application.Services;

public class EstimateService
{
    private readonly AppDbContext _dbContext;
    private readonly EstimateStateMachine _estimateStateMachine;
    private readonly LeadStateMachine _leadStateMachine;
    private readonly IStateTransitionEventEmitter _eventEmitter;
    private readonly ICurrentUser _currentUser;

    public EstimateService(
        AppDbContext dbContext,
        EstimateStateMachine estimateStateMachine,
        LeadStateMachine leadStateMachine,
        IStateTransitionEventEmitter eventEmitter,
        ICurrentUser currentUser)
    {
        _dbContext = dbContext;
        _estimateStateMachine = estimateStateMachine;
        _leadStateMachine = leadStateMachine;
        _eventEmitter = eventEmitter;
        _currentUser = currentUser;
    }

    public async Task<Estimate> CreateAsync(CreateEstimateRequest req, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var lead = await _dbContext.Leads
            .Include(x => x.TaxLines)
            .Include(x => x.CompanyEntity)
                .ThenInclude(x => x.TaxLines)
            .FirstOrDefaultAsync(x => x.Id == req.LeadId && x.OrganizationId == organizationId, cancellationToken)
            ?? throw new NotFoundException("Lead not found");
        if (lead.IsDeleted)
            throw new ConflictException("Cannot create an estimate for a deleted lead");
        if (lead.Status == LeadStatus.Lost)
            throw new ConflictException("Cannot create an estimate for a lost lead");

        var utcNow = DateTime.UtcNow;
        StateTransition<LeadStatus>? leadTransition = null;
        if (lead.Status == LeadStatus.New)
        {
            leadTransition = _leadStateMachine.Transition(lead, LeadStatus.Converted, utcNow);
        }

        var description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim();
        IReadOnlyList<EstimateLineItemRequest> requestLineItems = req.LineItems ?? Array.Empty<EstimateLineItemRequest>();
        if (requestLineItems.Count == 0)
        {
            if (req.Amount <= 0)
                throw new ValidationException("Amount must be greater than 0");

            var fallbackDescription = description ?? "Estimate";
            var baseLineItems = new List<EstimateLineItemRequest>
            {
                new(fallbackDescription, 1, req.Amount, false, null, 1)
            };

            var taxLines = new List<TaxLine>();
            if (lead.TaxLines.Count > 0)
            {
                taxLines.AddRange(lead.TaxLines);
            }
            if (lead.CompanyEntity?.TaxLines.Count > 0)
            {
                taxLines.AddRange(lead.CompanyEntity.TaxLines);
            }

            var sortOrder = 2;
            foreach (var taxLine in taxLines)
            {
                baseLineItems.Add(new EstimateLineItemRequest(
                    taxLine.Label,
                    1,
                    0,
                    true,
                    taxLine.Rate,
                    sortOrder++));
            }

            requestLineItems = baseLineItems;
        }
        else if (!requestLineItems.Any(x => !x.IsTaxLine))
        {
            throw new ValidationException("At least one line item is required");
        }

        var estimate = new Estimate
        {
            OrganizationId = organizationId,
            LeadId = req.LeadId,
            Description = description,
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow,
        };

        var lineItems = LineItemBuilder.BuildEstimateLineItems(requestLineItems, estimate.Id);
        estimate.LineItems = lineItems;
        var totals = LineItemBuilder.CalculateTotals(lineItems);
        estimate.Amount = totals.Total;

        _dbContext.Estimates.Add(estimate);
        await _dbContext.SaveChangesAsync(cancellationToken);
        if (leadTransition is not null)
        {
            await _eventEmitter.EmitAsync(new StateTransitionEvent(
                nameof(Lead),
                lead.Id,
                leadTransition.From.ToString(),
                leadTransition.To.ToString(),
                leadTransition.OccurredAtUtc),
                cancellationToken);
        }
        return estimate;
    }

    public async Task<Estimate> SendAsync(Guid estimateId, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var estimate = await _dbContext.Estimates.FirstOrDefaultAsync(
            x => x.Id == estimateId && x.OrganizationId == organizationId,
            cancellationToken) ?? throw new NotFoundException("Estimate not found");

        // later add sending email logic here 
        var utcNow = DateTime.UtcNow;
        var transition = _estimateStateMachine.Transition(estimate, EstimateStatus.Sent, utcNow);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _eventEmitter.EmitAsync(new StateTransitionEvent(
            nameof(Estimate),
            estimate.Id,
            transition.From.ToString(),
            transition.To.ToString(),
            transition.OccurredAtUtc),
            cancellationToken);
        return estimate;
    }

    public async Task<Estimate> AcceptAsync(Guid estimateId, AcceptEstimateRequest request, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();

        // transaction because later we will create a job and invoice
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var estimate = await _dbContext.Estimates
            .Include(x => x.LineItems)
            .FirstOrDefaultAsync(x => x.Id == estimateId && x.OrganizationId == organizationId, cancellationToken)
            ?? throw new NotFoundException("Estimate not found");
        var leadExists = await _dbContext.Leads.AnyAsync(
            x => x.Id == estimate.LeadId && x.OrganizationId == organizationId,
            cancellationToken);
        if (!leadExists)
            throw new NotFoundException("Lead not found");
        var utcNow = DateTime.UtcNow;

        // later add job creation logic here 
        var estimateTransition = _estimateStateMachine.Transition(estimate, EstimateStatus.Accepted, utcNow);

        if (request.EstimatedEndAtUtc <= request.StartAtUtc)
            throw new ValidationException("Estimated end date must be after the start date");

        var job = new Job
        {
            OrganizationId = organizationId,
            LeadId = estimate.LeadId,
            EstimateId = estimate.Id,
            Description = estimate.Description,
            StartAtUtc = request.StartAtUtc,
            EstimatedEndAtUtc = request.EstimatedEndAtUtc
        };

        _dbContext.Jobs.Add(job);

        var estimateLineItems = estimate.LineItems.Count > 0
            ? estimate.LineItems
            : LineItemBuilder.BuildEstimateLineItems(new[]
            {
                new EstimateLineItemRequest(estimate.Description ?? "Estimate approved", 1, estimate.Amount, false, null, 1)
            }, estimate.Id);

        var lineItems = estimateLineItems.Select(item => new InvoiceLineItem
        {
            Description = item.Description,
            Quantity = item.IsTaxLine ? 1 : item.Quantity,
            UnitPrice = item.IsTaxLine ? 0 : item.UnitPrice,
            IsTaxLine = item.IsTaxLine,
            TaxRate = item.IsTaxLine ? item.TaxRate : null,
            SortOrder = item.SortOrder
        }).OrderBy(x => x.SortOrder).ToList();

        var totals = LineItemBuilder.CalculateTotals(estimateLineItems);

        var invoice = new Invoice
        {
            OrganizationId = organizationId,
            JobId = job.Id,
            Amount = totals.Total,
            LineItems = lineItems
        };

        _dbContext.Invoices.Add(invoice);

        var milestoneSource = request.Milestones is not null
            ? request.Milestones
                .Where(x => !string.IsNullOrWhiteSpace(x.Title))
                .Select((item, index) => new JobMilestone
                {
                    JobId = job.Id,
                    Title = item.Title.Trim(),
                    Notes = string.IsNullOrWhiteSpace(item.Notes) ? null : item.Notes.Trim(),
                    Status = item.Status ?? MilestoneStatus.Pending,
                    OccurredAtUtc = item.OccurredAtUtc ?? request.StartAtUtc,
                    SortOrder = item.SortOrder ?? index + 1,
                })
                .OrderBy(x => x.SortOrder)
                .ToList()
            : estimateLineItems
                .Where(item => !item.IsTaxLine)
                .Select((item, index) => new JobMilestone
                {
                    JobId = job.Id,
                    Title = item.Description,
                    Notes = null,
                    Status = MilestoneStatus.Pending,
                    OccurredAtUtc = request.StartAtUtc,
                    SortOrder = index + 1,
                })
                .ToList();

        if (milestoneSource.Count > 0)
        {
            _dbContext.JobMilestones.AddRange(milestoneSource);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        await _eventEmitter.EmitAsync(new StateTransitionEvent(
            nameof(Estimate),
            estimate.Id,
            estimateTransition.From.ToString(),
            estimateTransition.To.ToString(),
            estimateTransition.OccurredAtUtc),
            cancellationToken);
        return estimate;
    }
    
    public async Task<Estimate> RejectAsync(Guid estimateId, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var estimate = await _dbContext.Estimates.FirstOrDefaultAsync(
            x => x.Id == estimateId && x.OrganizationId == organizationId,
            cancellationToken) ?? throw new NotFoundException("Estimate not found");

        var utcNow = DateTime.UtcNow;
        var transition = _estimateStateMachine.Transition(estimate, EstimateStatus.Rejected, utcNow);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _eventEmitter.EmitAsync(new StateTransitionEvent(
            nameof(Estimate),
            estimate.Id,
            transition.From.ToString(),
            transition.To.ToString(),
            transition.OccurredAtUtc),
            cancellationToken);
        return estimate;
    }

    public async Task<IReadOnlyList<EstimateListResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var estimates = await _dbContext.Estimates
            .AsNoTracking()
            .Include(x => x.LineItems)
            .Include(x => x.Lead)
                .ThenInclude(x => x.CompanyEntity)
            .Where(x => x.OrganizationId == organizationId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return estimates.Select(MapEstimate).ToList();
    }

    public async Task<Estimate> UpdateAsync(Guid estimateId, UpdateEstimateRequest request, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var estimate = await _dbContext.Estimates
            .Include(x => x.LineItems)
            .FirstOrDefaultAsync(x => x.Id == estimateId && x.OrganizationId == organizationId, cancellationToken)
            ?? throw new NotFoundException("Estimate not found");

        if (estimate.Status != EstimateStatus.Draft)
            throw new ConflictException("Only draft estimates can be updated");

        if (request.Description is not null)
        {
            estimate.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        }

        if (request.LineItems is not null)
        {
            if (request.LineItems.Count == 0)
                throw new ValidationException("At least one line item is required");

            if (!request.LineItems.Any(x => !x.IsTaxLine))
                throw new ValidationException("At least one line item is required");

            await _dbContext.EstimateLineItems
                .Where(x => x.EstimateId == estimate.Id)
                .ExecuteDeleteAsync(cancellationToken);

            var lineItems = LineItemBuilder.BuildEstimateLineItems(request.LineItems, estimate.Id);
            _dbContext.EstimateLineItems.AddRange(lineItems);

            var totals = LineItemBuilder.CalculateTotals(lineItems);
            estimate.Amount = totals.Total;
        }

        estimate.UpdatedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return estimate;
    }

    private static EstimateListResponse MapEstimate(Estimate estimate)
    {
        var lineItems = estimate.LineItems.OrderBy(x => x.SortOrder).ToList();
        if (lineItems.Count == 0)
        {
            lineItems.Add(new EstimateLineItem
            {
                EstimateId = estimate.Id,
                Description = estimate.Description ?? "Estimate total",
                Quantity = 1,
                UnitPrice = estimate.Amount,
                IsTaxLine = false,
                SortOrder = 1,
            });
        }

        var totals = LineItemBuilder.CalculateTotals(lineItems);
        var lineItemResponses = lineItems.Select(item => new EstimateLineItemResponse(
            item.Id,
            item.Description,
            item.Quantity,
            item.UnitPrice,
            item.IsTaxLine,
            item.TaxRate,
            item.IsTaxLine
                ? Math.Round(totals.Subtotal * (item.TaxRate ?? 0) / 100m, 2)
                : Math.Round(item.Quantity * item.UnitPrice, 2),
            item.SortOrder
        )).ToList();

        var lead = estimate.Lead;
        var company = lead?.CompanyEntity;

        return new EstimateListResponse(
            estimate.Id,
            estimate.LeadId,
            lead?.Name ?? "Unknown Lead",
            lead?.Company,
            lead?.Email,
            lead?.Phone,
            lead?.AddressLine1,
            lead?.AddressLine2,
            lead?.City,
            lead?.State,
            lead?.PostalCode,
            company?.Name,
            company?.TaxId,
            estimate.Description,
            totals.Subtotal,
            totals.TaxTotal,
            totals.Total,
            estimate.Status,
            estimate.CreatedAtUtc,
            estimate.UpdatedAtUtc,
            estimate.SentAtUtc,
            estimate.AcceptedAtUtc,
            estimate.RejectedAtUtc,
            lineItemResponses
        );
    }

    private Guid GetOrganizationId()
    {
        var organizationId = _currentUser.OrganizationId;
        if (organizationId == Guid.Empty)
        {
            throw new UnauthorizedAccessException("Organization scope missing");
        }

        return organizationId;
    }

}
