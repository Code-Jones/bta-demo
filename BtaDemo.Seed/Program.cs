using BtaDemo.Api.Data;
using BtaDemo.Api.Domain.Entities;
using BtaDemo.Api.Domain.Enum;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

var connectionString = Environment.GetEnvironmentVariable("CONNECTIONSTRINGS__DB");
if (string.IsNullOrWhiteSpace(connectionString))
{
    Console.WriteLine("Missing CONNECTIONSTRINGS__DB environment variable.");
    return;
}

var services = new ServiceCollection();
services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, npgsql => npgsql.MigrationsAssembly("BtaDemo.Api")));
services.AddIdentityCore<ApplicationUser>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireLowercase = false;
    options.User.RequireUniqueEmail = true;
}).AddEntityFrameworkStores<AppDbContext>();

var provider = services.BuildServiceProvider();
using var scope = provider.CreateScope();
var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

await EnsureDemoUserAsync(userManager);
await SeedAsync(dbContext, DateTime.UtcNow);

static async Task EnsureDemoUserAsync(UserManager<ApplicationUser> userManager)
{
    var email = GetEnv("DEMO_USER_EMAIL", "demo@bta.local");
    var password = GetEnv("DEMO_USER_PASSWORD", "Demo1234");
    var firstName = GetEnv("DEMO_USER_FIRSTNAME", "Demo");
    var lastName = GetEnv("DEMO_USER_LASTNAME", "User");
    var company = GetEnv("DEMO_USER_COMPANY", "BrightBuild");

    var existing = await userManager.FindByEmailAsync(email);
    if (existing is null)
    {
        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            Company = company
        };

        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to create demo user: {errors}");
        }

        Console.WriteLine($"Created demo user {email}");
        return;
    }

    existing.FirstName = firstName;
    existing.LastName = lastName;
    existing.Company = company;
    existing.UserName = email;
    existing.Email = email;

    var updateResult = await userManager.UpdateAsync(existing);
    if (!updateResult.Succeeded)
    {
        var errors = string.Join(", ", updateResult.Errors.Select(e => e.Description));
        throw new InvalidOperationException($"Failed to update demo user: {errors}");
    }

    var token = await userManager.GeneratePasswordResetTokenAsync(existing);
    var resetResult = await userManager.ResetPasswordAsync(existing, token, password);
    if (!resetResult.Succeeded)
    {
        var errors = string.Join(", ", resetResult.Errors.Select(e => e.Description));
        throw new InvalidOperationException($"Failed to reset demo user password: {errors}");
    }

    Console.WriteLine($"Updated demo user {email}");
}

static async Task SeedAsync(AppDbContext dbContext, DateTime utcNow)
{
    var hasData = await dbContext.Leads.AnyAsync()
        || await dbContext.Companies.AnyAsync()
        || await dbContext.Estimates.AnyAsync()
        || await dbContext.Jobs.AnyAsync()
        || await dbContext.Invoices.AnyAsync();
    if (hasData)
    {
        Console.WriteLine("Database already contains data; seed will append.");
    }

    var companies = BuildCompanies(utcNow);
    var leads = BuildLeads(utcNow, companies);
    var estimates = BuildEstimates(utcNow, leads);
    var jobs = BuildJobs(utcNow, leads, estimates);
    var invoices = BuildInvoices(utcNow, jobs);

    dbContext.Companies.AddRange(companies);
    dbContext.Leads.AddRange(leads);
    dbContext.Estimates.AddRange(estimates);
    dbContext.Jobs.AddRange(jobs);
    dbContext.Invoices.AddRange(invoices);

    await dbContext.SaveChangesAsync();

    Console.WriteLine($"Seeded {companies.Count} companies");
    Console.WriteLine($"Seeded {leads.Count} leads");
    Console.WriteLine($"Seeded {estimates.Count} estimates");
    Console.WriteLine($"Seeded {jobs.Count} jobs");
    Console.WriteLine($"Seeded {invoices.Count} invoices");
}

