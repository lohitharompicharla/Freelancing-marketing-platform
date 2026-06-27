# FreelanceFlow

A full-stack freelancer marketplace demo with smart projects, skill matching, reviews, internships, and beginner learning paths.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database layer: Mongo-ready models with a demo JSON store for local runs

## Demo Credentials

- Client: `client@example.com` / `password123`
- Freelancer: `riya@example.com` / `password123`

## Run Locally

1. Install Node.js 18+ and npm.
2. From the project root run:
   - `npm install`
   - `npm run install:all`
   - `npm run seed`
   - `npm run dev`
3. Open `http://localhost:5173`

## Notes

- Main app URL: `http://localhost:5173`
- API URL: `http://localhost:5000/api`
- Frontend API calls can use `/api` through the Vite proxy while running locally.
- The frontend falls back to built-in demo data if the backend is unavailable.
- MongoDB can be enabled later by wiring the controllers to Mongoose queries and setting `MONGO_URI`.
