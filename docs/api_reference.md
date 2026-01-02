# Backend API Reference for Rujta

This document serves as a comprehensive reference for the **Rujta** backend API, built on **ASP.NET Core 8** with a **Clean / Onion Architecture**. It outlines the architecture, dependencies, endpoints, and database management commands to facilitate development, integration, and maintenance.

## Overview

The backend architecture emphasizes:
- **Clear Separation of Concerns**: Layers are isolated to promote modularity.
- **Scalability and Maintainability**: Designed for easy extension and updates.
- **Testability**: Interfaces and dependency injection enable unit and integration testing.
- **Minimal Coupling**: Layers depend only inward, following the dependency rule.
- **Ease of Replacement**: Swap implementations (e.g., databases or services) without system-wide impact.

> **Note**: For detailed project structure and layers, refer to the separate "Rujta Project Structure" document.

---

## NuGet Packages

Packages are categorized by functionality and managed in each project's `.csproj` file. Use `dotnet restore` to install them.

### Core Architecture & Mapping
- **AutoMapper**: Handles entity-to-DTO mapping.
- **AutoMapper.Extensions.Microsoft.DependencyInjection**: Integrates AutoMapper with DI.

### Validation
- **FluentValidation** & **FluentValidation.AspNetCore**: Validates request models.
- **FluentValidation.DependencyInjectionExtensions**: Enables DI-based validator registration.

### Authentication & Security
- **Microsoft.AspNetCore.Authentication.JwtBearer**: Supports JWT-based authentication.
- **Microsoft.AspNetCore.Identity.EntityFrameworkCore**: Manages user identity with EF Core.
- **Google.Apis.Auth**: Validates Google OAuth tokens.
- **FirebaseAdmin**: Integrates Firebase for authentication and notifications.

### Data Access & ORM
- **Microsoft.EntityFrameworkCore** & **Microsoft.EntityFrameworkCore.SqlServer**: Core ORM and SQL Server provider.
- **Microsoft.EntityFrameworkCore.Design / Tools**: Supports migrations and design-time tools.
- **Microsoft.Data.SqlClient**: Provides direct SQL Server connectivity.

### Real-Time Communication
- **Microsoft.AspNetCore.SignalR** & **Microsoft.AspNetCore.SignalR.Core**: Enables real-time features like live updates.

### Routing & Mapping
- **Itinero** & **Itinero.IO.Osm**: Handles routing and pathfinding using OpenStreetMap data.

### String Matching
- **F23.StringSimilarity**: Implements fuzzy string matching for search functionalities.

### API Documentation
- **Swashbuckle.AspNetCore**: Generates Swagger/OpenAPI documentation.

---

## API Endpoints

Endpoints are organized by feature area. All routes are prefixed with `/api/`. Authentication is required for most endpoints (JWT Bearer scheme). Use Swagger at `/swagger` for interactive testing.

### Auth
| Method | Endpoint                          | Description                  |
|--------|-----------------------------------|------------------------------|
| POST   | `/Auth/login`                     | Authenticates a user.        |
| POST   | `/Auth/register`                  | Registers a new user.        |
| POST   | `/Auth/register/admin`            | Registers an admin user.     |
| POST   | `/Auth/register-dummy-pharmacyadmin` | Registers a dummy pharmacy admin. |
| POST   | `/Auth/refresh-token`             | Refreshes an expired JWT.    |
| POST   | `/Auth/logout`                    | Logs out the current user.   |
| GET    | `/Auth/me`                        | Retrieves current user info. |
| GET    | `/Auth/email`                     | Checks email availability.   |
| POST   | `/Auth/reset-password`            | Resets user password.        |
| POST   | `/Auth/forgot-password`           | Initiates password recovery. |
| POST   | `/Auth/google-login`              | Logs in via Google OAuth.    |

### Category
| Method | Endpoint               | Description                  |
|--------|------------------------|------------------------------|
| GET    | `/Category`            | Lists all categories.        |
| POST   | `/Category`            | Creates a new category.      |
| GET    | `/Category/{id}`       | Retrieves category by ID.    |
| PUT    | `/Category/{id}`       | Updates category by ID.      |
| DELETE | `/Category/{id}`       | Deletes category by ID.      |

### InventoryItem
| Method | Endpoint                  | Description                     |
|--------|---------------------------|---------------------------------|
| GET    | `/InventoryItem`          | Lists all inventory items.      |
| POST   | `/InventoryItem`          | Creates a new inventory item.   |
| GET    | `/InventoryItem/{id}`     | Retrieves item by ID.           |
| PUT    | `/InventoryItem/{id}`     | Updates item by ID.             |
| DELETE | `/InventoryItem/{id}`     | Deletes item by ID.             |

### Medicines & MedicineImport
| Method | Endpoint                  | Description                     |
|--------|---------------------------|---------------------------------|
| GET    | `/Medicines`              | Lists all medicines.            |
| POST   | `/Medicines`              | Creates a new medicine.         |
| GET    | `/Medicines/{id}`         | Retrieves medicine by ID.       |
| PUT    | `/Medicines/{id}`         | Updates medicine by ID.         |
| DELETE | `/Medicines/{id}`         | Deletes medicine by ID.         |
| GET    | `/Medicines/filter`       | Filters medicines by criteria.  |
| GET    | `/medicines/search`       | Searches medicines.             |
| POST   | `/MedicineImport`         | Imports medicines in bulk.      |

