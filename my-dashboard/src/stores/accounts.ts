import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService, type Account, type CreateAccountRequest, type UpdateAccountRequest } from '@/services/api'

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const activeAccounts = computed(() => accounts.value.filter(account => account.isActive))
  const checkingAccounts = computed(() => accounts.value.filter(account => account.type === 'CHECKING'))
  const savingsAccounts = computed(() => accounts.value.filter(account => account.type === 'SAVINGS'))
  const creditAccounts = computed(() => accounts.value.filter(account => account.type === 'CREDIT'))
  const investmentAccounts = computed(() => accounts.value.filter(account => account.type === 'INVESTMENT'))

  // Actions
  const fetchAccounts = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await apiService.getAccounts()
      if (response.data.success) {
        accounts.value = response.data.data || []
      } else {
        error.value = response.data.message || 'Failed to fetch accounts'
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch accounts'
      console.error('Error fetching accounts:', err)
    } finally {
      loading.value = false
    }
  }

  const createAccount = async (accountData: CreateAccountRequest) => {
    try {
      loading.value = true
      error.value = null
      const response = await apiService.createAccount(accountData)
      if (response.data.success) {
        accounts.value.push(response.data.data)
        return { success: true, data: response.data.data }
      } else {
        error.value = response.data.message || 'Failed to create account'
        return { success: false, error: error.value }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to create account'
      console.error('Error creating account:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateAccount = async (accountId: string, accountData: UpdateAccountRequest) => {
    try {
      loading.value = true
      error.value = null
      const response = await apiService.updateAccount(accountId, accountData)
      if (response.data.success) {
        const index = accounts.value.findIndex(account => account.id === accountId)
        if (index !== -1) {
          accounts.value[index] = response.data.data
        }
        return { success: true, data: response.data.data }
      } else {
        error.value = response.data.message || 'Failed to update account'
        return { success: false, error: error.value }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update account'
      console.error('Error updating account:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteAccount = async (accountId: string) => {
    try {
      loading.value = true
      error.value = null
      const response = await apiService.deleteAccount(accountId)
      if (response.data.success) {
        accounts.value = accounts.value.filter(account => account.id !== accountId)
        return { success: true }
      } else {
        error.value = response.data.message || 'Failed to delete account'
        return { success: false, error: error.value }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete account'
      console.error('Error deleting account:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const getAccountById = (id: string) => {
    return accounts.value.find(account => account.id === id)
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    accounts,
    loading,
    error,
    
    // Computed
    activeAccounts,
    checkingAccounts,
    savingsAccounts,
    creditAccounts,
    investmentAccounts,
    
    // Actions
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountById,
    clearError
  }
})
