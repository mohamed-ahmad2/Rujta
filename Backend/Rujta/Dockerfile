# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# 1️⃣ Copy solution and csproj files first for caching
COPY *.sln . 
COPY Rujta.Api/*.csproj ./Rujta.Api/
COPY Rujta.Application/*.csproj ./Rujta.Application/
COPY Rujta.Domain/*.csproj ./Rujta.Domain/
COPY Rujta.Infrastructure/*.csproj ./Rujta.Infrastructure/

# Restore dependencies
RUN dotnet restore

# 2️⃣ Copy source code (excluding Maps)
COPY Rujta.Api/ ./Rujta.Api/
COPY Rujta.Application/ ./Rujta.Application/
COPY Rujta.Domain/ ./Rujta.Domain/
COPY Rujta.Infrastructure/ ./Rujta.Infrastructure/

# Copy certificate into container
COPY Rujta.Infrastructure/Certificates/jwt-cert.pfx /app/cert/jwt-cert.pfx

WORKDIR /app/Rujta.Api

# Publish project
RUN dotnet publish -c Release -o /app/out /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy published app from build stage
COPY --from=build /app/out ./

# Copy Maps folder separately
COPY Rujta.Api/Maps ./Maps
COPY --from=build /app/cert /app/cert

# Set default environment variables
ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_URLS=http://+:80;https://+:443

# Expose HTTPS port
EXPOSE 443

# Run the API
ENTRYPOINT ["dotnet","Rujta.API.dll"]