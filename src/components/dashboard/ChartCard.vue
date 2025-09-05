<script setup lang="ts">
interface Props {
  title: string
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div :class="['backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02] group relative overflow-hidden', props.class]">
    <!-- Background gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>
    
    <div class="relative z-10">
      <div class="p-6 border-b border-white/20">
        <h3 class="text-xl font-bold text-white tracking-wide group-hover:text-purple-200 transition-colors duration-300">
          {{ title }}
        </h3>
      </div>
      <div class="p-6">
        <slot />
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
