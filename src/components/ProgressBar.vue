<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'purple' | 'pink' | 'orange' | 'red'
  showLabel?: boolean
  animated?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  size: 'md',
  color: 'blue',
  showLabel: true,
  animated: true,
  className: ''
})

const percentage = computed(() => {
  return Math.min((props.value / props.max) * 100, 100)
})

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
}

const colorClasses = {
  blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
  green: 'bg-gradient-to-r from-green-500 to-green-600',
  purple: 'bg-gradient-to-r from-purple-500 to-purple-600',
  pink: 'bg-gradient-to-r from-pink-500 to-pink-600',
  orange: 'bg-gradient-to-r from-orange-500 to-orange-600',
  red: 'bg-gradient-to-r from-red-500 to-red-600'
}

const glowClasses = {
  blue: 'shadow-blue-500/50',
  green: 'shadow-green-500/50',
  purple: 'shadow-purple-500/50',
  pink: 'shadow-pink-500/50',
  orange: 'shadow-orange-500/50',
  red: 'shadow-red-500/50'
}
</script>

<template>
  <div :class="['w-full', className]">
    <!-- Label -->
    <div v-if="showLabel" class="flex justify-between items-center mb-2">
      <span class="text-sm font-medium text-white/90">Progress</span>
      <span class="text-sm font-semibold text-white">{{ Math.round(percentage) }}%</span>
    </div>
    
    <!-- Progress bar container -->
    <div 
      :class="[
        'w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/20',
        sizeClasses[size]
      ]"
    >
      <!-- Progress fill -->
      <div 
        :class="[
          'h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden',
          colorClasses[color],
          animated ? 'shadow-lg' : '',
          glowClasses[color]
        ]"
        :style="{ width: `${percentage}%` }"
      >
        <!-- Animated shimmer effect -->
        <div 
          v-if="animated"
          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
        ></div>
        
        <!-- Glow effect -->
        <div 
          v-if="animated"
          :class="[
            'absolute inset-0 rounded-full opacity-50',
            colorClasses[color]
          ]"
          style="filter: blur(4px);"
        ></div>
      </div>
    </div>
    
    <!-- Value display -->
    <div v-if="showLabel" class="flex justify-between items-center mt-1">
      <span class="text-xs text-white/60">{{ value }}</span>
      <span class="text-xs text-white/60">{{ max }}</span>
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
</style>
