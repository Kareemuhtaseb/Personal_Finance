<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  SunIcon, 
  MoonIcon,
  Bars3Icon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '../../stores/auth'

interface Emits {
  (e: 'toggle-sidebar'): void
}

defineEmits<Emits>()

const router = useRouter()
const authStore = useAuthStore()

const isDarkMode = ref(false)
const showNotifications = ref(false)
const showUserMenu = ref(false)

// Computed properties
const userName = computed(() => authStore.userName || 'User')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  // Toggle dark mode class on document
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const notifications = ref([])

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

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    // Still redirect to login even if logout fails
    router.push('/login')
  }
}

const goToSettings = () => {
  router.push('/settings')
  showUserMenu.value = false
}
</script>

<template>
  <header class="glass-premium border-b border-white/20 shadow-premium relative">
    <!-- Enhanced background for navbar -->
    <div class="absolute inset-0 bg-gradient-to-r from-white/10 to-white/6"></div>
    <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent"></div>
    
    <!-- Animated border gradient -->
    <div class="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-50"></div>
    <div class="absolute inset-[1px] bg-gradient-to-r from-gray-900/95 to-gray-800/95"></div>
    
    <div class="relative z-10 px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Left side -->
        <div class="flex items-center">
          <!-- Mobile menu button -->
          <button
            @click="$emit('toggle-sidebar')"
            class="lg:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 relative overflow-hidden group"
          >
            <!-- Button background animation -->
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            <Bars3Icon class="h-6 w-6 relative z-10" />
          </button>
          
          <!-- Search -->
          <div class="ml-4 lg:ml-0 relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon class="h-5 w-5 text-white/60" />
            </div>
            <input
              type="text"
              placeholder="Search expenses, invoices..."
              class="block w-full pl-10 pr-3 py-2 border border-white/20 rounded-xl leading-5 glass text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 focus-ring bg-white/5 backdrop-blur-sm"
            />
            <!-- Search glow effect -->
            <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        </div>

        <!-- Right side -->
        <div class="flex items-center space-x-3">
          <!-- Dark mode toggle -->
          <button
            @click="toggleDarkMode"
            class="p-2 rounded-xl text-white/60 hover:text-white glass hover:glass-hover transition-all duration-300 interactive focus-ring relative overflow-hidden group"
          >
            <!-- Button background animation -->
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            <SunIcon v-if="isDarkMode" class="h-5 w-5 relative z-10" />
            <MoonIcon v-else class="h-5 w-5 relative z-10" />
          </button>

          <!-- Notifications -->
          <div class="relative">
            <button
              @click="showNotifications = !showNotifications"
              class="p-2 rounded-xl text-white/60 hover:text-white glass hover:glass-hover transition-all duration-300 relative interactive focus-ring overflow-hidden group"
            >
              <!-- Button background animation -->
              <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <BellIcon class="h-5 w-5 relative z-10" />
            </button>

            <!-- Notifications dropdown -->
            <div
              v-if="showNotifications"
              class="absolute right-0 mt-2 w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-blue-500/20 z-50"
            >
              <div class="p-4">
                <h3 class="text-lg font-semibold text-white mb-4">Notifications</h3>
                <div v-if="notifications.length === 0" class="text-center py-8">
                  <p class="text-white/60">No notifications yet</p>
                  <p class="text-white/40 text-sm mt-1">You'll see important updates here</p>
                </div>
                <div v-else class="space-y-3">
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
              class="flex items-center space-x-3 p-2 rounded-xl text-white/60 hover:text-white glass hover:glass-hover transition-all duration-300 interactive focus-ring relative overflow-hidden group"
            >
              <!-- Button background animation -->
              <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              
              <div class="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg relative overflow-hidden">
                <!-- Avatar background animation -->
                <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span class="text-white font-medium text-sm relative z-10">{{ userInitial }}</span>
              </div>
              <span class="hidden md:block text-sm font-medium relative z-10">{{ userName }}</span>
            </button>

            <!-- User dropdown -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-blue-500/20 z-50"
            >
              <div class="py-2">
                <button @click="goToSettings" class="block w-full text-left px-4 py-2 text-sm text-white/90 hover:bg-white/10 transition-all duration-300">Settings</button>
                <button @click="handleLogout" class="block w-full text-left px-4 py-2 text-sm text-white/90 hover:bg-white/10 transition-all duration-300">Sign out</button>
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
