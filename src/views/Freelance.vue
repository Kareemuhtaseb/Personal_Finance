<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { apiService, type FreelanceProject, type WorkSession, type FreelanceSummary, type Account, type Category, type Invoice, type PartialPayment, type CreateInvoiceRequest, type CreatePartialPaymentRequest } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import CustomDropdown from '@/components/ui/CustomDropdown.vue'

// Reactive data
const projects = ref<FreelanceProject[]>([])
const workSessions = ref<WorkSession[]>([])
const invoices = ref<Invoice[]>([])
const partialPayments = ref<PartialPayment[]>([])
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
const showEditWorkModal = ref(false)
const showInvoiceModal = ref(false)
const showPartialPaymentModal = ref(false)
const selectedProject = ref<FreelanceProject | null>(null)
const activeSession = ref<WorkSession | null>(null)
const selectedInvoice = ref<Invoice | null>(null)

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
  date: new Date().toISOString().split('T')[0]
})

// Edit work session form data
const editWorkData = ref({
  id: '',
  projectId: '',
  workHours: 0,
  date: '',
  description: ''
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

// Pagination state
const activeProjectsPage = ref(1)
const completedProjectsPage = ref(1)
const invoicesPage = ref(1)
const workSessionsPage = ref(1)
const itemsPerPage = 3

// Invoice form data
const invoiceData = ref<CreateInvoiceRequest>({
  projectId: '',
  workSessionIds: [],
  amount: 0,
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
  description: '',
  status: 'DRAFT'
})

// Partial payment form data
const partialPaymentData = ref<CreatePartialPaymentRequest>({
  invoiceId: '',
  workSessionId: '',
  amount: 0,
  paymentDate: new Date().toISOString().split('T')[0],
  description: '',
  accountId: '',
  categoryId: ''
})

// Computed properties
const activeProjects = computed(() => projects.value.filter(p => p.status === 'ACTIVE'))
const completedProjects = computed(() => projects.value.filter(p => p.status === 'COMPLETED'))
const totalEarnings = computed(() => projects.value.reduce((sum, p) => sum + p.totalAmount, 0))
const totalHours = computed(() => projects.value.reduce((sum, p) => sum + p.totalHours, 0))
const unpaidHours = computed(() => projects.value.reduce((sum, p) => sum + p.unpaidHours, 0))

// Calculate effective hourly rate based on payments vs manual hours
const projectsWithEffectiveRates = computed(() => {
  return projects.value.map(project => {
    // Get all invoices for this project
    const projectInvoices = invoices.value.filter(inv => inv.project.id === project.id)
    
    // Calculate total paid amount from invoices
    const totalPaidFromInvoices = projectInvoices.reduce((sum, inv) => {
      return sum + inv.totalPaid
    }, 0)
    
    // Get total manual hours logged for this project
    const projectSessions = workSessions.value.filter(s => s.projectId === project.id && s.endTime)
    const totalManualHours = projectSessions.reduce((sum, session) => {
      return sum + (Number(session.workHours) || 0)
    }, 0)
    
    // Calculate effective hourly rate
    const effectiveHourlyRate = totalManualHours > 0 ? totalPaidFromInvoices / totalManualHours : 0
    
    return {
      ...project,
      effectiveHourlyRate,
      totalPaidFromInvoices,
      totalManualHours,
      actualHourlyRate: project.hourlyRate // Original set rate for reference
    }
  })
})

// Paginated projects with effective rates
const paginatedActiveProjects = computed(() => {
  const activeProjectsWithRates = projectsWithEffectiveRates.value.filter(p => p.status === 'ACTIVE')
  const start = (activeProjectsPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return activeProjectsWithRates.slice(start, end)
})

const paginatedCompletedProjects = computed(() => {
  const completedProjectsWithRates = projectsWithEffectiveRates.value.filter(p => p.status === 'COMPLETED')
  const start = (completedProjectsPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return completedProjectsWithRates.slice(start, end)
})

const totalActivePages = computed(() => Math.ceil(activeProjects.value.length / itemsPerPage))
const totalCompletedPages = computed(() => Math.ceil(completedProjects.value.length / itemsPerPage))
const totalInvoicesPages = computed(() => Math.ceil(invoices.value.length / itemsPerPage))
const totalWorkSessionsPages = computed(() => Math.ceil(filteredWorkSessions.value.length / itemsPerPage))

// Paginated invoices
const paginatedInvoices = computed(() => {
  const start = (invoicesPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return invoices.value.slice(start, end)
})

// Paginated work sessions
const paginatedWorkSessions = computed(() => {
  const start = (workSessionsPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredWorkSessions.value.slice(start, end)
})

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

// Dropdown options
const projectOptions = computed(() => {
  return activeProjects.value.map(project => ({
    value: project.id,
    label: `${project.name} - ${project.client}`
  }))
})

const invoiceStatusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'PAID', label: 'Paid' },
  { value: 'OVERDUE', label: 'Overdue' }
]

// Methods
const loadData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const [projectsRes, sessionsRes, invoicesRes, partialPaymentsRes, summaryRes, accountsRes, categoriesRes] = await Promise.all([
      apiService.getProjects(),
      apiService.getWorkSessions(),
      apiService.getInvoices(),
      apiService.getPartialPayments(),
      apiService.getFreelanceSummary(),
      apiService.getAccounts(),
      apiService.getCategories()
    ])
    
    projects.value = projectsRes.data.data || []
    workSessions.value = sessionsRes.data.data || []
    invoices.value = invoicesRes.data.data || []
    partialPayments.value = partialPaymentsRes.data.data || []
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
      date: manualWorkData.value.date
    })
    
    await loadData()
    showManualWorkModal.value = false
    manualWorkData.value = {
      projectId: '',
      description: '',
      workHours: 0,
      date: new Date().toISOString().split('T')[0]
    }
    error.value = ''
    
    // Show success message
    alert('Work session created successfully! This is for reference tracking only.')
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

// Pagination methods
const goToActivePage = (page: number) => {
  if (page >= 1 && page <= totalActivePages.value) {
    activeProjectsPage.value = page
  }
}

const goToCompletedPage = (page: number) => {
  if (page >= 1 && page <= totalCompletedPages.value) {
    completedProjectsPage.value = page
  }
}

const goToInvoicesPage = (page: number) => {
  if (page >= 1 && page <= totalInvoicesPages.value) {
    invoicesPage.value = page
  }
}

const goToWorkSessionsPage = (page: number) => {
  if (page >= 1 && page <= totalWorkSessionsPages.value) {
    workSessionsPage.value = page
  }
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

// Invoice methods
const createInvoice = async () => {
  try {
    if (!invoiceData.value.projectId || invoiceData.value.amount <= 0) {
      error.value = 'Please fill in all required fields'
      return
    }
    
    await apiService.createInvoice(invoiceData.value)
    await loadData()
    showInvoiceModal.value = false
    invoiceData.value = {
      projectId: '',
      workSessionIds: [],
      amount: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: '',
      status: 'DRAFT'
    }
    error.value = ''
  } catch (err: any) {
    error.value = err.message || 'Failed to create invoice'
  }
}

const updateInvoice = async (invoiceId: string, status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE') => {
  try {
    await apiService.updateInvoice(invoiceId, { status })
    await loadData()
  } catch (err: any) {
    error.value = err.message || 'Failed to update invoice'
  }
}


const exportInvoicePDF = async (invoiceId: string) => {
  try {
    const blob = await apiService.exportInvoicePDF(invoiceId)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${invoiceId}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (err: any) {
    error.value = err.message || 'Failed to export invoice PDF'
  }
}

// Partial payment methods
const createPartialPayment = async () => {
  try {
    if (!partialPaymentData.value.amount || partialPaymentData.value.amount <= 0) {
      error.value = 'Please enter a valid amount'
      return
    }
    
    if (!partialPaymentData.value.invoiceId && !partialPaymentData.value.workSessionId) {
      error.value = 'Please select an invoice or work session'
      return
    }
    
    await apiService.createPartialPayment(partialPaymentData.value)
    await loadData()
    showPartialPaymentModal.value = false
    partialPaymentData.value = {
      invoiceId: '',
      workSessionId: '',
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      description: '',
      accountId: '',
      categoryId: ''
    }
    error.value = ''
  } catch (err: any) {
    error.value = err.message || 'Failed to create partial payment'
  }
}

const openInvoiceModal = (projectId?: string) => {
  // Reset form data
  invoiceData.value = {
    projectId: '',
    workSessionIds: [], // Keep empty since we're not using work sessions for invoicing
    amount: 0,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    description: '',
    status: 'DRAFT'
  }
  
  if (projectId) {
    invoiceData.value.projectId = projectId
    // Don't auto-calculate amount - let user enter manually
  }
  showInvoiceModal.value = true
}

const openPartialPaymentModal = (invoiceId?: string, workSessionId?: string) => {
  if (invoiceId) {
    partialPaymentData.value.invoiceId = invoiceId
    const invoice = invoices.value.find(i => i.id === invoiceId)
    if (invoice) {
      partialPaymentData.value.amount = invoice.remainingAmount
    }
  }
  if (workSessionId) {
    partialPaymentData.value.workSessionId = workSessionId
  }
  showPartialPaymentModal.value = true
}

const openManualWorkModal = (projectId?: string) => {
  if (projectId) {
    manualWorkData.value.projectId = projectId
  }
  showManualWorkModal.value = true
}

const editWorkSession = (session: WorkSession) => {
  editWorkData.value = {
    id: session.id,
    projectId: session.projectId,
    workHours: Number(session.workHours) || 0,
    date: session.startTime ? new Date(session.startTime).toISOString().split('T')[0] : '',
    description: session.description || ''
  }
  showEditWorkModal.value = true
}

const updateWorkSession = async () => {
  try {
    if (!editWorkData.value.projectId || editWorkData.value.workHours <= 0) {
      error.value = 'Please select a project and enter valid work hours'
      return
    }
    
    await apiService.updateWorkSession(editWorkData.value.id, {
      projectId: editWorkData.value.projectId,
      description: editWorkData.value.description,
      workHours: editWorkData.value.workHours,
      date: editWorkData.value.date
    } as any)
    
    await loadData()
    showEditWorkModal.value = false
    editWorkData.value = {
      id: '',
      projectId: '',
      workHours: 0,
      date: '',
      description: ''
    }
    error.value = ''
  } catch (err: any) {
    error.value = err.message || 'Failed to update work session'
  }
}

const deleteWorkSession = async (sessionId: string) => {
  if (!confirm('Are you sure you want to delete this work session?')) {
    return
  }
  
  try {
    await apiService.deleteWorkSession(sessionId)
    await loadData()
    error.value = ''
  } catch (err: any) {
    error.value = err.message || 'Failed to delete work session'
  }
}

const markInvoiceAsPaid = async (invoiceId: string) => {
  try {
    await apiService.updateInvoice(invoiceId, { status: 'PAID' })
    await loadData()
    error.value = ''
  } catch (err: any) {
    error.value = err.message || 'Failed to mark invoice as paid'
  }
}

const markInvoiceAsUnpaid = async (invoiceId: string) => {
  try {
    await apiService.updateInvoice(invoiceId, { status: 'SENT' })
    await loadData()
    error.value = ''
  } catch (err: any) {
    error.value = err.message || 'Failed to mark invoice as unpaid'
  }
}

const deleteInvoice = async (invoiceId: string) => {
  if (!confirm('Are you sure you want to delete this invoice?')) {
    return
  }
  
  try {
    await apiService.deleteInvoice(invoiceId)
    await loadData()
    error.value = ''
  } catch (err: any) {
    error.value = err.message || 'Failed to delete invoice'
  }
}

// Watchers
// Note: Removed auto-calculation watcher to make invoice amount manual

// Reset work sessions pagination when project filter changes
watch(selectedProjectForSessions, () => {
  workSessionsPage.value = 1
})

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
        <button 
          @click="openInvoiceModal()"
          class="btn-primary inline-flex items-center bg-purple-500 hover:bg-purple-600"
        >
          📄 Invoice
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


    <!-- Projects Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left Column: Active Projects -->
      <div class="space-y-8">
      <!-- Active Projects -->
        <div class="glass-card-enhanced shadow-green-glow p-6">
        <div>
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
          
          <div v-else class="relative">
          <!-- Project Cards Stack -->
          <div class="space-y-4 min-h-[400px]">
            <transition-group name="project-fade" tag="div" class="space-y-4">
              <div
                v-for="(project, index) in paginatedActiveProjects"
                :key="project.id"
                @click="selectedProjectForSessions = project.id"
                class="p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 relative overflow-hidden group cursor-pointer"
                :class="{ 'ring-2 ring-green-400/50 bg-green-500/10': selectedProjectForSessions === project.id }"
              >
              <!-- Project card background effects -->
              <div class="absolute inset-0 bg-white/3 rounded-2xl"></div>
              
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
                  @click="openManualWorkModal(project.id)"
                      class="px-3 py-1.5 bg-green-500/80 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Add Hours
                </button>
                <button 
                  @click="openInvoiceModal(project.id)"
                      class="px-3 py-1.5 bg-purple-500/80 hover:bg-purple-500 text-white text-xs font-medium rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Invoice
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
                    <span class="text-white/70">Set Rate:</span>
                    <span class="font-semibold text-white">{{ formatCurrency(project.actualHourlyRate) }}/h</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Effective Rate:</span>
                    <span class="font-semibold text-green-400">{{ formatCurrency(project.effectiveHourlyRate) }}/h</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Manual Hours:</span>
                    <span class="font-semibold text-white">{{ formatDuration(project.totalManualHours || 0) }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Paid from Invoices:</span>
                    <span class="font-semibold text-green-400">{{ formatCurrency(project.totalPaidFromInvoices || 0) }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Unpaid Hours:</span>
                    <span class="font-semibold text-yellow-400">{{ formatDuration(project.unpaidHours || 0) }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Status:</span>
                    <span class="font-semibold text-green-400">Active</span>
                  </div>
                </div>
              </div>
            </div>
            </transition-group>
          </div>
        </div>
        
        <!-- Enhanced Pagination for Active Projects -->
        <div v-if="totalActivePages > 1" class="flex items-center justify-center mt-6 pt-4 border-t border-white/10">
          <div class="flex items-center space-x-3">
            <!-- Previous Button -->
            <button 
              @click="goToActivePage(activeProjectsPage - 1)"
              :disabled="activeProjectsPage === 1"
              class="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>
            
            <!-- Page Numbers -->
            <div class="flex items-center space-x-2">
              <button
                v-for="page in totalActivePages"
                :key="page"
                @click="goToActivePage(page)"
                :class="[
                  'px-3 py-2 text-sm rounded-lg transition-all duration-300 hover:scale-105',
                  activeProjectsPage === page
                    ? 'bg-green-500/80 text-white shadow-lg shadow-green-500/20'
                    : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
                ]"
              >
                {{ page }}
              </button>
            </div>
            
            <!-- Next Button -->
            <button 
              @click="goToActivePage(activeProjectsPage + 1)"
              :disabled="activeProjectsPage === totalActivePages"
              class="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center space-x-2"
            >
              <span>Next</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        </div>
      </div>

      <!-- Finished Projects -->
      <div class="glass-card-enhanced shadow-blue-glow p-6">
        <div>
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
          
          <div v-else class="relative">
            <!-- Project Cards Stack -->
            <div class="space-y-4 min-h-[400px]">
              <transition-group name="project-fade" tag="div" class="space-y-4">
                <div
                  v-for="(project, index) in paginatedCompletedProjects"
                  :key="project.id"
                  @click="selectedProjectForSessions = project.id"
                  class="p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 relative overflow-hidden group cursor-pointer"
                  :class="{ 'ring-2 ring-blue-400/50 bg-blue-500/10': selectedProjectForSessions === project.id }"
                >
              <!-- Project card background effects -->
              <div class="absolute inset-0 bg-white/3 rounded-2xl"></div>
              
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
                    <span class="text-white/70">Set Rate:</span>
                    <span class="font-semibold text-white">{{ formatCurrency(project.actualHourlyRate) }}/h</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Effective Rate:</span>
                    <span class="font-semibold text-green-400">{{ formatCurrency(project.effectiveHourlyRate) }}/h</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Manual Hours:</span>
                    <span class="font-semibold text-white">{{ formatDuration(project.totalManualHours || 0) }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Paid from Invoices:</span>
                    <span class="font-semibold text-green-400">{{ formatCurrency(project.totalPaidFromInvoices || 0) }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Unpaid Hours:</span>
                    <span class="font-semibold text-yellow-400">{{ formatDuration(project.unpaidHours || 0) }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Status:</span>
                    <span class="font-semibold text-blue-400">Completed</span>
                  </div>
                </div>
              </div>
            </div>
              </transition-group>
            </div>
          </div>
        </div>
        
        <!-- Enhanced Pagination for Completed Projects -->
        <div v-if="totalCompletedPages > 1" class="flex items-center justify-center mt-6 pt-4 border-t border-white/10">
          <div class="flex items-center space-x-3">
            <!-- Previous Button -->
            <button 
              @click="goToCompletedPage(completedProjectsPage - 1)"
              :disabled="completedProjectsPage === 1"
              class="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>
            
            <!-- Page Numbers -->
            <div class="flex items-center space-x-2">
              <button
                v-for="page in totalCompletedPages"
                :key="page"
                @click="goToCompletedPage(page)"
                :class="[
                  'px-3 py-2 text-sm rounded-lg transition-all duration-300 hover:scale-105',
                  completedProjectsPage === page
                    ? 'bg-blue-500/80 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
                ]"
              >
                {{ page }}
              </button>
            </div>
            
            <!-- Next Button -->
            <button 
              @click="goToCompletedPage(completedProjectsPage + 1)"
              :disabled="completedProjectsPage === totalCompletedPages"
              class="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center space-x-2"
            >
              <span>Next</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Invoices Section -->
    <div class="glass-card-enhanced shadow-purple-glow p-6">
      <div>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white">
            Invoices
          </h3>
          <div class="flex items-center space-x-2">
            <span class="text-xs text-white/60 font-medium">{{ invoices.length }} Invoices</span>
          </div>
        </div>
      
      <div v-if="invoices.length === 0" class="text-center py-8">
        <div class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p class="text-white/70 text-lg">No invoices created yet</p>
        <p class="text-white/50 text-sm mt-1">Create your first invoice to start tracking payments</p>
      </div>
      
      <div v-else class="relative">
        <!-- Invoice Cards Stack -->
        <div class="space-y-4 min-h-[400px]">
          <transition-group name="project-fade" tag="div" class="space-y-4">
            <div
              v-for="invoice in paginatedInvoices"
              :key="invoice.id"
              class="p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 relative overflow-hidden group cursor-pointer"
            >
              <!-- Invoice card background effects -->
              <div class="absolute inset-0 bg-white/3 rounded-2xl"></div>
              
              <!-- Hover shimmer effect -->
              <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div class="animate-shimmer absolute inset-0 rounded-2xl"></div>
              </div>
              
              <div class="relative z-10">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h4 class="text-lg font-semibold text-white mb-1 group-hover:text-purple-200 transition-colors duration-300">{{ invoice.invoiceNumber }}</h4>
                    <p class="text-purple-400 text-sm">{{ invoice.project.name }} - {{ invoice.project.client }}</p>
                    <p class="text-xs text-white/50 mt-1">
                      Due: {{ formatDate(invoice.dueDate) }}
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button 
                      v-if="invoice.status !== 'PAID'"
                      @click="markInvoiceAsPaid(invoice.id)"
                      class="px-3 py-1.5 bg-green-500/80 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-all duration-300 hover:scale-105"
                      title="Mark as paid"
                    >
                      ✅ Paid
                    </button>
                    <button 
                      v-if="invoice.status === 'PAID'"
                      @click="markInvoiceAsUnpaid(invoice.id)"
                      class="px-3 py-1.5 bg-yellow-500/80 hover:bg-yellow-500 text-white text-xs font-medium rounded-lg transition-all duration-300 hover:scale-105"
                      title="Mark as unpaid"
                    >
                      ⏳ Unpaid
                    </button>
                    <button 
                      @click="deleteInvoice(invoice.id)"
                      class="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-all duration-300 hover:scale-105"
                      title="Delete invoice"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Amount:</span>
                    <span class="font-semibold text-white">${{ invoice.amount.toFixed(2) }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Status:</span>
                    <span class="font-semibold" :class="{
                      'text-green-400': invoice.status === 'PAID',
                      'text-yellow-400': invoice.status === 'SENT',
                      'text-blue-400': invoice.status === 'DRAFT',
                      'text-red-400': invoice.status === 'OVERDUE'
                    }">
                      {{ invoice.status }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Created:</span>
                    <span class="font-semibold text-white">{{ formatDate(invoice.createdAt) }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Project:</span>
                    <span class="font-semibold text-purple-400">{{ invoice.project.name }}</span>
                  </div>
                  <div v-if="invoice.description" class="col-span-2 flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Description:</span>
                    <span class="font-semibold text-white">{{ invoice.description }}</span>
                  </div>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
        
        <!-- Enhanced Pagination for Invoices -->
        <div v-if="totalInvoicesPages > 1" class="flex items-center justify-center mt-6 pt-4 border-t border-white/10">
          <div class="flex items-center space-x-3">
            <!-- Previous Button -->
            <button 
              @click="goToInvoicesPage(invoicesPage - 1)"
              :disabled="invoicesPage === 1"
              class="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>
            
            <!-- Page Numbers -->
            <div class="flex items-center space-x-2">
              <button
                v-for="page in totalInvoicesPages"
                :key="page"
                @click="goToInvoicesPage(page)"
                :class="[
                  'px-3 py-2 text-sm rounded-lg transition-all duration-300 hover:scale-105',
                  invoicesPage === page
                    ? 'bg-purple-500/80 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
                ]"
              >
                {{ page }}
              </button>
            </div>
            
            <!-- Next Button -->
            <button 
              @click="goToInvoicesPage(invoicesPage + 1)"
              :disabled="invoicesPage === totalInvoicesPages"
              class="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center space-x-2"
            >
              <span>Next</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- Work Sessions Section (Reference Only) -->
    <div class="glass-card-enhanced shadow-blue-glow p-6">
      <div>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white">
            Work Sessions
          </h3>
          <div class="flex items-center space-x-2">
            <span class="text-xs text-white/60 font-medium">{{ filteredWorkSessions.length }} Sessions</span>
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
      
      <div v-else class="relative">
        <!-- Work Session Cards Stack -->
        <div class="space-y-4 min-h-[400px]">
          <transition-group name="project-fade" tag="div" class="space-y-4">
            <div
              v-for="session in paginatedWorkSessions"
              :key="session.id"
              class="p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 relative overflow-hidden group cursor-pointer"
            >
              <!-- Session card background effects -->
              <div class="absolute inset-0 bg-white/3 rounded-2xl"></div>
              
              <!-- Hover shimmer effect -->
              <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div class="animate-shimmer absolute inset-0 rounded-2xl"></div>
              </div>
              
              <div class="relative z-10">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h4 class="text-lg font-semibold text-white mb-1 group-hover:text-blue-200 transition-colors duration-300">{{ session.project.name }}</h4>
                    <p class="text-blue-400 text-sm">{{ session.project.client }}</p>
                    <p class="text-xs text-white/50 mt-1">
                      Reference: {{ session.project.paymentType === 'HOURLY_RATE' ? 'Hourly Rate' : 'Custom Amount' }}
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button 
                      @click="editWorkSession(session)"
                      class="px-3 py-1.5 bg-blue-500/80 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-all duration-300 hover:scale-105"
                      title="Edit work session"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      @click="deleteWorkSession(session.id)"
                      class="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-all duration-300 hover:scale-105"
                      title="Delete work session"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Duration:</span>
                    <span class="font-semibold text-white">{{ session.workHours ? formatDuration(Number(session.workHours)) : 'In Progress' }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Date:</span>
                    <span class="font-semibold text-white">{{ formatDate(session.startTime) }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Status:</span>
                    <span class="font-semibold text-green-400">{{ session.endTime ? 'Completed' : 'In Progress' }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Project:</span>
                    <span class="font-semibold text-blue-400">{{ session.project.name }}</span>
                  </div>
                  <div v-if="session.description" class="col-span-2 flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span class="text-white/70">Description:</span>
                    <span class="font-semibold text-white">{{ session.description || 'No description' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
        
        <!-- Enhanced Pagination for Work Sessions -->
        <div v-if="totalWorkSessionsPages > 1" class="flex items-center justify-center mt-6 pt-4 border-t border-white/10">
          <div class="flex items-center space-x-3">
            <!-- Previous Button -->
            <button 
              @click="goToWorkSessionsPage(workSessionsPage - 1)"
              :disabled="workSessionsPage === 1"
              class="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>
            
            <!-- Page Numbers -->
            <div class="flex items-center space-x-2">
              <button
                v-for="page in totalWorkSessionsPages"
                :key="page"
                @click="goToWorkSessionsPage(page)"
                :class="[
                  'px-3 py-2 text-sm rounded-lg transition-all duration-300 hover:scale-105',
                  workSessionsPage === page
                    ? 'bg-blue-500/80 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
                ]"
              >
                {{ page }}
              </button>
            </div>
            
            <!-- Next Button -->
            <button 
              @click="goToWorkSessionsPage(workSessionsPage + 1)"
              :disabled="workSessionsPage === totalWorkSessionsPages"
              class="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center space-x-2"
            >
              <span>Next</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
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
              :value="newProject.hourlyRate"
              type="number" 
              step="0.01"
              class="input-premium"
              placeholder="0.00"
              @input="newProject.hourlyRate = parseFloat(($event.target as HTMLInputElement).value) || 0"
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
    <div v-if="showPaymentModal" class="modal-backdrop">
      <div class="modal-content w-full max-w-md mx-4">
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
q              :value="paymentData.amount"
              type="number" 
              step="0.01"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
              placeholder="0.00"
              @input="paymentData.amount = parseFloat(($event.target as HTMLInputElement).value) || 0"
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
    <div v-if="showWorkSessionModal" class="modal-backdrop">
      <div class="modal-content w-full max-w-md mx-4">
        <h3 class="text-2xl font-bold text-white mb-6">End Work Session</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-white/70 text-sm mb-2">Break Duration (minutes)</label>
            <input 
              :value="workSessionData.breakDuration"
              type="number" 
              min="0"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
              placeholder="0"
              @input="workSessionData.breakDuration = parseInt(($event.target as HTMLInputElement).value) || 0"
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
    <div v-if="showManualWorkModal" class="modal-backdrop">
      <div class="modal-content w-full max-w-md mx-4">
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
              :value="manualWorkData.workHours"
              type="number" 
              step="0.25"
              min="0"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
              placeholder="0.00"
              @input="manualWorkData.workHours = parseFloat(($event.target as HTMLInputElement).value) || 0"
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
          
          <div class="p-3 bg-blue-500/10 border border-blue-400/30 rounded-xl">
            <div class="text-blue-400 text-sm font-medium">Reference Only</div>
            <div class="text-white/70 text-xs mt-1">Manual hours are for tracking purposes only. Payments are handled through invoices.</div>
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

    <!-- Edit Work Session Modal -->
    <div v-if="showEditWorkModal" class="modal-backdrop">
      <div class="modal-content w-full max-w-md mx-4">
        <h3 class="text-2xl font-bold text-white mb-6">Edit Work Session</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-white/70 text-sm mb-2">Project</label>
            <select 
              v-model="editWorkData.projectId"
              class="select-premium"
            >
              <option value="" disabled>Select a project</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }} - {{ project.client }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-white/70 text-sm mb-2">Work Hours</label>
            <input 
              :value="editWorkData.workHours"
              type="number" 
              step="0.25"
              min="0"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
              placeholder="0.00"
              @input="editWorkData.workHours = parseFloat(($event.target as HTMLInputElement).value) || 0"
            />
          </div>
          
          <div>
            <label class="block text-white/70 text-sm mb-2">Date</label>
            <input 
              v-model="editWorkData.date"
              type="date" 
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-white/70 text-sm mb-2">Description (Optional)</label>
            <input 
              v-model="editWorkData.description"
              type="text" 
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
              placeholder="What did you work on?"
            />
          </div>
          
          <div class="p-3 bg-blue-500/10 border border-blue-400/30 rounded-xl">
            <div class="text-blue-400 text-sm font-medium">Reference Only</div>
            <div class="text-white/70 text-xs mt-1">Manual hours are for tracking purposes only. Payments are handled through invoices.</div>
          </div>
        </div>
        
        <div class="flex space-x-3 mt-6">
          <button 
            @click="updateWorkSession"
            class="flex-1 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-colors"
          >
            Update Hours
          </button>
          <button 
            @click="showEditWorkModal = false"
            class="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Custom Payment Dialog -->
    <div v-if="showPaymentDialog" class="modal-backdrop">
      <div class="modal-content w-full max-w-md mx-4">
        <h3 class="text-2xl font-bold text-white mb-6">Set Payment Amount</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-white/70 text-sm mb-2">Payment Amount ($)</label>
            <input 
              :value="paymentDialogData.amount"
              type="number" 
              step="0.01"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
              placeholder="0.00"
              @input="paymentDialogData.amount = parseFloat(($event.target as HTMLInputElement).value) || 0"
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
    <div v-if="showBulkPaymentModal" class="modal-backdrop">
      <div class="modal-content w-full max-w-md mx-4">
        <h3 class="text-2xl font-bold text-white mb-6">Bulk Payment</h3>
        
        <div class="mb-4">
          <p class="text-white/70 text-sm">Selected Sessions: {{ selectedSessions.length }}</p>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-white/70 text-sm mb-2">Total Payment Amount ($)</label>
            <input 
              :value="bulkPaymentData.amount"
              type="number" 
              step="0.01"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
              placeholder="0.00"
              @input="bulkPaymentData.amount = parseFloat(($event.target as HTMLInputElement).value) || 0"
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

    <!-- Invoice Modal -->
    <div v-if="showInvoiceModal" class="modal-backdrop">
      <div class="modal-content max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white">Create Invoice</h3>
          <button 
            @click="showInvoiceModal = false"
            class="p-2 text-white/60 hover:text-white transition-colors"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="space-y-6">
          <div>
            <label class="block text-white/70 text-sm mb-2">Project</label>
            <CustomDropdown
              v-model="invoiceData.projectId"
              :options="projectOptions"
              placeholder="Select a project"
            />
          </div>

          <!-- Project Reference Information -->
          <div v-if="invoiceData.projectId" class="p-6 bg-purple-500/20 border border-purple-400/30 rounded-2xl">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-bold text-white">Project Reference</h4>
              <div class="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="p-3 bg-white/10 rounded-xl">
                <div class="text-white/70 text-xs mb-1">Manual Hours Logged</div>
                <div class="text-white font-bold text-lg">{{ formatDuration(workSessions.filter(s => s.projectId === invoiceData.projectId && s.endTime).reduce((sum, s) => sum + (Number(s.workHours) || 0), 0)) }}</div>
              </div>
              <div class="p-3 bg-white/10 rounded-xl">
                <div class="text-white/70 text-xs mb-1">Set Hourly Rate</div>
                <div class="text-white font-bold text-lg">{{ formatCurrency(projects.find(p => p.id === invoiceData.projectId)?.hourlyRate || 0) }}/h</div>
              </div>
            </div>
            
            <div class="p-4 bg-white/10 rounded-xl border border-blue-400/30">
              <div class="text-center">
                <div class="text-white/70 text-sm mb-2">Reference Information</div>
                <div class="text-blue-400 font-semibold">Use this data as reference for your invoice amount</div>
                <div class="text-white/50 text-xs mt-1">Manual hours are for tracking purposes only</div>
              </div>
            </div>
          </div>


          <div>
            <label class="block text-white/70 text-sm mb-2">Invoice Amount ($)</label>
            <input 
              type="number" 
              step="0.01" 
              :value="invoiceData.amount" 
              class="input-premium"
              placeholder="0.00"
              @input="invoiceData.amount = parseFloat(($event.target as HTMLInputElement).value) || 0"
            >
            <p class="text-white/50 text-xs mt-1">Enter the amount you want to invoice the client</p>
          </div>

          <div>
            <label class="block text-white/70 text-sm mb-2">Due Date</label>
            <input 
              type="date" 
              v-model="invoiceData.dueDate" 
              class="input-premium"
            >
          </div>

          <div>
            <label class="block text-white/70 text-sm mb-2">Invoice Status</label>
            <CustomDropdown
              v-model="invoiceData.status"
              :options="invoiceStatusOptions"
              placeholder="Select status"
            />
            <p class="text-white/50 text-xs mt-1">Marking as "Paid" will create an income transaction</p>
          </div>

          <div>
            <label class="block text-white/70 text-sm mb-2">Description (Optional)</label>
            <textarea 
              v-model="invoiceData.description" 
              rows="3"
              class="input-premium"
              placeholder="Invoice description or notes..."
            ></textarea>
          </div>
        </div>

        <div class="flex space-x-3 mt-8">
          <button 
            @click="createInvoice"
            class="flex-1 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-colors"
          >
            Create Invoice
          </button>
          <button 
            @click="showInvoiceModal = false"
            class="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Partial Payment Modal -->
    <div v-if="showPartialPaymentModal" class="modal-backdrop">
      <div class="modal-content w-full max-w-md mx-4 relative overflow-hidden">
        <!-- Enhanced background effects -->
        <div class="absolute inset-0 bg-white/6 rounded-3xl"></div>
        <div class="absolute inset-0 bg-white/2 rounded-3xl"></div>
        
        <!-- Animated border gradient -->
        <div class="absolute inset-0 rounded-3xl bg-green-500/20 opacity-50"></div>
        <div class="absolute inset-[1px] bg-gray-900/95 rounded-3xl"></div>
        
        <div class="relative z-10">
          <h3 class="text-2xl font-bold text-white mb-6">Record Partial Payment</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-white/90 mb-2">Amount ($)</label>
              <input 
                type="number" 
                step="0.01" 
                :value="partialPaymentData.amount" 
                class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300"
                placeholder="0.00"
                @input="partialPaymentData.amount = parseFloat(($event.target as HTMLInputElement).value) || 0"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-white/90 mb-2">Payment Date</label>
              <input 
                type="date" 
                v-model="partialPaymentData.paymentDate" 
                class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-white/90 mb-2">Description (Optional)</label>
              <input 
                type="text" 
                v-model="partialPaymentData.description" 
                class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300"
                placeholder="Payment description..."
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-white/90 mb-2">Account</label>
              <select v-model="partialPaymentData.accountId" class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300">
                <option value="">Select an account</option>
                <option v-for="account in accounts" :key="account.id" :value="account.id">
                  {{ account.name }} ({{ account.type }})
                </option>
              </select>
            </div>
          </div>

          <div class="flex space-x-3 mt-6">
            <button 
              @click="createPartialPayment"
              class="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Record Payment
            </button>
            <button 
              @click="showPartialPaymentModal = false"
              class="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 border border-white/20"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
/* Freelance-specific styles - using unified theme classes */

/* Project fade transition animations */
.project-fade-enter-active,
.project-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.project-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.project-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.project-fade-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
</style>