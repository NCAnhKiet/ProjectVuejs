<template>
  <div class="app-container mt-3">
    
    <!-- Top Create Post Prompt (Like Threads) -->
    <div v-if="user" class="feed-post mb-2 align-items-center" style="cursor: pointer;" @click="router.push('/create')">
      <div class="feed-post-left" style="margin-right: 16px;">
        <div class="feed-avatar" :style="user.avatar ? `background-image: url(${user.avatar}); background-size: cover; background-position: center;` : ''">
          <span v-if="!user.avatar" style="color: #fff; display: flex; height: 100%; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">{{ getInitials(user.name) }}</span>
        </div>
      </div>
      <div class="feed-post-right d-flex justify-content-between align-items-center">
        <span style="color: #777;">Bắt đầu một bài viết...</span>
        <button class="app-nav-action px-3 py-1" style="opacity: 0.5;">Đăng</button>
      </div>
    </div>
    
    <!-- Feed Tabs (Minimalist) -->
    <div v-if="user" class="d-flex justify-content-center mb-3 border-bottom" style="border-color: #333 !important;">
      <button 
        class="btn btn-link text-decoration-none px-4 py-3 fw-semibold position-relative" 
        :style="activeTab === 'discovery' ? 'color: #f3f5f7;' : 'color: #777;'"
        @click="activeTab = 'discovery'"
      >
        Dành cho bạn
        <div v-if="activeTab === 'discovery'" class="position-absolute bottom-0 start-50 translate-middle-x bg-light" style="height: 2px; width: 80%;"></div>
      </button>
      <button 
        class="btn btn-link text-decoration-none px-4 py-3 fw-semibold position-relative" 
        :style="activeTab === 'following' ? 'color: #f3f5f7;' : 'color: #777;'"
        @click="activeTab = 'following'"
      >
        Đang theo dõi
        <div v-if="activeTab === 'following'" class="position-absolute bottom-0 start-50 translate-middle-x bg-light" style="height: 2px; width: 80%;"></div>
      </button>
      <button 
        class="btn btn-link text-decoration-none px-4 py-3 fw-semibold position-relative" 
        :style="activeTab === 'friends' ? 'color: #f3f5f7;' : 'color: #777;'"
        @click="activeTab = 'friends'"
      >
        Bạn bè
        <div v-if="activeTab === 'friends'" class="position-absolute bottom-0 start-50 translate-middle-x bg-light" style="height: 2px; width: 80%;"></div>
      </button>
    </div>

    <!-- Tags Filter (Minimalist) -->
    <div v-if="allTags.length > 0" class="mb-3 d-flex flex-wrap gap-2">
      <button 
        class="btn btn-sm rounded-pill px-3" 
        :style="!selectedTag ? 'background-color: #f3f5f7; color: #101010; font-weight: 600;' : 'background-color: transparent; border: 1px solid #333; color: #f3f5f7;'"
        @click="selectedTag = ''"
      >
        Tất cả
      </button>
      <button 
        v-for="tag in allTags" 
        :key="tag"
        class="btn btn-sm rounded-pill px-3"
        :style="selectedTag === tag ? 'background-color: #f3f5f7; color: #101010; font-weight: 600;' : 'background-color: transparent; border: 1px solid #333; color: #f3f5f7;'"
        @click="selectedTag = tag"
      >
        #{{ tag }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-content-center py-5">
      <div class="spinner-border text-light" role="status" style="width: 2rem; height: 2rem; opacity: 0.5;"></div>
    </div>

    <!-- Main Feed -->
    <div v-if="!loading">
      
      <!-- Empty State -->
      <div v-if="filteredPosts.length === 0" class="text-center py-5">
        <p style="color: #777; font-size: 1.1rem;">Chưa có bài viết nào ở đây.</p>
      </div>

      <!-- Threads Posts -->
      <div v-else>
        <div v-for="p in displayedPosts" :key="p.id" class="feed-post">
          
          <!-- Left Col: Avatar + Line -->
          <div class="feed-post-left">
            <router-link :to="`/user/${p.userId}`" class="text-decoration-none">
              <div class="feed-avatar" :style="p.user && p.user.avatar ? `background-image: url(${p.user.avatar});` : ''">
                <span v-if="!p.user || !p.user.avatar" style="color: #fff; display: flex; height: 100%; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">{{ getInitials(p.author) }}</span>
              </div>
            </router-link>
            <div class="feed-line"></div>
          </div>

          <!-- Right Col: Content -->
          <div class="feed-post-right">
            
            <!-- Header -->
            <div class="feed-header">
              <div class="d-flex align-items-center gap-2">
                <router-link :to="`/user/${p.userId}`" class="feed-author text-decoration-none">
                  {{ p.author }}
                </router-link>
                <!-- Inline Follow Button if not following -->
                <button 
                  v-if="user && p.userId && p.userId !== user.id && !isFollowing(p.userId)"
                  class="btn btn-sm text-primary p-0 fw-semibold"
                  style="font-size: 0.9rem;"
                  @click="toggleFollow(p.userId)"
                >
                  Theo dõi
                </button>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span class="feed-time">{{ formatDate(p.createdAt) }}</span>
                <div v-if="user && p.userId === user.id" class="dropdown">
                  <button class="btn btn-link text-muted p-0" data-bs-toggle="dropdown" style="line-height: 1;">
                    <i class="bi bi-three-dots"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow" style="border-radius: 12px; background-color: #181818; border: 1px solid #333;">
                    <li><a class="dropdown-item" href="#" @click.prevent="editPost(p.id)">Chỉnh sửa</a></li>
                    <li><a class="dropdown-item text-danger" href="#" @click.prevent="deletePost(p.id)">Xóa</a></li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Title & Body -->
            <div style="cursor: pointer;" @click="router.push(`/post/${p.id}`)">
              <div v-if="p.title" class="fw-bold mb-1" style="font-size: 0.95rem;">{{ p.title }}</div>
              <div class="feed-content" v-html="p.content"></div>
              
              <!-- Tags -->
              <div v-if="p.tags && p.tags.length > 0" class="mb-2">
                <span v-for="tag in p.tags" :key="tag" class="text-primary me-2" style="font-size: 0.9rem;">#{{ tag }}</span>
              </div>

              <!-- Media -->
              <img v-if="p.image" :src="p.image" class="feed-image" />
            </div>

            <!-- Action Buttons -->
            <div class="feed-actions">
              <button class="feed-action-btn" :style="hasLiked(p) ? 'color: #ff3040;' : ''" @click="toggleLike(p)">
                <i class="bi" :class="hasLiked(p) ? 'bi-heart-fill' : 'bi-heart'"></i>
                <span v-if="p.likes && p.likes.length > 0" style="font-size: 0.85rem;">{{ p.likes.length }}</span>
              </button>
              <button class="feed-action-btn" @click="router.push(`/post/${p.id}`)">
                <i class="bi bi-chat"></i>
                <span v-if="p.commentCount > 0" style="font-size: 0.85rem;">{{ p.commentCount }}</span>
              </button>
              <button class="feed-action-btn" :style="hasReposted(p) ? 'color: #00ba7c;' : ''" @click="toggleRepost(p)">
                <i class="bi bi-arrow-repeat"></i>
                <span v-if="p.reposts && p.reposts.length > 0" style="font-size: 0.85rem;">{{ p.reposts.length }}</span>
              </button>
              <button class="feed-action-btn" @click="sharePost(p)">
                <i class="bi bi-send"></i>
                <span v-if="p.shares && p.shares.length > 0" style="font-size: 0.85rem;">{{ p.shares.length }}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      <!-- Load More -->
      <div v-if="visibleLimit < filteredPosts.length" class="text-center py-4">
        <button class="app-nav-action" @click="loadMore">
          Tải thêm
        </button>
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
const activeTab = ref('discovery') 
const visibleLimit = ref(10) 
const router = useRouter()
const authStore = useAuthStore()
const shareModalRef = ref(null)
const selectedPostId = ref(null)
const myFriendIds = ref([])

