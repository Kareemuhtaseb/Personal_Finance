<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { PlusIcon, FunnelIcon } from '@heroicons/vue/24/outline'
import { apiService } from '@/services/api'
import { useCategoriesStore } from '@/stores/categories'
import { useAccountsStore } from '@/stores/accounts'

const transactions = ref([])
const loading = ref(true)

// Use stores
const categoriesStore = useCategoriesStore()
const accountsStore = useAccountsStore()

const showAddModal = ref(false)
const showDeleteModal = ref(false)
const transactionToDelete = ref(null)
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedAccount = ref('all')

// Category management
const showCategoriesModal = ref(false)
const showAddCategoryModal = ref(false)
const showEditCategoryModal = ref(false)
const editingCategory = ref<any>(null)
const newCategory = ref({
  name: '',
  color: '#6B7280',
  type: 'EXPENSE' as 'INCOME' | 'EXPENSE'
})

const newExpense = ref({
  description: '',
  amount: '',
  categoryId: '',
  accountId: '',
  date: new Date().toISOString().split('T')[0]
})

// Computed property for filtered transactions
const filteredTransactions = computed(() => {
  let filtered = transactions.value
  console.log('Original transactions:', transactions.value.length)
  console.log('Filter values:', { searchQuery: searchQuery.value, selectedCategory: selectedCategory.value, selectedAccount: selectedAccount.value })

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter(transaction =>
      transaction.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    console.log('After search filter:', filtered.length)
  }

  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(transaction => transaction.category === selectedCategory.value)
    console.log('After category filter:', filtered.length)
  }

  // Filter by account
  if (selectedAccount.value !== 'all') {
    filtered = filtered.filter(transaction => transaction.account === selectedAccount.value)
    console.log('After account filter:', filtered.length)
  }

  console.log('Final filtered results:', filtered.length)
  return filtered
})

// Load transactions from API
const loadTransactions = async () => {
  try {
    loading.value = true
    const response = await apiService.getRecentTransactions(100) // Get more transactions
    
    if (response.data.success) {
      // Filter only expense transactions and transform API data to match our frontend format
      transactions.value = response.data.data
        .filter((transaction: any) => transaction.type === 'EXPENSE')
        .map((transaction: any) => ({
          id: transaction.id,
          date: transaction.date.split('T')[0],
          description: transaction.description,
          amount: -Math.abs(transaction.amount), // Expenses should be negative
          category: transaction.category?.name || 'Unknown',
          account: transaction.account?.name || 'Unknown'
        }))
    } else {
      console.error('Failed to load transactions:', response.data.message)
      transactions.value = []
    }
  } catch (error) {
    console.error('Error loading transactions:', error)
    transactions.value = []
  } finally {
    loading.value = false
  }
}

// Load data when component mounts
onMounted(async () => {
  await Promise.all([
    loadTransactions(),
    categoriesStore.fetchCategories(),
    accountsStore.fetchAccounts()
  ])
})

const formatAmount = (amount: number) => {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return amount >= 0 ? `+$${formatted}` : `-$${formatted}`
}

const getAmountColor = (amount: number) => {
  return amount >= 0 
    ? 'text-green-400' 
    : 'text-red-400'
}

const addExpense = async () => {
  try {
    const amount = parseFloat(newExpense.value.amount)
    
    if (!newExpense.value.accountId || !newExpense.value.categoryId) {
      alert('Please select both an account and a category')
      return
    }
    
    const expenseData = {
      accountId: newExpense.value.accountId,
      categoryId: newExpense.value.categoryId,
      description: newExpense.value.description,
      amount: Math.abs(amount), // API expects positive amount
      date: newExpense.value.date || new Date().toISOString().split('T')[0],
      type: 'EXPENSE' as 'EXPENSE'
    }
    
    const response = await apiService.createTransaction(expenseData)
    
    if (response.data.success) {
      // Reload transactions from API to get the latest data
      await loadTransactions()
      
      // Reset form
      newExpense.value = {
        description: '',
        amount: '',
        categoryId: '',
        accountId: '',
        date: new Date().toISOString().split('T')[0]
      }
      
      showAddModal.value = false
      
      alert('Expense added successfully!')
    } else {
      alert('Failed to add expense: ' + response.data.message)
    }
  } catch (error) {
    console.error('Error adding expense:', error)
    alert('Error adding expense. Please try again.')
  }
}

