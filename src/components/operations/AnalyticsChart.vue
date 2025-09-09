<template>
  <div class="analytics-chart bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
      <div class="flex gap-2">
        <button
          v-for="period in periods"
          :key="period"
          @click="selectedPeriod = period"
          :class="[
            'px-3 py-1 rounded-full text-sm font-medium transition-colors',
            selectedPeriod === period
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          {{ period }}
        </button>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="relative h-64">
      <canvas ref="chartCanvas" class="w-full h-full"></canvas>
    </div>

    <!-- Chart Legend -->
    <div class="mt-4 flex items-center justify-center gap-6">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
        <span class="text-sm text-gray-600">Income</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-red-500 rounded-full"></div>
        <span class="text-sm text-gray-600">Expenses</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span class="text-sm text-gray-600">Net Profit</span>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
      <div class="text-center">
        <p class="text-sm text-gray-600">Total Income</p>
        <p class="text-lg font-semibold text-green-600">${{ totalIncome.toFixed(2) }}</p>
      </div>
      <div class="text-center">
        <p class="text-sm text-gray-600">Total Expenses</p>
        <p class="text-lg font-semibold text-red-600">${{ totalExpenses.toFixed(2) }}</p>
      </div>
      <div class="text-center">
        <p class="text-sm text-gray-600">Net Profit</p>
        <p class="text-lg font-semibold" :class="netProfit >= 0 ? 'text-green-600' : 'text-red-600'">
          ${{ netProfit.toFixed(2) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

// Props
interface Props {
  title?: string
  data?: Array<{
    date: string
    income: number
    expenses: number
  }>
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Cost vs Income Analytics',
  data: () => []
})

// Reactive data
const chartCanvas = ref<HTMLCanvasElement>()
const selectedPeriod = ref('monthly')
const chart = ref<Chart | null>(null)

// Constants
const periods = ['daily', 'weekly', 'monthly', 'yearly']

// Computed properties
const totalIncome = computed(() => {
  return props.data.reduce((sum, item) => sum + item.income, 0)
})

const totalExpenses = computed(() => {
  return props.data.reduce((sum, item) => sum + item.expenses, 0)
})

const netProfit = computed(() => {
  return totalIncome.value - totalExpenses.value
})

// Methods
const createChart = () => {
  if (!chartCanvas.value) return

  // Destroy existing chart
  if (chart.value) {
    chart.value.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  // Prepare data
  const labels = props.data.map(item => {
    const date = new Date(item.date)
    return selectedPeriod.value === 'daily' 
      ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : date.toLocaleDateString('en-US', { month: 'short' })
  })

  const incomeData = props.data.map(item => item.income)
  const expensesData = props.data.map(item => item.expenses)
  const profitData = props.data.map(item => item.income - item.expenses)

  chart.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4
        },
        {
          label: 'Expenses',
          data: expensesData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4
        },
        {
          label: 'Net Profit',
          data: profitData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // We have custom legend
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: false
          },
          ticks: {
            color: '#6b7280'
          }
        },
        y: {
          display: true,
          beginAtZero: true,
          grid: {
            color: '#f3f4f6'
          },
          ticks: {
            color: '#6b7280',
            callback: function(value) {
              return '$' + (typeof value === 'number' ? value.toFixed(0) : value)
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  })
}

// Watch for data changes
watch(() => props.data, () => {
  nextTick(() => {
    createChart()
  })
}, { deep: true })

// Watch for period changes
watch(selectedPeriod, () => {
  nextTick(() => {
    createChart()
  })
})

// Lifecycle
onMounted(() => {
  nextTick(() => {
    createChart()
  })
})
</script>

<style scoped>
/* Chart container styles */
.analytics-chart {
  min-height: 400px;
}

/* Custom scrollbar for any overflow */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
