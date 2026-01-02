# Frontend Guide for Rujta

This guide provides a comprehensive overview of the **Rujta** frontend architecture, technology stack, and development practices. It is designed for developers to understand the structure, setup, and best practices for building and maintaining the user interface.

## Overview

The frontend is developed using **React** with **Vite** as the build tool, delivering a modern, performant, and responsive interface. It integrates seamlessly with the ASP.NET Core backend via RESTful APIs, ensuring efficient data exchange and a smooth user experience.

The design prioritizes scalability, maintainability, and adherence to production-grade standards, making it suitable for real-world applications.

---

## Technology Stack

- **React**: Core library for building dynamic, component-based UIs.
- **Vite**: High-speed development server and bundler for fast builds and hot module replacement.
- **JavaScript (ES6+)**: Modern syntax for enhanced readability and functionality.
- **Axios**: Promise-based HTTP client for API interactions with the backend.

---

## Key Installed Packages

The frontend leverages a curated set of dependencies to support core features, UI enhancements, and development efficiency. These are managed in `package.json` and installed via `npm install`.

### Core Libraries
- **react / react-dom**: Foundation for rendering and managing UI components.
- **react-router-dom**: Enables declarative routing and navigation.

### HTTP & Authentication
- **axios**: Facilitates API requests with robust error handling.
- **jwt-decode**: Decodes JWT tokens for client-side user data extraction.
- **@react-oauth/google**: Integrates Google OAuth for secure authentication.

### UI & Animations
- **tailwindcss**: Utility-first CSS framework for rapid, customizable styling.
- **framer-motion**: Adds fluid animations and transitions.
- **lucide-react / react-icons**: Provides scalable icon sets for UI elements.
- **aos (Animate On Scroll)**: Implements scroll-triggered animations.

### Charts & Visualization
- **recharts**: Supports interactive charts for data dashboards.

### Tooling & Development
- **vite**: Powers the development and build pipeline.
- **concurrently**: Runs multiple scripts (e.g., frontend and backend) simultaneously.
- **eslint**: Enforces code linting and style consistency.

To install all dependencies:
```bash
npm install
```

---

## Architecture

The frontend adopts a **Feature-Based Architecture**, organizing code by business domains rather than file types. Each feature is modular, containing its own API logic, hooks, and UI components.

This structure promotes:
- **Modularity**: Features are independent and reusable.
- **Scalability**: Easy to add new features without impacting existing ones.
- **Collaboration**: Teams can work on isolated features.

It aligns with the backend's Clean Architecture for end-to-end consistency.

### Why Feature-Based Architecture?
- **Separation of Concerns**: Groups related logic together.
- **Maintainability**: Simplifies refactoring and debugging.
- **Scalability**: Supports growth in large-scale applications.
- **Team Efficiency**: Reduces merge conflicts in collaborative environments.
- **Alignment with Backend**: Mirrors domain-driven design principles.

---

## Feature Structure

Each feature directory includes:
- **api/**: Feature-specific API endpoints and request handlers.
- **hook/**: Custom React hooks for state, effects, and logic.
- **pages/**: UI components and views for the feature.

This encapsulation keeps features self-contained and testable.

---

## API Client

API interactions are centralized in `shared/api/apiClient.ts`, which:
- Configures base URLs and defaults.
- Adds JWT authorization headers.
- Implements request/response interceptors for logging and errors.
- Ensures uniform error handling.

Benefits:
- **Consistency**: Uniform API behavior across features.
- **Maintainability**: Single point for updates (e.g., auth changes).
- **Debugging**: Easier to trace network issues.

Features import and extend this client for domain-specific endpoints.

---

## API Proxy Configuration

During development, Vite's proxy forwards `/api` requests to the backend, resolving CORS issues and simplifying URLs.

### Why Use a Proxy?
- **CORS Avoidance**: Prevents cross-origin errors in local setups.
- **Environment Agnostic**: Uses relative paths, mimicking production.
- **Simplicity**: No need to hardcode backend URLs.

### How It Works
- Frontend: Runs on `http://localhost:5173`.
- Backend: Runs on `https://localhost:7065`.
- Proxy Rule: Requests to `/api/*` are redirected to the backend.

This enables seamless local development without configuration changes.

---

## Development Workflow

1. Install dependencies: `npm install`.
2. Start the development server: `npm run dev`.

   This command automatically runs both the frontend (using Vite) and the backend (using ASP.NET Core) simultaneously via the `concurrently` package. You do not need to start the backend separately in another terminal or process—it handles everything in one go for a full-stack development experience.
3. Access the app at `http://localhost:5173`.
4. Use API proxy for backend calls.

The architecture supports extensibility, such as integrating AI for prescription analysis.

---

## Summary

- **Feature-Based Architecture**: Enhances organization and scalability.
- **Centralized API Client**: Streamlines backend communication.
- **Vite Proxy**: Facilitates smooth local development.
- **Production-Ready**: Aligns with industry standards for maintainable code.

For troubleshooting or advanced topics, refer to the project repository or additional docs. If issues arise, check console logs or network tabs for insights.