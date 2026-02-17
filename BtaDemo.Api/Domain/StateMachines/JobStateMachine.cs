using BtaDemo.Api.Domain.Entities;
using BtaDemo.Api.Domain.Enum;

namespace BtaDemo.Api.Domain.StateMachines;

public sealed class JobStateMachine : StateMachine<Job, JobStatus>
{
    public JobStateMachine()
    {
        Permit(JobStatus.Scheduled, JobStatus.InProgress);
        Permit(JobStatus.InProgress, JobStatus.Completed);
        Permit(JobStatus.InProgress, JobStatus.Cancelled);
        Permit(JobStatus.Scheduled, JobStatus.Cancelled);
    }

    protected override JobStatus GetState(Job entity) => entity.Status;

    protected override void ApplyTransition(Job entity, JobStatus from, JobStatus to, DateTime utcNow)
    {
        entity.Status = to;
        entity.UpdatedAtUtc = utcNow;

        switch (to)
        {
            case JobStatus.InProgress:
                entity.StartedAtUtc = utcNow;
                break;
            case JobStatus.Completed:
                entity.CompletedAtUtc = utcNow;
                break;
            case JobStatus.Cancelled:
                entity.CancelledAtUtc = utcNow;
                break;
        }
    }
}
