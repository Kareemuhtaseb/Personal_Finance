<script setup lang="ts">
import { ref } from 'vue'

const goals = ref([
  { name: 'Emergency Fund', target: 10000, current: 7500, color: 'bg-gradient-to-r from-green-400 to-green-600' },
  { name: 'Vacation', target: 5000, current: 3200, color: 'bg-gradient-to-r from-blue-400 to-blue-600' },
  { name: 'New Car', target: 25000, current: 15000, color: 'bg-gradient-to-r from-purple-400 to-purple-600' }
])

const showAddGoal = ref(false)
</script>

<template>
  <!-- Savings content without duplicate background -->
  <div class="space-premium">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-premium-large">Savings Goals</h1>
        <p class="mt-2 text-lg text-white/70">
          Track your savings progress and financial goals
        </p>
      </div>
      
      <div class="mt-4 sm:mt-0">
        <button
          @click="showAddGoal = true"
          class="btn-success inline-flex items-center"
        >
          + Add Goal
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Goals Overview with glassmorphism -->
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-green-500/20 p-8 relative overflow-hidden">
        <!-- Enhanced background effects -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/8 to-white/4 rounded-3xl"></div>
        <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent rounded-3xl"></div>
        
        <!-- Animated border gradient -->
        <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 opacity-50"></div>
        <div class="absolute inset-[1px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-3xl"></div>
        
        <div class="relative z-10">
          <h3 class="text-2xl font-bold text-white mb-6 tracking-wide group-hover:text-green-200 transition-colors duration-300">Your Goals</h3>
          
          <div class="space-y-6">
            <div
              v-for="goal in goals"
              :key="goal.name"
              class="p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 relative overflow-hidden group animate-fade-in-scale cursor-pointer"
            >
              <!-- Goal card background effects -->
              <div class="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent rounded-2xl"></div>
              
              <!-- Hover shimmer effect -->
              <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div class="animate-shimmer absolute inset-0 rounded-2xl"></div>
              </div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-lg font-semibold text-white group-hover/item:text-green-200 transition-colors duration-300">{{ goal.name }}</span>
                <span class="text-base text-white/70 group-hover/item:text-white/90 transition-colors duration-300">
                  ${{ goal.current.toLocaleString() }} / ${{ goal.target.toLocaleString() }}
                </span>
              </div>
              
              <div class="w-full bg-white/10 backdrop-blur-sm rounded-full h-3 mb-3 border border-white/20">
                <div
                  :class="['h-3 rounded-full transition-all duration-500 shadow-lg', goal.color]"
                  :style="{ width: `${(goal.current / goal.target) * 100}%` }"
                ></div>
              </div>
              
              <div class="flex justify-between text-sm text-white/60 group-hover/item:text-white/80 transition-colors duration-300">
                <span>{{ ((goal.current / goal.target) * 100).toFixed(0) }}% complete</span>
                <span>${{ (goal.target - goal.current).toLocaleString() }} to go</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Savings Growth Chart with glassmorphism -->
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-blue-500/20 p-8 relative overflow-hidden">
        <!-- Enhanced background effects -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/8 to-white/4 rounded-3xl"></div>
        <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent rounded-3xl"></div>
        
        <!-- Animated border gradient -->
        <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-50"></div>
        <div class="absolute inset-[1px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-3xl"></div>
        
        <div class="relative z-10">
          <h3 class="text-2xl font-bold text-white mb-6 tracking-wide group-hover:text-blue-200 transition-colors duration-300">Savings Growth</h3>
          <div class="h-64 flex items-center justify-center text-white/70 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 group-hover:bg-white/10 transition-all duration-500">
            <div class="text-center">
              <p class="text-xl font-medium">Savings growth chart will be implemented here</p>
              <p class="text-sm text-white/50 mt-2">Visual progress tracking</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Transfer with glassmorphism -->
    <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-purple-500/20 p-8 relative overflow-hidden">
      <!-- Enhanced background effects -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/8 to-white/4 rounded-3xl"></div>
      <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent rounded-3xl"></div>
      
      <!-- Animated border gradient -->
      <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 opacity-50"></div>
      <div class="absolute inset-[1px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-3xl"></div>
      
      <div class="relative z-10">
        <h3 class="text-2xl font-bold text-white mb-6 tracking-wide group-hover:text-purple-200 transition-colors duration-300">Quick Transfer</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-white/90 mb-2">From Account</label>
            <select class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300">
              <option>Checking Account</option>
              <option>Savings Account</option>
              <option>Credit Card</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-white/90 mb-2">To Goal</label>
            <select class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300">
              <option>Emergency Fund</option>
              <option>Vacation</option>
              <option>New Car</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-white/90 mb-2">Amount</label>
            <input
              type="number"
              placeholder="$0.00"
              class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300"
            />
          </div>
        </div>
        
        <div class="mt-6">
          <button class="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
            Transfer Funds
          </button>
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

.shadow-green-500\/20 {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(34, 197, 94, 0.1);
}

.shadow-blue-500\/20 {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(59, 130, 246, 0.1);
}

.shadow-purple-500\/20 {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(147, 51, 234, 0.1);
}

/* Smooth transitions */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Button hover effects */
button:hover {
  transform: translateY(-1px);
}

/* Select focus effects */
select:focus {
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}
</style>
