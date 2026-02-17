namespace BtaDemo.Api.Domain.Exceptions;

public sealed class ValidationException : Exception
{
    public ValidationException(string message) : base(message) { }
}
