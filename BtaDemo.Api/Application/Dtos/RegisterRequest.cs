namespace BtaDemo.Api.Application.Dtos;

public record RegisterRequest(
    string Email, 
    string Password, 
    string FirstName, 
    string LastName, 
    string Company
);