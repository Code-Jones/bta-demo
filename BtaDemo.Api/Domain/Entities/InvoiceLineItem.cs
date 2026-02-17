namespace BtaDemo.Api.Domain.Entities;

public class InvoiceLineItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid InvoiceId { get; set; }
    public Invoice? Invoice { get; set; }
    public string Description { get; set; } = "";
    public decimal Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public bool IsTaxLine { get; set; }
    public decimal? TaxRate { get; set; }
    public int SortOrder { get; set; }
}
