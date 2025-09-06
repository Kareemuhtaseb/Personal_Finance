<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useAccountsStore } from '../stores/accounts'
import { availableCurrencies } from '../utils/currency'

const authStore = useAuthStore()
const accountsStore = useAccountsStore()

const activeTab = ref('profile')
const isDarkMode = ref(false)
const isUpdating = ref(false)
const updateError = ref<string | null>(null)
const updateSuccess = ref<string | null>(null)

const tabs = [
  { id: 'profile', name: 'Profile', icon: 'user' },
  { id: 'accounts', name: 'Accounts', icon: 'bank' },
  { id: 'currencies', name: 'Currencies', icon: 'currency-dollar' },
  { id: 'rules', name: 'Rules', icon: 'cog' },
  { id: 'backup', name: 'Backup', icon: 'cloud' }
]

// Use real user data from store
const userProfile = computed(() => ({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
  timezone: authStore.user?.timezone || 'UTC',
  currency: authStore.user?.currency || 'USD'
}))

// Local form data
const formData = ref({
  name: '',
  email: '',
  timezone: '',
  currency: ''
})

// Password change form
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Account management
const showAddAccountModal = ref(false)
const showEditAccountModal = ref(false)
const editingAccount = ref<any>(null)
const newAccount = ref({
  name: '',
  type: 'CHECKING' as 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT',
  balance: 0,
  currency: authStore.user?.currency || 'USD'
})


// Currency management - using centralized currency list

// Initialize form data
onMounted(async () => {
  if (authStore.user) {
    formData.value = {
      name: authStore.user.name,
      email: authStore.user.email,
      timezone: authStore.user.timezone,
      currency: authStore.user.currency
    }
  }
  
  // Load accounts
  await accountsStore.fetchAccounts()
})

// Update profile
const updateProfile = async () => {
  try {
    isUpdating.value = true
    updateError.value = null
    updateSuccess.value = null

    const result = await authStore.updateProfile(formData.value)
    
    if (result.success) {
      updateSuccess.value = 'Profile updated successfully!'
      // Clear success message after 3 seconds
      setTimeout(() => {
        updateSuccess.value = null
      }, 3000)
    } else {
      updateError.value = result.error || 'Failed to update profile'
    }
  } catch (error) {
    updateError.value = 'An unexpected error occurred'
  } finally {
    isUpdating.value = false
  }
}

// Update currency specifically
const updateCurrency = async () => {
  try {
    isUpdating.value = true
    updateError.value = null
    updateSuccess.value = null

    const result = await authStore.updateProfile({ currency: formData.value.currency })
    
    if (result.success) {
      updateSuccess.value = 'Currency updated successfully!'
      // Clear success message after 3 seconds
      setTimeout(() => {
        updateSuccess.value = null
      }, 3000)
    } else {
      updateError.value = result.error || 'Failed to update currency'
    }
  } catch (error) {
    updateError.value = 'An unexpected error occurred'
  } finally {
    isUpdating.value = false
  }
}

// Change password
const changePassword = async () => {
  try {
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      updateError.value = 'New passwords do not match'
      return
    }

    isUpdating.value = true
    updateError.value = null
    updateSuccess.value = null

    const result = await authStore.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    if (result.success) {
      updateSuccess.value = 'Password changed successfully!'
      // Clear form and success message
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      setTimeout(() => {
        updateSuccess.value = null
      }, 3000)
    } else {
      updateError.value = result.error || 'Failed to change password'
    }
  } catch (error) {
    updateError.value = 'An unexpected error occurred'
  } finally {
    isUpdating.value = false
  }
}

// Account management functions
const addAccount = async () => {
  try {
    isUpdating.value = true
    updateError.value = null
    updateSuccess.value = null

    const result = await accountsStore.createAccount(newAccount.value)
    
    if (result.success) {
      updateSuccess.value = 'Account created successfully!'
      showAddAccountModal.value = false
      newAccount.value = {
        name: '',
        type: 'CHECKING',
        balance: 0,
        currency: authStore.user?.currency || 'USD'
      }
      setTimeout(() => {
        updateSuccess.value = null
      }, 3000)
    } else {
      updateError.value = result.error || 'Failed to create account'
    }
  } catch (error) {
    updateError.value = 'An unexpected error occurred'
  } finally {
    isUpdating.value = false
  }
}

