namespace BtaDemo.Api.Application.Dtos;

public class UserResponse
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public Guid OrganizationId { get; set; }
    public string OrganizationName { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public bool IsCompanyAdmin { get; set; }
    public string Token { get; set; } = string.Empty;
}
