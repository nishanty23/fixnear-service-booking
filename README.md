# Ticket Booking System

A full-stack **MERN ticket booking system** where users can browse events, select shows and seats, and manage their bookings. Organizers can create and manage events and shows, while administrators can monitor users, events, and bookings.

The project focuses on building a practical booking system with **authentication, role-based authorization, REST APIs, MongoDB, seat management, and concurrency-safe booking**.

## Features

### User

- Register and login
- JWT-based authentication
- Browse available events
- View shows for an event
- Select available seats
- Book one or multiple seats
- View booking history
- Cancel bookings
- Protected user dashboard

### Organizer

- Secure organizer login
- Create events
- Update events
- Delete events
- Create and manage shows
- Manage show seat layouts
- View bookings for their events

### Admin

- Admin authentication
- View users
- View events
- View bookings
- Monitor booking activity
- Manage platform data

### Booking System

- Interactive seat selection
- Available/booked seat status
- Multiple-seat booking
- Booking confirmation
- Booking history
- Booking cancellation
- Cancelled seats become available again
- Prevention of duplicate seat bookings
- Server-side validation

## Tech Stack

### Frontend

- React
- React Router
- JavaScript
- HTML
- CSS

### Backend

- Node.js
- Express.js
- REST API
- JWT
- bcryptjs

### Database

- MongoDB
- Mongoose

### Development

- Git
- GitHub
- npm
- Nodemon

## Project Architecture

```text
ticket-booking-system/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── .env
│   ├── .gitignore
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── context/
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## Application Flow

```text
                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           │
                           ▼
                    Browse Events
                           │
                           ▼
                     Select Show
                           │
                           ▼
                     Select Seats
                           │
                           ▼
                     Confirm Booking
                           │
                           ▼
                    Booking Created
                           │
                           ▼
                    My Bookings
```

Organizer flow:

```text
Organizer
    │
    ▼
Create Event
    │
    ▼
Create Show
    │
    ▼
Configure Seats
    │
    ▼
Manage Event Bookings
```

## Authentication

The application uses **JWT-based authentication**.

After successful login:

```text
User
  │
  ▼
Login
  │
  ▼
Server validates credentials
  │
  ▼
JWT generated
  │
  ▼
Client stores authentication state
  │
  ▼
JWT sent with protected requests
```

The backend uses role-based middleware to restrict access to specific resources.

Roles:

```text
USER
ORGANIZER
ADMIN
```

## Booking Safety

A major goal of this project is to prevent the same seat from being booked by multiple users.

For example:

```text
User A ──┐
         ├──► Seat A5
User B ──┘
```

If both users attempt to book the seat at nearly the same time, the backend must ensure that only one booking succeeds.

This involves server-side availability checks and appropriate MongoDB operations/transactions to maintain data consistency.

## API Structure

The backend follows a layered architecture:

```text
Request
   │
   ▼
Route
   │
   ▼
Middleware
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Model
   │
   ▼
MongoDB
```

This keeps routing, business logic, authentication, and database operations separated.

## Planned API Modules

```text
/auth
/users
/events
/shows
/seats
/bookings
/admin
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ticket-booking-system.git
cd ticket-booking-system
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

The backend requires:

| Variable | Description |
|---|---|
| `PORT` | Port used by the Express server |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens |

Never commit the `.env` file to GitHub.

## Future Improvements

- Online payment integration
- Email booking confirmation
- QR-code based tickets
- Event search and filtering
- Pagination
- Advanced admin analytics
- Automated booking expiration
- Email notifications
- Deployment with a cloud database and hosting platform

## Learning Objectives

This project is designed to demonstrate practical understanding of:

- MERN stack development
- REST API design
- MongoDB and Mongoose
- JWT authentication
- Password hashing
- Role-based authorization
- Middleware
- CRUD operations
- Database relationships
- Input validation
- Error handling
- Seat availability management
- Transactions and concurrency
- React routing
- Protected frontend routes
- Full-stack application architecture

## Status

**🚧 Currently in development**

The project is being developed incrementally, starting with the backend API, database, authentication, and booking system before completing the React frontend.

## License

This project is intended for educational and portfolio purposes.
