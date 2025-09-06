<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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
import CashflowChart from '../components/dashboard/CashflowChart.vue'
import CategoryChart from '../components/dashboard/CategoryChart.vue'
import BudgetChart from '../components/dashboard/BudgetChart.vue'
import { useDashboardStore } from '../stores/dashboard'
import { useAuthStore } from '../stores/auth'

// Stores
const dashboardStore = useDashboardStore()
const authStore = useAuthStore()

// Computed properties for real data
const monthlyData = computed(() => ({
  income: dashboardStore.monthlyIncome,
  expenses: dashboardStore.monthlyExpenses,
  net: dashboardStore.netSavings,
  savings: dashboardStore.savingsProgress,
  freelance: dashboardStore.freelanceIncome
}))

const kpis = computed(() => dashboardStore.kpis)
const recentTransactions = computed(() => dashboardStore.recentTransactions)
const savingsGoals = computed(() => dashboardStore.savingsGoals)
const freelanceData = computed(() => dashboardStore.freelanceSummary)

// Category breakdown data for charts
const categoryBreakdown = computed(() => [
  { name: 'Housing', amount: 1500, color: 'rgb(100, 116, 139)' },
  { name: 'Food', amount: 800, color: 'rgb(34, 197, 94)' },
  { name: 'Transport', amount: 400, color: 'rgb(234, 179, 8)' },
  { name: 'Entertainment', amount: 300, color: 'rgb(107, 114, 128)' },
  { name: 'Utilities', amount: 200, color: 'rgb(239, 68, 68)' },
  { name: 'Other', amount: 1000, color: 'rgb(148, 163, 184)' }
])

// Cashflow data for charts
const cashflowData = computed(() => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  income: [5000, 5200, 4800, 5500, 6000, 5800],
  expenses: [3200, 3400, 3100, 3600, 3800, 3500]
}))

// Budget vs Actual data
const budgetData = computed(() => [
  { category: 'Housing', budgeted: 1500, actual: 1450 },
  { category: 'Food', budgeted: 800, actual: 750 },
  { category: 'Transport', budgeted: 400, actual: 420 },
  { category: 'Entertainment', budgeted: 300, actual: 280 },
  { category: 'Utilities', budgeted: 200, actual: 195 },
  { category: 'Other', budgeted: 1000, actual: 950 }
])

// Loading and error states
const isLoading = computed(() => dashboardStore.isLoading)
const error = computed(() => dashboardStore.error)

// Minimal dashboard setup for testing navigation
onMounted(() => {
  console.log('Dashboard mounted - navigation test')
})
</script>

