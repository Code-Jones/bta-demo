using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace BtaDemo.Api.Application.Services;

public class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string UserId => GetClaim(ClaimTypes.NameIdentifier) ?? string.Empty;

    public Guid OrganizationId
    {
        get
        {
            var value = GetClaim("orgId");
            return Guid.TryParse(value, out var parsed) ? parsed : Guid.Empty;
        }
    }

    public string OrganizationName => GetClaim("orgName") ?? string.Empty;

    public bool IsCompanyAdmin
    {
        get
        {
            var value = GetClaim("isCompanyAdmin");
            return string.Equals(value, "true", StringComparison.OrdinalIgnoreCase);
        }
    }

    private string? GetClaim(string type)
    {
        var user = _httpContextAccessor.HttpContext?.User;
        return user?.FindFirstValue(type);
    }
}