// Delete transaction functions
const confirmDelete = (transaction) => {
  transactionToDelete.value = transaction
  showDeleteModal.value = true
}

const cancelDelete = () => {
  transactionToDelete.value = null
  showDeleteModal.value = false
}

const deleteTransaction = async () => {
  if (!transactionToDelete.value) return

  try {
    const response = await apiService.deleteTransaction(transactionToDelete.value.id)
    
    if (response.data.success) {
      // Reload transactions from API to get the latest data
      await loadTransactions()
      
      showDeleteModal.value = false
      transactionToDelete.value = null
      
      alert('Expense deleted successfully!')
    } else {
      alert('Failed to delete expense: ' + response.data.message)
    }
  } catch (error) {
    console.error('Error deleting expense:', error)
    alert('Error deleting expense. Please try again.')
  }
}

// Category management functions
const addCategory = async () => {
  if (!newCategory.value.name.trim()) return
  
  try {
    const result = await categoriesStore.createCategory({
      name: newCategory.value.name.trim(),
      color: newCategory.value.color,
      type: newCategory.value.type
    })
    
    if (result.success) {
      // Reset form
      newCategory.value = {
        name: '',
        color: '#6B7280',
        type: 'EXPENSE' as 'INCOME' | 'EXPENSE'
      }
      
      showAddCategoryModal.value = false
      alert('Expense category created successfully!')
    } else {
      alert('Failed to create category: ' + result.error)
    }
  } catch (error) {
    console.error('Error adding category:', error)
    alert('Error adding category. Please try again.')
  }
}

const editCategory = (category: any) => {
  editingCategory.value = category
  newCategory.value = {
    name: category.name,
    color: category.color,
    type: category.type
  }
  showEditCategoryModal.value = true
}

const updateCategory = async () => {
  if (!editingCategory.value) return
  
  try {
    const result = await categoriesStore.updateCategory(editingCategory.value.id, {
      name: newCategory.value.name.trim(),
      color: newCategory.value.color,
      type: newCategory.value.type
    })
    
    if (result.success) {
      showEditCategoryModal.value = false
      editingCategory.value = null
      alert('Category updated successfully!')
    } else {
      alert('Failed to update category: ' + result.error)
    }
  } catch (error) {
    console.error('Error updating category:', error)
    alert('Error updating category. Please try again.')
  }
}

const deleteCategory = async (category: any) => {
  if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
    return
  }

  try {
    const result = await categoriesStore.deleteCategory(category.id)
    
    if (result.success) {
      alert('Category deleted successfully!')
    } else {
      alert('Failed to delete category: ' + result.error)
    }
  } catch (error) {
    console.error('Error deleting category:', error)
    alert('Error deleting category. Please try again.')
  }
}

// Clear all filters
const clearFilters = () => {
  console.log('Clearing filters...')
  searchQuery.value = ''
  selectedCategory.value = 'all'
  selectedAccount.value = 'all'
  console.log('Filters cleared:', { searchQuery: searchQuery.value, selectedCategory: selectedCategory.value, selectedAccount: selectedAccount.value })
}

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' || selectedCategory.value !== 'all' || selectedAccount.value !== 'all'
})
</script>

