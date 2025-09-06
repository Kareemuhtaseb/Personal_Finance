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
      return 'bg-gradient-to-br from-green-500/15 to-green-600/15 text-green-400 border-green-400/20'
    case 'red':
      return 'bg-gradient-to-br from-red-500/15 to-red-600/15 text-red-400 border-red-400/20'
    case 'blue':
      return 'bg-gradient-to-br from-slate-500/15 to-slate-600/15 text-slate-400 border-slate-400/20'
    case 'purple':
      return 'bg-gradient-to-br from-gray-500/15 to-gray-600/15 text-gray-400 border-gray-400/20'
    case 'yellow':
      return 'bg-gradient-to-br from-yellow-500/15 to-yellow-600/15 text-yellow-400 border-yellow-400/20'
    default:
      return 'bg-gradient-to-br from-gray-500/15 to-gray-600/15 text-gray-400 border-gray-400/20'
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
  <div class="card-premium rounded-2xl p-6 relative overflow-hidden group animate-fade-in-scale hover:scale-[1.02] transition-all duration-500">
    <!-- Enhanced background gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/8 to-white/4 rounded-2xl"></div>
    <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-2xl"></div>
    
    <!-- Animated border gradient -->
    <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div class="absolute inset-[1px] bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-2xl"></div>
    
    <!-- Shimmer effect on hover -->
    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <div class="animate-shimmer absolute inset-0 rounded-2xl"></div>
    </div>
    
    
    <div class="relative z-10">
      <div class="flex items-center justify-between mb-4">
        <div class="flex-1">
          <p class="text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors duration-300 mb-2 flex items-center">
            <span class="w-2 h-2 bg-current rounded-full mr-2 opacity-60"></span>
            {{ title }}
          </p>
          <p class="text-3xl font-bold text-white tracking-wide group-hover:text-blue-100 transition-colors duration-300 text-render-optimized">
            {{ formatValue(value) }}
          </p>
        </div>
        
        <div :class="['p-4 rounded-xl border backdrop-blur-sm shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative', colorClasses]">
          <!-- Icon background glow -->
          <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <component :is="iconComponent" class="h-7 w-7 drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300 relative z-10" />
        </div>
      </div>
      
      <div v-if="change !== 0" class="flex items-center justify-between">
        <div class="flex items-center">
          <component
            :is="props.changeType === 'increase' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon"
            :class="['h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110', changeColorClasses]"
          />
          <span :class="['text-sm font-semibold transition-colors duration-300', changeColorClasses]">
            {{ props.change > 0 ? '+' : '' }}{{ props.change }}%
          </span>
          <span class="text-sm text-white/60 ml-2 group-hover:text-white/80 transition-colors duration-300">
            from last month
          </span>
        </div>
        
        <!-- Progress indicator -->
        <div class="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            :class="['h-full rounded-full transition-all duration-1000', 
              props.changeType === 'increase' ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-red-400 to-red-500'
            ]"
            :style="{ width: `${Math.min(Math.abs(props.change), 100)}%` }"
          ></div>
        </div>
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
