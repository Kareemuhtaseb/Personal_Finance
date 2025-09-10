<template>
  <div class="relative" ref="dropdownRef">
    <!-- Dropdown Button -->
    <button
      type="button"
      @click="toggleDropdown"
      :class="[
        'w-full px-4 py-3 backdrop-blur-sm border rounded-2xl text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-left flex items-center justify-between',
        isOpen ? 'bg-white/15 border-blue-400' : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      ]"
      :disabled="disabled"
    >
      <span :class="[selectedOption ? 'text-white' : 'text-white/50']">
        {{ selectedOption ? selectedOption.label : placeholder }}
      </span>
      <ChevronDownIcon 
        :class="[
          'w-5 h-5 transition-transform duration-200',
          isOpen ? 'rotate-180' : ''
        ]"
      />
    </button>

    <!-- Dropdown Options -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 w-full mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-blue-500/20 overflow-hidden"
      >
        <div class="py-2 max-h-60 overflow-y-auto">
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            @click="selectOption(option)"
            :class="[
              'w-full px-4 py-3 text-left text-white transition-all duration-200 hover:bg-white/10 focus:bg-white/10 focus:outline-none',
              selectedOption?.value === option.value ? 'bg-blue-500/20 text-blue-300' : 'text-white/90'
            ]"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

interface Option {
  value: string | number
  label: string
}

interface Props {
  modelValue?: string | number | null
  options: Option[]
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement>()

const selectedOption = computed(() => {
  return props.options.find(option => option.value === props.modelValue) || null
})

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const selectOption = (option: Option) => {
  emit('update:modelValue', option.value)
  isOpen.value = false
}

const closeDropdown = (event: Event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>
