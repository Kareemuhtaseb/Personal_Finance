<template>
  <div class="modal-backdrop">
    <div class="modal-content max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-white/20">
        <h2 class="text-premium-medium">
          {{ isEditing ? 'Edit Task' : 'Create New Task' }}
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
        <!-- Task Title -->
        <div>
          <label for="title" class="block text-sm font-medium text-premium-muted mb-2">
            Task Title *
          </label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            required
            class="input-premium-enhanced"
            placeholder="Enter task title"
          />
        </div>

        <!-- Task Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-premium-muted mb-2">
            Description
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="3"
            class="input-premium-enhanced"
            placeholder="Enter task description"
          ></textarea>
        </div>

        <!-- Priority and Status -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div v-if="isEditing">
            <label for="status" class="block text-sm font-medium text-premium-muted mb-2">
              Status
            </label>
            <CustomDropdown
              v-model="formData.status"
              :options="statusOptions"
              placeholder="Select status"
            />
          </div>
        </div>

        <!-- Due Date and Assigned To -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div>
            <label for="assignedTo" class="block text-sm font-medium text-premium-muted mb-2">
              Assigned To
            </label>
            <input
              id="assignedTo"
              v-model="formData.assignedTo"
              type="text"
              class="input-premium-enhanced"
              placeholder="Enter assignee name"
            />
          </div>
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
            <label for="actualHours" class="block text-sm font-medium text-premium-muted mb-2">
              Actual Hours
            </label>
            <input
              id="actualHours"
              v-model.number="formData.actualHours"
              type="number"
              step="0.5"
              min="0"
              class="input-premium-enhanced"
              placeholder="0"
            />
          </div>
        </div>

        <!-- Related Order/Workshop -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div>
            <label for="workshopId" class="block text-sm font-medium text-premium-muted mb-2">
              Related Workshop
            </label>
            <select
              id="workshopId"
              v-model="formData.workshopId"
              class="input-premium-enhanced"
            >
              <option value="">Select a workshop (optional)</option>
              <option
                v-for="workshop in workshops"
                :key="workshop.id"
                :value="workshop.id"
              >
                {{ workshop.title }} - {{ workshop.client || 'No client' }}
              </option>
            </select>
          </div>
        </div>

        <!-- Task Costs -->
        <div v-if="formData.costs && formData.costs.length > 0">
          <label class="block text-sm font-medium text-premium-muted mb-2">
            Task Costs
          </label>
          <div class="space-y-3">
            <div
              v-for="(cost, index) in formData.costs"
              :key="index"
              class="flex items-center gap-3 p-3 bg-white/10 border border-white/10 rounded-lg"
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
              <div class="w-40">
                <select
                  v-model="cost.itemId"
                  class="input-premium-enhanced"
                >
                  <option value="">Select item (optional)</option>
                  <option
                    v-for="item in items"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.name }}
                  </option>
                </select>
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
            Add Task Costs
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
            <span v-else>{{ isEditing ? 'Update Task' : 'Create Task' }}</span>
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
import type { Task, Order, Workshop, Item } from '../../stores/operations'

// Props
interface Props {
  task?: Task | null
  orders: Order[]
  workshops: Workshop[]
  items: Item[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  save: [taskData: any]
}>()

// Reactive data
const isSubmitting = ref(false)

// Dropdown options
const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'URGENT', label: 'Urgent' }
]

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' }
]

// Computed properties
const isEditing = computed(() => !!props.task)

// Form data
const formData = ref({
  title: '',
  description: '',
  priority: 'NORMAL' as 'URGENT' | 'NORMAL' | 'LOW',
  status: 'PENDING' as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
  dueDate: '',
  assignedTo: '',
  estimatedHours: undefined as number | undefined,
  actualHours: undefined as number | undefined,
  orderId: '',
  workshopId: '',
  costs: [] as Array<{
    description: string
    amount: number
    itemId: string
  }>
})

// Watch for task changes to populate form
watch(() => props.task, (newTask) => {
  if (newTask) {
    formData.value = {
      title: newTask.title,
      description: newTask.description || '',
      priority: newTask.priority,
      status: newTask.status,
      dueDate: newTask.dueDate ? newTask.dueDate.split('T')[0] : '',
      assignedTo: newTask.assignedTo || '',
      estimatedHours: newTask.estimatedHours,
      actualHours: newTask.actualHours,
      orderId: newTask.orderId || '',
      workshopId: newTask.workshopId || '',
      costs: newTask.taskCosts?.map(cost => ({
        description: cost.description,
        amount: cost.amount / 100, // Convert from cents
        itemId: cost.itemId || ''
      })) || []
    }
  } else {
    // Reset form for new task
    formData.value = {
      title: '',
      description: '',
      priority: 'NORMAL',
      status: 'PENDING',
      dueDate: '',
      assignedTo: '',
      estimatedHours: undefined,
      actualHours: undefined,
      orderId: '',
      workshopId: '',
      costs: []
    }
  }
}, { immediate: true })

// Methods
const addCost = () => {
  formData.value.costs.push({
    description: '',
    amount: 0,
    itemId: ''
  })
}

const removeCost = (index: number) => {
  formData.value.costs.splice(index, 1)
}

const handleSubmit = async () => {
  try {
    isSubmitting.value = true

    // Prepare task data
    const taskData = {
      title: formData.value.title,
      description: formData.value.description || undefined,
      priority: formData.value.priority,
      status: formData.value.status,
      dueDate: formData.value.dueDate || undefined,
      assignedTo: formData.value.assignedTo || undefined,
      estimatedHours: formData.value.estimatedHours,
      actualHours: formData.value.actualHours,
      orderId: formData.value.orderId || undefined,
      workshopId: formData.value.workshopId || undefined,
      costs: formData.value.costs
        .filter(cost => cost.description && cost.amount > 0)
        .map(cost => ({
          description: cost.description,
          amount: cost.amount,
          itemId: cost.itemId || undefined
        }))
    }

    emit('save', taskData)
  } catch (error) {
    console.error('Error submitting task:', error)
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
