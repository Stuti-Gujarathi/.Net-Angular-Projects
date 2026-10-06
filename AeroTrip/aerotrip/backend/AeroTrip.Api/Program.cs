using System.Text.Json.Serialization;
using AeroTrip.Api.Infrastructure.Errors;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// ---------- API ----------
builder.Services
    .AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// Return the first validation message as "detail" so the UI can show it directly.
builder.Services.Configure<ApiBehaviorOptions>(o =>
{
    o.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(e => e.Value?.Errors.Count > 0)
            .ToDictionary(e => e.Key, e => e.Value!.Errors.Select(x => x.ErrorMessage).ToArray());
        var first = errors.SelectMany(e => e.Value).FirstOrDefault(m => !string.IsNullOrWhiteSpace(m)) ?? "Please check the highlighted fields.";
        return new BadRequestObjectResult(new ValidationProblemDetails(errors)
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Invalid request",
            Detail = first
        });
    };
});

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// ---------- Auth (JWT bearer, zero external packages) ----------
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.AddSingleton<ITokenService, JwtTokenService>();
builder.Services
    .AddAuthentication(BearerAuthenticationHandler.SchemeName)
    .AddScheme<AuthenticationSchemeOptions, BearerAuthenticationHandler>(BearerAuthenticationHandler.SchemeName, null);
builder.Services.AddAuthorization();

// ---------- CORS for the Angular app ----------
var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:4200"];
builder.Services.AddCors(o => o.AddPolicy("web", p => p.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod()));

// ---------- Data (in-memory) ----------
builder.Services.AddSingleton<InMemoryDataStore>();
builder.Services.AddSingleton<IUserRepository, UserRepository>();
builder.Services.AddSingleton<ICatalogRepository, CatalogRepository>();
builder.Services.AddSingleton<IFlightRepository, FlightRepository>();
builder.Services.AddSingleton<IBookingRepository, BookingRepository>();
builder.Services.AddSingleton<IPaymentRepository, PaymentRepository>();
builder.Services.AddSingleton<IOfferRepository, OfferRepository>();
builder.Services.AddSingleton<DataSeeder>();

// ---------- Domain services ----------
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton<IPricingService, PricingService>();
builder.Services.AddScoped<IFlightService, FlightService>();
builder.Services.AddScoped<IOfferService, OfferService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IFlightScheduleService, FlightScheduleService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddHostedService<HoldExpiryWorker>();

var app = builder.Build();

app.Services.GetRequiredService<DataSeeder>().Seed();

app.UseExceptionHandler();
app.UseCors("web");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// API index: a lightweight, dependency-free list of every endpoint.
app.MapGet("/", (EndpointDataSource endpoints) => Results.Ok(new
{
    name = "AeroTrip API",
    version = "1.0.0",
    time = Clock.IstNow,
    endpoints = endpoints.Endpoints
        .OfType<RouteEndpoint>()
        .Where(e => e.RoutePattern.RawText?.StartsWith("api") == true)
        .Select(e => new
        {
            method = string.Join(",", e.Metadata.GetMetadata<HttpMethodMetadata>()?.HttpMethods ?? []),
            route = "/" + e.RoutePattern.RawText,
            auth = e.Metadata.GetMetadata<Microsoft.AspNetCore.Authorization.IAuthorizeData>() is { } a
                ? (string.IsNullOrEmpty(a.Roles) ? "user" : a.Roles!.ToLowerInvariant())
                : "guest"
        })
        .OrderBy(e => e.route).ThenBy(e => e.method)
}));

app.Run();
