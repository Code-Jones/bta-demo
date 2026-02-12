namespace BtaDemo.Api.Domain.Entities;

public class Lead
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = "";
    public string? Company { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}