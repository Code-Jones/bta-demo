using Microsoft.AspNetCore.Mvc;
using BtaDemo.Api.Application.Services;
using BtaDemo.Api.Application.Dtos;

namespace BtaDemo.Api.Api.Controllers;

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
}