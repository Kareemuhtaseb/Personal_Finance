// API Response interface
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

// Auth interfaces
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  timezone?: string
  currency?: string
}

export interface AuthResponse {
  user: {
    id: string
    name: string
    email: string
    timezone: string
    currency: string
    createdAt: string
    updatedAt: string
  }
  accessToken: string
  refreshToken: string
}

export interface User {
  id: string
  name: string
  email: string
  timezone: string
  currency: string
  createdAt: string
  updatedAt: string
}

// Dashboard interfaces
export interface DashboardOverview {
  monthlyIncome: number
  monthlyExpenses: number
  netSavings: number
  freelanceIncome: number
  totalBalance: number
  savingsProgress: number
}

export interface KPIData {
  title: string
  value: number
  change: number
  changeType: 'increase' | 'decrease'
  icon: string
  color: string
}

export interface Transaction {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
  account: {
    name: string
    type: string
  }
  category: {
    name: string
    color: string
    icon: string
  }
}

export interface SavingsGoal {
  id: string
  name: string
  target: number
  current: number
  description?: string
  createdAt: string
  updatedAt: string
}

export interface FreelanceSummary {
  activeProjects: number
  hoursLogged: number
  unpaidInvoices: number
  totalUnpaid: number
}

export interface RecurringTransaction {
  id: string
  description: string
  amount: number
  frequency: string
  nextDueDate: string
  account: {
    name: string
  }
  category: {
    name: string
    color: string
  }
}

// Freelance interfaces
export interface FreelanceProject {
  id: string
  name: string
  client: string
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED'
  hourlyRate: number
  paymentType: 'HOURLY_RATE' | 'REFERENCE_ONLY'
  totalHours: number
  paidHours: number
  unpaidHours: number
  totalAmount: number
  totalSessions: number
  completedSessions: number
  paidSessions: number
  createdAt: string
  updatedAt: string
}

export interface WorkSession {
  id: string
  projectId: string
  startTime: string
  endTime?: string
  breakDuration: number
  isPaid: boolean
  description?: string
  workHours?: string
  customAmount?: number
  project: {
    name: string
    client: string
    paymentType: 'HOURLY_RATE' | 'REFERENCE_ONLY'
  }
  createdAt: string
  updatedAt: string
}

export interface CreateProjectRequest {
  name: string
  client: string
  hourlyRate: number
  paymentType?: 'HOURLY_RATE' | 'REFERENCE_ONLY'
}

export interface UpdateProjectRequest {
  name?: string
  client?: string
  hourlyRate?: number
  paymentType?: 'HOURLY_RATE' | 'REFERENCE_ONLY'
  status?: 'ACTIVE' | 'COMPLETED' | 'PAUSED'
}

export interface StartWorkSessionRequest {
  projectId: string
  description?: string
}

export interface CreateManualWorkSessionRequest {
  projectId: string
  description?: string
  workHours: number
  date?: string
  isPaid?: boolean
}

export interface EndWorkSessionRequest {
  breakDuration?: number
}

export interface UpdateWorkSessionRequest {
  isPaid?: boolean
  description?: string
  customAmount?: number
}

export interface PaymentRequest {
  amount: number
  date?: string
  accountId?: string
  categoryId?: string
}

export interface BulkPaymentRequest {
  sessionIds: string[]
  amount: number
  date: string
  accountId?: string
  categoryId?: string
}

export interface FreelanceSummary {
  activeProjects: number
  totalHours: string
  paidHours: string
  unpaidHours: string
  totalEarnings: number
}

// Account interfaces
export interface Account {
  id: string
  name: string
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT'
  balance: number
  currency: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAccountRequest {
  name: string
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT'
  balance?: number
  currency?: string
}

export interface UpdateAccountRequest {
  name?: string
  type?: 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT'
  balance?: number
  currency?: string
  isActive?: boolean
}

// Category interfaces
export interface Category {
  id: string
  name: string
  color: string
  type: 'INCOME' | 'EXPENSE'
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryRequest {
  name: string
  color: string
  type: 'INCOME' | 'EXPENSE'
}

export interface UpdateCategoryRequest {
  name?: string
  color?: string
  type?: 'INCOME' | 'EXPENSE'
}

class ApiService {
  private baseURL: string

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: ApiResponse<T> }> {
    const token = localStorage.getItem('accessToken')
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      console.log(`Making request to: ${this.baseURL}${endpoint}`)
      console.log('Request config:', config)
      
      const response = await fetch(`${this.baseURL}${endpoint}`, config)
      
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          console.error('Error response data:', errorData)
          if (errorData.message) {
            errorMessage = errorData.message
          }
          if (errorData.data && Array.isArray(errorData.data)) {
            // Handle validation errors
            const validationErrors = errorData.data.map((err: any) => `${err.field}: ${err.message}`).join(', ')
            errorMessage = `Validation failed: ${validationErrors}`
          }
        } catch (parseError) {
          console.error('Could not parse error response:', parseError)
        }
        
