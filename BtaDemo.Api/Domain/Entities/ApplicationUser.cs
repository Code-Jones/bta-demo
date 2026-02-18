using Microsoft.AspNetCore.Identity;

namespace BtaDemo.Api.Domain.Entities;

public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public Guid OrganizationId { get; set; }
    public Organization? Organization { get; set; }
    public bool IsCompanyAdmin { get; set; }
}
