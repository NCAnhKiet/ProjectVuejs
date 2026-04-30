<template>
  <nav class="app-nav">
    <div class="app-nav-container">
      <!-- Logo -->
      <router-link to="/" class="app-nav-brand d-none d-md-block">
        <i class="bi bi-infinity" style="font-size: 2.2rem;"></i>
      </router-link>

      <!-- Center Icons -->
      <div class="app-nav-icons">
        <router-link to="/" class="app-nav-item" active-class="active" title="Trang chủ">
          <i class="bi bi-house-door-fill"></i>
        </router-link>

        <router-link to="/explore" class="app-nav-item" active-class="active" title="Khám phá">
          <i class="bi bi-search"></i>
        </router-link>

        <router-link to="/create" class="app-nav-item" active-class="active" title="Đăng bài" v-if="user">
          <i class="bi bi-plus-square"></i>
        </router-link>

        <router-link v-if="user" to="/friends" class="app-nav-item" active-class="active" title="Bạn bè">
          <i class="bi bi-people"></i>
          <span v-if="friendRequestsCount > 0" class="position-absolute top-25 start-75 translate-middle badge rounded-pill bg-danger" style="font-size: 0.55rem; transform: translate(-20%, 20%);">
            {{ friendRequestsCount }}
          </span>
        </router-link>

        <router-link v-if="user" to="/messages" class="app-nav-item" active-class="active" title="Tin nhắn">
          <i class="bi bi-chat-dots"></i>
          <span v-if="unreadCount > 0" class="position-absolute top-25 start-75 translate-middle badge rounded-pill bg-danger" style="font-size: 0.55rem; transform: translate(-20%, 20%);">
            {{ unreadCount }}
          </span>
        </router-link>

        <router-link v-if="user" to="/profile" class="app-nav-item" active-class="active" title="Trang cá nhân">
          <i class="bi bi-person"></i>
        </router-link>
      </div>

      <!-- Right Side Actions -->
      <div class="d-flex align-items-center">
        <template v-if="!user">
          <router-link class="app-nav-action me-2" to="/login" style="background: transparent; color: #f3f5f7;">
            Đăng nhập
          </router-link>
          <router-link class="app-nav-action" to="/register">
            Đăng ký
          </router-link>
        </template>
        <template v-else>
          <div class="dropdown">
            <button class="btn btn-link text-light text-decoration-none p-0 d-flex align-items-center" data-bs-toggle="dropdown">
              <i class="bi bi-list" style="font-size: 1.8rem; color: #4d4d4d;"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow" style="border-radius: 12px; background-color: #181818; border: 1px solid #333;">
              <li class="dropdown-header">
                <div class="fw-semibold text-light">{{ user.name }}</div>
                <small class="text-muted">{{ user.email }}</small>
              </li>
              <li><hr class="dropdown-divider border-secondary"></li>
              <li>
                <button class="dropdown-item text-danger" @click="logout">Đăng xuất</button>
              </li>
            </ul>
          </div>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import messageService from '../services/messageService'
import friendService from '../services/friendService'
import api from '../services/api'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)
const unreadCount = computed(() => authStore.unreadMessagesCount)
const friendRequestsCount = computed(() => authStore.friendRequestsCount)

let pollInterval

const fetchNotifications = async () => {
  if (user.value) {
    try {
      const messages = await messageService.getAllMessages(user.value.id)
      const mCount = messages.filter(m => m.receiverId === user.value.id && !m.isRead).length
      authStore.setUnreadCount(mCount)

      const requests = await friendService.getPendingRequests(user.value.id)
      authStore.setFriendRequestsCount(requests.length)
    } catch (e) {
      console.error('Failed to fetch counts', e)
    }
  }
}

const setOfflineOnUnload = () => {
  if (user.value) {
    fetch(`http://localhost:3000/users/${user.value.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOnline: false }),
      keepalive: true
    }).catch(e => console.error(e))
  }
}

onMounted(() => {
  fetchNotifications()
  pollInterval = setInterval(fetchNotifications, 5000) 
  
  if (user.value) {
    api.patch(`/users/${user.value.id}`, { isOnline: true }).catch(e => console.error(e))
  }
  
  window.addEventListener('beforeunload', setOfflineOnUnload)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
  window.removeEventListener('beforeunload', setOfflineOnUnload)
})

const logout = async () => {
  const result = await Swal.fire({
    title: 'Đăng xuất?',
    text: "Bạn có chắc muốn đăng xuất?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Đăng xuất',
    cancelButtonText: 'Hủy',
    background: '#181818',
    color: '#f3f5f7'
  })

  if (result.isConfirmed) {
    if (user.value) {
      try {
        await api.patch(`/users/${user.value.id}`, { isOnline: false })
      } catch (e) {}
    }
    
    authStore.logout()
    router.push('/login')
  }
}
</script>