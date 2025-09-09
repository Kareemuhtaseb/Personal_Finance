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
  router.push('/expenses')
}
</script>

<template>
  <div class="glass-card rounded-xl p-6 relative overflow-hidden group animate-slide-in-up">
    <div class="relative z-10">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-premium-medium group-hover:text-orange-200 transition-colors duration-300">
          Recent Transactions
        </h3>
        <router-link 
          to="/expenses"
          class="text-sm text-orange-400 hover:text-orange-300 transition-colors duration-300 font-medium hover:underline focus-ring rounded-lg px-2 py-1"
        >
          View All
        </router-link>
      </div>
      
      <div class="space-y-3">
        <div
          v-for="(transaction, index) in transactions"
          :key="transaction.id"
          class="flex items-center justify-between p-4 glass rounded-lg hover:glass-hover transition-all duration-300 hover:scale-[1.02] group/item interactive"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="flex items-center space-x-4">
            <div 
              :class="[
                'w-4 h-4 rounded-full shadow-lg ring-2 ring-white/20',
                transaction.type === 'income' ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'
              ]"
            ></div>
            <div>
              <p class="text-base font-semibold text-premium group-hover/item:text-orange-200 transition-colors duration-300">
                {{ transaction.description }}
              </p>
              <p class="text-sm text-premium-muted group-hover/item:text-white/80 transition-colors duration-300">
                {{ transaction.category }} • {{ formatDate(transaction.date) }}
              </p>
            </div>
          </div>
          
          <span 
            :class="[
              'text-lg font-bold text-render-optimized',
              transaction.type === 'income' ? 'text-green-400 group-hover/item:text-green-300' : 'text-red-400 group-hover/item:text-red-300'
            ]"
          >
            {{ formatAmount(transaction.amount) }}
          </span>
        </div>
      </div>
      
      <div v-if="transactions.length === 0" class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
          <span class="text-2xl">💳</span>
        </div>
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