static List<Company> BuildCompanies(DateTime utcNow)
{
    var companies = new List<Company>
    {
        new()
        {
            Name = "Northwind Roofing",
            Phone = "555-0101",
            Email = "ops@northwindroofing.com",
            Website = "https://northwindroofing.example",
            Notes = "Premium roofing with historic preservation experience.",
            AddressLine1 = "1200 Sequoia Ave",
            City = "Portland",
            State = "OR",
            PostalCode = "97205",
            TaxId = "NW-ROOF-1024",
            CreatedAtUtc = utcNow.AddDays(-220),
            UpdatedAtUtc = utcNow.AddDays(-6),
            TaxLines = new List<TaxLine>()
        },
        new()
        {
            Name = "Blue Oak Builders",
            Phone = "555-0199",
            Email = "hello@blueoakbuilders.com",
            Website = "https://blueoak.example",
            Notes = "Custom residential builds with a focus on energy efficiency.",
            AddressLine1 = "88 Harbor St",
            City = "Seattle",
            State = "WA",
            PostalCode = "98101",
            TaxId = "BOB-7744",
            CreatedAtUtc = utcNow.AddDays(-120),
            UpdatedAtUtc = utcNow.AddDays(-9),
            TaxLines = new List<TaxLine>()
        },
        new()
        {
            Name = "Summit Solar",
            Phone = "555-0177",
            Email = "install@summitsolar.com",
            Website = "https://summitsolar.example",
            Notes = "Commercial solar installs and maintenance contracts.",
            AddressLine1 = "455 Sunridge Blvd",
            City = "Sacramento",
            State = "CA",
            PostalCode = "95814",
            TaxId = "SUM-3301",
            CreatedAtUtc = utcNow.AddDays(-90),
            UpdatedAtUtc = utcNow.AddDays(-18),
            TaxLines = new List<TaxLine>()
        },
        new()
        {
            Name = "Maple & Stone Renovations",
            Phone = "555-0138",
            Email = "projects@maplestone.com",
            Website = "https://maplestone.example",
            Notes = "Interior remodeling and historic rehab projects.",
            AddressLine1 = "302 Market St",
            City = "Boise",
            State = "ID",
            PostalCode = "83702",
            TaxId = "MSR-8920",
            CreatedAtUtc = utcNow.AddDays(-75),
            UpdatedAtUtc = utcNow.AddDays(-12),
            TaxLines = new List<TaxLine>()
        },
        new()
        {
            Name = "Harborview Property Group",
            Phone = "555-0144",
            Email = "admin@harborviewpg.com",
            Website = "https://harborviewpg.example",
            Notes = "Multi-property portfolio with recurring maintenance work.",
            AddressLine1 = "19 Dockside Dr",
            City = "San Diego",
            State = "CA",
            PostalCode = "92101",
            TaxId = "HPG-5012",
            CreatedAtUtc = utcNow.AddDays(-50),
            UpdatedAtUtc = utcNow.AddDays(-4),
            TaxLines = new List<TaxLine>()
        },
        new()
        {
            Name = "Atlas HVAC",
            Phone = "555-0166",
            Email = "dispatch@atlashvac.com",
            Website = "https://atlashvac.example",
            Notes = "Commercial HVAC service with 24/7 response.",
            AddressLine1 = "77 Industrial Way",
            City = "Phoenix",
            State = "AZ",
            PostalCode = "85004",
            TaxId = "ATLAS-2208",
            CreatedAtUtc = utcNow.AddDays(-40),
            UpdatedAtUtc = utcNow.AddDays(-2),
            TaxLines = new List<TaxLine>()
        }
    };

    var northwind = companies[0];
    var summit = companies[2];
    var maple = companies[3];

    northwind.TaxLines.AddRange(new[]
    {
        new TaxLine { Label = "State sales tax", Rate = 7.25m, CompanyId = northwind.Id, Company = northwind },
        new TaxLine { Label = "City surcharge", Rate = 1.50m, CompanyId = northwind.Id, Company = northwind }
    });
    summit.TaxLines.Add(new TaxLine { Label = "Clean energy tax", Rate = 4.20m, CompanyId = summit.Id, Company = summit });
    maple.TaxLines.Add(new TaxLine { Label = "State sales tax", Rate = 6.75m, CompanyId = maple.Id, Company = maple });

    return companies;
}

