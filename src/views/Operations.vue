<template>
  <div class="operations-view min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <!-- Header -->
    <div class="backdrop-blur-xl bg-white/5 border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-3xl font-bold text-white">Operations Management</h1>
        <p class="text-white/70 mt-2">Track your orders, inventory, tasks, and workshops</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Orders Summary -->
        <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-2xl shadow-blue-500/20 p-6 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-white/80">Total Orders</p>
              <p class="text-2xl font-bold text-white">0</p>
              <p class="text-sm text-red-400">0 unpaid</p>
            </div>
            <div class="p-3 bg-blue-500/20 rounded-full backdrop-blur-sm">
              <DocumentTextIcon class="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <!-- Inventory Summary -->
        <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-2xl shadow-green-500/20 p-6 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-white/80">Inventory Items</p>
              <p class="text-2xl font-bold text-white">0</p>
              <p class="text-sm text-orange-400">0 low stock</p>
            </div>
            <div class="p-3 bg-green-500/20 rounded-full backdrop-blur-sm">
              <CubeIcon class="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <!-- Tasks Summary -->
        <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-2xl shadow-yellow-500/20 p-6 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-xl"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-white/80">Total Tasks</p>
              <p class="text-2xl font-bold text-white">0</p>
              <p class="text-sm text-yellow-400">0 pending</p>
            </div>
            <div class="p-3 bg-yellow-500/20 rounded-full backdrop-blur-sm">
              <CheckCircleIcon class="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <!-- Workshops Summary -->
        <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-2xl shadow-purple-500/20 p-6 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-white/80">Workshops</p>
              <p class="text-2xl font-bold text-white">0</p>
              <p class="text-sm text-white/60">This month</p>
            </div>
            <div class="p-3 bg-purple-500/20 rounded-full backdrop-blur-sm">
              <AcademicCapIcon class="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-2xl shadow-blue-500/20">
        <div class="border-b border-white/20">
          <nav class="flex space-x-8 px-6">
            <button
              v-for="tab in navigationTabs"
              :key="tab.id"
              @click="activeView = tab.id"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 relative overflow-hidden',
                activeView === tab.id
                  ? 'border-blue-400 text-blue-300'
                  : 'border-transparent text-white/70 hover:text-white hover:border-white/30'
              ]"
            >
              <!-- Active state background -->
              <div v-if="activeView === tab.id" class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-xl"></div>
              
              <!-- Hover shimmer effect -->
              <div class="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
                <div class="animate-shimmer absolute inset-0 rounded-t-xl"></div>
              </div>
              
              <div class="relative z-10 flex items-center">
                <component :is="tab.icon" class="w-5 h-5 inline-block mr-2" />
                {{ tab.name }}
              </div>
              
              <!-- Active indicator -->
              <div v-if="activeView === tab.id" class="absolute right-3 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </button>
          </nav>
        </div>
        
        <div class="p-6">
          <!-- Dashboard Tab -->
          <div v-if="activeView === 'dashboard'" class="space-y-6">
            <h2 class="text-xl font-semibold text-white">Operations Dashboard</h2>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Financial Overview -->
              <div class="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-xl"></div>
                <div class="relative z-10">
                  <h3 class="text-lg font-semibold text-white mb-4">Financial Overview</h3>
                  <div class="space-y-4">
                    <div class="flex justify-between">
                      <span class="text-white/70">Monthly Income</span>
                      <span class="font-semibold text-green-400">$0.00</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-white/70">Monthly Expenses</span>
                      <span class="font-semibold text-red-400">$0.00</span>
                    </div>
                    <div class="flex justify-between border-t border-white/20 pt-4">
                      <span class="text-white font-medium">Net Profit</span>
                      <span class="font-semibold text-blue-400">$0.00</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-xl"></div>
                <div class="relative z-10">
                  <h3 class="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div class="space-y-3">
                    <button @click="showCreateOrderModal = true" class="w-full flex items-center gap-3 p-3 text-left bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-all duration-300 backdrop-blur-sm">
                      <PlusIcon class="w-5 h-5 text-blue-400" />
                      <span class="font-medium text-blue-300">Create Order</span>
                    </button>
                    <button @click="showCreateTaskModal = true" class="w-full flex items-center gap-3 p-3 text-left bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-lg transition-all duration-300 backdrop-blur-sm">
                      <PlusIcon class="w-5 h-5 text-yellow-400" />
                      <span class="font-medium text-yellow-300">Add Task</span>
                    </button>
                    <button @click="showCreateWorkshopModal = true" class="w-full flex items-center gap-3 p-3 text-left bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-all duration-300 backdrop-blur-sm">
                      <PlusIcon class="w-5 h-5 text-purple-400" />
                      <span class="font-medium text-purple-300">Schedule Workshop</span>
                    </button>
                    <button @click="showCreateInventoryModal = true" class="w-full flex items-center gap-3 p-3 text-left bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg transition-all duration-300 backdrop-blur-sm">
                      <PlusIcon class="w-5 h-5 text-green-400" />
                      <span class="font-medium text-green-300">Add Inventory</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Kanban Tab -->
          <div v-else-if="activeView === 'kanban'" class="space-y-6">
            <KanbanBoard 
              @create-task="showCreateTaskModal = true" 
              @edit-task="handleEditTask" 
            />
          </div>

          <!-- Orders Tab -->
          <div v-else-if="activeView === 'orders'" class="space-y-6">
            <OrderManagement 
              @create-order="showCreateOrderModal = true" 
              @edit-order="handleEditOrder" 
            />
          </div>

          <!-- Inventory Tab -->
          <div v-else-if="activeView === 'inventory'" class="space-y-6">
            <InventoryManagement 
              @create-item="showCreateInventoryModal = true" 
              @edit-item="handleEditItem" 
            />
          </div>

          <!-- Workshops Tab -->
          <div v-else-if="activeView === 'workshops'" class="space-y-6">
            <WorkshopRecords 
              @create-workshop="showCreateWorkshopModal = true" 
              @edit-workshop="handleEditWorkshop" 
            />
          </div>

          <!-- Other Tabs -->
          <div v-else class="text-center py-12">
            <component :is="getTabIcon(activeView)" class="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-white mb-2">{{ getTabName(activeView) }}</h3>
            <p class="text-white/70">{{ getTabDescription(activeView) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Modal -->
    <TaskModal
      v-if="showCreateTaskModal"
      :task="editingTask"
      :orders="operationsStore.orders"
      :workshops="operationsStore.workshops"
      :items="operationsStore.items"
      @close="closeTaskModal"
      @save="handleTaskSave"
    />

    <!-- Order Modal -->
    <OrderModal
      v-if="showCreateOrderModal"
      :order="editingOrder"
      :items="operationsStore.items"
      @close="closeOrderModal"
      @save="handleOrderSave"
    />

    <!-- Workshop Modal -->
    <WorkshopModal
      v-if="showCreateWorkshopModal"
      :workshop="editingWorkshop"
      :orders="operationsStore.orders"
      @close="closeWorkshopModal"
      @save="handleWorkshopSave"
    />

    <!-- Inventory Modal -->
    <InventoryModal
      v-if="showCreateInventoryModal"
      :item="editingItem"
      @close="closeInventoryModal"
      @save="handleInventorySave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  DocumentTextIcon,
  CubeIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  ChartBarIcon,
  HomeIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'
import KanbanBoard from '@/components/operations/KanbanBoard.vue'
import OrderManagement from '@/components/operations/OrderManagement.vue'
import InventoryManagement from '@/components/operations/InventoryManagement.vue'
import WorkshopRecords from '@/components/operations/WorkshopRecords.vue'
import TaskModal from '@/components/operations/TaskModal.vue'
import OrderModal from '@/components/operations/OrderModal.vue'
import WorkshopModal from '@/components/operations/WorkshopModal.vue'
import InventoryModal from '@/components/operations/InventoryModal.vue'
import { useOperationsStore } from '@/stores/operations'

// Store
const operationsStore = useOperationsStore()

// Reactive data
const activeView = ref('dashboard')
const showCreateTaskModal = ref(false)
const showCreateOrderModal = ref(false)
const showCreateWorkshopModal = ref(false)
const showCreateInventoryModal = ref(false)
const editingTask = ref<any>(null)
const editingWorkshop = ref<any>(null)
const editingOrder = ref<any>(null)
const editingItem = ref<any>(null)

// Navigation tabs
const navigationTabs = [
  { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
  { id: 'kanban', name: 'Tasks', icon: CheckCircleIcon },
  { id: 'orders', name: 'Orders', icon: DocumentTextIcon },
  { id: 'inventory', name: 'Inventory', icon: CubeIcon },
  { id: 'workshops', name: 'Workshops', icon: AcademicCapIcon },
  { id: 'analytics', name: 'Analytics', icon: ChartBarIcon }
]

// Methods
const getTabIcon = (tabId: string) => {
  const tab = navigationTabs.find(t => t.id === tabId)
  return tab?.icon || DocumentTextIcon
}

const getTabName = (tabId: string) => {
  const tab = navigationTabs.find(t => t.id === tabId)
  return tab?.name || 'Unknown'
}

const getTabDescription = (tabId: string) => {
  const descriptions: Record<string, string> = {
    kanban: 'Drag and drop task management with Kanban board',
    orders: 'Track paid/unpaid orders, amounts, and due dates',
    inventory: 'Manage stock levels, costs, and low stock alerts',
    workshops: 'Schedule and manage workshop records with client info',
    analytics: 'Cost vs income analytics with charts and visualizations'
  }
  return descriptions[tabId] || 'Feature coming soon'
}

// Task handling
const handleEditTask = (task: any) => {
  editingTask.value = task
  showCreateTaskModal.value = true
}

const closeTaskModal = () => {
  showCreateTaskModal.value = false
  editingTask.value = null
}

const handleTaskSave = async (taskData: any) => {
  try {
    if (editingTask.value) {
      await operationsStore.updateTask(editingTask.value.id, taskData)
    } else {
      await operationsStore.createTask(taskData)
    }
    closeTaskModal()
  } catch (error) {
    console.error('Error saving task:', error)
  }
}

// Order handling
const handleEditOrder = (order: any) => {
  editingOrder.value = order
  showCreateOrderModal.value = true
}

const closeOrderModal = () => {
  showCreateOrderModal.value = false
  editingOrder.value = null
}

const handleOrderSave = async (orderData: any) => {
  try {
    if (editingOrder.value) {
      await operationsStore.updateOrder(editingOrder.value.id, orderData)
    } else {
      await operationsStore.createOrder(orderData)
    }
    closeOrderModal()
  } catch (error) {
    console.error('Error saving order:', error)
  }
}

// Workshop handling
const handleEditWorkshop = (workshop: any) => {
  editingWorkshop.value = workshop
  showCreateWorkshopModal.value = true
}

const closeWorkshopModal = () => {
  showCreateWorkshopModal.value = false
  editingWorkshop.value = null
}

const handleWorkshopSave = async (workshopData: any) => {
  try {
    if (editingWorkshop.value) {
      await operationsStore.updateWorkshop(editingWorkshop.value.id, workshopData)
    } else {
      await operationsStore.createWorkshop(workshopData)
    }
    closeWorkshopModal()
  } catch (error) {
    console.error('Error saving workshop:', error)
  }
}

// Inventory handling
const handleEditItem = (item: any) => {
  editingItem.value = item
  showCreateInventoryModal.value = true
}

const closeInventoryModal = () => {
  showCreateInventoryModal.value = false
  editingItem.value = null
}

const handleInventorySave = async (itemData: any) => {
  try {
    if (editingItem.value) {
      await operationsStore.updateItem(editingItem.value.id, itemData)
    } else {
      await operationsStore.createItem(itemData)
    }
    closeInventoryModal()
  } catch (error) {
    console.error('Error saving item:', error)
  }
}

// Lifecycle
onMounted(async () => {
  await operationsStore.fetchAllOperationsData()
})
</script>

<style scoped>
.operations-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}

/* Smooth transitions */
.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

/* Shimmer animation */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  animation: shimmer 2s infinite;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>