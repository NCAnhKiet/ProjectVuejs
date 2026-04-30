<template>
  <div class="app-container mt-3">
    
    <!-- Top Nav Back Button -->
    <div class="d-flex align-items-center mb-3" style="cursor: pointer;" @click="$router.push('/')">
      <i class="bi bi-arrow-left fs-5 me-2 text-light"></i>
      <span class="fw-semibold text-light">Quay lại</span>
    </div>

    <!-- Main Post -->
    <div class="feed-post border-bottom-0 pb-0">
      <div class="feed-post-left">
        <router-link :to="`/user/${post.userId}`" class="text-decoration-none">
          <div class="feed-avatar" :style="post.user && post.user.avatar ? `background-image: url(${post.user.avatar});` : ''">
            <span v-if="!post.user || !post.user.avatar" style="color: #fff; display: flex; height: 100%; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">{{ getInitials(post.author) }}</span>
          </div>
        </router-link>
        <div class="feed-line"></div>
      </div>

      <div class="feed-post-right">
        <!-- Header -->
        <div class="feed-header">
          <div class="d-flex align-items-center gap-2">
            <router-link :to="`/user/${post.userId}`" class="feed-author text-decoration-none">
              {{ post.author }}
            </router-link>
            <!-- Follow Button -->
            <button 
              v-if="user && post.userId && post.userId !== user.id && !isFollowing(post.userId)"
              class="btn btn-sm text-primary p-0 fw-semibold"
              style="font-size: 0.9rem;"
              @click="toggleFollow(post.userId)"
            >
              Theo dõi
            </button>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="feed-time">{{ formatDate(post.createdAt) }}</span>
          </div>
        </div>

        <!-- Post Title & Content -->
        <div v-if="post.title" class="fw-bold mb-2 mt-1" style="font-size: 1.1rem; color: #f3f5f7;">{{ post.title }}</div>
        <div class="feed-content" v-html="post.content || 'Đang tải nội dung...'"></div>
        <img v-if="post.image" :src="post.image" class="feed-image mt-2" />

        <!-- Stats -->
        <div class="d-flex gap-3 text-muted mb-2" style="font-size: 0.85rem;">
          <span>{{ wordCount }} từ</span>
          <span>{{ readingTime }} phút đọc</span>
        </div>

        <!-- Actions -->
        <div class="feed-actions mb-3">
          <button class="feed-action-btn" :style="hasLiked ? 'color: #ff3040;' : ''" @click="toggleLike">
            <i class="bi" :class="hasLiked ? 'bi-heart-fill' : 'bi-heart'"></i>
            <span v-if="post.likes && post.likes.length > 0" style="font-size: 0.85rem;">{{ post.likes.length }}</span>
          </button>
          <button class="feed-action-btn" @click="focusComment">
            <i class="bi bi-chat"></i>
            <span v-if="comments.length > 0" style="font-size: 0.85rem;">{{ comments.length }}</span>
          </button>
          <button class="feed-action-btn" :style="hasReposted ? 'color: #00ba7c;' : ''" @click="toggleRepost">
            <i class="bi bi-arrow-repeat"></i>
            <span v-if="post.reposts && post.reposts.length > 0" style="font-size: 0.85rem;">{{ post.reposts.length }}</span>
          </button>
          <button class="feed-action-btn" @click="sharePost">
            <i class="bi bi-send"></i>
            <span v-if="post.shares && post.shares.length > 0" style="font-size: 0.85rem;">{{ post.shares.length }}</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Divider -->
    <div style="height: 1px; background-color: #333; margin-bottom: 12px; margin-left: 56px;"></div>

    <!-- Comments Section -->
    <div>
      <div v-if="comments.length > 0">
        <div v-for="(c, index) in comments" :key="c.id" class="feed-post border-bottom-0 pb-0">
          <div class="feed-post-left">
            <div class="feed-avatar">
              <span style="color: #fff; display: flex; height: 100%; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">{{ getInitials(c.user) }}</span>
            </div>
            <div class="feed-line" v-if="index !== comments.length - 1"></div>
          </div>
          <div class="feed-post-right">
            <div class="feed-header">
              <span class="feed-author">{{ c.user }}</span>
              <span class="feed-time">{{ formatDate(c.time) }}</span>
            </div>
            <div class="feed-content mb-3" style="font-size: 0.95rem;">{{ c.content }}</div>
            <div class="feed-actions mb-3">
              <button class="feed-action-btn"><i class="bi bi-heart"></i></button>
              <button class="feed-action-btn"><i class="bi bi-chat"></i></button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-4 text-muted" style="font-size: 0.9rem;">
        Chưa có bình luận nào.
      </div>
    </div>

    <!-- Divider -->
    <div style="height: 1px; background-color: #333; margin: 16px 0;"></div>

    <!-- Comment Input -->
    <div v-if="user" class="feed-post border-bottom-0 align-items-center mb-5 pb-4">
      <div class="feed-post-left">
        <div class="feed-avatar" :style="user.avatar ? `background-image: url(${user.avatar}); background-size: cover; background-position: center;` : ''">
          <span v-if="!user.avatar" style="color: #fff; display: flex; height: 100%; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">{{ userInitials }}</span>
        </div>
      </div>
      <div class="feed-post-right d-flex align-items-center">
        <input 
          ref="commentInput"
          v-model="comment"
          type="text"
          class="app-input flex-grow-1"
          placeholder="Trả lời..."
          @keyup.enter="addComment"
        />
        <button 
          class="app-nav-action px-3 py-1 ms-2"
          :style="comment.trim() ? '' : 'opacity: 0.5;'"
          @click="addComment"
          :disabled="!comment.trim() || isSending"
        >
          Đăng
        </button>
      </div>
    </div>
    <div v-else class="text-center text-muted mb-5 pb-4">
      Vui lòng <router-link to="/login" class="text-primary">đăng nhập</router-link> để trả lời.
    </div>

  </div>

  <!-- Social Share Modal -->
  <ShareModal ref="shareModalRef" :postId="post.id" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'
