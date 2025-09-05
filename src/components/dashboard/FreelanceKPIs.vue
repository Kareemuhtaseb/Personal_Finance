<script setup lang="ts">
import { BriefcaseIcon, ClockIcon, DocumentTextIcon, BanknotesIcon } from '@heroicons/vue/24/outline'

interface FreelanceData {
  activeProjects: number
  hoursLogged: number
  unpaidInvoices: number
  totalUnpaid: number
}

interface Props {
  data: FreelanceData
}

defineProps<Props>()

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

const kpis = [
  {
    name: 'Active Projects',
    key: 'activeProjects',
    icon: BriefcaseIcon,
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    textColor: 'text-blue-400'
  },
  {
    name: 'Hours Logged',
    key: 'hoursLogged',
    icon: ClockIcon,
    color: 'bg-gradient-to-br from-green-500 to-green-600',
    textColor: 'text-green-400'
  },
  {
    name: 'Unpaid Invoices',
    key: 'unpaidInvoices',
    icon: DocumentTextIcon,
    color: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    textColor: 'text-yellow-400'
  },
  {
    name: 'Total Unpaid',
    key: 'totalUnpaid',
    icon: BanknotesIcon,
    color: 'bg-gradient-to-br from-red-500 to-red-600',
    textColor: 'text-red-400'
  }
]
</script>

<template>
  <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02] group p-6 relative overflow-hidden">
    <!-- Background gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>
    
    <div class="relative z-10">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-white tracking-wide group-hover:text-purple-200 transition-colors duration-300">
          Freelance KPIs
        </h3>
        <router-link 
          to="/freelance"
          class="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-300 font-medium"
        >
          View All
        </router-link>
      </div>
      
      <div class="space-y-5">
        <div
          v-for="kpi in kpis"
          :key="kpi.name"
          class="flex items-center space-x-4 p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] group/item"
        >
          <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg', kpi.color]">
            <component :is="kpi.icon" class="h-6 w-6 text-white drop-shadow-lg" />
          </div>
          
          <div class="flex-1">
            <p class="text-sm font-medium text-white/80 group-hover/item:text-white transition-colors duration-300">
              {{ kpi.name }}
            </p>
            
            <p :class="['text-xl font-bold', kpi.textColor]">
              <span v-if="kpi.name === 'Total Unpaid'">{{ formatCurrency(data.totalUnpaid) }}</span>
              <span v-else>{{ data[kpi.key] }}</span>
            </p>
          </div>
        </div>
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
    0 0 40px rgba(147, 51, 234, 0.1);
}

.hover\:shadow-purple-500\/20:hover {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(147, 51, 234, 0.2);
}
</style>
