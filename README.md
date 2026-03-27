# Co-Working Space Booking System

Backend API for managing co-working space bookings built with Node.js, TypeScript, and Express.

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Logging:** Winston
- **Validation:** Zod
- **Testing:** Jest

## Architecture

This project follows **Clean Architecture** with four layers:

```
src/
├── domain/          # Entities, repository interfaces
├── application/     # Use cases (business logic)
├── infrastructure/  # Database, logging, external services
└── interfaces/      # Controllers, routes, middleware
```

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL database

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

### Database Setup

```bash
npx prisma migrate dev
npx prisma generate
npm run prisma:seed
```

### Running the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### Running Tests

```bash
npm test
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Spaces
- `GET /api/spaces` - List all available spaces (public)
- `GET /api/spaces?type=DESK` - Filter spaces by type
- `POST /api/spaces` - Create a new space (Admin only)

### Health
- `GET /api/health` - Health check endpoint

## Team

- **Arshit Pansheriya** (8909765)
- **Dharm Patel** (9041265)

PROG3271 – Section 2
