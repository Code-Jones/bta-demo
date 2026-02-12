using BtaDemo.Api.Data;
using Microsoft.EntityFrameworkCore;
using BtaDemo.Api.Application.Services;
using BtaDemo.Api.Domain.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("Db")));
builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<LeadService>();
builder.Services.AddScoped<EstimateService>();
builder.Services.AddScoped<JobService>();
builder.Services.AddScoped<InvoiceService>();

builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.MapControllers();
app.Run();
