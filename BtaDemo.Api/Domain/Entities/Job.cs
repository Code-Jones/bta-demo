using BtaDemo.Api.Domain.Enum;

namespace BtaDemo.Api.Domain.Entities;

public class Job
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrganizationId { get; set; }
    public Guid LeadId { get; set; }
    public Lead? Lead { get; set; }
    public Guid? EstimateId { get; set; }
    public Estimate? Estimate { get; set; }
    public string? Description { get; set; }
    public List<JobMilestone> Milestones { get; set; } = new();
    public List<JobExpense> Expenses { get; set; } = new();
    public JobStatus Status { get; set; } = JobStatus.Scheduled;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime StartAtUtc { get; set; }
    public DateTime EstimatedEndAtUtc { get; set; }
    public DateTime? StartedAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public DateTime? CancelledAtUtc { get; set; }
}
