using BtaDemo.Api.Domain.Events;
using Microsoft.Extensions.Logging;

namespace BtaDemo.Api.Application.Events;

public sealed class LoggingStateTransitionEventEmitter : IStateTransitionEventEmitter
{
    private readonly ILogger<LoggingStateTransitionEventEmitter> _logger;

    public LoggingStateTransitionEventEmitter(ILogger<LoggingStateTransitionEventEmitter> logger) => _logger = logger;

    public Task EmitAsync(StateTransitionEvent transitionEvent, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "State transition {EntityType} {EntityId}: {FromState} -> {ToState} at {OccurredAtUtc}",
            transitionEvent.EntityType,
            transitionEvent.EntityId,
            transitionEvent.FromState,
            transitionEvent.ToState,
            transitionEvent.OccurredAtUtc);

        return Task.CompletedTask;
    }
}
