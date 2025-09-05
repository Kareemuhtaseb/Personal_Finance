import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { title: 'Dashboard' }
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('../views/Transactions.vue'),
      meta: { title: 'Transactions' }
    },
    {
      path: '/salary',
      name: 'salary',
      component: () => import('../views/Salary.vue'),
      meta: { title: 'Salary' }
    },
    {
      path: '/savings',
      name: 'savings',
      component: () => import('../views/Savings.vue'),
      meta: { title: 'Savings' }
    },
    {
      path: '/freelance',
      name: 'freelance',
      component: () => import('../views/Freelance.vue'),
      meta: { title: 'Freelance' }
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../views/Reports.vue'),
      meta: { title: 'Reports' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/Settings.vue'),
      meta: { title: 'Settings' }
    }
  ],
})

export default router