import Swal from 'sweetalert2'
import { useAuthStore } from '../stores/auth'
import ShareModal from '../components/ShareModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)
const shareModalRef = ref(null)
const id = route.params.id
const commentInput = ref(null)

const hasLiked = computed(() => {
  if (!user.value || !post.value.likes) return false
  return post.value.likes.includes(user.value.id)
})

const isFollowing = (authorId) => {
  if (!user.value || !user.value.following) return false
  return user.value.following.includes(authorId)
}

const toggleFollow = async (authorId) => {
  if (!user.value) {
    Swal.fire({ title: 'Vui lòng đăng nhập', background: '#181818', color: '#fff', icon: 'info' })
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
  } catch (error) {}
}

const toggleLike = async () => {
  if (!user.value) return

  const likes = post.value.likes || []
  const userIdx = likes.indexOf(user.value.id)

  if (userIdx > -1) {
    likes.splice(userIdx, 1)
  } else {
    likes.push(user.value.id)
  }

  try {
    await api.patch(`/posts/${post.value.id}`, { likes })
    post.value.likes = likes
  } catch (error) {}
}

const hasReposted = computed(() => {
  if (!user.value || !post.value.reposts) return false
  return post.value.reposts.includes(user.value.id)
})

const toggleRepost = async () => {
  if (!user.value) {
    Swal.fire({ title: 'Vui lòng đăng nhập', background: '#181818', color: '#fff', icon: 'info' })
    return
  }

  const reposts = post.value.reposts || []
  const userIdx = reposts.indexOf(user.value.id)

  if (userIdx > -1) {
    reposts.splice(userIdx, 1)
  } else {
    reposts.push(user.value.id)
  }

  try {
    await api.patch(`/posts/${post.value.id}`, { reposts })
    post.value.reposts = reposts
  } catch (error) {}
}

const sharePost = async () => {
  if (!user.value) return

  const shares = post.value.shares || []
  if (!shares.includes(user.value.id)) {
    shares.push(user.value.id)
    try {
      await api.patch(`/posts/${post.value.id}`, { shares })
      post.value.shares = shares
    } catch (e) {}
  }

  shareModalRef.value.open()
}

const post = ref({})
const comments = ref([])
const comment = ref('')
const isSending = ref(false)

const userInitials = computed(() => {
  if (!user.value || !user.value.name) return 'U'
  const names = user.value.name.split(' ')
  if (names.length >= 2) return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  return user.value.name[0].toUpperCase()
})

const wordCount = computed(() => {
  if (!post.value.content) return 0
  const text = post.value.content.replace(/<[^>]*>?/gm, '').trim()
  return text.split(/\s+/).filter(word => word.length > 0).length
})

const readingTime = computed(() => {
  const wpm = 200
  const words = wordCount.value
  return Math.ceil(words / wpm) || 1
})

const getInitials = (name) => {
  if (!name) return '?'
  const names = name.split(' ')
  if (names.length >= 2) return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  return name[0].toUpperCase()
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  
  if (diff < 60) return 'Vừa xong'
  const m = Math.floor(diff / 60)
  if (m < 60) return `${m} phút`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} giờ`
  const dCount = Math.floor(h / 24)
  if (dCount < 7) return `${dCount} ngày`
  
  return d.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })
}

const loadData = async () => {
  try {
    const p = await api.get(`/posts/${id}`)
    const postData = p.data

    try {
      if (postData.userId) {
        const uRes = await api.get(`/users/${postData.userId}`)
        postData.user = uRes.data
      }
    } catch (e) {}
    
    post.value = postData

    const c = await api.get(`/comments?postId=${id}`)
    comments.value = c.data // Giữ nguyên thứ tự để hiển thị bài viết từ trên xuống dưới
  } catch (error) {}
}

const focusComment = () => {
  if (commentInput.value) {
    commentInput.value.focus()
  }
}

const addComment = async () => {
  if (!comment.value.trim() || !user.value) return

  isSending.value = true

  try {
    await api.post('/comments', {
      postId: id,
      user: user.value.name,
      content: comment.value,
      time: new Date()
    })

    comment.value = ''
    await loadData()
  } catch (error) {
  } finally {
    isSending.value = false
  }
}

onMounted(loadData)
</script>