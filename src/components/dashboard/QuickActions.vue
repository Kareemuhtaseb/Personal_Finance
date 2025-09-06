<script setup lang="ts">
import { PlusIcon, DocumentTextIcon, CreditCardIcon, BanknotesIcon } from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'

const router = useRouter()

const actions = [
  { name: 'Add Expense', icon: PlusIcon, color: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700', href: '/expenses' },
  { name: 'Income Sources', icon: BanknotesIcon, color: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700', href: '/income' },
  { name: 'Savings Goals', icon: CreditCardIcon, color: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700', href: '/savings' },
  { name: 'View Reports', icon: DocumentTextIcon, color: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700', href: '/reports' }
]

const handleNavigation = (href: string) => {
  console.log('Button clicked! Navigating to:', href)
  alert(`Button clicked! Would navigate to: ${href}`)
  router.push(href)
}

const testClick = () => {
  console.log('SIMPLE TEST CLICKED!')
  alert('SIMPLE TEST CLICKED!')
}
</script>

<template>
  <div class="p-4 bg-red-500 text-white">
    <h3 class="text-xl font-bold mb-4">Quick Actions Test</h3>
    
    <button 
      @click="handleNavigation('/expenses')"
      class="block w-full p-4 bg-green-500 hover:bg-green-600 text-white rounded mb-2"
    >
      TEST BUTTON - Click Me!
    </button>
    
    <button 
      @click="testClick"
      class="block w-full p-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
    >
      SIMPLE TEST
    </button>
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
