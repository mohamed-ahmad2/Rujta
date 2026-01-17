# Rujta Project Structure

This document provides a comprehensive overview of the **Rujta** project structure, covering both the backend and frontend components. The backend follows a **Clean / Onion Architecture** for modularity and scalability, while the frontend adopts a **Feature-Based Architecture** for organized, domain-driven development. This structure helps developers navigate the codebase, understand responsibilities, and maintain consistency across the full stack.

The solution is divided into backend projects (`Rujta.API`, `Rujta.Application`, `Rujta.Domain`, `Rujta.Infrastructure`) and a separate frontend directory (`Frontend/` or similar, containing the React app).

## Backend Structure

The backend is organized into four main projects with inward dependency flow: `API → Infrastructure → Application → Domain`. This ensures layer isolation and testability.

```
Rujta/
├── Rujta.API/                # Presentation layer (API endpoints, controllers)
├── Rujta.Application/        # Application logic (use cases, DTOs)
├── Rujta.Domain/             # Core domain models and business rules
├── Rujta.Infrastructure/     # Infrastructure (data access, external services)
└── [Other solution files, e.g., .sln]
```

### Rujta.API
Handles HTTP requests, controllers, and presentation logic. Includes Firebase and mapping configurations.

- **Controllers/**: API controllers (e.g., AuthController.cs, OrdersController.cs).
- **Firebase/**: Firebase-related files.
  - **Service-account.json**: Service account credentials for Firebase (exclude from version control).
- **Maps/**: Mapping data (e.g., OSM files for routing and calcluate Latitude and Longitude).
  > **Note**: Download content from [this Google Drive link](https://drive.google.com/drive/folders/1hN9vmao9Mj94jkp0DUeUyVmEXE_6fNIt?usp=sharing) and place in this folder. Used by ItineroMapBuilder.cs for RouterDb.

### Rujta.Application
Defines services, interfaces, and DTOs. Orchestrates business logic without infrastructure ties.

- **Validation/**: FluentValidation rules for requests.
- **Services/**: Service implementations (e.g., OrderService.cs).
- **Mapper/**: AutoMapper profiles for mappings.
- **Interfaces/**: Service interfaces (e.g., IOrderService.cs).
- **DTOs/**: Data Transfer Objects (e.g., OrderDto.cs).
- **Constants/**: Application constants (e.g., error messages).

### Rujta.Domain
Core, independent layer with business entities and rules.

- **Hub/**: SignalR hubs (e.g., NotificationHub.cs).
- **Enums/**: Enumerations (e.g., OrderStatus.cs).
- **Entities/**: Models (e.g., Order.cs, Pharmacy.cs).
- **Common/**: Shared utilities or base classes.

### Rujta.Infrastructure
Concrete implementations for data, services, and utilities.

- **Utiles/**: Utilities (e.g., ItineroMapBuilder.cs).
- **Repositories/**: EF Core repositories (e.g., OrderRepository.cs).
- **Migrations/**: EF Core migration files.
- **Identity/**: ASP.NET Identity setup.
- **Helpers/**: Helper classes (typo in source as "Helperrs"; use Helpers).
- **Extensions/**: Extension methods (e.g., for DI).
- **Data/**: DbContext (e.g., ApplicationDbContext.cs).
- **Constants/**: Infrastructure constants (e.g., connection strings).
- **BackgroundJobs/**: Background tasks (e.g., Refresh Token Cleanup Service).
- **Configuration/**: App settings loaders.
- **Certificates/**: Security certificates for **JWT** signing and **HTTPS** configuration.
  > **Note**: Download the content from [this Google Drive link](https://drive.google.com/drive/folders/133C1GLry2DNNBZOEOWm7mr0htd5cehwB?usp=sharing) and place it in this folder.
  > These certificates are used by the application for JWT authentication and HTTPS setup and are related to the `JWT__CertPassword` configuration setting.

#### Backend Additional Notes
- **Dependencies**: Run `dotnet restore` for NuGet packages in `.csproj` files.
- **Sensitive Files**: Add `Service-account.json` to `.gitignore`.
- **Mapping**: Build RouterDb after downloading Maps using `ItineroMapBuilder.BuildRouterDb()`.
- **Best Practices**: Maintain isolation; use interfaces for decoupling.
- **Troubleshooting**: Set env vars (e.g., JWT__CertPassword) before migrations/API runs.
- **Further Reading**: See API Reference for endpoints and packages.

---

## Frontend Structure

The frontend is a React app built with Vite, organized by features for modularity and scalability. It aligns with the backend's architecture.

```
Frontend/
└── src/
    ├── features/             # Domain-specific features
    │   ├── auth/             # Authentication
    │   │   ├── api/          # API calls (e.g., login/register)
    │   │   ├── hook/         # Hooks (e.g., auth state)
    │   │   ├── components/   # components
    │   │   └── pages/        # UI pages (e.g., Login/Register)
    │   ├── dashboard/        # Analytics dashboards
    │   │   ├── components/
    │   │   └── pages/
    │   ├── landing/        # Analytics dashboards
    │   │   ├── components/
    │   │   └── pages/
    │   ├── medicines/          # User medicines
    │   │   ├── api/
    │   │   ├── hook/
    │   │   └── pages/
    │   ├── userProfile/          # User profiles
    │   │   ├── api/
    │   │   ├── hook/
    │   │   └── pages/
    │   ├── user/             # User functionalities
    │   │   ├── components/
    │   │   ├── hook/
    │   │   └── pages/
    │   ├── orders/            # Orders
    │   |   ├── api/
    │   |   └── hook/
    │   └── pharmacies/        # pharmacies
    │       ├── api/
    │       └── hook/
    ├── assets/               # Images, fonts, etc.
    ├── routes/               # Route definitions
    ├── shared/               # Reusable items
    │   ├── api/              # Shared API config
    │   │   └── apiClient.ts  # Centralized Axios client
    │   └── components/       # Common UI (e.g., buttons, modals)
    ├── App.jsx               # Root component
    └── main.jsx              # React entry point
```

### Frontend Additional Notes
- **Dependencies**: Managed in `package.json`; install with `npm install`.
- **API Client**: `shared/api/apiClient.ts` handles JWT, interceptors, and errors for consistency.
- **Proxy**: Vite proxies `/api/*` to backend (`https://localhost:7065`) to avoid CORS.
- **Development**: Run `npm run dev` (localhost:5173); use `concurrently` for full stack.
- **Best Practices**: Keep features self-contained; align with backend domains.
- **Troubleshooting**: Check console/network for issues; refer to Frontend Guide for packages and workflow.
- **Further Reading**: See Frontend Guide for tech stack and architecture details.

This combined structure ensures a clean, full-stack codebase. For setup instructions, refer to the Getting Started guide. If contributing, follow layer principles and exclude sensitive files from Git.