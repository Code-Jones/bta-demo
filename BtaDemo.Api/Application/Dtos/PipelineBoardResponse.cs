namespace BtaDemo.Api.Application.Dtos;

public record PipelineItemResponse(
    Guid Id,
    string EntityType,
    string Title,
    string Subtitle,
    decimal? Amount,
    string Status,
    DateTime? StatusAtUtc
);

public record PipelineColumnResponse(
    string Key,
    string Title,
    int Count,
    decimal TotalValue,
    IReadOnlyList<PipelineItemResponse> Items
);

public record PipelineBoardResponse(
    IReadOnlyList<PipelineColumnResponse> Columns,
    decimal PipelineTotal
);
