using Microsoft.AspNetCore.Mvc;
using BtaDemo.Api.Application.Services;
using BtaDemo.Api.Application.Dtos;
using Microsoft.AspNetCore.Authorization;

namespace BtaDemo.Api.Api.Controllers;

[Authorize]
[ApiController]
[Route("estimates")]
public class EstimatesController : ControllerBase
{
    private readonly EstimateService _estimateService;
    public EstimatesController(EstimateService estimateService) => _estimateService = estimateService;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEstimateRequest request, CancellationToken cancellationToken = default)
    {
        var estimate = await _estimateService.CreateAsync(request, cancellationToken);
        return Created($"/estimates/{estimate.Id}", new { estimate.Id, estimate.Status });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken = default)
    {
        var estimates = await _estimateService.GetAllAsync(cancellationToken);
        return Ok(estimates);
    }

    [HttpPost("{id:guid}/send")]
    public async Task<IActionResult> Send([FromRoute] Guid id, CancellationToken cancellationToken = default)
    {
        var estimate = await _estimateService.SendAsync(id, cancellationToken);
        return Ok(new { estimate.Id, estimate.Status });
    }

    [HttpPost("{id:guid}/accept")]
    public async Task<IActionResult> Accept([FromRoute] Guid id, [FromBody] AcceptEstimateRequest request, CancellationToken cancellationToken = default)
    {
        var estimate = await _estimateService.AcceptAsync(id, request, cancellationToken);
        return Ok(new { estimate.Id, estimate.Status });
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject([FromRoute] Guid id, CancellationToken cancellationToken = default)
    {
        var estimate = await _estimateService.RejectAsync(id, cancellationToken);
        return Ok(new { estimate.Id, estimate.Status });
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateEstimateRequest request, CancellationToken cancellationToken = default)
    {
        var estimate = await _estimateService.UpdateAsync(id, request, cancellationToken);
        return Ok(new { estimate.Id, estimate.Status });
    }
}
