<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'blue' | 'purple' | 'pink' | 'white' | 'green'
  text?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'blue',
  text: '',
  className: ''
})

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const colorClasses = {
  blue: 'border-blue-400',
  purple: 'border-purple-400',
  pink: 'border-pink-400',
  white: 'border-white',
  green: 'border-green-400'
}

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
}
</script>

<template>
  <div :class="['flex items-center justify-center', className]">
    <div class="flex flex-col items-center space-y-3">
      <!-- Spinner -->
      <div class="relative">
        <!-- Outer ring -->
        <div 
          :class="[
            'border-2 border-white/20 rounded-full animate-spin',
            sizeClasses[size]
          ]"
        ></div>
        
        <!-- Inner ring -->
        <div 
          :class="[
            'absolute inset-0 border-2 border-transparent border-t-current rounded-full animate-spin',
            sizeClasses[size],
            colorClasses[color]
          ]"
          style="animation-duration: 0.8s; animation-direction: reverse;"
        ></div>
        
        <!-- Center dot -->
        <div 
          :class="[
            'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse',
            colorClasses[color].replace('border-', 'bg-'),
            size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2 h-2' : 'w-3 h-3'
          ]"
        ></div>
      </div>
      
      <!-- Loading text -->
      <p v-if="text" :class="['text-white/70 font-medium', textSizeClasses[size]]">
        {{ text }}
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Custom spinner animations */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
