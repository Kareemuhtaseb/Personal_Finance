<template>
  <div
    class="task-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-move hover:shadow-md transition-all duration-200"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <!-- Task Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1">
        <h4 class="font-semibold text-gray-900 text-sm leading-tight mb-1">
          {{ task.title }}
        </h4>
        <div class="flex items-center gap-2 mb-2">
          <!-- Priority Badge -->
          <span
            :class="priorityClasses"
            class="px-2 py-1 rounded-full text-xs font-medium"
          >
            {{ task.priority }}
          </span>
          <!-- Status Badge -->
          <span
            :class="statusClasses"
            class="px-2 py-1 rounded-full text-xs font-medium"
          >
            {{ task.status.replace('_', ' ') }}
          </span>
        </div>
      </div>
      
      <!-- Actions Menu -->
      <div class="relative">
        <button
          @click="showActions = !showActions"
          class="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <EllipsisVerticalIcon class="w-4 h-4 text-gray-500" />
        </button>
        
        <!-- Dropdown Menu -->
        <div
          v-if="showActions"
          class="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-32"
        >
          <button
            @click="handleEdit"
            class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <PencilIcon class="w-4 h-4" />
            Edit
          </button>
          <button
            @click="handleAddCost"
            class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <CurrencyDollarIcon class="w-4 h-4" />
            Add Cost
          </button>
          <hr class="my-1">
          <button
            @click="handleDelete"
            class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <TrashIcon class="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Task Description -->
    <p
      v-if="task.description"
      class="text-gray-600 text-sm mb-3 line-clamp-2"
    >
      {{ task.description }}
    </p>

    <!-- Task Details -->
    <div class="space-y-2 mb-3">
      <!-- Due Date -->
      <div v-if="task.dueDate" class="flex items-center gap-2 text-xs text-gray-500">
        <CalendarIcon class="w-4 h-4" />
        <span>{{ formatDate(task.dueDate) }}</span>
        <span
          v-if="isOverdue"
          class="text-red-600 font-medium"
        >
          (Overdue)
        </span>
      </div>

      <!-- Assigned To -->
      <div v-if="task.assignedTo" class="flex items-center gap-2 text-xs text-gray-500">
        <UserIcon class="w-4 h-4" />
        <span>{{ task.assignedTo }}</span>
      </div>

      <!-- Time Tracking -->
      <div v-if="task.estimatedHours || task.actualHours" class="flex items-center gap-2 text-xs text-gray-500">
        <ClockIcon class="w-4 h-4" />
        <span v-if="task.estimatedHours">Est: {{ task.estimatedHours }}h</span>
        <span v-if="task.actualHours"> | Act: {{ task.actualHours }}h</span>
      </div>

      <!-- Related Order/Workshop -->
      <div v-if="task.order || task.workshop" class="flex items-center gap-2 text-xs text-gray-500">
        <DocumentTextIcon class="w-4 h-4" />
        <span v-if="task.order">Order: {{ task.order.orderNumber }}</span>
        <span v-if="task.workshop">Workshop: {{ task.workshop.title }}</span>
      </div>
    </div>

    <!-- Task Costs -->
    <div v-if="task.taskCosts && task.taskCosts.length > 0" class="mb-3">
      <div class="flex items-center justify-between text-xs text-white/70 mb-1">
        <span>Costs:</span>
        <span class="font-medium text-white">
          ${{ totalCosts.toFixed(2) }}
        </span>
      </div>
      <div class="space-y-1">
        <div
          v-for="cost in task.taskCosts.slice(0, 2)"
          :key="cost.id"
          class="flex items-center justify-between text-xs bg-white/5 rounded-lg p-2"
        >
          <span class="text-white/80 truncate">{{ cost.description }}</span>
          <span class="text-white font-medium">${{ (cost.amount / 100).toFixed(2) }}</span>
        </div>
        <div
          v-if="task.taskCosts.length > 2"
          class="text-xs text-white/60"
        >
          +{{ task.taskCosts.length - 2 }} more
        </div>
      </div>
    </div>

    <!-- Task Footer -->
    <div class="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
      <span>Created {{ formatRelativeTime(task.createdAt) }}</span>
      <div class="flex items-center gap-1">
        <span class="w-2 h-2 bg-gray-300 rounded-full"></span>
        <span>Task</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format, isAfter, parseISO } from 'date-fns'
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'
import type { Task } from '../../stores/operations'

// Props
interface Props {
  task: Task
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  edit: [task: Task]
  delete: [task: Task]
  'add-cost': [task: Task]
}>()

// Reactive data
const showActions = ref(false)

// Computed properties
const priorityClasses = computed(() => {
  switch (props.task.priority) {
    case 'URGENT':
      return 'bg-red-100 text-red-800'
    case 'NORMAL':
      return 'bg-blue-100 text-blue-800'
    case 'LOW':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})

const statusClasses = computed(() => {
  switch (props.task.status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800'
    case 'COMPLETED':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})

const totalCosts = computed(() => {
  return props.task.taskCosts.reduce((total, cost) => total + cost.amount, 0) / 100
})

const isOverdue = computed(() => {
  if (!props.task.dueDate) return false
  return isAfter(new Date(), parseISO(props.task.dueDate))
})

// Methods
const handleDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', props.task.id)
    event.dataTransfer.effectAllowed = 'move'
  }
}

const handleDragEnd = () => {
  // Reset any drag styling if needed
}

const handleEdit = () => {
  showActions.value = false
  emit('edit', props.task)
}

const handleDelete = () => {
  showActions.value = false
  emit('delete', props.task)
}

const handleAddCost = () => {
  showActions.value = false
  emit('add-cost', props.task)
}

const formatDate = (dateString: string) => {
  return format(parseISO(dateString), 'MMM dd, yyyy')
}

const formatRelativeTime = (dateString: string) => {
  const date = parseISO(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'today'
  if (diffInDays === 1) return 'yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  return `${Math.floor(diffInDays / 30)} months ago`
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showActions.value = false
  }
}

// Add event listener for clicking outside
document.addEventListener('click', handleClickOutside)
</script>

<style scoped>
.task-card {
  transition: all 0.2s ease;
}

.task-card:hover {
  transform: translateY(-1px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom scrollbar for dropdown */
.relative .absolute::-webkit-scrollbar {
  width: 4px;
}

.relative .absolute::-webkit-scrollbar-track {
  background: transparent;
}

.relative .absolute::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.relative .absolute::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
