using BtaDemo.Api.Domain.Entities;
using BtaDemo.Api.Domain.Enum;

namespace BtaDemo.Api.Domain.StateMachines;

public sealed class EstimateStateMachine : StateMachine<Estimate, EstimateStatus>
{
    public EstimateStateMachine()
    {
        Permit(EstimateStatus.Draft, EstimateStatus.Sent);
        Permit(EstimateStatus.Sent, EstimateStatus.Accepted);
        Permit(EstimateStatus.Sent, EstimateStatus.Rejected);
        Permit(EstimateStatus.Draft, EstimateStatus.Rejected);
    }

    protected override EstimateStatus GetState(Estimate entity) => entity.Status;

    protected override void ApplyTransition(Estimate entity, EstimateStatus from, EstimateStatus to, DateTime utcNow)
    {
        entity.Status = to;
        entity.UpdatedAtUtc = utcNow;

        switch (to)
        {
            case EstimateStatus.Sent:
                entity.SentAtUtc = utcNow;
                break;
            case EstimateStatus.Accepted:
                entity.AcceptedAtUtc = utcNow;
                break;
            case EstimateStatus.Rejected:
                entity.RejectedAtUtc = utcNow;
                break;
        }
    }
}
