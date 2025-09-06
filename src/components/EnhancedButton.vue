<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  iconPosition: 'left',
  fullWidth: false,
  className: ''
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-6 py-4 text-lg',
  xl: 'px-8 py-5 text-xl'
}

const variantClasses = {
  primary: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl',
  secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 backdrop-blur-sm',
  outline: 'bg-transparent hover:bg-white/10 text-white border border-white/30 hover:border-white/50',
  ghost: 'bg-transparent hover:bg-white/10 text-white/80 hover:text-white',
  danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl'
}

const buttonClasses = computed(() => {
  const base = 'relative overflow-hidden rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent'
  const size = sizeClasses[props.size]
  const variant = variantClasses[props.variant]
  const disabled = props.disabled || props.loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
  const fullWidth = props.fullWidth ? 'w-full' : ''
  
  return [base, size, variant, disabled, fullWidth, props.className].filter(Boolean).join(' ')
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <!-- Background animation -->
    <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    <!-- Ripple effect -->
    <div class="absolute inset-0 overflow-hidden rounded-xl">
      <div class="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150 rounded-xl"></div>
    </div>
    
    <!-- Content -->
    <div class="relative z-10 flex items-center justify-center space-x-2">
      <!-- Loading spinner -->
      <div v-if="loading" class="flex items-center space-x-2">
        <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        <span>Loading...</span>
      </div>
      
      <!-- Normal content -->
      <template v-else>
        <!-- Left icon -->
        <component 
          v-if="icon && iconPosition === 'left'" 
          :is="icon" 
          class="h-5 w-5" 
        />
        
        <!-- Button text -->
        <slot />
        
        <!-- Right icon -->
        <component 
          v-if="icon && iconPosition === 'right'" 
          :is="icon" 
          class="h-5 w-5" 
        />
      </template>
    </div>
    
    <!-- Shimmer effect on hover -->
    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <div class="animate-shimmer absolute inset-0 rounded-xl"></div>
    </div>
  </button>
</template>

<style scoped>
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmer 2s infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Smooth transitions */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
