<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <!-- Header -->
            <div class="text-center mb-4">
              <h3 class="fw-bold">
                <i class="bi bi-person-plus-fill me-2"></i>Đăng ký tài khoản
              </h3>
              <p class="text-muted">Tạo tài khoản mới để bắt đầu</p>
            </div>



            <!-- Register Form -->
            <form @submit.prevent="register">
              <div class="mb-3">
                <label class="form-label">Họ và tên</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-person"></i>
                  </span>
                  <input 
                    v-model="name" 
                    type="text"
                    class="form-control" 
                    placeholder="Nguyễn Văn A"
                    required
                  >
                </div>
              </div>

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
                <label class="form-label">Mật khẩu</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-lock"></i>
                  </span>
                  <input 
                    v-model="password" 
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control" 
                    placeholder="Tối thiểu 6 ký tự"
                    minlength="6"
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

              <div class="mb-3">
                <label class="form-label">Xác nhận mật khẩu</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-shield-lock"></i>
                  </span>
                  <input 
                    v-model="confirmPassword" 
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control" 
                    placeholder="Nhập lại mật khẩu"
                    required
                  >
                </div>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit" 
                class="btn btn-success w-100 mb-3"
                :disabled="isRegistering"
              >
                <span v-if="!isRegistering">
                  <i class="bi bi-rocket-takeoff me-2"></i>Đăng ký
                </span>
                <span v-else>
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Đang đăng ký...
                </span>
              </button>

              <!-- Login Link -->
              <div class="text-center">
                <span class="text-muted">Đã có tài khoản? </span>
                <router-link to="/login" class="text-decoration-none fw-semibold">
                  <i class="bi bi-box-arrow-in-right me-1"></i>Đăng nhập ngay
                </router-link>
              </div>
            </form>
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
import emailjs from '@emailjs/browser'
import Swal from 'sweetalert2'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const isRegistering = ref(false)
const router = useRouter()

const register = async () => {
  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    Swal.fire('Cảnh báo', 'Vui lòng nhập đầy đủ thông tin!', 'warning')
    return
  }

  if (password.value.length < 6) {
    Swal.fire('Cảnh báo', 'Mật khẩu phải có ít nhất 6 ký tự!', 'warning')
    return
  }

  if (password.value !== confirmPassword.value) {
    Swal.fire('Cảnh báo', 'Mật khẩu xác nhận không khớp!', 'warning')
    return
  }

  isRegistering.value = true

  try {
    const existingUsers = await api.get(`/users?email=${email.value}`)
    if (existingUsers.data.length > 0) {
      Swal.fire('Cảnh báo', 'Email đã được đăng ký!', 'warning')
      isRegistering.value = false
      return
    }

    // tạo mã
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        // gửi email
    await emailjs.send(
      'service_qqoueom',
      'template_os1hukh',
      {
        name: name.value,
        code: verifyCode,
        to_email: email.value
      },
      'yEmGfervhOcGe4T3H'
    )

    // lưu user
    const res = await api.post('/users', {
      name: name.value,
      email: email.value,
      password: password.value,
      createdAt: new Date().toISOString(),
      isVerified: false,
      verifyCode
    })

    Swal.fire({
      icon: 'success',
      title: 'Đăng ký thành công!',
      text: 'Mã xác thực đã được gửi về email!',
      timer: 2000,
      showConfirmButton: false
    })
    router.push(`/verify/${res.data.id}`)

  } catch (error) {
    console.log('EMAIL ERROR:', error)
    Swal.fire('Lỗi', 'Không gửi được email!', 'error')
  } finally {
    isRegistering.value = false
  }
}

</script>