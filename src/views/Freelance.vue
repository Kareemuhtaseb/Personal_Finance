<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { apiService, type FreelanceProject, type WorkSession, type FreelanceSummary, type Account, type Category } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

// Reactive data
const projects = ref<FreelanceProject[]>([])
const workSessions = ref<WorkSession[]>([])
const summary = ref<FreelanceSummary | null>(null)
const accounts = ref<Account[]>([])
const categories = ref<Category[]>([])
const loading = ref(false)
const error = ref('')

// UI state
const showNewProjectModal = ref(false)
const showPaymentModal = ref(false)
const showWorkSessionModal = ref(false)
const showManualWorkModal = ref(false)
const selectedProject = ref<FreelanceProject | null>(null)
const activeSession = ref<WorkSession | null>(null)

// Form data
const newProject = ref({
  name: '',
  client: '',
  hourlyRate: 0,
  paymentType: 'HOURLY_RATE' as 'HOURLY_RATE' | 'REFERENCE_ONLY'
})

const paymentData = ref({
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  accountId: '',
  categoryId: ''
})

const workSessionData = ref({
  description: '',
  breakDuration: 0
})

const manualWorkData = ref({
  projectId: '',
  description: '',
  workHours: 0,
  date: new Date().toISOString().split('T')[0],
  isPaid: false
})

// New UI state for enhanced features
const showPaymentDialog = ref(false)
const showBulkPaymentModal = ref(false)
const selectedSessions = ref<string[]>([])
const selectedProjectFilter = ref<string>('')
const selectedProjectForSessions = ref<string>('')
const paymentDialogData = ref({
  sessionId: '',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  accountId: '',
  categoryId: ''
})

const bulkPaymentData = ref({
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  accountId: '',
  categoryId: ''
})

// Computed properties
const activeProjects = computed(() => projects.value.filter(p => p.status === 'ACTIVE'))
const completedProjects = computed(() => projects.value.filter(p => p.status === 'COMPLETED'))
const totalEarnings = computed(() => projects.value.reduce((sum, p) => sum + p.totalAmount, 0))
const totalHours = computed(() => projects.value.reduce((sum, p) => sum + p.totalHours, 0))
const unpaidHours = computed(() => projects.value.reduce((sum, p) => sum + p.unpaidHours, 0))

// Filtered work sessions based on selected project with sorting
const filteredWorkSessions = computed(() => {
  let sessions = workSessions.value
  
  // Filter by selected project if one is selected
  if (selectedProjectForSessions.value) {
    sessions = sessions.filter(session => session.projectId === selectedProjectForSessions.value)
  }
  
  // Sort: unpaid sessions first, then by date (newest first)
  return sessions.sort((a, b) => {
    // First sort by payment status (unpaid first)
    if (a.isPaid !== b.isPaid) {
      return a.isPaid ? 1 : -1
    }
    
    // Then sort by date (newest first)
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  })
})

// Unpaid sessions for bulk payment
const unpaidSessions = computed(() => {
  return filteredWorkSessions.value.filter(session => !session.isPaid && session.endTime)
})

// Methods
const loadData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const [projectsRes, sessionsRes, summaryRes, accountsRes, categoriesRes] = await Promise.all([
      apiService.getProjects(),
      apiService.getWorkSessions(),
      apiService.getFreelanceSummary(),
      apiService.getAccounts(),
      apiService.getCategories()
    ])
    
    projects.value = projectsRes.data.data || []
    workSessions.value = sessionsRes.data.data || []
    summary.value = summaryRes.data.data || null
    accounts.value = accountsRes.data.data || []
    categories.value = categoriesRes.data.data || []
    
    // Find active session
    activeSession.value = workSessions.value.find(s => !s.endTime) || null
    
  } catch (err: any) {
    error.value = err.message || 'Failed to load data'
    console.error('Error loading freelance data:', err)
  } finally {
    loading.value = false
  }
}

const createProject = async () => {
  try {
    if (!newProject.value.name || !newProject.value.client || newProject.value.hourlyRate <= 0) {
      error.value = 'Please fill in all required fields'
      return
    }
    
    await apiService.createProject(newProject.value)
    await loadData()
    showNewProjectModal.value = false
    newProject.value = { name: '', client: '', hourlyRate: 0, paymentType: 'HOURLY_RATE' }
    error.value = ''
  } catch (err: any) {
    error.value = err.message || 'Failed to create project'
  }
}

