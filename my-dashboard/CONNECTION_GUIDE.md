# Frontend-Backend Connection Guide

This guide provides a comprehensive overview of how the frontend and backend are connected, along with testing instructions.

## 🏗️ Architecture Overview

### Backend API Endpoints
The backend provides the following API endpoints:

#### Authentication Endpoints (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /refresh` - Token refresh
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `POST /logout` - Logout

#### Dashboard Endpoints (`/api/dashboard`)
- `GET /overview` - Dashboard overview data
- `GET /kpis` - KPI metrics
- `GET /recent-transactions` - Recent transactions
- `GET /savings-goals` - Savings goals
- `GET /freelance-summary` - Freelance summary
- `GET /upcoming-recurring` - Upcoming recurring transactions

### Frontend Services & Stores

#### API Service (`src/services/api.ts`)
- Centralized HTTP client with axios
- Automatic token management
- Request/response interceptors
- Error handling and token refresh

#### Authentication Store (`src/stores/auth.ts`)
- User authentication state management
- Login/logout functionality
- Profile management
- Token handling

#### Dashboard Store (`src/stores/dashboard.ts`)
- Dashboard data management
- Real-time data fetching
- Loading and error states

## 🔧 Setup Instructions

### 1. Backend Setup
```bash
cd my-dashboard/backend
npm install
npm run dev
```
The backend will run on `http://localhost:3001`

### 2. Frontend Setup
```bash
cd my-dashboard
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`

### 3. Environment Configuration
Create a `.env.local` file in the frontend root:
```
VITE_API_URL=http://localhost:3001/api
```

## 🧪 Testing Checklist

### Authentication Features

#### ✅ User Registration
1. Navigate to `/login`
2. Click "Sign up" to switch to registration mode
3. Fill in the registration form:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Password: "TestPassword123!"
   - Confirm Password: "TestPassword123!"
   - Timezone: "UTC-5 (EST)"
   - Currency: "USD"
4. Click "Create Account"
5. **Expected**: User is registered and redirected to dashboard

#### ✅ User Login
1. Navigate to `/login`
2. Fill in login form:
   - Email: "test@example.com"
   - Password: "TestPassword123!"
3. Click "Sign In"
4. **Expected**: User is logged in and redirected to dashboard

#### ✅ Profile Management
1. Navigate to `/settings`
2. Update profile information:
   - Change name to "Updated User"
   - Change timezone to "UTC+0 (GMT)"
3. Click "Save Changes"
4. **Expected**: Profile is updated successfully with success message

#### ✅ Password Change
1. In Settings, scroll to "Change Password" section
2. Fill in password form:
   - Current Password: "TestPassword123!"
   - New Password: "NewPassword123!"
   - Confirm New Password: "NewPassword123!"
3. Click "Change Password"
4. **Expected**: Password is changed successfully

#### ✅ Logout
1. Click on user avatar in top navbar
2. Click "Sign out"
3. **Expected**: User is logged out and redirected to login page

### Dashboard Features

#### ✅ Dashboard Data Loading
1. Login to the application
2. Navigate to dashboard (`/`)
3. **Expected**: 
   - Loading spinner appears initially
   - Dashboard data loads (KPIs, transactions, savings goals, freelance data)
   - Real user data is displayed instead of mock data

#### ✅ KPI Widgets
1. Check the four KPI widgets at the top:
   - Monthly Income
   - Monthly Expenses
   - Net Savings
   - Freelance Income
2. **Expected**: Real data from backend is displayed with percentage changes

#### ✅ Recent Transactions
1. Check the "Recent Transactions" section
2. **Expected**: Real transaction data from backend is displayed

#### ✅ Savings Goals
1. Check the "Savings Goals" section
2. **Expected**: Real savings goals data from backend is displayed

#### ✅ Freelance KPIs
1. Check the "Freelance KPIs" section
2. **Expected**: Real freelance summary data from backend is displayed

### Navigation & Routing

#### ✅ Route Protection
1. Try to access `/` without being logged in
2. **Expected**: Redirected to `/login`

#### ✅ Authenticated Routes
1. Login to the application
2. Navigate to different pages:
   - `/transactions`
   - `/savings`
   - `/freelance`
   - `/settings`
3. **Expected**: All pages load successfully

#### ✅ User Menu
1. Click on user avatar in top navbar
2. **Expected**: Dropdown menu appears with user name and options

## 🔍 API Testing

### Using Browser Developer Tools

#### Check Network Requests
1. Open Developer Tools (F12)
2. Go to Network tab
3. Perform various actions (login, navigate, etc.)
4. **Expected**: API calls are made to `http://localhost:3001/api/*`

#### Check Authentication Headers
1. After login, check any API request
2. Look at Request Headers
3. **Expected**: `Authorization: Bearer <token>` header is present

### Using Postman/Insomnia

#### Test Backend Health
```
GET http://localhost:3001/health
Expected: 200 OK with server status
```

#### Test Registration
```
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "TestPassword123!",
  "timezone": "UTC-5",
  "currency": "USD"
}
Expected: 201 Created with user data and tokens
```

#### Test Login
```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPassword123!"
}
Expected: 200 OK with user data and tokens
```

#### Test Dashboard Overview
```
GET http://localhost:3001/api/dashboard/overview
Authorization: Bearer <access_token>
Expected: 200 OK with dashboard data
```

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors
- **Problem**: CORS errors in browser console
- **Solution**: Ensure backend is running and CORS is properly configured

#### 401 Unauthorized
- **Problem**: API calls return 401 errors
- **Solution**: Check if user is logged in and token is valid

#### 404 Not Found
- **Problem**: API endpoints not found
- **Solution**: Ensure backend is running on correct port (3001)

#### Frontend Not Loading
- **Problem**: Frontend shows blank page
- **Solution**: Check if frontend is running on correct port (5173)

### Debug Steps

1. **Check Backend Status**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check Frontend Console**
   - Open browser Developer Tools
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Check Environment Variables**
   - Ensure `VITE_API_URL` is set correctly
   - Restart frontend after changing environment variables

## 📊 Data Flow

### Authentication Flow
1. User enters credentials
2. Frontend sends login request to `/api/auth/login`
3. Backend validates credentials and returns tokens
4. Frontend stores tokens in localStorage
5. All subsequent requests include Authorization header

### Dashboard Data Flow
1. User navigates to dashboard
2. Frontend calls `fetchAllDashboardData()`
3. Multiple API calls are made in parallel:
   - `/api/dashboard/overview`
   - `/api/dashboard/kpis`
   - `/api/dashboard/recent-transactions`
   - `/api/dashboard/savings-goals`
   - `/api/dashboard/freelance-summary`
   - `/api/dashboard/upcoming-recurring`
4. Data is stored in dashboard store
5. Components reactively update with real data

## 🎯 Success Criteria

The connection is successful when:

- ✅ User can register and login
- ✅ Dashboard displays real data from backend
- ✅ Profile management works
- ✅ Password change works
- ✅ Logout works
- ✅ All routes are protected
- ✅ API calls include proper authentication
- ✅ Error handling works correctly
- ✅ Loading states are displayed
- ✅ Token refresh works automatically

## 🚀 Next Steps

After successful connection testing:

1. **Add More Features**: Implement transaction management, account management, etc.
2. **Error Handling**: Enhance error messages and user feedback
3. **Data Validation**: Add client-side form validation
4. **Real-time Updates**: Implement WebSocket connections for real-time data
5. **Testing**: Add unit tests and integration tests
6. **Performance**: Optimize API calls and implement caching
