using BtaDemo.Api.Domain.Entities;
using BtaDemo.Api.Domain.Enum;

namespace BtaDemo.Api.Domain.StateMachines;

public sealed class InvoiceStateMachine : StateMachine<Invoice, InvoiceStatus>
{
    public InvoiceStateMachine()
    {
        Permit(InvoiceStatus.Draft, InvoiceStatus.Issued);
        Permit(InvoiceStatus.Issued, InvoiceStatus.Paid);
        Permit(InvoiceStatus.Overdue, InvoiceStatus.Paid);
    }

    protected override InvoiceStatus GetState(Invoice entity) => entity.Status;

    protected override void ApplyTransition(Invoice entity, InvoiceStatus from, InvoiceStatus to, DateTime utcNow)
    {
        entity.Status = to;
        entity.UpdatedAtUtc = utcNow;

        switch (to)
        {
            case InvoiceStatus.Issued:
                entity.IssuedAtUtc = utcNow;
                if (entity.DueAtUtc is null)
                {
                    entity.DueAtUtc = utcNow.AddDays(30);
                }
                break;
            case InvoiceStatus.Paid:
                entity.PaidAtUtc = utcNow;
                break;
        }
    }
}
