<script setup lang="ts">
import { PlusIcon, DocumentTextIcon, CreditCardIcon, BanknotesIcon } from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'

const router = useRouter()

const actions = [
  { name: 'Add Expense', icon: PlusIcon, color: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700', href: '/expenses' },
  { name: 'Income Sources', icon: BanknotesIcon, color: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700', href: '/income' },
  { name: 'View Reports', icon: DocumentTextIcon, color: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700', href: '/reports' }
]

const handleNavigation = (href: string) => {
  router.push(href)
}
</script>

<template>
  <div class="glass-card rounded-xl p-6 relative overflow-hidden group animate-slide-in-up">
    <div class="relative z-10">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-premium-medium group-hover:text-green-200 transition-colors duration-300">
          Quick Actions
        </h3>
      </div>
      
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="(action, index) in actions"
          :key="action.name"
          @click="handleNavigation(action.href)"
          :class="[
            'p-4 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 focus-ring group/action relative overflow-hidden',
            action.color,
            `animate-delay-${Math.min(index * 100, 1000)}`
          ]"
        >
          <!-- Button background glow -->
          <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/action:opacity-100 transition-opacity duration-300"></div>
          
          <div class="relative z-10 flex flex-col items-center space-y-2">
            <component :is="action.icon" class="icon-premium group-hover/action:scale-110 transition-transform duration-300" />
            <span class="text-sm font-semibold group-hover/action:text-white/90 transition-colors duration-300">
              {{ action.name }}
            </span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* QuickActions-specific styles only - animations and shadows are now global */
</style>
