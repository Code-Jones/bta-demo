using Microsoft.EntityFrameworkCore;
using BtaDemo.Api.Data;
using BtaDemo.Api.Domain.Entities;
using BtaDemo.Api.Domain.Enum;
using BtaDemo.Api.Domain.Events;
using BtaDemo.Api.Domain.StateMachines;
using BtaDemo.Api.Application.Events;
using BtaDemo.Api.Application.Dtos;
using BtaDemo.Api.Application.Services.Builders;
using BtaDemo.Api.Domain.Exceptions;

namespace BtaDemo.Api.Application.Services;

public class InvoiceService
{
    private readonly AppDbContext _dbContext;
    private readonly InvoiceStateMachine _stateMachine;
    private readonly IStateTransitionEventEmitter _eventEmitter;

    public InvoiceService(
        AppDbContext dbContext,
        InvoiceStateMachine stateMachine,
        IStateTransitionEventEmitter eventEmitter)
    {
        _dbContext = dbContext;
        _stateMachine = stateMachine;
        _eventEmitter = eventEmitter;
    }

    public async Task<Invoice> MarkPaidAsync(Guid invoiceId, CancellationToken cancellationToken = default)
    {
        var invoice = await _dbContext.Invoices.FirstOrDefaultAsync(x => x.Id == invoiceId, cancellationToken) ?? throw new NotFoundException("Invoice not found");

        var utcNow = DateTime.UtcNow;
        var transition = _stateMachine.Transition(invoice, InvoiceStatus.Paid, utcNow);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _eventEmitter.EmitAsync(new StateTransitionEvent(
            nameof(Invoice),
            invoice.Id,
            transition.From.ToString(),
            transition.To.ToString(),
            transition.OccurredAtUtc),
            cancellationToken);
        return invoice;
    }

    public async Task<Invoice> IssueAsync(Guid invoiceId, IssueInvoiceRequest request, CancellationToken cancellationToken = default)
    {
        var invoice = await _dbContext.Invoices.FirstOrDefaultAsync(x => x.Id == invoiceId, cancellationToken) ?? throw new NotFoundException("Invoice not found");

        if (request.DueAtUtc is not null)
        {
            invoice.DueAtUtc = request.DueAtUtc;
        }

        var utcNow = DateTime.UtcNow;
        var transition = _stateMachine.Transition(invoice, InvoiceStatus.Issued, utcNow);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _eventEmitter.EmitAsync(new StateTransitionEvent(
            nameof(Invoice),
            invoice.Id,
            transition.From.ToString(),
            transition.To.ToString(),
            transition.OccurredAtUtc),
            cancellationToken);
        return invoice;
    }

