<template>
  <div v-if="hasError" class="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
    <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
      <div class="text-red-400 mb-4">
        <svg class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-white mb-4">Connection Error</h2>
      <p class="text-white/70 mb-6">
        Unable to connect to the backend server. Please make sure the backend is running on port 3001.
      </p>
      <div class="space-y-3">
        <button 
          @click="retry"
          class="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Retry Connection
        </button>
        <button 
          @click="goHome"
          class="w-full px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const hasError = ref(false)

const retry = () => {
  hasError.value = false
  window.location.reload()
}

const goHome = () => {
  hasError.value = false
  router.push('/')
}

// Expose error handling function
const showError = () => {
  hasError.value = true
}

defineExpose({
  showError
})
</script>
