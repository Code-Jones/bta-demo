using BtaDemo.Api.Domain.Enum;

namespace BtaDemo.Api.Domain.Entities;

public class JobMilestone
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid JobId { get; set; }
    public Job? Job { get; set; }
    public string Title { get; set; } = "";
    public string? Notes { get; set; }
    public MilestoneStatus Status { get; set; } = MilestoneStatus.Pending;
    public DateTime OccurredAtUtc { get; set; } = DateTime.UtcNow;
    public int SortOrder { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
