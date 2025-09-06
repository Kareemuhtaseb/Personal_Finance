<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

interface Goal {
  name: string
  target: number
  current: number
  color: string
}

interface Props {
  goals: Goal[]
}

defineProps<Props>()

const calculateProgress = (current: number, target: number) => {
  return Math.min((current / target) * 100, 100)
}

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}
</script>

<template>
  <div class="glass-card rounded-xl p-6 relative overflow-hidden group animate-slide-in-right">
    <div class="relative z-10">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-premium-medium group-hover:text-blue-200 transition-colors duration-300">
          Savings Goals
        </h3>
        <router-link 
          to="/savings"
          class="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-300 font-medium hover:underline focus-ring rounded-lg px-2 py-1"
        >
          View All
        </router-link>
      </div>
      
      <div class="space-y-6">
        <div
          v-for="(goal, index) in goals"
          :key="goal.name"
          class="space-y-3 group/item p-4 glass rounded-lg hover:glass-hover transition-all duration-300 interactive"
          :style="{ animationDelay: `${index * 0.15}s` }"
        >
          <div class="flex items-center justify-between">
            <span class="text-base font-semibold text-premium group-hover/item:text-blue-200 transition-colors duration-300">
              {{ goal.name }}
            </span>
            <span class="text-sm text-premium-muted group-hover/item:text-white/90 transition-colors duration-300">
              {{ formatCurrency(goal.current) }} / {{ formatCurrency(goal.target) }}
            </span>
          </div>
          
          <div class="w-full bg-white/10 backdrop-blur-sm rounded-full h-4 border border-white/20 overflow-hidden">
            <div
              :class="['h-4 rounded-full transition-all duration-700 shadow-lg relative', goal.color]"
              :style="{ width: `${calculateProgress(goal.current, goal.target)}%` }"
            >
              <!-- Progress bar shimmer effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="text-xs text-premium-subtle group-hover/item:text-white/80 transition-colors duration-300">
              {{ calculateProgress(goal.current, goal.target).toFixed(1) }}% complete
            </div>
            <div class="text-xs text-premium-subtle group-hover/item:text-white/70 transition-colors duration-300">
              {{ formatCurrency(goal.target - goal.current) }} remaining
            </div>
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
    0 0 40px rgba(59, 130, 246, 0.1);
}

.hover\:shadow-blue-500\/20:hover {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(59, 130, 246, 0.2);
}
</style>
