<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <!-- Back Button -->
        <button class="btn btn-outline-secondary mb-3" @click="$router.push('/')">
          <i class="bi bi-arrow-left me-1"></i>Quay lại danh sách
        </button>

        <!-- Post Card -->
        <div class="card shadow-sm mb-4">
          <div class="card-body p-4">
            <!-- Author Info -->
            <div class="d-flex align-items-center mb-3">
              <div class="avatar-sm me-2">
                {{ getInitials(post.author) }}
              </div>
              <div>
                <div class="fw-semibold">
                  <i class="bi bi-person me-1"></i>{{ post.author }}
                </div>
                <small class="text-muted">
                  <i class="bi bi-clock me-1"></i>{{ formatDate(post.createdAt) }}
                </small>
              </div>
            </div>

            <!-- Post Title & Content -->
<h2 class="fw-bold mb-3">{{ post.title }}</h2>

<!-- Image -->
<img
  v-if="post.image"
  :src="post.image"
  class="img-fluid rounded mb-3"
  style="max-height: 450px; object-fit: cover;"
/>

<p class="text-muted" style="white-space: pre-wrap; line-height: 1.8;">
  {{ post.content }}
</p>


            <!-- Post Stats -->
            <div class="border-top pt-3 mt-4">
              <small class="text-muted">
                <i class="bi bi-card-text me-1"></i>{{ wordCount }} từ • 
                <i class="bi bi-hourglass-split me-1"></i>{{ readingTime }} phút đọc
              </small>
            </div>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="card shadow-sm">
          <div class="card-header bg-white">
            <h5 class="mb-0">
              <i class="bi bi-chat-dots me-2"></i>Bình luận ({{ comments.length }})
            </h5>
          </div>
          <div class="card-body p-4">
            <!-- Comment Form -->
            <div v-if="user" class="mb-4">
              <div class="d-flex gap-2 align-items-start">
                <div class="avatar-sm flex-shrink-0">
                  {{ userInitials }}
                </div>
                <div class="flex-grow-1">
                  <textarea
                    v-model="comment"
                    class="form-control mb-2"
                    rows="3"
                    placeholder="Viết bình luận..."
                  ></textarea>
                  <button 
                    class="btn btn-primary" 
                    @click="addComment"
                    :disabled="!comment.trim() || isSending"
                  >
                    <span v-if="!isSending">
                      <i class="bi bi-send me-1"></i>Gửi bình luận
                    </span>
                    <span v-else>
                      <span class="spinner-border spinner-border-sm me-2"></span>
                      Đang gửi...
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Login prompt -->
            <div v-else class="alert alert-info">
              <i class="bi bi-lock me-1"></i>
              Vui lòng <router-link to="/login">đăng nhập</router-link> để bình luận
            </div>

            <!-- Comments List -->
            <div v-if="comments.length > 0">
              <div 
                v-for="c in comments" 
                :key="c.id" 
                class="d-flex gap-2 mb-3 pb-3 border-bottom"
              >
                <div class="avatar-sm flex-shrink-0">
                  {{ getInitials(c.user) }}
                </div>
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center gap-2 mb-1">
                    <strong>
                      <i class="bi bi-person-circle me-1"></i>{{ c.user }}
                    </strong>
                    <small class="text-muted">
                      <i class="bi bi-clock me-1"></i>{{ formatDate(c.time) }}
                    </small>
                  </div>
                  <p class="mb-0">{{ c.content }}</p>
                </div>
              </div>
            </div>

            <!-- Empty Comments -->
            <div v-else class="text-center py-4 text-muted">
              <div style="font-size: 48px;">
                <i class="bi bi-chat-square-dots"></i>
              </div>
              <p class="mb-0">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const post = ref({})
const comments = ref([])
const comment = ref('')
const isSending = ref(false)

const user = JSON.parse(localStorage.getItem('user') || 'null')

const userInitials = computed(() => {
  if (!user || !user.name) return 'U'
  const names = user.name.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return user.name[0].toUpperCase()
})

const wordCount = computed(() => {
  if (!post.value.content) return 0
  return post.value.content.trim().split(/\s+/).filter(word => word.length > 0).length
})

const readingTime = computed(() => {
  const wpm = 200
  const words = wordCount.value
  return Math.ceil(words / wpm) || 1
})

const getInitials = (name) => {
  if (!name) return '?'
  const names = name.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return name[0].toUpperCase()
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  if (days === 1) return 'Hôm qua'
  if (days < 7) return `${days} ngày trước`
  
  return d.toLocaleDateString('vi-VN', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const loadData = async () => {
  try {
    const p = await api.get(`/posts/${id}`)
    post.value = p.data

    const c = await api.get(`/comments?postId=${id}`)
    comments.value = c.data.reverse() // Mới nhất lên trước
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu:', error)
  }
}

const addComment = async () => {
  if (!comment.value.trim() || !user) return

  isSending.value = true

  try {
    await api.post('/comments', {
      postId: id,
      user: user.name,
      content: comment.value,
      time: new Date()
    })

    comment.value = ''
    await loadData()
  } catch (error) {
    console.error('Lỗi khi gửi bình luận:', error)
    alert('❌ Gửi bình luận thất bại!')
  } finally {
    isSending.value = false
  }
}

onMounted(loadData)
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
  flex-shrink: 0;
}
</style>