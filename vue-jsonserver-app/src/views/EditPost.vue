<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h3 class="fw-bold mb-3">
              <i class="bi bi-pencil-square me-2"></i>Sửa bài viết
            </h3>

            <div v-if="loading" class="text-center py-4">
              <span class="spinner-border"></span>
            </div>

            <form v-else @submit.prevent="updatePost">
                <label class="form-label fw-semibold">Ảnh bài viết</label>
<input ref="fileInput" type="file" class="form-control mb-2" @change="handleImage" />


<div v-if="previewImage || post.image" class="position-relative">
  <img
    :src="previewImage || post.image"
    class="img-fluid mt-2 rounded"
    style="max-height:400px; object-fit:cover;"
  />

  <button
    type="button"
    class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
    @click="removeImage"
  >
    <i class="bi bi-x-lg"></i>
  </button>
</div>


              <div class="mb-3">
                <label class="form-label fw-semibold pt-2">Tiêu đề</label>
                <input v-model="post.title" class="form-control" required />
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Nội dung</label>
                <QuillEditor
                  v-model:content="post.content"
                  contentType="html"
                  theme="snow"
                  style="height: 300px;"
                  placeholder="Viết nội dung bài viết của bạn..."
                ></QuillEditor>
              </div>

              <div class="mb-3">
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
                    v-for="(tag, index) in post.tags" 
                    :key="index"
                    class="badge bg-primary d-flex align-items-center p-2"
                  >
                    #{{ tag }}
                    <i class="bi bi-x-circle ms-2" style="cursor: pointer;" @click="removeTag(index)"></i>
                  </span>
                </div>
                <div class="form-text">Tối đa 5 tags.</div>
              </div>

              <div class="d-flex gap-2">
                <button class="btn btn-primary">
                  <i class="bi bi-save me-1"></i>Lưu
                </button>

                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="$router.push('/')"
                >
                  Hủy
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'
import Swal from 'sweetalert2'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const post = ref({})
const loading = ref(true)
const previewImage = ref(null)
const fileInput = ref(null)
const tagInput = ref('')
const existingTags = ref([])
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
    t.name.toLowerCase().includes(input) && !(post.value.tags && post.value.tags.includes(t.name))
  ).slice(0, 5)
})

const selectSuggestion = (tagName) => {
  if (!post.value.tags) post.value.tags = []
  if (!post.value.tags.includes(tagName) && post.value.tags.length < 5) {
    post.value.tags.push(tagName)
  }
  tagInput.value = ''
  showSuggestions.value = false
}

const addTag = () => {
  if (!post.value.tags) post.value.tags = []
  const val = tagInput.value.trim().replace(/^#/, '').replace(/,/g, '')
  if (val && !post.value.tags.includes(val) && post.value.tags.length < 5) {
    post.value.tags.push(val)
  }
  tagInput.value = ''
  showSuggestions.value = false
}

const removeTag = (index) => {
  post.value.tags.splice(index, 1)
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


onMounted(async () => {
  if (!user.value || !user.value.id) {
    router.push('/login')
    return
  }

  try {
    const res = await api.get(`/posts/${route.params.id}`)
    post.value = res.data

    if (!post.value.tags) {
      post.value.tags = []
    }

    if (post.value.userId !== user.value.id) {
      Swal.fire('Cảnh báo', 'Bạn không có quyền sửa bài này', 'warning')
      router.push('/')
    }

  } catch (err) {
    Swal.fire('Lỗi', 'Không tìm thấy bài viết', 'error')
    router.push('/')
  } finally {
    loading.value = false
    fetchExistingTags()
  }
})


const handleImage = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    Swal.fire('Cảnh báo', 'Ảnh phải nhỏ hơn 2MB', 'warning')
    return
  }

  const base64 = await resizeImage(file)
  post.value.image = base64
  previewImage.value = base64
}

const removeImage = () => {
  post.value.image = ''
  previewImage.value = null
  if (fileInput.value) fileInput.value.value = ''
}


const updatePost = async () => {
  try {
    await api.put(`/posts/${route.params.id}`, post.value)
    Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Cập nhật bài viết thành công!',
      timer: 1500,
      showConfirmButton: false
    })
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (err) {
    Swal.fire('Lỗi', 'Cập nhật bài viết thất bại!', 'error')
  }
}
</script>

<style scoped>
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
