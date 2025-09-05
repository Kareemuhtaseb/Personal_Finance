<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/layout/Sidebar.vue'
import TopNavbar from './components/layout/TopNavbar.vue'
import MobileNavbar from './components/layout/MobileNavbar.vue'

const route = useRoute()
const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const pageTitle = computed(() => {
  return route.meta.title || 'Dashboard'
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
    <!-- Subtle animated background elements for cohesion -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-500/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-500/5 to-orange-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
    </div>
    
    <!-- Main layout container -->
    <div class="flex relative z-10">
      <!-- Sidebar for desktop -->
      <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />
      
      <!-- Main content area -->
      <div class="flex-1 min-w-0">
        <!-- Top navbar -->
        <TopNavbar @toggle-sidebar="toggleSidebar" />
        
        <!-- Main content with enhanced spacing -->
        <main class="py-8">
          <div class="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
            <!-- Page content -->
            <router-view />
          </div>
        </main>
      </div>
    </div>
    
    <!-- Mobile navigation -->
    <MobileNavbar />
  </div>
</template>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Smooth transitions */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
