using BtaDemo.Api.Domain.Entities;
using BtaDemo.Api.Domain.Enum;

namespace BtaDemo.Api.Domain.StateMachines;

public sealed class LeadStateMachine : StateMachine<Lead, LeadStatus>
{
    public LeadStateMachine()
    {
        Permit(LeadStatus.New, LeadStatus.Lost);
        Permit(LeadStatus.New, LeadStatus.Converted);
        Permit(LeadStatus.Lost, LeadStatus.New);
    }

    protected override LeadStatus GetState(Lead entity) => entity.Status;

    protected override void ApplyTransition(Lead entity, LeadStatus from, LeadStatus to, DateTime utcNow)
    {
        entity.Status = to;
        entity.UpdatedAtUtc = utcNow;

        if (to == LeadStatus.Lost)
        {
            entity.LostAtUtc = utcNow;
        }
        else if (to == LeadStatus.New)
        {
            entity.LostAtUtc = null;
        }
    }
}
