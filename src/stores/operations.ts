import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiService, { type ApiResponse } from '../services/api'

// Types for operations
export interface Order {
  id: string
  orderNumber: string
  status: 'PAID' | 'UNPAID' | 'CANCELLED'
  amount: number
  type: 'DELIVERY' | 'PICKUP'
  dueDate?: string
  priority: 'URGENT' | 'NORMAL' | 'LOW'
  description?: string
  clientName?: string
  clientEmail?: string
  estimatedHours?: number
  actualHours?: number
  profitMargin?: number
  createdAt: string
  updatedAt: string
  orderItems: OrderItem[]
  tasks: Task[]
  workshops: Workshop[]
}

export interface OrderItem {
  id: string
  orderId: string
  itemId: string
  quantity: number
  unitPrice: number
  item: Item
}

export interface Item {
  id: string
  name: string
  description?: string
  quantity: number
  unitCost: number
  minStock: number
  maxStock?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  priority: 'URGENT' | 'NORMAL' | 'LOW'
  dueDate?: string
  assignedTo?: string
  orderId?: string
  workshopId?: string
  estimatedHours?: number
  actualHours?: number
  position: number
  createdAt: string
  updatedAt: string
  order?: Order
  workshop?: Workshop
  taskCosts: TaskCost[]
}

export interface TaskCost {
  id: string
  taskId: string
  itemId?: string
  description: string
  amount: number
  item?: Item
  createdAt: string
}

export interface Workshop {
  id: string
  title: string
  client?: string
  organization?: string
  date: string
  location?: string
  notes?: string
  orderId?: string
  createdAt: string
  updatedAt: string
  order?: Order
  tasks: Task[]
  workshopCosts: WorkshopCost[]
}

export interface WorkshopCost {
  id: string
  workshopId: string
  description: string
  amount: number
  createdAt: string
}

export interface OperationsDashboard {
  summary: {
    totalIncome: number
    totalExpenses: number
    netProfit: number
    profitMargin: number
  }
  breakdown: {
    income: {
      orders: number
    }
    expenses: {
      inventory: number
      tasks: number
      workshops: number
    }
  }
  charts: {
    daily: Array<{
      date: string
      income: number
      expenses: number
    }>
    categories: {
      income: { orders: number }
      expenses: { inventory: number; tasks: number; workshops: number }
    }
  }
  period: string
  dateRange: {
    start: string
    end: string
  }
}

export interface OperationsSummary {
  orders: {
    total: number
    unpaid: number
  }
  inventory: {
    total: number
    lowStock: number
  }
  tasks: {
    total: number
    pending: number
  }
  workshops: {
    total: number
  }
  monthly: {
    income: number
    expenses: number
  }
}

