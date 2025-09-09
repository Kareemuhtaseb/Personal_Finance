<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
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
import FreelanceKPIs from '../components/dashboard/FreelanceKPIs.vue'
import CashflowChart from '../components/dashboard/CashflowChart.vue'
import CategoryChart from '../components/dashboard/CategoryChart.vue'
import BudgetChart from '../components/dashboard/BudgetChart.vue'
import { useDashboardStore } from '../stores/dashboard'
import { useAuthStore } from '../stores/auth'

// Stores
const dashboardStore = useDashboardStore()
const authStore = useAuthStore()
const route = useRoute()

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
const freelanceData = computed(() => dashboardStore.freelanceSummary)

// Category breakdown data for charts - will be populated from real data
const categoryBreakdown = computed(() => dashboardStore.categoryBreakdown || [])

// Cashflow data for charts - will be populated from real data
const cashflowData = computed(() => dashboardStore.cashflowData || null)

// Budget vs Actual data - will be populated from real data
const budgetData = computed(() => dashboardStore.budgetData || [])

// Loading and error states
const isLoading = computed(() => dashboardStore.isLoading)
const error = computed(() => dashboardStore.error)

// Load dashboard data on mount
onMounted(async () => {
  await dashboardStore.fetchAllDashboardData()
})

// Watch for route changes to refresh data when returning to dashboard
// Only refresh if data is stale or if there's no data
watch(() => route.path, async (newPath, oldPath) => {
  if (newPath === '/' && oldPath && oldPath !== '/') {
    // User navigated back to dashboard from another page
    // Only refresh if we don't have fresh data
    if (!dashboardStore.isDataFresh()) {
      await dashboardStore.fetchAllDashboardData()
    }
  }
}, { immediate: false })
</script>

<template>
  <!-- Enhanced Dashboard with modern layout -->
  <div class="space-premium animate-fade-in">
    <!-- Error State -->
    <div v-if="error" class="backdrop-blur-xl bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-6">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
          <span class="text-red-400 text-sm">⚠️</span>
        </div>
        <div>
          <p class="text-red-400 font-medium">Error loading dashboard data</p>
          <p class="text-red-300/70 text-sm">{{ error }}</p>
        </div>
      </div>
    </div>
    <!-- Enhanced header with greeting -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-premium-large mb-2 animate-slide-in-up">
            Welcome back, {{ authStore.userName || 'User' }}! 👋
          </h1>
          <p class="text-premium-muted text-lg animate-slide-in-up" style="animation-delay: 0.1s;">
            Here's your financial overview for {{ new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}
          </p>
        </div>
        <div class="hidden md:flex items-center space-x-4 animate-slide-in-right">
          <button 
            @click="dashboardStore.refreshData()"
            :disabled="isLoading"
            class="btn-premium-success text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="Refresh dashboard data"
          >
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
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

    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="i in 4" :key="i" class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-blue-500/20 p-6 relative overflow-hidden animate-pulse">
        <!-- Enhanced background effects -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/8 to-white/4 rounded-3xl"></div>
        <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent rounded-3xl"></div>
        
        <!-- Animated border gradient -->
        <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-50"></div>
        <div class="absolute inset-[1px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-3xl"></div>
        
        <div class="relative z-10">
          <div class="h-4 bg-white/20 rounded mb-4"></div>
          <div class="h-8 bg-white/20 rounded mb-2"></div>
          <div class="h-3 bg-white/10 rounded w-2/3"></div>
        </div>
      </div>
    </div>

    <!-- KPI Cards Grid -->
    <div v-else class="grid-premium-4 mb-8">
      <div class="kpi-card rounded-xl shadow-green-500/20 p-4 animate-fade-in-scale" style="animation-delay: 0.1s;">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-premium-subtle text-xs">Total Income</p>
            <p class="text-premium-small">{{ monthlyData.income }}</p>
          </div>
          <div class="w-8 h-8 flex items-center justify-center">
            <svg class="icon-premium-sm text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="kpi-card rounded-xl shadow-red-500/20 p-4 animate-fade-in-scale" style="animation-delay: 0.2s;">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-premium-subtle text-xs">Total Expenses</p>
            <p class="text-premium-small">{{ monthlyData.expenses }}</p>
          </div>
          <div class="w-8 h-8 flex items-center justify-center">
            <svg class="icon-premium-sm text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="kpi-card rounded-xl shadow-blue-500/20 p-4 animate-fade-in-scale" style="animation-delay: 0.3s;">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-premium-subtle text-xs">Net Savings</p>
            <p class="text-premium-small">{{ monthlyData.net }}</p>
          </div>
          <div class="w-8 h-8 flex items-center justify-center">
            <svg class="icon-premium-sm text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="kpi-card rounded-xl shadow-purple-500/20 p-4 animate-fade-in-scale" style="animation-delay: 0.4s;">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-premium-subtle text-xs">Freelance Income</p>
            <p class="text-premium-small">{{ monthlyData.freelance }}</p>
          </div>
          <div class="w-8 h-8 flex items-center justify-center">
            <svg class="icon-premium-sm text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts and Analytics Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Cashflow Chart -->
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-blue-500/20 p-6 relative overflow-hidden animate-slide-in-up" style="animation-delay: 0.5s;">
        <!-- Enhanced background effects -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/8 to-white/4 rounded-3xl"></div>
        <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent rounded-3xl"></div>
        
        <!-- Animated border gradient -->
        <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-50"></div>
        <div class="absolute inset-[1px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-3xl"></div>
        
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-white">Cashflow Trend</h3>
          </div>
          <div class="h-96">
            <CashflowChart :data="cashflowData" :loading="isLoading" />
          </div>
        </div>
      </div>
      
      <!-- Category Breakdown -->
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-green-500/20 p-6 relative overflow-hidden animate-slide-in-up" style="animation-delay: 0.6s;">
        <!-- Enhanced background effects -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/8 to-white/4 rounded-3xl"></div>
        <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent rounded-3xl"></div>
        
        <!-- Animated border gradient -->
        <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 opacity-50"></div>
        <div class="absolute inset-[1px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-3xl"></div>
        
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-white">Expense Categories</h3>
          </div>
          <div class="h-96">
            <CategoryChart :data="categoryBreakdown" :loading="isLoading" />
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Recent Transactions -->
      <div class="lg:col-span-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-purple-500/20 p-6 relative overflow-hidden animate-slide-in-up" style="animation-delay: 0.7s;">
        <!-- Enhanced background effects -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/8 to-white/4 rounded-3xl"></div>
        <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent rounded-3xl"></div>
        
        <!-- Animated border gradient -->
        <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 opacity-50"></div>
        <div class="absolute inset-[1px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-3xl"></div>
        
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-white">Recent Transactions</h3>
          </div>
          <div class="h-96">
            <RecentTransactions :transactions="recentTransactions" />
          </div>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="space-y-6 animate-slide-in-up" style="animation-delay: 0.8s;">
        <QuickActions />
      </div>
    </div>

    <!-- Freelance KPIs Section -->
    <div v-if="freelanceData" class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-orange-500/20 p-6 relative overflow-hidden animate-slide-in-up" style="animation-delay: 0.9s;">
      <!-- Enhanced background effects -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/8 to-white/4 rounded-3xl"></div>
      <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent rounded-3xl"></div>
      
      <!-- Animated border gradient -->
      <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-red-500/20 opacity-50"></div>
      <div class="absolute inset-[1px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-3xl"></div>
      
      <div class="relative z-10">
        <FreelanceKPIs :key="`freelance-kpis-${freelanceData?.activeProjects || 0}`" :data="freelanceData" />
      </div>
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
