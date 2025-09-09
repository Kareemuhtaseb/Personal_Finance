# 🏗️ Backend Development Reference

## 📊 UI Functionality to Backend Mapping

### **Dashboard View**
**Current UI Features:**
- Monthly financial overview (income, expenses, net savings, freelance income)
- KPI widgets with percentage changes
- Category breakdown charts
- Recent transactions list
- Savings goals progress
- Freelance KPIs
- Upcoming recurring items

**Backend Requirements:**
- **GET /api/dashboard/overview** - Monthly financial summary
- **GET /api/dashboard/kpis** - KPI data with trend calculations
- **GET /api/transactions/recent** - Recent transactions
- **GET /api/savings/goals** - Savings goals with progress
- **GET /api/freelance/summary** - Freelance metrics
- **GET /api/recurring/upcoming** - Upcoming recurring transactions

### **Transactions View**
**Current UI Features:**
- Transaction list with filtering (search, category, account)
- Add new transaction modal
- Transaction details (amount, category, account, date, cleared status)
- Transaction categorization

**Backend Requirements:**
- **GET /api/transactions** - List transactions with filters
- **POST /api/transactions** - Create new transaction
- **PUT /api/transactions/:id** - Update transaction
- **DELETE /api/transactions/:id** - Delete transaction
- **GET /api/transactions/categories** - Available categories
- **GET /api/accounts** - Available accounts

### **Salary View**
**Current UI Features:**
- Gross salary input
- Deductions management (taxes, 401k, etc.)
- Net salary calculation
- Monthly breakdown display

**Backend Requirements:**
- **GET /api/salary** - Get salary configuration
- **PUT /api/salary** - Update salary details
- **GET /api/salary/deductions** - Get deduction types
- **POST /api/salary/deductions** - Add custom deduction
- **DELETE /api/salary/deductions/:id** - Remove deduction

### **Savings View**
**Current UI Features:**
- Savings goals management
- Progress tracking with visual bars
- Quick transfer between accounts/goals
- Savings growth chart placeholder

**Backend Requirements:**
- **GET /api/savings/goals** - List all savings goals
- **POST /api/savings/goals** - Create new goal
- **PUT /api/savings/goals/:id** - Update goal
- **DELETE /api/savings/goals/:id** - Delete goal
- **POST /api/savings/transfer** - Transfer funds to goal
- **GET /api/savings/history** - Savings growth data

### **Freelance View**
**Current UI Features:**
- Active projects management
- Time tracking
- Invoice management
- Project status tracking

**Backend Requirements:**
- **GET /api/freelance/projects** - List projects
- **POST /api/freelance/projects** - Create new project
- **PUT /api/freelance/projects/:id** - Update project
- **GET /api/freelance/invoices** - List invoices
- **POST /api/freelance/invoices** - Create invoice
- **PUT /api/freelance/invoices/:id** - Update invoice status
- **GET /api/freelance/time-entries** - Time tracking data

### **Reports View**
**Current UI Features:**
- Report type selection (cashflow, income-expenses, categories, savings, freelance, budgets)
- Period selection (week, month, quarter, year)
- Chart placeholders for different report types
- Summary statistics
- Key insights
- PDF export functionality

**Backend Requirements:**
- **GET /api/reports/cashflow** - Cashflow data
- **GET /api/reports/income-expenses** - Income vs expenses
- **GET /api/reports/categories** - Category breakdown
- **GET /api/reports/savings** - Savings reports
- **GET /api/reports/freelance** - Freelance reports
- **GET /api/reports/budgets** - Budget vs actual
- **POST /api/reports/export** - Generate PDF reports

### **Settings View**
**Current UI Features:**
- Profile management (name, email, timezone, currency)
- Account management (checking, savings, credit cards)
- Category management with icons and colors
- Currency settings
- Automation rules (placeholder)
- Backup & export (placeholder)

**Backend Requirements:**
- **GET /api/user/profile** - Get user profile
- **PUT /api/user/profile** - Update profile
- **GET /api/accounts** - List user accounts
- **POST /api/accounts** - Add new account
- **PUT /api/accounts/:id** - Update account
- **GET /api/categories** - List categories
- **POST /api/categories** - Create category
- **PUT /api/categories/:id** - Update category
- **GET /api/currencies** - Available currencies
- **POST /api/backup/export** - Export data

## 🗄️ Core Data Models

### **User Model**
```typescript
interface User {
  id: string
  name: string
  email: string
  timezone: string
  currency: string
  createdAt: Date
  updatedAt: Date
}
```

### **Account Model**
```typescript
interface Account {
  id: string
  userId: string
  name: string
  type: 'checking' | 'savings' | 'credit' | 'investment'
  balance: number
  currency: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### **Transaction Model**
```typescript
interface Transaction {
  id: string
  userId: string
  accountId: string
  categoryId: string
  description: string
  amount: number
  date: Date
  type: 'income' | 'expense'
  cleared: boolean
  recurringId?: string
  createdAt: Date
  updatedAt: Date
}
```

### **Category Model**
```typescript
interface Category {
  id: string
  userId: string
  name: string
  icon: string
  color: string
  type: 'income' | 'expense'
  createdAt: Date
  updatedAt: Date
}
```

### **Savings Goal Model**
```typescript
interface SavingsGoal {
  id: string
  userId: string
  name: string
  target: number
  current: number
  color: string
  targetDate?: Date
  createdAt: Date
  updatedAt: Date
}
```

### **Freelance Project Model**
```typescript
interface FreelanceProject {
  id: string
  userId: string
  name: string
  client: string
  status: 'active' | 'completed' | 'paused'
  hourlyRate: number
  totalHours: number
  totalAmount: number
  createdAt: Date
  updatedAt: Date
}
```

### **Invoice Model**
```typescript
interface Invoice {
  id: string
  userId: string
  projectId: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  dueDate: Date
  invoiceNumber: string
  createdAt: Date
  updatedAt: Date
}
```

### **Salary Model**
```typescript
interface Salary {
  id: string
  userId: string
  gross: number
  deductions: SalaryDeduction[]
  net: number
  createdAt: Date
  updatedAt: Date
}

