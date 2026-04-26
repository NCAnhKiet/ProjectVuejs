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
                <QuillEditor
                  v-model:content="content"
                  contentType="html"
                  theme="snow"
                  style="height: 300px;"
                  placeholder="Viết nội dung bài viết của bạn..."
                ></QuillEditor>
                <div class="form-text mt-2">
                  Khoảng {{ readingTime }} phút đọc
                </div>
              </div>

              <!-- Tags Input -->
              <div class="mb-4">
                <label class="form-label fw-semibold">Nhãn (Tags)</label>
                <div class="input-group mb-2 position-relative">
                  <span class="input-group-text"><i class="bi bi-tags"></i></span>
                  <input 
                    v-model="tagInput"
                    @keydown.enter.prevent="addTag"
                    @keydown.comma.prevent="addTag"
                    @input="showSuggestions = true"
                    type="text" 
                    class="form-control" 
                    placeholder="Nhập tag (nhấn Enter để thêm)..."
                  >
                  <button class="btn btn-outline-secondary" type="button" @click="addTag">Thêm</button>
                  
                  <!-- Suggestions Dropdown -->
                  <div v-if="showSuggestions && filteredSuggestions.length > 0" class="tag-suggestions shadow-sm border rounded">
                    <div 
                      v-for="suggestion in filteredSuggestions" 
                      :key="suggestion.name"
                      class="suggestion-item p-2"
                      @click="selectSuggestion(suggestion.name)"
                    >
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="fw-bold text-primary">#{{ suggestion.name }}</span>
                        <div>
                          <span v-if="suggestion.count > 5" class="badge bg-danger me-2" style="font-size: 0.6rem;">Phổ biến</span>
                          <small class="text-muted">{{ suggestion.count }} bài viết</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="d-flex flex-wrap gap-2">
                  <span 
                    v-for="(tag, index) in tags" 
                    :key="index"
                    class="badge bg-primary d-flex align-items-center p-2"
                  >
                    #{{ tag }}
                    <i class="bi bi-x-circle ms-2" style="cursor: pointer;" @click="removeTag(index)"></i>
                  </span>
                </div>
                <div class="form-text">Tối đa 5 tags.</div>
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

        <div class="mt-3 ql-editor px-0" style="line-height: 1.8;" v-html="content || 'Chưa có nội dung...'">
        </div>

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
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useAuthStore } from '../stores/auth'

const title = ref('')
const content = ref('')
const isPublishing = ref(false)
const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)
const image = ref('')
const previewImage = ref(null)

const tags = ref([])
const tagInput = ref('')
const existingTags = ref([]) // { name: string, count: number }
const showSuggestions = ref(false)

const fetchExistingTags = async () => {
  try {
    const res = await api.get('/posts')
    const allPosts = res.data
    const tagCounts = {}
    
    allPosts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })
    
    existingTags.value = Object.entries(tagCounts).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count)
  } catch (error) {
    console.error('Lỗi khi tải tags:', error)
  }
}

const filteredSuggestions = computed(() => {
  const input = tagInput.value.trim().toLowerCase().replace(/^#/, '')
  if (!input) return []
  return existingTags.value.filter(t => 
    t.name.toLowerCase().includes(input) && !tags.value.includes(t.name)
  ).slice(0, 5)
})

const selectSuggestion = (tagName) => {
  if (!tags.value.includes(tagName) && tags.value.length < 5) {
    tags.value.push(tagName)
  }
  tagInput.value = ''
  showSuggestions.value = false
}

const addTag = () => {
  const val = tagInput.value.trim().replace(/^#/, '').replace(/,/g, '')
  if (val && !tags.value.includes(val) && tags.value.length < 5) {
    tags.value.push(val)
  }
  tagInput.value = ''
  showSuggestions.value = false
}

const removeTag = (index) => {
  tags.value.splice(index, 1)
}

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


const userInitials = computed(() => {
  if (!user.value || !user.value.name) return 'U'
  const names = user.value.name.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return user.value.name[0].toUpperCase()
})

const handleImage = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    Swal.fire('Cảnh báo', 'Ảnh phải nhỏ hơn 2MB', 'warning')
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
  const text = content.value.replace(/<[^>]*>?/gm, '').trim()
  return text.split(/\s+/).filter(word => word.length > 0).length
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
  if (!user.value || !user.value.id) {
    Swal.fire('Lỗi', 'Bạn cần đăng nhập để đăng bài!', 'error')
    return
  }

  if (!canPublish.value) {
    Swal.fire('Cảnh báo', 'Vui lòng nhập đầy đủ tiêu đề và nội dung!', 'warning')
    return
  }

  isPublishing.value = true

  try {
    await api.post('/posts', {
      title: title.value,
      content: content.value,
      author: user.value.name,
      userId: user.value.id,
      image: image.value,
      tags: tags.value,
      createdAt: new Date().toISOString()
    })

    isPublishing.value = false
    Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Đăng bài thành công!',
      timer: 1500,
      showConfirmButton: false
    })

    setTimeout(() => {
      router.push('/')
    }, 1500)

  } catch (error) {
    console.error(error)
    Swal.fire('Lỗi', 'Đăng bài thất bại!', 'error')
    isPublishing.value = false
  }
}

const saveDraft = () => {
  const draft = {
    title: title.value,
    content: content.value,
    tags: tags.value,
    savedAt: new Date()
  }
  localStorage.setItem('draft', JSON.stringify(draft))
  Swal.fire({
    icon: 'success',
    title: 'Đã lưu nháp!',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000
  })
}

// Load draft nếu có
const loadDraft = () => {
  const draft = localStorage.getItem('draft')
  if (draft) {
    const parsed = JSON.parse(draft)
    title.value = parsed.title || ''
    content.value = parsed.content || ''
    tags.value = parsed.tags || []
  }
}

onMounted(() => {
  loadDraft()
  fetchExistingTags()
})
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

.tag-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  cursor: pointer;
  transition: background 0.2s;
}

.suggestion-item:hover {
  background: #f8f9fa;
}
</style>