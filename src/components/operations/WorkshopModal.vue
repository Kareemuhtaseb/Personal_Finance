<template>
  <div class="modal-backdrop">
    <div class="modal-content max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-white/20">
        <h2 class="text-premium-medium">
          {{ isEditing ? 'Edit Workshop' : 'Schedule New Workshop' }}
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
        <!-- Workshop Title -->
        <div>
          <label for="title" class="block text-sm font-medium text-premium-muted mb-2">
            Workshop Title *
          </label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            required
            class="input-premium-enhanced"
            placeholder="Enter workshop title"
          />
        </div>

        <!-- Date and Location -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="date" class="block text-sm font-medium text-premium-muted mb-2">
              Workshop Date *
            </label>
            <input
              id="date"
              v-model="formData.date"
              type="date"
              required
              class="input-premium-enhanced"
            />
          </div>

          <div>
            <label for="location" class="block text-sm font-medium text-premium-muted mb-2">
              Location
            </label>
            <input
              id="location"
              v-model="formData.location"
              type="text"
              class="input-premium-enhanced"
              placeholder="Enter workshop location"
            />
          </div>
        </div>

        <!-- Client Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="client" class="block text-sm font-medium text-premium-muted mb-2">
              Client Name
            </label>
            <input
              id="client"
              v-model="formData.client"
              type="text"
              class="input-premium-enhanced"
              placeholder="Enter client name"
            />
          </div>

          <div>
            <label for="organization" class="block text-sm font-medium text-premium-muted mb-2">
              Organization
            </label>
            <input
              id="organization"
              v-model="formData.organization"
              type="text"
              class="input-premium-enhanced"
              placeholder="Enter organization name"
            />
          </div>
        </div>

        <!-- Related Order -->
        <div>
          <label for="orderId" class="block text-sm font-medium text-premium-muted mb-2">
            Related Order
          </label>
          <select
            id="orderId"
            v-model="formData.orderId"
            class="input-premium-enhanced"
          >
            <option value="">Select an order (optional)</option>
            <option
              v-for="order in orders"
              :key="order.id"
              :value="order.id"
            >
              {{ order.orderNumber }} - {{ order.description || 'No description' }}
            </option>
          </select>
        </div>

        <!-- Notes -->
        <div>
          <label for="notes" class="block text-sm font-medium text-premium-muted mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            v-model="formData.notes"
            rows="4"
            class="input-premium-enhanced"
            placeholder="Enter workshop notes, agenda, or additional information"
          ></textarea>
        </div>

        <!-- Workshop Costs -->
        <div v-if="formData.costs && formData.costs.length > 0">
          <label class="block text-sm font-medium text-premium-muted mb-2">
            Workshop Costs
          </label>
          <div class="space-y-3">
            <div
              v-for="(cost, index) in formData.costs"
              :key="index"
              class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex-1">
                <input
                  v-model="cost.description"
                  type="text"
                  placeholder="Cost description"
                  class="input-premium-enhanced"
                />
              </div>
              <div class="w-32">
                <input
                  v-model.number="cost.amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Amount"
                  class="input-premium-enhanced"
                />
              </div>
              <button
                type="button"
                @click="removeCost(index)"
                class="text-red-600 hover:text-red-800 transition-colors"
              >
                <TrashIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
          <button
            type="button"
            @click="addCost"
            class="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            <PlusIcon class="w-4 h-4" />
            Add Cost
          </button>
        </div>

        <!-- Add Costs Button (if no costs exist) -->
        <div v-else>
          <button
            type="button"
            @click="addCost"
            class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            <PlusIcon class="w-4 h-4" />
            Add Workshop Costs
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
            <span v-else>{{ isEditing ? 'Update Workshop' : 'Schedule Workshop' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { Workshop, Order } from '../../stores/operations'

// Props
interface Props {
  workshop?: Workshop | null
  orders: Order[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  save: [workshopData: any]
}>()

// Reactive data
const isSubmitting = ref(false)

// Computed properties
const isEditing = computed(() => !!props.workshop)

// Form data
const formData = ref({
  title: '',
  date: '',
  location: '',
  client: '',
  organization: '',
  orderId: '',
  notes: '',
  costs: [] as Array<{
    description: string
    amount: number
  }>
})

// Watch for workshop changes to populate form
watch(() => props.workshop, (newWorkshop) => {
  if (newWorkshop) {
    formData.value = {
      title: newWorkshop.title,
      date: newWorkshop.date.split('T')[0],
      location: newWorkshop.location || '',
      client: newWorkshop.client || '',
      organization: newWorkshop.organization || '',
      orderId: newWorkshop.orderId || '',
      notes: newWorkshop.notes || '',
      costs: newWorkshop.workshopCosts?.map(cost => ({
        description: cost.description,
        amount: cost.amount / 100 // Convert from cents
      })) || []
    }
  } else {
    // Reset form for new workshop
    formData.value = {
      title: '',
      date: '',
      location: '',
      client: '',
      organization: '',
      orderId: '',
      notes: '',
      costs: []
    }
  }
}, { immediate: true })

// Methods
const addCost = () => {
  formData.value.costs.push({
    description: '',
    amount: 0
  })
}

const removeCost = (index: number) => {
  formData.value.costs.splice(index, 1)
}

const handleSubmit = async () => {
  try {
    isSubmitting.value = true

    // Prepare workshop data
    const workshopData = {
      title: formData.value.title,
      date: formData.value.date,
      location: formData.value.location || undefined,
      client: formData.value.client || undefined,
      organization: formData.value.organization || undefined,
      orderId: formData.value.orderId || undefined,
      notes: formData.value.notes || undefined,
      costs: formData.value.costs
        .filter(cost => cost.description && cost.amount > 0)
        .map(cost => ({
          description: cost.description,
          amount: cost.amount
        }))
    }

    emit('save', workshopData)
  } catch (error) {
    console.error('Error submitting workshop:', error)
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
