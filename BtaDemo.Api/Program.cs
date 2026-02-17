using BtaDemo.Api.Data;
using Microsoft.EntityFrameworkCore;
using BtaDemo.Api.Application.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using BtaDemo.Api.Domain.Entities;
using BtaDemo.Api.Application.Events;
using BtaDemo.Api.Domain.StateMachines;
using BtaDemo.Api.Domain.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    DotNetEnv.Env.Load();
}

var connectionString = DotNetEnv.Env.GetString("CONNECTIONSTRINGS__DB");
var jwtKey = DotNetEnv.Env.GetString("JWT__KEY");

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException("JWT signing key is not configured.");
}

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Database connection string is not configured.");
}

builder.Services.AddIdentityCore<ApplicationUser>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireLowercase = false;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddSignInManager()
.AddApiEndpoints();

var jwt = builder.Configuration.GetSection("Jwt");
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwt["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwt["Audience"],
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = key,
        ClockSkew = TimeSpan.FromSeconds(30),
    };
});

builder.Services.AddAuthorization();

builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<LeadService>();
builder.Services.AddScoped<CompanyService>();
builder.Services.AddScoped<EstimateService>();
builder.Services.AddScoped<JobService>();
builder.Services.AddScoped<InvoiceService>();
builder.Services.AddScoped<PipelineService>();
builder.Services.AddScoped<IStateTransitionEventEmitter, LoggingStateTransitionEventEmitter>();
builder.Services.AddSingleton<EstimateStateMachine>();
builder.Services.AddSingleton<JobStateMachine>();
builder.Services.AddSingleton<InvoiceStateMachine>();
builder.Services.AddSingleton<LeadStateMachine>();

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exceptionHandler = context.Features.Get<IExceptionHandlerFeature>();
        if (exceptionHandler?.Error is null)
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            return;
        }

        var (statusCode, title) = exceptionHandler.Error switch
        {
            ValidationException => (StatusCodes.Status400BadRequest, "Validation error"),
            NotFoundException => (StatusCodes.Status404NotFound, "Not found"),
            ConflictException => (StatusCodes.Status409Conflict, "Conflict"),
            ArgumentException => (StatusCodes.Status400BadRequest, "Validation error"),
            _ => (StatusCodes.Status500InternalServerError, "Unexpected error")
        };

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = exceptionHandler.Error.Message
        };

        await context.Response.WriteAsJsonAsync(problem);
    });
});

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles();

// app.UseHttpsRedirection();
app.MapControllers();
app.Run();
