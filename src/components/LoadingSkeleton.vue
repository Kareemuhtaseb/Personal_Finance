<script setup lang="ts">
interface Props {
  type?: 'card' | 'text' | 'circle' | 'rect' | 'dashboard'
  width?: string
  height?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'rect',
  width: '100%',
  height: '20px',
  className: ''
})
</script>

<template>
  <div 
    :class="[
      'loading-shimmer rounded-lg',
      props.className
    ]"
    :style="{ width: props.width, height: props.height }"
  >
    <!-- Skeleton content based on type -->
    <div v-if="type === 'card'" class="p-6 space-y-4">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 bg-white/20 rounded-lg"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-white/20 rounded w-3/4"></div>
          <div class="h-3 bg-white/20 rounded w-1/2"></div>
        </div>
      </div>
      <div class="space-y-2">
        <div class="h-3 bg-white/20 rounded w-full"></div>
        <div class="h-3 bg-white/20 rounded w-5/6"></div>
        <div class="h-3 bg-white/20 rounded w-4/6"></div>
      </div>
    </div>
    
    <div v-else-if="type === 'dashboard'" class="space-y-6">
      <!-- Header skeleton -->
      <div class="space-y-3">
        <div class="h-8 bg-white/20 rounded w-1/3"></div>
        <div class="h-4 bg-white/20 rounded w-1/2"></div>
      </div>
      
      <!-- KPI cards skeleton -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="i in 4" :key="i" class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <div class="h-4 bg-white/20 rounded w-20"></div>
              <div class="h-8 bg-white/20 rounded w-24"></div>
            </div>
            <div class="w-12 h-12 bg-white/20 rounded-lg"></div>
          </div>
          <div class="flex items-center space-x-2">
            <div class="h-4 bg-white/20 rounded w-16"></div>
            <div class="h-3 bg-white/20 rounded w-20"></div>
          </div>
        </div>
      </div>
      
      <!-- Charts skeleton -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div v-for="i in 2" :key="i" class="p-6 space-y-4">
          <div class="h-6 bg-white/20 rounded w-1/3"></div>
          <div class="h-64 bg-white/20 rounded-lg"></div>
        </div>
      </div>
    </div>
    
    <div v-else-if="type === 'text'" class="space-y-2">
      <div class="h-4 bg-white/20 rounded w-full"></div>
      <div class="h-4 bg-white/20 rounded w-5/6"></div>
      <div class="h-4 bg-white/20 rounded w-4/6"></div>
    </div>
    
    <div v-else-if="type === 'circle'" class="w-full h-full bg-white/20 rounded-full"></div>
    
    <!-- Default rect skeleton -->
    <div v-else class="w-full h-full bg-white/20 rounded"></div>
  </div>
</template>

<style scoped>
.loading-shimmer {
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.1) 25%, 
    rgba(255, 255, 255, 0.2) 50%, 
    rgba(255, 255, 255, 0.1) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
