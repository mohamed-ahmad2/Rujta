# 💊 Rujta – Pharmacy Management & Ordering System

[![.NET](https://img.shields.io/badge/.NET-8.0-blue?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/) 
[![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react&logoColor=white)](https://reactjs.org/) 
[![Vite](https://img.shields.io/badge/Vite-4.3.9-brightgreen?logo=vite&logoColor=white)](https://vitejs.dev/) 
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.3.2-blue?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/) 
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

Rujta is a **web-based pharmacy management and medicine ordering platform** that connects users with pharmacies efficiently, helping them find medicines quickly and place orders with ease.

---

## 🌍 Why Rujta?
Finding medicines across multiple pharmacies is time-consuming and inefficient.  
Rujta solves this problem by providing a **centralized system** that matches user cart items with the most suitable pharmacies.

---

## 🚀 Core Functionality

### 🔄 Order Flow
1. **Add Products to Cart** – Users browse medicines and add required items to their cart.  
2. **Search & Matching** – The system searches registered pharmacies based on cart items.  
3. **Ranking Logic** – Pharmacies are evaluated according to product availability and matching criteria.  
4. **Final Result** – The system returns the **Top 15 pharmacies** that best match the cart items.

---

## 👥 User Roles

### 🧑 Customer
- Browse medicines
- Add medicines to cart
- View matching pharmacies
- Place orders

### 🏪 Pharmacy
- Manage medicine inventory
- Update prices and stock
- View and process incoming orders
- Track order status

### 🛠️ Admin (Optional)
- Manage users and pharmacies
- Monitor system activity

---

## 🧱 System Architecture
- **Frontend:** Web interface for users and pharmacies  
- **Backend API:** Business logic and order processing  
- **Database:** Users, pharmacies, medicines, and orders  
- **Caching:** Performance optimization  

---

## 🛠️ Technologies Used

### Frontend
- React.js  
- Vite  
- Tailwind CSS  
- Framer Motion  

### Backend
- C# / ASP.NET Core  
- RESTful API  
- JWT Authentication  

### Database
- SQL Server  
- Redis (Caching)  

### Version Control
- Git  
- GitHub  

---

## 🔐 Security
- JWT-based authentication  
- Role-based authorization  
- Secure password hashing  
- Input validation  
- Protection against SQL Injection & XSS  
- Encrypted communication (SSL/TLS)  
- Refresh Token Rotation  

---

## 🏃 How to Run Rujta Locally

### 1️⃣ Backend (ASP.NET Core)

**Prerequisites:**
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)  
- SQL Server  
- Optional: Redis for caching  

**Steps:**
1. Clone the repository:  

git clone https://github.com/yourusername/rujta.git
cd Rujta/Backend/Rujta
Configure the database connection in appsettings.json:

json
Copy code
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=RujtaDB;Trusted_Connection=True;"
  }
}
Apply migrations and update the database:



dotnet ef database update
Run the backend API:


dotnet run
The API should now be running at:


https://localhost:5001 or http://localhost:5000
2️⃣ Frontend (React + Vite)
Prerequisites:

Node.js (v18+)

npm or yarn

Steps:

Navigate to the frontend folder:


cd Rujta/Frontend
Install dependencies:


npm install
# or
Start the development server:


Copy code
npm run dev
# or

http://localhost:5173
Make sure to update the API URL in .env or vite.config.js to point to your running backend.

⚡ Notes:

Start the backend before starting the frontend.

For production, build the frontend:
npm run build

## 🔮 Future Enhancements
The following features are **planned and not part of the current implementation**:

- 🤖 **AI Prescription Reading**  
  Automated extraction of medicines from uploaded prescription images.

- 📱 Mobile Applications  
  Native iOS and Android apps.

- 💳 Online Payments  
  Secure in-app payment integration.

- 🚚 Delivery Integration  
  Home delivery service support.

- 📊 Advanced Analytics  
  Sales insights and medicine trends for pharmacies.

- 🌐 Multi-language Support  

---

## 👨‍💻 Team Members

| Name | Role |
|------|------|
| Abdelrahman Hamdy | Backend & Frontend Developer |
| Mohamed Ahmed | Backend Developer |
| Youssef Wael | Backend Developer |
| Sabah Saber | Frontend Developer |

---

## 🎓 Academic Information
- **Project Type:** Graduation Project  
- **Supervisor:** Dr. Mohamed Fakhry  


---

## 📬 Contact
📧 rujta.pharmacy@example.com