### Orders
| Method | Endpoint                       | Description                     |
|--------|--------------------------------|---------------------------------|
| POST   | `/Orders`                      | Creates a new order.            |
| GET    | `/Orders`                      | Lists all orders.               |
| GET    | `/Orders/{id}`                 | Retrieves order by ID.          |
| PUT    | `/Orders/{id}`                 | Updates order by ID.            |
| DELETE | `/Orders/{id}`                 | Deletes order by ID.            |
| PUT    | `/Orders/{id}/accept`          | Accepts an order.               |
| PUT    | `/Orders/{id}/process`         | Processes an order.             |
| PUT    | `/Orders/{id}/out-for-delivery`| Marks order as out for delivery.|
| PUT    | `/Orders/{id}/delivered`       | Marks order as delivered.       |
| PUT    | `/Orders/{id}/cancel/user`     | Cancels order by user.          |
| PUT    | `/Orders/{id}/cancel/pharmacy` | Cancels order by pharmacy.      |
| GET    | `/Orders/user`                 | Lists orders for current user.  |
| GET    | `/Orders/{id}/details`         | Retrieves order details.        |
| GET    | `/Orders/pharmacy`             | Lists orders for a pharmacy.    |

### Pharmacies
| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| GET    | `/Pharmacies/nearest-routed` | Finds nearest pharmacies with routing.|

### PharmacistManagement
| Method | Endpoint                                 | Description                          |
|--------|------------------------------------------|--------------------------------------|
| GET    | `/PharmacistManagement/GetAllPharmacist` | Lists all pharmacists.               |
| GET    | `/PharmacistManagement/GetPharmacistById/{id}` | Retrieves pharmacist by ID.    |
| POST   | `/PharmacistManagement/AddStaff`         | Adds new staff.                      |
| PUT    | `/PharmacistManagement/UpdateStaff/{id}` | Updates staff by ID.                 |
| DELETE | `/PharmacistManagement/DeleteStaff/{id}` | Deletes staff by ID.                 |
| GET    | `/PharmacistManagement/GetPharmacistByManager/{managerId}` | Lists pharmacists by manager. |

### PriorityPharmacies
| Method | Endpoint                | Description                          |
|--------|-------------------------|--------------------------------------|
| POST   | `/PriorityPharmacies/top-k` | Retrieves top-k priority pharmacies.|

### Report
| Method | Endpoint               | Description                  |
|--------|------------------------|------------------------------|
| GET    | `/Report/PharmacyReport` | Generates pharmacy report. |

### UserProfile
| Method | Endpoint              | Description                  |
|--------|-----------------------|------------------------------|
| GET    | `/UserProfile/me`     | Retrieves current profile.   |
| PUT    | `/UserProfile/update` | Updates user profile.        |

---

## EF Core & Database Commands

**Prerequisite**: Set the JWT certificate password environment variable (required for secure operations):

```powershell
setx JWT__CertPassword "Rujta123987"
```

> **Note**: Restart your terminal or IDE after setting the variable for it to take effect.

### Add Migration
```powershell
dotnet ef migrations add <MigrationName> --project Rujta.Infrastructure --startup-project Rujta.API
```
Or in Package Manager Console (PMC):
```powershell
Add-Migration <MigrationName> -Project Rujta.Infrastructure -StartupProject Rujta.API
```

### Update Database
```powershell
dotnet ef database update --project Rujta.Infrastructure --startup-project Rujta.API
```
Or in PMC:
```powershell
Update-Database -Project Rujta.Infrastructure -StartupProject Rujta.API
```

### Remove Migration
```powershell
dotnet ef migrations remove --project Rujta.Infrastructure --startup-project Rujta.API
```
Or in PMC:
```powershell
Remove-Migration -Project Rujta.Infrastructure -StartupProject Rujta.API
```

### Drop Database
**Caution**: This permanently deletes the database.
```powershell
dotnet ef database drop --project Rujta.Infrastructure --startup-project Rujta.API --force
```

---

## Additional Notes

- **Package Management**: All NuGet packages are defined in `.csproj` files. Run `dotnet restore` in the solution root to resolve dependencies.
- **Architecture Principles**: Enforces layer isolation; avoid direct dependencies from outer to inner layers.
- **REST Conventions**: Endpoints use standard HTTP methods. Real-time features are supplemented by SignalR hubs.
- **Security**: Use HTTPS in production; sensitive data (e.g., JWT secrets) should be stored in environment variables or secrets managers.
- **Scalability**: The setup supports horizontal scaling, with EF Core optimized for SQL Server.
- **Troubleshooting**: Check logs for errors. Common issues include invalid connection strings or missing migrations.
- **Further Reading**: Refer to Swagger docs at runtime or project source for implementation details.

This reference ensures a robust, secure, and efficient backend for **Rujta**. For contributions or issues, consult the project repository.