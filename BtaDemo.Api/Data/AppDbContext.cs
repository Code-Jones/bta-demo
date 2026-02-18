using BtaDemo.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace BtaDemo.Api.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Estimate> Estimates => Set<Estimate>();
    public DbSet<EstimateLineItem> EstimateLineItems => Set<EstimateLineItem>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<JobMilestone> JobMilestones => Set<JobMilestone>();
    public DbSet<JobExpense> JobExpenses => Set<JobExpense>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceLineItem> InvoiceLineItems => Set<InvoiceLineItem>();
    public DbSet<TaxLine> TaxLines => Set<TaxLine>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ApplicationUser>(e =>
        {
            e.Property(x => x.FirstName).HasMaxLength(100).IsRequired();
            e.Property(x => x.LastName).HasMaxLength(100).IsRequired();
            e.Property(x => x.OrganizationId).IsRequired();
            e.Property(x => x.IsCompanyAdmin).IsRequired();
            e.HasOne(x => x.Organization)
                .WithMany()
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Organization>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.CreatedAtUtc).IsRequired();
            e.Property(x => x.UpdatedAtUtc).IsRequired();
        });

        modelBuilder.Entity<Lead>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.OrganizationId).IsRequired();
            e.Property(x => x.Company).HasMaxLength(200);
            e.Property(x => x.Phone).HasMaxLength(50);
            e.Property(x => x.Email).HasMaxLength(200);
            e.Property(x => x.AddressLine1).HasMaxLength(200);
            e.Property(x => x.AddressLine2).HasMaxLength(200);
            e.Property(x => x.City).HasMaxLength(100);
            e.Property(x => x.State).HasMaxLength(100);
            e.Property(x => x.PostalCode).HasMaxLength(20);
            e.Property(x => x.LeadSource).HasMaxLength(100);
            e.Property(x => x.ProjectType).HasMaxLength(100);
            e.Property(x => x.EstimatedValue).HasPrecision(12, 2);
            e.Property(x => x.Notes).HasMaxLength(2000);
            e.Property(x => x.Status).IsRequired();
            e.Property(x => x.IsDeleted).IsRequired();
            e.Property(x => x.CreatedAtUtc).IsRequired();
            e.Property(x => x.UpdatedAtUtc).IsRequired();
            e.Property(x => x.LostAtUtc);
            e.Property(x => x.DeletedAtUtc);

            e.HasOne(x => x.CompanyEntity)
                .WithMany()
                .HasForeignKey(x => x.CompanyId)
                .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(x => x.Organization)
                .WithMany()
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Company>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.OrganizationId).IsRequired();
            e.Property(x => x.Phone).HasMaxLength(50);
            e.Property(x => x.Email).HasMaxLength(200);
            e.Property(x => x.Website).HasMaxLength(200);
            e.Property(x => x.Notes).HasMaxLength(2000);
            e.Property(x => x.AddressLine1).HasMaxLength(200);
            e.Property(x => x.AddressLine2).HasMaxLength(200);
            e.Property(x => x.City).HasMaxLength(100);
            e.Property(x => x.State).HasMaxLength(50);
            e.Property(x => x.PostalCode).HasMaxLength(20);
            e.Property(x => x.TaxId).HasMaxLength(100);
            e.Property(x => x.IsDeleted).IsRequired();
            e.Property(x => x.DeletedAtUtc);
            e.Property(x => x.CreatedAtUtc).IsRequired();
            e.Property(x => x.UpdatedAtUtc).IsRequired();
            e.HasOne(x => x.Organization)
                .WithMany()
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Estimate>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.OrganizationId).IsRequired();
            e.Property(x => x.Amount).HasPrecision(12, 2).IsRequired();
            e.Property(x => x.Status).IsRequired();
            e.Property(x => x.CreatedAtUtc).IsRequired();
            e.Property(x => x.UpdatedAtUtc).IsRequired();
            e.Property(x => x.SentAtUtc);
            e.Property(x => x.AcceptedAtUtc);
            e.Property(x => x.RejectedAtUtc);

            e.HasOne(x => x.Lead)
                .WithMany()
                .HasForeignKey(x => x.LeadId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne<Organization>()
                .WithMany()
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<EstimateLineItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Description).HasMaxLength(200).IsRequired();
            e.Property(x => x.Quantity).HasPrecision(12, 2).IsRequired();
            e.Property(x => x.UnitPrice).HasPrecision(12, 2).IsRequired();
            e.Property(x => x.IsTaxLine).IsRequired();
            e.Property(x => x.TaxRate).HasPrecision(7, 4);
            e.Property(x => x.SortOrder).IsRequired();
            e.HasOne(x => x.Estimate)
                .WithMany(x => x.LineItems)
                .HasForeignKey(x => x.EstimateId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Job>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.OrganizationId).IsRequired();
            e.Property(x => x.Status).IsRequired();
            e.Property(x => x.StartAtUtc).IsRequired();
            e.Property(x => x.EstimatedEndAtUtc).IsRequired();
            e.Property(x => x.CreatedAtUtc).IsRequired();
            e.Property(x => x.UpdatedAtUtc).IsRequired();
            e.Property(x => x.StartedAtUtc);
            e.Property(x => x.CompletedAtUtc);
            e.Property(x => x.CancelledAtUtc);
            e.HasOne(x => x.Lead)
                .WithMany()
                .HasForeignKey(x => x.LeadId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Estimate)
                .WithMany()
                .HasForeignKey(x => x.EstimateId)
                .OnDelete(DeleteBehavior.SetNull);
            e.HasOne<Organization>()
                .WithMany()
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<JobMilestone>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.Notes).HasMaxLength(2000);
            e.Property(x => x.Status).IsRequired();
            e.Property(x => x.OccurredAtUtc).IsRequired();
            e.Property(x => x.SortOrder).IsRequired();
            e.Property(x => x.CreatedAtUtc).IsRequired();
            e.Property(x => x.UpdatedAtUtc).IsRequired();
            e.HasOne(x => x.Job)
                .WithMany(x => x.Milestones)
                .HasForeignKey(x => x.JobId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<JobExpense>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.OrganizationId).IsRequired();
            e.Property(x => x.Vendor).HasMaxLength(200).IsRequired();
            e.Property(x => x.Category).HasMaxLength(120);
            e.Property(x => x.Amount).HasPrecision(12, 2).IsRequired();
            e.Property(x => x.SpentAtUtc).IsRequired();
            e.Property(x => x.Notes).HasMaxLength(2000);
            e.Property(x => x.ReceiptUrl).HasMaxLength(500);
            e.Property(x => x.CreatedAtUtc).IsRequired();
            e.Property(x => x.UpdatedAtUtc).IsRequired();
            e.HasOne(x => x.Job)
                .WithMany(x => x.Expenses)
                .HasForeignKey(x => x.JobId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne<Organization>()
                .WithMany()
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Invoice>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.OrganizationId).IsRequired();
            e.Property(x => x.Amount).HasPrecision(12, 2).IsRequired();
            e.Property(x => x.Status).IsRequired();
            e.Property(x => x.Notes).HasMaxLength(2000);
            e.Property(x => x.CreatedAtUtc).IsRequired();
            e.Property(x => x.UpdatedAtUtc).IsRequired();
            e.Property(x => x.IssuedAtUtc);
            e.Property(x => x.DueAtUtc);
            e.Property(x => x.PaidAtUtc);
            e.Property(x => x.OverdueAtUtc);

            e.HasOne(x => x.Job)
                .WithMany()
                .HasForeignKey(x => x.JobId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne<Organization>()
                .WithMany()
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<InvoiceLineItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Description).HasMaxLength(200).IsRequired();
            e.Property(x => x.Quantity).HasPrecision(12, 2).IsRequired();
            e.Property(x => x.UnitPrice).HasPrecision(12, 2).IsRequired();
            e.Property(x => x.IsTaxLine).IsRequired();
            e.Property(x => x.TaxRate).HasPrecision(7, 4);
            e.Property(x => x.SortOrder).IsRequired();
            e.HasOne(x => x.Invoice)
                .WithMany(x => x.LineItems)
                .HasForeignKey(x => x.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TaxLine>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Label).HasMaxLength(120).IsRequired();
            e.Property(x => x.Rate).HasPrecision(7, 4).IsRequired();
            e.HasOne(x => x.Lead)
                .WithMany(x => x.TaxLines)
                .HasForeignKey(x => x.LeadId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Company)
                .WithMany(x => x.TaxLines)
                .HasForeignKey(x => x.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
