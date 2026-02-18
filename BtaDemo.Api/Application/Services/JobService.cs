using Microsoft.EntityFrameworkCore;
using BtaDemo.Api.Data;
using BtaDemo.Api.Domain.Entities;
using BtaDemo.Api.Application.Dtos;
using BtaDemo.Api.Domain.Enum;
using BtaDemo.Api.Domain.Events;
using BtaDemo.Api.Domain.StateMachines;
using BtaDemo.Api.Application.Events;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.IO;
using BtaDemo.Api.Domain.Exceptions;

namespace BtaDemo.Api.Application.Services;

public class JobService
{
    private readonly AppDbContext _dbContext;
    private readonly JobStateMachine _stateMachine;
    private readonly IStateTransitionEventEmitter _eventEmitter;
    private readonly IWebHostEnvironment _environment;
    private readonly ICurrentUser _currentUser;

    public JobService(
        AppDbContext dbContext,
        JobStateMachine stateMachine,
        IStateTransitionEventEmitter eventEmitter,
        IWebHostEnvironment environment,
        ICurrentUser currentUser)
    {
        _dbContext = dbContext;
        _stateMachine = stateMachine;
        _eventEmitter = eventEmitter;
        _environment = environment;
        _currentUser = currentUser;
    }

    public async Task<Job> CreateAsync(CreateJobRequest req, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var leadExists = await _dbContext.Leads.AnyAsync(
            x => x.Id == req.LeadId && x.OrganizationId == organizationId,
            cancellationToken);
        if (!leadExists)
            throw new NotFoundException("Lead not found");

        if (req.EstimateId is not null)
        {
            var estExists = await _dbContext.Estimates.AnyAsync(
                x => x.Id == req.EstimateId && x.OrganizationId == organizationId,
                cancellationToken);
            if (!estExists)
                throw new NotFoundException("Estimate not found");
        }

        if (req.EstimatedEndAtUtc <= req.StartAtUtc)
            throw new ValidationException("Estimated end date must be after the start date");

        var job = new Job
        {
            OrganizationId = organizationId,
            LeadId = req.LeadId,
            EstimateId = req.EstimateId,
            Description = req.Description,
            StartAtUtc = req.StartAtUtc,
            EstimatedEndAtUtc = req.EstimatedEndAtUtc
        };

        _dbContext.Jobs.Add(job);

        if (req.Milestones is not null)
        {
            var milestones = req.Milestones
                .Where(x => !string.IsNullOrWhiteSpace(x.Title))
                .Select((item, index) => new JobMilestone
                {
                    JobId = job.Id,
                    Title = item.Title.Trim(),
                    Notes = string.IsNullOrWhiteSpace(item.Notes) ? null : item.Notes.Trim(),
                    Status = item.Status ?? MilestoneStatus.Pending,
                    OccurredAtUtc = item.OccurredAtUtc ?? req.StartAtUtc,
                    SortOrder = item.SortOrder ?? index + 1,
                    CreatedAtUtc = DateTime.UtcNow,
                    UpdatedAtUtc = DateTime.UtcNow,
                })
                .OrderBy(x => x.SortOrder)
                .ToList();

            if (milestones.Count > 0)
            {
                _dbContext.JobMilestones.AddRange(milestones);
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return job;
    }

    public async Task<IReadOnlyList<JobListResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var jobs = await _dbContext.Jobs
            .AsNoTracking()
            .Include(x => x.Lead)
                .ThenInclude(x => x.TaxLines)
            .Include(x => x.Lead)
                .ThenInclude(x => x.CompanyEntity)
                    .ThenInclude(x => x.TaxLines)
            .Include(x => x.Milestones)
            .Include(x => x.Expenses)
            .Where(x => x.OrganizationId == organizationId)
            .OrderByDescending(x => x.StartAtUtc)
            .ToListAsync(cancellationToken);

        return jobs.Select(x => new JobListResponse(
            x.Id,
            x.LeadId,
            x.Lead != null ? x.Lead.Name : "Job",
            x.Lead != null ? x.Lead.Company : null,
            x.Lead != null ? x.Lead.Email : null,
            x.Lead != null ? x.Lead.Phone : null,
            x.Lead != null ? x.Lead.AddressLine1 : null,
            x.Lead != null ? x.Lead.AddressLine2 : null,
            x.Lead != null ? x.Lead.City : null,
            x.Lead != null ? x.Lead.State : null,
            x.Lead != null ? x.Lead.PostalCode : null,
            x.Lead != null ? x.Lead.CompanyId : null,
            x.Lead?.CompanyEntity?.Name,
            x.Lead?.CompanyEntity?.TaxId,
            x.Lead != null
                ? x.Lead.TaxLines.Select(line => new TaxLineResponse(line.Id, line.Label, line.Rate)).ToList()
                : new List<TaxLineResponse>(),
            x.Lead?.CompanyEntity != null
                ? x.Lead.CompanyEntity.TaxLines.Select(line => new TaxLineResponse(line.Id, line.Label, line.Rate)).ToList()
                : new List<TaxLineResponse>(),
            x.EstimateId,
            x.StartAtUtc,
            x.EstimatedEndAtUtc,
            x.Status.ToString()
        )).ToList();
    }

    public async Task<JobDetailResponse> GetDetailAsync(Guid jobId, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var job = await _dbContext.Jobs
            .AsNoTracking()
            .Include(x => x.Lead)
                .ThenInclude(x => x.CompanyEntity)
            .Include(x => x.Milestones)
            .Include(x => x.Expenses)
            .FirstOrDefaultAsync(x => x.Id == jobId && x.OrganizationId == organizationId, cancellationToken)
            ?? throw new NotFoundException("Job not found");

        var milestones = job.Milestones
            .OrderBy(x => x.SortOrder)
            .Select(x => new JobMilestoneResponse(
                x.Id,
                x.Title,
                x.Notes,
                x.Status,
                x.OccurredAtUtc,
                x.SortOrder,
                x.CreatedAtUtc,
                x.UpdatedAtUtc))
            .ToList();

        var expenses = job.Expenses
            .OrderByDescending(x => x.SpentAtUtc)
            .Select(x => new JobExpenseResponse(
                x.Id,
                x.Vendor,
                x.Category,
                x.Amount,
                x.SpentAtUtc,
                x.Notes,
                x.ReceiptUrl,
                x.CreatedAtUtc,
                x.UpdatedAtUtc))
            .ToList();

        var lead = job.Lead;
        var company = lead?.CompanyEntity;

        return new JobDetailResponse(
            job.Id,
            job.LeadId,
            lead?.Name ?? "Job",
            lead?.Company,
            lead?.Email,
            lead?.Phone,
            lead?.AddressLine1,
            lead?.AddressLine2,
            lead?.City,
            lead?.State,
            lead?.PostalCode,
            company?.Name,
            company?.TaxId,
            job.EstimateId,
            job.Description,
            job.StartAtUtc,
            job.EstimatedEndAtUtc,
            job.Status.ToString(),
            job.CreatedAtUtc,
            job.UpdatedAtUtc,
            job.StartedAtUtc,
            job.CompletedAtUtc,
            milestones,
            expenses
        );
    }

    public async Task<JobMilestoneResponse> AddMilestoneAsync(Guid jobId, CreateJobMilestoneRequest request, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var job = await _dbContext.Jobs
            .Include(x => x.Milestones)
            .FirstOrDefaultAsync(x => x.Id == jobId && x.OrganizationId == organizationId, cancellationToken)
            ?? throw new NotFoundException("Job not found");

        var title = request.Title?.Trim() ?? "";
        if (string.IsNullOrWhiteSpace(title))
            throw new ValidationException("Milestone title is required");

        var utcNow = DateTime.UtcNow;
        var nextSort = job.Milestones.Count == 0 ? 1 : job.Milestones.Max(x => x.SortOrder) + 1;

        var milestone = new JobMilestone
        {
            JobId = job.Id,
            Title = title,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            Status = request.Status ?? MilestoneStatus.Pending,
            OccurredAtUtc = request.OccurredAtUtc ?? utcNow,
            SortOrder = nextSort,
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow,
        };

        _dbContext.JobMilestones.Add(milestone);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new JobMilestoneResponse(
            milestone.Id,
            milestone.Title,
            milestone.Notes,
            milestone.Status,
            milestone.OccurredAtUtc,
            milestone.SortOrder,
            milestone.CreatedAtUtc,
            milestone.UpdatedAtUtc);
    }

    public async Task<JobMilestoneResponse> UpdateMilestoneAsync(Guid jobId, Guid milestoneId, UpdateJobMilestoneRequest request, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var milestone = await _dbContext.JobMilestones
            .FirstOrDefaultAsync(
                x => x.Id == milestoneId && x.JobId == jobId && x.Job != null && x.Job.OrganizationId == organizationId,
                cancellationToken)
            ?? throw new NotFoundException("Milestone not found");

        if (request.Title is not null)
        {
            var title = request.Title.Trim();
            if (string.IsNullOrWhiteSpace(title))
                throw new ValidationException("Milestone title is required");
            milestone.Title = title;
        }

        if (request.Notes is not null)
        {
            milestone.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
        }

        if (request.Status is not null)
        {
            milestone.Status = request.Status.Value;
        }

        if (request.OccurredAtUtc is not null)
        {
            milestone.OccurredAtUtc = request.OccurredAtUtc.Value;
        }

        if (request.SortOrder is not null)
        {
            milestone.SortOrder = request.SortOrder.Value;
        }

        milestone.UpdatedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new JobMilestoneResponse(
            milestone.Id,
            milestone.Title,
            milestone.Notes,
            milestone.Status,
            milestone.OccurredAtUtc,
            milestone.SortOrder,
            milestone.CreatedAtUtc,
            milestone.UpdatedAtUtc);
    }

    public async Task DeleteMilestoneAsync(Guid jobId, Guid milestoneId, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var jobExists = await _dbContext.Jobs.AnyAsync(x => x.Id == jobId && x.OrganizationId == organizationId, cancellationToken);
        if (!jobExists)
            throw new NotFoundException("Job not found");
        var milestone = await _dbContext.JobMilestones
            .FirstOrDefaultAsync(x => x.Id == milestoneId && x.JobId == jobId, cancellationToken)
            ?? throw new NotFoundException("Milestone not found");

        _dbContext.JobMilestones.Remove(milestone);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<JobExpenseResponse> AddExpenseAsync(Guid jobId, CreateJobExpenseRequest request, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var job = await _dbContext.Jobs.FirstOrDefaultAsync(
            x => x.Id == jobId && x.OrganizationId == organizationId,
            cancellationToken);
        if (job is null)
            throw new NotFoundException("Job not found");

        var vendor = request.Vendor?.Trim() ?? "";
        if (string.IsNullOrWhiteSpace(vendor))
            throw new ValidationException("Vendor is required");
        if (request.Amount <= 0)
            throw new ValidationException("Amount must be greater than 0");

        var receiptUrl = await SaveReceiptAsync(request.Receipt, cancellationToken);
        var utcNow = DateTime.UtcNow;

        var expense = new JobExpense
        {
            OrganizationId = organizationId,
            JobId = jobId,
            Vendor = vendor,
            Category = string.IsNullOrWhiteSpace(request.Category) ? null : request.Category.Trim(),
            Amount = request.Amount,
            SpentAtUtc = request.SpentAtUtc,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            ReceiptUrl = receiptUrl,
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow,
        };

        _dbContext.JobExpenses.Add(expense);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new JobExpenseResponse(
            expense.Id,
            expense.Vendor,
            expense.Category,
            expense.Amount,
            expense.SpentAtUtc,
            expense.Notes,
            expense.ReceiptUrl,
            expense.CreatedAtUtc,
            expense.UpdatedAtUtc);
    }

    public async Task<JobExpenseResponse> UpdateExpenseAsync(Guid jobId, Guid expenseId, UpdateJobExpenseRequest request, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var expense = await _dbContext.JobExpenses
            .FirstOrDefaultAsync(
                x => x.Id == expenseId && x.JobId == jobId && x.OrganizationId == organizationId,
                cancellationToken)
            ?? throw new NotFoundException("Expense not found");

        if (request.Vendor is not null)
        {
            var vendor = request.Vendor.Trim();
            if (string.IsNullOrWhiteSpace(vendor))
                throw new ValidationException("Vendor is required");
            expense.Vendor = vendor;
        }

        if (request.Category is not null)
        {
            expense.Category = string.IsNullOrWhiteSpace(request.Category) ? null : request.Category.Trim();
        }

        if (request.Amount is not null)
        {
            if (request.Amount <= 0)
                throw new ValidationException("Amount must be greater than 0");
            expense.Amount = request.Amount.Value;
        }

        if (request.SpentAtUtc is not null)
        {
            expense.SpentAtUtc = request.SpentAtUtc.Value;
        }

        if (request.Notes is not null)
        {
            expense.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
        }

        if (request.Receipt is not null)
        {
            expense.ReceiptUrl = await SaveReceiptAsync(request.Receipt, cancellationToken);
        }

        expense.UpdatedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new JobExpenseResponse(
            expense.Id,
            expense.Vendor,
            expense.Category,
            expense.Amount,
            expense.SpentAtUtc,
            expense.Notes,
            expense.ReceiptUrl,
            expense.CreatedAtUtc,
            expense.UpdatedAtUtc);
    }

    public async Task DeleteExpenseAsync(Guid jobId, Guid expenseId, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var expense = await _dbContext.JobExpenses
            .FirstOrDefaultAsync(
                x => x.Id == expenseId && x.JobId == jobId && x.OrganizationId == organizationId,
                cancellationToken)
            ?? throw new NotFoundException("Expense not found");

        _dbContext.JobExpenses.Remove(expense);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<string?> SaveReceiptAsync(IFormFile? receipt, CancellationToken cancellationToken)
    {
        if (receipt is null || receipt.Length == 0)
            return null;

        var uploadsRoot = Path.Combine(_environment.ContentRootPath, "wwwroot", "uploads", "job-expenses");
        Directory.CreateDirectory(uploadsRoot);

        var ext = Path.GetExtension(receipt.FileName);
        var fileName = $"expense-{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(uploadsRoot, fileName);

        await using var stream = File.Create(filePath);
        await receipt.CopyToAsync(stream, cancellationToken);

        return $"/uploads/job-expenses/{fileName}";
    }

    public async Task<Job> StartAsync(Guid jobId, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var job = await _dbContext.Jobs.FirstOrDefaultAsync(
            x => x.Id == jobId && x.OrganizationId == organizationId,
            cancellationToken) ?? throw new NotFoundException("Job not found");

        var utcNow = DateTime.UtcNow;
        var transition = _stateMachine.Transition(job, JobStatus.InProgress, utcNow);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _eventEmitter.EmitAsync(new StateTransitionEvent(
            nameof(Job),
            job.Id,
            transition.From.ToString(),
            transition.To.ToString(),
            transition.OccurredAtUtc),
            cancellationToken);
        return job;
    }

    public async Task<Job> CompleteAsync(Guid jobId, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var job = await _dbContext.Jobs.FirstOrDefaultAsync(
            x => x.Id == jobId && x.OrganizationId == organizationId,
            cancellationToken) ?? throw new NotFoundException("Job not found");

        var utcNow = DateTime.UtcNow;
        var transition = _stateMachine.Transition(job, JobStatus.Completed, utcNow);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _eventEmitter.EmitAsync(new StateTransitionEvent(
            nameof(Job),
            job.Id,
            transition.From.ToString(),
            transition.To.ToString(),
            transition.OccurredAtUtc),
            cancellationToken);
        return job;
    }

    public async Task<Job> CancelAsync(Guid jobId, CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var job = await _dbContext.Jobs.FirstOrDefaultAsync(
            x => x.Id == jobId && x.OrganizationId == organizationId,
            cancellationToken) ?? throw new NotFoundException("Job not found");

        var utcNow = DateTime.UtcNow;
        var transition = _stateMachine.Transition(job, JobStatus.Cancelled, utcNow);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _eventEmitter.EmitAsync(new StateTransitionEvent(
            nameof(Job),
            job.Id,
            transition.From.ToString(),
            transition.To.ToString(),
            transition.OccurredAtUtc),
            cancellationToken);
        return job;
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
}