        if (response.status === 401) {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refreshToken')
          if (refreshToken) {
            try {
              const refreshResponse = await this.refreshToken(refreshToken)
              localStorage.setItem('accessToken', refreshResponse.data.data!.accessToken)
              localStorage.setItem('refreshToken', refreshResponse.data.data!.refreshToken)
              
              // Retry the original request
              config.headers = {
                ...config.headers,
                Authorization: `Bearer ${refreshResponse.data.data!.accessToken}`,
              }
              const retryResponse = await fetch(`${this.baseURL}${endpoint}`, config)
              return { data: await retryResponse.json() }
            } catch (refreshError) {
              this.logout()
              window.location.href = '/login'
              throw refreshError
            }
          } else {
            this.logout()
            window.location.href = '/login'
          }
        }
        throw new Error(errorMessage)
      }

      const responseData = await response.json()
      console.log('Response data:', responseData)
      return { data: responseData }
    } catch (error: any) {
      // Handle network errors (connection refused, etc.)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please make sure the backend is running on port 3001.')
      }
      throw error
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<{ data: ApiResponse<AuthResponse> }> {
    return this.makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  }

  async register(userData: RegisterRequest): Promise<{ data: ApiResponse<AuthResponse> }> {
    return this.makeRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  async refreshToken(refreshToken: string): Promise<{ data: ApiResponse<{ accessToken: string; refreshToken: string }> }> {
    return this.makeRequest<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    })
  }

  async getProfile(): Promise<{ data: ApiResponse<{ user: User }> }> {
    return this.makeRequest<{ user: User }>('/auth/profile')
  }

  async updateProfile(userData: Partial<User>): Promise<{ data: ApiResponse<{ user: User }> }> {
    return this.makeRequest<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
  }

  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<{ data: ApiResponse }> {
    return this.makeRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    })
  }

  async logoutUser(): Promise<{ data: ApiResponse }> {
    return this.makeRequest('/auth/logout', {
      method: 'POST'
    })
  }

  // Dashboard methods
  async getDashboardOverview(): Promise<{ data: ApiResponse<DashboardOverview> }> {
    return this.makeRequest<DashboardOverview>('/dashboard/overview')
  }

  async getKPIs(): Promise<{ data: ApiResponse<KPIData[]> }> {
    return this.makeRequest<KPIData[]>('/dashboard/kpis')
  }

  async getRecentTransactions(limit: number = 5): Promise<{ data: ApiResponse<Transaction[]> }> {
    return this.makeRequest<Transaction[]>(`/dashboard/recent-transactions?limit=${limit}`)
  }

  async getSavingsGoals(): Promise<{ data: ApiResponse<SavingsGoal[]> }> {
    return this.makeRequest<SavingsGoal[]>('/dashboard/savings-goals')
  }

  async getUpcomingRecurring(): Promise<{ data: ApiResponse<RecurringTransaction[]> }> {
    return this.makeRequest<RecurringTransaction[]>('/dashboard/upcoming-recurring')
  }

  // Transaction methods
  async createTransaction(transactionData: {
    accountId: string;
    categoryId: string;
    description: string;
    amount: number;
    date?: string;
    type: 'INCOME' | 'EXPENSE';
    cleared?: boolean;
  }): Promise<{ data: ApiResponse<Transaction> }> {
    return this.makeRequest<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    })
  }

  async deleteTransaction(transactionId: string): Promise<{ data: ApiResponse }> {
    return this.makeRequest(`/transactions/${transactionId}`, {
      method: 'DELETE'
    })
  }

  // Account methods
  async getAccounts(): Promise<{ data: ApiResponse<Account[]> }> {
    return this.makeRequest<Account[]>('/accounts')
  }

  async createAccount(accountData: CreateAccountRequest): Promise<{ data: ApiResponse<Account> }> {
    return this.makeRequest<Account>('/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData)
    })
  }

  async updateAccount(accountId: string, accountData: UpdateAccountRequest): Promise<{ data: ApiResponse<Account> }> {
    return this.makeRequest<Account>(`/accounts/${accountId}`, {
      method: 'PUT',
      body: JSON.stringify(accountData)
    })
  }

  async deleteAccount(accountId: string): Promise<{ data: ApiResponse }> {
    return this.makeRequest(`/accounts/${accountId}`, {
      method: 'DELETE'
    })
  }

  // Category methods
  async getCategories(): Promise<{ data: ApiResponse<Category[]> }> {
    return this.makeRequest<Category[]>('/categories')
  }

  async createCategory(categoryData: CreateCategoryRequest): Promise<{ data: ApiResponse<Category> }> {
    return this.makeRequest<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    })
  }

  async updateCategory(categoryId: string, categoryData: UpdateCategoryRequest): Promise<{ data: ApiResponse<Category> }> {
    return this.makeRequest<Category>(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    })
  }

  async deleteCategory(categoryId: string): Promise<{ data: ApiResponse }> {
    return this.makeRequest(`/categories/${categoryId}`, {
      method: 'DELETE'
    })
  }

  // Freelance methods
  async createProject(projectData: CreateProjectRequest): Promise<{ data: ApiResponse<FreelanceProject> }> {
    return this.makeRequest<FreelanceProject>('/freelance/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    })
  }

  async getProjects(): Promise<{ data: ApiResponse<FreelanceProject[]> }> {
    return this.makeRequest<FreelanceProject[]>('/freelance/projects')
  }

  async updateProject(projectId: string, projectData: UpdateProjectRequest): Promise<{ data: ApiResponse<FreelanceProject> }> {
    return this.makeRequest<FreelanceProject>(`/freelance/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData)
    })
  }

  async deleteProject(projectId: string): Promise<{ data: ApiResponse }> {
    return this.makeRequest(`/freelance/projects/${projectId}`, {
      method: 'DELETE'
    })
  }

  async startWorkSession(sessionData: StartWorkSessionRequest): Promise<{ data: ApiResponse<WorkSession> }> {
    return this.makeRequest<WorkSession>('/freelance/work-sessions/start', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    })
  }

  async createManualWorkSession(sessionData: CreateManualWorkSessionRequest): Promise<{ data: ApiResponse<WorkSession> }> {
    return this.makeRequest<WorkSession>('/freelance/work-sessions/manual', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    })
  }

  async endWorkSession(sessionId: string, sessionData: EndWorkSessionRequest): Promise<{ data: ApiResponse<WorkSession> }> {
    return this.makeRequest<WorkSession>(`/freelance/work-sessions/${sessionId}/end`, {
      method: 'PUT',
      body: JSON.stringify(sessionData)
    })
  }

  async getWorkSessions(projectId?: string): Promise<{ data: ApiResponse<WorkSession[]> }> {
    const query = projectId ? `?projectId=${projectId}` : ''
    return this.makeRequest<WorkSession[]>(`/freelance/work-sessions${query}`)
  }

  async updateWorkSession(sessionId: string, sessionData: UpdateWorkSessionRequest): Promise<{ data: ApiResponse<WorkSession> }> {
    return this.makeRequest<WorkSession>(`/freelance/work-sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData)
    })
  }

  async deleteWorkSession(sessionId: string): Promise<{ data: ApiResponse }> {
    return this.makeRequest(`/freelance/work-sessions/${sessionId}`, {
      method: 'DELETE'
    })
  }

  async markPaymentReceived(projectId: string, paymentData: PaymentRequest): Promise<{ data: ApiResponse<{ transaction: Transaction }> }> {
    return this.makeRequest<{ transaction: Transaction }>(`/freelance/projects/${projectId}/payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    })
  }

  async bulkMarkSessionsPaid(paymentData: BulkPaymentRequest): Promise<{ data: ApiResponse<{ transaction: Transaction }> }> {
    return this.makeRequest<{ transaction: Transaction }>('/freelance/work-sessions/bulk-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    })
  }

  async getFreelanceSummary(): Promise<{ data: ApiResponse<FreelanceSummary> }> {
    return this.makeRequest<FreelanceSummary>('/freelance/summary')
  }

  // Utility methods
  logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken')
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }
}

// Create and export a singleton instance
export const apiService = new ApiService()
export default apiService
