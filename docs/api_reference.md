# Backend API Reference

## Overview

The backend of **Rujta** is built using **ASP.NET Core 8** and follows **Clean / Onion Architecture**, which ensures:

- Clear separation of concerns
- Scalability and maintainability
- Testability
- Minimal coupling between layers
- Ease of replacing any layer without affecting the rest of the system

### Project Layers

Rujta
├── Rujta.Domain # Core business entities and rules (no dependencies)
├── Rujta.Application # Use cases, DTOs, interfaces, validation, mapping
├── Rujta.Infrastructure # EF Core, Repositories, external services (Firebase, SignalR, Routing)
└── Rujta.Api # Presentation layer: Controllers, Middleware, Swagger, DI setup

**Dependency Rule:**  
`API → Infrastructure → Application → Domain`  
> Domain layer has no dependencies on any other layer.  

---

## NuGet Packages Overview

### Core Architecture & Mapping
- **AutoMapper**: Object-to-object mapping (Entities ↔ DTOs)  
- **AutoMapper.Extensions.Microsoft.DependencyInjection**: DI integration

### Validation
- **FluentValidation** & **FluentValidation.AspNetCore**: Request model validation  
- **FluentValidation.DependencyInjectionExtensions**: Register validators via DI  

### Authentication & Security
- **Microsoft.AspNetCore.Authentication.JwtBearer**: JWT authentication  
- **Microsoft.AspNetCore.Identity.EntityFrameworkCore**: Identity with EF Core  
- **Google.Apis.Auth**: Google OAuth validation  
- **FirebaseAdmin**: Firebase integration (auth, notifications)  

### Data Access & ORM
- **Microsoft.EntityFrameworkCore** & **SqlServer provider**  
- **Microsoft.EntityFrameworkCore.Design / Tools**: EF Core migrations & CLI tools  
- **Microsoft.Data.SqlClient**: Low-level SQL Server access  

### Real-Time Communication
- **Microsoft.AspNetCore.SignalR** & **SignalR.Core**  

### Routing & Mapping
- **Itinero** & **Itinero.IO.Osm**: Routing & pathfinding  

### String Matching
- **F23.StringSimilarity**: Fuzzy matching & search  

### API Documentation
- **Swashbuckle.AspNetCore**: Swagger/OpenAPI generation  

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/Auth/login` | Login user |
| POST | `/api/Auth/register` | Register user |
| POST | `/api/Auth/register/admin` | Register admin |
| POST | `/api/Auth/register-dummy-pharmacyadmin` | Register dummy pharmacy admin |
| POST | `/api/Auth/refresh-token` | Refresh JWT token |
| POST | `/api/Auth/logout` | Logout user |
| GET  | `/api/Auth/me` | Get current user |
| GET  | `/api/Auth/email` | Check email availability |
| POST | `/api/Auth/reset-password` | Reset password |
| POST | `/api/Auth/forgot-password` | Forgot password |
| POST | `/api/Auth/google-login` | Login with Google OAuth |

### Category
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET    | `/api/Category` | List categories |
| POST   | `/api/Category` | Create category |
| GET    | `/api/Category/{id}` | Get category by id |
| PUT    | `/api/Category/{id}` | Update category |
| DELETE | `/api/Category/{id}` | Delete category |

### InventoryItem
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET    | `/api/InventoryItem` | List inventory items |
| POST   | `/api/InventoryItem` | Create inventory item |
| GET    | `/api/InventoryItem/{id}` | Get item by id |
| PUT    | `/api/InventoryItem/{id}` | Update item |
| DELETE | `/api/InventoryItem/{id}` | Delete item |

### Medicines & MedicineImport
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET    | `/api/Medicines` | List medicines |
| POST   | `/api/Medicines` | Create medicine |
| GET    | `/api/Medicines/{id}` | Get medicine by id |
| PUT    | `/api/Medicines/{id}` | Update medicine |
| DELETE | `/api/Medicines/{id}` | Delete medicine |
| GET    | `/api/Medicines/filter` | Filter medicines |
| GET    | `/api/medicines/search` | Search medicines |
| POST   | `/api/MedicineImport` | Import medicines |

### Orders
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST   | `/api/Orders` | Create order |
| GET    | `/api/Orders` | List orders |
| GET    | `/api/Orders/{id}` | Get order by id |
| PUT    | `/api/Orders/{id}` | Update order |
| DELETE | `/api/Orders/{id}` | Delete order |
| PUT    | `/api/Orders/{id}/accept` | Accept order |
| PUT    | `/api/Orders/{id}/process` | Process order |
| PUT    | `/api/Orders/{id}/out-for-delivery` | Out for delivery |
| PUT    | `/api/Orders/{id}/delivered` | Mark delivered |
| PUT    | `/api/Orders/{id}/cancel/user` | Cancel by user |
| PUT    | `/api/Orders/{id}/cancel/pharmacy` | Cancel by pharmacy |
| GET    | `/api/Orders/user` | List orders by user |
| GET    | `/api/Orders/{id}/details` | Order details |
| GET    | `/api/Orders/pharmacy` | Orders for pharmacy |

### Pharmacies
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/Pharmacies/nearest-routed` | Nearest pharmacies (routed) |

### PharmacistManagement
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET    | `/api/PharmacistManagement/GetAllPharmacist` | List all pharmacists |
| GET    | `/api/PharmacistManagement/GetPharmacistById/{id}` | Get pharmacist by id |
| POST   | `/api/PharmacistManagement/AddStaff` | Add staff |
| PUT    | `/api/PharmacistManagement/UpdateStaff/{id}` | Update staff |
| DELETE | `/api/PharmacistManagement/DeleteStaff/{id}` | Delete staff |
| GET    | `/api/PharmacistManagement/GetPharmacistByManager/{managerId}` | Get pharmacists by manager |

### PriorityPharmacies
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/PriorityPharmacies/top-k` | Get top-k priority pharmacies |

### Report
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/Report/PharmacyReport` | Pharmacy report |

### UserProfile
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/UserProfile/me` | Current user profile |
| PUT | `/api/UserProfile/update` | Update user profile |

---

## EF Core & Database Commands

Before executing any EF Core commands, **set the JWT certificate password**:

```powershell
setx JWT__CertPassword "Rujta123987"
```

Add Migrations:
```powershell
dotnet ef migrations add <MigrationName> --project Rujta.Infrastructure --startup-project Rujta.API
```
# or in PMC:
```powershell
Add-Migration <MigrationName> -Project Rujta.Infrastructure -StartupProject Rujta.API
```

Update Database :
```powershell
dotnet ef database update --project Rujta.Infrastructure --startup-project Rujta.API
```
# or in PMC:
```powershell
Update-Database -Project Rujta.Infrastructure -StartupProject Rujta.API
```

Remove Migrations :
```powershell
dotnet ef migrations remove --project Rujta.Infrastructure --startup-project Rujta.API
```
# or in PMC:
```powershell
Remove-Migration -Project Rujta.Infrastructure -StartupProject Rujta.API
```

Drop Database :
Caution: Deletes the database completely.
```powershell
dotnet ef database drop --project Rujta.Infrastructure --startup-project Rujta.API --force
```

---

## Notes

- All backend packages are managed via **NuGet** and defined in each project’s `.csproj` file.  
- The architecture enforces **layer separation**, keeping the Domain core independent.  
- Endpoints follow **REST conventions**, with some real-time features via **SignalR**.  
- This setup supports **scalable, secure, and maintainable backend development**.