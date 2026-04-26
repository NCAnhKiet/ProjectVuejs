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
      <router-link v-if="user" class="btn btn-primary shadow-sm" to="/create">
        <i class="bi bi-plus-circle me-1"></i>Viết bài mới
      </router-link>
    </div>

    <!-- Tags Filter -->
    <div v-if="allTags.length > 0" class="mb-4">
      <div class="d-flex flex-wrap gap-2 align-items-center">
        <span class="text-muted me-2"><i class="bi bi-filter me-1"></i>Lọc theo nhãn:</span>
        <button 
          class="btn btn-sm rounded-pill px-3" 
          :class="!selectedTag ? 'btn-primary' : 'btn-outline-primary'"
          @click="selectedTag = ''"
        >
          Tất cả
        </button>
        <button 
          v-for="tag in allTags" 
          :key="tag"
          class="btn btn-sm rounded-pill px-3"
          :class="selectedTag === tag ? 'btn-primary' : 'btn-outline-primary'"
          @click="selectedTag = tag"
        >
          #{{ tag }}
        </button>
      </div>
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

    <!-- Feed Tabs -->
    <ul v-if="user" class="nav nav-pills mb-4 gap-2">
      <li class="nav-item">
        <button 
          class="nav-link rounded-pill px-4" 
          :class="activeTab === 'discovery' ? 'active' : 'bg-light text-dark border'"
          @click="activeTab = 'discovery'"
        >
          <i class="bi bi-compass me-1"></i>Khám phá
        </button>
      </li>
      <li class="nav-item">
        <button 
          class="nav-link rounded-pill px-4" 
          :class="activeTab === 'following' ? 'active' : 'bg-light text-dark border'"
          @click="activeTab = 'following'"
        >
          <i class="bi bi-people me-1"></i>Đang theo dõi
        </button>
      </li>
    </ul>

    <!-- Main Content (List or Empty State) -->
    <div v-if="!loading">
      <!-- Empty State -->
      <div v-if="filteredPosts.length === 0" class="text-center py-5">
        <div class="mb-3 text-muted" style="font-size: 64px;">
          <i class="bi bi-inbox"></i>
        </div>
        <h4 class="text-muted">
          {{ activeTab === 'following' ? 'Chưa có bài viết nào từ người bạn theo dõi' : (searchQuery || selectedTag ? 'Không tìm thấy bài viết nào' : 'Chưa có bài viết nào') }}
        </h4>
        <p class="text-muted">
          {{ activeTab === 'following' ? 'Hãy theo dõi thêm nhiều tác giả để xem bài viết của họ!' : (searchQuery || selectedTag ? 'Thử thay đổi bộ lọc tìm kiếm' : 'Hãy là người đầu tiên viết bài!') }}
        </p>
        <router-link v-if="user && !searchQuery && !selectedTag && activeTab === 'discovery'" class="btn btn-primary mt-3" to="/create">
          <i class="bi bi-pencil-square me-1"></i>Viết bài đầu tiên
        </router-link>
        <button v-if="activeTab === 'following'" class="btn btn-outline-primary mt-3" @click="activeTab = 'discovery'">
          <i class="bi bi-search me-1"></i>Khám phá ngay
        </button>
      </div>

      <!-- Posts List -->
      <div v-else>
      <div 
        v-for="p in displayedPosts" 
        :key="p.id" 
        class="card mb-3 shadow-sm post-card"
      >
        <div class="card-body">
          <!-- Author Info -->
          <div class="d-flex align-items-center mb-3">
            <router-link :to="`/user/${p.userId}`" class="text-decoration-none">
              <div class="avatar-sm me-2">
                {{ getInitials(p.author) }}
              </div>
            </router-link>
            <div class="flex-grow-1">
              <div class="fw-semibold d-flex align-items-center gap-2">
                <router-link :to="`/user/${p.userId}`" class="text-dark text-decoration-none">
                  {{ p.author }}
                </router-link>
                <!-- Follow Button -->
                <button 
                  v-if="user && p.userId && p.userId !== user.id"
                  class="btn btn-sm rounded-pill px-2 py-0 border-0"
                  :class="isFollowing(p.userId) ? 'text-secondary' : 'text-primary fw-bold'"
                  @click="toggleFollow(p.userId)"
                >
                  {{ isFollowing(p.userId) ? 'Đang Follow' : '+ Follow' }}
                </button>
              </div>
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
          <img v-if="p.image" :src="p.image" class="img-fluid rounded mb-3" style="max-height: 400px; width: 100%; object-fit: cover;" />
          <h5 class="card-title fw-bold">{{ p.title }}</h5>
          <p class="card-text text-muted">{{ truncate(p.content, 200) }}</p>

          <!-- Tags -->
          <div v-if="p.tags && p.tags.length > 0" class="mb-3">
            <span 
              v-for="tag in p.tags" 
              :key="tag"
              class="badge bg-light text-primary me-1 border"
              style="cursor: pointer;"
              @click="selectedTag = tag"
            >
              #{{ tag }}
            </span>
          </div>

          <!-- Actions -->
          <div class="d-flex align-items-center gap-3">
            <router-link 
              :to="`/post/${p.id}`" 
              class="btn btn-outline-primary btn-sm rounded-pill px-3"
            >
              Đọc thêm <i class="bi bi-arrow-right ms-1"></i>
            </router-link>

            <!-- Like Button -->
            <button 
              class="btn btn-sm d-flex align-items-center gap-1"
              :class="hasLiked(p) ? 'text-danger' : 'text-muted'"
              @click="toggleLike(p)"
            >
              <i class="bi" :class="hasLiked(p) ? 'bi-heart-fill' : 'bi-heart'"></i>
              <span>{{ p.likes?.length || 0 }}</span>
            </button>

            <!-- Share Button -->
            <button 
              class="btn btn-sm text-muted d-flex align-items-center gap-1"
              @click="sharePost(p.id)"
            >
              <i class="bi bi-share"></i>
              <span>Chia sẻ</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="visibleLimit < filteredPosts.length" class="text-center mt-4 mb-5">
        <button class="btn btn-primary rounded-pill px-4 py-2 shadow-sm" @click="loadMore">
          <i class="bi bi-plus-lg me-1"></i> Xem thêm bài viết
        </button>
      </div>
      </div>
    </div>
  </div>

  <!-- Social Share Modal -->
  <ShareModal ref="shareModalRef" :postId="selectedPostId" />
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useAuthStore } from '../stores/auth'
import ShareModal from '../components/ShareModal.vue'

