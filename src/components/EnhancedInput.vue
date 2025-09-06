<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  success?: boolean
  icon?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
  success: false,
  size: 'md',
  className: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}>()

const isFocused = ref(false)
const showPassword = ref(false)

const inputType = computed(() => {
  if (props.type === 'password' && showPassword.value) {
    return 'text'
  }
  return props.type
})

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg'
}

const containerClasses = computed(() => {
  const base = 'relative group'
  const focus = isFocused.value ? 'ring-2 ring-blue-400/50' : ''
  const error = props.error ? 'ring-2 ring-red-400/50' : ''
  const success = props.success ? 'ring-2 ring-green-400/50' : ''
  const disabled = props.disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  return [base, focus, error, success, disabled, props.className].filter(Boolean).join(' ')
})

const inputClasses = computed(() => {
  const base = 'w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none transition-all duration-300'
  const iconPadding = props.icon ? 'pl-12' : 'pl-4'
  const passwordPadding = props.type === 'password' ? 'pr-12' : 'pr-4'
  
  return [base, iconPadding, passwordPadding, sizeClasses[props.size]].join(' ')
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div :class="containerClasses">
    <!-- Label -->
    <label v-if="label" class="block text-sm font-medium text-white/90 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-400 ml-1">*</span>
    </label>
    
    <!-- Input container -->
    <div class="relative">
      <!-- Icon -->
      <div v-if="icon" class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <component :is="icon" class="h-5 w-5 text-white/60" />
      </div>
      
      <!-- Input field -->
      <input
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :class="inputClasses"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      
      <!-- Password toggle button -->
      <button
        v-if="type === 'password'"
        type="button"
        @click="togglePasswordVisibility"
        class="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-white/80 transition-colors duration-300"
      >
        <svg v-if="showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
        </svg>
        <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
      
      <!-- Success icon -->
      <div v-if="success && !error" class="absolute inset-y-0 right-0 pr-4 flex items-center">
        <svg class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <!-- Error icon -->
      <div v-if="error" class="absolute inset-y-0 right-0 pr-4 flex items-center">
        <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      
      <!-- Focus glow effect -->
      <div 
        v-if="isFocused"
        class="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50 pointer-events-none"
      ></div>
    </div>
    
    <!-- Error message -->
    <div v-if="error" class="mt-2 flex items-center space-x-2">
      <div class="w-4 h-4 bg-red-400 rounded-full animate-pulse"></div>
      <p class="text-sm text-red-300">{{ error }}</p>
    </div>
    
    <!-- Success message -->
    <div v-else-if="success" class="mt-2 flex items-center space-x-2">
      <div class="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
      <p class="text-sm text-green-300">Looks good!</p>
    </div>
  </div>
</template>

<style scoped>
/* Custom focus effects */
input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Smooth transitions */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
