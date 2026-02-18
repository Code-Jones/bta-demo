namespace BtaDemo.Api.Application.Dtos;

public record OrganizationUserResponse(
    string Id,
    string Email,
    string FirstName,
    string LastName,
    bool IsCompanyAdmin
);
