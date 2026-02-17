using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BtaDemo.Api.Application.Services;

namespace BtaDemo.Api.Api.Controllers;

[Authorize]
[ApiController]
[Route("pipeline")]
public class PipelineController : ControllerBase
{
    private readonly PipelineService _pipelineService;

    public PipelineController(PipelineService pipelineService) => _pipelineService = pipelineService;

    [HttpGet("board")]
    public async Task<IActionResult> GetBoard(CancellationToken cancellationToken = default)
        => Ok(await _pipelineService.GetBoardAsync(cancellationToken));
}
