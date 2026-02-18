using BtaDemo.Api.Data;
using BtaDemo.Api.Domain.Entities;
using BtaDemo.Api.Application.Dtos;
using Microsoft.EntityFrameworkCore;
using BtaDemo.Api.Domain.Enum;
using BtaDemo.Api.Domain.Events;
using BtaDemo.Api.Domain.StateMachines;
using BtaDemo.Api.Application.Events;
using BtaDemo.Api.Domain.Exceptions;
using BtaDemo.Api.Application.Services.Builders;

namespace BtaDemo.Api.Application.Services;

public class LeadService
{
    private readonly AppDbContext _dbContext;
    private readonly LeadStateMachine _stateMachine;
    private readonly IStateTransitionEventEmitter _eventEmitter;
    private readonly ICurrentUser _currentUser;

    public LeadService(
        AppDbContext dbContext,
        LeadStateMachine stateMachine,
        IStateTransitionEventEmitter eventEmitter,
        ICurrentUser currentUser)
    {
        _dbContext = dbContext;
        _stateMachine = stateMachine;
        _eventEmitter = eventEmitter;
        _currentUser = currentUser;
    }

    public async Task<Lead> CreateAsync(CreateLeadRequest req, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        if (string.IsNullOrWhiteSpace(req.Name))
            throw new ValidationException("Name is required");

        if (req.CompanyId is not null && !string.IsNullOrWhiteSpace(req.Company))
            throw new ValidationException("Provide either CompanyId or Company name, not both");

        var utcNow = DateTime.UtcNow;
        Company? companyEntity = null;
        if (req.CompanyId is not null)
        {
            companyEntity = await _dbContext.Companies.FirstOrDefaultAsync(
                x => x.Id == req.CompanyId && x.OrganizationId == organizationId,
                cancellationToken)
                ?? throw new NotFoundException("Company not found");
            if (companyEntity.IsDeleted)
                throw new ConflictException("Company is deleted");
        }
        else if (!string.IsNullOrWhiteSpace(req.Company))
        {
            var normalizedName = req.Company.Trim();
            companyEntity = await _dbContext.Companies
                .FirstOrDefaultAsync(
                    x => x.OrganizationId == organizationId && EF.Functions.ILike(x.Name, normalizedName),
                    cancellationToken);
            if (companyEntity is null || companyEntity.IsDeleted)
            {
                companyEntity = new Company
                {
                    Name = normalizedName,
                    OrganizationId = organizationId,
                    CreatedAtUtc = utcNow,
                    UpdatedAtUtc = utcNow
                };
                _dbContext.Companies.Add(companyEntity);
            }
        }

        var lead = new Lead
        {
            Name = req.Name.Trim(),
            OrganizationId = organizationId,
            Company = companyEntity?.Name ?? req.Company?.Trim(),
            CompanyId = companyEntity?.Id,
            Phone = req.Phone?.Trim(),
            Email = req.Email?.Trim(),
            AddressLine1 = req.AddressLine1?.Trim(),
            AddressLine2 = req.AddressLine2?.Trim(),
            City = req.City?.Trim(),
            State = req.State?.Trim(),
            PostalCode = req.PostalCode?.Trim(),
            LeadSource = req.LeadSource?.Trim(),
            ProjectType = req.ProjectType?.Trim(),
            EstimatedValue = req.EstimatedValue,
            Notes = req.Notes?.Trim(),
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow,
        };

        if (req.TaxLines is not null)
        {
            lead.TaxLines = TaxLineBuilder.Build(req.TaxLines, lead.Id, null);
        }

        _dbContext.Leads.Add(lead);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return lead;
    }

    public async Task<IReadOnlyList<LeadResponse>> GetAllAsync(bool includeDeleted, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var leadsQuery = _dbContext.Leads.AsNoTracking().Where(x => x.OrganizationId == organizationId).AsQueryable();
        if (!includeDeleted)
        {
            leadsQuery = leadsQuery.Where(x => !x.IsDeleted);
        }

        var leads = await leadsQuery
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => new LeadResponse(
                x.Id,
                x.Name,
                x.Company,
                x.CompanyId,
                x.Phone,
                x.Email,
                x.CreatedAtUtc,
                x.Status,
                x.IsDeleted,
                x.DeletedAtUtc
            ))
            .ToListAsync(cancellationToken);

