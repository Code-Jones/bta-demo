using BtaDemo.Api.Domain.Enum;
using BtaDemo.Api.Domain.Exceptions;

namespace BtaDemo.Api.Domain.Entities;

public class Estimate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrganizationId { get; set; }
    public Guid LeadId { get; set; }
    public Lead? Lead { get; set; }
    public string? Description { get; set; }
    public decimal Amount { get; set; }
    public List<EstimateLineItem> LineItems { get; set; } = new();
    public EstimateStatus Status { get; set; } = EstimateStatus.Draft;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? SentAtUtc { get; set; }
    public DateTime? AcceptedAtUtc { get; set; }
    public DateTime? RejectedAtUtc { get; set; }

    public void MarkAsSent(DateTime utcNow)
    {
        if (Status != EstimateStatus.Draft)
        {
            throw new ConflictException($"Cannot send estimate in status {Status}.");
        }

        Status = EstimateStatus.Sent;
        SentAtUtc = utcNow;
        UpdatedAtUtc = utcNow;
    }

    public void MarkAsAccepted(DateTime utcNow)
    {
        if (Status != EstimateStatus.Sent)
        {
            throw new ConflictException($"Cannot accept estimate in status {Status}.");
        }

        Status = EstimateStatus.Accepted;
        AcceptedAtUtc = utcNow;
        UpdatedAtUtc = utcNow;
    }

    public void MarkAsRejected(DateTime utcNow)
    {
        if (Status != EstimateStatus.Sent)
        {
            throw new ConflictException($"Cannot reject estimate in status {Status}.");
        }

        Status = EstimateStatus.Rejected;
        RejectedAtUtc = utcNow;
        UpdatedAtUtc = utcNow;
    }
}