const startWorkSession = async (project: FreelanceProject) => {
  try {
    if (activeSession.value) {
      error.value = 'Please end the current work session before starting a new one'
      return
    }
    
    await apiService.startWorkSession({
      projectId: project.id,
      description: workSessionData.value.description
    })
    
    await loadData()
    workSessionData.value = { description: '', breakDuration: 0 }
    error.value = ''
  } catch (err: any) {
    error.value = err.message || 'Failed to start work session'
  }
}

const endWorkSession = async () => {
  try {
    if (!activeSession.value) return
    
    await apiService.endWorkSession(activeSession.value.id, {
      breakDuration: workSessionData.value.breakDuration
    })
    
    await loadData()
    workSessionData.value = { description: '', breakDuration: 0 }
    error.value = ''
  } catch (err: any) {
    error.value = err.message || 'Failed to end work session'
  }
}

const createManualWorkSession = async () => {
  try {
    if (!manualWorkData.value.projectId || manualWorkData.value.workHours <= 0) {
      error.value = 'Please select a project and enter valid work hours'
      return
    }
    
    await apiService.createManualWorkSession({
      projectId: manualWorkData.value.projectId,
      description: manualWorkData.value.description,
      workHours: manualWorkData.value.workHours,
      date: manualWorkData.value.date,
      isPaid: manualWorkData.value.isPaid
    })
    
    await loadData()
    showManualWorkModal.value = false
    manualWorkData.value = {
      projectId: '',
      description: '',
      workHours: 0,
      date: new Date().toISOString().split('T')[0],
      isPaid: false
    }
    error.value = ''
    
    // Show success message
    alert('Work session created successfully! Check the Income section to see the transaction.')
  } catch (err: any) {
    error.value = err.message || 'Failed to create manual work session'
  }
}

