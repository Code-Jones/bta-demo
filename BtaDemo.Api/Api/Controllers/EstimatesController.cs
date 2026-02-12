using Microsoft.AspNetCore.Mvc;
using BtaDemo.Api.Application.Services;
using BtaDemo.Api.Application.Dtos;

namespace BtaDemo.Api.Api.Controllers;

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

    [HttpPost("{id:guid}/send")]
    public async Task<IActionResult> Send([FromRoute] Guid id, CancellationToken cancellationToken = default)
    {
        var estimate = await _estimateService.SendAsync(id, cancellationToken);
        return Ok(new { estimate.Id, estimate.Status });
    }

    [HttpPost("{id:guid}/accept")]
    public async Task<IActionResult> Accept([FromRoute] Guid id, CancellationToken cancellationToken = default)
    {
        var estimate = await _estimateService.AcceptAsync(id, cancellationToken);
        return Ok(new { estimate.Id, estimate.Status });
    }
}