using BtaDemo.Api.Data;
using BtaDemo.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using BtaDemo.Api.Application.Dtos;
using BtaDemo.Api.Domain.Exceptions;
using BtaDemo.Api.Application.Services.Builders;

namespace BtaDemo.Api.Application.Services;

public class CompanyService
{
    private readonly AppDbContext _dbContext;
    public CompanyService(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task<IReadOnlyList<CompanyResponse>> GetAllAsync(bool includeDeleted, CancellationToken cancellationToken = default)
    {
        var companiesQuery = _dbContext.Companies.AsNoTracking().AsQueryable();
        if (!includeDeleted)
        {
            companiesQuery = companiesQuery.Where(x => !x.IsDeleted);
        }

        var companies = await companiesQuery
            .OrderBy(x => x.Name)
            .Select(x => new CompanyResponse(
                x.Id,
                x.Name,
                x.Phone,
                x.Email,
                x.Website,
                x.Notes,
                x.AddressLine1,
                x.AddressLine2,
                x.City,
                x.State,
                x.PostalCode,
                x.TaxId,
                x.IsDeleted,
                x.CreatedAtUtc,
                x.UpdatedAtUtc
            ))
            .ToListAsync(cancellationToken);

        return companies;
    }

    public async Task<CompanyDetailResponse> GetByIdAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        var company = await _dbContext.Companies
            .AsNoTracking()
            .Include(x => x.TaxLines)
            .Where(x => x.Id == companyId)
            .Select(x => new CompanyDetailResponse(
                x.Id,
                x.Name,
                x.Phone,
                x.Email,
                x.Website,
                x.Notes,
                x.AddressLine1,
                x.AddressLine2,
                x.City,
                x.State,
                x.PostalCode,
                x.TaxId,
                x.IsDeleted,
                x.CreatedAtUtc,
                x.UpdatedAtUtc,
                x.DeletedAtUtc,
                x.TaxLines.Select(line => new TaxLineResponse(line.Id, line.Label, line.Rate)).ToList()
            ))
            .FirstOrDefaultAsync(cancellationToken);

        return company ?? throw new NotFoundException("Company not found");
    }

    public async Task<Company> CreateAsync(CreateCompanyRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ValidationException("Company name is required");

        var trimmedName = request.Name.Trim();
        var existing = await _dbContext.Companies.FirstOrDefaultAsync(
            x => EF.Functions.ILike(x.Name, trimmedName),
            cancellationToken);

        if (existing is not null)
        {
            if (!existing.IsDeleted)
                return existing;

            existing.IsDeleted = false;
            existing.DeletedAtUtc = null;
            existing.UpdatedAtUtc = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
            return existing;
        }

        var utcNow = DateTime.UtcNow;
        var company = new Company
        {
            Name = trimmedName,
            Phone = request.Phone?.Trim(),
            Email = request.Email?.Trim(),
            Website = request.Website?.Trim(),
            Notes = request.Notes?.Trim(),
            AddressLine1 = request.AddressLine1?.Trim(),
            AddressLine2 = request.AddressLine2?.Trim(),
            City = request.City?.Trim(),
            State = request.State?.Trim(),
            PostalCode = request.PostalCode?.Trim(),
            TaxId = request.TaxId?.Trim(),
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow,
        };

        if (request.TaxLines is not null)
        {
            company.TaxLines = TaxLineBuilder.Build(request.TaxLines, null, company.Id);
        }
        _dbContext.Companies.Add(company);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return company;
    }

    public async Task<Company> UpdateAsync(Guid companyId, UpdateCompanyRequest request, CancellationToken cancellationToken = default)
    {
        var company = await _dbContext.Companies
            .Include(x => x.TaxLines)
            .FirstOrDefaultAsync(x => x.Id == companyId, cancellationToken)
            ?? throw new NotFoundException("Company not found");

        if (company.IsDeleted)
            throw new ConflictException("Cannot update a deleted company");

        if (request.Name is not null)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                throw new ValidationException("Company name is required");
            company.Name = request.Name.Trim();
        }

        if (request.Phone is not null) company.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        if (request.Email is not null) company.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        if (request.Website is not null) company.Website = string.IsNullOrWhiteSpace(request.Website) ? null : request.Website.Trim();
        if (request.Notes is not null) company.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
        if (request.AddressLine1 is not null) company.AddressLine1 = string.IsNullOrWhiteSpace(request.AddressLine1) ? null : request.AddressLine1.Trim();
        if (request.AddressLine2 is not null) company.AddressLine2 = string.IsNullOrWhiteSpace(request.AddressLine2) ? null : request.AddressLine2.Trim();
        if (request.City is not null) company.City = string.IsNullOrWhiteSpace(request.City) ? null : request.City.Trim();
        if (request.State is not null) company.State = string.IsNullOrWhiteSpace(request.State) ? null : request.State.Trim();
        if (request.PostalCode is not null) company.PostalCode = string.IsNullOrWhiteSpace(request.PostalCode) ? null : request.PostalCode.Trim();
        if (request.TaxId is not null) company.TaxId = string.IsNullOrWhiteSpace(request.TaxId) ? null : request.TaxId.Trim();

        if (request.TaxLines is not null)
        {
            _dbContext.TaxLines.RemoveRange(company.TaxLines);
            company.TaxLines = TaxLineBuilder.Build(request.TaxLines, null, company.Id);
        }

        company.UpdatedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
        return company;
    }

    public async Task<Company> DeleteAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        var company = await _dbContext.Companies.FirstOrDefaultAsync(x => x.Id == companyId, cancellationToken)
            ?? throw new NotFoundException("Company not found");

        if (company.IsDeleted)
            return company;

        var utcNow = DateTime.UtcNow;
        company.IsDeleted = true;
        company.DeletedAtUtc = utcNow;
        company.UpdatedAtUtc = utcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
        return company;
    }

}
