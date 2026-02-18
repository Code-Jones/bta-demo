namespace BtaDemo.Api.Application.Dtos;

public record LoginRequest(string Email, string Password, Guid? OrganizationId = null);
