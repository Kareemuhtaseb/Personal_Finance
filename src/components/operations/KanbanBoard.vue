<template>
  <div class="kanban-board">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-white">Task Management</h2>
      <div class="flex items-center gap-3">
        <!-- Search and Filter -->
        <div class="flex items-center gap-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search tasks..."
            class="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            v-model="priorityFilter"
            class="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        <button
          @click="emit('createTask')"
          class="btn-primary flex items-center gap-2"
        >
          <PlusIcon class="w-4 h-4" />
          Add Task
        </button>
      </div>
    </div>

    <div class="flex gap-6 overflow-x-auto pb-4">
      <!-- Pending Column -->
      <div class="kanban-column flex-shrink-0 w-80">
        <div class="column-header">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-white">Pending</h3>
            <span class="kanban-count">
              {{ filteredPendingTasks.length }}
            </span>
          </div>
        </div>
        <draggable
          v-model="filteredPendingTasks"
          group="tasks"
          @end="onTaskMove"
          class="column-content"
          :animation="200"
          ghost-class="ghost-task"
          chosen-class="chosen-task"
          item-key="id"
        >
          <template #item="{ element: task }">
            <div
              :key="task.id"
              :data-task-id="task.id"
              class="task-card"
            >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h4 class="font-semibold text-white text-sm leading-tight mb-1">
                  {{ task.title }}
                </h4>
                <div class="flex items-center gap-2 mb-2">
                  <!-- Priority Badge -->
                  <span
                    :class="getPriorityClasses(task.priority)"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ task.priority }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Task Description -->
            <p
              v-if="task.description"
              class="text-white/70 text-sm mb-3 line-clamp-2"
            >
              {{ task.description }}
            </p>

            <!-- Task Details -->
            <div class="space-y-2 mb-3">
              <!-- Due Date -->
              <div v-if="task.dueDate" class="flex items-center gap-2 text-xs text-white/60">
                <CalendarIcon class="w-4 h-4" />
                <span>{{ formatDate(task.dueDate) }}</span>
              </div>

              <!-- Assigned To -->
              <div v-if="task.assignedTo" class="flex items-center gap-2 text-xs text-white/60">
                <UserIcon class="w-4 h-4" />
                <span>{{ task.assignedTo }}</span>
              </div>
            </div>

            <!-- Task Footer -->
            <div class="flex items-center justify-between text-xs text-white/60 pt-2 border-t border-white/20">
              <span>Created {{ formatRelativeTime(task.createdAt) }}</span>
              <div class="flex items-center gap-2">
                <!-- Task Actions -->
                <div class="flex items-center gap-1">
                  <button
                    @click="editTask(task)"
                    class="p-1 text-white/60 hover:text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                    title="Edit task"
                  >
                    <PencilIcon class="w-3 h-3" />
                  </button>
                  <button
                    @click="duplicateTask(task)"
                    class="p-1 text-white/60 hover:text-green-400 hover:bg-green-500/20 rounded transition-colors"
                    title="Duplicate task"
                  >
                    <DocumentDuplicateIcon class="w-3 h-3" />
                  </button>
                  <button
                    @click="deleteTask(task)"
                    class="p-1 text-white/60 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                    title="Delete task"
                  >
                    <TrashIcon class="w-3 h-3" />
                  </button>
                </div>
                <div class="flex items-center gap-1">
                  <span class="w-2 h-2 bg-white/40 rounded-full"></span>
                  <span>Task</span>
                </div>
              </div>
            </div>
          </div>
          </template>
        </draggable>
      </div>

      <!-- In Progress Column -->
      <div class="kanban-column flex-shrink-0 w-80">
        <div class="column-header">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-white">In Progress</h3>
            <span class="kanban-count">
              {{ filteredInProgressTasks.length }}
            </span>
          </div>
        </div>
        <draggable
          v-model="filteredInProgressTasks"
          group="tasks"
          @end="onTaskMove"
          class="column-content"
          :animation="200"
          ghost-class="ghost-task"
          chosen-class="chosen-task"
          item-key="id"
        >
          <template #item="{ element: task }">
            <div
              :key="task.id"
              :data-task-id="task.id"
              class="task-card"
            >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h4 class="font-semibold text-white text-sm leading-tight mb-1">
                  {{ task.title }}
                </h4>
                <div class="flex items-center gap-2 mb-2">
                  <!-- Priority Badge -->
                  <span
                    :class="getPriorityClasses(task.priority)"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ task.priority }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Task Description -->
            <p
              v-if="task.description"
              class="text-white/70 text-sm mb-3 line-clamp-2"
            >
              {{ task.description }}
            </p>

            <!-- Task Details -->
            <div class="space-y-2 mb-3">
              <!-- Due Date -->
              <div v-if="task.dueDate" class="flex items-center gap-2 text-xs text-white/60">
                <CalendarIcon class="w-4 h-4" />
                <span>{{ formatDate(task.dueDate) }}</span>
              </div>

              <!-- Assigned To -->
              <div v-if="task.assignedTo" class="flex items-center gap-2 text-xs text-white/60">
                <UserIcon class="w-4 h-4" />
                <span>{{ task.assignedTo }}</span>
              </div>
            </div>

            <!-- Task Footer -->
            <div class="flex items-center justify-between text-xs text-white/60 pt-2 border-t border-white/20">
              <span>Created {{ formatRelativeTime(task.createdAt) }}</span>
              <div class="flex items-center gap-2">
                <!-- Task Actions -->
                <div class="flex items-center gap-1">
                  <button
                    @click="editTask(task)"
                    class="p-1 text-white/60 hover:text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                    title="Edit task"
                  >
                    <PencilIcon class="w-3 h-3" />
                  </button>
                  <button
                    @click="duplicateTask(task)"
                    class="p-1 text-white/60 hover:text-green-400 hover:bg-green-500/20 rounded transition-colors"
                    title="Duplicate task"
                  >
                    <DocumentDuplicateIcon class="w-3 h-3" />
                  </button>
                  <button
                    @click="deleteTask(task)"
                    class="p-1 text-white/60 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                    title="Delete task"
                  >
                    <TrashIcon class="w-3 h-3" />
                  </button>
                </div>
                <div class="flex items-center gap-1">
                  <span class="w-2 h-2 bg-white/40 rounded-full"></span>
                  <span>Task</span>
                </div>
              </div>
            </div>
          </div>
          </template>
        </draggable>
      </div>

      <!-- Completed Column -->
      <div class="kanban-column flex-shrink-0 w-80">
        <div class="column-header">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-white">Completed</h3>
            <span class="kanban-count">
              {{ filteredCompletedTasks.length }}
            </span>
          </div>
        </div>
        <draggable
          v-model="filteredCompletedTasks"
          group="tasks"
          @end="onTaskMove"
          class="column-content"
          :animation="200"
          ghost-class="ghost-task"
          chosen-class="chosen-task"
          item-key="id"
        >
          <template #item="{ element: task }">
            <div
              :key="task.id"
              :data-task-id="task.id"
              class="task-card"
            >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h4 class="font-semibold text-white text-sm leading-tight mb-1">
                  {{ task.title }}
                </h4>
                <div class="flex items-center gap-2 mb-2">
                  <!-- Priority Badge -->
                  <span
                    :class="getPriorityClasses(task.priority)"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ task.priority }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Task Description -->
            <p
              v-if="task.description"
              class="text-white/70 text-sm mb-3 line-clamp-2"
            >
              {{ task.description }}
            </p>

            <!-- Task Details -->
            <div class="space-y-2 mb-3">
              <!-- Due Date -->
              <div v-if="task.dueDate" class="flex items-center gap-2 text-xs text-white/60">
                <CalendarIcon class="w-4 h-4" />
                <span>{{ formatDate(task.dueDate) }}</span>
              </div>

              <!-- Assigned To -->
              <div v-if="task.assignedTo" class="flex items-center gap-2 text-xs text-white/60">
                <UserIcon class="w-4 h-4" />
                <span>{{ task.assignedTo }}</span>
              </div>
            </div>

            <!-- Task Footer -->
            <div class="flex items-center justify-between text-xs text-white/60 pt-2 border-t border-white/20">
              <span>Created {{ formatRelativeTime(task.createdAt) }}</span>
              <div class="flex items-center gap-2">
                <!-- Task Actions -->
                <div class="flex items-center gap-1">
                  <button
                    @click="editTask(task)"
                    class="p-1 text-white/60 hover:text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                    title="Edit task"
                  >
                    <PencilIcon class="w-3 h-3" />
                  </button>
                  <button
                    @click="duplicateTask(task)"
                    class="p-1 text-white/60 hover:text-green-400 hover:bg-green-500/20 rounded transition-colors"
                    title="Duplicate task"
                  >
                    <DocumentDuplicateIcon class="w-3 h-3" />
                  </button>
                  <button
                    @click="deleteTask(task)"
                    class="p-1 text-white/60 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                    title="Delete task"
                  >
                    <TrashIcon class="w-3 h-3" />
                  </button>
                </div>
                <div class="flex items-center gap-1">
                  <span class="w-2 h-2 bg-white/40 rounded-full"></span>
                  <span>Task</span>
                </div>
              </div>
            </div>
          </div>
          </template>
        </draggable>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOperationsStore, type Task } from '../../stores/operations'
