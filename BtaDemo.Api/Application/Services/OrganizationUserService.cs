using System.Text.RegularExpressions;
using BtaDemo.Api.Application.Dtos;
using BtaDemo.Api.Domain.Entities;
using BtaDemo.Api.Domain.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BtaDemo.Api.Application.Services;

public class OrganizationUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ICurrentUser _currentUser;

    public OrganizationUserService(
        UserManager<ApplicationUser> userManager,
        ICurrentUser currentUser)
    {
        _userManager = userManager;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<OrganizationUserResponse>> GetUsersAsync(CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var users = await _userManager.Users
            .Where(x => x.OrganizationId == organizationId)
            .OrderBy(x => x.LastName)
            .ThenBy(x => x.FirstName)
            .Select(x => new OrganizationUserResponse(
                x.Id,
                x.Email ?? string.Empty,
                x.FirstName,
                x.LastName,
                x.IsCompanyAdmin))
            .ToListAsync(cancellationToken);

        return users;
    }

    public async Task<OrganizationUserResponse> CreateUserAsync(CreateOrganizationUserRequest request, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();

        if (string.IsNullOrWhiteSpace(request.Email))
            throw new ValidationException("Email is required");
        var email = request.Email.Trim();
        if (!IsValidEmail(email))
            throw new ValidationException("Invalid email address");
        if (string.IsNullOrWhiteSpace(request.Password))
            throw new ValidationException("Password is required");
        if (string.IsNullOrWhiteSpace(request.FirstName))
            throw new ValidationException("First name is required");
        if (string.IsNullOrWhiteSpace(request.LastName))
            throw new ValidationException("Last name is required");

        var existing = await _userManager.FindByEmailAsync(email);
        if (existing is not null)
        {
            throw new ValidationException("Email already in use");
        }

        // UserName must be globally unique (Identity index); scope it to the org
        var userName = $"{organizationId}:{email}";
        var user = new ApplicationUser
        {
            UserName = userName,
            Email = email,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            OrganizationId = organizationId,
            IsCompanyAdmin = request.IsCompanyAdmin
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(x => x.Description));
            throw new ValidationException(errors);
        }

        return new OrganizationUserResponse(
            user.Id,
            user.Email ?? string.Empty,
            user.FirstName,
            user.LastName,
            user.IsCompanyAdmin);
    }

    public async Task RemoveUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var currentUserId = _currentUser.UserId;

        if (string.Equals(userId, currentUserId, StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationException("You cannot remove yourself");
        }

        var user = await _userManager.Users
            .FirstOrDefaultAsync(x => x.Id == userId && x.OrganizationId == organizationId, cancellationToken);
        if (user is null)
        {
            throw new NotFoundException("User not found");
        }

        var delete = await _userManager.DeleteAsync(user);
        if (!delete.Succeeded)
        {
            var errors = string.Join(", ", delete.Errors.Select(x => x.Description));
            throw new ValidationException(errors);
        }
    }

    private Guid GetOrganizationId()
    {
        var organizationId = _currentUser.OrganizationId;
        if (organizationId == Guid.Empty)
        {
            throw new UnauthorizedAccessException("Organization scope missing");
        }

        return organizationId;
    }

    private static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email) || email.Length < 5 || email.Length > 100)
        {
            return false;
        }

        return Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");
    }
}
