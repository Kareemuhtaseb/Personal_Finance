<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">
          {{ isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Modal Body -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Item Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            Item Name *
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter item name"
          />
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter item description"
          ></textarea>
        </div>

        <!-- Quantity and Unit Cost -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="quantity" class="block text-sm font-medium text-gray-700 mb-2">
              Current Quantity
            </label>
            <input
              id="quantity"
              v-model.number="formData.quantity"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>

          <div>
            <label for="unitCost" class="block text-sm font-medium text-gray-700 mb-2">
              Unit Cost ($) *
            </label>
            <input
              id="unitCost"
              v-model.number="formData.unitCost"
              type="number"
              step="0.01"
              min="0"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <!-- Stock Levels -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="minStock" class="block text-sm font-medium text-gray-700 mb-2">
              Minimum Stock Level
            </label>
            <input
              id="minStock"
              v-model.number="formData.minStock"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            <p class="text-xs text-gray-500 mt-1">Alert when stock falls below this level</p>
          </div>

          <div>
            <label for="maxStock" class="block text-sm font-medium text-gray-700 mb-2">
              Maximum Stock Level
            </label>
            <input
              id="maxStock"
              v-model.number="formData.maxStock"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional"
            />
            <p class="text-xs text-gray-500 mt-1">Optional maximum stock level</p>
          </div>
        </div>

        <!-- Status -->
        <div v-if="isEditing">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Item Status
          </label>
          <div class="flex items-center space-x-4">
            <label class="flex items-center">
              <input
                v-model="formData.isActive"
                :true-value="true"
                :false-value="false"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span class="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>
          <p class="text-xs text-gray-500 mt-1">Inactive items won't appear in order forms</p>
        </div>

        <!-- Stock Status Display -->
        <div v-if="isEditing" class="p-4 bg-gray-50 rounded-lg">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Current Stock Status</h4>
          <div class="flex items-center gap-4">
            <div>
              <span class="text-sm text-gray-600">Current Stock:</span>
              <span class="font-medium text-gray-900 ml-2">{{ formData.quantity || 0 }}</span>
            </div>
            <div>
              <span class="text-sm text-gray-600">Total Value:</span>
              <span class="font-medium text-gray-900 ml-2">
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
        <div class="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
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
