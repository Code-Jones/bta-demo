namespace BtaDemo.Api.Application.Dtos;

public class CreateLeadRequest
{
    public string Name { get; set; } = "";
    public string? Company { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
}