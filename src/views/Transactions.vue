<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { PlusIcon, FunnelIcon } from '@heroicons/vue/24/outline'
import { apiService } from '@/services/api'

const transactions = ref([])
const loading = ref(true)

const showAddModal = ref(false)
const showDeleteModal = ref(false)
const transactionToDelete = ref(null)
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedAccount = ref('all')

const newExpense = ref({
  description: '',
  amount: '',
  category: '',
  date: new Date().toISOString().split('T')[0]
})

// Computed property for filtered transactions
const filteredTransactions = computed(() => {
  let filtered = transactions.value

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter(transaction =>
      transaction.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(transaction => transaction.category === selectedCategory.value)
  }

  // Filter by account
  if (selectedAccount.value !== 'all') {
    filtered = filtered.filter(transaction => transaction.account === selectedAccount.value)
  }

  return filtered
})

// Load transactions from API
const loadTransactions = async () => {
  try {
    loading.value = true
    const response = await apiService.getRecentTransactions(100) // Get more transactions
    
    if (response.data.success) {
      // Transform API data to match our frontend format
      transactions.value = response.data.data.map((transaction: any) => ({
        id: transaction.id,
        date: transaction.date.split('T')[0],
        description: transaction.description,
        amount: transaction.amount * (transaction.type === 'INCOME' ? 1 : -1),
        category: transaction.category?.name || 'Unknown',
        account: transaction.account?.name || 'Unknown'
      }))
    } else {
      console.error('Failed to load transactions:', response.data.message)
    }
  } catch (error) {
    console.error('Error loading transactions:', error)
  } finally {
    loading.value = false
  }
}

// Load transactions when component mounts
onMounted(() => {
  loadTransactions()
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
    
    // Use default account and category IDs from seed data
    const accountId = 'checking-account' // Default checking account
    const categoryId = 'food-category' // Default to food category for expenses
    
    const expenseData = {
      accountId,
      categoryId,
      description: newExpense.value.description,
      amount: Math.abs(amount), // API expects positive amount
      date: newExpense.value.date || new Date().toISOString().split('T')[0],
      type: 'EXPENSE' as 'EXPENSE'
    }
    
    const response = await apiService.createTransaction(expenseData)
    
    if (response.data.success) {
      // Add the new transaction to the local list
      const createdTransaction = {
        id: response.data.data.id,
        date: response.data.data.date.split('T')[0],
        description: response.data.data.description,
        amount: response.data.data.amount * (response.data.data.type === 'INCOME' ? 1 : -1),
        category: response.data.data.category?.name || 'Unknown',
        account: response.data.data.account?.name || 'Unknown',
        cleared: response.data.data.cleared
      }
      
      // Reload transactions from API to get the latest data
      await loadTransactions()
      
      // Reset form
      newExpense.value = {
        description: '',
        amount: '',
        category: '',
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
        <h1 class="text-3xl font-bold text-white tracking-wide">Transactions</h1>
        <p class="mt-2 text-lg text-white/70">
          Track and manage all your transactions
        </p>
      </div>
      
      <div class="mt-4 sm:mt-0">
        <button
          @click="showAddModal = true"
          class="btn-success inline-flex items-center"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Add Transaction
        </button>
      </div>
    </div>

    <!-- Filters and search with glassmorphism -->
    <div class="glass-card-enhanced shadow-orange-glow p-8">
      <div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label class="block text-base font-semibold text-white/90 mb-2">
              Search
            </label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search transactions..."
              class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300"
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
              <option value="Food">🍽️ Food</option>
              <option value="Transport">🚗 Transport</option>
              <option value="Housing">🏠 Housing</option>
              <option value="Entertainment">🎬 Entertainment</option>
              <option value="Shopping">🛍️ Shopping</option>
              <option value="Health">🏥 Health</option>
              <option value="Education">📚 Education</option>
              <option value="Other">📝 Other</option>
            </select>
          </div>
          
          <div>
            <label class="block text-base font-semibold text-white/90 mb-2">
              Account
            </label>
            <select
              v-model="selectedAccount"
              class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300"
            >
              <option value="all">All Accounts</option>
              <option value="Checking">Checking</option>
              <option value="Savings">Savings</option>
              <option value="Credit Card">Credit Card</option>
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
    <div class="glass-card-enhanced shadow-blue-glow p-8 hover:shadow-blue-500/30 transition-all duration-500 hover:scale-[1.02] group">
      <div>
        <h3 class="text-2xl font-bold text-white mb-6 tracking-wide group-hover:text-blue-200 transition-colors duration-300">Recent Expenses</h3>
        
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
                class="btn-premium px-4 py-2 inline-flex items-center justify-center"
              >
                <FunnelIcon class="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        <!-- Expenses List -->
        <div v-else class="space-y-4">
          <div
            v-for="transaction in filteredTransactions"
            :key="transaction.id"
            class="flex items-center justify-between p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] group/item"
          >
            <div class="flex items-center space-x-4">
              <div class="p-3 bg-white/10 rounded-xl border border-white/20">
                <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
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
            
            <div class="flex items-center space-x-4">
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
          <h3 class="text-2xl font-bold text-white">Add Expense</h3>
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
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
              placeholder="Enter description"
            />
          </div>
          
          <div>
            <label class="block text-white/90 mb-2">Amount</label>
            <input 
              :value="newExpense.amount"
              type="number" 
              step="0.01"
              required
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
              placeholder="Enter amount"
              @input="newExpense.amount = parseFloat(($event.target as HTMLInputElement).value) || 0"
            />
          </div>
          
          
          <div>
            <label class="block text-white/90 mb-2">Date</label>
            <input 
              v-model="newExpense.date"
              type="date" 
              required
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>
          
          <div>
            <label class="block text-white/90 mb-2">Category</label>
            <select 
              v-model="newExpense.category"
              required
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="">Select Category</option>
              <option value="Food">🍽️ Food</option>
              <option value="Transport">🚗 Transport</option>
              <option value="Housing">🏠 Housing</option>
              <option value="Entertainment">🎬 Entertainment</option>
              <option value="Shopping">🛍️ Shopping</option>
              <option value="Health">🏥 Health</option>
              <option value="Education">📚 Education</option>
              <option value="Other">📝 Other</option>
            </select>
          </div>
          
          <div class="flex space-x-4 pt-4">
            <button 
              type="submit"
              class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Add Expense
            </button>
            <button 
              type="button"
              @click="showAddModal = false"
              class="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-semibold transition-colors"
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
          <h3 class="text-2xl font-bold text-white">Delete Expense</h3>
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
              class="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Delete Expense
            </button>
            <button 
              @click="cancelDelete"
              class="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Transactions-specific styles - using unified theme classes */
</style>
