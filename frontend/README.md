# Mini Task Management - Frontend

This is the React frontend for the Mini Task Management System.

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- The **Backend** server must be running (usually on `http://localhost:8000`)

## Setup Instructions

1.  **Navigate to the frontend directory:**

    ```bash
    cd frontend
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**

    - Create a file named `.env` in the `frontend` folder (if it doesn't exist).
    - Add the following line to point to your backend API:

    ```properties
    VITE_API_URL=http://localhost:8000
    ```

    _(If your backend is on a different IP/port, update this URL accordingly)_

4.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
    - The app should now be accessible at `http://localhost:5173` (or the port shown in the terminal).

## Building for Production

To create a production-ready build:

```bash
npm run build
```

The output will be in the `dist` folder.

## Troubleshooting

- **White Screen?** Check the console (F12) for errors. Ensure all imports are correct.
- **Connection Refused?** Ensure the Python Backend is running and `VITE_API_URL` is correct.