<template>
  <!-- Transactions content without duplicate background -->
  <div class="space-premium">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-premium-large">Expenses</h1>
        <p class="mt-2 text-lg text-premium-muted">
          Track and manage your expenses
        </p>
      </div>
      
      <div class="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
        <button
          @click="showAddModal = true"
          class="btn-success inline-flex items-center"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Add Expense
        </button>
        <button
          @click="showCategoriesModal = true"
          class="btn-purple inline-flex items-center"
        >
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
          </svg>
          Manage Categories
        </button>
      </div>
    </div>

    <!-- Filters and search with glassmorphism -->
    <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-orange-500/20 p-8 relative overflow-hidden">
      <!-- Enhanced background effects -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/8 to-white/4 rounded-3xl"></div>
      <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent rounded-3xl"></div>
      
      <!-- Animated border gradient -->
      <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-red-500/20 opacity-50"></div>
      <div class="absolute inset-[1px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-3xl"></div>
      
      <div class="relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label class="block text-base font-semibold text-white/90 mb-2">
              Search
            </label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search transactions..."
              class="input-premium-enhanced"
            />
          </div>
          
          <div>
            <label class="block text-base font-semibold text-white/90 mb-2">
              Category
            </label>
            <select
              v-model="selectedCategory"
              class="select-premium-enhanced"
            >
              <option value="all">All Categories</option>
              <option 
                v-for="category in categoriesStore.getExpenseCategories()" 
                :key="category.id" 
                :value="category.name"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-base font-semibold text-white/90 mb-2">
              Account
            </label>
            <select
              v-model="selectedAccount"
              class="select-premium-enhanced"
            >
              <option value="all">All Accounts</option>
              <option 
                v-for="account in accountsStore.activeAccounts" 
                :key="account.id" 
                :value="account.name"
              >
                {{ account.name }} ({{ account.type }})
              </option>
            </select>
          </div>
          
          <div class="flex items-end">
            <button 
              type="button"
              @click="clearFilters"
              class="btn-premium w-full inline-flex items-center justify-center"
            >
              <FunnelIcon class="h-5 w-5 mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>


    <!-- Transactions list with glassmorphism -->
    <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-blue-500/20 p-8 relative overflow-hidden">
      <!-- Enhanced background effects -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/8 to-white/4 rounded-3xl"></div>
      <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent rounded-3xl"></div>
      
      <!-- Animated border gradient -->
      <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-50"></div>
      <div class="absolute inset-[1px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-3xl"></div>
      
      <div class="relative z-10">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-premium-medium group-hover:text-blue-200 transition-colors duration-300">Recent Expenses</h3>
          <div v-if="hasActiveFilters" class="flex items-center space-x-2">
            <span class="text-sm text-white/60">Filters active</span>
            <div class="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="text-white/60 text-lg">Loading expenses...</div>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="filteredTransactions.length === 0" class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="text-white/60 text-lg mb-2">
              {{ transactions.length === 0 ? 'No expenses found' : 'No expenses match your filters' }}
            </div>
            <div class="text-white/40 text-sm">
              {{ transactions.length === 0 ? 'Add your first expense to get started!' : 'Try adjusting your search or filter criteria' }}
            </div>
            <div v-if="transactions.length > 0" class="mt-4">
              <button 
                @click="clearFilters"
                class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        <!-- Expenses List -->
        <div v-else class="space-y-4">
          <div
            v-for="(transaction, index) in filteredTransactions"
            :key="transaction.id"
            class="p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 relative overflow-hidden group animate-fade-in-scale cursor-pointer flex items-center justify-between"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <!-- Transaction card background effects -->
            <div class="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent rounded-2xl"></div>
            
            <!-- Hover shimmer effect -->
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div class="animate-shimmer absolute inset-0 rounded-2xl"></div>
            </div>
            <div class="relative z-10 flex items-center space-x-4">
              <div class="p-3 bg-white/10 rounded-xl border border-white/20">
                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span class="text-white text-sm font-bold">{{ transaction.category.charAt(0) }}</span>
                </div>
              </div>
              
              <div>
                <p class="text-lg font-semibold text-white group-hover/item:text-blue-200 transition-colors duration-300">{{ transaction.description }}</p>
                <div class="flex items-center space-x-4 text-sm text-white/60 group-hover/item:text-white/80 transition-colors duration-300">
                  <span>{{ transaction.date }}</span>
                  <span>{{ transaction.category }}</span>
                  <span>{{ transaction.account }}</span>
                </div>
              </div>
            </div>
            
            <div class="relative z-10 flex items-center space-x-4">
              <div class="text-right">
                <p :class="['text-2xl font-bold', getAmountColor(transaction.amount)]">
                  {{ formatAmount(transaction.amount) }}
                </p>
              </div>
              
              <button
                @click="confirmDelete(transaction)"
                class="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300 opacity-0 group-hover/item:opacity-100"
                title="Delete transaction"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Transaction Modal -->
    <div v-if="showAddModal" class="modal-backdrop">
      <div class="modal-content">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-premium-medium">Add Expense</h3>
          <button 
            @click="showAddModal = false"
            class="text-white/60 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <form @submit.prevent="addExpense" class="space-y-4">
          <div>
            <label class="block text-white/90 mb-2">Description</label>
            <input 
              v-model="newExpense.description"
              type="text" 
              required
              class="input-premium"
              placeholder="Enter description"
            />
          </div>
          
          <div>
            <label class="block text-white/90 mb-2">Amount</label>
            <input 
              v-model="newExpense.amount"
              type="number" 
              step="0.01"
              required
              class="input-premium"
              placeholder="Enter amount"
            />
          </div>
          
          
          <div>
            <label class="block text-white/90 mb-2">Date</label>
            <input 
              v-model="newExpense.date"
              type="date" 
              required
              class="input-premium"
            />
          </div>
          
          <div>
            <label class="block text-white/90 mb-2">Category</label>
            <select 
              v-model="newExpense.categoryId"
              required
              class="select-premium"
            >
              <option value="">Select Category</option>
              <option 
                v-for="category in categoriesStore.getExpenseCategories()" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-white/90 mb-2">Account</label>
            <select 
              v-model="newExpense.accountId"
              required
              class="select-premium"
            >
              <option value="">Select Account</option>
              <option 
                v-for="account in accountsStore.activeAccounts" 
                :key="account.id" 
                :value="account.id"
              >
                {{ account.name }} ({{ account.type }})
              </option>
            </select>
          </div>
          
          <div class="flex space-x-4 pt-4">
            <button 
              type="submit"
              class="btn-primary flex-1"
            >
              Add Expense
            </button>
            <button 
              type="button"
              @click="showAddModal = false"
              class="btn-premium flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-backdrop">
      <div class="modal-content">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-premium-medium">Delete Expense</h3>
          <button 
            @click="cancelDelete"
            class="text-white/60 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <div class="space-y-4">
          <div class="text-white/90">
            Are you sure you want to delete this expense?
          </div>
          
          <div v-if="transactionToDelete" class="bg-white/5 rounded-lg p-4 border border-white/10">
            <div class="text-white font-semibold">{{ transactionToDelete.description }}</div>
            <div class="text-white/60 text-sm">
              {{ transactionToDelete.date }} • {{ transactionToDelete.category }} • {{ transactionToDelete.account }}
            </div>
            <div :class="['text-lg font-bold mt-2', getAmountColor(transactionToDelete.amount)]">
              {{ formatAmount(transactionToDelete.amount) }}
            </div>
          </div>
          
          <div class="text-red-400 text-sm">
            ⚠️ This action cannot be undone.
          </div>
          
          <div class="flex space-x-4 pt-4">
            <button 
              @click="deleteTransaction"
              class="btn-danger flex-1"
            >
              Delete Expense
            </button>
            <button 
              @click="cancelDelete"
              class="btn-premium flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Category Modal -->
    <div v-if="showAddCategoryModal" class="modal-backdrop" style="z-index: 60;">
      <div class="modal-content">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-premium-medium">Add Expense Category</h3>
          <button 
            @click="showAddCategoryModal = false"
            class="text-white/60 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <form @submit.prevent="addCategory" class="space-y-4">
          <div>
            <label class="block text-white/90 mb-2">Category Name</label>
            <input 
              v-model="newCategory.name"
              type="text" 
              required
              class="input-premium"
              placeholder="Enter category name"
            />
          </div>
          
          <div>
            <label class="block text-white/90 mb-2">Color</label>
            <input
              v-model="newCategory.color"
              type="color"
              class="w-full h-12 bg-white/10 border border-white/20 rounded-lg cursor-pointer"
            />
          </div>
          
          <div class="flex space-x-4 pt-4">
            <button 
              type="submit"
              class="btn-warning flex-1"
            >
              Add Category
            </button>
            <button 
              type="button"
              @click="showAddCategoryModal = false"
              class="btn-premium flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Category Modal -->
    <div v-if="showEditCategoryModal" class="modal-backdrop" style="z-index: 60;">
      <div class="modal-content">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-premium-medium">Edit Expense Category</h3>
          <button 
            @click="showEditCategoryModal = false; editingCategory = null"
            class="text-white/60 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <form @submit.prevent="updateCategory" class="space-y-4">
          <div>
            <label class="block text-white/90 mb-2">Category Name</label>
            <input 
              v-model="newCategory.name"
              type="text" 
              required
              class="input-premium"
              placeholder="Enter category name"
            />
          </div>
          
          <div>
            <label class="block text-white/90 mb-2">Color</label>
            <input
              v-model="newCategory.color"
              type="color"
              class="w-full h-12 bg-white/10 border border-white/20 rounded-lg cursor-pointer"
            />
          </div>
          
          <div class="flex space-x-4 pt-4">
            <button 
              type="submit"
              class="btn-warning flex-1"
            >
              Update Category
            </button>
            <button 
              type="button"
              @click="showEditCategoryModal = false; editingCategory = null"
              class="btn-premium flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Categories Management Modal -->
    <div v-if="showCategoriesModal" class="modal-backdrop">
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-premium-medium">Manage Expense Categories</h3>
          <button 
            @click="showCategoriesModal = false"
            class="text-white/60 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <div class="space-y-6">
          <!-- Add Category Button -->
          <div class="flex justify-end">
            <button
              @click="showAddCategoryModal = true"
              class="btn-warning inline-flex items-center"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Category
            </button>
          </div>
          
          <!-- Categories Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div
              v-for="(category, index) in categoriesStore.getExpenseCategories()"
              :key="category.id"
              class="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] group/item relative overflow-hidden animate-fade-in-scale"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <!-- Category card background effects -->
              <div class="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent rounded-2xl"></div>
              
              <!-- Hover shimmer effect -->
              <div class="absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500">
                <div class="animate-shimmer absolute inset-0 rounded-2xl"></div>
              </div>
              <div class="relative z-10 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-full" :style="{ backgroundColor: category.color }"></div>
                  <div>
                    <h4 class="text-sm font-semibold text-white group-hover/item:text-orange-200 transition-colors duration-300">
                      {{ category.name }}
                    </h4>
                  </div>
                </div>
                <div class="flex space-x-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                  <button
                    @click="editCategory(category)"
                    class="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-all duration-300"
                    title="Edit category"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button
                    @click="deleteCategory(category)"
                    class="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all duration-300"
                    title="Delete category"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Empty state -->
          <div v-if="categoriesStore.getExpenseCategories().length === 0" class="text-center py-8">
            <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="h-8 w-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
              </svg>
            </div>
            <p class="text-white/60 text-lg mb-2">No expense categories found</p>
            <p class="text-white/40 text-sm">Add your first expense category to get started!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom glassmorphism enhancements */
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

/* Enhanced shadows */
.shadow-2xl {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(59, 130, 246, 0.1);
}

.shadow-orange-500\/20 {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(249, 115, 22, 0.1);
}

.shadow-blue-500\/20 {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(59, 130, 246, 0.1);
}

/* Smooth transitions */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Input and select focus effects */
input:focus, select:focus {
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

/* Button hover effects */
button:hover {
  transform: translateY(-1px);
}

/* Table row hover effects */
tbody tr:hover {
  transform: scale(1.01);
}
</style>
