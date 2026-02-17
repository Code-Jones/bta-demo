using BtaDemo.Api.Domain.Enum;
using BtaDemo.Api.Domain.Exceptions;

namespace BtaDemo.Api.Domain.Entities;

public class Invoice
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid JobId { get; set; }
    public Job? Job { get; set; }
    public decimal Amount { get; set; }
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? IssuedAtUtc { get; set; }
    public DateTime? DueAtUtc { get; set; }
    public DateTime? PaidAtUtc { get; set; }
    public DateTime? OverdueAtUtc { get; set; }
    public List<InvoiceLineItem> LineItems { get; set; } = new();

    public void MarkPaid(DateTime utcNow)
    {
        if (Status == InvoiceStatus.Paid)
            return;

        if (Status != InvoiceStatus.Issued && Status != InvoiceStatus.Overdue)
            throw new ConflictException($"Cannot pay invoice in status {Status}.");


        Status = InvoiceStatus.Paid;
        PaidAtUtc = utcNow;
        UpdatedAtUtc = utcNow;
    }
}
