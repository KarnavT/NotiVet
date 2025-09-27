# NotiVet - Veterinary Drug Information Platform

NotiVet is a comprehensive platform that connects pharmaceutical companies with veterinary professionals through targeted drug information and notifications. Built with Next.js, Prisma, and PostgreSQL.

## Features

- **Dual User Types**: Separate authentication and features for HCPs and pharmaceutical companies
- **Drug Database**: Comprehensive searchable database with species, delivery methods, and FARAD information
- **Targeted Notifications**: Pharmaceutical companies can send notifications to HCPs based on species specialties
- **Analytics Dashboard**: Track message engagement, open rates, and click-through rates
- **Saved Drugs**: HCPs can save drugs for quick reference
- **JWT Authentication**: Secure token-based authentication

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT tokens with bcryptjs
- **Validation**: Zod schemas
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd notivet
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your database connection string and secrets.

4. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with sample data
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## API Endpoints

### Authentication

- `POST /api/auth/register/hcp` - Register HCP user
- `POST /api/auth/register/pharma` - Register pharmaceutical company
- `POST /api/auth/login` - Login for all user types

### User Management

- `GET /api/user/profile` - Get user profile (authenticated)
- `PUT /api/user/profile` - Update user profile (authenticated)

### Drug Database

- `GET /api/drugs` - Search and list drugs (authenticated)
- `POST /api/drugs` - Create new drug (pharma only)
- `GET /api/drugs/[id]` - Get specific drug (authenticated)
- `PUT /api/drugs/[id]` - Update drug (pharma only)
- `DELETE /api/drugs/[id]` - Delete drug (pharma only)

### Saved Drugs (HCP Only)

- `GET /api/drugs/saved` - Get saved drugs
- `POST /api/drugs/saved` - Save a drug
- `DELETE /api/drugs/saved/[id]` - Remove saved drug

### Notifications

- `GET /api/notifications` - Get notifications (HCP: received, Pharma: sent)
- `POST /api/notifications` - Send notification (pharma only)
- `POST /api/notifications/[id]/track` - Track notification engagement (HCP only)

### Analytics (Pharma Only)

- `GET /api/analytics` - Get engagement analytics and metrics

## Database Schema

The application uses the following main models:

- **User**: Base user model with UserType (HCP or PHARMA)
- **HCPProfile**: Extended profile for veterinary professionals
- **PharmaProfile**: Extended profile for pharmaceutical companies
- **Drug**: Drug information with species, delivery methods, and FARAD data
- **Notification**: Messages sent from pharma to HCPs
- **NotificationActivity**: Tracking for opens/clicks
- **Analytics**: Aggregated engagement metrics
- **SavedDrug**: HCP's saved drug references

## Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:migrate   # Create and run migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
```

## Sample Users

After running `npm run db:seed`, you can use these test accounts:

**HCP User:**
- Email: dr.smith@vetclinic.com
- Password: password123
- Specialties: Canine, Feline

**Pharma User:**
- Email: contact@pharmaco.com
- Password: password123
- Company: PharmaCo Veterinary Solutions

## Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NEXTAUTH_SECRET`: Secret for Next.js auth
- `NODE_ENV`: Environment (development/production)

## API Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

Get the token from the login endpoint response.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.