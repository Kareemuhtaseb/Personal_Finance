<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  BanknotesIcon, 
  CreditCardIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'
import KPIWidget from '../components/dashboard/KPIWidget.vue'
import ChartCard from '../components/dashboard/ChartCard.vue'
import QuickActions from '../components/dashboard/QuickActions.vue'
import RecentTransactions from '../components/dashboard/RecentTransactions.vue'
import SavingsGoals from '../components/dashboard/SavingsGoals.vue'
import FreelanceKPIs from '../components/dashboard/FreelanceKPIs.vue'

// Mock data - will be replaced with real API calls
const monthlyData = ref({
  income: 8500,
  expenses: 4200,
  net: 4300,
  savings: 1200,
  freelance: 2800
})

const categoryBreakdown = ref([
  { name: 'Housing', amount: 1500, color: 'bg-gradient-to-r from-blue-400 to-blue-600' },
  { name: 'Food', amount: 800, color: 'bg-gradient-to-r from-green-400 to-green-600' },
  { name: 'Transport', amount: 400, color: 'bg-gradient-to-r from-yellow-400 to-yellow-600' },
  { name: 'Entertainment', amount: 300, color: 'bg-gradient-to-r from-purple-400 to-purple-600' },
  { name: 'Utilities', amount: 200, color: 'bg-gradient-to-r from-red-400 to-red-600' },
  { name: 'Other', amount: 1000, color: 'bg-gradient-to-r from-gray-400 to-gray-600' }
])

const recentTransactions = ref([
  { id: 1, description: 'Grocery Store', amount: -85.50, category: 'Food', date: '2024-01-15', type: 'expense' },
  { id: 2, description: 'Freelance Payment', amount: 1200.00, category: 'Income', date: '2024-01-14', type: 'income' },
  { id: 3, description: 'Gas Station', amount: -45.00, category: 'Transport', date: '2024-01-13', type: 'expense' },
  { id: 4, description: 'Salary', amount: 5000.00, category: 'Income', date: '2024-01-12', type: 'income' }
])

const savingsGoals = ref([
  { name: 'Emergency Fund', target: 10000, current: 7500, color: 'bg-gradient-to-r from-green-400 to-green-600' },
  { name: 'Vacation', target: 5000, current: 3200, color: 'bg-gradient-to-r from-blue-400 to-blue-600' },
  { name: 'New Car', target: 25000, current: 15000, color: 'bg-gradient-to-r from-purple-400 to-purple-600' }
])

const freelanceData = ref({
  activeProjects: 3,
  hoursLogged: 45,
  unpaidInvoices: 2,
  totalUnpaid: 3200
})

onMounted(() => {
  // Initialize charts and load data
  console.log('Dashboard mounted')
})
</script>

