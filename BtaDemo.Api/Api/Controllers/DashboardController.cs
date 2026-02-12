using Microsoft.AspNetCore.Mvc;
using BtaDemo.Api.Application.Services;

namespace BtaDemo.Api.Api.Controllers;

[ApiController]
[Route("dashboard")]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _dashboardService;
    public DashboardController(DashboardService dashboardService) => _dashboardService = dashboardService;


    [HttpGet("scoreboard")]
    public async Task<IActionResult> GetScoreboard(CancellationToken cancellationToken = default) 
    => Ok(await _dashboardService.GetScoreboardAsync(cancellationToken));
}