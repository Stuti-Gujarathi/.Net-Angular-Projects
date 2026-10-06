using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using OrderPulse.Infrastructure;
using OrderPulse.Infrastructure.Persistence.Seed;
using OrderPulse.Application.Features.Auth;
using OrderPulse.Application.Features.Customers;
using OrderPulse.Application.Features.Products;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// .NET 10 built-in OpenAPI
builder.Services.AddOpenApi();

// Infrastructure (EF Core, JWT, CurrentUserService)
builder.Services.AddInfrastructure(builder.Configuration);

// Application services
builder.Services.AddScoped<LoginService>();
builder.Services.AddScoped<CustomerService>();
builder.Services.AddScoped<ProductService>();

// JWT configuration
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"] ?? throw new InvalidOperationException("JWT Key missing");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

// Permission-based authorization policies
builder.Services.AddAuthorization(options =>
{
    var permissions = new[]
    {
        "Orders.Create", "Orders.View", "Orders.Update", "Orders.Cancel", "Orders.Confirm",
        "Customers.Create", "Customers.View", "Customers.Update", "Customers.Delete",
        "Products.Create", "Products.View", "Products.Update", "Products.Delete",
        "Inventory.View", "Inventory.Adjust", "Inventory.Transfer",
        "Warehouses.Create", "Warehouses.View", "Warehouses.Update", "Warehouses.Delete",
        "Fulfilment.View", "Fulfilment.Pick", "Fulfilment.Pack", "Fulfilment.Dispatch",
        "Routes.Create", "Routes.View", "Routes.Update", "Routes.Delete", "Routes.Assign",
        "Deliveries.View", "Deliveries.Confirm", "Deliveries.Fail", "Deliveries.CapturePOD",
        "Invoices.Create", "Invoices.View", "Invoices.Void",
        "Payments.View", "Payments.Create", "Payments.Refund",
        "Returns.Create", "Returns.View", "Returns.Approve",
        "Reports.View", "Reports.ViewFinancial",
        "Users.Create", "Users.View", "Users.Update", "Users.Delete",
        "Roles.Create", "Roles.View", "Roles.Update", "Roles.Delete",
        "Dashboard.View", "AuditLogs.View"
    };

    foreach (var permission in permissions)
    {
        options.AddPolicy(permission, policy =>
            policy.RequireClaim("permission", permission));
    }
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// Dev: run migrations and seed
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var initialiser = scope.ServiceProvider.GetRequiredService<DbInitialiser>();
    await initialiser.InitialiseAsync();

    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "OrderPulse API v1");
    });
}

app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
