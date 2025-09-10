<template>
  <div class="modal-backdrop">
    <div class="modal-content max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-white/20">
        <h2 class="text-premium-medium">
          {{ isEditing ? 'Edit Order' : 'Create New Order' }}
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
        <!-- Order Amount -->
        <div>
          <label for="amount" class="block text-sm font-medium text-premium-muted mb-2">
            Order Amount * ($)
          </label>
          <input
            id="amount"
            v-model.number="formData.amount"
            type="number"
            step="0.01"
            min="0"
            required
            class="input-premium-enhanced"
            placeholder="0.00"
          />
        </div>

        <!-- Order Type and Priority -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="type" class="block text-sm font-medium text-premium-muted mb-2">
              Order Type *
            </label>
            <CustomDropdown
              v-model="formData.type"
              :options="orderTypeOptions"
              placeholder="Select order type"
            />
          </div>

          <div>
            <label for="priority" class="block text-sm font-medium text-premium-muted mb-2">
              Priority
            </label>
            <CustomDropdown
              v-model="formData.priority"
              :options="priorityOptions"
              placeholder="Select priority"
            />
          </div>
        </div>

        <!-- Due Date -->
        <div>
          <label for="dueDate" class="block text-sm font-medium text-premium-muted mb-2">
            Due Date
          </label>
          <input
            id="dueDate"
            v-model="formData.dueDate"
            type="date"
            class="input-premium-enhanced"
          />
        </div>

        <!-- Client Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="clientName" class="block text-sm font-medium text-premium-muted mb-2">
              Client Name
            </label>
            <input
              id="clientName"
              v-model="formData.clientName"
              type="text"
              class="input-premium-enhanced"
              placeholder="Enter client name"
            />
          </div>

          <div>
            <label for="clientEmail" class="block text-sm font-medium text-premium-muted mb-2">
              Client Email
            </label>
            <input
              id="clientEmail"
              v-model="formData.clientEmail"
              type="email"
              class="input-premium-enhanced"
              placeholder="Enter client email"
            />
          </div>
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
            placeholder="Enter order description"
          ></textarea>
        </div>

        <!-- Time Tracking -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="estimatedHours" class="block text-sm font-medium text-premium-muted mb-2">
              Estimated Hours
            </label>
            <input
              id="estimatedHours"
              v-model.number="formData.estimatedHours"
              type="number"
              step="0.5"
              min="0"
              class="input-premium-enhanced"
              placeholder="0"
            />
          </div>

          <div>
            <label for="profitMargin" class="block text-sm font-medium text-premium-muted mb-2">
              Profit Margin (%)
            </label>
            <input
              id="profitMargin"
              v-model.number="formData.profitMargin"
              type="number"
              step="0.1"
              min="0"
              max="100"
              class="input-premium-enhanced"
              placeholder="0"
            />
          </div>
        </div>

        <!-- Order Items -->
        <div v-if="formData.items && formData.items.length > 0">
          <label class="block text-sm font-medium text-premium-muted mb-2">
            Order Items
          </label>
          <div class="space-y-3">
            <div
              v-for="(item, index) in formData.items"
              :key="index"
              class="flex items-center gap-3 p-3 bg-white/10 border border-white/10 rounded-lg"
            >
              <div class="flex-1">
                <select
                  v-model="item.itemId"
                  class="input-premium-enhanced"
                >
                  <option value="">Select an item</option>
                  <option
                    v-for="inventoryItem in items"
                    :key="inventoryItem.id"
                    :value="inventoryItem.id"
                  >
                    {{ inventoryItem.name }} - ${{ (inventoryItem.unitCost / 100).toFixed(2) }}
                  </option>
                </select>
              </div>
              <div class="w-24">
                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="1"
                  placeholder="Qty"
                  class="input-premium-enhanced"
                />
              </div>
              <div class="w-32">
                <input
                  v-model.number="item.unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Unit Price"
                  class="input-premium-enhanced"
                />
              </div>
              <button
                type="button"
                @click="removeItem(index)"
                class="text-red-600 hover:text-red-800 transition-colors"
              >
                <TrashIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
          <button
            type="button"
            @click="addItem"
            class="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            <PlusIcon class="w-4 h-4" />
            Add Item
          </button>
        </div>

        <!-- Add Items Button (if no items exist) -->
        <div v-else>
          <button
            type="button"
            @click="addItem"
            class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            <PlusIcon class="w-4 h-4" />
            Add Order Items
          </button>
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
            <span v-else>{{ isEditing ? 'Update Order' : 'Create Order' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import CustomDropdown from '../ui/CustomDropdown.vue'
import type { Order, Item } from '../../stores/operations'

// Props
interface Props {
  order?: Order | null
  items: Item[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  save: [orderData: any]
}>()

// Reactive data
const isSubmitting = ref(false)

// Dropdown options
const orderTypeOptions = [
  { value: 'DELIVERY', label: 'Delivery' },
  { value: 'PICKUP', label: 'Pickup' }
]

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'URGENT', label: 'Urgent' }
]

// Computed properties
const isEditing = computed(() => !!props.order)

// Form data
const formData = ref({
  amount: 0,
  type: 'DELIVERY' as 'DELIVERY' | 'PICKUP',
  priority: 'NORMAL' as 'URGENT' | 'NORMAL' | 'LOW',
  dueDate: '',
  clientName: '',
  clientEmail: '',
  description: '',
  estimatedHours: undefined as number | undefined,
  profitMargin: undefined as number | undefined,
  items: [] as Array<{
    itemId: string
    quantity: number
    unitPrice: number
  }>
})

// Watch for order changes to populate form
watch(() => props.order, (newOrder) => {
  if (newOrder) {
    formData.value = {
      amount: newOrder.amount / 100, // Convert from cents
      type: newOrder.type,
      priority: newOrder.priority,
      dueDate: newOrder.dueDate ? newOrder.dueDate.split('T')[0] : '',
      clientName: newOrder.clientName || '',
      clientEmail: newOrder.clientEmail || '',
      description: newOrder.description || '',
      estimatedHours: newOrder.estimatedHours,
      profitMargin: newOrder.profitMargin,
      items: newOrder.orderItems?.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice / 100 // Convert from cents
      })) || []
    }
  } else {
    // Reset form for new order
    formData.value = {
      amount: 0,
      type: 'DELIVERY',
      priority: 'NORMAL',
      dueDate: '',
      clientName: '',
      clientEmail: '',
      description: '',
      estimatedHours: undefined,
      profitMargin: undefined,
      items: []
    }
  }
}, { immediate: true })

// Methods
const addItem = () => {
  formData.value.items.push({
    itemId: '',
    quantity: 1,
    unitPrice: 0
  })
}

const removeItem = (index: number) => {
  formData.value.items.splice(index, 1)
}

const handleSubmit = async () => {
  try {
    isSubmitting.value = true

    // Prepare order data
    const orderData = {
      amount: formData.value.amount,
      type: formData.value.type,
      priority: formData.value.priority,
      dueDate: formData.value.dueDate || undefined,
      clientName: formData.value.clientName || undefined,
      clientEmail: formData.value.clientEmail || undefined,
      description: formData.value.description || undefined,
      estimatedHours: formData.value.estimatedHours,
      profitMargin: formData.value.profitMargin,
      items: formData.value.items
        .filter(item => item.itemId && item.quantity > 0)
        .map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
    }

    emit('save', orderData)
  } catch (error) {
    console.error('Error submitting order:', error)
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