const editAccount = (account: any) => {
  editingAccount.value = account
  newAccount.value = {
    name: account.name,
    type: account.type,
    balance: account.balance,
    currency: account.currency
  }
  showEditAccountModal.value = true
}

const updateAccount = async () => {
  try {
    isUpdating.value = true
    updateError.value = null
    updateSuccess.value = null

    const result = await accountsStore.updateAccount(editingAccount.value!.id, newAccount.value)
    
    if (result.success) {
      updateSuccess.value = 'Account updated successfully!'
      showEditAccountModal.value = false
      editingAccount.value = null
      setTimeout(() => {
        updateSuccess.value = null
      }, 3000)
    } else {
      updateError.value = result.error || 'Failed to update account'
    }
  } catch (error) {
    updateError.value = 'An unexpected error occurred'
  } finally {
    isUpdating.value = false
  }
}

const deleteAccount = async (account: any) => {
  if (!confirm(`Are you sure you want to delete "${account.name}"? This action cannot be undone.`)) {
    return
  }

  try {
    isUpdating.value = true
    updateError.value = null
    updateSuccess.value = null

    const result = await accountsStore.deleteAccount(account.id)
    
    if (result.success) {
      updateSuccess.value = 'Account deleted successfully!'
      setTimeout(() => {
        updateSuccess.value = null
      }, 3000)
    } else {
      updateError.value = result.error || 'Failed to delete account'
    }
  } catch (error) {
    updateError.value = 'An unexpected error occurred'
  } finally {
    isUpdating.value = false
  }
}

</script>

