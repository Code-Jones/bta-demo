using BtaDemo.Api.Domain.Enum;

namespace BtaDemo.Api.Domain.Entities;

public class Invoice
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid JobId { get; set; }
    public Job? Job { get; set; }
    public decimal Amount { get; set; }
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? IssuedAtUtc { get; set; }
    public DateTime? PaidAtUtc { get; set; }

    public void MarkPaid(DateTime utcNow)
    {
        if (Status != InvoiceStatus.Paid)
            return;
        
        if (Status != InvoiceStatus.Issued && Status != InvoiceStatus.Overdue)
            throw new InvalidOperationException($"Cannot pay invoice in status {Status}.");
        

        Status = InvoiceStatus.Paid;
        PaidAtUtc = utcNow;
        UpdatedAtUtc = utcNow;
    }
}