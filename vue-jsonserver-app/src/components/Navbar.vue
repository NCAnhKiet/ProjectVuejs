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
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const user = computed(() => {
  const userData = localStorage.getItem('user')
  return userData ? JSON.parse(userData) : null
})

const userInitials = computed(() => {
  if (!user.value || !user.value.name) return 'U'
  const names = user.value.name.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return user.value.name[0].toUpperCase()
})

const logout = () => {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    localStorage.removeItem('user')
    router.push('/login')
    location.reload()
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
</style>