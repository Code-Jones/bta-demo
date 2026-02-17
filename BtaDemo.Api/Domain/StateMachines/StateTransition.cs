namespace BtaDemo.Api.Domain.StateMachines;

public sealed record StateTransition<TState>(
    TState From,
    TState To,
    DateTime OccurredAtUtc
);
