using System.Text.RegularExpressions;
using BtaDemo.Api.Application.Dtos;
using BtaDemo.Api.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace BtaDemo.Api.Application.Services;

public class AuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IConfiguration _configuration;

    public AuthService(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, IConfiguration configuration) {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
    }

    public async Task<UserResponse> RegisterAsync(RegisterRequest request)
    {
        var errors = await ValidateRegisterRequestAsync(request);
        if (errors.Count > 0)
        {
            throw new InvalidOperationException(string.Join(", ", errors));
        }

        var user = new ApplicationUser { UserName = request.Email, Email = request.Email, FirstName = request.FirstName, LastName = request.LastName, Company = request.Company };
        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException("Failed to register user");
        }

        return new UserResponse { Id = user.Id, Email = user.Email, FirstName = user.FirstName, LastName = user.LastName, Company = user.Company };
    }

    public async Task<UserResponse> LoginAsync(LoginRequest request)
    {
        var errors = await ValidateLoginRequestAsync(request);
        if (errors.Count > 0)
        {
            throw new InvalidOperationException(string.Join(", ", errors));
        }

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null || user.Email == null)
        {
            throw new InvalidOperationException("Invalid credentials");
        }
        
        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException("Invalid credentials");
        }

        return new UserResponse { Id = user.Id, Email = user.Email, FirstName = user.FirstName, LastName = user.LastName, Company = user.Company };
    }

    private async Task<List<string>> ValidateLoginRequestAsync(LoginRequest request)
    {
        var errors = new List<string>();
        await ValidateEmail(request.Email, errors, forRegistration: false);

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            errors.Add("Password is required");
        }

        return errors;
    }

    private async Task ValidateEmail(string email, List<string> errors, bool forRegistration)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            errors.Add("Email is required");
            return;
        }

        if (!IsValidEmail(email))
        {
            errors.Add("Invalid email address");
            return;
        }

        if (!forRegistration)
            return;

        var user = await _userManager.FindByEmailAsync(email);
        if (user != null)
        {
            errors.Add("Email already in use, please login instead");
        }
    }

    private async Task<List<string>> ValidateRegisterRequestAsync(RegisterRequest request)
    {
        var errors = new List<string>();

        await ValidateEmail(request.Email, errors, forRegistration: true);

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            errors.Add("Password is required");
        }
        
        if (string.IsNullOrWhiteSpace(request.FirstName))
        {
            errors.Add("First name is required");
        }

        if (string.IsNullOrWhiteSpace(request.LastName))
        {
            errors.Add("Last name is required");
        }

        if (string.IsNullOrWhiteSpace(request.Company))
        {
            errors.Add("Company is required");
        }

        return errors;
    }

    private bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email) || email.Length < 5 || email.Length > 100)
        {
            return false;
        }

        return Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");
    }

}