namespace BtaDemo.Api.Domain.Entities;

public class TaxLine
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Label { get; set; } = "";
    public decimal Rate { get; set; }
    public Guid? LeadId { get; set; }
    public Lead? Lead { get; set; }
    public Guid? CompanyId { get; set; }
    public Company? Company { get; set; }
}
