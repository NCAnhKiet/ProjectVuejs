<template>
  <div class="container-fluid mt-4">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <!-- Header -->
        <div class="card shadow-sm mb-4 bg-light border-0">
          <div class="card-body text-center py-4">
            <div class="avatar-lg mx-auto mb-3">
              {{ userInitials }}
            </div>
            <h3 class="fw-bold mb-1">
              <i class="bi bi-person-circle me-2"></i>{{ user.name }}
            </h3>
            <p class="text-muted mb-0">{{ user.email }}</p>
          </div>
        </div>

        <!-- Alert -->
        <div 
          v-if="successMessage" 
          class="alert alert-success alert-dismissible fade show" 
        >
          <i class="bi bi-check-circle-fill me-2"></i>{{ successMessage }}
          <button class="btn-close" @click="successMessage = ''"></button>
        </div>

        <div 
          v-if="errorMessage" 
          class="alert alert-danger alert-dismissible fade show" 
        >
          <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
          <button class="btn-close" @click="errorMessage = ''"></button>
        </div>

        <!-- Profile Layout -->
        <div class="row">
          <!-- Left Info -->
          <div class="col-md-4 mb-3">
            <div class="card shadow-sm h-100">
              <div class="card-body">
                <h5 class="fw-bold text-info mb-3">
                  <i class="bi bi-info-circle me-2"></i>Thông tin
                </h5>
                <p><strong>Tên:</strong> {{ user.name }}</p>
                <p><strong>Email:</strong> {{ user.email }}</p>
                <p>
                  <strong>Ngày tạo:</strong><br>
                  {{ formatDate(user.createdAt) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Right Form -->
          <div class="col-md-8">
            <div class="card shadow-sm">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-3 text-info">
                  <i class="bi bi-pencil-square me-2"></i>Cập nhật hồ sơ
                </h5>

                <form @submit.prevent="updateProfile">
                  <!-- Name -->
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Họ và tên</label>
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="bi bi-person"></i>
                      </span>
                      <input 
                        v-model="user.name" 
                        type="text"
                        class="form-control"
                        required
                      >
                    </div>
                  </div>

                  <!-- Email -->
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Email</label>
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="bi bi-envelope"></i>
                      </span>
                      <input 
                        v-model="user.email" 
                        type="email"
                        class="form-control"
                        required
                      >
                    </div>
                  </div>

                  <!-- Password -->
                  <div class="mb-4">
                    <label class="form-label fw-semibold">Mật khẩu mới</label>
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="bi bi-lock"></i>
                      </span>
                      <input 
                        v-model="user.password" 
                        :type="showPassword ? 'text' : 'password'"
                        class="form-control"
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
                    <div class="form-text">
                      Để trống nếu không muốn đổi mật khẩu
                    </div>
                  </div>

                  <!-- Buttons -->
                  <div class="d-flex gap-2">
                    <button 
                      type="submit"
                      class="btn btn-primary"
                      :disabled="isUpdating"
                    >
                      <span v-if="!isUpdating">
                        <i class="bi bi-save me-1"></i>Lưu
                      </span>
                      <span v-else>
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Đang lưu...
                      </span>
                    </button>

                    <button 
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="$router.push('/')"
                    >
                      <i class="bi bi-arrow-left me-1"></i>Trang chủ
                    </button>
                  </div>
                </form>
                
                <!-- My Posts -->
<div class="card shadow-sm mt-4">
  <div class="card-body">
    <h5 class="fw-bold text-info mb-3">
      <i class="bi bi-journal-text me-2"></i>Bài viết của tôi ({{ myPosts.length }})
    </h5>

    <div v-if="loadingPosts" class="text-center py-3">
      <span class="spinner-border spinner-border-sm"></span>
    </div>

    <div v-else-if="myPosts.length === 0" class="text-muted">
      Bạn chưa đăng bài viết nào.
    </div>

    <div v-else>
      <div 
        v-for="p in myPosts" 
        :key="p.id"
        class="border-bottom pb-2 mb-2"
      >
          <img v-if="p.image" :src="p.image" class="img-fluid rounded mb-2" style="max-height:120px;object-fit:cover"/>
        <h6 class="mb-1">{{ p.title }}</h6>
        <small class="text-muted">
          <i class="bi bi-clock me-1"></i>{{ formatDate(p.createdAt) }}
        </small>

        <div class="mt-1">
          <router-link 
            :to="`/post/${p.id}`" 
            class="btn btn-sm btn-outline-primary me-2"
          >
            <i class="bi bi-eye me-1"></i>Xem
          </router-link>

          <button 
            class="btn btn-sm btn-outline-danger"
            @click="deleteMyPost(p.id)"
          >
            <i class="bi bi-trash me-1"></i>Xóa
          </button>
        </div>
      </div>
    </div>
  </div>
</div>


              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>



<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import { onMounted } from 'vue'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
if (!user.value.createdAt) {
  user.value.createdAt = new Date().toISOString()
  localStorage.setItem('user', JSON.stringify(user.value))
}
const showPassword = ref(false)
const isUpdating = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const myPosts = ref([])
const loadingPosts = ref(false)

const userInitials = computed(() => {
  if (!user.value.name) return 'U'
  const names = user.value.name.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return user.value.name[0].toUpperCase()
})

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('vi-VN', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const updateProfile = async () => {
  if (!user.value.name || !user.value.email) {
    errorMessage.value = '⚠️ Vui lòng nhập đầy đủ thông tin!'
    return
  }

  isUpdating.value = true
  errorMessage.value = ''

  try {
    await api.put(`/users/${user.value.id}`, user.value)
    localStorage.setItem('user', JSON.stringify(user.value))
    
    successMessage.value = '✅ Cập nhật thông tin thành công!'
    
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Lỗi khi cập nhật:', error)
    errorMessage.value = '❌ Cập nhật thất bại. Vui lòng thử lại!'
  } finally {
    isUpdating.value = false
  }
}

const loadMyPosts = async () => {
  loadingPosts.value = true
  try {
    const res = await api.get(`/posts?userId=${user.value.id}`)
    myPosts.value = res.data
  } catch (err) {
    console.log(err)
  } finally {
    loadingPosts.value = false
  }
}

onMounted(() => {
  loadMyPosts()
})

const deleteMyPost = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return

  try {
    await api.delete(`/posts/${id}`)
    myPosts.value = myPosts.value.filter(p => p.id !== id)
  } catch (err) {
    alert('Xóa thất bại')
  }
}

</script>

<style scoped>
.avatar-lg {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 34px;
  box-shadow: 0 4px 12px rgba(0,0,0,.2);
}
</style>