<script setup lang="ts">
import { ref, computed } from 'vue'
import CashflowChart from '../components/dashboard/CashflowChart.vue'
import CategoryChart from '../components/dashboard/CategoryChart.vue'
import BudgetChart from '../components/dashboard/BudgetChart.vue'

const selectedPeriod = ref('month')
const selectedReport = ref('cashflow')

// Sample data for different report types
const cashflowData = computed(() => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  income: [5000, 5200, 4800, 5500, 6000, 5800],
  expenses: [3200, 3400, 3100, 3600, 3800, 3500]
}))

const categoryData = computed(() => [
  { name: 'Housing', amount: 1500, color: 'rgb(100, 116, 139)' },
  { name: 'Food', amount: 800, color: 'rgb(34, 197, 94)' },
  { name: 'Transport', amount: 400, color: 'rgb(234, 179, 8)' },
  { name: 'Entertainment', amount: 300, color: 'rgb(107, 114, 128)' },
  { name: 'Utilities', amount: 200, color: 'rgb(239, 68, 68)' },
  { name: 'Other', amount: 1000, color: 'rgb(148, 163, 184)' }
])

const budgetData = computed(() => [
  { category: 'Housing', budgeted: 1500, actual: 1450 },
  { category: 'Food', budgeted: 800, actual: 750 },
  { category: 'Transport', budgeted: 400, actual: 420 },
  { category: 'Entertainment', budgeted: 300, actual: 280 },
  { category: 'Utilities', budgeted: 200, actual: 195 },
  { category: 'Other', budgeted: 1000, actual: 950 }
])

// Get the appropriate chart component and data based on selected report
const currentChartData = computed(() => {
  switch (selectedReport.value) {
    case 'cashflow':
      return cashflowData.value
    case 'categories':
      return categoryData.value
    case 'budgets':
      return budgetData.value
    default:
      return cashflowData.value
  }
})

const currentChartComponent = computed(() => {
  switch (selectedReport.value) {
    case 'cashflow':
    case 'income-expenses':
      return CashflowChart
    case 'categories':
      return CategoryChart
    case 'budgets':
      return BudgetChart
    default:
      return CashflowChart
  }
})
</script>

<template>
  <!-- Reports content without duplicate background -->
  <div class="space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-4xl font-bold text-white tracking-wide">Financial Reports</h1>
        <p class="mt-2 text-lg text-white/70">
          Analyze your financial data with comprehensive reports
        </p>
      </div>
      
      <div class="mt-4 sm:mt-0 space-x-3">
        <select
          v-model="selectedPeriod"
          class="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
        
        <button class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
          Export PDF
        </button>
      </div>
    </div>

    <!-- Report Type Selector with glassmorphism -->
    <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-purple-500/20 p-8 hover:shadow-purple-500/30 transition-all duration-500 hover:scale-[1.02] group">
      <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>
      <div class="relative z-10">
        <h3 class="text-2xl font-bold text-white mb-6 tracking-wide group-hover:text-purple-200 transition-colors duration-300">Report Type</h3>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <button
            v-for="report in ['cashflow', 'income-expenses', 'categories', 'savings', 'freelance', 'budgets']"
            :key="report"
            @click="selectedReport = report"
            :class="[
              'p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105',
              selectedReport === report
                ? 'border-blue-400 bg-blue-500/20 backdrop-blur-sm'
                : 'border-white/20 bg-white/5 backdrop-blur-sm hover:border-white/40 hover:bg-white/10'
            ]"
          >
            <div class="text-center">
              <div class="text-lg font-semibold text-white capitalize">
                {{ report.replace('-', ' ') }}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Report Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Main Chart with glassmorphism -->
      <div class="lg:col-span-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-blue-500/20 p-8 hover:shadow-blue-500/30 transition-all duration-500 hover:scale-[1.02] group">
        <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>
        <div class="relative z-10">
          <h3 class="text-2xl font-bold text-white mb-6 tracking-wide group-hover:text-blue-200 transition-colors duration-300">
            {{ selectedReport.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) }} Report
          </h3>
          <div class="h-96 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 group-hover:bg-white/10 transition-all duration-500 p-4">
            <component 
              :is="currentChartComponent" 
              :data="currentChartData" 
              :loading="false"
            />
          </div>
        </div>
      </div>

      <!-- Summary Stats with glassmorphism -->
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-green-500/20 p-8 hover:shadow-green-500/30 transition-all duration-500 hover:scale-[1.02] group">
        <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>
        <div class="relative z-10">
          <h3 class="text-2xl font-bold text-white mb-6 tracking-wide group-hover:text-green-200 transition-colors duration-300">Summary</h3>
          <div class="space-y-6">
            <div class="flex justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <span class="text-white/80 group-hover:text-white transition-colors duration-300">Total Income:</span>
              <span class="font-bold text-green-400 group-hover:text-green-300 transition-colors duration-300">$8,500</span>
            </div>
            
            <div class="flex justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <span class="text-white/80 group-hover:text-white transition-colors duration-300">Total Expenses:</span>
              <span class="font-bold text-red-400 group-hover:text-red-300 transition-colors duration-300">$4,200</span>
            </div>
            
            <div class="flex justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <span class="text-white/80 group-hover:text-white transition-colors duration-300">Net Savings:</span>
              <span class="font-bold text-blue-400 group-hover:text-blue-300 transition-colors duration-300">$4,300</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Key Insights with glassmorphism -->
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-orange-500/20 p-8 hover:shadow-orange-500/30 transition-all duration-500 hover:scale-[1.02] group">
        <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>
        <div class="relative z-10">
          <h3 class="text-2xl font-bold text-white mb-6 tracking-wide group-hover:text-orange-200 transition-colors duration-300">Key Insights</h3>
          <div class="space-y-4">
            <div class="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <p class="text-white/90 text-sm">Your expenses are 15% below budget this month</p>
            </div>
            <div class="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <p class="text-white/90 text-sm">Freelance income increased by 22% compared to last month</p>
            </div>
            <div class="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <p class="text-white/90 text-sm">Savings rate is on track to meet your annual goal</p>
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

.shadow-purple-500\/20 {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(147, 51, 234, 0.1);
}

.shadow-blue-500\/20 {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(59, 130, 246, 0.1);
}

.shadow-green-500\/20 {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(34, 197, 94, 0.1);
}

.shadow-orange-500\/20 {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(249, 115, 22, 0.1);
}

/* Smooth transitions */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Button hover effects */
button:hover {
  transform: translateY(-1px);
}

/* Select focus effects */
select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
