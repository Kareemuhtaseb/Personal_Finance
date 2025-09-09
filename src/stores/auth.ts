import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiService, { type User, type LoginRequest, type RegisterRequest } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')

  // Actions
  const setUser = (userData: User) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const clearUser = () => {
    user.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  // Initialize user from localStorage
  const initializeAuth = () => {
    const storedUser = apiService.getStoredUser()
    if (storedUser && apiService.isAuthenticated()) {
      user.value = storedUser
    }
  }

  // Login
  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.login(credentials)
      
      if (response.data.success) {
        const { user: userData, accessToken, refreshToken } = response.data.data!
        
        // Store tokens
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        
        // Set user
        setUser(userData)
        
        return { success: true, user: userData }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Register
  const register = async (userData: RegisterRequest) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.register(userData)
      
      if (response.data.success) {
        const { user: newUser, accessToken, refreshToken } = response.data.data!
        
        // Store tokens
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        
        // Set user
        setUser(newUser)
        
        return { success: true, user: newUser }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = async () => {
    try {
      await apiService.logout()
    } catch (err) {
      // Even if logout fails on server, clear local data
      console.error('Logout error:', err)
    } finally {
      clearUser()
    }
  }

  // Update profile
  const updateProfile = async (profileData: Partial<User>) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.updateProfile(profileData)
      
      if (response.data.success) {
        const updatedUser = response.data.data!.user
        setUser(updatedUser)
        return { success: true, user: updatedUser }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Profile update failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Change password
  const changePassword = async (passwordData: { currentPassword: string; newPassword: string }) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.changePassword(passwordData)
      
      if (response.data.success) {
        return { success: true }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Password change failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Get current profile
  const getProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.getProfile()
      
      if (response.data.success) {
        const userData = response.data.data!.user
        setUser(userData)
        return { success: true, user: userData }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to get profile'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    user,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    userName,
    userEmail,
    
    // Actions
    setUser,
    clearUser,
    setError,
    setLoading,
    initializeAuth,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    getProfile
  }
})
