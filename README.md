# University Complaint Management System

A university complaint management application built with HTML, CSS, vanilla JavaScript, Node.js, Express, MongoDB, and Mongoose.

## Main Features

- Student registration, login, and logout
- Session-based authentication and role-based access control
- Complaint submission, search, filtering, status tracking, and history
- Administrative priority updates, status updates, and responses
- Student and administrator dashboards with database-calculated statistics
- Light and dark themes
- Responsive plain HTML/CSS frontend

## Setup

1. Install dependencies:

```powershell
npm install
```

2. Copy `.env.example` to `.env` and set your own values:

```powershell
Copy-Item .env.example .env
```

3. Add the MongoDB connection string supplied for this project as `MONGO_URL`.

4. Generate a long random `SESSION_SECRET`.
5. Optionally set `SUPPORT_EMAIL` to the organisation's support address.

5. Start the application:

```powershell
npm start
```

## Initial Administrator

Set the following values in `.env`:

```text
ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Then run:

```powershell
npm run create-admin
```

The setup script creates an administrator only when no administrator account already exists. Passwords are hashed with bcrypt before storage.

## Testing Status

Database connection and live feature testing are intentionally paused until `MONGO_URL` is available.

When the connection string is provided, test:

- Server startup and MongoDB connection
- Student registration and duplicate validation
- Login and logout
- Session protection and role permissions
- Complaint submission and ownership
- Complaint search and filtering
- Administrator status, priority, and response updates
- Student dashboard and administrator statistics
- Responsive layouts and theme switching

## Project Structure

```text
public/                 Plain HTML, CSS, and browser JavaScript
src/app.js              Express application and sessions
src/config/             Database and central option configuration
src/controllers/        Application request logic
src/middleware/         Authentication and role middleware
src/models/             Mongoose models
src/routes/             Express API routes
src/scripts/            Protected setup scripts
src/utils/              Shared helpers
index.js                Application entry point
```
