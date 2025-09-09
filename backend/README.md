# FinanceHub Backend API

A comprehensive backend API for the FinanceHub personal finance dashboard application.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with refresh tokens
- **User Management**: Profile management, password changes
- **Transaction Management**: CRUD operations for financial transactions
- **Account Management**: Multiple account types (checking, savings, credit, investment)
- **Category Management**: Customizable transaction categories
- **Savings Goals**: Track and manage savings targets
- **Freelance Management**: Project tracking, time logging, invoice management
- **Salary Management**: Gross/net salary calculations with deductions
- **Recurring Transactions**: Automated recurring transaction management
- **Dashboard Analytics**: KPI calculations, financial overviews
- **Reports**: Comprehensive financial reporting
- **Data Export**: Backup and export functionality

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Validation**: Joi
- **Security**: Helmet, CORS
- **Logging**: Morgan

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the environment example file and configure your settings:

```bash
cp env.example .env
```

Update the `.env` file with your database credentials and other settings:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/financehub_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

### 3. Database Setup

Generate Prisma client and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 4. Seed Database (Optional)

Populate the database with sample data:

```bash
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user

### Dashboard Endpoints

- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/kpis` - Get KPI data
- `GET /api/dashboard/recent-transactions` - Get recent transactions
- `GET /api/dashboard/savings-goals` - Get savings goals
- `GET /api/dashboard/freelance-summary` - Get freelance summary
- `GET /api/dashboard/upcoming-recurring` - Get upcoming recurring transactions

### Health Check

- `GET /health` - API health status

## 🗄️ Database Schema

The application uses the following main entities:

- **User**: User accounts and profiles
- **Account**: Financial accounts (checking, savings, credit, investment)
- **Transaction**: Financial transactions
- **Category**: Transaction categories
- **SavingsGoal**: Savings targets and progress
- **FreelanceProject**: Freelance work projects
- **Invoice**: Freelance invoices
- **Salary**: Salary configuration and deductions
- **RecurringTransaction**: Recurring financial transactions

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Rate limiting (configurable)
- SQL injection prevention via Prisma

## 📊 Data Models

All monetary values are stored in cents to avoid floating-point precision issues. The API automatically converts between cents and dollars for client consumption.

## 🧪 Testing

```bash
npm test
```

## 🚀 Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

## 🔄 API Versioning

The API uses URL-based versioning. Current version is v1 (implicit).

## 📈 Performance Considerations

- Database queries are optimized with proper indexing
- Pagination is implemented for large datasets
- Caching can be added for frequently accessed data
- Connection pooling is handled by Prisma

## 🔧 Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data
