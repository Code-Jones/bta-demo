namespace BtaDemo.Api.Domain.Entities;

public class JobExpense
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid JobId { get; set; }
    public Job? Job { get; set; }
    public string Vendor { get; set; } = "";
    public string? Category { get; set; }
    public decimal Amount { get; set; }
    public DateTime SpentAtUtc { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
    public string? ReceiptUrl { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
