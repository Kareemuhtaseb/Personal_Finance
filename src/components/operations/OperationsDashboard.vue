<template>
  <div class="operations-dashboard p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Operations Dashboard</h1>
      <p class="text-gray-600">Track your orders, inventory, tasks, and workshops</p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Orders Summary -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Orders</p>
            <p class="text-2xl font-bold text-gray-900">{{ summary?.orders.total || 0 }}</p>
            <p class="text-sm text-red-600">{{ summary?.orders.unpaid || 0 }} unpaid</p>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
            <DocumentTextIcon class="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <!-- Inventory Summary -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Inventory Items</p>
            <p class="text-2xl font-bold text-gray-900">{{ summary?.inventory.total || 0 }}</p>
            <p class="text-sm text-orange-600">{{ summary?.inventory.lowStock || 0 }} low stock</p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <CubeIcon class="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <!-- Tasks Summary -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Tasks</p>
            <p class="text-2xl font-bold text-gray-900">{{ summary?.tasks.total || 0 }}</p>
            <p class="text-sm text-yellow-600">{{ summary?.tasks.pending || 0 }} pending</p>
          </div>
          <div class="p-3 bg-yellow-100 rounded-full">
            <CheckCircleIcon class="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>

      <!-- Workshops Summary -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Workshops</p>
            <p class="text-2xl font-bold text-gray-900">{{ summary?.workshops.total || 0 }}</p>
            <p class="text-sm text-gray-500">This month</p>
          </div>
          <div class="p-3 bg-purple-100 rounded-full">
            <AcademicCapIcon class="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Financial Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Monthly Income/Expenses -->
      <div class="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900">Monthly Financial Overview</h2>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="text-center">
            <p class="text-sm text-gray-600">Income</p>
            <p class="text-2xl font-bold text-green-600">${{ (summary?.monthly.income || 0).toFixed(2) }}</p>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-600">Expenses</p>
            <p class="text-2xl font-bold text-red-600">${{ (summary?.monthly.expenses || 0).toFixed(2) }}</p>
          </div>
        </div>

        <!-- Simple Chart Placeholder -->
        <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div class="text-center">
            <ChartBarIcon class="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p class="text-gray-500">Cost vs Income Chart</p>
            <p class="text-sm text-gray-400">Chart will be implemented here</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div class="space-y-3">
          <button
            @click="showCreateOrderModal = true"
            class="w-full flex items-center gap-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <PlusIcon class="w-5 h-5 text-blue-600" />
            <span class="font-medium text-blue-900">Create Order</span>
          </button>
          
          <button
            @click="showCreateTaskModal = true"
            class="w-full flex items-center gap-3 p-3 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            <PlusIcon class="w-5 h-5 text-yellow-600" />
            <span class="font-medium text-yellow-900">Add Task</span>
          </button>
          
          <button
            @click="showCreateWorkshopModal = true"
            class="w-full flex items-center gap-3 p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <PlusIcon class="w-5 h-5 text-purple-600" />
            <span class="font-medium text-purple-900">Schedule Workshop</span>
          </button>
          
          <button
            @click="showCreateItemModal = true"
            class="w-full flex items-center gap-3 p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <PlusIcon class="w-5 h-5 text-green-600" />
            <span class="font-medium text-green-900">Add Inventory</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Recent Orders -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <router-link
            to="/operations/orders"
            class="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View all
          </router-link>
        </div>
        <div class="space-y-3">
          <div
            v-for="order in recentOrders"
            :key="order.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <p class="font-medium text-gray-900">{{ order.orderNumber }}</p>
              <p class="text-sm text-gray-600">{{ order.description || 'No description' }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-gray-900">${{ (order.amount / 100).toFixed(2) }}</p>
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                  order.status === 'UNPAID' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                ]"
              >
                {{ order.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Low Stock Alerts -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
          <router-link
            to="/operations/inventory"
            class="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View all
          </router-link>
        </div>
        <div class="space-y-3">
          <div
            v-for="item in lowStockItems"
            :key="item.id"
            class="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
          >
            <div>
              <p class="font-medium text-gray-900">{{ item.name }}</p>
              <p class="text-sm text-gray-600">{{ item.description || 'No description' }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-orange-600">{{ item.quantity }} left</p>
              <p class="text-xs text-gray-500">Min: {{ item.minStock }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="border-b border-gray-200">
        <nav class="flex space-x-8 px-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>
      
      <div class="p-6">
        <!-- Orders Tab -->
        <div v-if="activeTab === 'orders'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Orders Management</h3>
            <button
              @click="showCreateOrderModal = true"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Create Order
            </button>
          </div>
          <!-- Orders list would go here -->
          <p class="text-gray-500">Orders management interface will be implemented here</p>
        </div>

        <!-- Inventory Tab -->
        <div v-if="activeTab === 'inventory'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Inventory Management</h3>
            <button
              @click="showCreateItemModal = true"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Item
            </button>
          </div>
          <!-- Inventory list would go here -->
          <p class="text-gray-500">Inventory management interface will be implemented here</p>
        </div>

        <!-- Tasks Tab -->
        <div v-if="activeTab === 'tasks'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Task Management</h3>
            <button
              @click="showCreateTaskModal = true"
              class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Task
            </button>
          </div>
          <!-- Tasks list would go here -->
          <p class="text-gray-500">Task management interface will be implemented here</p>
        </div>

        <!-- Workshops Tab -->
        <div v-if="activeTab === 'workshops'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Workshop Management</h3>
            <button
              @click="showCreateWorkshopModal = true"
              class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Schedule Workshop
            </button>
          </div>
          <!-- Workshops list would go here -->
          <p class="text-gray-500">Workshop management interface will be implemented here</p>
        </div>
      </div>
    </div>

    <!-- Modals would go here -->
    <!-- Create Order Modal -->
    <!-- Create Task Modal -->
    <!-- Create Workshop Modal -->
    <!-- Create Item Modal -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOperationsStore } from '../../stores/operations'
import {
  DocumentTextIcon,
  CubeIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'

const operationsStore = useOperationsStore()

// Reactive data
const activeTab = ref('orders')
const showCreateOrderModal = ref(false)
const showCreateTaskModal = ref(false)
const showCreateWorkshopModal = ref(false)
const showCreateItemModal = ref(false)

// Constants
const tabs = [
  { id: 'orders', name: 'Orders' },
  { id: 'inventory', name: 'Inventory' },
  { id: 'tasks', name: 'Tasks' },
  { id: 'workshops', name: 'Workshops' }
]

// Computed properties
const summary = computed(() => operationsStore.summary)
const recentOrders = computed(() => operationsStore.orders.slice(0, 5))
const lowStockItems = computed(() => operationsStore.lowStockItems.slice(0, 5))

// Lifecycle
onMounted(async () => {
  await operationsStore.fetchAllOperationsData()
})
</script>

<style scoped>
.operations-dashboard {
  background: #f8fafc;
}

/* Custom scrollbar */
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