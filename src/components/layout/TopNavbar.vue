<script setup lang="ts">
import { ref } from 'vue'
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  SunIcon, 
  MoonIcon,
  Bars3Icon
} from '@heroicons/vue/24/outline'

interface Emits {
  (e: 'toggle-sidebar'): void
}

defineEmits<Emits>()

const isDarkMode = ref(false)
const showNotifications = ref(false)
const showUserMenu = ref(false)

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  // Toggle dark mode class on document
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const notifications = [
  { id: 1, message: 'Budget limit reached for Food category', type: 'warning', time: '2 min ago' },
  { id: 2, message: 'Invoice #1234 marked as paid', type: 'success', time: '1 hour ago' },
  { id: 3, message: 'Recurring payment due tomorrow', type: 'info', time: '3 hours ago' }
]

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'warning':
      return '⚠️'
    case 'success':
      return '✅'
    case 'info':
      return 'ℹ️'
    default:
      return '📢'
  }
}
</script>

<template>
  <header class="backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg shadow-blue-500/10 relative">
    <!-- Enhanced background for navbar -->
    <div class="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10"></div>
    
    <div class="relative z-10 px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Left side -->
        <div class="flex items-center">
          <!-- Mobile menu button -->
          <button
            @click="$emit('toggle-sidebar')"
            class="lg:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300"
          >
            <Bars3Icon class="h-6 w-6" />
          </button>
          
          <!-- Search -->
          <div class="ml-4 lg:ml-0 relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon class="h-5 w-5 text-white/60" />
            </div>
            <input
              type="text"
              placeholder="Search transactions, invoices..."
              class="block w-full pl-10 pr-3 py-2 border border-white/20 rounded-xl leading-5 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
            />
          </div>
        </div>

        <!-- Right side -->
        <div class="flex items-center space-x-4">
          <!-- Dark mode toggle -->
          <button
            @click="toggleDarkMode"
            class="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300"
          >
            <SunIcon v-if="isDarkMode" class="h-5 w-5" />
            <MoonIcon v-else class="h-5 w-5" />
          </button>

          <!-- Notifications -->
          <div class="relative">
            <button
              @click="showNotifications = !showNotifications"
              class="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 relative"
            >
              <BellIcon class="h-5 w-5" />
              <span v-if="notifications.length > 0" class="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full shadow-lg"></span>
            </button>

            <!-- Notifications dropdown -->
            <div
              v-if="showNotifications"
              class="absolute right-0 mt-2 w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-blue-500/20 z-50"
            >
              <div class="p-4">
                <h3 class="text-lg font-semibold text-white mb-4">Notifications</h3>
                <div class="space-y-3">
                  <div
                    v-for="notification in notifications"
                    :key="notification.id"
                    class="p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    <div class="flex items-start space-x-3">
                      <span class="text-lg">{{ getNotificationIcon(notification.type) }}</span>
                      <div class="flex-1">
                        <p class="text-sm text-white/90">{{ notification.message }}</p>
                        <p class="text-xs text-white/60 mt-1">{{ notification.time }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- User menu -->
          <div class="relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center space-x-3 p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span class="text-white font-medium text-sm">U</span>
              </div>
              <span class="hidden md:block text-sm font-medium">Admin User</span>
            </button>

            <!-- User dropdown -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-blue-500/20 z-50"
            >
              <div class="py-2">
                <a href="#" class="block px-4 py-2 text-sm text-white/90 hover:bg-white/10 transition-all duration-300">Profile</a>
                <a href="#" class="block px-4 py-2 text-sm text-white/90 hover:bg-white/10 transition-all duration-300">Settings</a>
                <a href="#" class="block px-4 py-2 text-sm text-white/90 hover:bg-white/10 transition-all duration-300">Sign out</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Custom glassmorphism enhancements */
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

/* Enhanced shadows */
.shadow-lg {
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

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
input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