static List<Lead> BuildLeads(DateTime utcNow, IReadOnlyList<Company> companies)
{
    Company CompanyByName(string name) => companies.First(x => x.Name == name);

    var blueOak = CompanyByName("Blue Oak Builders");
    var harborview = CompanyByName("Harborview Property Group");
    var northwind = CompanyByName("Northwind Roofing");
    var summit = CompanyByName("Summit Solar");
    var maple = CompanyByName("Maple & Stone Renovations");
    var atlas = CompanyByName("Atlas HVAC");

    var leads = new List<Lead>
    {
        new()
        {
            Name = "Ava Thompson",
            Company = blueOak.Name,
            CompanyId = blueOak.Id,
            CompanyEntity = blueOak,
            Phone = "555-1001",
            Email = "ava.thompson@example.com",
            AddressLine1 = "742 Evergreen Ter",
            City = "Seattle",
            State = "WA",
            PostalCode = "98109",
            LeadSource = "Referral",
            ProjectType = "Roof replacement",
            EstimatedValue = 18000,
            Notes = "Wants a cedar look without the maintenance.",
            Status = LeadStatus.New,
            CreatedAtUtc = utcNow.AddDays(-2),
            UpdatedAtUtc = utcNow.AddDays(-2),
            TaxLines = new List<TaxLine>()
        },
        new()
        {
            Name = "Marcus Lee",
            Company = "Lee & Sons",
            Phone = "555-1002",
            Email = "marcus.lee@example.com",
            AddressLine1 = "16 Pine Loop",
            City = "Tacoma",
            State = "WA",
            PostalCode = "98402",
            LeadSource = "Website",
            ProjectType = "Kitchen remodel",
            EstimatedValue = 9500,
            Notes = "Interested in a fast turnaround.",
            Status = LeadStatus.New,
            CreatedAtUtc = utcNow.AddDays(-5),
            UpdatedAtUtc = utcNow.AddDays(-5),
            TaxLines = new List<TaxLine>()
        },
        new()
        {
            Name = "Sofia Ramirez",
            Phone = "555-1003",
            Email = "sofia.ramirez@example.com",
            AddressLine1 = "903 Canyon Rd",
            City = "Portland",
            State = "OR",
            PostalCode = "97204",
            LeadSource = "Event",
            ProjectType = "Solar retrofit",
            EstimatedValue = 24000,
            Notes = "Needs financing options.",
            Status = LeadStatus.New,
            CreatedAtUtc = utcNow.AddDays(-1),
            UpdatedAtUtc = utcNow.AddDays(-1),
            TaxLines = new List<TaxLine>()
        },
        new()
        {
            Name = "Harper Chen",
            Company = harborview.Name,
            CompanyId = harborview.Id,
            CompanyEntity = harborview,
            Phone = "555-1004",
            Email = "harper.chen@example.com",
            AddressLine1 = "411 Wharf Ave",
            City = "San Diego",
            State = "CA",
            PostalCode = "92101",
            LeadSource = "Referral",
            ProjectType = "Unit repaint",
            EstimatedValue = 4200,
            Notes = "Budget freeze until next quarter.",
            Status = LeadStatus.Lost,
            CreatedAtUtc = utcNow.AddDays(-15),
            UpdatedAtUtc = utcNow.AddDays(-12),
            LostAtUtc = utcNow.AddDays(-12),
            TaxLines = new List<TaxLine>()
        },
        new()
        {
            Name = "Jamal Ortiz",
            Company = atlas.Name,
            CompanyId = atlas.Id,
            CompanyEntity = atlas,
            Phone = "555-1005",
            Email = "jamal.ortiz@example.com",
            AddressLine1 = "901 Commerce Pl",
            City = "Phoenix",
            State = "AZ",
            PostalCode = "85004",
            LeadSource = "Cold outreach",
            ProjectType = "HVAC maintenance",
            EstimatedValue = 7800,
            Notes = "Lost to incumbent vendor.",
            Status = LeadStatus.Lost,
            CreatedAtUtc = utcNow.AddDays(-40),
            UpdatedAtUtc = utcNow.AddDays(-32),
            LostAtUtc = utcNow.AddDays(-32),
            TaxLines = new List<TaxLine>()
        },
        new()
        {
            Name = "Priya Patel",
            Company = northwind.Name,
            CompanyId = northwind.Id,
            CompanyEntity = northwind,
            Phone = "555-1006",
            Email = "priya.patel@example.com",
            AddressLine1 = "77 Bay View Rd",
            City = "Portland",
            State = "OR",
            PostalCode = "97201",
            LeadSource = "Partner",
            ProjectType = "Roof inspection",
            EstimatedValue = 6200,
            Notes = "Looking for preventative maintenance plan.",
            Status = LeadStatus.Converted,
            CreatedAtUtc = utcNow.AddDays(-8),
            UpdatedAtUtc = utcNow.AddDays(-7),
            TaxLines = new List<TaxLine>()
        },
        new()
        {
            Name = "Ethan Brooks",
            Company = maple.Name,
            CompanyId = maple.Id,
            CompanyEntity = maple,
            Phone = "555-1007",
            Email = "ethan.brooks@example.com",
            AddressLine1 = "120 Aspen Ct",
            City = "Boise",
            State = "ID",
            PostalCode = "83706",
            LeadSource = "Website",
            ProjectType = "Bathroom remodel",
            EstimatedValue = 15500,
            Notes = "Wants premium fixtures.",
            Status = LeadStatus.Converted,
            CreatedAtUtc = utcNow.AddDays(-18),
            UpdatedAtUtc = utcNow.AddDays(-18),
            TaxLines = new List<TaxLine>()
        },
        new()
        {
            Name = "Lila Nguyen",
            Company = summit.Name,
            CompanyId = summit.Id,
            CompanyEntity = summit,
            Phone = "555-1008",
            Email = "lila.nguyen@example.com",
            AddressLine1 = "500 Sierra Way",
            City = "Sacramento",
            State = "CA",
            PostalCode = "95816",
            LeadSource = "Inbound",
            ProjectType = "Solar array",
            EstimatedValue = 34000,
            Notes = "Needs evening install scheduling.",
            Status = LeadStatus.Converted,
            CreatedAtUtc = utcNow.AddDays(-25),
            UpdatedAtUtc = utcNow.AddDays(-24),
            TaxLines = new List<TaxLine>()
        },
        new()
        {
            Name = "Noah King",
            Company = blueOak.Name,
            CompanyId = blueOak.Id,
            CompanyEntity = blueOak,
            Phone = "555-1009",
            Email = "noah.king@example.com",
            AddressLine1 = "9 Spruce Cir",
            City = "Seattle",
            State = "WA",
            PostalCode = "98104",
            LeadSource = "Referral",
            ProjectType = "ADU build",
            EstimatedValue = 68000,
            Notes = "Seeking phased construction plan.",
            Status = LeadStatus.Converted,
            CreatedAtUtc = utcNow.AddDays(-48),
            UpdatedAtUtc = utcNow.AddDays(-43),
            TaxLines = new List<TaxLine>()
        },
        new()
        {
            Name = "Mia Johnson",
            Company = harborview.Name,
            CompanyId = harborview.Id,
            CompanyEntity = harborview,
            Phone = "555-1010",
            Email = "mia.johnson@example.com",
            AddressLine1 = "310 Marina Dr",
            City = "San Diego",
            State = "CA",
            PostalCode = "92103",
            LeadSource = "Account",
            ProjectType = "Unit turnover",
            EstimatedValue = 9800,
            Notes = "Needs compliance documentation.",
            Status = LeadStatus.Converted,
            CreatedAtUtc = utcNow.AddDays(-30),
            UpdatedAtUtc = utcNow.AddDays(-26),
            TaxLines = new List<TaxLine>()
        },
        new()
        {
            Name = "Jordan Wells",
            Company = "Crescent Estates",
            Phone = "555-1011",
            Email = "jordan.wells@example.com",
            AddressLine1 = "14 Grove St",
            City = "Reno",
            State = "NV",
            PostalCode = "89501",
            LeadSource = "Outbound",
            ProjectType = "Exterior repaint",
            EstimatedValue = 21000,
            Notes = "Needs evening access to property.",
            Status = LeadStatus.Converted,
            CreatedAtUtc = utcNow.AddDays(-9),
            UpdatedAtUtc = utcNow.AddDays(-7),
            TaxLines = new List<TaxLine>()
        },
        new()
        {
            Name = "Riley Park",
            Phone = "555-1012",
            Email = "riley.park@example.com",
            AddressLine1 = "902 Elm St",
            City = "Salem",
            State = "OR",
            PostalCode = "97301",
            LeadSource = "Event",
            ProjectType = "Window retrofit",
            EstimatedValue = 12400,
            Notes = "Wants low-e glass quote.",
            Status = LeadStatus.Converted,
            CreatedAtUtc = utcNow.AddDays(-28),
            UpdatedAtUtc = utcNow.AddDays(-2),
            TaxLines = new List<TaxLine>()
        },
        new()
        {
            Name = "Casey Brooks",
            Company = northwind.Name,
            CompanyId = northwind.Id,
            CompanyEntity = northwind,
            Phone = "555-1013",
            Email = "casey.brooks@example.com",
            AddressLine1 = "48 Ridge Ave",
            City = "Portland",
            State = "OR",
            PostalCode = "97206",
            LeadSource = "Partner",
            ProjectType = "Gutter replacement",
            EstimatedValue = 5600,
            Notes = "Wants a rapid install.",
            Status = LeadStatus.Converted,
            CreatedAtUtc = utcNow.AddDays(-16),
            UpdatedAtUtc = utcNow.AddDays(-14),
            TaxLines = new List<TaxLine>()
        },
        new()
        {
            Name = "Taylor Reed",
            Company = summit.Name,
            CompanyId = summit.Id,
            CompanyEntity = summit,
            Phone = "555-1014",
            Email = "taylor.reed@example.com",
            AddressLine1 = "810 Panorama Rd",
            City = "Sacramento",
            State = "CA",
            PostalCode = "95818",
            LeadSource = "Inbound",
            ProjectType = "Battery backup",
            EstimatedValue = 27000,
            Notes = "Held budget for next fiscal year.",
            Status = LeadStatus.Converted,
            CreatedAtUtc = utcNow.AddDays(-42),
            UpdatedAtUtc = utcNow.AddDays(-38),
            TaxLines = new List<TaxLine>()
        },
        new()
        {
            Name = "Morgan Ellis",
            Company = maple.Name,
            CompanyId = maple.Id,
            CompanyEntity = maple,
            Phone = "555-1015",
            Email = "morgan.ellis@example.com",
            AddressLine1 = "515 Birch Ln",
            City = "Boise",
            State = "ID",
            PostalCode = "83702",
            LeadSource = "Referral",
            ProjectType = "Basement finish",
            EstimatedValue = 19600,
            Notes = "Needs proof of insurance.",
            Status = LeadStatus.Converted,
            CreatedAtUtc = utcNow.AddDays(-22),
            UpdatedAtUtc = utcNow.AddDays(-19),
            TaxLines = new List<TaxLine>()
        }
    };

    var ava = leads[0];
    var priya = leads[5];
    var riley = leads[11];

    ava.TaxLines.Add(new TaxLine { Label = "County tax", Rate = 2.25m, LeadId = ava.Id, Lead = ava });
    priya.TaxLines.Add(new TaxLine { Label = "Local district tax", Rate = 1.75m, LeadId = priya.Id, Lead = priya });
    riley.TaxLines.Add(new TaxLine { Label = "Special handling tax", Rate = 3.00m, LeadId = riley.Id, Lead = riley });

    return leads;
}

