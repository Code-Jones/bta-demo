using BtaDemo.Api.Domain.Events;

namespace BtaDemo.Api.Application.Events;

public interface IStateTransitionEventEmitter
{
    Task EmitAsync(StateTransitionEvent transitionEvent, CancellationToken cancellationToken = default);
}