        return leads;
    }

    public async Task<LeadDetailResponse> GetByIdAsync(Guid leadId, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var lead = await _dbContext.Leads
            .AsNoTracking()
            .Include(x => x.TaxLines)
            .Where(x => x.Id == leadId && x.OrganizationId == organizationId)
            .Select(x => new LeadDetailResponse(
                x.Id,
                x.Name,
                x.Company,
                x.CompanyId,
                x.Phone,
                x.Email,
                x.AddressLine1,
                x.AddressLine2,
                x.City,
                x.State,
                x.PostalCode,
                x.LeadSource,
                x.ProjectType,
                x.EstimatedValue,
                x.Notes,
                x.Status,
                x.CreatedAtUtc,
                x.UpdatedAtUtc,
                x.LostAtUtc,
                x.IsDeleted,
                x.DeletedAtUtc,
                x.TaxLines.Select(line => new TaxLineResponse(line.Id, line.Label, line.Rate)).ToList()
            ))
            .FirstOrDefaultAsync(cancellationToken);

        return lead ?? throw new NotFoundException("Lead not found");
    }

    public async Task<Lead> UpdateAsync(Guid leadId, UpdateLeadRequest req, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var lead = await _dbContext.Leads
            .Include(x => x.TaxLines)
            .FirstOrDefaultAsync(x => x.Id == leadId && x.OrganizationId == organizationId, cancellationToken)
            ?? throw new NotFoundException("Lead not found");

        if (lead.IsDeleted)
            throw new ConflictException("Cannot update a deleted lead");

        if (req.CompanyId is not null && !string.IsNullOrWhiteSpace(req.Company))
            throw new ValidationException("Provide either CompanyId or Company name, not both");

        var utcNow = DateTime.UtcNow;
        Company? companyEntity = null;
        if (req.CompanyId is not null)
        {
            companyEntity = await _dbContext.Companies.FirstOrDefaultAsync(
                x => x.Id == req.CompanyId && x.OrganizationId == organizationId,
                cancellationToken)
                ?? throw new NotFoundException("Company not found");
            if (companyEntity.IsDeleted)
                throw new ConflictException("Company is deleted");
        }
        else if (req.Company is not null)
        {
            var normalizedName = req.Company.Trim();
            if (!string.IsNullOrWhiteSpace(normalizedName))
            {
                companyEntity = await _dbContext.Companies
                    .FirstOrDefaultAsync(
                        x => x.OrganizationId == organizationId && EF.Functions.ILike(x.Name, normalizedName),
                        cancellationToken);
                if (companyEntity is null || companyEntity.IsDeleted)
                {
                    companyEntity = new Company
                    {
                        Name = normalizedName,
                        OrganizationId = organizationId,
                        CreatedAtUtc = utcNow,
                        UpdatedAtUtc = utcNow
                    };
                    _dbContext.Companies.Add(companyEntity);
                }
            }
        }

        if (req.Name is not null)
        {
            if (string.IsNullOrWhiteSpace(req.Name))
                throw new ValidationException("Name is required");
            lead.Name = req.Name.Trim();
        }

        if (req.CompanyId is not null || req.Company is not null)
        {
            lead.CompanyId = companyEntity?.Id;
            lead.Company = companyEntity?.Name ?? (string.IsNullOrWhiteSpace(req.Company) ? null : req.Company.Trim());
        }
        if (req.Phone is not null) lead.Phone = string.IsNullOrWhiteSpace(req.Phone) ? null : req.Phone.Trim();
        if (req.Email is not null) lead.Email = string.IsNullOrWhiteSpace(req.Email) ? null : req.Email.Trim();
        if (req.AddressLine1 is not null) lead.AddressLine1 = string.IsNullOrWhiteSpace(req.AddressLine1) ? null : req.AddressLine1.Trim();
        if (req.AddressLine2 is not null) lead.AddressLine2 = string.IsNullOrWhiteSpace(req.AddressLine2) ? null : req.AddressLine2.Trim();
        if (req.City is not null) lead.City = string.IsNullOrWhiteSpace(req.City) ? null : req.City.Trim();
        if (req.State is not null) lead.State = string.IsNullOrWhiteSpace(req.State) ? null : req.State.Trim();
        if (req.PostalCode is not null) lead.PostalCode = string.IsNullOrWhiteSpace(req.PostalCode) ? null : req.PostalCode.Trim();
        if (req.LeadSource is not null) lead.LeadSource = string.IsNullOrWhiteSpace(req.LeadSource) ? null : req.LeadSource.Trim();
        if (req.ProjectType is not null) lead.ProjectType = string.IsNullOrWhiteSpace(req.ProjectType) ? null : req.ProjectType.Trim();
        if (req.EstimatedValue is not null) lead.EstimatedValue = req.EstimatedValue;
        if (req.Notes is not null) lead.Notes = string.IsNullOrWhiteSpace(req.Notes) ? null : req.Notes.Trim();

        if (req.TaxLines is not null)
        {
            _dbContext.TaxLines.RemoveRange(lead.TaxLines);
            lead.TaxLines = TaxLineBuilder.Build(req.TaxLines, lead.Id, null);
        }

        lead.UpdatedAtUtc = utcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return lead;
    }

    public async Task<Lead> UpdateStatusAsync(Guid leadId, SetLeadStatusRequest req, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var lead = await _dbContext.Leads.FirstOrDefaultAsync(
            x => x.Id == leadId && x.OrganizationId == organizationId,
            cancellationToken)
            ?? throw new NotFoundException("Lead not found");

        if (lead.IsDeleted)
            throw new ConflictException("Cannot update a deleted lead");

        var statusValue = req.Status?.Trim();
        if (string.IsNullOrWhiteSpace(statusValue))
            throw new ValidationException("Status is required");

        if (!Enum.TryParse<LeadStatus>(statusValue, true, out var nextStatus))
            throw new ValidationException("Invalid lead status");

        if (lead.Status == nextStatus)
            return lead;

        var utcNow = DateTime.UtcNow;
        var transition = _stateMachine.Transition(lead, nextStatus, utcNow);
        lead.UpdatedAtUtc = utcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        await _eventEmitter.EmitAsync(new StateTransitionEvent(
            nameof(Lead),
            lead.Id,
            transition.From.ToString(),
            transition.To.ToString(),
            transition.OccurredAtUtc),
            cancellationToken);

        return lead;
    }

    public async Task<Lead> DeleteAsync(Guid leadId, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var lead = await _dbContext.Leads.FirstOrDefaultAsync(
            x => x.Id == leadId && x.OrganizationId == organizationId,
            cancellationToken)
            ?? throw new NotFoundException("Lead not found");

        if (lead.IsDeleted)
            return lead;

        var utcNow = DateTime.UtcNow;
        lead.IsDeleted = true;
        lead.DeletedAtUtc = utcNow;
        lead.UpdatedAtUtc = utcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return lead;
    }

    public async Task<LeadMetricsResponse> GetMetricsAsync(CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var utcNow = DateTime.UtcNow;
        var monthStart = new DateTime(utcNow.Year, utcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var lastMonthStart = monthStart.AddMonths(-1);
        var lastMonthEnd = monthStart.AddTicks(-1);

        var leadsQuery = _dbContext.Leads.Where(x => x.OrganizationId == organizationId && !x.IsDeleted);
        var totalLeads = await leadsQuery.CountAsync(cancellationToken);
        var newLeadsThisMonth = await leadsQuery.CountAsync(x => x.CreatedAtUtc >= monthStart, cancellationToken);
        var newLeadsLastMonth = await leadsQuery.CountAsync(
            x => x.CreatedAtUtc >= lastMonthStart && x.CreatedAtUtc <= lastMonthEnd,
            cancellationToken);

        var leadsWithSentEstimatesThisMonth = await _dbContext.Estimates
            .Where(x => x.OrganizationId == organizationId)
            .Where(x => x.SentAtUtc != null && x.SentAtUtc >= monthStart)
            .Select(x => x.LeadId)
            .Distinct()
            .Join(_dbContext.Leads.Where(x => x.OrganizationId == organizationId && !x.IsDeleted), id => id, lead => lead.Id, (id, lead) => id)
            .CountAsync(cancellationToken);

        var leadsWithSentEstimatesLastMonth = await _dbContext.Estimates
            .Where(x => x.OrganizationId == organizationId)
            .Where(x => x.SentAtUtc != null && x.SentAtUtc >= lastMonthStart && x.SentAtUtc <= lastMonthEnd)
            .Select(x => x.LeadId)
            .Distinct()
            .Join(_dbContext.Leads.Where(x => x.OrganizationId == organizationId && !x.IsDeleted), id => id, lead => lead.Id, (id, lead) => id)
            .CountAsync(cancellationToken);

        var leadsWithJobs = await _dbContext.Jobs
            .Where(x => x.OrganizationId == organizationId)
            .Select(x => x.LeadId)
            .Distinct()
            .Join(_dbContext.Leads.Where(x => x.OrganizationId == organizationId && !x.IsDeleted), id => id, lead => lead.Id, (id, lead) => id)
            .CountAsync(cancellationToken);

        var conversionRate = totalLeads == 0 ? 0 : (decimal)leadsWithJobs / totalLeads;

        var leadsCreatedLastMonth = await leadsQuery.CountAsync(
            x => x.CreatedAtUtc >= lastMonthStart && x.CreatedAtUtc <= lastMonthEnd,
            cancellationToken);
        var jobsCreatedLastMonth = await _dbContext.Jobs
            .Where(x => x.OrganizationId == organizationId && x.CreatedAtUtc >= lastMonthStart && x.CreatedAtUtc <= lastMonthEnd)
            .Select(x => x.LeadId)
            .Distinct()
            .Join(_dbContext.Leads.Where(x => x.OrganizationId == organizationId && !x.IsDeleted), id => id, lead => lead.Id, (id, lead) => id)
            .CountAsync(cancellationToken);

        var conversionRateLastMonth = leadsCreatedLastMonth == 0 ? 0 : (decimal)jobsCreatedLastMonth / leadsCreatedLastMonth;

        return new LeadMetricsResponse(
            newLeadsThisMonth,
            newLeadsLastMonth,
            leadsWithSentEstimatesThisMonth,
            leadsWithSentEstimatesLastMonth,
            leadsWithJobs,
            totalLeads,
            conversionRate,
            conversionRateLastMonth
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
