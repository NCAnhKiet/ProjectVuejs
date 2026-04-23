<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card shadow-sm">
          <div class="card-body p-4 text-center">
            <h4 class="fw-bold mb-3">
              <i class="bi bi-envelope-check me-2"></i>Xác thực Email
            </h4>

            <p class="text-muted">
              Nhập mã đã gửi về email của bạn
            </p>

            <div v-if="errorMessage" class="alert alert-danger">
              {{ errorMessage }}
            </div>

            <input 
              v-model="code"
              class="form-control mb-3 text-center"
              placeholder="Nhập mã 6 số"
            >

            <button 
              class="btn btn-primary w-100"
              @click="verify"
            >
              Xác thực
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const router = useRouter()
const code = ref('')
const errorMessage = ref('')

const verify = async () => {
  try {
    const id = route.params.id
    const res = await api.get(`/users/${id}`)

    console.log('DB code:', res.data.verifyCode)
    console.log('Input code:', code.value)

    if (res.data.verifyCode === code.value.trim()) {
      await api.put(`/users/${id}`, {
        ...res.data,
        isVerified: true,
        verifyCode: null
      })

      alert('✅ Xác thực thành công!')
      router.push('/login')
    } else {
      errorMessage.value = '❌ Mã xác thực không đúng'
    }
  } catch (err) {
    console.error(err)
    errorMessage.value = '❌ Lỗi server'
  }
}

</script>
