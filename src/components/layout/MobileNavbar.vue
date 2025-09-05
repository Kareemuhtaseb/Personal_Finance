<script setup lang="ts">
import { 
  HomeIcon, 
  CreditCardIcon, 
  BanknotesIcon, 
  BriefcaseIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Transactions', href: '/transactions', icon: CreditCardIcon },
  { name: 'Salary', href: '/salary', icon: BanknotesIcon },
  { name: 'Savings', href: '/savings', icon: BanknotesIcon },
  { name: 'Freelance', href: '/freelance', icon: BriefcaseIcon }
]
</script>

<template>
  <!-- Mobile bottom navigation -->
  <div class="lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 border-t border-white/20 shadow-2xl shadow-blue-500/20 relative">
    <!-- Enhanced background for mobile navbar -->
    <div class="absolute inset-0 bg-gradient-to-t from-white/10 to-white/5"></div>
    
    <div class="relative z-10 flex items-center justify-around px-2 py-2">
      <router-link
        v-for="item in navigation"
        :key="item.name"
        :to="item.href"
        class="flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300"
        :class="[
          $route.path === item.href
            ? 'text-blue-300 bg-blue-500/20 border border-blue-400/30 backdrop-blur-sm shadow-lg shadow-blue-500/20'
            : 'text-white/80 hover:text-white hover:bg-white/10'
        ]"
      >
        <component :is="item.icon" class="h-6 w-6 mb-1" />
        <span class="text-xs font-medium">{{ item.name }}</span>
      </router-link>
    </div>
    
    <!-- Floating action button -->
    <div class="absolute -top-6 left-1/2 transform -translate-x-1/2">
      <router-link
        to="/transactions/new"
        class="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110"
      >
        <PlusIcon class="h-6 w-6 text-white" />
      </router-link>
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
