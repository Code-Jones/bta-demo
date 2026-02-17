using Microsoft.AspNetCore.Mvc;
using BtaDemo.Api.Application.Services;
using Microsoft.AspNetCore.Authorization;
using BtaDemo.Api.Application.Dtos;

namespace BtaDemo.Api.Api.Controllers;

[Authorize]
[ApiController]
[Route("invoices")]
public class InvoicesController : ControllerBase
{
    private readonly InvoiceService _invoiceService;
    public InvoicesController(InvoiceService invoiceService) => _invoiceService = invoiceService;

    [HttpPost("{id:guid}/mark-paid")]
    public async Task<IActionResult> MarkPaid([FromRoute] Guid id, CancellationToken cancellationToken = default)
    {
        var invoice = await _invoiceService.MarkPaidAsync(id, cancellationToken);
        return Ok(new { invoice.Id, invoice.Status });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken = default)
    {
        var invoices = await _invoiceService.GetAllAsync(cancellationToken);
        return Ok(invoices);
    }

    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics(CancellationToken cancellationToken = default)
        => Ok(await _invoiceService.GetMetricsAsync(cancellationToken));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInvoiceRequest request, CancellationToken cancellationToken = default)
    {
        var invoice = await _invoiceService.CreateAsync(request, cancellationToken);
        return Created($"/invoices/{invoice.Id}", new { invoice.Id, invoice.Status });
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateInvoiceRequest request, CancellationToken cancellationToken = default)
    {
        var invoice = await _invoiceService.UpdateAsync(id, request, cancellationToken);
        return Ok(new { invoice.Id, invoice.Status });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete([FromRoute] Guid id, CancellationToken cancellationToken = default)
    {
        var invoice = await _invoiceService.DeleteAsync(id, cancellationToken);
        return Ok(new { invoice.Id });
    }

    [HttpPost("{id:guid}/issue")]
    public async Task<IActionResult> Issue([FromRoute] Guid id, [FromBody] IssueInvoiceRequest request, CancellationToken cancellationToken = default)
    {
        var invoice = await _invoiceService.IssueAsync(id, request, cancellationToken);
        return Ok(new { invoice.Id, invoice.Status, invoice.DueAtUtc });
    }
}