const user = computed(() => authStore.user)

const allTags = computed(() => {
  const tags = new Set()
  posts.value.forEach(p => {
    if (p.tags) p.tags.forEach(t => tags.add(t))
  })
  return Array.from(tags).sort()
})

const filteredPosts = computed(() => {
  let result = posts.value

  if (activeTab.value === 'following' && user.value) {
    const followingIds = user.value.following || []
    result = result.filter(p => followingIds.includes(p.userId))
  }

  if (activeTab.value === 'friends' && user.value) {
    result = result.filter(p => myFriendIds.value.includes(p.userId))
  }

  if (selectedTag.value) {
    result = result.filter(p => p.tags && p.tags.includes(selectedTag.value))
  }
  
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

const displayedPosts = computed(() => {
  return filteredPosts.value.slice(0, visibleLimit.value)
})

const loadMore = () => {
  visibleLimit.value += 10
}

const hasLiked = (post) => {
  if (!user.value || !post.likes) return false
  return post.likes.includes(user.value.id)
}

const toggleLike = async (post) => {
  if (!user.value) {
    Swal.fire({ title: 'Vui lòng đăng nhập', background: '#181818', color: '#fff', icon: 'info' })
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
    post.likes = likes
  } catch (error) {}
}

const hasReposted = (post) => {
  if (!user.value || !post.reposts) return false
  return post.reposts.includes(user.value.id)
}

const toggleRepost = async (post) => {
  if (!user.value) {
    Swal.fire({ title: 'Vui lòng đăng nhập', background: '#181818', color: '#fff', icon: 'info' })
    return
  }

  const reposts = post.reposts || []
  const userIdx = reposts.indexOf(user.value.id)

  if (userIdx > -1) {
    reposts.splice(userIdx, 1)
  } else {
    reposts.push(user.value.id)
  }

  try {
    await api.patch(`/posts/${post.id}`, { reposts })
    post.reposts = reposts
  } catch (error) {}
}

const sharePost = async (post) => {
  if (!user.value) return
  
  const shares = post.shares || []
  if (!shares.includes(user.value.id)) {
    shares.push(user.value.id)
    try {
      await api.patch(`/posts/${post.id}`, { shares })
      post.shares = shares
    } catch (e) {}
  }

  selectedPostId.value = post.id
  shareModalRef.value.open()
}

const isFollowing = (authorId) => {
  if (!user.value || !user.value.following) return false
  return user.value.following.includes(authorId)
}

const toggleFollow = async (authorId) => {
  if (!user.value) return

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

const getInitials = (name) => {
  if (!name) return '?'
  const names = name.split(' ')
  if (names.length >= 2) return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  return name[0].toUpperCase()
}

const editPost = (id) => {
  router.push(`/edit/${id}`)
}

const deletePost = async (id) => {
  const result = await Swal.fire({
    title: 'Xóa bài viết?',
    text: "Hành động này không thể hoàn tác.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy',
    background: '#181818',
    color: '#f3f5f7'
  })

  if (result.isConfirmed) {
    try {
      await api.delete(`/posts/${id}`)
      posts.value = posts.value.filter(p => p.id !== id)
    } catch (error) {}
  }
}

onMounted(async () => {
  try {
    const res = await api.get('/posts')
    const postsData = res.data.reverse() 

    const usersRes = await api.get('/users')
    const userMap = {}
    usersRes.data.forEach(u => { userMap[u.id] = u })

    const commentsRes = await api.get('/comments')
    const commentCountMap = {}
    commentsRes.data.forEach(c => {
      commentCountMap[c.postId] = (commentCountMap[c.postId] || 0) + 1
    })

    postsData.forEach(p => {
      p.user = userMap[p.userId]
      p.commentCount = commentCountMap[p.id] || 0
    })

    posts.value = postsData
    loading.value = false

    if (user.value) {
      const friendsRes = await api.get('/friendRequests')
      const accepted = friendsRes.data.filter(r => 
        r.status === 'accepted' && 
        (String(r.senderId) === String(user.value.id) || String(r.receiverId) === String(user.value.id))
      )
      myFriendIds.value = accepted.map(r => String(r.senderId) === String(user.value.id) ? String(r.receiverId) : String(r.senderId))
    }
  } catch (error) {
    loading.value = false
  }
})
</script>