using BtaDemo.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BtaDemo.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<Estimate> Estimates => Set<Estimate>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<Invoice> Invoices => Set<Invoice>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Lead>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.Company).HasMaxLength(200);
            e.Property(x => x.Phone).HasMaxLength(50);
            e.Property(x => x.Email).HasMaxLength(200);
            e.Property(x => x.CreatedAtUtc).IsRequired();
        });

        modelBuilder.Entity<Estimate>(e =>
        {
            e.HasKey(x => x.Id);
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
        });

        modelBuilder.Entity<Job>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Status).IsRequired();
            e.Property(x => x.ScheduledForUtc).IsRequired();
            e.Property(x => x.CreatedAtUtc).IsRequired();
            e.Property(x => x.UpdatedAtUtc).IsRequired();

            e.HasOne(x => x.Lead)
            .WithMany()
            .HasForeignKey(x => x.LeadId)
            .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Estimate)
            .WithMany()
            .HasForeignKey(x => x.EstimateId)
            .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Invoice>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Amount).HasPrecision(12, 2).IsRequired();
            e.Property(x => x.Status).IsRequired();
            e.Property(x => x.CreatedAtUtc).IsRequired();
            e.Property(x => x.UpdatedAtUtc).IsRequired();
            e.Property(x => x.IssuedAtUtc);
            e.Property(x => x.PaidAtUtc);

            e.HasOne(x => x.Job)
            .WithMany()
            .HasForeignKey(x => x.JobId)
            .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