<template>
  <!-- Enhanced Dashboard with modern layout -->
  <div class="space-y-8 animate-fade-in">
    <!-- Enhanced header with greeting -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-bold text-white mb-2 animate-slide-in-up">
            Welcome back, {{ authStore.userName || 'User' }}! 👋
          </h1>
          <p class="text-white/70 text-lg animate-slide-in-up" style="animation-delay: 0.1s;">
            Here's your financial overview for {{ new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}
          </p>
        </div>
        <div class="hidden md:flex items-center space-x-4 animate-slide-in-right">
          <div class="text-right">
            <p class="text-sm text-white/60">Last updated</p>
            <p class="text-sm font-medium text-white">{{ new Date().toLocaleTimeString() }}</p>
          </div>
          <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-white font-bold text-lg">{{ new Date().getDate() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- KPI Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="animate-fade-in-scale" style="animation-delay: 0.1s;">
        <KPIWidget
          title="Total Income"
          :value="monthlyData.income"
          icon="banknotes"
          color="green"
          :change="12.5"
          change-type="increase"
        />
      </div>
      <div class="animate-fade-in-scale" style="animation-delay: 0.2s;">
        <KPIWidget
          title="Total Expenses"
          :value="monthlyData.expenses"
          icon="credit-card"
          color="red"
          :change="8.2"
          change-type="increase"
        />
      </div>
      <div class="animate-fade-in-scale" style="animation-delay: 0.3s;">
        <KPIWidget
          title="Net Savings"
          :value="monthlyData.net"
          icon="arrow-trending-up"
          color="blue"
          :change="15.3"
          change-type="increase"
        />
      </div>
      <div class="animate-fade-in-scale" style="animation-delay: 0.4s;">
        <KPIWidget
          title="Freelance Income"
          :value="monthlyData.freelance"
          icon="briefcase"
          color="purple"
          :change="22.1"
          change-type="increase"
        />
      </div>
    </div>

    <!-- Charts and Analytics Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Cashflow Chart -->
      <div class="animate-slide-in-up" style="animation-delay: 0.5s;">
        <ChartCard title="Cashflow Trend" class="h-96">
          <CashflowChart :data="cashflowData" />
        </ChartCard>
      </div>
      
      <!-- Category Breakdown -->
      <div class="animate-slide-in-up" style="animation-delay: 0.6s;">
        <ChartCard title="Expense Categories" class="h-96">
          <CategoryChart :data="categoryBreakdown" />
        </ChartCard>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Recent Transactions -->
      <div class="lg:col-span-2 animate-slide-in-up" style="animation-delay: 0.7s;">
        <ChartCard title="Recent Transactions" class="h-96">
          <RecentTransactions :transactions="recentTransactions" />
        </ChartCard>
      </div>
      
      <!-- Quick Actions & Savings Goals -->
      <div class="space-y-6 animate-slide-in-up" style="animation-delay: 0.8s;">
        <QuickActions />
        <SavingsGoals :goals="savingsGoals" />
      </div>
    </div>

    <!-- Freelance KPIs Section -->
    <div class="animate-slide-in-up" style="animation-delay: 0.9s;">
      <FreelanceKPIs :data="freelanceData" />
    </div>
  </div>
</template>

<style scoped>
/* Enhanced animations */
@keyframes fadeIn {
  0% { 
    opacity: 0; 
    transform: translateY(20px);
  }
  100% { 
    opacity: 1; 
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  0% { 
    opacity: 0; 
    transform: translateY(30px);
  }
  100% { 
    opacity: 1; 
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  0% { 
    opacity: 0; 
    transform: translateX(30px);
  }
  100% { 
    opacity: 1; 
    transform: translateX(0);
  }
}

@keyframes fadeInScale {
  0% { 
    opacity: 0; 
    transform: scale(0.9);
  }
  100% { 
    opacity: 1; 
    transform: scale(1);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-8px) rotate(0.5deg); }
  66% { transform: translateY(-12px) rotate(-0.5deg); }
}

@keyframes pulse-glow {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }
  50% { 
    box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Animation classes */
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

.animate-slide-in-up {
  animation: slideInUp 0.6s ease-out;
}

.animate-slide-in-right {
  animation: slideInRight 0.6s ease-out;
}

.animate-fade-in-scale {
  animation: fadeInScale 0.5s ease-out;
}

.animate-float {
  animation: float 8s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 4s ease-in-out infinite;
}

.animate-shimmer {
  position: relative;
  overflow: hidden;
}

.animate-shimmer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmer 2s infinite;
}

/* Enhanced glassmorphism */
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

/* Premium shadows */
.shadow-2xl {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(59, 130, 246, 0.1);
}

.shadow-premium {
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(255, 255, 255, 0.06),
    0 0 30px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
}

/* Gradient text effects */
.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-primary {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-secondary {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Smooth transitions */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced hover effects */
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

/* Interactive elements */
.interactive {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.interactive:hover {
  transform: translateY(-2px);
}

.interactive:active {
  transform: translateY(0);
}

/* Loading states */
.loading-shimmer {
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.1) 25%, 
    rgba(255, 255, 255, 0.2) 50%, 
    rgba(255, 255, 255, 0.1) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Focus states for accessibility */
.focus-ring {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus-ring:focus {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
}
</style>