import { 
  PlusIcon, 
  CalendarIcon, 
  UserIcon, 
  PencilIcon, 
  DocumentDuplicateIcon, 
  TrashIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'
import { format, parseISO } from 'date-fns'
import draggable from 'vuedraggable'

const operationsStore = useOperationsStore()

// Emits
const emit = defineEmits<{
  createTask: []
  editTask: [task: Task]
}>()

// Reactive data
const editingTask = ref<Task | null>(null)
const searchQuery = ref('')
const priorityFilter = ref('')

// Computed properties for tasks by status with drag-and-drop support
const pendingTasks = computed({
  get: () => operationsStore.tasks.filter(task => task.status === 'PENDING'),
  set: (tasks) => {
    // Update task positions and status
    tasks.forEach((task, index) => {
      if (task.status !== 'PENDING') {
        operationsStore.updateTaskStatus(task.id, 'PENDING')
      }
      operationsStore.updateTask(task.id, { position: index })
    })
  }
})

const inProgressTasks = computed({
  get: () => operationsStore.tasks.filter(task => task.status === 'IN_PROGRESS'),
  set: (tasks) => {
    tasks.forEach((task, index) => {
      if (task.status !== 'IN_PROGRESS') {
        operationsStore.updateTaskStatus(task.id, 'IN_PROGRESS')
      }
      operationsStore.updateTask(task.id, { position: index })
    })
  }
})

const completedTasks = computed({
  get: () => operationsStore.tasks.filter(task => task.status === 'COMPLETED'),
  set: (tasks) => {
    tasks.forEach((task, index) => {
      if (task.status !== 'COMPLETED') {
        operationsStore.updateTaskStatus(task.id, 'COMPLETED')
      }
      operationsStore.updateTask(task.id, { position: index })
    })
  }
})

// Filtered tasks based on search and priority
const filteredPendingTasks = computed({
  get: () => {
    return pendingTasks.value.filter(task => {
      const matchesSearch = !searchQuery.value || 
        task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.value.toLowerCase()))
      const matchesPriority = !priorityFilter.value || task.priority === priorityFilter.value
      return matchesSearch && matchesPriority
    })
  },
  set: (tasks) => {
    // Update the underlying pending tasks
    pendingTasks.value = tasks
  }
})

