<template>
  <div class="workshop-records">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-white">Workshop Records</h2>
      <button
        @click="emit('createWorkshop')"
        class="btn-primary flex items-center gap-2"
      >
        <PlusIcon class="w-4 h-4" />
        Schedule Workshop
      </button>
    </div>

    <!-- Workshop Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="stat-card">
        <div class="stat-icon bg-purple-500/20">
          <AcademicCapIcon class="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <p class="stat-value">{{ totalWorkshops }}</p>
          <p class="stat-label">Total Workshops</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon bg-blue-500/20">
          <CalendarIcon class="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <p class="stat-value">{{ thisMonthWorkshops }}</p>
          <p class="stat-label">This Month</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon bg-green-500/20">
          <CurrencyDollarIcon class="w-6 h-6 text-green-400" />
        </div>
        <div>
          <p class="stat-value">${{ totalWorkshopCosts.toFixed(2) }}</p>
          <p class="stat-label">Total Costs</p>
        </div>
      </div>
    </div>

    <!-- Workshop Filters -->
    <div class="mb-6">
      <div class="flex flex-wrap gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search workshops..."
          class="filter-input"
        />
        
        <select
          v-model="monthFilter"
          class="filter-select"
        >
          <option value="">All Months</option>
          <option v-for="month in months" :key="month.value" :value="month.value">
            {{ month.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Workshops List -->
    <div class="space-y-4">
      <div
        v-for="workshop in filteredWorkshops"
        :key="workshop.id"
        class="workshop-card"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-white">{{ workshop.title }}</h3>
              <span class="date-badge">
                {{ formatDate(workshop.date) }}
              </span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
              <div v-if="workshop.client">
                <span class="text-white/70">Client:</span>
                <span class="text-white font-medium ml-2">{{ workshop.client }}</span>
              </div>
              <div v-if="workshop.organization">
                <span class="text-white/70">Organization:</span>
                <span class="text-white font-medium ml-2">{{ workshop.organization }}</span>
              </div>
              <div v-if="workshop.location">
                <span class="text-white/70">Location:</span>
                <span class="text-white font-medium ml-2">{{ workshop.location }}</span>
              </div>
              <div v-if="workshop.workshopCosts && workshop.workshopCosts.length > 0">
                <span class="text-white/70">Total Costs:</span>
                <span class="text-white font-medium ml-2">
                  ${{ (workshop.workshopCosts.reduce((sum, cost) => sum + cost.amount, 0) / 100).toFixed(2) }}
                </span>
              </div>
            </div>
            
            <div v-if="workshop.notes" class="mt-3">
              <p class="text-white/70 text-sm">{{ workshop.notes }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <button
              @click="editWorkshop(workshop)"
              class="btn-secondary"
            >
              <PencilIcon class="w-4 h-4" />
            </button>
            <button
              @click="addWorkshopCost(workshop)"
              class="btn-info"
            >
              <CurrencyDollarIcon class="w-4 h-4" />
            </button>
            <button
              @click="deleteWorkshop(workshop)"
              class="btn-danger"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <!-- Workshop Costs -->
        <div v-if="workshop.workshopCosts && workshop.workshopCosts.length > 0" class="mt-4 pt-4 border-t border-white/20">
          <h4 class="text-sm font-medium text-white mb-2">Workshop Costs:</h4>
          <div class="space-y-2">
            <div
              v-for="cost in workshop.workshopCosts"
              :key="cost.id"
              class="flex items-center justify-between text-sm bg-white/10 border border-white/10 rounded-lg p-3"
            >
              <span class="text-white font-medium">{{ cost.description }}</span>
              <span class="text-white font-semibold">${{ (cost.amount / 100).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredWorkshops.length === 0" class="text-center py-12">
      <AcademicCapIcon class="w-16 h-16 text-white/40 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-white mb-2">No Workshops Found</h3>
      <p class="text-white/70 mb-4">Schedule your first workshop to get started</p>
      <button
        @click="emit('createWorkshop')"
        class="btn-primary"
      >
        Schedule Workshop
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOperationsStore, type Workshop } from '../../stores/operations'
import {
  PlusIcon,
  AcademicCapIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns'

const operationsStore = useOperationsStore()

// Emits
const emit = defineEmits<{
  createWorkshop: []
  editWorkshop: [workshop: Workshop]
}>()

// Reactive data
const searchQuery = ref('')
const monthFilter = ref('')

// Generate months for filter
const months = computed(() => {
  const months = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy')
    })
  }
  return months
})

// Computed properties
const totalWorkshops = computed(() => operationsStore.workshops.length)

const thisMonthWorkshops = computed(() => {
  const now = new Date()
  const startOfCurrentMonth = startOfMonth(now)
  const endOfCurrentMonth = endOfMonth(now)
  
  return operationsStore.workshops.filter(workshop => {
    const workshopDate = parseISO(workshop.date)
    return workshopDate >= startOfCurrentMonth && workshopDate <= endOfCurrentMonth
  }).length
})

const totalWorkshopCosts = computed(() => {
  return operationsStore.workshops.reduce((total, workshop) => {
    const workshopCosts = workshop.workshopCosts?.reduce((sum, cost) => sum + cost.amount, 0) || 0
    return total + workshopCosts
  }, 0) / 100
})

const filteredWorkshops = computed(() => {
  let workshops = operationsStore.workshops

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    workshops = workshops.filter(workshop => 
      workshop.title.toLowerCase().includes(query) ||
      (workshop.client && workshop.client.toLowerCase().includes(query)) ||
      (workshop.organization && workshop.organization.toLowerCase().includes(query)) ||
      (workshop.location && workshop.location.toLowerCase().includes(query))
    )
  }

  // Month filter
  if (monthFilter.value) {
    workshops = workshops.filter(workshop => {
      const workshopDate = parseISO(workshop.date)
      return format(workshopDate, 'yyyy-MM') === monthFilter.value
    })
  }

  return workshops.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// Methods
const formatDate = (dateString: string) => {
  return format(parseISO(dateString), 'MMM dd, yyyy')
}

const editWorkshop = (workshop: Workshop) => {
  emit('editWorkshop', workshop)
}

const addWorkshopCost = (workshop: Workshop) => {
  // TODO: Implement add workshop cost functionality
  console.log('Add cost to workshop:', workshop)
}

const deleteWorkshop = async (workshop: Workshop) => {
  if (confirm('Are you sure you want to delete this workshop?')) {
    await operationsStore.deleteWorkshop(workshop.id)
  }
}

// Lifecycle
onMounted(async () => {
  await operationsStore.fetchWorkshops()
})
</script>

<style scoped>
.workshop-records {
  @apply space-y-6;
}

.workshop-card {
  @apply backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300;
}

.workshop-card:hover {
  @apply transform translate-y-[-2px] shadow-2xl shadow-purple-500/20;
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

.date-badge {
  @apply bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-1 rounded-full text-xs font-medium;
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
