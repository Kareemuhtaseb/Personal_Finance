<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

interface CategoryData {
  name: string
  amount: number
  color: string
}

interface Props {
  data?: CategoryData[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const chartData = computed(() => {
  const data = props.data || []
  
  return {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.amount),
        backgroundColor: data.map(item => item.color),
        borderColor: data.map(item => item.color),
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff',
        cutout: '60%'
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: 'rgba(255, 255, 255, 0.8)',
        font: {
          size: 12,
          weight: '500'
        },
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
        generateLabels: function(chart: any) {
          const data = chart.data
          if (data.labels.length && data.datasets.length) {
            return data.labels.map((label: string, index: number) => {
              const dataset = data.datasets[0]
              const value = dataset.data[index]
              const total = dataset.data.reduce((a: number, b: number) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              
              return {
                text: `${label}: $${value.toLocaleString()} (${percentage}%)`,
                fillStyle: dataset.backgroundColor[index],
                strokeStyle: dataset.borderColor[index],
                lineWidth: dataset.borderWidth,
                pointStyle: 'circle',
                hidden: false,
                index: index
              }
            })
          }
          return []
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
            const label = context.label || ''
            const value = context.parsed
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: $${value.toLocaleString()} (${percentage}%)`
          }
        }
      }
    }
  },
  animation: {
    animateRotate: true,
    animateScale: true,
    duration: 1000,
    easing: 'easeInOutQuart' as const
  },
  interaction: {
    intersect: false
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
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="h-full flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
          <span class="text-2xl">🥧</span>
        </div>
        <p class="text-white/60 text-sm">No category data available</p>
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