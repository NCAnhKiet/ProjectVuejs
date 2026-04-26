import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)

  const login = (userData) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('user')
  }

  const updateUser = (userData) => {
    user.value = { ...user.value, ...userData }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  const isLoggedIn = computed(() => !!user.value)

  const unreadMessagesCount = ref(0)
  const friendRequestsCount = ref(0)

  const setUnreadCount = (count) => {
    unreadMessagesCount.value = count
  }

  const setFriendRequestsCount = (count) => {
    friendRequestsCount.value = count
  }

  return { 
    user, login, logout, updateUser, isLoggedIn, 
    unreadMessagesCount, setUnreadCount,
    friendRequestsCount, setFriendRequestsCount
  }
})
