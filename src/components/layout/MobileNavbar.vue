<script setup lang="ts">
import { 
  HomeIcon, 
  CreditCardIcon, 
  BanknotesIcon, 
  BriefcaseIcon,
  PlusIcon,
  TagIcon
} from '@heroicons/vue/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Expenses', href: '/expenses', icon: CreditCardIcon },
  { name: 'Income', href: '/income', icon: BanknotesIcon },
  { name: 'Categories', href: '/categories', icon: TagIcon },
  { name: 'Savings', href: '/savings', icon: BanknotesIcon },
  { name: 'Freelance', href: '/freelance', icon: BriefcaseIcon }
]
</script>

<template>
  <!-- Enhanced Mobile bottom navigation -->
  <div class="lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 border-t border-white/20 shadow-2xl shadow-blue-500/20 relative">
    <!-- Enhanced background for mobile navbar -->
    <div class="absolute inset-0 bg-gradient-to-t from-white/15 to-white/8"></div>
    <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent"></div>
    
    <!-- Animated border gradient -->
    <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50"></div>
    <div class="absolute inset-[1px] bg-gradient-to-t from-gray-900/95 to-gray-800/95"></div>
    
    <!-- Floating particles -->
    <div class="absolute top-2 left-1/4 w-1 h-1 bg-blue-400/40 rounded-full animate-pulse-glow"></div>
    <div class="absolute top-2 right-1/4 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-pulse-glow" style="animation-delay: 1s;"></div>
    
    <div class="relative z-10 flex items-center justify-around px-2 py-3">
      <router-link
        v-for="(item, index) in navigation"
        :key="item.name"
        :to="item.href"
        class="flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 relative overflow-hidden group"
        :class="[
          $route.path === item.href
            ? 'text-blue-300 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 backdrop-blur-sm shadow-lg shadow-blue-500/20'
            : 'text-white/80 hover:text-white hover:bg-white/10'
        ]"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <!-- Active state background -->
        <div v-if="$route.path === item.href" class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl"></div>
        
        <!-- Hover shimmer effect -->
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div class="animate-shimmer absolute inset-0 rounded-xl"></div>
        </div>
        
        <!-- Icon container -->
        <div class="relative z-10 flex flex-col items-center">
          <div :class="[
            'p-2 rounded-lg transition-all duration-300 mb-1',
            $route.path === item.href
              ? 'bg-blue-500/20 text-blue-300'
              : 'bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white'
          ]">
            <component :is="item.icon" class="h-5 w-5" />
          </div>
          <span class="text-xs font-medium relative z-10">{{ item.name }}</span>
        </div>
        
        <!-- Active indicator -->
        <div v-if="$route.path === item.href" class="absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
      </router-link>
    </div>
    
    <!-- Enhanced Floating action button -->
    <div class="absolute -top-6 left-1/2 transform -translate-x-1/2">
      <router-link
        to="/expenses/new"
        class="w-14 h-14 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 relative overflow-hidden group"
      >
        <!-- Button background animation -->
        <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
        
        <!-- Ripple effect -->
        <div class="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150 rounded-full"></div>
        
        <PlusIcon class="h-7 w-7 text-white relative z-10 group-hover:rotate-90 transition-transform duration-300" />
        
        <!-- Glow effect -->
        <div class="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-50 blur-md group-hover:opacity-75 transition-opacity duration-300"></div>
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

/* Animation keyframes */
@keyframes pulse-glow {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }
  50% { 
    box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Animation classes */
.animate-pulse-glow {
  animation: pulse-glow 4s ease-in-out infinite;
}

.animate-shimmer {
  position: relative;
  overflow: hidden;
}

.animate-shimmer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmer 2s infinite;
}

/* Smooth transitions */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
