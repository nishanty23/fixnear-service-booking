# FixNear – Local Service Booking Platform

FixNear is a full-stack web application that connects customers with nearby service professionals such as plumbers, electricians, AC technicians, carpenters, and appliance repair technicians.

Customers can explore services, compare providers, submit service requests, and review completed work. Service providers can manage their profiles, list services, and handle customer requests.

## Features

### Customer
- Register and log in securely.
- Browse service categories and available services.
- Discover service providers.
- Submit and manage service requests.
- Cancel eligible requests.
- Review completed services.

### Service Provider
- Register and create a service provider profile.
- Manage business information and availability.
- Add, update, and deactivate services.
- View incoming service requests.
- Accept, reject, and update request statuses.

### Admin
- Manage service categories.
- Access admin-protected operations.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JWT |
| Password Security | bcryptjs |
| API Testing | Postman |
| Version Control | Git and GitHub |

## Project Structure

```text
FixNear/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│
└── README.md
```

*The frontend and backend structure may evolve as development continues.*

## User Roles

FixNear supports three roles:

- `USER` – Customers who request services.
- `SERVICE_PROVIDER` – Professionals who offer services.
- `ADMIN` – Administrators who manage platform data.

Role-based authorization protects restricted API operations.

## Backend Setup

### 1. Clone the repository

```bash
git clone https://github.com/nishanty23/fixnear-service-booking.git
cd fixnear-service-booking
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `backend` directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Use your own MongoDB Atlas connection string and a strong JWT secret. Do not commit this file to GitHub.

### 4. Start the backend server

Development mode:

```bash
npm run dev
```

Normal mode:

```bash
npm start
```

The backend runs at:

```text
http://localhost:5000
```

Test the root endpoint:

```http
GET http://localhost:5000/
```

## API Routes

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get authenticated user's profile |
| GET | `/api/categories` | Get service categories |
| POST | `/api/categories` | Create a category (Admin) |
| PUT | `/api/categories/:id` | Update a category (Admin) |
| DELETE | `/api/categories/:id` | Delete a category (Admin) |
| GET | `/api/providers` | Browse service providers |
| GET | `/api/providers/:id` | Get provider details |
| POST | `/api/providers/profile` | Create provider profile |
| PUT | `/api/providers/profile` | Update provider profile |
| GET | `/api/services` | Browse services |
| GET | `/api/services/:id` | Get service details |
| POST | `/api/services` | Create a service |
| PUT | `/api/services/:id` | Update a service |
| DELETE | `/api/services/:id` | Deactivate a service |
| POST | `/api/requests` | Submit a service request |
| GET | `/api/requests/my` | Get customer's requests |
| PUT | `/api/requests/:id/cancel` | Cancel an eligible request |
| GET | `/api/requests/provider` | Get provider's requests |
| PUT | `/api/requests/:id/status` | Update request status |
| POST | `/api/reviews` | Submit a review |
| GET | `/api/reviews/provider/:providerId` | Get provider reviews |

Protected endpoints require a JWT Bearer Token. Role restrictions apply where specified.

## Database Models

The backend uses Mongoose models for:

- User
- ServiceCategory
- ServiceProvider
- Service
- ServiceRequest
- Review

These models use MongoDB ObjectId references to represent relationships between customers, providers, services, requests, categories, and reviews.

## Development Status

The backend foundation, MongoDB connection, authentication, role-based authorization, data models, controllers, and API routes have been created.

API testing and frontend development are ongoing. Features will be updated as the project progresses.

## Team Collaboration

This project is developed collaboratively using Git and GitHub.

- `main` is the protected stable branch.
- Developers should work on separate feature branches.
- Changes should be submitted through Pull Requests.
- Changes should be reviewed before merging into `main`.

## Future Improvements

- React-based user interface.
- Location-based provider discovery.
- Provider availability and scheduling improvements.
- Booking notifications.
- Admin dashboard.
