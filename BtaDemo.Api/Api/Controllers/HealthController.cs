using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BtaDemo.Api.Data;

namespace BtaDemo.Api.Api.Controllers;

[ApiController]
[Route("health")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public HealthController(AppDbContext dbContext) => _dbContext = dbContext;

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken = default)
    {
        var status = "ok";
        var dbConnected = false;
        var transactionOk = false;
        var checkedAtUtc = DateTime.UtcNow;

        try
        {
            dbConnected = await _dbContext.Database.CanConnectAsync(cancellationToken);
            await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
            await _dbContext.Database.ExecuteSqlRawAsync("SELECT 1", cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            transactionOk = true;
        }
        catch
        {
            status = "degraded";
        }

        return Ok(new
        {
            status,
            endpoint = "/health",
            dbConnected,
            transactionOk,
            checkedAtUtc
        });
    }
}
