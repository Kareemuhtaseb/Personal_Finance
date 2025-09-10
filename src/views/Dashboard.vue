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
    <div v-if="error" class="glass-card shadow-red-glow p-4 mb-6">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center">
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
          <p class="text-premium-muted animate-slide-in-up animate-delay-100">
            Here's your financial overview for {{ new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}
          </p>
        </div>
        <div class="hidden md:flex items-center space-x-4 animate-slide-in-right">
          <button 
            @click="dashboardStore.refreshData()"
            :disabled="isLoading"
            class="btn-premium-success disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
          <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <span class="text-white font-bold text-lg">{{ new Date().getDate() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="i in 4" :key="i" class="glass-card shadow-blue-glow p-6 animate-pulse">
        <div class="h-4 bg-white-20 rounded mb-4"></div>
        <div class="h-8 bg-white-20 rounded mb-2"></div>
        <div class="h-3 bg-white-10 rounded w-2/3"></div>
      </div>
    </div>

    <!-- KPI Cards Grid -->
    <div v-else class="grid-premium-4 mb-8">
      <div class="glass-card-enhanced shadow-green-glow p-4 animate-fade-in-scale animate-delay-100">
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

      <div class="glass-card-enhanced shadow-red-glow p-4 animate-fade-in-scale animate-delay-200">
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

      <div class="glass-card-enhanced shadow-blue-glow p-4 animate-fade-in-scale animate-delay-300">
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

      <div class="glass-card-enhanced shadow-purple-glow p-4 animate-fade-in-scale animate-delay-400">
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
      <div class="glass-card-enhanced shadow-blue-glow p-6 animate-slide-in-up animate-delay-500">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white">Cashflow Trend</h3>
        </div>
        <div class="h-96">
          <CashflowChart :data="cashflowData" :loading="isLoading" />
        </div>
      </div>
      
      <!-- Category Breakdown -->
      <div class="glass-card-enhanced shadow-green-glow p-6 animate-slide-in-up animate-delay-600">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white">Expense Categories</h3>
        </div>
        <div class="h-96">
          <CategoryChart :data="categoryBreakdown" :loading="isLoading" />
        </div>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Recent Transactions -->
      <div class="lg:col-span-2 glass-card-enhanced shadow-purple-glow p-6 animate-slide-in-up animate-delay-700">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white">Recent Transactions</h3>
        </div>
        <div class="h-96">
          <RecentTransactions :transactions="recentTransactions" />
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="space-y-6 animate-slide-in-up animate-delay-800">
        <QuickActions />
      </div>
    </div>

    <!-- Freelance KPIs Section -->
    <div v-if="freelanceData" class="glass-card-enhanced shadow-orange-glow p-6 animate-slide-in-up animate-delay-900">
      <FreelanceKPIs :key="`freelance-kpis-${freelanceData?.activeProjects || 0}`" :data="freelanceData" />
    </div>
  </div>
</template>

<style scoped>
/* Dashboard-specific styles only - animations and shadows are now global */
</style>
