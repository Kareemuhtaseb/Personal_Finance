<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLogin = ref(true)
const isLoading = ref(false)
const error = ref<string | null>(null)

const formData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  timezone: 'UTC',
  currency: 'USD'
})

// Password validation
const passwordValidation = ref({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  special: false
})

const validatePassword = (password: string) => {
  passwordValidation.value = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
}

const isPasswordValid = computed(() => {
  return Object.values(passwordValidation.value).every(Boolean)
})

// Redirect if already authenticated
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = null
  formData.value = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    timezone: 'UTC',
    currency: 'USD'
  }
  // Reset password validation
  passwordValidation.value = {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  }
}

const handleSubmit = async () => {
  try {
    isLoading.value = true
    error.value = null

    if (isLogin.value) {
      // Login
      const result = await authStore.login({
        email: formData.value.email,
        password: formData.value.password
      })
      
      if (result.success) {
        router.push('/')
      } else {
        error.value = result.error || 'Login failed'
      }
    } else {
      // Register
      if (formData.value.password !== formData.value.confirmPassword) {
        error.value = 'Passwords do not match'
        return
      }

      if (!isPasswordValid.value) {
        error.value = 'Password does not meet all requirements'
        return
      }

      const result = await authStore.register({
        name: formData.value.name,
        email: formData.value.email,
        password: formData.value.password,
        timezone: formData.value.timezone,
        currency: formData.value.currency
      })
      
      if (result.success) {
        router.push('/')
      } else {
        error.value = result.error || 'Registration failed'
      }
    }
  } catch (err) {
    error.value = 'An unexpected error occurred'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 relative overflow-hidden flex items-center justify-center p-4">
    <!-- Enhanced background elements -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- Floating orbs -->
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-slate-600/8 rounded-full blur-3xl animate-float"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-500/8 rounded-full blur-3xl animate-float animate-delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-500/5 rounded-full blur-3xl animate-breathe"></div>
      
      <!-- Accent orbs -->
      <div class="absolute top-1/4 right-1/4 w-32 h-32 bg-slate-400/10 rounded-full blur-2xl animate-pulse-glow"></div>
      <div class="absolute bottom-1/4 left-1/4 w-40 h-40 bg-gray-400/8 rounded-full blur-2xl animate-pulse-glow animate-delay-1000"></div>
      
      <!-- Grid pattern overlay -->
      <div class="absolute inset-0 opacity-[0.01] bg-pattern-grid"></div>
    </div>

    <div class="w-full max-w-md relative z-10">
      <!-- Enhanced Logo/Title -->
      <div class="text-center mb-8 animate-fade-in">
        <div class="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4 relative overflow-hidden">
          <!-- Logo background animation -->
          <div class="absolute inset-0 bg-blue-400 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          <span class="text-white font-bold text-2xl relative z-10">F</span>
        </div>
        <h1 class="text-4xl font-bold text-white mb-2 animate-slide-in-up">FinanceHub</h1>
        <p class="text-white/70 animate-slide-in-up animate-delay-100">Manage your finances with ease</p>
      </div>

      <!-- Enhanced Login/Register Form -->
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 relative overflow-hidden animate-fade-in-scale animate-delay-200">
        <!-- Form background effects -->
        <div class="absolute inset-0 bg-white/6 rounded-2xl"></div>
        <div class="absolute inset-0 bg-white/2 rounded-2xl"></div>
        
        <!-- Animated border gradient -->
        <div class="absolute inset-0 rounded-2xl bg-blue-500/20 opacity-50"></div>
        <div class="absolute inset-[1px] bg-gray-900/95 rounded-2xl"></div>
        
        <!-- Floating particles -->
        <div class="absolute top-6 right-6 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse-glow"></div>
        <div class="absolute bottom-6 left-6 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse-glow animate-delay-1000"></div>
        <div class="relative z-10">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-white mb-2 animate-slide-in-up">
              {{ isLogin ? 'Welcome Back' : 'Create Account' }}
            </h2>
            <p class="text-white/70 animate-slide-in-up animate-delay-100">
              {{ isLogin ? 'Sign in to your account' : 'Get started with FinanceHub' }}
            </p>
          </div>

          <!-- Enhanced Error Message -->
          <div v-if="error" class="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 relative overflow-hidden animate-bounce-in">
            <div class="absolute inset-0 bg-red-500/10 rounded-xl"></div>
            <div class="relative z-10 flex items-center">
              <div class="w-5 h-5 bg-red-400 rounded-full mr-3 animate-pulse"></div>
              <p class="text-red-300 text-sm">{{ error }}</p>
            </div>
          </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Name field (only for registration) -->
          <div v-if="!isLogin">
            <label class="block text-sm font-medium text-white/90 mb-2">
              Full Name
            </label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
              placeholder="Enter your full name"
            />
          </div>

          <!-- Email field -->
          <div>
            <label class="block text-sm font-medium text-white/90 mb-2">
              Email
            </label>
            <input
              v-model="formData.email"
              type="email"
              required
              class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
              placeholder="Enter your email"
            />
          </div>

          <!-- Password field -->
          <div>
            <label class="block text-sm font-medium text-white/90 mb-2">
              Password
            </label>
            <input
              v-model="formData.password"
              @input="validatePassword(formData.password)"
              type="password"
              required
              class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
              placeholder="Enter your password"
            />
            
            <!-- Password requirements (only show during registration) -->
            <div v-if="!isLogin && formData.password" class="mt-3 space-y-1">
              <p class="text-xs text-white/70 mb-2">Password requirements:</p>
              <div class="space-y-1">
                <div class="flex items-center text-xs">
                  <span :class="passwordValidation.length ? 'text-green-400' : 'text-red-400'" class="mr-2">
                    {{ passwordValidation.length ? '✓' : '✗' }}
                  </span>
                  <span :class="passwordValidation.length ? 'text-green-300' : 'text-red-300'">
                    At least 8 characters
                  </span>
                </div>
                <div class="flex items-center text-xs">
                  <span :class="passwordValidation.uppercase ? 'text-green-400' : 'text-red-400'" class="mr-2">
                    {{ passwordValidation.uppercase ? '✓' : '✗' }}
                  </span>
                  <span :class="passwordValidation.uppercase ? 'text-green-300' : 'text-red-300'">
                    One uppercase letter
                  </span>
                </div>
                <div class="flex items-center text-xs">
                  <span :class="passwordValidation.lowercase ? 'text-green-400' : 'text-red-400'" class="mr-2">
                    {{ passwordValidation.lowercase ? '✓' : '✗' }}
                  </span>
                  <span :class="passwordValidation.lowercase ? 'text-green-300' : 'text-red-300'">
                    One lowercase letter
                  </span>
                </div>
                <div class="flex items-center text-xs">
                  <span :class="passwordValidation.number ? 'text-green-400' : 'text-red-400'" class="mr-2">
                    {{ passwordValidation.number ? '✓' : '✗' }}
                  </span>
                  <span :class="passwordValidation.number ? 'text-green-300' : 'text-red-300'">
                    One number
                  </span>
                </div>
                <div class="flex items-center text-xs">
                  <span :class="passwordValidation.special ? 'text-green-400' : 'text-red-400'" class="mr-2">
                    {{ passwordValidation.special ? '✓' : '✗' }}
                  </span>
                  <span :class="passwordValidation.special ? 'text-green-300' : 'text-red-300'">
                    One special character (!@#$%^&*)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Confirm Password field (only for registration) -->
          <div v-if="!isLogin">
            <label class="block text-sm font-medium text-white/90 mb-2">
              Confirm Password
            </label>
            <input
              v-model="formData.confirmPassword"
              type="password"
              required
              class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
              placeholder="Confirm your password"
            />
          </div>

          <!-- Additional fields for registration -->
          <div v-if="!isLogin" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-white/90 mb-2">
                Timezone
              </label>
              <select
                v-model="formData.timezone"
                class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
              >
                <option value="UTC-8">UTC-8 (PST)</option>
                <option value="UTC-7">UTC-7 (MST)</option>
                <option value="UTC-6">UTC-6 (CST)</option>
                <option value="UTC-5">UTC-5 (EST)</option>
                <option value="UTC+0">UTC+0 (GMT)</option>
                <option value="UTC+1">UTC+1 (CET)</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-white/90 mb-2">
                Currency
              </label>
              <select
                v-model="formData.currency"
                class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>
          </div>

          <!-- Enhanced Submit button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:cursor-not-allowed relative overflow-hidden group"
          >
            <!-- Button background animation -->
            <div class="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <!-- Loading spinner -->
            <div v-if="isLoading" class="flex items-center justify-center">
              <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              Processing...
            </div>
            <span v-else class="relative z-10">
              {{ isLogin ? 'Sign In' : 'Create Account' }}
            </span>
          </button>
        </form>

          <!-- Enhanced Toggle between login and register -->
          <div class="mt-6 text-center animate-slide-in-up animate-delay-300">
            <p class="text-white/70">
              {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
              <button
                @click="toggleMode"
                class="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300 relative group"
              >
                <span class="relative z-10">{{ isLogin ? 'Sign up' : 'Sign in' }}</span>
                <!-- Underline animation -->
                <div class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></div>
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom glassmorphism enhancements */
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

/* Smooth transitions */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Input focus effects */
input:focus, select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Button hover effects */
button:hover {
  transform: translateY(-1px);
}
</style>
