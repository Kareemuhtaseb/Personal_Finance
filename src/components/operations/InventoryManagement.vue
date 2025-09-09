<template>
  <div class="inventory-management">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-white">Inventory Management</h2>
      <button
        @click="emit('createItem')"
        class="btn-primary flex items-center gap-2"
      >
        <PlusIcon class="w-4 h-4" />
        Add Item
      </button>
    </div>

    <!-- Inventory Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="stat-card">
        <div class="stat-icon bg-blue-500/20">
          <CubeIcon class="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <p class="stat-value">{{ totalItems }}</p>
          <p class="stat-label">Total Items</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon bg-green-500/20">
          <CheckCircleIcon class="w-6 h-6 text-green-400" />
        </div>
        <div>
          <p class="stat-value">{{ inStockItems }}</p>
          <p class="stat-label">In Stock</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon bg-orange-500/20">
          <ExclamationTriangleIcon class="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <p class="stat-value">{{ lowStockItems }}</p>
          <p class="stat-label">Low Stock</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon bg-red-500/20">
          <XCircleIcon class="w-6 h-6 text-red-400" />
        </div>
        <div>
          <p class="stat-value">{{ outOfStockItems }}</p>
          <p class="stat-label">Out of Stock</p>
        </div>
      </div>
    </div>

    <!-- Inventory Filters -->
    <div class="mb-6">
      <div class="flex flex-wrap gap-4">
        <select
          v-model="stockFilter"
          class="filter-select"
        >
          <option value="">All Stock Levels</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
        
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search items..."
          class="filter-input"
        />
      </div>
    </div>

    <!-- Inventory Table -->
    <div class="inventory-table">
      <div class="table-header">
        <div class="table-cell">Item</div>
        <div class="table-cell">Quantity</div>
        <div class="table-cell">Unit Cost</div>
        <div class="table-cell">Total Value</div>
        <div class="table-cell">Status</div>
        <div class="table-cell">Actions</div>
      </div>
      
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="table-row"
      >
        <div class="table-cell">
          <div>
            <h4 class="font-medium text-white">{{ item.name }}</h4>
            <p v-if="item.description" class="text-sm text-white/70">{{ item.description }}</p>
          </div>
        </div>
        
        <div class="table-cell">
          <div class="flex items-center gap-2">
            <span class="text-white font-medium">{{ item.quantity }}</span>
            <span v-if="item.minStock > 0" class="text-xs text-white/60">
              (min: {{ item.minStock }})
            </span>
          </div>
        </div>
        
        <div class="table-cell">
          <span class="text-white font-medium">${{ (item.unitCost / 100).toFixed(2) }}</span>
        </div>
        
        <div class="table-cell">
          <span class="text-white font-medium">${{ ((item.quantity * item.unitCost) / 100).toFixed(2) }}</span>
        </div>
        
        <div class="table-cell">
          <span :class="getStockStatusClasses(item)" class="stock-status">
            {{ getStockStatus(item) }}
          </span>
        </div>
        
        <div class="table-cell">
          <div class="flex items-center gap-2">
            <button
              @click="editItem(item)"
              class="btn-secondary"
            >
              <PencilIcon class="w-4 h-4" />
            </button>
            <button
              @click="adjustStock(item)"
              class="btn-info"
            >
              <AdjustmentsHorizontalIcon class="w-4 h-4" />
            </button>
            <button
              @click="deleteItem(item)"
              class="btn-danger"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredItems.length === 0" class="text-center py-12">
      <CubeIcon class="w-16 h-16 text-white/40 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-white mb-2">No Items Found</h3>
      <p class="text-white/70 mb-4">Add your first inventory item to get started</p>
      <button
        @click="emit('createItem')"
        class="btn-primary"
      >
        Add Item
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOperationsStore, type Item } from '../../stores/operations'
import {
  PlusIcon,
  CubeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  PencilIcon,
  AdjustmentsHorizontalIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

const operationsStore = useOperationsStore()

// Emits
const emit = defineEmits<{
  createItem: []
  editItem: [item: Item]
}>()

// Reactive data
const stockFilter = ref('')
const searchQuery = ref('')

// Computed properties
const totalItems = computed(() => operationsStore.items.length)
const inStockItems = computed(() => operationsStore.items.filter(item => item.quantity > item.minStock).length)
const lowStockItems = computed(() => operationsStore.items.filter(item => item.quantity <= item.minStock && item.quantity > 0).length)
const outOfStockItems = computed(() => operationsStore.items.filter(item => item.quantity === 0).length)

const filteredItems = computed(() => {
  let items = operationsStore.items

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query))
    )
  }

  // Stock filter
  if (stockFilter.value) {
    switch (stockFilter.value) {
      case 'in-stock':
        items = items.filter(item => item.quantity > item.minStock)
        break
      case 'low-stock':
        items = items.filter(item => item.quantity <= item.minStock && item.quantity > 0)
        break
      case 'out-of-stock':
        items = items.filter(item => item.quantity === 0)
        break
    }
  }

  return items.sort((a, b) => a.name.localeCompare(b.name))
})

// Methods
const getStockStatus = (item: Item) => {
  if (item.quantity === 0) return 'Out of Stock'
  if (item.quantity <= item.minStock) return 'Low Stock'
  return 'In Stock'
}

const getStockStatusClasses = (item: Item) => {
  if (item.quantity === 0) return 'bg-red-500/20 text-red-400 border border-red-500/30'
  if (item.quantity <= item.minStock) return 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
  return 'bg-green-500/20 text-green-400 border border-green-500/30'
}

const editItem = (item: Item) => {
  emit('editItem', item)
}

const adjustStock = (item: Item) => {
  // TODO: Implement stock adjustment functionality
  console.log('Adjust stock for:', item)
}

const deleteItem = async (item: Item) => {
  if (confirm('Are you sure you want to delete this item?')) {
    await operationsStore.deleteItem(item.id)
  }
}

// Lifecycle
onMounted(async () => {
  await operationsStore.fetchItems()
})
</script>

<style scoped>
.inventory-management {
  @apply space-y-6;
}

.stat-card {
  @apply backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 flex items-center gap-4;
}

.stat-icon {
  @apply p-3 rounded-lg;
}

.stat-value {
  @apply text-2xl font-bold text-white;
}

.stat-label {
  @apply text-sm text-white/70;
}

.inventory-table {
  @apply backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl overflow-hidden;
}

.table-header {
  @apply grid grid-cols-6 gap-4 p-4 bg-white/5 border-b border-white/20;
}

.table-row {
  @apply grid grid-cols-6 gap-4 p-4 border-b border-white/10 hover:bg-white/5 transition-colors;
}

.table-cell {
  @apply flex items-center;
}

.stock-status {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}

.filter-select,
.filter-input {
  @apply bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm backdrop-blur-sm;
}

.filter-select:focus,
.filter-input:focus {
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

.btn-info {
  @apply bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 px-3 py-2 rounded-lg transition-all duration-300 backdrop-blur-sm border border-blue-500/30;
}

.btn-danger {
  @apply bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg transition-all duration-300 backdrop-blur-sm border border-red-500/30;
}
</style>
