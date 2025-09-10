import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { title: 'Login', requiresGuest: true }
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { title: 'Dashboard', requiresAuth: true }
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: () => import('../views/Expenses.vue'),
      meta: { title: 'Expenses', requiresAuth: true }
    },
    {
      path: '/expenses/new',
      name: 'new-expense',
      component: () => import('../views/Expenses.vue'),
      meta: { title: 'New Expense', requiresAuth: true }
    },
    {
      path: '/income',
      name: 'income',
      component: () => import('../views/Income.vue'),
      meta: { title: 'Income', requiresAuth: true }
    },
    {
      path: '/freelance',
      name: 'freelance',
      component: () => import('../views/Freelance.vue'),
      meta: { title: 'Freelance', requiresAuth: true }
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../views/Reports.vue'),
      meta: { title: 'Reports', requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/Settings.vue'),
      meta: { title: 'Settings', requiresAuth: true }
    },
    {
      path: '/operations',
      name: 'operations',
      component: () => import('../views/Operations.vue'),
      meta: { title: 'Operations', requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/'
    }
  ],
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Check authentication status from localStorage directly
  const isAuthenticated = !!localStorage.getItem('accessToken')
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }
  
  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && isAuthenticated) {
    next('/')
    return
  }
  
  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - FinanceHub`
  }
  
  next()
})

// Route change handling - simplified to avoid navigation issues
router.afterEach((to, from) => {
  // Just log route changes for debugging
  console.log(`Navigated from ${from.path} to ${to.path}`)
})

export default router