const toggleSessionPayment = async (session: WorkSession) => {
  try {
    // If project is not hourly rate based, show payment dialog
    if (session.project.paymentType === 'REFERENCE_ONLY' && !session.isPaid) {
      paymentDialogData.value = {
        sessionId: session.id,
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        accountId: '',
        categoryId: ''
      }
      showPaymentDialog.value = true
      return
    }
    
    await apiService.updateWorkSession(session.id, {
      isPaid: !session.isPaid
    })
    await loadData()
    
    // Show success message
    if (!session.isPaid) {
      alert('Work session marked as paid! Check the Income section to see the transaction.')
    } else {
      alert('Work session marked as unpaid. Income transaction removed.')
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to update session payment status'
  }
}

const processCustomPayment = async () => {
  try {
    if (!paymentDialogData.value.amount || paymentDialogData.value.amount <= 0) {
      error.value = 'Please enter a valid payment amount'
      return
    }
    
    await apiService.updateWorkSession(paymentDialogData.value.sessionId, {
      isPaid: true,
      customAmount: paymentDialogData.value.amount
    })
    await loadData()
    showPaymentDialog.value = false
    error.value = ''
    alert('Work session marked as paid with custom amount! Check the Income section to see the transaction.')
  } catch (err: any) {
    error.value = err.message || 'Failed to process payment'
  }
}

const toggleSessionSelection = (sessionId: string) => {
  const index = selectedSessions.value.indexOf(sessionId)
  if (index > -1) {
    selectedSessions.value.splice(index, 1)
  } else {
    selectedSessions.value.push(sessionId)
  }
}

const clearProjectSelection = () => {
  selectedProjectForSessions.value = ''
}

const processBulkPayment = async () => {
  try {
    if (selectedSessions.value.length === 0) {
      error.value = 'Please select at least one work session'
      return
    }
    
    if (!bulkPaymentData.value.amount || bulkPaymentData.value.amount <= 0) {
      error.value = 'Please enter a valid payment amount'
      return
    }
    
    await apiService.bulkMarkSessionsPaid({
      sessionIds: selectedSessions.value,
      amount: bulkPaymentData.value.amount,
      date: bulkPaymentData.value.date,
      accountId: bulkPaymentData.value.accountId || undefined,
      categoryId: bulkPaymentData.value.categoryId || undefined
    })
    
    await loadData()
    showBulkPaymentModal.value = false
    selectedSessions.value = []
    error.value = ''
    alert(`${selectedSessions.value.length} work sessions marked as paid! Check the Income section to see the transaction.`)
  } catch (err: any) {
    error.value = err.message || 'Failed to process bulk payment'
  }
}

const recordPayment = async () => {
  try {
    if (!selectedProject.value || paymentData.value.amount <= 0) {
      error.value = 'Please select a project and enter a valid amount'
      return
    }
    
    await apiService.markPaymentReceived(selectedProject.value.id, paymentData.value)
    await loadData()
    showPaymentModal.value = false
    paymentData.value = { amount: 0, date: new Date().toISOString().split('T')[0], accountId: '', categoryId: '' }
    selectedProject.value = null
    error.value = ''
  } catch (err: any) {
    error.value = err.message || 'Failed to record payment'
  }
}

const updateProjectStatus = async (project: FreelanceProject, status: 'ACTIVE' | 'COMPLETED' | 'PAUSED') => {
  try {
    await apiService.updateProject(project.id, { status })
    await loadData()
  } catch (err: any) {
    error.value = err.message || 'Failed to update project status'
  }
}

const deleteProject = async (project: FreelanceProject) => {
  if (!confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
    return
  }
  
  try {
    await apiService.deleteProject(project.id)
    await loadData()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete project'
  }
}

const formatDuration = (hours: number) => {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  return `${wholeHours}h ${minutes}m`
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-premium">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-premium-large">Freelance Management</h1>
        <p class="mt-2 text-lg text-premium-muted">
          Track projects, time, and manage payments
        </p>
      </div>
      
      <div class="mt-4 sm:mt-0 space-x-3">
        <button 
          @click="showNewProjectModal = true"
          class="btn-success inline-flex items-center"
        >
          + New Project
        </button>
        <button 
          @click="showManualWorkModal = true"
          class="btn-purple inline-flex items-center"
        >
          + Add Hours
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="backdrop-blur-xl bg-red-500/20 border border-red-500/30 rounded-2xl p-4">
      <p class="text-red-200">{{ error }}</p>
    </div>

    <!-- Summary Cards - Using Global Theme -->
    <div class="grid-premium-4">
      <div class="kpi-card rounded-xl shadow-green-500/20 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-premium-subtle text-xs">Active Projects</p>
            <p class="text-premium-small">{{ activeProjects.length }}</p>
          </div>
          <div class="w-8 h-8 flex items-center justify-center">
            <svg class="icon-premium-sm text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="kpi-card rounded-xl shadow-blue-500/20 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-premium-subtle text-xs">Total Hours</p>
            <p class="text-premium-small">{{ formatDuration(totalHours) }}</p>
          </div>
          <div class="w-8 h-8 flex items-center justify-center">
            <svg class="icon-premium-sm text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="kpi-card rounded-xl shadow-yellow-500/20 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-premium-subtle text-xs">Unpaid Hours</p>
            <p class="text-premium-small">{{ formatDuration(unpaidHours) }}</p>
          </div>
          <div class="w-8 h-8 flex items-center justify-center">
            <svg class="icon-premium-sm text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="kpi-card rounded-xl shadow-purple-500/20 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-premium-subtle text-xs">Total Earnings</p>
            <p class="text-premium-small">{{ formatCurrency(totalEarnings) }}</p>
          </div>
          <div class="w-8 h-8 flex items-center justify-center">
            <svg class="icon-premium-sm text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Work Session -->
    <div v-if="activeSession" class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-orange-500/20 p-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-bold text-white">Active Work Session</h3>
        <button 
          @click="showWorkSessionModal = true"
          class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors"
        >
          End Session
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <p class="text-white/70 text-sm">Project</p>
          <p class="text-lg font-semibold text-white">{{ activeSession.project.name }}</p>
        </div>
        <div>
          <p class="text-white/70 text-sm">Client</p>
          <p class="text-lg font-semibold text-white">{{ activeSession.project.client }}</p>
        </div>
        <div>
          <p class="text-white/70 text-sm">Started</p>
          <p class="text-lg font-semibold text-white">{{ formatDateTime(activeSession.startTime) }}</p>
        </div>
      </div>
    </div>

    <!-- Projects Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left Column: Projects -->
      <div class="space-y-8">
      <!-- Active Projects -->
        <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-green-500/20 p-6 relative overflow-hidden">
        <!-- Enhanced background effects -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/8 to-white/4 rounded-3xl"></div>
        <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent rounded-3xl"></div>
        
        <!-- Animated border gradient -->
        <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 opacity-50"></div>
        <div class="absolute inset-[1px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-3xl"></div>
        
        
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-white">
              Active Projects
            </h3>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-white/60 font-medium">{{ activeProjects.length }} Active</span>
            </div>
          </div>
          
          <div v-if="activeProjects.length === 0" class="text-center py-12">
            <div class="w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p class="text-white/70 text-lg">No active projects</p>
            <p class="text-white/50 text-sm mt-1">Create a new project to get started</p>
        </div>
        
        <div v-else class="space-y-4">
          <div
              v-for="(project, index) in activeProjects"
            :key="project.id"
              @click="selectedProjectForSessions = project.id"
              class="p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 relative overflow-hidden group animate-fade-in-scale cursor-pointer"
              :class="{ 'ring-2 ring-green-400/50 bg-green-500/10': selectedProjectForSessions === project.id }"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <!-- Project card background effects -->
              <div class="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent rounded-2xl"></div>
              
              <!-- Hover shimmer effect -->
              <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div class="animate-shimmer absolute inset-0 rounded-2xl"></div>
              </div>
              
              <div class="relative z-10">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h4 class="text-lg font-semibold text-white mb-1 group-hover:text-green-200 transition-colors duration-300">{{ project.name }}</h4>
                    <p class="text-blue-400 text-sm">{{ project.client }}</p>
                  </div>
                  <div class="flex flex-wrap gap-2">
                <button 
                  @click="startWorkSession(project)"
                  :disabled="!!activeSession"
                      class="px-3 py-1.5 bg-green-500/80 hover:bg-green-500 disabled:bg-gray-500/50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                >
                  Start Work
                </button>
                <button 
                  @click="updateProjectStatus(project, 'COMPLETED')"
                      class="px-3 py-1.5 bg-blue-500/80 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Complete
                </button>
                <button 
                  @click="deleteProject(project)"
                      class="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Delete
                </button>
              </div>
            </div>
            
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Rate:</span>
                    <span class="font-semibold text-white">{{ formatCurrency(project.hourlyRate) }}/h</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Payment:</span>
                    <span class="font-semibold text-white">{{ project.paymentType === 'HOURLY_RATE' ? 'Hourly' : 'Custom' }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Total Hours:</span>
                    <span class="font-semibold text-white">{{ formatDuration(project.totalHours || 0) }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Paid Hours:</span>
                    <span class="font-semibold text-green-400">{{ formatDuration(project.paidHours || 0) }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Unpaid Hours:</span>
                    <span class="font-semibold text-yellow-400">{{ formatDuration(project.unpaidHours || 0) }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Total Amount:</span>
                    <span class="font-semibold text-white">{{ formatCurrency(project.totalAmount || 0) }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Status:</span>
                    <span class="font-semibold text-green-400">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Finished Projects -->
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-blue-500/20 p-6 relative overflow-hidden">
        <!-- Enhanced background effects -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/8 to-white/4 rounded-3xl"></div>
        <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent rounded-3xl"></div>
        
        <!-- Animated border gradient -->
        <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-50"></div>
        <div class="absolute inset-[1px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-3xl"></div>
        
        
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-white">
              Finished Projects
            </h3>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-white/60 font-medium">{{ completedProjects.length }} Completed</span>
            </div>
          </div>
          
          <div v-if="completedProjects.length === 0" class="text-center py-12">
            <div class="w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-white/70 text-lg">No completed projects</p>
            <p class="text-white/50 text-sm mt-1">Complete some projects to see them here</p>
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="(project, index) in completedProjects"
              :key="project.id"
              @click="selectedProjectForSessions = project.id"
              class="p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 relative overflow-hidden group animate-fade-in-scale cursor-pointer"
              :class="{ 'ring-2 ring-blue-400/50 bg-blue-500/10': selectedProjectForSessions === project.id }"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <!-- Project card background effects -->
              <div class="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent rounded-2xl"></div>
              
              <!-- Hover shimmer effect -->
              <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div class="animate-shimmer absolute inset-0 rounded-2xl"></div>
              </div>
              
              <div class="relative z-10">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h4 class="text-lg font-semibold text-white mb-1 group-hover:text-blue-200 transition-colors duration-300">{{ project.name }}</h4>
                    <p class="text-blue-400 text-sm">{{ project.client }}</p>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button 
                      @click="updateProjectStatus(project, 'ACTIVE')"
                      class="px-3 py-1.5 bg-green-500/80 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      Reactivate
                    </button>
                    <button 
                      @click="deleteProject(project)"
                      class="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Rate:</span>
                    <span class="font-semibold text-white">{{ formatCurrency(project.hourlyRate) }}/h</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Payment:</span>
                    <span class="font-semibold text-white">{{ project.paymentType === 'HOURLY_RATE' ? 'Hourly' : 'Custom' }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Total Hours:</span>
                    <span class="font-semibold text-white">{{ formatDuration(project.totalHours || 0) }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Paid Hours:</span>
                    <span class="font-semibold text-green-400">{{ formatDuration(project.paidHours || 0) }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Unpaid Hours:</span>
                    <span class="font-semibold text-yellow-400">{{ formatDuration(project.unpaidHours || 0) }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Total Amount:</span>
                    <span class="font-semibold text-white">{{ formatCurrency(project.totalAmount || 0) }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Status:</span>
                    <span class="font-semibold text-blue-400">Completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <!-- Right Column: Work Sessions -->
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-blue-500/20 p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <h3 class="text-2xl font-bold text-white">Work Sessions</h3>
            <div v-if="selectedProjectForSessions" class="flex items-center space-x-2">
              <span class="text-sm text-white/70">Filtered by:</span>
              <span class="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-lg border border-blue-400/30">
                {{ projects.find(p => p.id === selectedProjectForSessions)?.name || 'Unknown Project' }}
              </span>
              <button 
                @click="selectedProjectForSessions = ''"
                class="p-1 text-white/60 hover:text-white transition-colors"
                title="Clear filter"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <button 
              v-if="unpaidSessions.length > 0"
              @click="showBulkPaymentModal = true"
              class="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors"
            >
              Bulk Pay ({{ selectedSessions.length }})
            </button>
          </div>
        </div>
        
        <div v-if="filteredWorkSessions.length === 0" class="text-center py-8">
          <div class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-white/70 text-lg">No work sessions recorded</p>
          <p class="text-white/50 text-sm mt-1">
            {{ selectedProjectForSessions ? 'for the selected project' : 'Start working on a project to see sessions here' }}
          </p>
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="session in filteredWorkSessions"
            :key="session.id"
            class="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-3">
                <input 
                  v-if="!session.isPaid && session.endTime"
                  type="checkbox" 
                  :checked="selectedSessions.includes(session.id)"
                  @change="toggleSessionSelection(session.id)"
                  class="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                />
                <div>
                  <p class="text-lg font-semibold text-white">{{ session.project.name }}</p>
                  <p class="text-sm text-white/70">{{ session.project.client }}</p>
                  <p class="text-xs text-white/50">
                    Payment: {{ session.project.paymentType === 'HOURLY_RATE' ? 'Hourly Rate' : 'Custom Amount' }}
                  </p>
                </div>
              </div>
              <button 
                @click="toggleSessionPayment(session)"
                :class="[
                  'px-3 py-1 text-sm rounded-lg transition-colors',
                  session.isPaid 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                ]"
              >
                {{ session.isPaid ? 'Paid' : 'Unpaid' }}
              </button>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-white/70">Duration:</span>
                <span class="ml-1 font-semibold text-white">
                  {{ session.workHours ? formatDuration(Number(session.workHours)) : 'In Progress' }}
                </span>
              </div>
              <div>
                <span class="text-white/70">Date:</span>
                <span class="ml-1 font-semibold text-white">{{ formatDate(session.startTime) }}</span>
              </div>
              <div v-if="session.description" class="col-span-2">
                <span class="text-white/70">Description:</span>
                <span class="ml-1 font-semibold text-white">{{ session.description || 'No description' }}</span>
              </div>
              <div v-if="session.customAmount" class="col-span-2">
                <span class="text-white/70">Custom Amount:</span>
                <span class="ml-1 font-semibold text-white">{{ formatCurrency(session.customAmount / 100) }}</span>
              </div>
              <div v-if="session.project.paymentType === 'HOURLY_RATE' && session.workHours" class="col-span-2">
                <span class="text-white/70">Calculated Amount:</span>
                <span class="ml-1 font-semibold text-white">{{ formatCurrency(Number(session.workHours) * (session.project as any).hourlyRate) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Project Modal -->
    <div v-if="showNewProjectModal" class="modal-backdrop">
      <div class="modal-content">
        <h3 class="text-2xl font-bold text-white mb-6">Create New Project</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-white/70 text-sm mb-2">Project Name</label>
            <input 
              v-model="newProject.name"
              type="text" 
              class="input-premium"
              placeholder="Enter project name"
            />
          </div>
          
          <div>
            <label class="block text-white/70 text-sm mb-2">Client</label>
            <input 
              v-model="newProject.client"
              type="text" 
              class="input-premium"
              placeholder="Enter client name"
            />
          </div>
          
          <div>
            <label class="block text-white/70 text-sm mb-2">Hourly Rate ($)</label>
            <input 
              v-model.number="newProject.hourlyRate"
              type="number" 
              step="0.01"
              class="input-premium"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label class="block text-white/70 text-sm mb-2">Payment Type</label>
            <select 
              v-model="newProject.paymentType"
              class="select-premium"
            >
              <option value="" disabled>Select Payment Type</option>
              <option value="HOURLY_RATE">Hourly Rate Payment</option>
              <option value="REFERENCE_ONLY">Reference Only (Custom Amounts)</option>
            </select>
            <p class="text-white/50 text-xs mt-1">
              {{ newProject.paymentType === 'HOURLY_RATE' 
                ? 'Payment will be calculated automatically based on hours worked' 
                : 'Hourly rate is for reference only, you\'ll set custom amounts when marking sessions as paid' }}
            </p>
          </div>
        </div>
        
        <div class="flex space-x-3 mt-6">
          <button 
            @click="createProject"
            class="btn-success flex-1"
          >
            Create Project
          </button>
          <button 
            @click="showNewProjectModal = false"
            class="btn-primary flex-1 bg-gray-500 hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4">
        <h3 class="text-2xl font-bold text-white mb-6">Record Payment</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-white/70 text-sm mb-2">Project</label>
            <select 
              v-model="selectedProject"
              class="select-premium"
            >
              <option :value="null" disabled>Select a project</option>
              <option v-for="project in projects" :key="project.id" :value="project">
                {{ project.name }} - {{ project.client }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-white/70 text-sm mb-2">Amount ($)</label>
            <input 
              v-model.number="paymentData.amount"
              type="number" 
              step="0.01"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label class="block text-white/70 text-sm mb-2">Date</label>
            <input 
              v-model="paymentData.date"
              type="date" 
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-white/70 text-sm mb-2">Account</label>
            <select 
              v-model="paymentData.accountId"
              class="select-premium"
            >
              <option value="" disabled>Select an account</option>
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="flex space-x-3 mt-6">
          <button 
            @click="recordPayment"
            class="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
          >
            Record Payment
          </button>
          <button 
            @click="showPaymentModal = false"
            class="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- End Work Session Modal -->
    <div v-if="showWorkSessionModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4">
        <h3 class="text-2xl font-bold text-white mb-6">End Work Session</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-white/70 text-sm mb-2">Break Duration (minutes)</label>
            <input 
              v-model.number="workSessionData.breakDuration"
              type="number" 
              min="0"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
              placeholder="0"
            />
          </div>
        </div>
        
        <div class="flex space-x-3 mt-6">
          <button 
            @click="endWorkSession"
            class="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
          >
            End Session
          </button>
          <button 
            @click="showWorkSessionModal = false"
            class="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Manual Work Session Modal -->
    <div v-if="showManualWorkModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4">
        <h3 class="text-2xl font-bold text-white mb-6">Add Manual Work Hours</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-white/70 text-sm mb-2">Project</label>
            <select 
              v-model="manualWorkData.projectId"
              class="select-premium"
            >
              <option value="" disabled>Select a project</option>
              <option v-for="project in activeProjects" :key="project.id" :value="project.id">
                {{ project.name }} - {{ project.client }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-white/70 text-sm mb-2">Work Hours</label>
            <input 
              v-model.number="manualWorkData.workHours"
              type="number" 
              step="0.25"
              min="0"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label class="block text-white/70 text-sm mb-2">Date</label>
            <input 
              v-model="manualWorkData.date"
              type="date" 
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-white/70 text-sm mb-2">Description (Optional)</label>
            <input 
              v-model="manualWorkData.description"
              type="text" 
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
              placeholder="What did you work on?"
            />
          </div>
          
          <div class="flex items-center space-x-3">
            <input 
              v-model="manualWorkData.isPaid"
              type="checkbox" 
              id="isPaid"
              class="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label for="isPaid" class="text-white/70 text-sm">Mark as paid (creates income transaction)</label>
          </div>
        </div>
        
        <div class="flex space-x-3 mt-6">
          <button 
            @click="createManualWorkSession"
            class="flex-1 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-colors"
          >
            Add Hours
          </button>
          <button 
            @click="showManualWorkModal = false"
            class="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Custom Payment Dialog -->
    <div v-if="showPaymentDialog" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4">
        <h3 class="text-2xl font-bold text-white mb-6">Set Payment Amount</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-white/70 text-sm mb-2">Payment Amount ($)</label>
            <input 
              v-model.number="paymentDialogData.amount"
              type="number" 
              step="0.01"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label class="block text-white/70 text-sm mb-2">Date</label>
            <input 
              v-model="paymentDialogData.date"
              type="date" 
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-white/70 text-sm mb-2">Account</label>
            <select 
              v-model="paymentDialogData.accountId"
              class="select-premium"
            >
              <option value="" disabled>Select an account</option>
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="flex space-x-3 mt-6">
          <button 
            @click="processCustomPayment"
            class="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
          >
            Mark as Paid
          </button>
          <button 
            @click="showPaymentDialog = false"
            class="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Payment Modal -->
    <div v-if="showBulkPaymentModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4">
        <h3 class="text-2xl font-bold text-white mb-6">Bulk Payment</h3>
        
        <div class="mb-4">
          <p class="text-white/70 text-sm">Selected Sessions: {{ selectedSessions.length }}</p>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-white/70 text-sm mb-2">Total Payment Amount ($)</label>
            <input 
              v-model.number="bulkPaymentData.amount"
              type="number" 
              step="0.01"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label class="block text-white/70 text-sm mb-2">Date</label>
            <input 
              v-model="bulkPaymentData.date"
              type="date" 
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-white/70 text-sm mb-2">Account</label>
            <select 
              v-model="bulkPaymentData.accountId"
              class="select-premium"
            >
              <option value="" disabled>Select an account</option>
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="flex space-x-3 mt-6">
          <button 
            @click="processBulkPayment"
            class="flex-1 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-colors"
          >
            Process Payment
          </button>
          <button 
            @click="showBulkPaymentModal = false"
            class="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom glassmorphism enhancements */
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

/* Enhanced shadows */
.shadow-2xl {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(59, 130, 246, 0.1);
}

.shadow-green-500\/20 {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(34, 197, 94, 0.1);
}

.shadow-blue-500\/20 {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(59, 130, 246, 0.1);
}

.shadow-yellow-500\/20 {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(234, 179, 8, 0.1);
}

.shadow-purple-500\/20 {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(147, 51, 234, 0.1);
}

.shadow-orange-500\/20 {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 40px rgba(249, 115, 22, 0.1);
}

/* Animation keyframes */

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes fadeInScale {
  0% { 
    opacity: 0; 
    transform: scale(0.9);
  }
  100% { 
    opacity: 1; 
    transform: scale(1);
  }
}

/* Animation classes */

.animate-shimmer {
  position: relative;
  overflow: hidden;
}

.animate-shimmer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmer 2s infinite;
}

.animate-fade-in-scale {
  animation: fadeInScale 0.5s ease-out;
}

/* Custom scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Smooth transitions */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Button hover effects */
button:hover {
  transform: translateY(-1px);
}

/* Modal backdrop */
.fixed {
  position: fixed;
}

/* Input focus styles */
input:focus, select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>