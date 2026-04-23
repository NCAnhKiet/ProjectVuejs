<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="fw-bold"><i class="bi bi-pencil-square me-2"></i>Tạo bài viết mới</h2>
          <button class="btn btn-outline-secondary" @click="router.push('/')">
           <i class="bi bi-arrow-left me-1"></i>Quay lại
          </button>
        </div>

        <!-- Alert Message -->
        <div 
          v-if="errorMessage" 
          class="alert alert-danger alert-dismissible fade show" 
          role="alert"
        >
          {{ errorMessage }}
          <button 
            type="button" 
            class="btn-close" 
            @click="errorMessage = ''"
          ></button>
        </div>

        <div 
          v-if="successMessage" 
          class="alert alert-success alert-dismissible fade show" 
          role="alert"
        >
          {{ successMessage }}
          <button 
            type="button" 
            class="btn-close" 
            @click="successMessage = ''"
          ></button>
        </div>

        <!-- Form Card -->
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <form @submit.prevent="addPost">
              <div class="mb-3">
  <label class="form-label fw-semibold">Ảnh bài viết</label>
  <input 
    type="file" 
    class="form-control"
    accept="image/*"
    @change="handleImage"
  />
</div>

<div v-if="previewImage" class="mb-3">
  <img :src="previewImage" class="img-fluid rounded" />
</div>

              <!-- Title Input -->
              <div class="mb-4">
                <label class="form-label fw-semibold">Tiêu đề</label>
                <input 
                  v-model="title" 
                  type="text"
                  class="form-control form-control-lg" 
                  placeholder="Nhập tiêu đề bài viết..."
                  maxlength="150"
                  required
                >
                <div class="form-text text-end">
                  {{ title.length }}/150 ký tự
                </div>
              </div>

              <!-- Content Textarea -->
              <div class="mb-4">
                <label class="form-label fw-semibold">Nội dung</label>
                <textarea 
                  v-model="content" 
                  class="form-control" 
                  rows="10"
                  placeholder="Viết nội dung bài viết của bạn..."
                  style="resize: vertical;"
                  required
                ></textarea>
                <div class="form-text">
                  {{ wordCount }} từ • Khoảng {{ readingTime }} phút đọc
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="d-grid gap-2">
                <button 
                  type="submit"
                  class="btn btn-primary btn-lg" 
                  :disabled="!canPublish || isPublishing"
                >
                  <span v-if="!isPublishing"><i class="bi bi-send me-2"></i> Đăng bài</span>
                  <span v-else>
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Đang đăng...
                  </span>
                </button>
                <button 
                  type="button"
                  class="btn btn-outline-secondary" 
                  @click="saveDraft"
                >
                  <i class="bi bi-save me-2"></i> Lưu nháp
                </button>
              </div>
            </form>
          </div>
        </div>


        <!-- Preview Card -->
<div v-if="title || content || previewImage" class="card shadow-sm mt-4">
  <div class="card-header bg-light">
    <h5 class="mb-0">
      <i class="bi bi-eye me-2"></i>Xem trước
    </h5>
  </div>

  <div class="card-body">
    <div class="row g-4 align-items-start">

      <!-- Cột ảnh -->
      <div v-if="previewImage" class="col-md-5">
        <img
          :src="previewImage"
          class="img-fluid rounded"
          style="max-height:350px; object-fit:cover;"
        />
      </div>

      <!-- Cột nội dung -->
      <div :class="previewImage ? 'col-md-7' : 'col-12'">
        <h3 class="fw-bold">
          {{ title || 'Chưa có tiêu đề' }}
        </h3>

        <p class="mt-3" style="white-space: pre-wrap; line-height: 1.8;">
          {{ content || 'Chưa có nội dung...' }}
        </p>

        <div class="d-flex align-items-center gap-2 mt-3 pt-3 border-top">
          <div class="avatar-sm">
            {{ userInitials }}
          </div>
          <div>
            <div class="fw-semibold">
              {{ user?.name || 'Anonymous' }}
            </div>
            <small class="text-muted">
              {{ formatDate(new Date()) }}
            </small>
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
import api from '../services/api'
import { useRouter } from 'vue-router'

const title = ref('')
const content = ref('')
const isPublishing = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const router = useRouter()
const image = ref('')
const previewImage = ref(null)

const resizeImage = (file, max = 800) => {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(max / img.width, max / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.src = URL.createObjectURL(file)
  })
}


const user = JSON.parse(localStorage.getItem('user') || '{}')

const userInitials = computed(() => {
  if (!user.name) return 'U'
  const names = user.name.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return user.name[0].toUpperCase()
})

const handleImage = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    alert('Ảnh phải nhỏ hơn 2MB')
    return
  }

  const base64 = await resizeImage(file)
  image.value = base64
  previewImage.value = base64
}

const canPublish = computed(() => {
  return title.value.trim() && content.value.trim()
})

const wordCount = computed(() => {
  return content.value.trim().split(/\s+/).filter(word => word.length > 0).length
})

const readingTime = computed(() => {
  const wpm = 200
  const words = wordCount.value
  return Math.ceil(words / wpm) || 1
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const addPost = async () => {
  if (!user.id) {
    errorMessage.value = '⚠️ Bạn cần đăng nhập để đăng bài!'
    return
  }

  if (!canPublish.value) {
    errorMessage.value = '⚠️ Vui lòng nhập đầy đủ tiêu đề và nội dung!'
    return
  }

  isPublishing.value = true
  errorMessage.value = ''

  try {
    await api.post('/posts', {
      title: title.value,
      content: content.value,
      author: user.name,
      userId: user.id,
      image: image.value,
      createdAt: new Date().toISOString()
    })

    isPublishing.value = false
    successMessage.value = '🎉 Đăng bài thành công!'

    setTimeout(() => {
      router.push('/')
    }, 1000)

  } catch (error) {
    console.error(error)
    errorMessage.value = '❌ Đăng bài thất bại!'
    isPublishing.value = false
  }
}


const saveDraft = () => {
  const draft = {
    title: title.value,
    content: content.value,
    savedAt: new Date()
  }
  localStorage.setItem('draft', JSON.stringify(draft))
  successMessage.value = '💾 Đã lưu nháp!'
  
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

// Load draft nếu có
const loadDraft = () => {
  const draft = localStorage.getItem('draft')
  if (draft) {
    const parsed = JSON.parse(draft)
    title.value = parsed.title || ''
    content.value = parsed.content || ''
  }
}

loadDraft()
</script>

<style scoped>
.avatar-sm {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
}
</style>