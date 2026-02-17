namespace BtaDemo.Api.Domain.Events;

public sealed record StateTransitionEvent(
    string EntityType,
    Guid EntityId,
    string FromState,
    string ToState,
    DateTime OccurredAtUtc
);
