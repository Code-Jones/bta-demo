using Microsoft.AspNetCore.Mvc;
using BtaDemo.Api.Application.Services;
using BtaDemo.Api.Application.Dtos;
using Microsoft.AspNetCore.Authorization;

namespace BtaDemo.Api.Api.Controllers;

[Authorize]
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

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool includeDeleted = false, CancellationToken cancellationToken = default)
    {
        var leads = await _leadService.GetAllAsync(includeDeleted, cancellationToken);
        return Ok(leads);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken cancellationToken = default)
    {
        var lead = await _leadService.GetByIdAsync(id, cancellationToken);
        return Ok(lead);
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateLeadRequest request, CancellationToken cancellationToken = default)
    {
        var lead = await _leadService.UpdateAsync(id, request, cancellationToken);
        return Ok(new { lead.Id, lead.Status });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete([FromRoute] Guid id, CancellationToken cancellationToken = default)
    {
        var lead = await _leadService.DeleteAsync(id, cancellationToken);
        return Ok(new { lead.Id, lead.IsDeleted });
    }

    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics(CancellationToken cancellationToken = default)
        => Ok(await _leadService.GetMetricsAsync(cancellationToken));

    [HttpPost("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus([FromRoute] Guid id, [FromBody] SetLeadStatusRequest request, CancellationToken cancellationToken = default)
    {
        var lead = await _leadService.UpdateStatusAsync(id, request, cancellationToken);
        return Ok(new { lead.Id, lead.Status });
    }
}
