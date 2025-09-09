<script setup lang="ts">
interface Props {
  title: string
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div :class="['backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02] group relative overflow-hidden', props.class]">
    <!-- Enhanced background gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/8 to-white/4 rounded-3xl"></div>
    <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent rounded-3xl"></div>
    
    <!-- Animated border gradient -->
    <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div class="absolute inset-[1px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-3xl"></div>
    
    <!-- Shimmer effect on hover -->
    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <div class="animate-shimmer absolute inset-0 rounded-3xl"></div>
    </div>
    
    
    <div class="relative z-10">
      <div class="p-6 border-b border-white/20 relative">
        <!-- Header background glow -->
        <div class="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-3xl"></div>
        
        <div class="relative z-10 flex items-center justify-between">
          <h3 class="text-xl font-bold text-white tracking-wide group-hover:text-purple-200 transition-colors duration-300">
            {{ title }}
          </h3>
          
        </div>
      </div>
      
      <div class="p-6 relative">
        <!-- Content background -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/2 to-transparent rounded-b-3xl"></div>
        <div class="relative z-10">
          <slot />
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
