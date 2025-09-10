<script setup lang="ts">
import { ref } from 'vue'

const income = ref({
  total: 0,
  sources: [
    { name: 'Salary', amount: 0, category: 'Employment' },
    { name: 'Freelance', amount: 0, category: 'Freelance' },
    { name: 'Investments', amount: 0, category: 'Investment' },
    { name: 'Rental', amount: 0, category: 'Rental' },
    { name: 'Other', amount: 0, category: 'Other' }
  ]
})

const calculateTotal = () => {
  const totalIncome = income.value.sources.reduce((sum, source) => sum + source.amount, 0)
  income.value.total = totalIncome
}
</script>

<template>
  <!-- Salary content without duplicate background -->
  <div class="space-premium">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-wide">Income Management</h1>
        <p class="mt-2 text-lg text-white/70">
          Track your income sources and categories
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Income Input Form with glassmorphism -->
    <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-green-500/20 p-8 relative overflow-hidden">
      <!-- Enhanced background effects -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/8 to-white/4 rounded-3xl"></div>
      <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent rounded-3xl"></div>
      
      <!-- Animated border gradient -->
      <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 opacity-50"></div>
      <div class="absolute inset-[1px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-3xl"></div>
      
      <div class="relative z-10">
          <h3 class="text-2xl font-bold text-white mb-6 tracking-wide group-hover:text-green-200 transition-colors duration-300">Income Sources</h3>
          
          <div class="space-y-6">
            <div>
              <label class="block text-base font-semibold text-white/90 mb-3">
                Income Sources
              </label>
              <div class="space-y-3">
                <div
                  v-for="(source, index) in income.sources"
                  :key="index"
                  class="flex space-x-3"
                >
                  <input
                    v-model="source.name"
                    type="text"
                    placeholder="Income source name"
                    class="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300"
                  />
                  <input
                    :value="source.amount"
                    type="number"
                    placeholder="Amount"
                    class="w-28 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300"
                    @input="source.amount = parseFloat(($event.target as HTMLInputElement).value) || 0; calculateTotal()"
                  />
                </div>
              </div>
            </div>
            
            <div class="pt-6 border-t border-white/20">
              <div class="flex justify-between items-center">
                <span class="text-xl font-semibold text-white group-hover:text-green-200 transition-colors duration-300">Total Annual Income:</span>
                <span class="text-3xl font-bold text-green-400 group-hover:text-green-300 transition-colors duration-300">
                  ${{ income.total.toLocaleString() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    <!-- Income Breakdown with glassmorphism -->
    <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-blue-500/20 p-8 relative overflow-hidden">
      <!-- Enhanced background effects -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/8 to-white/4 rounded-3xl"></div>
      <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent rounded-3xl"></div>
      
      <!-- Animated border gradient -->
      <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-50"></div>
      <div class="absolute inset-[1px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-3xl"></div>
      
      <div class="relative z-10">
          <h3 class="text-2xl font-bold text-white mb-6 tracking-wide group-hover:text-blue-200 transition-colors duration-300">Income Breakdown</h3>
          
          <div class="space-y-4">
            <div
              v-for="source in income.sources"
              :key="source.name"
              class="flex justify-between items-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <div>
                <span class="text-base text-white/90">{{ source.name }}</span>
                <span class="text-sm text-white/60 ml-2">({{ source.category }})</span>
              </div>
              <span class="text-lg font-semibold text-green-400">${{ source.amount.toLocaleString() }}</span>
            </div>
            
            <div class="pt-4 border-t border-white/20">
              <div class="flex justify-between items-center">
                <span class="text-xl font-semibold text-white">Total Income</span>
                <span class="text-2xl font-bold text-blue-400">${{ income.total.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Breakdown with glassmorphism -->
    <div class="glass-card shadow-purple-glow p-8 hover:shadow-purple-500/30 transition-all duration-500 hover:scale-[1.02] group">
      <h3 class="text-2xl font-bold text-white mb-6 tracking-wide group-hover:text-purple-200 transition-colors duration-300">Monthly Breakdown</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="text-center p-6 glass-bg backdrop-blur-sm rounded-2xl glass-border">
          <p class="text-sm text-white/70 mb-2">Monthly Income</p>
          <p class="text-2xl font-bold text-green-400">${{ Math.round(income.total / 12).toLocaleString() }}</p>
        </div>
        
        <div class="text-center p-6 glass-bg backdrop-blur-sm rounded-2xl glass-border">
          <p class="text-sm text-white/70 mb-2">Annual Income</p>
          <p class="text-2xl font-bold text-blue-400">${{ income.total.toLocaleString() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Salary-specific styles only - animations and shadows are now global */

/* Input focus effects */
input:focus {
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}
</style>
