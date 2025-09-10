<template>
  <div class="order-management">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-white">Order Management</h2>
      <button
        @click="emit('createOrder')"
        class="btn-primary flex items-center gap-2"
      >
        <PlusIcon class="w-4 h-4" />
        Create Order
      </button>
    </div>

    <!-- Order Filters -->
    <div class="mb-6">
      <div class="flex flex-wrap gap-4">
        <select
          v-model="statusFilter"
          class="filter-select"
        >
          <option value="">All Status</option>
          <option value="PAID">Paid</option>
          <option value="UNPAID">Unpaid</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        
        <select
          v-model="typeFilter"
          class="filter-select"
        >
          <option value="">All Types</option>
          <option value="DELIVERY">Delivery</option>
          <option value="PICKUP">Pickup</option>
        </select>
        
        <select
          v-model="priorityFilter"
          class="filter-select"
        >
          <option value="">All Priorities</option>
          <option value="URGENT">Urgent</option>
          <option value="NORMAL">Normal</option>
          <option value="LOW">Low</option>
        </select>
      </div>
    </div>

    <!-- Orders List -->
    <div class="space-y-4">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-card"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-white">{{ order.orderNumber }}</h3>
              <span :class="getStatusClasses(order.status)" class="status-badge">
                {{ order.status }}
              </span>
              <span :class="getPriorityClasses(order.priority)" class="priority-badge">
                {{ order.priority }}
              </span>
              <span :class="getTypeClasses(order.type)" class="type-badge">
                {{ order.type }}
              </span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-white/70">Amount:</span>
                <span class="text-white font-medium ml-2">${{ (order.amount / 100).toFixed(2) }}</span>
              </div>
              <div v-if="order.dueDate">
                <span class="text-white/70">Due Date:</span>
                <span class="text-white font-medium ml-2">{{ formatDate(order.dueDate) }}</span>
              </div>
              <div v-if="order.clientName">
                <span class="text-white/70">Client:</span>
                <span class="text-white font-medium ml-2">{{ order.clientName }}</span>
              </div>
            </div>
            
            <div v-if="order.description" class="mt-3">
              <p class="text-white/70 text-sm">{{ order.description }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <button
              @click="editOrder(order)"
              class="btn-secondary"
            >
              <PencilIcon class="w-4 h-4" />
            </button>
            <button
              v-if="order.status === 'UNPAID'"
              @click="markAsPaid(order)"
              class="btn-success"
            >
              <CheckIcon class="w-4 h-4" />
            </button>
            <button
              @click="deleteOrder(order)"
              class="btn-danger"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <!-- Order Items -->
        <div v-if="order.orderItems && order.orderItems.length > 0" class="mt-4 pt-4 border-t border-white/20">
          <h4 class="text-sm font-medium text-white/80 mb-2">Order Items:</h4>
          <div class="space-y-2">
            <div
              v-for="item in order.orderItems"
              :key="item.id"
              class="flex items-center justify-between text-sm bg-white/5 rounded-lg p-2"
            >
              <span class="text-white/80">{{ item.item.name }}</span>
              <div class="flex items-center gap-4">
                <span class="text-white/70">Qty: {{ item.quantity }}</span>
                <span class="text-white font-medium">${{ (item.unitPrice / 100).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredOrders.length === 0" class="text-center py-12">
      <DocumentTextIcon class="w-16 h-16 text-white/40 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-white mb-2">No Orders Found</h3>
      <p class="text-white/70 mb-4">Create your first order to get started</p>
      <button
        @click="emit('createOrder')"
        class="btn-primary"
      >
        Create Order
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOperationsStore, type Order } from '../../stores/operations'
import {
  PlusIcon,
  PencilIcon,
  CheckIcon,
  TrashIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'
import { format, parseISO } from 'date-fns'

const operationsStore = useOperationsStore()

// Emits
const emit = defineEmits<{
  createOrder: []
  editOrder: [order: Order]
}>()

// Reactive data
const statusFilter = ref('')
const typeFilter = ref('')
const priorityFilter = ref('')

// Computed properties
const filteredOrders = computed(() => {
  let orders = operationsStore.orders

  if (statusFilter.value) {
    orders = orders.filter(order => order.status === statusFilter.value)
  }
  
  if (typeFilter.value) {
    orders = orders.filter(order => order.type === typeFilter.value)
  }
  
  if (priorityFilter.value) {
    orders = orders.filter(order => order.priority === priorityFilter.value)
  }

  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

// Methods
const getStatusClasses = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-500/20 text-green-400 border border-green-500/30'
    case 'UNPAID':
      return 'bg-red-500/20 text-red-400 border border-red-500/30'
    case 'CANCELLED':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
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

const getTypeClasses = (type: string) => {
  switch (type) {
    case 'DELIVERY':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    case 'PICKUP':
      return 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
}

const formatDate = (dateString: string) => {
  return format(parseISO(dateString), 'MMM dd, yyyy')
}

const editOrder = (order: Order) => {
  emit('editOrder', order)
}

const markAsPaid = async (order: Order) => {
  if (confirm('Mark this order as paid?')) {
    await operationsStore.updateOrder(order.id, { status: 'PAID' })
  }
}

const deleteOrder = async (order: Order) => {
  if (confirm('Are you sure you want to delete this order?')) {
    await operationsStore.deleteOrder(order.id)
  }
}

// Lifecycle
onMounted(async () => {
  await operationsStore.fetchOrders()
})
</script>

<style scoped>
.order-management {
  @apply space-y-6;
}

.order-card {
  @apply backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300;
}

.order-card:hover {
  @apply transform translate-y-[-2px] shadow-2xl shadow-blue-500/20;
}

.status-badge,
.priority-badge,
.type-badge {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}

.filter-select {
  @apply bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm backdrop-blur-sm;
}

.filter-select:focus {
  @apply outline-none ring-2 ring-blue-500/50 border-blue-500/50;
}

.filter-select option {
  @apply bg-gray-800 text-white;
}

/* Button styles */
.btn-primary {
  @apply bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 backdrop-blur-sm;
}

.btn-secondary {
  @apply bg-white/10 hover:bg-white/20 text-white/80 hover:text-white px-3 py-2 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/20;
}

.btn-success {
  @apply bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 px-3 py-2 rounded-lg transition-all duration-300 backdrop-blur-sm border border-green-500/30;
}

.btn-danger {
  @apply bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg transition-all duration-300 backdrop-blur-sm border border-red-500/30;
}
</style>
