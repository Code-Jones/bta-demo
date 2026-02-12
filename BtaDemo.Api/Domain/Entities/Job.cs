using BtaDemo.Api.Domain.Enum;

namespace BtaDemo.Api.Domain.Entities;

public class Job
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid LeadId { get; set; }
    public Lead? Lead { get; set; }
    public Guid? EstimateId { get; set; }
    public Estimate? Estimate { get; set; }
    public string? Description { get; set; }
    public JobStatus Status { get; set; } = JobStatus.Scheduled;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime ScheduledForUtc { get; set; }

}