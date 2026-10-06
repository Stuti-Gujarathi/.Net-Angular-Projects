using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using SGTravels.Api.Health;
using SGTravels.Core.Discovery;
using SGTravels.Core.Enquiries;
using SGTravels.Core.Journeys;
using SGTravels.Infrastructure;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;

var builder = WebApplication.CreateBuilder(args);

// ---- MVC + JSON -------------------------------------------------------------------------------
builder.Services
    .AddControllers(options =>
    {
        // Validation errors use the JSON (camelCase) field names the frontend sends.
        options.ModelMetadataDetailsProviders.Add(new SystemTextJsonValidationMetadataProvider());
    })
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddProblemDetails();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "SG Travels Discovery API", Version = "v1" });
});

// ---- Application ------------------------------------------------------------------------------
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<JourneyService>();
builder.Services.AddSingleton<DiscoveryService>();
builder.Services.AddSingleton<EnquiryService>();
builder.Services.AddSGTravelsInfrastructure(builder.Configuration);

// ---- Cross-cutting ----------------------------------------------------------------------------
builder.Services.AddHealthChecks().AddCheck<CatalogHealthCheck>("catalog");

builder.Services.AddOutputCache(options =>
{
    options.AddPolicy(CachePolicies.Catalog, policy => policy.Expire(TimeSpan.FromMinutes(5)).SetVaryByQuery("*"));
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy(RateLimitPolicies.Enquiries, context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));
});

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicies.Frontend, policy => policy
        .WithOrigins(allowedOrigins)
        .WithMethods("GET", "POST")
        .WithHeaders("Content-Type"));
});

var app = builder.Build();

// ---- Pipeline ---------------------------------------------------------------------------------
app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options => options.DocumentTitle = "SG Travels API");
}

app.UseCors(CorsPolicies.Frontend);
app.UseRateLimiter();
app.UseOutputCache();

app.MapControllers();
app.MapHealthChecks("/health");
app.MapGet("/", () => Results.Redirect(app.Environment.IsDevelopment() ? "/swagger" : "/health"))
   .ExcludeFromDescription();

await app.RunAsync();

internal static class CorsPolicies
{
    public const string Frontend = "frontend";
}

internal static class CachePolicies
{
    public const string Catalog = "catalog";
}

internal static class RateLimitPolicies
{
    public const string Enquiries = "enquiries";
}

/// <summary>Exposed so integration tests can use WebApplicationFactory&lt;Program&gt;.</summary>
public partial class Program;
