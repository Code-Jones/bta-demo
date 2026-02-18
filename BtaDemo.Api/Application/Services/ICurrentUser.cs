namespace BtaDemo.Api.Application.Services;

public interface ICurrentUser
{
    string UserId { get; }
    Guid OrganizationId { get; }
    string OrganizationName { get; }
    bool IsCompanyAdmin { get; }
}
