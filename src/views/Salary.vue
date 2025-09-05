<script setup lang="ts">
import { ref } from 'vue'

const salary = ref({
  gross: 75000,
  deductions: [
    { name: 'Federal Tax', amount: 15000 },
    { name: 'State Tax', amount: 5000 },
    { name: 'Social Security', amount: 4650 },
    { name: 'Medicare', amount: 1088 },
    { name: '401k', amount: 7500 }
  ],
  net: 42762
})

const calculateNet = () => {
  const totalDeductions = salary.value.deductions.reduce((sum, d) => sum + d.amount, 0)
  salary.value.net = salary.value.gross - totalDeductions
}
</script>

<template>
  <!-- Salary content without duplicate background -->
  <div class="space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-4xl font-bold text-white tracking-wide">Salary Management</h1>
        <p class="mt-2 text-lg text-white/70">
          Track your salary, deductions, and net income
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Salary Input Form with glassmorphism -->
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-green-500/20 p-8 hover:shadow-green-500/30 transition-all duration-500 hover:scale-[1.02] group">
        <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>
        <div class="relative z-10">
          <h3 class="text-2xl font-bold text-white mb-6 tracking-wide group-hover:text-green-200 transition-colors duration-300">Salary Details</h3>
          
          <div class="space-y-6">
            <div>
              <label class="block text-base font-semibold text-white/90 mb-2">
                Gross Annual Salary
              </label>
              <input
                v-model="salary.gross"
                type="number"
                class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300"
                @input="calculateNet"
                placeholder="Enter gross salary"
              />
            </div>
            
            <div>
              <label class="block text-base font-semibold text-white/90 mb-3">
                Deductions
              </label>
              <div class="space-y-3">
                <div
                  v-for="(deduction, index) in salary.deductions"
                  :key="index"
                  class="flex space-x-3"
                >
                  <input
                    v-model="deduction.name"
                    type="text"
                    placeholder="Deduction name"
                    class="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300"
                  />
                  <input
                    v-model="deduction.amount"
                    type="number"
                    placeholder="Amount"
                    class="w-28 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300"
                    @input="calculateNet"
                  />
                </div>
              </div>
            </div>
            
            <div class="pt-6 border-t border-white/20">
              <div class="flex justify-between items-center">
                <span class="text-xl font-semibold text-white group-hover:text-green-200 transition-colors duration-300">Net Annual Salary:</span>
                <span class="text-3xl font-bold text-green-400 group-hover:text-green-300 transition-colors duration-300">
                  ${{ salary.net.toLocaleString() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Salary Breakdown with glassmorphism -->
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-blue-500/20 p-8 hover:shadow-blue-500/30 transition-all duration-500 hover:scale-[1.02] group">
        <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>
        <div class="relative z-10">
          <h3 class="text-2xl font-bold text-white mb-6 tracking-wide group-hover:text-blue-200 transition-colors duration-300">Salary Breakdown</h3>
          
          <div class="space-y-4">
            <div class="flex justify-between items-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <span class="text-lg font-semibold text-white">Gross Salary</span>
              <span class="text-xl font-bold text-green-400">${{ salary.gross.toLocaleString() }}</span>
            </div>
            
            <div
              v-for="deduction in salary.deductions"
              :key="deduction.name"
              class="flex justify-between items-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <span class="text-base text-white/90">{{ deduction.name }}</span>
              <span class="text-lg font-semibold text-red-400">-${{ deduction.amount.toLocaleString() }}</span>
            </div>
            
            <div class="pt-4 border-t border-white/20">
              <div class="flex justify-between items-center">
                <span class="text-xl font-semibold text-white">Net Salary</span>
                <span class="text-2xl font-bold text-blue-400">${{ salary.net.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Breakdown with glassmorphism -->
    <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-purple-500/20 p-8 hover:shadow-purple-500/30 transition-all duration-500 hover:scale-[1.02] group">
      <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>
      <div class="relative z-10">
        <h3 class="text-2xl font-bold text-white mb-6 tracking-wide group-hover:text-purple-200 transition-colors duration-300">Monthly Breakdown</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <p class="text-sm text-white/70 mb-2">Monthly Gross</p>
            <p class="text-2xl font-bold text-green-400">${{ Math.round(salary.gross / 12).toLocaleString() }}</p>
          </div>
          
          <div class="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <p class="text-sm text-white/70 mb-2">Monthly Deductions</p>
            <p class="text-2xl font-bold text-red-400">${{ Math.round((salary.gross - salary.net) / 12).toLocaleString() }}</p>
          </div>
          
          <div class="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <p class="text-sm text-white/70 mb-2">Monthly Net</p>
            <p class="text-2xl font-bold text-blue-400">${{ Math.round(salary.net / 12).toLocaleString() }}</p>
          </div>
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

/* Input focus effects */
input:focus {
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}
</style>
