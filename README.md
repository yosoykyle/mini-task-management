# Mini Task Management System

A mini task management app built with **FastAPI**, **React**, **Kafka**, and **MySQL**.

## Prerequisites

Before running the project, ensure you have the following installed:

- **Docker Desktop** (for running Kafka)
- **MySQL Workbench** (or any local MySQL server running on port 3306)
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)

## 1. Database Setup

1.  Open **MySQL Workbench**.
2.  Run the following SQL query to create the database:
    ```sql
    CREATE DATABASE task_db;
    ```
    _(The tables will be automatically created by the Backend when it starts)_

## 2. Infrastructure Setup (Kafka)

1.  Open a terminal in the project root (`mini task management`).
2.  Start the Kafka services using Docker:
    ```powershell
    docker-compose up -d
    ```
3.  Wait about 30 seconds for the services to fully initialize.

## 3. Backend Setup

1.  Open a new terminal and navigate to the `backend` folder:
    ```powershell
    cd backend
    ```
2.  Create and activate the virtual environment:

    ```powershell
    # Create the venv (if not already existing)
    python -m venv venv

    # Activate it (REQUIRED)
    .\venv\Scripts\Activate.ps1
    ```

3.  Install dependencies:
    ```powershell
    pip install -r requirements.txt
    ```
4.  **Configuration**:
    - Ensure your `.env` file exists in the `backend` folder (`backend/.env`).
    - It should look like this (replace `YOUR_PASSWORD` with your actual MySQL password):
      ```properties
      # Note: If your password has special characters like '@', use URL encoding (e.g., %40 for @)
      # Example: for password "@1234", use "%401234"
      DATABASE_URL=mysql+mysqlconnector://root:YOUR_PASSWORD@localhost:3306/task_db
      KAFKA_BOOTSTRAP_SERVERS=127.0.0.1:9092
      ```
5.  Run the server:
    ```powershell
    uvicorn main:app --reload
    ```
    _The server is running at http://127.0.0.1:8000_

## 4. Frontend Setup

1.  Open a new terminal and navigate to the `frontend` folder:
    ```powershell
    cd frontend
    ```
2.  Install dependencies:
    ```powershell
    npm install
    ```
3.  Start the development server:
    ```powershell
    npm run dev
    ```
    _The app is available at http://localhost:5173_

## 5. Stopping the System

To stop the application and free up resources:

1.  **Frontend**: Press `Ctrl + C` in the frontend terminal to verify the server is stopped.
2.  **Backend**: Press `Ctrl + C` in the backend terminal to stop the storage API.
3.  **Kafka Services**: Run the following command in the project root to stop Docker containers:
    ```powershell
    docker-compose down
    ```

## Troubleshooting

- **Frontend looks like plain HTML?** Run `npm install tailwindcss@3.4.17` in the frontend folder.
- **Backend "Access Denied"?** Check your MySQL password in `backend/.env`. If it has an `@` symbol, verify it is URL encoded (`%40`).
- **Kafka Connection Error?** Restart Docker containers (`docker-compose down` -> `docker-compose up -d`) and ensure `KAFKA_BOOTSTRAP_SERVERS` is set to `127.0.0.1:9092` in `backend/.env`.