const filteredInProgressTasks = computed({
  get: () => {
    return inProgressTasks.value.filter(task => {
      const matchesSearch = !searchQuery.value || 
        task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.value.toLowerCase()))
      const matchesPriority = !priorityFilter.value || task.priority === priorityFilter.value
      return matchesSearch && matchesPriority
    })
  },
  set: (tasks) => {
    // Update the underlying in progress tasks
    inProgressTasks.value = tasks
  }
})

const filteredCompletedTasks = computed({
  get: () => {
    return completedTasks.value.filter(task => {
      const matchesSearch = !searchQuery.value || 
        task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.value.toLowerCase()))
      const matchesPriority = !priorityFilter.value || task.priority === priorityFilter.value
      return matchesSearch && matchesPriority
    })
  },
  set: (tasks) => {
    // Update the underlying completed tasks
    completedTasks.value = tasks
  }
})

// Methods
const onTaskMove = (event: any) => {
  const { item, to, newIndex } = event
  
  // Determine new status based on target column
  let newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' = 'PENDING'
  const columnHeader = to.closest('.kanban-column')?.querySelector('.column-header h3')?.textContent
  if (columnHeader?.includes('In Progress')) {
    newStatus = 'IN_PROGRESS'
  } else if (columnHeader?.includes('Completed')) {
    newStatus = 'COMPLETED'
  }
  
  // Update task status and position
  const taskId = item.dataset.taskId
  operationsStore.updateTaskStatus(taskId, newStatus)
  operationsStore.updateTask(taskId, { position: newIndex })
}

