<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('profile')
const isDarkMode = ref(false)

const tabs = [
  { id: 'profile', name: 'Profile', icon: 'user' },
  { id: 'accounts', name: 'Accounts', icon: 'bank' },
  { id: 'categories', name: 'Categories', icon: 'tag' },
  { id: 'currencies', name: 'Currencies', icon: 'currency-dollar' },
  { id: 'rules', name: 'Rules', icon: 'cog' },
  { id: 'backup', name: 'Backup', icon: 'cloud' }
]

const userProfile = ref({
  name: 'Admin User',
  email: 'admin@example.com',
  timezone: 'UTC-5',
  currency: 'USD'
})

const accounts = ref([
  { name: 'Checking Account', type: 'checking', balance: 5000, currency: 'USD' },
  { name: 'Savings Account', type: 'savings', balance: 15000, currency: 'USD' },
  { name: 'Credit Card', type: 'credit', balance: -2500, currency: 'USD' }
])

const categories = ref([
  { name: 'Food', color: '#10B981', icon: '🍽️' },
  { name: 'Transport', color: '#F59E0B', icon: '🚗' },
  { name: 'Entertainment', color: '#8B5CF6', icon: '🎬' },
  { name: 'Housing', color: '#3B82F6', icon: '🏠' },
  { name: 'Income', color: '#059669', icon: '💰' }
])
</script>

<template>
  <!-- Settings content without duplicate background -->
  <div class="space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-4xl font-bold text-white tracking-wide">Settings</h1>
        <p class="mt-2 text-lg text-white/70">
          Manage your account and preferences
        </p>
      </div>
    </div>

    <!-- Settings Tabs with glassmorphism -->
    <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-blue-500/20">
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

      <div class="p-8">
        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" class="space-y-8">
          <h3 class="text-2xl font-bold text-white tracking-wide">Profile Settings</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label class="block text-base font-semibold text-white/90 mb-2">
                Full Name
              </label>
              <input
                v-model="userProfile.name"
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
                v-model="userProfile.email"
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
                v-model="userProfile.timezone"
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
                v-model="userProfile.currency"
                class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>
          </div>
          
          <div class="pt-6">
            <button class="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
              Save Changes
            </button>
          </div>
        </div>

        <!-- Accounts Tab -->
        <div v-if="activeTab === 'accounts'" class="space-y-8">
          <h3 class="text-2xl font-bold text-white tracking-wide">Account Management</h3>
          
          <div class="space-y-6">
            <div
              v-for="account in accounts"
              :key="account.name"
              class="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-lg font-semibold text-white">{{ account.name }}</h4>
                  <p class="text-sm text-white/70 capitalize">{{ account.type }} • {{ account.currency }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xl font-bold" :class="account.balance >= 0 ? 'text-green-400' : 'text-red-400'">
                    {{ account.currency }} {{ account.balance.toLocaleString() }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="pt-6">
            <button class="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
              + Add Account
            </button>
          </div>
        </div>

        <!-- Categories Tab -->
        <div v-if="activeTab === 'categories'" class="space-y-8">
          <h3 class="text-2xl font-bold text-white tracking-wide">Transaction Categories</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="category in categories"
              :key="category.name"
              class="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div class="flex items-center space-x-4">
                <div class="text-3xl">{{ category.icon }}</div>
                <div>
                  <h4 class="text-lg font-semibold text-white">{{ category.name }}</h4>
                  <div class="w-6 h-6 rounded-full mt-2" :style="{ backgroundColor: category.color }"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="pt-6">
            <button class="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
              + Add Category
            </button>
          </div>
        </div>

        <!-- Other tabs can be implemented similarly -->
        <div v-if="activeTab === 'currencies'" class="space-y-8">
          <h3 class="text-2xl font-bold text-white tracking-wide">Currency Settings</h3>
          <p class="text-white/70">Currency management features will be implemented here.</p>
        </div>
        
        <div v-if="activeTab === 'rules'" class="space-y-8">
          <h3 class="text-2xl font-bold text-white tracking-wide">Automation Rules</h3>
          <p class="text-white/70">Automation and categorization rules will be implemented here.</p>
        </div>
        
        <div v-if="activeTab === 'backup'" class="space-y-8">
          <h3 class="text-2xl font-bold text-white tracking-wide">Backup & Export</h3>
          <p class="text-white/70">Data backup and export features will be implemented here.</p>
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
