using Microsoft.AspNetCore.Mvc;
using BtaDemo.Api.Application.Services;
using Microsoft.AspNetCore.Authorization;

namespace BtaDemo.Api.Api.Controllers;

[Authorize]
[ApiController]
[Route("dashboard")]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _dashboardService;
    public DashboardController(DashboardService dashboardService) => _dashboardService = dashboardService;


    [HttpGet("scoreboard")]
    public async Task<IActionResult> GetScoreboard(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        CancellationToken cancellationToken = default)
        => Ok(await _dashboardService.GetScoreboardAsync(startDate, endDate, cancellationToken));

    [HttpGet("revenue")]
    public async Task<IActionResult> GetRevenue(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        CancellationToken cancellationToken = default)
        => Ok(await _dashboardService.GetRevenueSeriesAsync(startDate, endDate, cancellationToken));

    [HttpGet("report")]
    public async Task<IActionResult> GetReport(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        CancellationToken cancellationToken = default)
        => Ok(await _dashboardService.GetReportAsync(startDate, endDate, cancellationToken));
}
