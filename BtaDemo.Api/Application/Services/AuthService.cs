using System.Text.RegularExpressions;
using BtaDemo.Api.Application.Dtos;
using BtaDemo.Api.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using BtaDemo.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace BtaDemo.Api.Application.Services;

public class AuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly AppDbContext _dbContext;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        AppDbContext dbContext)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _dbContext = dbContext;
    }

    public async Task<UserResponse> RegisterAsync(RegisterRequest request)
    {
        var errors = await ValidateRegisterRequestAsync(request);
        if (errors.Count > 0)
        {
            throw new InvalidOperationException(string.Join(", ", errors));
        }

        var utcNow = DateTime.UtcNow;
        var email = request.Email.Trim();
        var organizationName = request.Company.Trim();

        await using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            var organization = new Organization
            {
                Name = organizationName,
                CreatedAtUtc = utcNow,
                UpdatedAtUtc = utcNow,
            };

            _dbContext.Organizations.Add(organization);
            await _dbContext.SaveChangesAsync();

            var user = new ApplicationUser
            {
                UserName = $"{organization.Id:N}-{email}",
                Email = email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                OrganizationId = organization.Id,
                IsCompanyAdmin = true
            };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errorMessage = result.Errors.Any()
                ? string.Join(", ", result.Errors.Select(error => error.Description))
                : "Failed to register user";
            throw new InvalidOperationException(errorMessage);
        }

            await transaction.CommitAsync();

            return new UserResponse
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                OrganizationId = organization.Id,
                OrganizationName = organization.Name,
                Company = organization.Name,
                IsCompanyAdmin = user.IsCompanyAdmin
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<UserResponse> LoginAsync(LoginRequest request)
    {
        var errors = await ValidateLoginRequestAsync(request);
        if (errors.Count > 0)
        {
            throw new InvalidOperationException(string.Join(", ", errors));
        }

        var email = request.Email.Trim();
        var usersQuery = _userManager.Users
            .Include(x => x.Organization)
            .Where(x => x.Email == email);

        if (request.OrganizationId is not null)
        {
            usersQuery = usersQuery.Where(x => x.OrganizationId == request.OrganizationId);
        }

        if (request.OrganizationId is null)
        {
            var candidates = await usersQuery.Take(2).ToListAsync();
            if (candidates.Count > 1)
            {
                throw new InvalidOperationException("Multiple organizations found for this email");
            }

            var userFromEmail = candidates.FirstOrDefault();
            if (userFromEmail == null || userFromEmail.Email == null)
            {
                throw new InvalidOperationException("Invalid credentials");
            }

            return await CompleteLoginAsync(userFromEmail, request.Password);
        }

        var user = await usersQuery.FirstOrDefaultAsync();
        if (user == null || user.Email == null)
        {
            throw new InvalidOperationException("Invalid credentials");
        }

        return await CompleteLoginAsync(user, request.Password);
    }

    private async Task<UserResponse> CompleteLoginAsync(ApplicationUser user, string password)
    {
        if (user.OrganizationId == Guid.Empty || user.Organization is null)
        {
            throw new InvalidOperationException("User is not assigned to an organization");
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, password, false);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException("Invalid credentials");
        }

        return new UserResponse
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            OrganizationId = user.OrganizationId,
            OrganizationName = user.Organization.Name,
            Company = user.Organization.Name,
            IsCompanyAdmin = user.IsCompanyAdmin
        };
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
