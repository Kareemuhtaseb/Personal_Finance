<script setup lang="ts">
import { computed } from 'vue'
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  BanknotesIcon, 
  BriefcaseIcon,
  CreditCardIcon
} from '@heroicons/vue/24/outline'

interface Props {
  title: string
  value: number
  icon: string
  color: 'green' | 'red' | 'blue' | 'purple' | 'yellow'
  change?: number
  changeType?: 'increase' | 'decrease'
}

const props = withDefaults(defineProps<Props>(), {
  change: 0,
  changeType: 'increase'
})

const iconComponent = computed(() => {
  switch (props.icon) {
    case 'arrow-trending-up':
      return ArrowTrendingUpIcon
    case 'arrow-trending-down':
      return ArrowTrendingDownIcon
    case 'banknotes':
      return BanknotesIcon
    case 'briefcase':
      return BriefcaseIcon
    case 'credit-card':
      return CreditCardIcon
    default:
      return BanknotesIcon
  }
})

const colorClasses = computed(() => {
  switch (props.color) {
    case 'green':
      return 'bg-gradient-to-br from-green-400/20 to-green-600/20 text-green-400 border-green-400/30'
    case 'red':
      return 'bg-gradient-to-br from-red-400/20 to-red-600/20 text-red-400 border-red-400/30'
    case 'blue':
      return 'bg-gradient-to-br from-blue-400/20 to-blue-600/20 text-blue-400 border-blue-400/30'
    case 'purple':
      return 'bg-gradient-to-br from-purple-400/20 to-purple-600/20 text-purple-400 border-purple-400/30'
    case 'yellow':
      return 'bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 text-yellow-400 border-yellow-400/30'
    default:
      return 'bg-gradient-to-br from-gray-400/20 to-gray-600/20 text-gray-400 border-gray-400/30'
  }
})

const changeColorClasses = computed(() => {
  if (props.changeType === 'increase') {
    return 'text-green-400'
  }
  return 'text-red-400'
})

const formatValue = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${value.toLocaleString()}`
}
</script>

<template>
  <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02] group p-6 relative overflow-hidden">
    <!-- Background gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>
    
    <div class="relative z-10">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors duration-300">
            {{ title }}
          </p>
          <p class="text-3xl font-bold text-white mt-2 tracking-wide group-hover:text-blue-100 transition-colors duration-300">
            {{ formatValue(value) }}
          </p>
        </div>
        
        <div :class="['p-4 rounded-2xl border backdrop-blur-sm shadow-lg', colorClasses]">
          <component :is="iconComponent" class="h-7 w-7 drop-shadow-lg" />
        </div>
      </div>
      
      <div v-if="change !== 0" class="mt-6 flex items-center">
        <component
          :is="props.changeType === 'increase' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon"
          :class="['h-5 w-5 mr-2', changeColorClasses]"
        />
        <span :class="['text-sm font-semibold', changeColorClasses]">
          {{ props.change > 0 ? '+' : '' }}{{ props.change }}%
        </span>
        <span class="text-sm text-white/60 ml-2 group-hover:text-white/80 transition-colors duration-300">
          from last month
        </span>
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
    0 0 40px rgba(59, 130, 246, 0.1);
}

.hover\:shadow-blue-500\/20:hover {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(59, 130, 246, 0.2);
}
</style>
