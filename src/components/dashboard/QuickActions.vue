<script setup lang="ts">
import { PlusIcon, DocumentTextIcon, CreditCardIcon, BanknotesIcon } from '@heroicons/vue/24/outline'

const actions = [
  { name: 'Add Transaction', icon: PlusIcon, color: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700', href: '/transactions/new' },
  { name: 'Create Invoice', icon: DocumentTextIcon, color: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700', href: '/freelance/invoices/new' },
  { name: 'Log Time', icon: CreditCardIcon, color: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700', href: '/freelance/time/new' },
  { name: 'Add Goal', icon: BanknotesIcon, color: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700', href: '/savings/goals/new' }
]
</script>

<template>
  <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 hover:scale-[1.02] group p-6 relative overflow-hidden">
    <!-- Background gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>
    
    <div class="relative z-10">
      <h3 class="text-xl font-bold text-white mb-6 tracking-wide group-hover:text-green-200 transition-colors duration-300">
        Quick Actions
      </h3>
      
      <div class="space-y-4">
        <router-link
          v-for="action in actions"
          :key="action.name"
          :to="action.href"
          :class="['flex items-center justify-center p-4 rounded-2xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl', action.color]"
        >
          <component :is="action.icon" class="h-6 w-6 mr-3 drop-shadow-lg" />
          <span class="text-sm tracking-wide">{{ action.name }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

/* Enhanced shadows */
.shadow-2xl {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(34, 197, 94, 0.1);
}

.hover\:shadow-green-500\/20:hover {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(34, 197, 94, 0.2);
}
</style>