static List<Estimate> BuildEstimates(DateTime utcNow, IReadOnlyList<Lead> leads)
{
    Lead LeadByName(string name) => leads.First(x => x.Name == name);

    var estimates = new List<Estimate>
    {
        BuildEstimate(
            LeadByName("Ethan Brooks"),
            "Primary bath remodel",
            utcNow.AddDays(-17),
            EstimateStatus.Draft,
            new[]
            {
                ("Demo and prep", 1m, 1800m),
                ("Tile install", 120m, 12.5m),
                ("Fixture package", 1m, 3200m)
            },
            6.75m),
        BuildEstimate(
            LeadByName("Priya Patel"),
            "Annual roof inspection",
            utcNow.AddDays(-7),
            EstimateStatus.Draft,
            new[]
            {
                ("Inspection", 1m, 450m),
                ("Minor repairs allowance", 1m, 900m)
            },
            7.25m),
        BuildEstimate(
            LeadByName("Lila Nguyen"),
            "Solar install phase 1",
            utcNow.AddDays(-13),
            EstimateStatus.Sent,
            new[]
            {
                ("Site survey", 1m, 1200m),
                ("Panel install", 24m, 850m),
                ("Inverter setup", 1m, 4200m)
            },
            4.20m,
            statusAtUtc: utcNow.AddDays(-12)),
        BuildEstimate(
            LeadByName("Noah King"),
            "ADU preliminary scope",
            utcNow.AddDays(-46),
            EstimateStatus.Sent,
            new[]
            {
                ("Design kickoff", 1m, 3200m),
                ("Permitting", 1m, 5800m),
                ("Site prep", 1m, 6400m)
            },
            null,
            statusAtUtc: utcNow.AddDays(-43)),
        BuildEstimate(
            LeadByName("Mia Johnson"),
            "Unit turnover refresh",
            utcNow.AddDays(-28),
            EstimateStatus.Accepted,
            new[]
            {
                ("Paint", 1m, 2500m),
                ("Flooring", 1m, 3200m),
                ("Cleanup", 1m, 600m)
            },
            1.50m,
            statusAtUtc: utcNow.AddDays(-26)),
        BuildEstimate(
            LeadByName("Jordan Wells"),
            "Exterior repaint",
            utcNow.AddDays(-9),
            EstimateStatus.Accepted,
            new[]
            {
                ("Prep work", 1m, 2400m),
                ("Paint labor", 1m, 11400m),
                ("Materials", 1m, 1200m)
            },
            2.50m,
            statusAtUtc: utcNow.AddDays(-7)),
        BuildEstimate(
            LeadByName("Riley Park"),
            "Window retrofit",
            utcNow.AddDays(-3),
            EstimateStatus.Accepted,
            new[]
            {
                ("Window units", 12m, 550m),
                ("Install labor", 1m, 2400m)
            },
            3.00m,
            statusAtUtc: utcNow.AddDays(-2)),
        BuildEstimate(
            LeadByName("Casey Brooks"),
            "Gutter replacement",
            utcNow.AddDays(-15),
            EstimateStatus.Accepted,
            new[]
            {
                ("Gutter material", 1m, 1800m),
                ("Install labor", 1m, 2100m)
            },
            7.25m,
            statusAtUtc: utcNow.AddDays(-14)),
        BuildEstimate(
            LeadByName("Taylor Reed"),
            "Battery backup",
            utcNow.AddDays(-41),
            EstimateStatus.Rejected,
            new[]
            {
                ("Battery bank", 1m, 14200m),
                ("Electrical tie-in", 1m, 3200m)
            },
            4.20m,
            statusAtUtc: utcNow.AddDays(-38)),
        BuildEstimate(
            LeadByName("Morgan Ellis"),
            "Basement finish",
            utcNow.AddDays(-21),
            EstimateStatus.Rejected,
            new[]
            {
                ("Framing", 1m, 5200m),
                ("Drywall", 1m, 3800m),
                ("Electrical", 1m, 2600m)
            },
            6.75m,
            statusAtUtc: utcNow.AddDays(-19))
    };

    return estimates;
}