const posts = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedTag = ref('')
const activeTab = ref('discovery') // 'discovery' or 'following'
const visibleLimit = ref(5) // Hiển thị 5 bài đầu tiên
const router = useRouter()
const authStore = useAuthStore()
const shareModalRef = ref(null)
const selectedPostId = ref(null)

const user = computed(() => authStore.user)

// Lấy danh sách tất cả các tag duy nhất
const allTags = computed(() => {
  const tags = new Set()
  posts.value.forEach(p => {
    if (p.tags) p.tags.forEach(t => tags.add(t))
  })
  return Array.from(tags).sort()
})

const filteredPosts = computed(() => {
  let result = posts.value

  // Lọc theo Tab (Theo dõi)
  if (activeTab.value === 'following' && user.value) {
    const followingIds = user.value.following || []
    result = result.filter(p => followingIds.includes(p.userId))
  }

  // Lọc theo tag
  if (selectedTag.value) {
    result = result.filter(p => p.tags && p.tags.includes(selectedTag.value))
  }
  
  // Lọc theo search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.content.toLowerCase().includes(query) ||
      p.author.toLowerCase().includes(query)
    )
  }

  return result
})

// Bài viết thực tế hiển thị dựa trên visibleLimit
const displayedPosts = computed(() => {
  return filteredPosts.value.slice(0, visibleLimit.value)
})

const loadMore = () => {
  visibleLimit.value += 5
}

const hasLiked = (post) => {
  if (!user.value || !post.likes) return false
  return post.likes.includes(user.value.id)
}

const toggleLike = async (post) => {
  if (!user.value) {
    Swal.fire('Thông báo', 'Vui lòng đăng nhập để thích bài viết!', 'info')
    return
  }

  const likes = post.likes || []
  const userIdx = likes.indexOf(user.value.id)

  if (userIdx > -1) {
    likes.splice(userIdx, 1)
  } else {
    likes.push(user.value.id)
  }

  try {
    await api.patch(`/posts/${post.id}`, { likes })
    // Cập nhật state local
    post.likes = likes
  } catch (error) {
    console.error('Lỗi khi thả tim:', error)
  }
}

const sharePost = (id) => {
  if (!user.value) {
    Swal.fire('Thông báo', 'Vui lòng đăng nhập để chia sẻ!', 'info')
    return
  }
  selectedPostId.value = id
  shareModalRef.value.open()
}

const isFollowing = (authorId) => {
  if (!user.value || !user.value.following) return false
  return user.value.following.includes(authorId)
}

const toggleFollow = async (authorId) => {
  if (!user.value) {
    Swal.fire('Thông báo', 'Vui lòng đăng nhập để theo dõi!', 'info')
    return
  }

  const following = user.value.following || []
  const idx = following.indexOf(authorId)

  if (idx > -1) {
    following.splice(idx, 1)
  } else {
    following.push(authorId)
  }

  try {
    await api.patch(`/users/${user.value.id}`, { following })
    authStore.updateUser({ following })
    Swal.fire({
      icon: 'success',
      title: idx > -1 ? 'Đã bỏ theo dõi' : 'Đã theo dõi',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    })
  } catch (error) {
    console.error('Lỗi khi follow:', error)
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  
  if (diff < 0 && diff > -60000) return 'Vừa xong' // Handle slight clock skew
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days === 0) {
    if (minutes < 1) return 'Vừa xong'
    if (minutes < 60) return `${minutes} phút trước`
    return `${hours} giờ trước`
  }
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
  const strippedText = text.replace(/<[^>]*>?/gm, '')
  if (strippedText.length <= length) return strippedText
  return strippedText.substring(0, length) + '...'
}

const editPost = (id) => {
  router.push(`/edit/${id}`)
}

const deletePost = async (id) => {
  const result = await Swal.fire({
    title: 'Bạn có chắc chắn?',
    text: "Bạn sẽ không thể khôi phục lại bài viết này!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Có, xóa nó!',
    cancelButtonText: 'Hủy'
  })

  if (result.isConfirmed) {
    try {
      await api.delete(`/posts/${id}`)
      posts.value = posts.value.filter(p => p.id !== id)
      Swal.fire({
        icon: 'success',
        title: 'Đã xóa!',
        text: 'Bài viết của bạn đã bị xóa.',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (error) {
      Swal.fire('Lỗi', 'Xóa bài viết thất bại!', 'error')
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