    public async Task<IReadOnlyList<InvoiceListResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var invoices = await _dbContext.Invoices
            .AsNoTracking()
            .Include(x => x.LineItems)
            .Include(x => x.Job)
                .ThenInclude(x => x.Lead)
                .ThenInclude(x => x.CompanyEntity)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return invoices.Select(MapInvoice).ToList();
    }

    public async Task<Invoice> CreateAsync(CreateInvoiceRequest request, CancellationToken cancellationToken = default)
    {
        if (request.LineItems is null || request.LineItems.Count == 0)
            throw new ValidationException("At least one line item is required");

        var job = await _dbContext.Jobs.FirstOrDefaultAsync(x => x.Id == request.JobId, cancellationToken)
            ?? throw new NotFoundException("Job not found");

        var utcNow = DateTime.UtcNow;
        var invoice = new Invoice
        {
            JobId = job.Id,
            DueAtUtc = request.DueAtUtc,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow,
        };

        var lineItems = LineItemBuilder.BuildInvoiceLineItems(request.LineItems, invoice.Id);
        invoice.LineItems = lineItems;

        var totals = LineItemBuilder.CalculateTotals(lineItems);
        invoice.Amount = totals.Total;

        _dbContext.Invoices.Add(invoice);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return invoice;
    }

    public async Task<Invoice> UpdateAsync(Guid invoiceId, UpdateInvoiceRequest request, CancellationToken cancellationToken = default)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var invoice = await _dbContext.Invoices
            .FirstOrDefaultAsync(x => x.Id == invoiceId, cancellationToken)
            ?? throw new NotFoundException("Invoice not found");

        if (invoice.Status != InvoiceStatus.Draft)
            throw new ConflictException("Only draft invoices can be updated");

        if (request.DueAtUtc is not null)
        {
            invoice.DueAtUtc = request.DueAtUtc;
        }

        if (request.Notes is not null)
        {
            invoice.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
        }

        if (request.LineItems is not null)
        {
            if (request.LineItems.Count == 0)
                throw new ValidationException("At least one line item is required");

            await _dbContext.InvoiceLineItems
                .Where(x => x.InvoiceId == invoice.Id)
                .ExecuteDeleteAsync(cancellationToken);

            var lineItems = LineItemBuilder.BuildInvoiceLineItems(request.LineItems, invoice.Id);
            _dbContext.InvoiceLineItems.AddRange(lineItems);

            var totals = LineItemBuilder.CalculateTotals(lineItems);
            invoice.Amount = totals.Total;
        }
        invoice.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return invoice;
    }

    public async Task<Invoice> DeleteAsync(Guid invoiceId, CancellationToken cancellationToken = default)
    {
        var invoice = await _dbContext.Invoices.FirstOrDefaultAsync(x => x.Id == invoiceId, cancellationToken)
            ?? throw new NotFoundException("Invoice not found");

        if (invoice.Status == InvoiceStatus.Paid)
            throw new ConflictException("Cannot delete a paid invoice");

        _dbContext.Invoices.Remove(invoice);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return invoice;
    }

    public async Task<InvoiceMetricsResponse> GetMetricsAsync(CancellationToken cancellationToken = default)
    {
        var utcNow = DateTime.UtcNow;
        var monthStart = new DateTime(utcNow.Year, utcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var lastMonthStart = monthStart.AddMonths(-1);
        var lastMonthEnd = monthStart.AddTicks(-1);

        var outstandingTotal = await _dbContext.Invoices
            .Where(x => x.Status == InvoiceStatus.Issued || x.Status == InvoiceStatus.Overdue)
            .SumAsync(x => (decimal?)x.Amount, cancellationToken) ?? 0;

        var outstandingTotalLastMonth = await _dbContext.Invoices
            .Where(x => (x.Status == InvoiceStatus.Issued || x.Status == InvoiceStatus.Overdue)
                && x.IssuedAtUtc != null
                && x.IssuedAtUtc >= lastMonthStart
                && x.IssuedAtUtc <= lastMonthEnd)
            .SumAsync(x => (decimal?)x.Amount, cancellationToken) ?? 0;

        var outstandingOverdueCount = await _dbContext.Invoices.CountAsync(
            x => x.Status == InvoiceStatus.Overdue || (x.Status == InvoiceStatus.Issued && x.DueAtUtc != null && x.DueAtUtc < utcNow),
            cancellationToken);

        var paidThisMonthTotal = await _dbContext.Invoices
            .Where(x => x.PaidAtUtc != null && x.PaidAtUtc >= monthStart)
            .SumAsync(x => (decimal?)x.Amount, cancellationToken) ?? 0;

        var paidLastMonthTotal = await _dbContext.Invoices
            .Where(x => x.PaidAtUtc != null && x.PaidAtUtc >= lastMonthStart && x.PaidAtUtc <= lastMonthEnd)
            .SumAsync(x => (decimal?)x.Amount, cancellationToken) ?? 0;

        var draftTotal = await _dbContext.Invoices
            .Where(x => x.Status == InvoiceStatus.Draft)
            .SumAsync(x => (decimal?)x.Amount, cancellationToken) ?? 0;

        var draftTotalLastMonth = await _dbContext.Invoices
            .Where(x => x.Status == InvoiceStatus.Draft && x.CreatedAtUtc >= lastMonthStart && x.CreatedAtUtc <= lastMonthEnd)
            .SumAsync(x => (decimal?)x.Amount, cancellationToken) ?? 0;

        var draftCount = await _dbContext.Invoices.CountAsync(x => x.Status == InvoiceStatus.Draft, cancellationToken);
        var draftCountLastMonth = await _dbContext.Invoices.CountAsync(
            x => x.Status == InvoiceStatus.Draft && x.CreatedAtUtc >= lastMonthStart && x.CreatedAtUtc <= lastMonthEnd,
            cancellationToken);

        var paidThisMonth = await _dbContext.Invoices
            .Where(x => x.PaidAtUtc != null && x.PaidAtUtc >= monthStart && x.IssuedAtUtc != null)
            .Select(x => new { x.IssuedAtUtc, x.PaidAtUtc })
            .ToListAsync(cancellationToken);

        var paidLastMonth = await _dbContext.Invoices
            .Where(x => x.PaidAtUtc != null && x.PaidAtUtc >= lastMonthStart && x.PaidAtUtc <= lastMonthEnd && x.IssuedAtUtc != null)
            .Select(x => new { x.IssuedAtUtc, x.PaidAtUtc })
            .ToListAsync(cancellationToken);

        var averageDaysToPay = paidThisMonth.Count == 0
            ? 0
            : (int)Math.Round(paidThisMonth.Average(x => (x.PaidAtUtc!.Value - x.IssuedAtUtc!.Value).TotalDays));

        var averageDaysToPayLastMonth = paidLastMonth.Count == 0
            ? 0
            : (int)Math.Round(paidLastMonth.Average(x => (x.PaidAtUtc!.Value - x.IssuedAtUtc!.Value).TotalDays));

        return new InvoiceMetricsResponse(
            outstandingTotal,
            outstandingTotalLastMonth,
            outstandingOverdueCount,
            paidThisMonthTotal,
            paidLastMonthTotal,
            draftTotal,
            draftTotalLastMonth,
            draftCount,
            draftCountLastMonth,
            averageDaysToPay,
            averageDaysToPayLastMonth
        );
    }

    private static InvoiceListResponse MapInvoice(Invoice invoice)
    {
        var lineItems = invoice.LineItems.OrderBy(x => x.SortOrder).ToList();
        if (lineItems.Count == 0)
        {
            lineItems.Add(new InvoiceLineItem
            {
                InvoiceId = invoice.Id,
                Description = "Invoice total",
                Quantity = 1,
                UnitPrice = invoice.Amount,
                IsTaxLine = false,
                SortOrder = 1,
            });
        }

        var totals = LineItemBuilder.CalculateTotals(lineItems);

        var lineItemResponses = lineItems.Select(item => new InvoiceLineItemResponse(
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

        var lead = invoice.Job?.Lead;
        var company = lead?.CompanyEntity;
        var leadId = invoice.Job?.LeadId ?? lead?.Id ?? Guid.Empty;

        return new InvoiceListResponse(
            invoice.Id,
            invoice.JobId,
            leadId,
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
            invoice.Job?.Description,
            invoice.Job?.StartAtUtc,
            invoice.Job?.EstimatedEndAtUtc,
            totals.Subtotal,
            totals.TaxTotal,
            totals.Total,
            invoice.Status,
            invoice.CreatedAtUtc,
            invoice.UpdatedAtUtc,
            invoice.IssuedAtUtc,
            invoice.DueAtUtc,
            invoice.PaidAtUtc,
            invoice.Notes,
            lineItemResponses
        );
    }

}
