<template>
  <div class="modal-backdrop">
    <div class="modal-content max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-white/20">
        <h2 class="text-premium-medium">
          {{ isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-white/60 hover:text-white transition-colors"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Modal Body -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Item Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-premium-muted mb-2">
            Item Name *
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            class="input-premium-enhanced"
            placeholder="Enter item name"
          />
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-premium-muted mb-2">
            Description
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="3"
            class="input-premium-enhanced"
            placeholder="Enter item description"
          ></textarea>
        </div>

        <!-- Quantity and Unit Cost -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="quantity" class="block text-sm font-medium text-premium-muted mb-2">
              Current Quantity
            </label>
            <input
              id="quantity"
              v-model.number="formData.quantity"
              type="number"
              min="0"
              class="input-premium-enhanced"
              placeholder="0"
            />
          </div>

          <div>
            <label for="unitCost" class="block text-sm font-medium text-premium-muted mb-2">
              Unit Cost ($) *
            </label>
            <input
              id="unitCost"
              v-model.number="formData.unitCost"
              type="number"
              step="0.01"
              min="0"
              required
              class="input-premium-enhanced"
              placeholder="0.00"
            />
          </div>
        </div>

        <!-- Stock Levels -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="minStock" class="block text-sm font-medium text-premium-muted mb-2">
              Minimum Stock Level
            </label>
            <input
              id="minStock"
              v-model.number="formData.minStock"
              type="number"
              min="0"
              class="input-premium-enhanced"
              placeholder="0"
            />
            <p class="text-xs text-gray-500 mt-1">Alert when stock falls below this level</p>
          </div>

          <div>
            <label for="maxStock" class="block text-sm font-medium text-premium-muted mb-2">
              Maximum Stock Level
            </label>
            <input
              id="maxStock"
              v-model.number="formData.maxStock"
              type="number"
              min="0"
              class="input-premium-enhanced"
              placeholder="Optional"
            />
            <p class="text-xs text-gray-500 mt-1">Optional maximum stock level</p>
          </div>
        </div>

        <!-- Status -->
        <div v-if="isEditing">
          <label class="block text-sm font-medium text-premium-muted mb-2">
            Item Status
          </label>
          <div class="flex items-center space-x-4">
            <label class="flex items-center">
              <input
                v-model="formData.isActive"
                :true-value="true"
                :false-value="false"
                type="checkbox"
                class="rounded border-white/20 text-blue-400 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-400/20 focus:ring-opacity-50 bg-white/10"
              />
              <span class="ml-2 text-sm text-premium-muted">Active</span>
            </label>
          </div>
          <p class="text-xs text-premium-muted mt-1">Inactive items won't appear in order forms</p>
        </div>

        <!-- Stock Status Display -->
        <div v-if="isEditing" class="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
          <h4 class="text-sm font-medium text-premium-muted mb-2">Current Stock Status</h4>
          <div class="flex items-center gap-4">
            <div>
              <span class="text-sm text-premium-muted">Current Stock:</span>
              <span class="font-medium text-premium ml-2">{{ formData.quantity || 0 }}</span>
            </div>
            <div>
              <span class="text-sm text-premium-muted">Total Value:</span>
              <span class="font-medium text-premium ml-2">
                ${{ ((formData.quantity || 0) * (formData.unitCost || 0)).toFixed(2) }}
              </span>
            </div>
            <div>
              <span :class="getStockStatusClasses()" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ getStockStatus() }}
              </span>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-3 pt-6 border-t border-white/20">
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
            class="btn-primary flex items-center gap-2"
          >
            <span v-if="isSubmitting">Saving...</span>
            <span v-else>{{ isEditing ? 'Update Item' : 'Add Item' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import type { Item } from '../../stores/operations'

// Props
interface Props {
  item?: Item | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  save: [itemData: any]
}>()

// Reactive data
const isSubmitting = ref(false)

// Computed properties
const isEditing = computed(() => !!props.item)

// Form data
const formData = ref({
  name: '',
  description: '',
  quantity: 0,
  unitCost: 0,
  minStock: 0,
  maxStock: undefined as number | undefined,
  isActive: true
})

// Watch for item changes to populate form
watch(() => props.item, (newItem) => {
  if (newItem) {
    formData.value = {
      name: newItem.name,
      description: newItem.description || '',
      quantity: newItem.quantity,
      unitCost: newItem.unitCost / 100, // Convert from cents
      minStock: newItem.minStock,
      maxStock: newItem.maxStock,
      isActive: newItem.isActive
    }
  } else {
    // Reset form for new item
    formData.value = {
      name: '',
      description: '',
      quantity: 0,
      unitCost: 0,
      minStock: 0,
      maxStock: undefined,
      isActive: true
    }
  }
}, { immediate: true })

// Methods
const getStockStatus = () => {
  const quantity = formData.value.quantity || 0
  const minStock = formData.value.minStock || 0
  
  if (quantity === 0) return 'Out of Stock'
  if (quantity <= minStock) return 'Low Stock'
  return 'In Stock'
}

const getStockStatusClasses = () => {
  const quantity = formData.value.quantity || 0
  const minStock = formData.value.minStock || 0
  
  if (quantity === 0) return 'bg-red-100 text-red-800'
  if (quantity <= minStock) return 'bg-orange-100 text-orange-800'
  return 'bg-green-100 text-green-800'
}

const handleSubmit = async () => {
  try {
    isSubmitting.value = true

    // Prepare item data
    const itemData = {
      name: formData.value.name,
      description: formData.value.description || undefined,
      quantity: formData.value.quantity || 0,
      unitCost: formData.value.unitCost,
      minStock: formData.value.minStock || 0,
      maxStock: formData.value.maxStock || undefined,
      isActive: formData.value.isActive
    }

    emit('save', itemData)
  } catch (error) {
    console.error('Error submitting item:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* Custom scrollbar for modal */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