const getPriorityClasses = (priority: string) => {
  switch (priority) {
    case 'URGENT':
      return 'bg-red-500/20 text-red-400 border border-red-500/30'
    case 'NORMAL':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    case 'LOW':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
}

const getDueDateClasses = (dueDate: string) => {
  const due = parseISO(dueDate)
  const now = new Date()
  const diffInDays = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays < 0) {
    return 'text-red-400 font-medium' // Overdue
  } else if (diffInDays === 0) {
    return 'text-yellow-400 font-medium' // Due today
  } else if (diffInDays <= 3) {
    return 'text-orange-400 font-medium' // Due soon
  } else {
    return 'text-white/60' // Normal
  }
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

// Task actions
const editTask = (task: Task) => {
  emit('editTask', task)
}

const duplicateTask = async (task: Task) => {
  try {
    const duplicatedTask = {
      title: `${task.title} (Copy)`,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedTo: task.assignedTo,
      orderId: task.orderId,
      workshopId: task.workshopId,
      estimatedHours: task.estimatedHours,
      costs: task.taskCosts?.map(cost => ({
        description: cost.description,
        amount: cost.amount / 100, // Convert from cents
        itemId: cost.itemId
      })) || []
    }
    
    await operationsStore.createTask(duplicatedTask)
  } catch (error) {
    console.error('Error duplicating task:', error)
  }
}

const deleteTask = async (task: Task) => {
  if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
    try {
      await operationsStore.deleteTask(task.id)
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }
}


// Lifecycle
onMounted(async () => {
  await operationsStore.fetchTasks()
  await operationsStore.fetchOrders()
  await operationsStore.fetchWorkshops()
  await operationsStore.fetchItems()
  
  // Add sample tasks for testing if no tasks exist
  if (operationsStore.tasks.length === 0) {
    const sampleTasks = [
      {
        title: 'Design Website Layout',
        description: 'Create wireframes and mockups for the new website',
        status: 'PENDING' as const,
        priority: 'URGENT' as const,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'John Doe',
        estimatedHours: 8,
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        taskCosts: []
      },
      {
        title: 'Implement User Authentication',
        description: 'Set up login and registration functionality',
        status: 'IN_PROGRESS' as const,
        priority: 'NORMAL' as const,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'Jane Smith',
        estimatedHours: 12,
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        taskCosts: []
      },
      {
        title: 'Write API Documentation',
        description: 'Document all API endpoints and usage examples',
        status: 'COMPLETED' as const,
        priority: 'LOW' as const,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'Mike Johnson',
        estimatedHours: 4,
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        taskCosts: []
      },
      {
        title: 'Database Optimization',
        description: 'Optimize database queries and add indexes',
        status: 'PENDING' as const,
        priority: 'NORMAL' as const,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'Sarah Wilson',
        estimatedHours: 6,
        position: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        taskCosts: []
      }
    ]
    
    // Add sample tasks to the store
    sampleTasks.forEach((task, index) => {
      const taskWithId = { ...task, id: `sample-task-${index + 1}` }
      operationsStore.tasks.push(taskWithId)
    })
  }
})
</script>

<style scoped>
.kanban-board {
  @apply p-6;
}

.kanban-column {
  @apply flex flex-col;
}

.column-header {
  @apply backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 mb-4;
}

.kanban-count {
  @apply bg-white/20 text-white/80 text-sm px-2 py-1 rounded-full;
}

.column-content {
  @apply backdrop-blur-xl bg-white/5 border border-white/20 rounded-xl p-4 min-h-96 space-y-3;
}

.task-card {
  @apply backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 cursor-move;
}

.task-card:hover {
  @apply transform translate-y-[-2px] shadow-2xl shadow-blue-500/20;
}

/* Drag and drop styles */
.ghost-task {
  @apply opacity-50 bg-blue-500/20 border-2 border-blue-400 border-dashed;
}

.chosen-task {
  @apply transform rotate-2 scale-105 shadow-2xl;
}

/* Button styles */
.btn-primary {
  @apply bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 backdrop-blur-sm;
}

/* Smooth transitions */
.kanban-column {
  transition: all 0.3s ease;
}

.column-content {
  transition: all 0.3s ease;
}

.task-card {
  transition: all 0.2s ease;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Scrollbar styling */
.kanban-board::-webkit-scrollbar {
  height: 8px;
}

.kanban-board::-webkit-scrollbar-track {
  @apply bg-white/10 rounded-full;
}

.kanban-board::-webkit-scrollbar-thumb {
  @apply bg-white/30 rounded-full hover:bg-white/50;
}
</style>