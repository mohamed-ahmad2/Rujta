# Frontend Guide

## Overview

The frontend of **Rujta** is built using **React** with **Vite** as the build tool.
It provides a modern, fast, and responsive user interface that communicates with
the ASP.NET Core backend through RESTful APIs.

The frontend is designed to be scalable, maintainable, and aligned with real-world
production standards.

---

## Tech Stack

- **React** – UI library for building component-based interfaces
- **Vite** – Fast development server and build tool
- **JavaScript (ES6+)**
- **Axios** – HTTP communication with the backend

---

## Key Installed Packages

The frontend relies on several important packages to support core functionality,
development workflow, and user experience. Below are the most significant ones:

### Core Libraries
- **react / react-dom**  
  The core libraries for building the user interface and rendering components.

- **react-router-dom**  
  Handles client-side routing and navigation between pages.

### HTTP & Authentication
- **axios**  
  Used for making HTTP requests to the backend APIs.

- **jwt-decode**  
  Decodes JWT tokens on the client side to extract user information.

- **@react-oauth/google**  
  Enables Google OAuth authentication integration.

### UI & Animations
- **tailwindcss**  
  Utility-first CSS framework used for styling the application.

- **framer-motion**  
  Provides animations and transitions for a smoother user experience.

- **lucide-react / react-icons**  
  Icon libraries used throughout the UI.

- **aos (Animate On Scroll)**  
  Adds scroll-based animations.

### Charts & Visualization
- **recharts**  
  Used for charts and data visualization, especially in dashboards.

### Tooling & Development
- **vite**  
  Fast development server and build tool.

- **concurrently**  
  Allows running the frontend and backend servers together using a single command.

- **eslint**  
  Ensures code quality and enforces consistent coding standards.

---

All dependencies are managed via **npm** and defined in the `package.json` file.
To install them, simply run:

```bash
npm install
```
---

## Architecture

The frontend follows a **Feature-Based Architecture**, where the application
is organized by features (domains) rather than technical file types.

Each feature is self-contained and includes its own API logic, hooks, and pages.
This approach improves scalability, maintainability, and clarity as the project grows.

### Why Feature-Based Architecture?

- Clear separation of concerns per feature
- Easier maintenance and refactoring
- Better scalability for large applications
- Suitable for team collaboration
- Aligns well with backend Clean Architecture

---

## Feature Structure

Each feature contains:

- **api/**  
  Handles API requests related to the feature

- **hook/**  
  Custom React hooks for business logic and state management

- **pages/**  
  UI pages and screens for the feature

---

## Project Structure

```text
src/
├── features/
│ ├── auth/
│ │ ├── api/
│ │ ├── hook/
│ │ └── pages/
│ ├── dashboard/
│ │ ├── api/
│ │ ├── hook/
│ │ └── pages/
│ ├── profile/
│ │ ├── api/
│ │ ├── hook/
│ │ └── pages/
│ ├── user/
│ │ ├── api/
│ │ ├── hook/
│ │ └── pages/
│ └── order/
│ ├── api/
│ ├── hook/
│ └── pages/
├── assets/
├── routes/
├── shared/
│ ├── api/
│ │ └── apiClient.ts
│ └── components/
├── App.jsx
└── main.jsx
```

---

## API Client

All HTTP communication with the backend is centralized in a shared **apiClient**.

The `apiClient.ts` file is responsible for:

- Defining the base API configuration
- Attaching authorization headers (JWT tokens)
- Managing request and response interceptors
- Providing consistent error handling across the application

Centralizing API logic ensures:

- No duplicated Axios configuration
- Easier debugging and maintenance
- Consistent request behavior across all features

Each feature uses the shared `apiClient` to define its own API functions.

---

## API Proxy Configuration

The frontend uses a **Vite proxy** to forward API requests to the backend during development.

### Why Use a Proxy?

- Avoids CORS issues during local development
- Allows using relative API paths such as `/api/...`
- Keeps frontend code environment-agnostic
- Matches production behavior more closely

### How It Works

- All requests starting with `/api` are proxied to the backend
- Frontend runs on: `https://localhost:5173`
- Backend runs on: `https://localhost:7065`

This setup allows seamless communication between frontend and backend without
hardcoding backend URLs.

---

## Development Workflow

- Frontend and backend can be run together using a single command
- Frontend sends API requests through the Vite proxy
- Backend handles requests securely over HTTPS
- The architecture supports future scaling and new features, such as
  AI-powered prescription reading

---

## Summary

- Feature-Based Architecture improves scalability and maintainability
- `apiClient` centralizes API communication logic
- Vite proxy simplifies local development and avoids CORS issues
- The frontend structure aligns with real-world production standards