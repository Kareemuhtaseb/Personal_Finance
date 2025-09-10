<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-md w-full">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-white/20">
        <h2 class="text-xl font-semibold text-white">
          Add Cost to Task
        </h2>
        <button
          @click="$emit('close')"
          class="text-white/60 hover:text-white transition-colors"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Modal Body -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Task Info -->
        <div class="bg-white/10 border border-white/10 rounded-lg p-3">
          <h3 class="font-medium text-white">{{ task.title }}</h3>
          <p class="text-sm text-white/70">{{ task.description || 'No description' }}</p>
        </div>

        <!-- Cost Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-white/80 mb-2">
            Cost Description *
          </label>
          <input
            id="description"
            v-model="formData.description"
            type="text"
            required
            class="input-premium-enhanced"
            placeholder="e.g., Materials, Labor, Equipment"
          />
        </div>

        <!-- Cost Amount -->
        <div>
          <label for="amount" class="block text-sm font-medium text-white/80 mb-2">
            Amount *
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-white/60 sm:text-sm">$</span>
            </div>
            <input
              id="amount"
              v-model.number="formData.amount"
              type="number"
              step="0.01"
              min="0"
              required
              class="input-premium-enhanced pl-7"
              placeholder="0.00"
            />
          </div>
        </div>

        <!-- Related Item -->
        <div>
          <label for="itemId" class="block text-sm font-medium text-white/80 mb-2">
            Related Inventory Item
          </label>
          <select
            id="itemId"
            v-model="formData.itemId"
            class="input-premium-enhanced"
          >
            <option value="">Select an item (optional)</option>
            <option
              v-for="item in items"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }} - Stock: {{ item.quantity }}
            </option>
          </select>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-white/20">
          <button
            type="button"
            @click="$emit('close')"
            class="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="btn-primary"
          >
            <span v-if="isSubmitting">Adding...</span>
            <span v-else>Add Cost</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import type { Task, Item } from '../../stores/operations'

// Props
interface Props {
  task: Task
  items: Item[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  save: [costData: any]
}>()

// Reactive data
const isSubmitting = ref(false)

// Form data
const formData = ref({
  description: '',
  amount: 0,
  itemId: ''
})

// Watch for task changes to reset form
watch(() => props.task, () => {
  formData.value = {
    description: '',
    amount: 0,
    itemId: ''
  }
}, { immediate: true })

// Methods
const handleSubmit = async () => {
  try {
    isSubmitting.value = true

    const costData = {
      description: formData.value.description,
      amount: formData.value.amount,
      itemId: formData.value.itemId || undefined
    }

    emit('save', costData)
  } catch (error) {
    console.error('Error submitting cost:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
