<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  HomeIcon, 
  CreditCardIcon, 
  BanknotesIcon, 
  BriefcaseIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  XMarkIcon,
  CogIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '../../stores/auth'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()

// Computed properties for user data
const userName = computed(() => authStore.userName || 'User')
const userEmail = computed(() => authStore.userEmail || 'user@example.com')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Expenses', href: '/expenses', icon: CreditCardIcon },
  { name: 'Income', href: '/income', icon: BanknotesIcon },
  { name: 'Freelance', href: '/freelance', icon: BriefcaseIcon },
  { name: 'Operations', href: '/operations', icon: CogIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon }
]

const closeSidebar = () => {
  emit('close')
}
</script>

<template>
  <!-- Mobile sidebar overlay -->
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-40 lg:hidden"
    @click="closeSidebar"
  >
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
  </div>

  <!-- Sidebar -->
  <div class="hidden lg:flex lg:flex-shrink-0 lg:h-screen lg:fixed lg:left-0 lg:top-0 lg:z-30">
    <div class="w-64 backdrop-blur-xl bg-white-10 border-r border-white-20 shadow-2xl shadow-blue-500/20 relative h-full flex flex-col">
      <!-- Enhanced background for sidebar -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/8 to-white/4 rounded-r-3xl"></div>
      <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent rounded-r-3xl"></div>
      
      <!-- Animated border gradient -->
      <div class="absolute inset-0 rounded-r-3xl bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-50"></div>
      <div class="absolute inset-[1px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-r-3xl"></div>
      
      
      <!-- Sidebar header -->
      <div class="relative z-10 flex items-center justify-between h-16 px-6 border-b border-white/20">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
            <!-- Logo background animation -->
            <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            <span class="text-white font-bold text-lg relative z-10">F</span>
          </div>
          <div class="ml-3">
            <h1 class="text-xl font-bold text-white">FinanceHub</h1>
            <p class="text-xs text-white/60">Personal Finance</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="relative z-10 mt-6 px-3 flex-1">
        <div class="space-y-2">
          <router-link
            v-for="(item, index) in navigation"
            :key="item.name"
            :to="item.href"
            class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden"
            :class="[
              $route.path === item.href
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-sm shadow-lg shadow-blue-500/20'
                : 'text-white/80 hover:bg-white-10 hover:text-white hover:border hover:border-white-20',
              `animate-delay-${Math.min(index * 100, 1000)}`
            ]"
          >
            <!-- Active state background -->
            <div v-if="$route.path === item.href" class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl"></div>
            
            <!-- Hover shimmer effect -->
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div class="animate-shimmer absolute inset-0 rounded-xl"></div>
            </div>
            
            <!-- Icon container -->
            <div class="relative z-10 flex items-center">
              <div :class="[
                'p-2 rounded-lg transition-all duration-300 mr-3',
                $route.path === item.href
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'bg-white-5 text-white/60 group-hover:bg-white-10 group-hover:text-white'
              ]">
                <component 
                  :is="item.icon" 
                  class="h-5 w-5 flex-shrink-0"
                />
              </div>
              <span class="relative z-10">{{ item.name }}</span>
            </div>
            
            <!-- Active indicator -->
            <div v-if="$route.path === item.href" class="absolute right-3 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          </router-link>
        </div>
      </nav>

      <!-- User section -->
      <div class="relative z-10 p-4 border-t border-white/20 mt-auto">
        <div class="flex items-center p-3 rounded-xl bg-white-5 hover:bg-white-10 transition-all duration-300 group cursor-pointer">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
            <!-- Avatar background animation -->
            <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span class="text-white font-medium text-sm relative z-10">{{ userInitial }}</span>
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium text-white group-hover:text-blue-200 transition-colors duration-300">{{ userName }}</p>
            <p class="text-xs text-white/60 group-hover:text-white/80 transition-colors duration-300">{{ userEmail }}</p>
          </div>
          <!-- Status indicator -->
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile sidebar -->
  <div 
    v-if="isOpen"
    class="fixed inset-y-0 left-0 z-50 w-64 backdrop-blur-xl bg-white-10 border-r border-white-20 shadow-2xl shadow-blue-500/20 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col relative overflow-hidden"
  >
    <!-- Enhanced background for mobile sidebar -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/8 to-white/4"></div>
    <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent"></div>
    
    <!-- Animated border gradient -->
    <div class="absolute inset-0 bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-50"></div>
    <div class="absolute inset-[1px] bg-gradient-to-br from-gray-900/95 to-gray-800/95"></div>
    
    <!-- Sidebar header -->
    <div class="relative z-10 flex items-center justify-between h-16 px-6 border-b border-white/20">
      <div class="flex items-center">
        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
          <!-- Shimmer effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          <span class="text-white font-bold text-lg relative z-10">F</span>
        </div>
        <h1 class="ml-3 text-xl font-bold text-white">FinanceHub</h1>
      </div>
      
      <!-- Close button for mobile -->
      <button 
        @click="closeSidebar"
        class="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white-10 transition-all duration-300"
      >
        <XMarkIcon class="h-6 w-6" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="relative z-10 mt-6 px-3 flex-1">
      <div class="space-y-1">
        <router-link
          v-for="(item, index) in navigation"
          :key="item.name"
          :to="item.href"
          class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden"
          :class="[
            $route.path === item.href
              ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-sm shadow-lg shadow-blue-500/20'
              : 'text-white/80 hover:bg-white-10 hover:text-white hover:border hover:border-white-20',
            `animate-delay-${Math.min(index * 100, 1000)}`
          ]"
        >
          <!-- Active state background -->
          <div v-if="$route.path === item.href" class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl"></div>
          
          <!-- Hover shimmer effect -->
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div class="animate-shimmer absolute inset-0 rounded-xl"></div>
          </div>
          
          <!-- Icon container -->
          <div class="relative z-10 flex items-center">
            <div :class="[
              'p-2 rounded-lg transition-all duration-300 mr-3',
              $route.path === item.href
                ? 'bg-blue-500/20 text-blue-300'
                : 'bg-white-5 text-white/60 group-hover:bg-white-10 group-hover:text-white'
            ]">
              <component 
                :is="item.icon" 
                class="h-5 w-5 flex-shrink-0"
              />
            </div>
            <span class="relative z-10">{{ item.name }}</span>
          </div>
          
          <!-- Active indicator -->
          <div v-if="$route.path === item.href" class="absolute right-3 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        </router-link>
      </div>
    </nav>

    <!-- User section -->
    <div class="relative z-10 p-4 border-t border-white/20 mt-auto">
      <div class="flex items-center">
        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
          <!-- Shimmer effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          <span class="text-white font-bold text-lg relative z-10">{{ userInitial }}</span>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-white">{{ userName }}</p>
          <p class="text-xs text-white/60">{{ userEmail }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Sidebar-specific styles only - animations and shadows are now global */
</style>
