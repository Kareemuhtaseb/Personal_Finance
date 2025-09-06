import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiService, { 
  type DashboardOverview, 
  type KPIData, 
  type Transaction, 
  type SavingsGoal, 
  type FreelanceSummary,
  type RecurringTransaction 
} from '../services/api'

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const overview = ref<DashboardOverview | null>(null)
  const kpis = ref<KPIData[]>([])
  const recentTransactions = ref<Transaction[]>([])
  const savingsGoals = ref<SavingsGoal[]>([])
  const freelanceSummary = ref<FreelanceSummary | null>(null)
  const upcomingRecurring = ref<RecurringTransaction[]>([])
  const categoryBreakdown = ref<any[]>([])
  const cashflowData = ref<any>(null)
  const budgetData = ref<any[]>([])
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const totalBalance = computed(() => overview.value?.totalBalance || 0)
  const monthlyIncome = computed(() => overview.value?.monthlyIncome || 0)
  const monthlyExpenses = computed(() => overview.value?.monthlyExpenses || 0)
  const netSavings = computed(() => overview.value?.netSavings || 0)
  const freelanceIncome = computed(() => overview.value?.freelanceIncome || 0)
  const savingsProgress = computed(() => overview.value?.savingsProgress || 0)

  // Actions
  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  // Fetch dashboard overview
  const fetchOverview = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.getDashboardOverview()
      
      if (response.data.success) {
        overview.value = response.data.data!
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch dashboard overview'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Fetch KPIs
  const fetchKPIs = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.getKPIs()
      
      if (response.data.success) {
        kpis.value = response.data.data!
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch KPIs'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Fetch recent transactions
  const fetchRecentTransactions = async (limit: number = 5) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.getRecentTransactions(limit)
      
      if (response.data.success) {
        recentTransactions.value = response.data.data!
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch recent transactions'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Fetch savings goals
  const fetchSavingsGoals = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.getSavingsGoals()
      
      if (response.data.success) {
        savingsGoals.value = response.data.data!
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch savings goals'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Fetch freelance summary
  const fetchFreelanceSummary = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.getFreelanceSummary()
      
      if (response.data.success) {
        freelanceSummary.value = response.data.data!
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch freelance summary'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Fetch upcoming recurring transactions
  const fetchUpcomingRecurring = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.getUpcomingRecurring()
      
      if (response.data.success) {
        upcomingRecurring.value = response.data.data!
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch upcoming recurring transactions'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Fetch all dashboard data
  const fetchAllDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [
        overviewResult,
        kpisResult,
        transactionsResult,
        savingsResult,
        freelanceResult,
        recurringResult
      ] = await Promise.allSettled([
        fetchOverview(),
        fetchKPIs(),
        fetchRecentTransactions(),
        fetchSavingsGoals(),
        fetchFreelanceSummary(),
        fetchUpcomingRecurring()
      ])

      // Check for any failures
      const results = [overviewResult, kpisResult, transactionsResult, savingsResult, freelanceResult, recurringResult]
      const failures = results.filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success))
      
      if (failures.length > 0) {
        console.warn('Some dashboard data failed to load:', failures)
      }

      return { success: true }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch dashboard data'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Clear all data
  const clearData = () => {
    overview.value = null
    kpis.value = []
    recentTransactions.value = []
    savingsGoals.value = []
    freelanceSummary.value = null
    upcomingRecurring.value = []
    categoryBreakdown.value = []
    cashflowData.value = null
    budgetData.value = []
    error.value = null
  }

  return {
    // State
    overview,
    kpis,
    recentTransactions,
    savingsGoals,
    freelanceSummary,
    upcomingRecurring,
    categoryBreakdown,
    cashflowData,
    budgetData,
    isLoading,
    error,
    
    // Getters
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    netSavings,
    freelanceIncome,
    savingsProgress,
    
    // Actions
    setError,
    setLoading,
    fetchOverview,
    fetchKPIs,
    fetchRecentTransactions,
    fetchSavingsGoals,
    fetchFreelanceSummary,
    fetchUpcomingRecurring,
    fetchAllDashboardData,
    clearData
  }
})
