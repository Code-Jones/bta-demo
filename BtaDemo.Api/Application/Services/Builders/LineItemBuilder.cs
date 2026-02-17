using BtaDemo.Api.Application.Dtos;
using BtaDemo.Api.Domain.Entities;
using BtaDemo.Api.Domain.Exceptions;

namespace BtaDemo.Api.Application.Services.Builders;

public static class LineItemBuilder
{
    public static List<EstimateLineItem> BuildEstimateLineItems(IReadOnlyList<EstimateLineItemRequest> lineItems, Guid estimateId)
    {
        var items = new List<EstimateLineItem>();
        foreach (var lineItem in lineItems)
        {
            var description = lineItem.Description?.Trim() ?? "";
            if (string.IsNullOrWhiteSpace(description))
                continue;

            items.Add(new EstimateLineItem
            {
                EstimateId = estimateId,
                Description = description,
                Quantity = lineItem.IsTaxLine ? 1 : lineItem.Quantity,
                UnitPrice = lineItem.IsTaxLine ? 0 : lineItem.UnitPrice,
                IsTaxLine = lineItem.IsTaxLine,
                TaxRate = lineItem.IsTaxLine ? lineItem.TaxRate : null,
                SortOrder = lineItem.SortOrder,
            });
        }

        return items.OrderBy(x => x.SortOrder).ToList();
    }

    public static List<InvoiceLineItem> BuildInvoiceLineItems(IReadOnlyList<InvoiceLineItemRequest> lineItems, Guid invoiceId)
    {
        var items = new List<InvoiceLineItem>();
        foreach (var lineItem in lineItems)
        {
            var description = lineItem.Description?.Trim();
            if (string.IsNullOrWhiteSpace(description))
                throw new ValidationException("Line item description is required");

            if (lineItem.IsTaxLine && (lineItem.TaxRate is null || lineItem.TaxRate < 0))
                throw new ValidationException("Tax lines require a valid rate");

            if (!lineItem.IsTaxLine && lineItem.Quantity <= 0)
                throw new ValidationException("Line item quantity must be greater than 0");

            if (!lineItem.IsTaxLine && lineItem.UnitPrice < 0)
                throw new ValidationException("Line item price must be greater than or equal to 0");

            items.Add(new InvoiceLineItem
            {
                InvoiceId = invoiceId,
                Description = description,
                Quantity = lineItem.IsTaxLine ? 1 : lineItem.Quantity,
                UnitPrice = lineItem.IsTaxLine ? 0 : lineItem.UnitPrice,
                IsTaxLine = lineItem.IsTaxLine,
                TaxRate = lineItem.IsTaxLine ? lineItem.TaxRate : null,
                SortOrder = lineItem.SortOrder,
            });
        }

        return items.OrderBy(x => x.SortOrder).ToList();
    }

    public static (decimal Subtotal, decimal TaxTotal, decimal Total) CalculateTotals(IReadOnlyList<EstimateLineItem> lineItems)
    {
        var subtotal = lineItems.Where(x => !x.IsTaxLine).Sum(x => x.Quantity * x.UnitPrice);
        var taxTotal = lineItems.Where(x => x.IsTaxLine).Sum(x => subtotal * (x.TaxRate ?? 0) / 100m);
        var total = subtotal + taxTotal;
        return (Math.Round(subtotal, 2), Math.Round(taxTotal, 2), Math.Round(total, 2));
    }

    public static (decimal Subtotal, decimal TaxTotal, decimal Total) CalculateTotals(IReadOnlyList<InvoiceLineItem> lineItems)
    {
        var subtotal = lineItems.Where(x => !x.IsTaxLine).Sum(x => x.Quantity * x.UnitPrice);
        var taxTotal = lineItems.Where(x => x.IsTaxLine).Sum(x => subtotal * (x.TaxRate ?? 0) / 100m);
        var total = subtotal + taxTotal;
        return (Math.Round(subtotal, 2), Math.Round(taxTotal, 2), Math.Round(total, 2));
    }
}
