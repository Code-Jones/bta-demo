using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BtaDemo.Api.Application.Dtos;
using BtaDemo.Api.Application.Services;

namespace BtaDemo.Api.Api.Controllers;

[Authorize(Policy = "CompanyAdminOnly")]
[ApiController]
[Route("organization/users")]
public class OrganizationUsersController : ControllerBase
{
    private readonly OrganizationUserService _organizationUserService;

    public OrganizationUsersController(OrganizationUserService organizationUserService)
        => _organizationUserService = organizationUserService;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken = default)
        => Ok(await _organizationUserService.GetUsersAsync(cancellationToken));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrganizationUserRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _organizationUserService.CreateUserAsync(request, cancellationToken);
        return Created($"/organization/users/{user.Id}", user);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Remove([FromRoute] string id, CancellationToken cancellationToken = default)
    {
        await _organizationUserService.RemoveUserAsync(id, cancellationToken);
        return NoContent();
    }
}
