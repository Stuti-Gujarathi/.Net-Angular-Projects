# ---- Build --------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore first so this layer is cached until a project file changes.
COPY global.json Directory.Build.props .editorconfig ./
COPY src/SGTravels.Core/SGTravels.Core.csproj src/SGTravels.Core/
COPY src/SGTravels.Infrastructure/SGTravels.Infrastructure.csproj src/SGTravels.Infrastructure/
COPY src/SGTravels.Api/SGTravels.Api.csproj src/SGTravels.Api/
RUN dotnet restore src/SGTravels.Api/SGTravels.Api.csproj

COPY src/ src/
RUN dotnet publish src/SGTravels.Api/SGTravels.Api.csproj -c Release -o /app --no-restore

# ---- Runtime ------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
USER app
ENTRYPOINT ["dotnet", "SGTravels.Api.dll"]
