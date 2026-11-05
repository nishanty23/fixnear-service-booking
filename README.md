# FixNear – Local Service Booking Platform

FixNear is a full-stack web application that connects customers with local service professionals. Customers can discover services, compare prices, book appointments, track service requests and review completed services.

Service providers can manage their profiles, list services and handle customer bookings. Administrators can manage service categories.

## Features

### Customer
- Register and log in securely.
- Browse available service categories and services.
- Search services by name, description or category and sort by price.
- Explore service providers and their pricing.
- Book services by providing appointment and address details.
- View booking history and request status.
- Hide completed or cancelled bookings from personal history without deleting the underlying records.
- Cancel eligible bookings.
- Submit ratings and reviews for completed services.

### Service Provider
- Log in using a provider account.
- Create and manage a service provider profile.
- Add and manage services and prices.
- View customer booking requests.
- Accept or reject pending requests.
- Update booking status to In Progress or Completed.
- Receive customer ratings and reviews.

### Administrator
- Access the admin dashboard.
- Create new service categories.
- View existing categories.
- Update category names.
- Delete categories that are not being used by services.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JSON Web Token (JWT) |
| Password Security | bcryptjs |
| API Communication | Axios, REST API |
| Routing | React Router |
| Development Tools | VS Code, Postman, Git, GitHub |

## System Architecture

The application follows a client-server architecture.

1. The React frontend provides the user interface.
2. Axios sends HTTP requests to the Express backend.
3. Express routes direct requests to the appropriate controllers.
4. Middleware handles authentication and role-based authorization.
5. Mongoose communicates with MongoDB Atlas.
6. The backend returns JSON responses to the frontend.

```text
          React Frontend
                 |
              Axios
                 |
          Express Server
                 |
        Authentication Middleware
                 |
             Controllers
                 |
              Mongoose
                 |
           MongoDB Atlas
```

## Database Design

The application uses the following MongoDB collections:

| Model | Purpose |
|---|---|
| User | Stores user details, email, password hash and role |
| ServiceProvider | Stores provider business profiles and details |
| ServiceCategory | Stores service categories |
| Service | Stores services, descriptions and prices |
| ServiceRequest | Stores customer bookings and their status |
| Review | Stores customer ratings and feedback |

### Database Relationships

- A User can have one ServiceProvider profile.
- A ServiceProvider can offer multiple Services.
- Each Service belongs to a ServiceCategory.
- A ServiceRequest references a customer, provider and service.
- A Review references a customer, provider and completed service request.

## User Roles

The application supports three roles:

- `USER` – Customer who books services.
- `SERVICE_PROVIDER` – Professional who provides services.
- `ADMIN` – Administrator who manages categories.

Role-based authorization ensures that protected operations are available only to permitted users.

## API Endpoints

All API endpoints are prefixed with:

`http://localhost:5000/api`

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Log in |
| GET | `/auth/me` | Get logged-in user details |

### Categories

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/categories` | Get all categories |
| POST | `/categories` | Create category (Admin) |
| PUT | `/categories/:id` | Update category (Admin) |
| DELETE | `/categories/:id` | Delete category (Admin) |

### Services and Providers

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/services` | Browse services |
| POST | `/services` | Create service (Provider) |
| PUT | `/services/:id` | Update service (Provider) |
| DELETE | `/services/:id` | Deactivate service (Provider) |
| GET | `/providers` | Search providers |
| POST | `/providers` | Create provider profile |
| PUT | `/providers` | Update provider profile |

### Service Requests

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/requests` | Create booking |
| GET | `/requests/my` | Get customer bookings |
| GET | `/requests/provider` | Get provider bookings |
| PUT | `/requests/:id/status` | Update booking status |
| PUT | `/requests/:id/cancel` | Cancel eligible booking |
| PUT | `/requests/:id/hide` | Hide a completed/cancelled booking from the customer's history |
| PUT | `/requests/:id/hide` | Hide a completed/cancelled booking from the customer's history |

### Reviews

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/reviews` | Submit a review |
| GET | `/reviews/provider/:providerId` | Get provider reviews |

Protected endpoints require a valid JWT access token. Role-specific endpoints additionally require the appropriate user role.

## Installation and Setup

### Prerequisites

Install the following:

- Node.js and npm
- MongoDB Atlas account
- Git
- Code editor such as Visual Studio Code

### 1. Clone the repository

```bash
git clone https://github.com/nishanty23/fixnear-service-booking.git
cd fixnear-service-booking
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as a reference.

Add your MongoDB connection string, JWT secret and other required configuration values using the exact variable names in `.env.example`.

Start the backend:

```bash
npm run dev
```

Backend URL:

`http://localhost:5000`

### 3. Configure the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

`http://localhost:5173`

### 4. Run the application

Keep both frontend and backend servers running.

Open the frontend URL in your browser and register or log in to use FixNear.

## Security and Validation

- Passwords are hashed using bcryptjs.
- JWT is used for authentication.
- Protected routes use authentication middleware.
- Role-based authorization restricts administrative and provider operations.
- Backend validation checks incoming data.
- Service prices are obtained from database records when creating bookings.
- Duplicate reviews for the same service request are prevented.
- Categories referenced by services cannot be deleted.

## Additional Frontend Pages

- Home page with service search, category filters, price sorting and service cards.
- How It Works page explaining the booking lifecycle.
- FAQ page with common customer and provider questions.
- Customer and provider dashboards with booking summary statistics.

## Additional Frontend Pages

- Home page with service search, category filters, price sorting and service cards.
- How It Works page explaining the booking lifecycle.
- FAQ page with common customer and provider questions.
- Customer and provider dashboards with booking summary statistics.

## Future Enhancements

- Online payment integration.
- Real-time booking notifications.
- Interactive provider location maps.
- Provider availability calendar.
- Email and SMS notifications.
- Deployment to a cloud hosting platform.

## Project Information

**Project Name:** FixNear – Local Service Booking Platform

**Project Type:** Full-Stack Web Development Project

**Purpose:** To simplify the process of discovering and booking trusted local service professionals.

**Repository:** https://github.com/nishanty23/fixnear-service-booking

---

*Developed as an academic full-stack web development project.*