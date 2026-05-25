# 💊 Rujta – Streamlined Pharmacy Management and Medicine Ordering Platform

[![.NET](https://img.shields.io/badge/.NET-8.0-5C2D91?style=flat&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.3.9-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.3.2-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-ML_Service-3776AB?style=flat&logo=python&logoColor=white)](https://python.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat&logo=docker&logoColor=white)](https://docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat)](https://github.com/mohamed-ahmad2/Rujta/actions)
[![Live Demo](https://img.shields.io/badge/Live-Demo-FF6B6B?style=flat&logo=vercel&logoColor=white)](https://rujta.vercel.app)
[![Docs](https://img.shields.io/badge/Docs-ReadTheDocs-8CA1AF?style=flat&logo=read-the-docs&logoColor=white)](https://rujta.readthedocs.io/en/latest/)

Rujta is a modern, full-stack web application designed to revolutionize pharmacy management and medicine ordering. It empowers users to effortlessly browse, cart, and order medicines while providing pharmacies with intuitive tools to manage inventory, process orders, and track statuses. Built with scalability and user experience in mind, Rujta bridges the gap between customers and pharmacies for faster, more efficient access to essential healthcare products.

🌐 **Live Demo**: [rujta.vercel.app](https://rujta.vercel.app)
📖 **Full Documentation**: [rujta.readthedocs.io](https://rujta.readthedocs.io/en/latest/)

---

## 🌟 Why Rujta?

In today's fast-paced world, locating medicines across multiple pharmacies can be frustrating and time-consuming. Rujta addresses this by offering a **centralized, intelligent platform** that:

- Matches user carts with optimal pharmacies based on availability and proximity.
- Streamlines order workflows from placement to delivery.
- Enhances pharmacy operations with real-time insights and management tools.
- Leverages AI/ML to analyze prescriptions and extract medicine information automatically.

Whether you're a customer in need of quick access to medicines or a pharmacy owner optimizing your inventory, Rujta simplifies the process while ensuring reliability and security.

---

## 🔑 Key Features

- **User-Friendly Browsing & Ordering**: Search medicines, add to cart, check stock across pharmacies, and place orders seamlessly.
- **Pharmacy Dashboard**: Manage inventory, track orders (Pending, Processing, Out for Delivery, Delivered), and generate reports.
- **Intelligent Matching**: Ranks pharmacies based on product availability, routing, and priority algorithms (e.g., Top-K nearest pharmacies).
- **Real-Time Updates**: SignalR for live notifications and order status changes.
- **Authentication & Profiles**: Secure login (JWT with RSA keys, Google OAuth), user profiles, and role-based access.
- **AI-Powered Prescription Analysis**: ML service for automatic medicine extraction from prescription images.
- **Bulk Operations**: Import medicines, filter/search inventories, and handle bulk updates.
- **Reporting & Analytics**: Generate pharmacy reports for insights into sales and stock.
- **Containerized Deployment**: Docker support for consistent environment setup and deployment.

---

## 👥 User Roles

| Role                    | Capabilities                                                                                                                          |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| **Customer**            | Browse medicines, add to cart, view matching pharmacies, place and track orders.                                                      |
| **Pharmacist / Manager**| Manage pharmacy inventory, prices, and stock levels; process incoming orders; view pharmacy dashboard and sales reports.              |
| **Admin**               | Add and approve pharmacies; review and accept medicine addition requests; set global pricing rules; manage subscriptions and ads.     |

---

## 🏗️ Architecture Overview

Rujta follows industry-best practices for maintainability and scalability:

### Backend — Clean/Onion Architecture (ASP.NET Core 8)
```
Rujta.API            → Presentation Layer  (Controllers, Middleware, SignalR Hubs)
Rujta.Application    → Business Logic      (Services, DTOs, Validators, Mappings)
Rujta.Domain         → Core Entities       (Models, Interfaces, Enums)
Rujta.Infrastructure → Data Access         (EF Core, Repositories, External Services)
```

### Frontend — Feature-Based Architecture (React + Vite)
```
src/
├── features/
│   ├── auth/         → Authentication flows
│   ├── orders/       → Order management
│   ├── pharmacies/   → Pharmacy browsing & matching
│   └── inventory/    → Inventory management
├── shared/           → Reusable components & utilities
└── hooks/            → Custom React hooks
```

### ML Service (Python)
```
ml-service/           → Prescription image analysis
                        AI-powered medicine extraction
```

This structure ensures loose coupling, easy testing, and seamless full-stack integration.

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| ASP.NET Core 8 | Web API framework |
| Entity Framework Core | ORM / Database access |
| AutoMapper & FluentValidation | Object mapping & input validation |
| JWT (RSA keys) + Google OAuth | Authentication |
| Firebase | Push notifications |
| SignalR | Real-time communication |
| Itinero | Geo-routing (OSM-based) |
| F23.StringSimilarity | Fuzzy medicine search |
| Swashbuckle | Swagger API documentation |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| Framer Motion + AOS | Animations |
| Axios | HTTP client |
| Recharts | Data visualizations |
| Lucide-React | Icon library |

### ML Service
| Technology | Purpose |
|------------|---------|
| Python | ML service runtime |
| (Prescription Analysis) | OCR + medicine extraction from images |

### Infrastructure & Tools
| Technology | Purpose |
|------------|---------|
| SQL Server | Primary database |
| Redis | Caching (optional) |
| Docker | Containerization |
| GitHub Actions | CI/CD pipeline |
| Vercel | Frontend deployment |
| ReadTheDocs | Documentation hosting |

---

## 🔒 Security Features

- **Authentication**: JWT signed with RSA private key (verified with public key), refresh tokens, Google OAuth, and Firebase integration.
- **Authorization**: Role-based access control (Customer / Pharmacy / Admin).
- **Data Protection**: Secure hashing, input validation, and protection against SQL Injection/XSS.
- **Encryption**: HTTPS/SSL for all communications; sensitive data via environment variables.
- **Rate Limiting**: Prevents Denial-of-Service (DoS) attacks.
- **Request Size Limits**: Maximum request body size to mitigate DoS and resource exhaustion.
- **Timeout Policies**: `HttpClient` with timeout policies to handle hanging requests.
- **Resource Management**: `SetHandlerLifetime` to avoid resource leaks.
- **CSRF Protection**: `SameSite=Strict` mode for cookies and CORS handling.
- **Content Security**: `Content-Security-Policy (CSP)` enforced in backend to prevent XSS.
- **Information Disclosure Prevention**: Centralized error handling with no stack trace leakage in production.
- **Refresh Token Rotation**: Stateless token refresh with rotation for session security.

---

## 🚀 Getting Started Locally

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js v18+](https://nodejs.org/) & npm
- [SQL Server](https://www.microsoft.com/sql-server) (local instance)
- [Python 3.10+](https://python.org/) (for ML service)
- [Docker](https://docker.com/) (optional, for containerized setup)
- Set environment variable: `JWT__CertPassword="Rujta123987"` (required for JWT signing)

---

### Backend Setup

```bash
# 1. Clone the repo
git clone https://github.com/mohamed-ahmad2/Rujta.git

# 2. Navigate to backend
cd Backend/Rujta

# 3. Restore NuGet packages
dotnet restore

# 4. Update connection string in appsettings.json
# "ConnectionStrings": { "DefaultConnection": "YOUR_SQL_SERVER_CONNECTION_STRING" }

# 5. Download required external resources
```

**Required Downloads:**

| Resource | Description | Link |
|----------|-------------|------|
| `Maps/` | OSM routing & geocoding files (used by `ItineroMapBuilder.cs` for `RouterDb`) | [Download](https://drive.google.com/drive/folders/1hN9vmao9Mj94jkp0DUeUyVmEXE_6fNIt?usp=sharing) |

```bash
# 6. Apply database migrations
dotnet ef database update --project Rujta.Infrastructure --startup-project Rujta.API

# 7. Run the backend
dotnet run --project Rujta.API
```

✅ API available at: `https://localhost:7065/swagger`

---

### Frontend Setup

```bash
# Navigate to frontend
cd Frontend/rujta-frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

✅ App available at: `http://localhost:5173`

> **Tip**: The Vite dev server auto-proxies API calls to the backend — no CORS issues during development.

---

### ML Service Setup

```bash
# Navigate to ml-service
cd ml-service

# Install Python dependencies
pip install -r requirements.txt

# Run the ML service
python main.py
```

---

### Docker Setup (Optional)

```bash
# Build and run all services
docker compose up --build
```

---

## 📁 Project Structure

```
Rujta/
├── Backend/
│   └── Rujta/
│       ├── Rujta.API/             # Presentation Layer
│       ├── Rujta.Application/     # Business Logic
│       ├── Rujta.Domain/          # Core Entities
│       └── Rujta.Infrastructure/  # Data Access & External Services
├── Frontend/
│   └── rujta-frontend/            # React + Vite SPA
├── ml-service/                    # Python ML Service (Prescription Analysis)
├── docs/                          # Project documentation (ReadTheDocs)
└── .github/workflows/             # CI/CD pipelines (GitHub Actions)
```

---

## 🔮 Roadmap 

- [x] AI/ML Prescription Image Analysis (ml-service integrated)
- [x] Docker containerization
- [x] CI/CD pipeline with GitHub Actions
- [x] Live deployment on Vercel
- [x] Payment Gateway integration
- [x] Logistics & Delivery API integration
- [x] Advanced AI-driven analytics & trend predictions
- [x] Multi-Language Support for global accessibility

---

## 👥 Contributors

| Name              | Role                 |
|-------------------|----------------------|
| Abdelrahman Hamdy | Full-Stack Developer |
| Mohamed Ahmed     | Full-Stack Developer    |
| Youssef Wael      | Backend Developer    |
| Sabah Saber       | Frontend Developer   |

**Supervisor**: Dr. Mohamed Fakhry &  Dr. Nesreen Ahmed

> This is an academic graduation project focused on real-world pharmacy solutions — built as part of the Computer Science program at Ain Shams University.

---

## 📧 Contact & Contributing

For inquiries, issues, or collaborations:

📧 [rujtaproject@gmail.com](mailto:rujtaproject@gmail.com)  
🌐 [GitHub Repository](https://github.com/mohamed-ahmad2/Rujta)  
📖 [Developer Documentation](https://rujta.readthedocs.io/en/latest/)

We welcome contributions! Please check our [Developer Docs](https://rujta.readthedocs.io/en/latest/) for contribution guidelines.
