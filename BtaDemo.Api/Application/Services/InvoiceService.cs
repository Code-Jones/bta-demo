using Microsoft.EntityFrameworkCore;
using BtaDemo.Api.Data;
using BtaDemo.Api.Domain.Entities;


namespace BtaDemo.Api.Domain.Services;

public class InvoiceService
{
    private readonly AppDbContext _dbContext;
    public InvoiceService(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task<Invoice> MarkPaidAsync(Guid invoiceId, CancellationToken cancellationToken = default)
    {
        var invoice = await _dbContext.Invoices.FirstOrDefaultAsync(x => x.Id == invoiceId, cancellationToken) ?? throw new InvalidOperationException("Invoice not found");

        invoice.MarkPaid(DateTime.UtcNow);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return invoice;
    }
}