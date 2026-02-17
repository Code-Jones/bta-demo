using System;
using BtaDemo.Api.Domain.Exceptions;

namespace BtaDemo.Api.Domain.StateMachines;

public abstract class StateMachine<TEntity, TState>
    where TState : struct, global::System.Enum
{
    private readonly Dictionary<TState, HashSet<TState>> _transitions = new();

    protected void Permit(TState from, TState to)
    {
        if (!_transitions.TryGetValue(from, out var nextStates))
        {
            nextStates = new HashSet<TState>();
            _transitions[from] = nextStates;
        }

        nextStates.Add(to);
    }

    public bool CanTransition(TState from, TState to) =>
        _transitions.TryGetValue(from, out var nextStates) && nextStates.Contains(to);

    public void EnsureCanTransition(TState from, TState to)
    {
        if (!CanTransition(from, to))
        {
            throw new ConflictException($"Cannot transition {typeof(TEntity).Name} from {from} to {to}.");
        }
    }

    public StateTransition<TState> Transition(TEntity entity, TState to, DateTime utcNow)
    {
        var from = GetState(entity);
        EnsureCanTransition(from, to);
        ApplyTransition(entity, from, to, utcNow);
        return new StateTransition<TState>(from, to, utcNow);
    }

    protected abstract TState GetState(TEntity entity);
    protected abstract void ApplyTransition(TEntity entity, TState from, TState to, DateTime utcNow);
}