static List<Job> BuildJobs(DateTime utcNow, IReadOnlyList<Lead> leads, IReadOnlyList<Estimate> estimates)
{
    Estimate EstimateByLead(string leadName) => estimates.First(x => x.Lead?.Name == leadName);
    Lead LeadByName(string name) => leads.First(x => x.Name == name);

    var jobs = new List<Job>
    {
        BuildJob(
            utcNow,
            LeadByName("Mia Johnson"),
            EstimateByLead("Mia Johnson"),
            "Unit turnover refresh",
            utcNow.AddDays(3),
            utcNow.AddDays(12),
            JobStatus.Scheduled,
            milestones: new (string Title, MilestoneStatus Status, int OffsetDays, string? Notes)[]
            {
                ("Keys pickup", MilestoneStatus.Pending, 0, "Coordinate with leasing office"),
                ("Painting", MilestoneStatus.Pending, 2, null),
                ("Final walkthrough", MilestoneStatus.Pending, 9, null)
            },
            expenses: new (string Vendor, string? Category, decimal Amount, DateTime SpentAtUtc, string? Notes, string? ReceiptUrl)[]
            {
                ("PrimeCo Paint", "Materials", 420m, utcNow.AddDays(-1), "Primer + paint order", "https://receipts.example/paint-01")
            }),
        BuildJob(
            utcNow,
            LeadByName("Jordan Wells"),
            EstimateByLead("Jordan Wells"),
            "Exterior repaint",
            utcNow.AddDays(-6),
            utcNow.AddDays(6),
            JobStatus.InProgress,
            milestones: new (string Title, MilestoneStatus Status, int OffsetDays, string? Notes)[]
            {
                ("Pressure wash", MilestoneStatus.Completed, -6, null),
                ("Prep and masking", MilestoneStatus.Completed, -4, "Completed 3 units"),
                ("Paint coats", MilestoneStatus.Pending, 2, "Waiting on weather window")
            },
            expenses: new (string Vendor, string? Category, decimal Amount, DateTime SpentAtUtc, string? Notes, string? ReceiptUrl)[]
            {
                ("ColorSource", "Materials", 680m, utcNow.AddDays(-5), "Exterior paint", "https://receipts.example/paint-02"),
                ("Lift Rental", "Equipment", 350m, utcNow.AddDays(-4), "Scissor lift", null)
            }),
        BuildJob(
            utcNow,
            LeadByName("Riley Park"),
            EstimateByLead("Riley Park"),
            "Window retrofit",
            utcNow.AddDays(-12),
            utcNow.AddDays(-2),
            JobStatus.Completed,
            milestones: new (string Title, MilestoneStatus Status, int OffsetDays, string? Notes)[]
            {
                ("Delivery", MilestoneStatus.Completed, -12, "Windows delivered"),
                ("Install", MilestoneStatus.Completed, -8, null),
                ("Seal and test", MilestoneStatus.Completed, -3, "Air leakage within spec")
            },
            expenses: new (string Vendor, string? Category, decimal Amount, DateTime SpentAtUtc, string? Notes, string? ReceiptUrl)[]
            {
                ("Glazer Pro", "Materials", 1850m, utcNow.AddDays(-11), "Window units", "https://receipts.example/windows-01"),
                ("Sealant Depot", "Materials", 180m, utcNow.AddDays(-7), "Sealants", null)
            }),
        BuildJob(
            utcNow,
            LeadByName("Casey Brooks"),
            EstimateByLead("Casey Brooks"),
            "Gutter replacement",
            utcNow.AddDays(-10),
            utcNow.AddDays(4),
            JobStatus.Cancelled,
            milestones: new (string Title, MilestoneStatus Status, int OffsetDays, string? Notes)[]
            {
                ("Site inspection", MilestoneStatus.Completed, -10, null),
                ("Material pickup", MilestoneStatus.Pending, -8, null),
                ("Install", MilestoneStatus.Pending, -6, null)
            },
            expenses: new (string Vendor, string? Category, decimal Amount, DateTime SpentAtUtc, string? Notes, string? ReceiptUrl)[]
            {
                ("Gutter Supply", "Materials", 260m, utcNow.AddDays(-9), "Downspouts", null)
            })
    };

    return jobs;
}

