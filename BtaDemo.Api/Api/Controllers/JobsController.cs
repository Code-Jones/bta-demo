using Microsoft.AspNetCore.Mvc;
using BtaDemo.Api.Application.Services;
using BtaDemo.Api.Application.Dtos;
using Microsoft.AspNetCore.Authorization;

namespace BtaDemo.Api.Api.Controllers;

[Authorize]
[ApiController]
[Route("jobs")]
public class JobsController : ControllerBase
{
    private readonly JobService _jobService;
    public JobsController(JobService jobService) => _jobService = jobService;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateJobRequest request, CancellationToken cancellationToken = default)
    {
        var job = await _jobService.CreateAsync(request, cancellationToken);
        return Created($"/jobs/{job.Id}", new { job.Id, job.Status });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken = default)
    {
        var jobs = await _jobService.GetAllAsync(cancellationToken);
        return Ok(jobs);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDetail([FromRoute] Guid id, CancellationToken cancellationToken = default)
    {
        var job = await _jobService.GetDetailAsync(id, cancellationToken);
        return Ok(job);
    }

    [HttpPost("{id:guid}/start")]
    public async Task<IActionResult> Start([FromRoute] Guid id, CancellationToken cancellationToken = default)
    {
        var job = await _jobService.StartAsync(id, cancellationToken);
        return Ok(new { job.Id, job.Status });
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> Complete([FromRoute] Guid id, CancellationToken cancellationToken = default)
    {
        var job = await _jobService.CompleteAsync(id, cancellationToken);
        return Ok(new { job.Id, job.Status });
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel([FromRoute] Guid id, CancellationToken cancellationToken = default)
    {
        var job = await _jobService.CancelAsync(id, cancellationToken);
        return Ok(new { job.Id, job.Status });
    }

    [HttpPost("{id:guid}/milestones")]
    public async Task<IActionResult> AddMilestone(
        [FromRoute] Guid id,
        [FromBody] CreateJobMilestoneRequest request,
        CancellationToken cancellationToken = default)
    {
        var milestone = await _jobService.AddMilestoneAsync(id, request, cancellationToken);
        return Ok(milestone);
    }

    [HttpPatch("{id:guid}/milestones/{milestoneId:guid}")]
    public async Task<IActionResult> UpdateMilestone(
        [FromRoute] Guid id,
        [FromRoute] Guid milestoneId,
        [FromBody] UpdateJobMilestoneRequest request,
        CancellationToken cancellationToken = default)
    {
        var milestone = await _jobService.UpdateMilestoneAsync(id, milestoneId, request, cancellationToken);
        return Ok(milestone);
    }

    [HttpDelete("{id:guid}/milestones/{milestoneId:guid}")]
    public async Task<IActionResult> DeleteMilestone(
        [FromRoute] Guid id,
        [FromRoute] Guid milestoneId,
        CancellationToken cancellationToken = default)
    {
        await _jobService.DeleteMilestoneAsync(id, milestoneId, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/expenses")]
    public async Task<IActionResult> AddExpense(
        [FromRoute] Guid id,
        [FromForm] CreateJobExpenseRequest request,
        CancellationToken cancellationToken = default)
    {
        var expense = await _jobService.AddExpenseAsync(id, request, cancellationToken);
        return Ok(expense);
    }

    [HttpPatch("{id:guid}/expenses/{expenseId:guid}")]
    public async Task<IActionResult> UpdateExpense(
        [FromRoute] Guid id,
        [FromRoute] Guid expenseId,
        [FromForm] UpdateJobExpenseRequest request,
        CancellationToken cancellationToken = default)
    {
        var expense = await _jobService.UpdateExpenseAsync(id, expenseId, request, cancellationToken);
        return Ok(expense);
    }

    [HttpDelete("{id:guid}/expenses/{expenseId:guid}")]
    public async Task<IActionResult> DeleteExpense(
        [FromRoute] Guid id,
        [FromRoute] Guid expenseId,
        CancellationToken cancellationToken = default)
    {
        await _jobService.DeleteExpenseAsync(id, expenseId, cancellationToken);
        return NoContent();
    }
}
