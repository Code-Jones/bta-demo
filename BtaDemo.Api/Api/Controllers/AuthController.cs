using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using BtaDemo.Api.Application.Dtos;
using BtaDemo.Api.Application.Services;

namespace BtaDemo.Api.Api.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly AuthService _authService;

    public AuthController(IConfiguration configuration, AuthService authService)
    {
        _configuration = configuration;
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var user = await _authService.RegisterAsync(request);
            var token = GenerateToken(user, accessToken: true);
            var refreshToken = GenerateToken(user, accessToken: false);
            return Created("/auth/me", new { userId = user.Id, email = user.Email, firstName = user.FirstName, lastName = user.LastName, company = user.Company, token, refreshToken });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var user = await _authService.LoginAsync(request);
            var token = GenerateToken(user, accessToken: true);
            var refreshToken = GenerateToken(user, accessToken: false);
            return Ok(new { token, refreshToken });
        }
        catch (InvalidOperationException)
        {
            return Unauthorized();
        }
    }

    [HttpPost("refresh")]
    public IActionResult Refresh([FromBody] RefreshRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return BadRequest();
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(DotNetEnv.Env.GetString("JWT__KEY")));
        var jwt = _configuration.GetSection("Jwt");
        var validationParams = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwt["Audience"],
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ClockSkew = TimeSpan.FromSeconds(30),
        };

        var handler = new JwtSecurityTokenHandler();
        if (!handler.CanReadToken(request.RefreshToken))
        {
            return Unauthorized();
        }

        try
        {
            var principal = handler.ValidateToken(request.RefreshToken, validationParams, out _);
            var tokenType = principal.FindFirstValue("token_type");
            if (tokenType != "refresh")
            {
                return Unauthorized();
            }

            var user = new UserResponse
            {
                Id = principal.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier) ?? "",
                Email = principal.FindFirstValue(System.Security.Claims.ClaimTypes.Name) ?? "",
                FirstName = principal.FindFirstValue("firstName") ?? "",
                LastName = principal.FindFirstValue("lastName") ?? "",
                Company = principal.FindFirstValue("company") ?? "",
            };
            var newToken = GenerateToken(user, accessToken: true);
            return Ok(new { token = newToken });
        }
        catch
        {
            return Unauthorized();
        }
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = User.FindFirstValue(ClaimTypes.Name);
        var firstName = User.FindFirstValue("firstName");
        var lastName = User.FindFirstValue("lastName");
        var company = User.FindFirstValue("company");
        return Ok(new { userId, email, firstName, lastName, company });
    }

    private string GenerateToken(UserResponse user, bool accessToken)
    {
        var jwt = _configuration.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(DotNetEnv.Env.GetString("JWT__KEY")));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new List<Claim> {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.Email ?? ""),
            new("firstName", user.FirstName ?? ""),
            new("lastName", user.LastName ?? ""),
            new("company", user.Company ?? ""),
            new("token_type", accessToken ? "access" : "refresh")
        };

        var now = DateTime.UtcNow;
        var expires = accessToken ? now.AddHours(3) : now.AddDays(7);
        var token = new JwtSecurityToken(
            jwt["Issuer"],
            jwt["Audience"],
            claims,
            notBefore: now,
            expires: expires,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
