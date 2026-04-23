<template>
  <div class="container mt-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-1">
          <i class="bi bi-journal-text me-2"></i>Danh sách bài viết
        </h2>
        <p class="text-muted mb-0">{{ posts.length }} bài viết</p>
      </div>
      <router-link v-if="user" class="btn btn-primary" to="/create">
        <i class="bi bi-plus-circle me-1"></i>Viết bài mới
      </router-link>
    </div>

    <!-- Search Bar -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="input-group">
          <span class="input-group-text">
            <i class="bi bi-search"></i>
          </span>
          <input 
            v-model="searchQuery"
            type="text" 
            class="form-control" 
            placeholder="Tìm kiếm bài viết..."
          >
          <button 
            v-if="searchQuery" 
            class="btn btn-outline-secondary" 
            @click="searchQuery = ''"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-3">Đang tải bài viết...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredPosts.length === 0" class="text-center py-5">
      <div class="mb-3" style="font-size: 64px;">
        <i class="bi bi-inbox"></i>
      </div>
      <h4 class="text-muted">
        {{ searchQuery ? 'Không tìm thấy bài viết nào' : 'Chưa có bài viết nào' }}
      </h4>
      <p class="text-muted">
        {{ searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Hãy là người đầu tiên viết bài!' }}
      </p>
      <router-link v-if="user && !searchQuery" class="btn btn-primary mt-3" to="/create">
        <i class="bi bi-pencil-square me-1"></i>Viết bài đầu tiên
      </router-link>
    </div>

    <!-- Posts List -->
    <div v-else>
      <div 
        v-for="p in filteredPosts" 
        :key="p.id" 
        class="card mb-3 shadow-sm"
      >
        <div class="card-body">
          <!-- Author Info -->
          <div class="d-flex align-items-center mb-3">
            <div class="avatar-sm me-2">
              {{ getInitials(p.author) }}
            </div>
            <div class="flex-grow-1">
              <div class="fw-semibold">{{ p.author }}</div>
              <small class="text-muted">
                <i class="bi bi-clock me-1"></i>{{ formatDate(p.createdAt) }}
              </small>
            </div>

            <!-- Actions for own posts -->
            <div v-if="user && p.userId === user.id" class="dropdown">
              <button 
                class="btn btn-sm btn-link text-muted" 
                type="button" 
                data-bs-toggle="dropdown"
              >
                <i class="bi bi-three-dots-vertical"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="editPost(p.id)">
                    <i class="bi bi-pencil me-2"></i>Chỉnh sửa
                  </a>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item text-danger" href="#" @click.prevent="deletePost(p.id)">
                    <i class="bi bi-trash me-2"></i>Xóa
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <!-- Post Content -->
          <img v-if="p.image" :src="p.image" class="img-fluid rounded mb-2" />
          <h5 class="card-title fw-bold">{{ p.title }}</h5>
          <p class="card-text text-muted">{{ truncate(p.content, 200) }}</p>

          <!-- Tags -->
          <div v-if="p.tags && p.tags.length > 0" class="mb-3">
            <span 
              v-for="tag in p.tags" 
              :key="tag"
              class="badge bg-light text-primary me-1"
            >
              #{{ tag }}
            </span>
          </div>

          <!-- Actions -->
          <router-link 
            :to="`/post/${p.id}`" 
            class="btn btn-primary btn-sm"
          >
            <i class="bi bi-book me-1"></i>Xem chi tiết
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'

const posts = ref([])
const loading = ref(true)
const searchQuery = ref('')
const router = useRouter()

const user = JSON.parse(localStorage.getItem('user') || 'null')

const filteredPosts = computed(() => {
  if (!searchQuery.value) {
    return posts.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return posts.value.filter(p => 
    p.title.toLowerCase().includes(query) ||
    p.content.toLowerCase().includes(query) ||
    p.author.toLowerCase().includes(query)
  )
})

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Hôm nay'
  if (days === 1) return 'Hôm qua'
  if (days < 7) return `${days} ngày trước`
  
  return d.toLocaleDateString('vi-VN', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getInitials = (name) => {
  if (!name) return '?'
  const names = name.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return name[0].toUpperCase()
}

const truncate = (text, length) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const editPost = (id) => {
  router.push(`/edit/${id}`)
}

const deletePost = async (id) => {
  if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
    try {
      await api.delete(`/posts/${id}`)
      posts.value = posts.value.filter(p => p.id !== id)
      alert('✅ Đã xóa bài viết!')
    } catch (error) {
      alert('❌ Xóa bài viết thất bại!')
    }
  }
}

onMounted(async () => {
  try {
    const res = await api.get('/posts')
    posts.value = res.data.reverse() // Mới nhất lên trước
    loading.value = false
  } catch (error) {
    console.error('Lỗi khi tải bài viết:', error)
    loading.value = false
  }
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
</style>