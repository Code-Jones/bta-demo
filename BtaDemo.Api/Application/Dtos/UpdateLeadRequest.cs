namespace BtaDemo.Api.Application.Dtos;

public class UpdateLeadRequest
{
    public string? Name { get; set; }
    public string? Company { get; set; }
    public Guid? CompanyId { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? LeadSource { get; set; }
    public string? ProjectType { get; set; }
    public decimal? EstimatedValue { get; set; }
    public string? Notes { get; set; }
    public List<TaxLineRequest>? TaxLines { get; set; }
}
