# Krish Homestay Booking System

## Prerequisites
1.  **Node.js** (v14+)
2.  **PostgreSQL** (running on port 5432)

## Setup

### 1. Database
Create a PostgreSQL database named `krish_homestay`.
```bash
createdb krish_homestay
```
(Or use your preferred SQL tool).

The application will automatically create the `bookings` table on first run.

### 2. Backend (Server)
Navigate to the `server` directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in `server/` if you need to customize DB credentials:
```
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=krish_homestay
DB_HOST=localhost
PORT=5000
```

Start the server:
```bash
node index.js
```

### 3. Frontend (Client)
Navigate to the `client` directory and install dependencies:
```bash
cd client
npm install
```

Start the development server:
```bash
npm run dev
```

The website will be available at `http://localhost:5173`.

## Features
*   **Home Page**: Hero section, About, Amenities, Rooms, Gallery.
*   **Booking System**: Check availability, book dates, price calculation.
*   **Admin API**: Endpoints to manage bookings (located in `server/routes/api.js`).

## Deployment
1.  Build the frontend: `cd client && npm run build`.
2.  Serve the `client/dist` folder from the Express server (uncomment the static file serving lines in `server/index.js`).
3.  Deploy the `server` folder to a host like Render, Heroku, or DigitalOcean.
