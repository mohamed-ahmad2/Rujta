	# Getting Started

    This guide will help you set up the **Rujta** project locally and understand the development environments.

    ## Prerequisites

    Before running the project, make sure you have installed:

    - **.NET 8 SDK** – for the backend
    - **Node.js (v18+) and npm** – for the frontend
    - **SQL Server** – as the database
    - **Visual Studio 2022 / VS Code** – recommended IDEs

    ## Project Structure

    ```text
    Rujta/
    ├─ Backend/      # .NET 8 Web API project
    ├─ Frontend/     # React application
    └─ docs/         # Project documentation
    ```

    ## Development Environments

    Rujta supports multiple environments to separate configuration and deployment:

    1. **Development**
       - Used locally by developers
       - Debugging enabled
       - Local SQL Server connection
    2. **Staging**
       - Pre-production environment
       - Mirrors production settings
       - Used for testing features before deployment
    3. **Production**
       - Live environment accessible to users
       - Optimized for performance and security

    > Configuration for each environment is stored in `appsettings.{Environment}.json` in the backend, and `.env.{environment}` files in the frontend.

    ## Steps to Run Locally

    ### 1. Setup Backend
    ```bash
    cd Backend\Rujta
    # 1. Restore
	dotnet restore Rujta.API
	dotnet restore Rujta.Infrastructure
	dotnet restore Rujta.Application
	dotnet restore Rujta.Domain

	# 2. Build
	dotnet build Rujta.Domain
	dotnet build Rujta.Application
	dotnet build Rujta.Infrastructure
	dotnet build Rujta.API

	# 3. Run
	dotnet run --project Rujta.API
    ```
    - The backend will run on `https://localhost:7065/swagger/index.html` by default.  
    - Update the **connection string** in `backend/appsettings.Development.json` to match your SQL Server instance.
	- Note: Instead of running these commands manually, you can also press F5 in Visual Studio to build and run the backend directly.
	
    ### 2. Setup Database
    - Make sure SQL Server is running locally.  
    - Apply migrations if needed:
    Update Database :
	```bash
	dotnet ef database update --project Rujta.Infrastructure --startup-project Rujta.API
	```
	# or in PMC:
	```bash
	Update-Database -Project Rujta.Infrastructure -StartupProject Rujta.API
	```

    ### 3. Setup Frontend
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    - The frontend will run on `https://localhost:5173/` and connect automatically to the backend.

    ## Optional Tools

    - **Postman / Apidog** – for testing APIs  
    - **Git** – version control  

    By following these steps, developers can have a fully functional local environment of **Rujta**, ready for development and testing.