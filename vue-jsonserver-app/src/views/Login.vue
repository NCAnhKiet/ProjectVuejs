<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <!-- Header -->
            <div class="text-center mb-4">
              <h3 class="fw-bold">
                <i class="bi bi-shield-lock me-2"></i>Đăng nhập
              </h3>
              <p class="text-muted">Chào mừng bạn quay trở lại!</p>
            </div>



            <!-- Login Form -->
            <form @submit.prevent="login">
              <div class="mb-3">
                <label class="form-label">Email</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-envelope"></i>
                  </span>
                  <input 
                    v-model="email" 
                    type="email"
                    class="form-control" 
                    placeholder="email@example.com"
                    required
                  >
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label class="form-label mb-0">Mật khẩu</label>
                  <router-link to="/forgot-password" class="text-decoration-none small">Quên mật khẩu?</router-link>
                </div>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-lock"></i>
                  </span>
                  <input 
                    v-model="password" 
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control" 
                    placeholder="Nhập mật khẩu"
                    required
                  >
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button"
                    @click="showPassword = !showPassword"
                  >
                    <i v-if="showPassword" class="bi bi-eye-slash"></i>
                    <i v-else class="bi bi-eye"></i>
                  </button>
                </div>
              </div>

              <!-- Remember Me -->
              <div class="mb-3 form-check">
                <input 
                  v-model="rememberMe"
                  type="checkbox" 
                  class="form-check-input" 
                  id="rememberMe"
                >
                <label class="form-check-label" for="rememberMe">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit" 
                class="btn btn-primary w-100 mb-3"
                :disabled="isLoading"
              >
                <span v-if="!isLoading">
                  <i class="bi bi-box-arrow-in-right me-2"></i>Đăng nhập
                </span>
                <span v-else>
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Đang đăng nhập...
                </span>
              </button>

              <!-- Register Link -->
              <div class="text-center">
                <span class="text-muted">Chưa có tài khoản? </span>
                <router-link to="/register" class="text-decoration-none fw-semibold">
                  <i class="bi bi-person-plus me-1"></i>Đăng ký ngay
                </router-link>
              </div>
            </form>
          </div>
        </div>

        <!-- Quick Info -->
        <div class="card mt-3 bg-light border-0">
          <div class="card-body text-center py-2">
            <small class="text-muted">
              <i class="bi bi-lightbulb me-1"></i>Demo: email@test.com / password123
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import Swal from 'sweetalert2'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const isLoading = ref(false)
const router = useRouter()
const authStore = useAuthStore()

const login = async () => {
  if (!email.value || !password.value) {
    Swal.fire('Cảnh báo', 'Vui lòng nhập đầy đủ thông tin!', 'warning')
    return
  }

  isLoading.value = true

  try {
    const res = await api.get(
      `/users?email=${email.value}&password=${password.value}`
    )

    if (res.data.length) {
      const userData = res.data[0]

      if (!userData.isVerified) {
        Swal.fire('Cảnh báo', 'Tài khoản chưa xác thực email!', 'warning')
        isLoading.value = false
        return
      }

      // Set online status
      await api.patch(`/users/${userData.id}`, { isOnline: true })
      userData.isOnline = true

      authStore.login(userData)

      if (rememberMe.value) {
        localStorage.setItem('rememberEmail', email.value)
      } else {
        localStorage.removeItem('rememberEmail')
      }

      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Đăng nhập thành công',
        timer: 1500,
        showConfirmButton: false
      })

      await router.push('/')
    } else {
      Swal.fire('Lỗi', 'Email hoặc mật khẩu không đúng!', 'error')
      isLoading.value = false
    }
  } catch (err) {
    console.error(err)
    Swal.fire('Lỗi', 'Không thể kết nối đến server. Vui lòng thử lại!', 'error')
    isLoading.value = false
  }
}

// Load remembered email
const rememberedEmail = localStorage.getItem('rememberEmail')
if (rememberedEmail) {
  email.value = rememberedEmail
  rememberMe.value = true
}
</script>
