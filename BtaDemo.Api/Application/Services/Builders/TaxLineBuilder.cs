using BtaDemo.Api.Application.Dtos;
using BtaDemo.Api.Domain.Entities;
using BtaDemo.Api.Domain.Exceptions;

namespace BtaDemo.Api.Application.Services.Builders;

public static class TaxLineBuilder
{
    public static List<TaxLine> Build(IEnumerable<TaxLineRequest> taxLines, Guid? leadId, Guid? companyId)
    {
        return taxLines
            .Where(line => !string.IsNullOrWhiteSpace(line.Label))
            .Select(line =>
            {
                if (line.Rate < 0)
                    throw new ValidationException("Tax rate must be zero or greater");

                return new TaxLine
                {
                    Label = line.Label.Trim(),
                    Rate = line.Rate,
                    LeadId = leadId,
                    CompanyId = companyId
                };
            })
            .ToList();
    }
}
