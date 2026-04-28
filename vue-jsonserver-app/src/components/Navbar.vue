<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
    <div class="container">
      <router-link class="navbar-brand fw-bold fs-4" to="/">
        <i class="bi bi-journal-text me-2"></i> BlogVue
      </router-link>

      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-lg-center">
          <li class="nav-item">
            <router-link class="nav-link px-3" to="/">
              <i class="bi bi-house-door me-1"></i> Trang chủ
            </router-link>
          </li>

          <li v-if="user" class="nav-item">
            <router-link class="nav-link px-3 position-relative" to="/messages">
              <i class="bi bi-chat-dots me-1"></i> Tin nhắn
              <span v-if="unreadCount > 0" class="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.6rem;">
                {{ unreadCount }}
              </span>
            </router-link>
          </li>

          <li v-if="user" class="nav-item">
            <router-link class="nav-link px-3 position-relative" to="/friends">
              <i class="bi bi-people me-1"></i> Bạn bè
              <span v-if="friendRequestsCount > 0" class="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-warning text-dark badge-glow" style="font-size: 0.6rem;">
                {{ friendRequestsCount }}
              </span>
            </router-link>
          </li>

          <template v-if="!user">
            <li class="nav-item">
              <router-link class="nav-link px-3" to="/login">
                <i class="bi bi-box-arrow-in-right me-1"></i> Đăng nhập
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="btn btn-outline-light rounded-pill px-4 ms-lg-2 mt-2 mt-lg-0" to="/register">
                <i class="bi bi-person-plus me-1"></i> Đăng ký
              </router-link>
            </li>
          </template>

          <template v-else>
            <li class="nav-item dropdown ms-lg-2">
              <a 
                class="nav-link dropdown-toggle d-flex align-items-center" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown"
              >
                <span class="user-avatar me-2">{{ userInitials }}</span>
                <span class="d-none d-lg-inline">{{ user.name }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li class="dropdown-header">
                  <div class="fw-semibold">{{ user.name }}</div>
                  <small class="text-muted">{{ user.email }}</small>
                </li>
                <li><hr class="dropdown-divider"></li>
                 <li>
                  <router-link class="dropdown-item" to="/profile">
                    <i class="bi bi-person me-2"></i> Trang cá nhân
                  </router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <button class="dropdown-item text-danger" @click="logout">
                    <i class="bi bi-box-arrow-right me-2"></i> Đăng xuất
                  </button>
                </li>
              </ul>
            </li>
          </template>
        </ul>
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

const userInitials = computed(() => {
  if (!user.value || !user.value.name) return 'U'
  const names = user.value.name.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return user.value.name[0].toUpperCase()
})

let pollInterval

const fetchNotifications = async () => {
  if (user.value) {
    try {
      // Unread messages
      const messages = await messageService.getAllMessages(user.value.id)
      const mCount = messages.filter(m => m.receiverId === user.value.id && !m.isRead).length
      authStore.setUnreadCount(mCount)

      // Pending friend requests
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
  
  // Set online status when app loads with existing session
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
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Đăng xuất',
    cancelButtonText: 'Hủy'
  })

  if (result.isConfirmed) {
    if (user.value) {
      try {
        await api.patch(`/users/${user.value.id}`, { isOnline: false })
      } catch (e) {
        console.error('Failed to set offline status', e)
      }
    }
    
    authStore.logout()
    router.push('/login')
    Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Đã đăng xuất',
      timer: 1500,
      showConfirmButton: false
    })
  }
}
</script>

<style scoped>
.user-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #fff;
  color: #212529;
  border-radius: 50%;
  font-weight: bold;
  font-size: 14px;
}

.nav-link.router-link-active {
  font-weight: 600;
  color: #fff !important;
}

.dropdown-menu {
  min-width: 220px;
}

.dropdown-header {
  padding: 12px 16px;
  background: #f8f9fa;
}
.badge-glow {
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.8);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.2); }
  100% { transform: translate(-50%, -50%) scale(1); }
}
</style>