static List<Invoice> BuildInvoices(DateTime utcNow, IReadOnlyList<Job> jobs)
{
    Job JobByLead(string leadName) => jobs.First(x => x.Lead?.Name == leadName);

    var invoices = new List<Invoice>
    {
        BuildInvoice(
            JobByLead("Mia Johnson"),
            "Deposit due before start",
            utcNow.AddDays(-5),
            InvoiceStatus.Draft,
            new (string Description, decimal Quantity, decimal UnitPrice)[]
            {
                ("Paint", 1m, 2500m),
                ("Flooring", 1m, 3200m)
            },
            1.50m),
        BuildInvoice(
            JobByLead("Jordan Wells"),
            "Progress billing",
            utcNow.AddDays(-6),
            InvoiceStatus.Issued,
            new (string Description, decimal Quantity, decimal UnitPrice)[]
            {
                ("Prep work", 1m, 2400m),
                ("Paint labor", 1m, 11400m)
            },
            2.50m,
            issuedAtUtc: utcNow.AddDays(-5),
            dueAtUtc: utcNow.AddDays(12)),
        BuildInvoice(
            JobByLead("Riley Park"),
            "Final invoice",
            utcNow.AddDays(-12),
            InvoiceStatus.Paid,
            new (string Description, decimal Quantity, decimal UnitPrice)[]
            {
                ("Window units", 12m, 550m),
                ("Install labor", 1m, 2400m)
            },
            3.00m,
            issuedAtUtc: utcNow.AddDays(-10),
            dueAtUtc: utcNow.AddDays(-1),
            paidAtUtc: utcNow.AddDays(-1)),
        BuildInvoice(
            JobByLead("Casey Brooks"),
            "Materials hold",
            utcNow.AddDays(-9),
            InvoiceStatus.Overdue,
            new (string Description, decimal Quantity, decimal UnitPrice)[]
            {
                ("Gutter material", 1m, 1800m),
                ("Install labor", 1m, 2100m)
            },
            7.25m,
            issuedAtUtc: utcNow.AddDays(-8),
            dueAtUtc: utcNow.AddDays(-2),
            overdueAtUtc: utcNow.AddDays(-1))
    };

    return invoices;
}

