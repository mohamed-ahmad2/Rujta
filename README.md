# 💊 Rujta – Streamlined Pharmacy Management and Medicine Ordering Platform

[![.NET](https://img.shields.io/badge/.NET-8.0-5C2D91?style=flat&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.3.9-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.3.2-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat)](https://github.com/yourusername/rujta/actions)

Rujta is a modern, full-stack web application designed to revolutionize pharmacy management and medicine ordering. It empowers users to effortlessly browse, cart, and order medicines while providing pharmacies with intuitive tools to manage inventory, process orders, and track statuses. Built with scalability and user experience in mind, Rujta bridges the gap between customers and pharmacies for faster, more efficient access to essential healthcare products.

---

## 🌟 Why Rujta?

In today's fast-paced world, locating medicines across multiple pharmacies can be frustrating and time-consuming. Rujta addresses this by offering a **centralized, intelligent platform** that:
- Matches user carts with optimal pharmacies based on availability and proximity.
- Streamlines order workflows from placement to delivery.
- Enhances pharmacy operations with real-time insights and management tools.

Whether you're a customer in need of quick access to medicines or a pharmacy owner optimizing your inventory, Rujta simplifies the process while ensuring reliability and security.

---

## 🔑 Key Features

- **User-Friendly Browsing & Ordering**: Search medicines, add to cart, check stock across pharmacies, and place orders seamlessly.
- **Pharmacy Dashboard**: Manage inventory, track orders (Pending, Processing, Out for Delivery, Delivered), and generate reports.
- **Intelligent Matching**: Ranks pharmacies based on product availability, routing, and priority algorithms (e.g., Top-K nearest pharmacies).
- **Real-Time Updates**: SignalR for live notifications and order status changes.
- **Authentication & Profiles**: Secure login (JWT, Google OAuth), user profiles, and role-based access.
- **Bulk Operations**: Import medicines, filter/search inventories, and handle bulk updates.
- **Reporting & Analytics**: Generate pharmacy reports for insights into sales and stock.
- **Future-Ready**: Designed for extensions like AI-powered prescription analysis.

---

## 👥 User Roles

| Role          | Capabilities                                                                 |
|---------------|-----------------------------------------------------------------------------|
| **Customer**  | Browse medicines, add to cart, view matching pharmacies, place/track orders. |
| **Pharmacy**  | Manage inventory/prices/stock, process incoming orders, view dashboards.     |
| **Admin**     | Register users/admins, manage categories/inventories, oversee system activity. |

---

## 🏗️ Architecture Overview

Rujta follows industry-best practices for maintainability and scalability:

- **Backend**: Clean/Onion Architecture with ASP.NET Core 8.
  - Layers: API (Presentation), Application (Business Logic), Domain (Core Entities), Infrastructure (Data Access).
  - Supports EF Core for SQL Server, SignalR for real-time, and Itinero for routing.

- **Frontend**: Feature-Based Architecture with React and Vite.
  - Organized by domains (e.g., auth, orders, pharmacies) for modularity.
  - Uses Tailwind CSS for styling, Framer Motion for animations, and Axios for API interactions.

This structure ensures loose coupling, easy testing, and seamless full-stack integration.

---

## 🛠️ Technologies Stack

### Backend
- ASP.NET Core 8
- Entity Framework Core (ORM)
- AutoMapper & FluentValidation
- JWT Bearer Authentication & Firebase
- SignalR for Real-Time
- Itinero for Routing & F23.StringSimilarity for Fuzzy Search
- Swashbuckle for Swagger API Docs

### Frontend
- React 18 with React Router
- Vite for Fast Builds
- Tailwind CSS & Framer Motion
- Axios & JWT-Decode for Auth
- Recharts for Visualizations
- Lucide-React Icons & AOS for Animations

### Database & Tools
- SQL Server (Primary DB)
- Redis (Caching, optional)
- Git for Version Control

---

## 🔒 Security Features

- **Authentication**: JWT with refresh tokens, Google OAuth, and Firebase integration.
- **Authorization**: Role-based access control.
- **Data Protection**: Secure hashing, input validation, and protection against SQL Injection/XSS.
- **Encryption**: HTTPS/SSL for all communications; sensitive data via environment variables.
- **Best Practices**: Token rotation, CORS handling via Vite proxy, and centralized error handling.

---

## 🚀 Getting Started Locally

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- Node.js (v18+) & npm
- SQL Server (Local instance)
- Set Environment Variable: `JWT__CertPassword="Rujta123987"` (for JWT signing)

### Backend Setup
1. Clone the repo: `git clone https://github.com/yourusername/rujta.git`
2. Navigate: `cd Backend/Rujta`
3. Restore packages: `dotnet restore`
4. Update connection string in `appsettings.Development.json`
5. Apply migrations: `dotnet ef database update --project Rujta.Infrastructure --startup-project Rujta.API`
6. Run: `dotnet run --project Rujta.API`
   - API available at: `https://localhost:7065/swagger`

### Frontend Setup
1. Navigate: `cd Frontend/rujta-frontend`
2. Install: `npm install`
3. Run: `npm run dev`
   - App available at: `http://localhost:5173`

**Tip**: Use `npm run dev` in frontend to auto-proxy API calls to backend, avoiding CORS issues.

For production builds and deployment, refer to the [Developer Documentation](docs/index.md).

---

## 🔮 Future Enhancements
- **AI Integration**: Prescription image analysis for automatic medicine extraction.
- **Mobile Apps**: Native iOS/Android versions.
- **Payments & Delivery**: Integrate payment gateways and logistics APIs.
- **Advanced Analytics**: AI-driven insights for trends and predictions.
- **Multi-Language Support**: For global accessibility.

---

## 👥 Contributors

| Name              | Role                  |
|-------------------|-----------------------|
| Abdelrahman Hamdy | Full-Stack Developer  |
| Mohamed Ahmed     | Backend Developer     |
| Youssef Wael      | Backend Developer     |
| Sabah Saber       | Frontend Developer    |

**Supervisor**: Dr. Mohamed Fakhry

This is an academic graduation project focused on real-world pharmacy solutions.

---

## 📧 Contact
For inquiries, issues, or collaborations:  
📧 [rujta.pharmacy@example.com](mailto:rujta.pharmacy@example.com)  
🌐 [GitHub Repository](https://github.com/yourusername/rujta)  

We welcome contributions! Check the [Developer Docs](docs/index.md) for guidelines.

---

*Licensed under MIT. Built with ❤️ for better healthcare access.*