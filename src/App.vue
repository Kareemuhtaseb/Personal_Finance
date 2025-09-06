<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/layout/Sidebar.vue'
import TopNavbar from './components/layout/TopNavbar.vue'
import MobileNavbar from './components/layout/MobileNavbar.vue'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const pageTitle = computed(() => {
  return route.meta.title || 'Dashboard'
})

// Initialize auth store when app mounts
onMounted(() => {
  authStore.initializeAuth()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
    <!-- Sleek dark animated background elements -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- Minimal floating orbs -->
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-slate-600/8 to-gray-500/8 rounded-full blur-3xl animate-float"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-gray-500/8 to-slate-600/8 rounded-full blur-3xl animate-float" style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-slate-500/5 to-gray-500/5 rounded-full blur-3xl animate-breathe"></div>
      
      <!-- Subtle accent orbs -->
      <div class="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-slate-400/10 to-gray-400/10 rounded-full blur-2xl animate-pulse-glow"></div>
      <div class="absolute bottom-1/4 left-1/4 w-40 h-40 bg-gradient-to-tr from-gray-400/8 to-slate-400/8 rounded-full blur-2xl animate-pulse-glow" style="animation-delay: 1s;"></div>
      
      <!-- Subtle grid pattern overlay -->
      <div class="absolute inset-0 opacity-[0.01]" style="background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0); background-size: 24px 24px;"></div>
    </div>
    
    <!-- Main layout container -->
    <div class="relative z-10">
      <!-- Sidebar for desktop -->
      <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />
      
      <!-- Main content area -->
      <div class="lg:ml-64 min-w-0">
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
