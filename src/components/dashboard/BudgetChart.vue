<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface BudgetData {
  category: string
  budgeted: number
  actual: number
}

interface Props {
  data?: BudgetData[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const chartData = computed(() => {
  const data = props.data || []
  
  return {
    labels: data.map(item => item.category),
    datasets: [
      {
        label: 'Budgeted',
        data: data.map(item => item.budgeted),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false
      },
      {
        label: 'Actual',
        data: data.map(item => item.actual),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: 'rgba(255, 255, 255, 0.8)',
        font: {
          size: 14,
          weight: '500'
        },
        usePointStyle: true,
        pointStyle: 'rect'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'rgba(255, 255, 255, 0.9)',
      bodyColor: 'rgba(255, 255, 255, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        label: function(context: any) {
          return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        drawBorder: false
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 12
        }
      }
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        drawBorder: false
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 12
        },
        callback: function(value: any) {
          return `$${value.toLocaleString()}`
        }
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index' as const
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart' as const
  }
}
</script>

<template>
  <div class="h-full w-full">
    <div v-if="loading" class="h-full flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p class="text-white/70">Loading chart data...</p>
      </div>
    </div>
    <div v-else-if="props.data && props.data.length > 0" class="h-full">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="h-full flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
          <span class="text-2xl">📊</span>
        </div>
        <p class="text-white/60 text-sm">No budget data available</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Chart container styling */
:deep(.chartjs-render-monitor) {
  border-radius: 0.75rem;
}
</style>
