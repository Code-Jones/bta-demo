using BtaDemo.Api.Domain.Enum;

namespace BtaDemo.Api.Domain.Entities;

public class Lead
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = "";
    public Guid OrganizationId { get; set; }
    public Organization? Organization { get; set; }
    public string? Company { get; set; }
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
    public Guid? CompanyId { get; set; }
    public Company? CompanyEntity { get; set; }
    public List<TaxLine> TaxLines { get; set; } = new();
    public LeadStatus Status { get; set; } = LeadStatus.New;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LostAtUtc { get; set; }
}