static Estimate BuildEstimate(
    Lead lead,
    string description,
    DateTime createdAtUtc,
    EstimateStatus status,
    IReadOnlyList<(string Description, decimal Quantity, decimal UnitPrice)> items,
    decimal? taxRate,
    DateTime? statusAtUtc = null)
{
    var estimate = new Estimate
    {
        LeadId = lead.Id,
        Lead = lead,
        Description = description,
        CreatedAtUtc = createdAtUtc,
        UpdatedAtUtc = createdAtUtc,
        Status = status
    };

    estimate.LineItems = BuildEstimateLineItems(estimate.Id, items, taxRate);
    estimate.Amount = CalculateEstimateTotals(estimate.LineItems).Total;

    var statusTime = statusAtUtc ?? createdAtUtc;
    switch (status)
    {
        case EstimateStatus.Sent:
            estimate.SentAtUtc = statusTime;
            estimate.UpdatedAtUtc = statusTime;
            break;
        case EstimateStatus.Accepted:
            estimate.AcceptedAtUtc = statusTime;
            estimate.UpdatedAtUtc = statusTime;
            break;
        case EstimateStatus.Rejected:
            estimate.RejectedAtUtc = statusTime;
            estimate.UpdatedAtUtc = statusTime;
            break;
    }

    return estimate;
}

static Job BuildJob(
    DateTime utcNow,
    Lead lead,
    Estimate estimate,
    string description,
    DateTime startAtUtc,
    DateTime estimatedEndAtUtc,
    JobStatus status,
    IReadOnlyList<(string Title, MilestoneStatus Status, int OffsetDays, string? Notes)> milestones,
    IReadOnlyList<(string Vendor, string? Category, decimal Amount, DateTime SpentAtUtc, string? Notes, string? ReceiptUrl)> expenses)
{
    var createdAtUtc = startAtUtc.AddDays(-7);
    if (createdAtUtc > utcNow.AddDays(-1))
    {
        createdAtUtc = utcNow.AddDays(-1);
    }

    var updatedAtUtc = createdAtUtc.AddDays(1);
    if (updatedAtUtc > utcNow)
    {
        updatedAtUtc = utcNow;
    }

    var job = new Job
    {
        LeadId = lead.Id,
        Lead = lead,
        EstimateId = estimate.Id,
        Estimate = estimate,
        Description = description,
        StartAtUtc = startAtUtc,
        EstimatedEndAtUtc = estimatedEndAtUtc,
        Status = status,
        CreatedAtUtc = createdAtUtc,
        UpdatedAtUtc = updatedAtUtc
    };

    if (status == JobStatus.InProgress)
    {
        job.StartedAtUtc = startAtUtc;
        job.UpdatedAtUtc = startAtUtc;
    }
    else if (status == JobStatus.Completed)
    {
        job.StartedAtUtc = startAtUtc;
        job.CompletedAtUtc = estimatedEndAtUtc;
        job.UpdatedAtUtc = estimatedEndAtUtc;
    }
    else if (status == JobStatus.Cancelled)
    {
        job.CancelledAtUtc = startAtUtc.AddDays(1);
        job.UpdatedAtUtc = job.CancelledAtUtc.Value;
    }

    job.Milestones = milestones
        .Select((item, index) =>
        {
            var occurredAtUtc = startAtUtc.AddDays(item.OffsetDays);
            var milestoneCreatedAt = occurredAtUtc.AddDays(-1);
            if (milestoneCreatedAt > utcNow)
            {
                milestoneCreatedAt = utcNow.AddDays(-1);
            }

            return new JobMilestone
            {
                JobId = job.Id,
                Title = item.Title,
                Notes = item.Notes,
                Status = item.Status,
                OccurredAtUtc = occurredAtUtc,
                SortOrder = index + 1,
                CreatedAtUtc = milestoneCreatedAt,
                UpdatedAtUtc = milestoneCreatedAt
            };
        })
        .ToList();

    job.Expenses = expenses
        .Select(item => new JobExpense
        {
            JobId = job.Id,
            Vendor = item.Vendor,
            Category = item.Category,
            Amount = item.Amount,
            SpentAtUtc = item.SpentAtUtc,
            Notes = item.Notes,
            ReceiptUrl = item.ReceiptUrl,
            CreatedAtUtc = item.SpentAtUtc,
            UpdatedAtUtc = item.SpentAtUtc
        })
        .ToList();

    return job;
}

