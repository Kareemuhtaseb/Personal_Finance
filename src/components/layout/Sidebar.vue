<script setup lang="ts">
import { ref } from 'vue'
import { 
  HomeIcon, 
  CreditCardIcon, 
  BanknotesIcon, 
  BriefcaseIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Transactions', href: '/transactions', icon: CreditCardIcon },
  { name: 'Salary', href: '/salary', icon: BanknotesIcon },
  { name: 'Savings', href: '/savings', icon: BanknotesIcon },
  { name: 'Freelance', href: '/freelance', icon: BriefcaseIcon },
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
  <div class="hidden lg:flex lg:flex-shrink-0">
    <div class="w-64 backdrop-blur-xl bg-white/10 border-r border-white/20 shadow-2xl shadow-blue-500/20 relative">
      <!-- Enhanced background for sidebar -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-r-3xl"></div>
      
      <!-- Sidebar header -->
      <div class="relative z-10 flex items-center justify-between h-16 px-6 border-b border-white/20">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
            <span class="text-white font-bold text-lg">F</span>
          </div>
          <h1 class="ml-3 text-xl font-bold text-white">FinanceHub</h1>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="relative z-10 mt-6 px-3">
        <div class="space-y-1">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300"
            :class="[
              $route.path === item.href
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-sm shadow-lg shadow-blue-500/20'
                : 'text-white/80 hover:bg-white/10 hover:text-white hover:border hover:border-white/20'
            ]"
          >
            <component 
              :is="item.icon" 
              class="mr-3 h-5 w-5 flex-shrink-0"
              :class="[
                $route.path === item.href
                  ? 'text-blue-300'
                  : 'text-white/60 group-hover:text-white'
              ]"
            />
            {{ item.name }}
          </router-link>
        </div>
      </nav>

      <!-- User section -->
      <div class="relative z-10 absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <span class="text-white font-medium text-sm">U</span>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-white">Admin User</p>
            <p class="text-xs text-white/60">admin@financehub.com</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile sidebar -->
  <div 
    v-if="isOpen"
    class="fixed inset-y-0 left-0 z-50 w-64 backdrop-blur-xl bg-white/10 border-r border-white/20 shadow-2xl shadow-blue-500/20 transform transition-transform duration-300 ease-in-out lg:hidden"
  >
    <!-- Sidebar header -->
    <div class="flex items-center justify-between h-16 px-6 border-b border-white/20">
      <div class="flex items-center">
        <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
          <span class="text-white font-bold text-lg">F</span>
        </div>
        <h1 class="ml-3 text-xl font-bold text-white">FinanceHub</h1>
      </div>
      
      <!-- Close button for mobile -->
      <button 
        @click="closeSidebar"
        class="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300"
      >
        <XMarkIcon class="h-6 w-6" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="mt-6 px-3">
      <div class="space-y-1">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          class="group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300"
          :class="[
            $route.path === item.href
              ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-sm'
              : 'text-white/80 hover:bg-white/10 hover:text-white hover:border hover:border-white/20'
          ]"
        >
          <component 
            :is="item.icon" 
            class="mr-3 h-5 w-5 flex-shrink-0"
            :class="[
              $route.path === item.href
                ? 'text-blue-300'
                : 'text-white/60 group-hover:text-white'
              ]"
          />
          {{ item.name }}
        </router-link>
      </div>
    </nav>

    <!-- User section -->
    <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
      <div class="flex items-center">
        <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
          <span class="text-white font-medium text-sm">U</span>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-white">Admin User</p>
          <p class="text-xs text-white/60">admin@financehub.com</p>
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
</style>