interface SalaryDeduction {
  id: string
  name: string
  amount: number
  type: 'tax' | 'benefit' | 'other'
}
```

### **Recurring Transaction Model**
```typescript
interface RecurringTransaction {
  id: string
  userId: string
  description: string
  amount: number
  categoryId: string
  accountId: string
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  nextDueDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

## 🔧 Technical Backend Requirements

### **Authentication & Authorization**
- JWT-based authentication
- User registration/login
- Password reset functionality
- Session management
- Role-based access control

### **Database**
- PostgreSQL for data persistence
- Database migrations
- Data validation and constraints
- Indexing for performance
- Backup and recovery

### **API Features**
- RESTful API design
- Request/response validation
- Error handling with proper HTTP status codes
- Rate limiting
- CORS configuration
- API versioning
- Request logging

### **Additional Features**
- File upload for receipts/documents
- Email notifications for invoices
- Data export (CSV, PDF)
- Backup and restore functionality
- Real-time updates (WebSocket for live data)
- Caching for performance
- Background job processing

## 🛠️ Recommended Tech Stack

**Backend Framework:** Node.js with Express.js
**Database:** PostgreSQL with Prisma ORM
**Authentication:** JWT with bcrypt for password hashing
**File Storage:** AWS S3 or local storage
**Email Service:** SendGrid or AWS SES
**PDF Generation:** Puppeteer or jsPDF
**Real-time:** Socket.io
**Testing:** Jest with Supertest
**Documentation:** Swagger/OpenAPI
**Validation:** Joi or Zod
**Environment:** dotenv
**Logging:** Winston
**Caching:** Redis (optional)

## 📋 API Endpoints Summary

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

### Dashboard
- GET /api/dashboard/overview
- GET /api/dashboard/kpis
- GET /api/dashboard/summary

### Transactions
- GET /api/transactions
- POST /api/transactions
- GET /api/transactions/:id
- PUT /api/transactions/:id
- DELETE /api/transactions/:id
- GET /api/transactions/recent

### Accounts
- GET /api/accounts
- POST /api/accounts
- GET /api/accounts/:id
- PUT /api/accounts/:id
- DELETE /api/accounts/:id

### Categories
- GET /api/categories
- POST /api/categories
- GET /api/categories/:id
- PUT /api/categories/:id
- DELETE /api/categories/:id

### Savings Goals
- GET /api/savings/goals
- POST /api/savings/goals
- GET /api/savings/goals/:id
- PUT /api/savings/goals/:id
- DELETE /api/savings/goals/:id
- POST /api/savings/transfer
- GET /api/savings/history

### Freelance
- GET /api/freelance/projects
- POST /api/freelance/projects
- GET /api/freelance/projects/:id
- PUT /api/freelance/projects/:id
- DELETE /api/freelance/projects/:id
- GET /api/freelance/invoices
- POST /api/freelance/invoices
- GET /api/freelance/invoices/:id
- PUT /api/freelance/invoices/:id
- GET /api/freelance/time-entries
- POST /api/freelance/time-entries

### Salary
- GET /api/salary
- PUT /api/salary
- GET /api/salary/deductions
- POST /api/salary/deductions
- PUT /api/salary/deductions/:id
- DELETE /api/salary/deductions/:id

### Reports
- GET /api/reports/cashflow
- GET /api/reports/income-expenses
- GET /api/reports/categories
- GET /api/reports/savings
- GET /api/reports/freelance
- GET /api/reports/budgets
- POST /api/reports/export

### User Management
- GET /api/user/profile
- PUT /api/user/profile
- DELETE /api/user/account

### Recurring Transactions
- GET /api/recurring
- POST /api/recurring
- GET /api/recurring/:id
- PUT /api/recurring/:id
- DELETE /api/recurring/:id
- GET /api/recurring/upcoming

### Backup & Export
- POST /api/backup/export
- POST /api/backup/import

## 🚀 Development Phases

### Phase 1: Core Setup
1. Project initialization
2. Database setup with Prisma
3. Authentication system
4. Basic user management
5. Core data models

### Phase 2: Core Features
1. Transaction management
2. Account management
3. Category management
4. Basic dashboard

### Phase 3: Advanced Features
1. Savings goals
2. Freelance management
3. Salary management
4. Reports generation

### Phase 4: Polish & Optimization
1. Real-time updates
2. File uploads
3. Email notifications
4. Performance optimization
5. Testing and documentation

## 📝 Notes

- All monetary values should be stored as integers (cents) to avoid floating point precision issues
- Use proper error handling and validation for all endpoints
- Implement proper logging for debugging and monitoring
- Consider implementing rate limiting for production
- Use environment variables for configuration
- Implement proper CORS settings for frontend integration
- Consider implementing caching for frequently accessed data
- Use proper HTTP status codes for all responses
- Implement proper input sanitization to prevent injection attacks
