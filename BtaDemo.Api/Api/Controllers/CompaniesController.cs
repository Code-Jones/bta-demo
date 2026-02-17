using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BtaDemo.Api.Application.Services;
using BtaDemo.Api.Application.Dtos;

namespace BtaDemo.Api.Api.Controllers;

[Authorize]
[ApiController]
[Route("companies")]
public class CompaniesController : ControllerBase
{
    private readonly CompanyService _companyService;

    public CompaniesController(CompanyService companyService) => _companyService = companyService;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool includeDeleted = false, CancellationToken cancellationToken = default)
        => Ok(await _companyService.GetAllAsync(includeDeleted, cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken cancellationToken = default)
        => Ok(await _companyService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCompanyRequest request, CancellationToken cancellationToken = default)
    {
        var company = await _companyService.CreateAsync(request, cancellationToken);
        var response = new CompanyResponse(
            company.Id,
            company.Name,
            company.Phone,
            company.Email,
            company.Website,
            company.Notes,
            company.AddressLine1,
            company.AddressLine2,
            company.City,
            company.State,
            company.PostalCode,
            company.TaxId,
            company.IsDeleted,
            company.CreatedAtUtc,
            company.UpdatedAtUtc
        );
        return Created($"/companies/{company.Id}", response);
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateCompanyRequest request, CancellationToken cancellationToken = default)
    {
        var company = await _companyService.UpdateAsync(id, request, cancellationToken);
        return Ok(new { company.Id, company.Name });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete([FromRoute] Guid id, CancellationToken cancellationToken = default)
    {
        var company = await _companyService.DeleteAsync(id, cancellationToken);
        return Ok(new { company.Id, company.IsDeleted });
    }
}
