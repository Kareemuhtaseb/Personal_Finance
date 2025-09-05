<script setup lang="ts">
import { useRouter } from 'vue-router'
import { format } from 'date-fns'

interface Transaction {
  id: number
  description: string
  amount: number
  category: string
  date: string
  type: 'income' | 'expense'
}

interface Props {
  transactions: Transaction[]
}

const props = defineProps<Props>()
const router = useRouter()

const formatAmount = (amount: number) => {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  })
  return amount >= 0 ? `+${formatted}` : `-${formatted}`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const getAmountColor = (amount: number) => {
  return amount >= 0 
    ? 'text-green-400' 
    : 'text-red-400'
}

const handleViewAll = () => {
  router.push('/transactions')
}
</script>

<template>
  <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 hover:scale-[1.02] group p-6 relative overflow-hidden">
    <!-- Background gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>
    
    <div class="relative z-10">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-white tracking-wide group-hover:text-orange-200 transition-colors duration-300">
          Recent Transactions
        </h3>
        <router-link 
          to="/transactions"
          class="text-sm text-orange-400 hover:text-orange-300 transition-colors duration-300 font-medium"
        >
          View All
        </router-link>
      </div>
      
      <div class="space-y-4">
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] group/item"
        >
          <div class="flex items-center space-x-4">
            <div 
              :class="[
                'w-3 h-3 rounded-full shadow-lg',
                transaction.type === 'income' ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'
              ]"
            ></div>
            <div>
              <p class="text-base font-semibold text-white group-hover/item:text-orange-200 transition-colors duration-300">
                {{ transaction.description }}
              </p>
              <p class="text-sm text-white/60 group-hover/item:text-white/80 transition-colors duration-300">
                {{ transaction.category }} • {{ formatDate(transaction.date) }}
              </p>
            </div>
          </div>
          
          <span 
            :class="[
              'text-lg font-bold',
              transaction.type === 'income' ? 'text-green-400 group-hover/item:text-green-300' : 'text-red-400 group-hover/item:text-red-300'
            ]"
          >
            {{ formatAmount(transaction.amount) }}
          </span>
        </div>
      </div>
      
      <div v-if="transactions.length === 0" class="text-center py-8">
        <p class="text-white/60 text-sm">
          No recent transactions
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

/* Enhanced shadows */
.shadow-2xl {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(249, 115, 22, 0.1);
}

.hover\:shadow-orange-500\/20:hover {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(249, 115, 22, 0.2);
}
</style>