static Invoice BuildInvoice(
    Job job,
    string notes,
    DateTime createdAtUtc,
    InvoiceStatus status,
    IReadOnlyList<(string Description, decimal Quantity, decimal UnitPrice)> items,
    decimal? taxRate,
    DateTime? issuedAtUtc = null,
    DateTime? dueAtUtc = null,
    DateTime? paidAtUtc = null,
    DateTime? overdueAtUtc = null)
{
    var invoice = new Invoice
    {
        JobId = job.Id,
        Job = job,
        Notes = notes,
        CreatedAtUtc = createdAtUtc,
        UpdatedAtUtc = createdAtUtc,
        Status = status
    };

    invoice.LineItems = BuildInvoiceLineItems(invoice.Id, items, taxRate);
    invoice.Amount = CalculateInvoiceTotals(invoice.LineItems).Total;

    if (issuedAtUtc is not null)
    {
        invoice.IssuedAtUtc = issuedAtUtc;
        invoice.UpdatedAtUtc = issuedAtUtc.Value;
    }

    if (dueAtUtc is not null)
    {
        invoice.DueAtUtc = dueAtUtc;
    }

    if (paidAtUtc is not null)
    {
        invoice.PaidAtUtc = paidAtUtc;
        invoice.UpdatedAtUtc = paidAtUtc.Value;
    }

    if (overdueAtUtc is not null)
    {
        invoice.OverdueAtUtc = overdueAtUtc;
        invoice.UpdatedAtUtc = overdueAtUtc.Value;
    }

    return invoice;
}

static List<EstimateLineItem> BuildEstimateLineItems(
    Guid estimateId,
    IReadOnlyList<(string Description, decimal Quantity, decimal UnitPrice)> items,
    decimal? taxRate)
{
    var lineItems = new List<EstimateLineItem>();
    var sortOrder = 1;

    foreach (var item in items)
    {
        lineItems.Add(new EstimateLineItem
        {
            EstimateId = estimateId,
            Description = item.Description,
            Quantity = item.Quantity,
            UnitPrice = item.UnitPrice,
            IsTaxLine = false,
            SortOrder = sortOrder++
        });
    }

    if (taxRate is not null)
    {
        lineItems.Add(new EstimateLineItem
        {
            EstimateId = estimateId,
            Description = "Sales tax",
            Quantity = 1,
            UnitPrice = 0,
            IsTaxLine = true,
            TaxRate = taxRate,
            SortOrder = sortOrder
        });
    }

    return lineItems;
}

static List<InvoiceLineItem> BuildInvoiceLineItems(
    Guid invoiceId,
    IReadOnlyList<(string Description, decimal Quantity, decimal UnitPrice)> items,
    decimal? taxRate)
{
    var lineItems = new List<InvoiceLineItem>();
    var sortOrder = 1;

    foreach (var item in items)
    {
        lineItems.Add(new InvoiceLineItem
        {
            InvoiceId = invoiceId,
            Description = item.Description,
            Quantity = item.Quantity,
            UnitPrice = item.UnitPrice,
            IsTaxLine = false,
            SortOrder = sortOrder++
        });
    }

    if (taxRate is not null)
    {
        lineItems.Add(new InvoiceLineItem
        {
            InvoiceId = invoiceId,
            Description = "Sales tax",
            Quantity = 1,
            UnitPrice = 0,
            IsTaxLine = true,
            TaxRate = taxRate,
            SortOrder = sortOrder
        });
    }

    return lineItems;
}

static (decimal Subtotal, decimal TaxTotal, decimal Total) CalculateEstimateTotals(
    IReadOnlyList<EstimateLineItem> lineItems)
{
    var subtotal = lineItems.Where(x => !x.IsTaxLine).Sum(x => x.Quantity * x.UnitPrice);
    var taxTotal = lineItems.Where(x => x.IsTaxLine).Sum(x => subtotal * (x.TaxRate ?? 0) / 100m);
    var total = subtotal + taxTotal;
    return (Math.Round(subtotal, 2), Math.Round(taxTotal, 2), Math.Round(total, 2));
}

static (decimal Subtotal, decimal TaxTotal, decimal Total) CalculateInvoiceTotals(
    IReadOnlyList<InvoiceLineItem> lineItems)
{
    var subtotal = lineItems.Where(x => !x.IsTaxLine).Sum(x => x.Quantity * x.UnitPrice);
    var taxTotal = lineItems.Where(x => x.IsTaxLine).Sum(x => subtotal * (x.TaxRate ?? 0) / 100m);
    var total = subtotal + taxTotal;
    return (Math.Round(subtotal, 2), Math.Round(taxTotal, 2), Math.Round(total, 2));
}

static string GetEnv(string key, string fallback)
{
    var value = Environment.GetEnvironmentVariable(key);
    return string.IsNullOrWhiteSpace(value) ? fallback : value;
}
