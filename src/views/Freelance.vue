<script setup lang="ts">
import { ref } from 'vue'

const projects = ref([
  { id: 1, name: 'Website Redesign', client: 'Tech Corp', status: 'active', hours: 25, rate: 75, total: 1875 },
  { id: 2, name: 'Mobile App', client: 'Startup Inc', status: 'active', hours: 40, rate: 80, total: 3200 },
  { id: 3, name: 'Logo Design', client: 'Design Studio', status: 'completed', hours: 8, rate: 60, total: 480 }
])

const invoices = ref([
  { id: 1, project: 'Website Redesign', client: 'Tech Corp', amount: 1875, status: 'paid', dueDate: '2024-01-20' },
  { id: 2, project: 'Mobile App', client: 'Startup Inc', amount: 3200, status: 'pending', dueDate: '2024-02-15' }
])
</script>

<template>
  <!-- Freelance content without duplicate background -->
  <div class="space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-4xl font-bold text-white tracking-wide">Freelance Management</h1>
        <p class="mt-2 text-lg text-white/70">
          Track projects, time, and manage invoices
        </p>
      </div>
      
      <div class="mt-4 sm:mt-0 space-x-3">
        <button class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
          + New Project
        </button>
        <button class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
          + Create Invoice
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Active Projects with glassmorphism -->
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-green-500/20 p-8 hover:shadow-green-500/30 transition-all duration-500 hover:scale-[1.02] group">
        <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>
        <div class="relative z-10">
          <h3 class="text-2xl font-bold text-white mb-6 tracking-wide group-hover:text-green-200 transition-colors duration-300">Active Projects</h3>
          
          <div class="space-y-4">
            <div
              v-for="project in projects.filter(p => p.status === 'active')"
              :key="project.id"
              class="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] group/item"
            >
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-lg font-semibold text-white group-hover/item:text-green-200 transition-colors duration-300">{{ project.name }}</h4>
                <span class="text-base text-blue-400 group-hover/item:text-blue-300 transition-colors duration-300">{{ project.client }}</span>
              </div>
              
              <div class="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span class="text-white/70 group-hover/item:text-white/90 transition-colors duration-300">Hours:</span>
                  <span class="ml-1 font-semibold text-white group-hover/item:text-green-300 transition-colors duration-300">{{ project.hours }}h</span>
                </div>
                <div>
                  <span class="text-white/70 group-hover/item:text-white/90 transition-colors duration-300">Rate:</span>
                  <span class="ml-1 font-semibold text-white group-hover/item:text-blue-300 transition-colors duration-300">${{ project.rate }}/h</span>
                </div>
                <div>
                  <span class="text-white/70 group-hover/item:text-white/90 transition-colors duration-300">Total:</span>
                  <span class="ml-1 font-semibold text-green-400 group-hover/item:text-green-300 transition-colors duration-300">${{ project.total.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Invoices with glassmorphism -->
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-blue-500/20 p-8 hover:shadow-blue-500/30 transition-all duration-500 hover:scale-[1.02] group">
        <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>
        <div class="relative z-10">
          <h3 class="text-2xl font-bold text-white mb-6 tracking-wide group-hover:text-blue-200 transition-colors duration-300">Recent Invoices</h3>
          
          <div class="space-y-4">
            <div
              v-for="invoice in invoices"
              :key="invoice.id"
              class="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] group/item"
            >
              <div>
                <p class="text-lg font-semibold text-white group-hover/item:text-blue-200 transition-colors duration-300">{{ invoice.project }}</p>
                <p class="text-base text-white/70 group-hover/item:text-white/90 transition-colors duration-300">{{ invoice.client }}</p>
              </div>
              
              <div class="text-right">
                <p class="text-xl font-bold text-white group-hover/item:text-blue-300 transition-colors duration-300">${{ invoice.amount.toLocaleString() }}</p>
                <p class="text-sm text-white/60 group-hover/item:text-white/80 transition-colors duration-300">Due: {{ invoice.dueDate }}</p>
              </div>
            </div>
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

/* Button hover effects */
button:hover {
  transform: translateY(-1px);
}
</style>