<template>
  <!-- Settings content without duplicate background -->
  <div class="space-premium">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-premium-large">Settings</h1>
        <p class="mt-2 text-lg text-white/70">
          Manage your account and preferences
        </p>
      </div>
    </div>

    <!-- Settings Tabs with glassmorphism -->
    <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-blue-500/20 relative overflow-hidden">
      <!-- Enhanced background effects -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/8 to-white/4 rounded-3xl"></div>
      <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent rounded-3xl"></div>
      
      <!-- Animated border gradient -->
      <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-50"></div>
      <div class="absolute inset-[1px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-3xl"></div>
      
      <div class="relative z-10">
        <div class="border-b border-white/20">
        <nav class="flex space-x-8 px-8" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-6 px-1 border-b-2 font-semibold text-base transition-all duration-300',
              activeTab === tab.id
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-white/70 hover:text-white hover:border-white/40'
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
        </div>
      </div>

      <div class="p-8">
        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" class="space-premium">
          <h3 class="text-2xl font-bold text-white tracking-wide">Profile Settings</h3>
          
          <!-- Success/Error Messages -->
          <div v-if="updateSuccess" class="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
            <p class="text-green-300">{{ updateSuccess }}</p>
          </div>
          
          <div v-if="updateError" class="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
            <p class="text-red-300">{{ updateError }}</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label class="block text-base font-semibold text-white/90 mb-2">
                Full Name
              </label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label class="block text-base font-semibold text-white/90 mb-2">
                Email
              </label>
              <input
                v-model="formData.email"
                type="email"
                class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label class="block text-base font-semibold text-white/90 mb-2">
                Timezone
              </label>
              <select
                v-model="formData.timezone"
                class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
              >
                <option value="UTC-8">UTC-8 (PST)</option>
                <option value="UTC-7">UTC-7 (MST)</option>
                <option value="UTC-6">UTC-6 (CST)</option>
                <option value="UTC-5">UTC-5 (EST)</option>
                <option value="UTC+0">UTC+0 (GMT)</option>
                <option value="UTC+1">UTC+1 (CET)</option>
              </select>
            </div>
            
            <div>
              <label class="block text-base font-semibold text-white/90 mb-2">
                Currency
              </label>
              <select
                v-model="formData.currency"
                class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
              >
                <option 
                  v-for="currency in availableCurrencies" 
                  :key="currency.code" 
                  :value="currency.code"
                >
                  {{ currency.code }} ({{ currency.symbol }}) - {{ currency.name }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="pt-6">
            <button 
              @click="updateProfile"
              :disabled="isUpdating"
              class="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {{ isUpdating ? 'Updating...' : 'Save Changes' }}
            </button>
          </div>

          <!-- Password Change Section -->
          <div class="mt-12 pt-8 border-t border-white/20">
            <h4 class="text-xl font-bold text-white mb-6">Change Password</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="block text-base font-semibold text-white/90 mb-2">
                  Current Password
                </label>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                  placeholder="Enter current password"
                />
              </div>
              
              <div>
                <label class="block text-base font-semibold text-white/90 mb-2">
                  New Password
                </label>
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <label class="block text-base font-semibold text-white/90 mb-2">
                  Confirm New Password
                </label>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            
            <div class="mt-6">
              <button 
                @click="changePassword"
                :disabled="isUpdating"
                class="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {{ isUpdating ? 'Updating...' : 'Change Password' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Accounts Tab -->
        <div v-if="activeTab === 'accounts'" class="space-premium">
          <div class="flex justify-between items-center">
            <h3 class="text-2xl font-bold text-white tracking-wide">Account Management</h3>
            <button 
              @click="showAddAccountModal = true"
              class="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              + Add Account
            </button>
          </div>
          
          <!-- Loading State -->
          <div v-if="accountsStore.loading" class="flex items-center justify-center py-12">
            <div class="text-white/60 text-lg">Loading accounts...</div>
          </div>
          
          <!-- Accounts List -->
          <div v-else-if="accountsStore.accounts.length > 0" class="space-y-4">
            <div
              v-for="account in accountsStore.accounts"
              :key="account.id"
              class="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-lg font-semibold text-white">{{ account.name }}</h4>
                  <p class="text-sm text-white/70 capitalize">{{ account.type }} • {{ account.currency }}</p>
                  <p class="text-xs text-white/50" :class="account.isActive ? 'text-green-400' : 'text-red-400'">
                    {{ account.isActive ? 'Active' : 'Inactive' }}
                  </p>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="text-right">
                    <p class="text-xl font-bold" :class="account.balance >= 0 ? 'text-green-400' : 'text-red-400'">
                      {{ account.currency }} {{ account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                    </p>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      @click="editAccount(account)"
                      class="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-300"
                      title="Edit account"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                      @click="deleteAccount(account)"
                      class="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                      title="Delete account"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-else class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="text-white/60 text-lg mb-2">No accounts found</div>
              <div class="text-white/40 text-sm">Add your first account to get started!</div>
            </div>
          </div>
        </div>


        <!-- Currencies Tab -->
        <div v-if="activeTab === 'currencies'" class="space-premium">
          <h3 class="text-2xl font-bold text-white tracking-wide">Currency Settings</h3>
          
          <!-- Success/Error Messages -->
          <div v-if="updateSuccess" class="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
            <p class="text-green-300">{{ updateSuccess }}</p>
          </div>
          
          <div v-if="updateError" class="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
            <p class="text-red-300">{{ updateError }}</p>
          </div>
          
          <div class="space-y-6">
            <div class="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <h4 class="text-lg font-semibold text-white mb-4">Default Currency</h4>
              <p class="text-white/70 mb-4">Set your default currency for new accounts and transactions.</p>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  v-for="currency in availableCurrencies"
                  :key="currency.code"
                  @click="formData.currency = currency.code"
                  :class="[
                    'p-4 rounded-xl border-2 cursor-pointer transition-all duration-300',
                    formData.currency === currency.code
                      ? 'border-blue-400 bg-blue-500/20'
                      : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                  ]"
                >
                  <div class="text-center">
                    <div class="text-2xl font-bold text-white mb-1">{{ currency.symbol }}</div>
                    <div class="text-sm text-white/70">{{ currency.code }}</div>
                    <div class="text-xs text-white/50">{{ currency.name }}</div>
                  </div>
                </div>
              </div>
              
              <div class="mt-6">
                <button 
                  @click="updateCurrency"
                  :disabled="isUpdating"
                  class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {{ isUpdating ? 'Updating...' : 'Update Currency' }}
                </button>
              </div>
            </div>
            
            <div class="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <h4 class="text-lg font-semibold text-white mb-4">Currency Information</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 class="text-md font-semibold text-white/90 mb-2">Current Default</h5>
                  <p class="text-white/70">{{ formData.currency }} - {{ availableCurrencies.find(c => c.code === formData.currency)?.name }}</p>
                </div>
                <div>
                  <h5 class="text-md font-semibold text-white/90 mb-2">Account Currencies</h5>
                  <p class="text-white/70">
                    {{ [...new Set(accountsStore.accounts.map(acc => acc.currency))].join(', ') || 'No accounts yet' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="activeTab === 'rules'" class="space-premium">
          <h3 class="text-2xl font-bold text-white tracking-wide">Automation Rules</h3>
          <p class="text-white/70">Automation and categorization rules will be implemented here.</p>
        </div>
        
        <div v-if="activeTab === 'backup'" class="space-premium">
          <h3 class="text-2xl font-bold text-white tracking-wide">Backup & Export</h3>
          <p class="text-white/70">Data backup and export features will be implemented here.</p>
        </div>
      </div>
    </div>

    <!-- Add Account Modal -->
    <div v-if="showAddAccountModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-white">Add Account</h3>
          <button 
            @click="showAddAccountModal = false"
            class="text-white/60 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <form @submit.prevent="addAccount" class="space-y-4">
          <div>
            <label class="block text-white/90 mb-2">Account Name</label>
            <input 
              v-model="newAccount.name"
              type="text" 
              required
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
              placeholder="Enter account name"
            />
          </div>
          
          <div>
            <label class="block text-white/90 mb-2">Account Type</label>
            <select 
              v-model="newAccount.type"
              required
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="CHECKING">Checking</option>
              <option value="SAVINGS">Savings</option>
              <option value="CREDIT">Credit Card</option>
              <option value="INVESTMENT">Investment</option>
            </select>
          </div>
          
          <div>
            <label class="block text-white/90 mb-2">Initial Balance</label>
            <input 
              v-model="newAccount.balance"
              type="number" 
              step="0.01"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
              placeholder="Enter initial balance"
            />
          </div>
          
          <div>
            <label class="block text-white/90 mb-2">Currency</label>
            <select 
              v-model="newAccount.currency"
              required
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option 
                v-for="currency in availableCurrencies" 
                :key="currency.code" 
                :value="currency.code"
              >
                {{ currency.code }} ({{ currency.symbol }}) - {{ currency.name }}
              </option>
            </select>
          </div>
          
          <div class="flex space-x-4 pt-4">
            <button 
              type="submit"
              class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Add Account
            </button>
            <button 
              type="button"
              @click="showAddAccountModal = false"
              class="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Account Modal -->
    <div v-if="showEditAccountModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-white">Edit Account</h3>
          <button 
            @click="showEditAccountModal = false"
            class="text-white/60 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <form @submit.prevent="updateAccount" class="space-y-4">
          <div>
            <label class="block text-white/90 mb-2">Account Name</label>
            <input 
              v-model="newAccount.name"
              type="text" 
              required
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
              placeholder="Enter account name"
            />
          </div>
          
          <div>
            <label class="block text-white/90 mb-2">Account Type</label>
            <select 
              v-model="newAccount.type"
              required
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="CHECKING">Checking</option>
              <option value="SAVINGS">Savings</option>
              <option value="CREDIT">Credit Card</option>
              <option value="INVESTMENT">Investment</option>
            </select>
          </div>
          
          <div>
            <label class="block text-white/90 mb-2">Balance</label>
            <input 
              v-model="newAccount.balance"
              type="number" 
              step="0.01"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
              placeholder="Enter balance"
            />
          </div>
          
          <div>
            <label class="block text-white/90 mb-2">Currency</label>
            <select 
              v-model="newAccount.currency"
              required
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option 
                v-for="currency in availableCurrencies" 
                :key="currency.code" 
                :value="currency.code"
              >
                {{ currency.code }} ({{ currency.symbol }}) - {{ currency.name }}
              </option>
            </select>
          </div>
          
          <div class="flex space-x-4 pt-4">
            <button 
              type="submit"
              class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Update Account
            </button>
            <button 
              type="button"
              @click="showEditAccountModal = false"
              class="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
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

/* Smooth transitions */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Input focus effects */
input:focus, select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Button hover effects */
button:hover {
  transform: translateY(-1px);
}
</style>
