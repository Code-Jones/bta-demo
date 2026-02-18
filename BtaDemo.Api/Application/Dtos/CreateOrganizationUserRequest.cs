namespace BtaDemo.Api.Application.Dtos;

public record CreateOrganizationUserRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    bool IsCompanyAdmin
);
