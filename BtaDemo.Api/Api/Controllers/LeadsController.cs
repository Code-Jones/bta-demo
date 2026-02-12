using Microsoft.AspNetCore.Mvc;
using BtaDemo.Api.Application.Services;
using BtaDemo.Api.Application.Dtos;

namespace BtaDemo.Api.Api.Controllers;

[ApiController]
[Route("leads")]
public class LeadsController : ControllerBase
{
    private readonly LeadService _leadService;
    public LeadsController(LeadService leadService) => _leadService = leadService;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateLeadRequest request, CancellationToken cancellationToken = default)
    {
        var lead = await _leadService.CreateAsync(request, cancellationToken);
        return Created($"/leads/{lead.Id}", new { lead.Id });
    }
}