using Microsoft.AspNetCore.Mvc;
using BtaDemo.Api.Domain.Services;

namespace BtaDemo.Api.Api.Controllers;

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
}