<template>
  <!-- Dashboard content without duplicate background -->
  <div class="space-y-8">
    <!-- Page header with quick stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPIWidget
        title="Monthly Income"
        :value="monthlyData.income"
        icon="arrow-trending-up"
        color="green"
        :change="+12.5"
        changeType="increase"
      />
      <KPIWidget
        title="Monthly Expenses"
        :value="monthlyData.expenses"
        icon="arrow-trending-down"
        color="red"
        :change="+8.2"
        changeType="increase"
      />
      <KPIWidget
        title="Net Savings"
        :value="monthlyData.net"
        icon="banknotes"
        color="blue"
        :change="+15.3"
        changeType="increase"
      />
      <KPIWidget
        title="Freelance Income"
        :value="monthlyData.freelance"
        icon="briefcase"
        color="purple"
        :change="+22.1"
        changeType="increase"
      />
    </div>

    <!-- Main content grid -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <!-- Left column - Main content area (2/3 width) -->
      <div class="xl:col-span-2 space-y-8">
        <!-- Cashflow chart with glassmorphism -->
        <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-blue-500/20 p-8 hover:shadow-blue-500/30 transition-all duration-500 hover:scale-[1.02] group">
          <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>
          <div class="relative z-10">
            <h3 class="text-2xl font-bold text-white mb-6 tracking-wide">
              Monthly Cashflow
            </h3>
            <div class="h-72 flex items-center justify-center text-white/70 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 group-hover:bg-white/10 transition-all duration-500">
              <div class="text-center">
                <ArrowTrendingUpIcon class="h-20 w-20 mx-auto mb-6 text-blue-400 drop-shadow-lg" />
                <p class="text-xl font-medium">Cashflow chart will be implemented with Chart.js</p>
                <p class="text-sm text-white/50 mt-2">Interactive financial visualization</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Category breakdown with glassmorphism -->
        <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-purple-500/20 p-8 hover:shadow-purple-500/30 transition-all duration-500 hover:scale-[1.02] group">
          <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>
          <div class="relative z-10">
            <h3 class="text-2xl font-bold text-white mb-8 tracking-wide">
              Expense Categories
            </h3>
            <div class="space-y-4">
              <div
                v-for="category in categoryBreakdown"
                :key="category.name"
                class="flex items-center justify-between p-5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] group/item"
              >
                <div class="flex items-center space-x-4">
                  <div :class="['w-5 h-5 rounded-full shadow-lg', category.color]"></div>
                  <span class="text-lg font-semibold text-white group-hover/item:text-blue-200 transition-colors duration-300">
                    {{ category.name }}
                  </span>
                </div>
                <span class="text-xl font-bold text-white group-hover/item:text-green-300 transition-colors duration-300">
                  ${{ category.amount.toLocaleString() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column - Sidebar (1/3 width) -->
      <div class="xl:col-span-1 space-y-8">
        <!-- Quick Actions -->
        <QuickActions />

        <!-- Savings Goals -->
        <SavingsGoals :goals="savingsGoals" />

        <!-- Freelance KPIs -->
        <FreelanceKPIs :data="freelanceData" />
      </div>
    </div>

    <!-- Bottom row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recent Transactions -->
      <RecentTransactions :transactions="recentTransactions" />

      <!-- Budget vs Actual -->
      <ChartCard title="Budget vs Actual" class="h-80">
        <div class="h-full flex items-center justify-center text-white/70">
          <div class="text-center">
            <CreditCardIcon class="h-16 w-16 mx-auto mb-4 text-green-400 drop-shadow-lg" />
            <p class="text-lg font-medium">Budget comparison chart will be implemented</p>
            <p class="text-sm text-white/50 mt-2">Visual budget tracking</p>
          </div>
        </div>
      </ChartCard>
    </div>

    <!-- Upcoming recurring items with glassmorphism -->
    <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-green-500/20 p-8 hover:shadow-green-500/30 transition-all duration-500 hover:scale-[1.02] group">
      <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>
      <div class="relative z-10">
        <h3 class="text-2xl font-bold text-white mb-6 tracking-wide">
          Upcoming Recurring Items
        </h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] group/item">
            <div class="flex items-center space-x-4">
              <div class="p-2 bg-blue-500/20 rounded-xl border border-blue-400/30">
                <ClockIcon class="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p class="text-base font-semibold text-white group-hover/item:text-blue-200 transition-colors duration-300">Rent Payment</p>
                <p class="text-sm text-white/60 group-hover/item:text-white/80 transition-colors duration-300">Due in 3 days</p>
              </div>
            </div>
            <span class="text-lg font-bold text-red-400 group-hover/item:text-red-300 transition-colors duration-300">-$1,200</span>
          </div>
          
          <div class="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] group/item">
            <div class="flex items-center space-x-4">
              <div class="p-2 bg-green-500/20 rounded-xl border border-green-400/30">
                <DocumentTextIcon class="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p class="text-base font-semibold text-white group-hover/item:text-green-200 transition-colors duration-300">Salary</p>
                <p class="text-sm text-white/60 group-hover/item:text-white/80 transition-colors duration-300">Due in 5 days</p>
              </div>
            </div>
            <span class="text-lg font-bold text-green-400 group-hover/item:text-green-300 transition-colors duration-300">+$5,000</span>
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

/* Smooth animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Enhanced shadows */
.shadow-2xl {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(59, 130, 246, 0.1);
}

/* Gradient text effects */
.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Smooth transitions */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects */
.group:hover .group-hover\:scale-\[1\.02\] {
  transform: scale(1.02);
}

.group:hover .group-hover\:text-blue-200 {
  color: #bfdbfe;
}

.group:hover .group-hover\:text-green-300 {
  color: #86efac;
}

.group:hover .group-hover\:text-red-300 {
  color: #fca5a5;
}

.group:hover .group-hover\:text-white\/80 {
  color: rgba(255, 255, 255, 0.8);
}
</style>