export const useOperationsStore = defineStore('operations', () => {
  // State
  const orders = ref<Order[]>([])
  const items = ref<Item[]>([])
  const tasks = ref<Task[]>([])
  const tasksByStatus = ref<{
    PENDING: Task[]
    IN_PROGRESS: Task[]
    COMPLETED: Task[]
  }>({
    PENDING: [],
    IN_PROGRESS: [],
    COMPLETED: []
  })
  const workshops = ref<Workshop[]>([])
  const dashboard = ref<OperationsDashboard | null>(null)
  const summary = ref<OperationsSummary | null>(null)
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const unpaidOrders = computed(() => orders.value.filter(order => order.status === 'UNPAID'))
  const urgentTasks = computed(() => tasks.value.filter(task => task.priority === 'URGENT'))
  const lowStockItems = computed(() => items.value.filter(item => item.quantity <= item.minStock))
  const totalInventoryValue = computed(() => 
    items.value.reduce((total, item) => total + (item.quantity * item.unitCost), 0)
  )

  // Actions
  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  // Orders
  const fetchOrders = async (params?: {
    status?: string
    priority?: string
    type?: string
    sortBy?: string
    sortOrder?: string
  }) => {
    try {
      setError(null)
      const response = await apiService.getOrders(params)
      
      if (response.data.success) {
        orders.value = response.data.data!
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch orders'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const createOrder = async (orderData: {
    amount: number
    type: 'DELIVERY' | 'PICKUP'
    dueDate?: string
    priority?: 'URGENT' | 'NORMAL' | 'LOW'
    description?: string
    clientName?: string
    clientEmail?: string
    estimatedHours?: number
    items?: Array<{
      itemId: string
      quantity: number
      unitPrice: number
    }>
  }) => {
    try {
      setError(null)
      const response = await apiService.createOrder(orderData)
      
      if (response.data.success) {
        orders.value.unshift(response.data.data!)
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create order'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const updateOrder = async (id: string, orderData: Partial<Order>) => {
    try {
      setError(null)
      const response = await apiService.updateOrder(id, orderData)
      
      if (response.data.success) {
        const index = orders.value.findIndex(order => order.id === id)
        if (index !== -1) {
          orders.value[index] = response.data.data!
        }
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update order'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const deleteOrder = async (id: string) => {
    try {
      setError(null)
      const response = await apiService.deleteOrder(id)
      
      if (response.data.success) {
        orders.value = orders.value.filter(order => order.id !== id)
        return { success: true }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete order'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Inventory
  const fetchItems = async (params?: {
    search?: string
    lowStock?: boolean
    sortBy?: string
    sortOrder?: string
  }) => {
    try {
      setError(null)
      const response = await apiService.getItems(params)
      
      if (response.data.success) {
        items.value = response.data.data!
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch items'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const createItem = async (itemData: {
    name: string
    description?: string
    quantity?: number
    unitCost: number
    minStock?: number
    maxStock?: number
  }) => {
    try {
      setError(null)
      const response = await apiService.createItem(itemData)
      
      if (response.data.success) {
        items.value.unshift(response.data.data!)
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create item'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const updateItem = async (id: string, itemData: Partial<Item>) => {
    try {
      setError(null)
      const response = await apiService.updateItem(id, itemData)
      
      if (response.data.success) {
        const index = items.value.findIndex(item => item.id === id)
        if (index !== -1) {
          items.value[index] = response.data.data!
        }
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update item'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const deleteItem = async (id: string) => {
    try {
      setError(null)
      const response = await apiService.deleteItem(id)
      
      if (response.data.success) {
        items.value = items.value.filter(item => item.id !== id)
        return { success: true }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete item'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Tasks
  const fetchTasks = async (params?: {
    status?: string
    orderId?: string
    workshopId?: string
    assignedTo?: string
    sortBy?: string
    sortOrder?: string
  }) => {
    try {
      setError(null)
      const response = await apiService.getTasks(params)
      
      if (response.data.success) {
        tasks.value = response.data.data!
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch tasks'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const fetchTasksByStatus = async () => {
    try {
      setError(null)
      const response = await apiService.getTasksByStatus()
      
      if (response.data.success) {
        tasksByStatus.value = response.data.data!
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch tasks by status'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const createTask = async (taskData: {
    title: string
    description?: string
    dueDate?: string
    assignedTo?: string
    orderId?: string
    workshopId?: string
    priority?: 'URGENT' | 'NORMAL' | 'LOW'
    estimatedHours?: number
    costs?: Array<{
      description: string
      amount: number
      itemId?: string
    }>
  }) => {
    try {
      setError(null)
      const response = await apiService.createTask(taskData)
      
      if (response.data.success) {
        tasks.value.unshift(response.data.data!)
        // Update tasks by status
        await fetchTasksByStatus()
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create task'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      setError(null)
      const response = await apiService.updateTask(id, taskData)
      
      if (response.data.success) {
        const index = tasks.value.findIndex(task => task.id === id)
        if (index !== -1) {
          tasks.value[index] = response.data.data!
        }
        // Update tasks by status
        await fetchTasksByStatus()
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update task'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const updateTaskStatus = async (id: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    try {
      setError(null)
      const response = await apiService.updateTaskStatus(id, status)
      
      if (response.data.success) {
        const index = tasks.value.findIndex(task => task.id === id)
        if (index !== -1) {
          tasks.value[index] = response.data.data!
        }
        // Update tasks by status
        await fetchTasksByStatus()
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update task status'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const deleteTask = async (id: string) => {
    try {
      setError(null)
      const response = await apiService.deleteTask(id)
      
      if (response.data.success) {
        tasks.value = tasks.value.filter(task => task.id !== id)
        // Update tasks by status
        await fetchTasksByStatus()
        return { success: true }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete task'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Workshops
  const fetchWorkshops = async (params?: {
    client?: string
    organization?: string
    location?: string
    orderId?: string
    sortBy?: string
    sortOrder?: string
  }) => {
    try {
      setError(null)
      const response = await apiService.getWorkshops(params)
      
      if (response.data.success) {
        workshops.value = response.data.data!
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch workshops'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const createWorkshop = async (workshopData: {
    title: string
    client?: string
    organization?: string
    date: string
    location?: string
    notes?: string
    orderId?: string
  }) => {
    try {
      setError(null)
      const response = await apiService.createWorkshop(workshopData)
      
      if (response.data.success) {
        workshops.value.unshift(response.data.data!)
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create workshop'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const updateWorkshop = async (id: string, workshopData: Partial<Workshop>) => {
    try {
      setError(null)
      const response = await apiService.updateWorkshop(id, workshopData)
      
      if (response.data.success) {
        const index = workshops.value.findIndex(workshop => workshop.id === id)
        if (index !== -1) {
          workshops.value[index] = response.data.data!
        }
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update workshop'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const deleteWorkshop = async (id: string) => {
    try {
      setError(null)
      const response = await apiService.deleteWorkshop(id)
      
      if (response.data.success) {
        workshops.value = workshops.value.filter(workshop => workshop.id !== id)
        return { success: true }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete workshop'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Dashboard
  const fetchOperationsDashboard = async (period?: string) => {
    try {
      setError(null)
      const response = await apiService.getOperationsDashboard(period)
      
      if (response.data.success) {
        dashboard.value = response.data.data!
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch operations dashboard'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const fetchOperationsSummary = async () => {
    try {
      setError(null)
      const response = await apiService.getOperationsSummary()
      
      if (response.data.success) {
        summary.value = response.data.data!
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch operations summary'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Fetch all operations data
  const fetchAllOperationsData = async (forceRefresh: boolean = false) => {
    try {
      if (!orders.value.length || forceRefresh) {
        setLoading(true)
      }
      setError(null)

      const [
        ordersResult,
        itemsResult,
        tasksResult,
        workshopsResult,
        summaryResult
      ] = await Promise.allSettled([
        fetchOrders(),
        fetchItems(),
        fetchTasks(),
        fetchWorkshops(),
        fetchOperationsSummary()
      ])

      // Check for any failures
      const results = [ordersResult, itemsResult, tasksResult, workshopsResult, summaryResult]
      const failures = results.filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success))
      
      if (failures.length > 0) {
        console.warn('Some operations data failed to load:', failures)
      }

      return { success: true }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch operations data'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Clear all data
  const clearData = () => {
    orders.value = []
    items.value = []
    tasks.value = []
    tasksByStatus.value = { PENDING: [], IN_PROGRESS: [], COMPLETED: [] }
    workshops.value = []
    dashboard.value = null
    summary.value = null
    error.value = null
  }

  return {
    // State
    orders,
    items,
    tasks,
    tasksByStatus,
    workshops,
    dashboard,
    summary,
    isLoading,
    error,
    
    // Getters
    unpaidOrders,
    urgentTasks,
    lowStockItems,
    totalInventoryValue,
    
    // Actions
    setError,
    setLoading,
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    fetchTasks,
    fetchTasksByStatus,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    fetchWorkshops,
    createWorkshop,
    updateWorkshop,
    deleteWorkshop,
    fetchOperationsDashboard,
    fetchOperationsSummary,
    fetchAllOperationsData,
    clearData
  }
})
