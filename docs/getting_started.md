# Getting Started with Rujta

This guide provides step-by-step instructions to set up the **Rujta** project locally, along with an overview of the development environments. It is designed for developers to quickly get started with building, testing, and deploying the application.

## Prerequisites

Ensure the following tools and software are installed before proceeding:

- **.NET 8 SDK** – Required for the backend API development.
- **Node.js (v18+ or later) and npm** – Essential for the frontend React application.
- **SQL Server** – Used as the primary database engine (local instance recommended for development).
- **Visual Studio 2022 or VS Code** – Recommended IDEs for .NET and JavaScript development.

## Project Structure

The project follows a clean, modular architecture:

```
Rujta/
├── Backend/      # .NET 8 Web API project (core services and APIs)
├── Frontend/     # React.js application (user interface)
└── docs/         # Project documentation (guides, APIs, etc.)
```

## Development Environments

Rujta supports multiple environments to ensure separation between development, testing, and production workflows:

1. **Development**
   - Intended for local developer use.
   - Enables debugging and detailed logging.
   - Connects to a local SQL Server instance.

2. **Staging**
   - Pre-production environment for integration testing.
   - Mirrors production configurations closely.
   - Used to validate features before release.

3. **Production**
   - Live environment for end-users.
   - Optimized for performance, scalability, and security.
   - Uses production-grade database and hosting.

Configuration files:
- Backend: `appsettings.{Environment}.json` (e.g., `appsettings.Development.json`).
- Frontend: `.env.{environment}` (e.g., `.env.development`).

## Steps to Run Locally

Follow these steps to set up and run the project on your local machine.

### 1. Setup the Backend

Navigate to the backend directory and execute the following commands:

```bash
cd Backend/Rujta

# Restore NuGet packages
dotnet restore Rujta.API
dotnet restore Rujta.Infrastructure
dotnet restore Rujta.Application
dotnet restore Rujta.Domain

# Build the projects
dotnet build Rujta.Domain
dotnet build Rujta.Application
dotnet build Rujta.Infrastructure
dotnet build Rujta.API

# Run the API
dotnet run --project Rujta.API
```

- The backend API will start at `https://localhost:7065/swagger/index.html` (Swagger UI for API documentation and testing).
- Update the connection string in `Backend/appsettings.Development.json` to point to your local SQL Server instance.
- **Tip**: In Visual Studio, open the solution and press F5 to build and run the backend automatically.

### 2. Setup the Database

Ensure SQL Server is running locally, then apply any necessary database migrations:

- Using .NET CLI:
  ```bash
  dotnet ef database update --project Rujta.Infrastructure --startup-project Rujta.API
  ```

- Using Package Manager Console (PMC) in Visual Studio:
  ```powershell
  Update-Database -Project Rujta.Infrastructure -StartupProject Rujta.API
  ```

This will create or update the database schema based on the Entity Framework migrations.

### 3. Setup the Frontend

Navigate to the frontend directory and run:

```bash
cd Frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

- The frontend will be available at `http://localhost:5173/` (or the port specified in your configuration).
- It will automatically connect to the running backend API.

## Optional Tools and Best Practices

- **API Testing**: Use Postman or Apidog to test and explore the backend endpoints.
- **Version Control**: Git is recommended for managing code changes and collaboration.
- **Security**: Always use HTTPS in development and ensure sensitive data (e.g., connection strings) is stored securely.
- **Troubleshooting**: Check console logs for errors. Common issues include mismatched connection strings or missing dependencies.

By following this guide, you will have a fully operational local instance of **Rujta** ready for development, debugging, and testing. For advanced topics, refer to additional documentation in the `docs/` folder. If you encounter issues, consult the project repository or community forums.