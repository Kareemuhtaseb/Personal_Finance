import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService, type Category, type CreateCategoryRequest, type UpdateCategoryRequest } from '@/services/api'

export const useCategoriesStore = defineStore('categories', () => {
  // State
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const expenseCategories = computed(() => categories.value.filter(category => category.type === 'EXPENSE'))
  const incomeCategories = computed(() => categories.value.filter(category => category.type === 'INCOME'))

  // Getters
  const getAllCategories = () => categories.value
  
  const getExpenseCategories = () => expenseCategories.value
  
  const getIncomeCategories = () => incomeCategories.value
  
  const getCategoryById = (id: string) => {
    return categories.value.find(category => category.id === id)
  }

  const getCategoryByName = (name: string, type: 'EXPENSE' | 'INCOME') => {
    return categories.value.find(category => category.name === name && category.type === type)
  }

  // Actions
  const fetchCategories = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await apiService.getCategories()
      if (response.data.success) {
        categories.value = response.data.data || []
      } else {
        error.value = response.data.message || 'Failed to fetch categories'
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch categories'
      console.error('Error fetching categories:', err)
    } finally {
      loading.value = false
    }
  }

  const createCategory = async (categoryData: CreateCategoryRequest) => {
    try {
      loading.value = true
      error.value = null
      console.log('Sending category data to API:', categoryData)
      const response = await apiService.createCategory(categoryData)
      console.log('API response:', response)
      if (response.data.success) {
        categories.value.push(response.data.data)
        return { success: true, data: response.data.data }
      } else {
        error.value = response.data.message || 'Failed to create category'
        console.error('API returned error:', response.data)
        return { success: false, error: error.value }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to create category'
      console.error('Error creating category:', err)
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        response: err.response
      })
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateCategory = async (categoryId: string, categoryData: UpdateCategoryRequest) => {
    try {
      loading.value = true
      error.value = null
      const response = await apiService.updateCategory(categoryId, categoryData)
      if (response.data.success) {
        const index = categories.value.findIndex(category => category.id === categoryId)
        if (index !== -1) {
          categories.value[index] = response.data.data
        }
        return { success: true, data: response.data.data }
      } else {
        error.value = response.data.message || 'Failed to update category'
        return { success: false, error: error.value }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update category'
      console.error('Error updating category:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteCategory = async (categoryId: string) => {
    try {
      loading.value = true
      error.value = null
      const response = await apiService.deleteCategory(categoryId)
      if (response.data.success) {
        categories.value = categories.value.filter(category => category.id !== categoryId)
        return { success: true }
      } else {
        error.value = response.data.message || 'Failed to delete category'
        return { success: false, error: error.value }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete category'
      console.error('Error deleting category:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const getCategoryOptions = (type: 'EXPENSE' | 'INCOME') => {
    const filteredCategories = type === 'EXPENSE' ? expenseCategories.value : incomeCategories.value
    return filteredCategories.map(category => ({
      value: category.id,
      label: category.name
    }))
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    categories,
    loading,
    error,
    
    // Computed
    expenseCategories,
    incomeCategories,
    
    // Getters
    getAllCategories,
    getExpenseCategories,
    getIncomeCategories,
    getCategoryById,
    getCategoryByName,
    
    // Actions
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryOptions,
    clearError
  }
})
