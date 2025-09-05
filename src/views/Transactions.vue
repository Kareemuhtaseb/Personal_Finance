<script setup lang="ts">
import { ref } from 'vue'
import { PlusIcon, FunnelIcon } from '@heroicons/vue/24/outline'

const transactions = ref([
  { id: 1, date: '2024-01-15', description: 'Grocery Store', amount: -85.50, category: 'Food', account: 'Checking', cleared: true },
  { id: 2, date: '2024-01-14', description: 'Freelance Payment', amount: 1200.00, category: 'Income', account: 'Checking', cleared: true },
  { id: 3, date: '2024-01-13', description: 'Gas Station', amount: -45.00, category: 'Transport', account: 'Credit Card', cleared: false },
  { id: 4, date: '2024-01-12', description: 'Salary', amount: 5000.00, category: 'Income', account: 'Checking', cleared: true },
  { id: 5, date: '2024-01-11', description: 'Restaurant', amount: -65.00, category: 'Food', account: 'Credit Card', cleared: false },
])

const showAddModal = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedAccount = ref('all')

const filteredTransactions = ref(transactions.value)

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
</script>

<template>
  <!-- Transactions content without duplicate background -->
  <div class="space-y-8">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-4xl font-bold text-white tracking-wide">Transactions</h1>
        <p class="mt-2 text-lg text-white/70">
          Manage your income and expenses
        </p>
      </div>
      
      <div class="mt-4 sm:mt-0">
        <button
          @click="showAddModal = true"
          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Add Transaction
        </button>
      </div>
    </div>

    <!-- Filters and search with glassmorphism -->
    <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-orange-500/20 p-8 hover:shadow-orange-500/30 transition-all duration-500 hover:scale-[1.02] group">
      <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>
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
              class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300"
            />
          </div>
          
          <div>
            <label class="block text-base font-semibold text-white/90 mb-2">
              Category
            </label>
            <select
              v-model="selectedCategory"
              class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300"
            >
              <option value="all">All Categories</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Income">Income</option>
              <option value="Entertainment">Entertainment</option>
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
            <button class="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
              <FunnelIcon class="h-5 w-5 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Transactions list with glassmorphism -->
    <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-blue-500/20 p-8 hover:shadow-blue-500/30 transition-all duration-500 hover:scale-[1.02] group">
      <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>
      <div class="relative z-10">
        <h3 class="text-2xl font-bold text-white mb-6 tracking-wide group-hover:text-blue-200 transition-colors duration-300">Recent Transactions</h3>
        
        <div class="space-y-4">
          <div
            v-for="transaction in filteredTransactions"
            :key="transaction.id"
            class="flex items-center justify-between p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] group/item"
          >
            <div class="flex items-center space-x-4">
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
                  <span v-if="!transaction.cleared" class="text-yellow-400">Pending</span>
                </div>
              </div>
            </div>
            
            <div class="text-right">
              <p :class="['text-2xl font-bold', getAmountColor(transaction.amount)]">
                {{ formatAmount(transaction.amount) }}
              </p>
            </div>
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
