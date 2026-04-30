<template>
  <div class="app-container mt-4">
    <!-- Search Bar -->
    <div class="position-relative mb-4">
      <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3" style="color: #777;"></i>
      <input 
        v-model="searchQuery"
        type="text"
        class="app-input w-100 py-3 pe-4"
        style="padding-left: 2.5rem; background-color: #181818; border: 1px solid #333; border-radius: 16px;"
        placeholder="Tìm kiếm bài viết..."
      >
      <button 
        v-if="searchQuery" 
        class="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2 border-0" 
        style="color: #777;"
        @click="searchQuery = ''"
      >
        <i class="bi bi-x-circle-fill"></i>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-light" style="opacity: 0.5;"></div>
    </div>

    <!-- Posts List -->
    <div v-else>
      <div v-for="post in filteredPosts" :key="post.id" class="feed-post cursor-pointer" @click="goToPost(post.id)">
        <div class="feed-post-left">
          <router-link :to="`/user/${post.userId}`" @click.stop class="text-decoration-none">
            <div class="feed-avatar" :style="getUserAvatar(post.userId) ? `background-image: url(${getUserAvatar(post.userId)});` : ''">
              <span v-if="!getUserAvatar(post.userId)" style="color: #fff; display: flex; height: 100%; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">{{ getInitials(post.author) }}</span>
            </div>
          </router-link>
        </div>
        
        <div class="feed-post-right">
          <div class="feed-header">
            <router-link :to="`/user/${post.userId}`" @click.stop class="text-decoration-none">
              <span class="feed-author">{{ post.author }}</span>
            </router-link>
            <span class="feed-time">{{ formatTime(post.createdAt) }}</span>
          </div>
          
          <div v-if="post.title" class="fw-bold mb-1" style="font-size: 1.05rem; color: #f3f5f7;">{{ post.title }}</div>
          
          <div class="feed-content" v-html="truncateContent(post.content)"></div>
          
          <img v-if="post.image" :src="post.image" class="feed-image" />
        </div>
      </div>
      
      <div v-if="filteredPosts.length === 0" class="text-center py-5 text-muted">
        Không tìm thấy bài viết nào.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const posts = ref([])
const users = ref([])
const loading = ref(true)
const searchQuery = ref('')
const router = useRouter()

const goToPost = (id) => {
  router.push(`/post/${id}`)
}

const fetchData = async () => {
  try {
    const [pRes, uRes] = await Promise.all([
      api.get('/posts'),
      api.get('/users')
    ])
    let allPosts = pRes.data || []
    allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    posts.value = allPosts
    users.value = uRes.data || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const filteredPosts = computed(() => {
  if (!searchQuery.value) return posts.value
  const q = String(searchQuery.value).trim().toLowerCase()
  if (!q) return posts.value

  return posts.value.filter(p => {
    const titleMatch = p.title ? String(p.title).toLowerCase().includes(q) : false
    const contentMatch = p.content ? String(p.content).toLowerCase().includes(q) : false
    const authorMatch = p.author ? String(p.author).toLowerCase().includes(q) : false
    
    let tagMatch = false
    if (Array.isArray(p.tags)) {
      tagMatch = p.tags.some(t => t ? String(t).toLowerCase().includes(q) : false)
    }
    
    return titleMatch || contentMatch || tagMatch || authorMatch
  })
})

const getInitials = (name) => {
  if (!name) return '?'
  const names = name.split(' ')
  if (names.length >= 2) return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  return name[0].toUpperCase()
}

const getUserAvatar = (userId) => {
  const u = users.value.find(user => user.id === userId)
  return u ? u.avatar : null
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000 / 60)
  if (diff < 60) return `${diff} phút`
  if (diff < 24 * 60) return `${Math.floor(diff / 60)} giờ`
  return d.toLocaleDateString('vi-VN')
}

const truncateContent = (html) => {
  if (!html) return ''
  const text = String(html).replace(/<[^>]*>?/gm, '')
  return text.length > 150 ? text.substring(0, 150) + '...' : text
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.cursor-pointer:hover {
  background-color: rgba(255, 255, 255, 0.02);
}
</style>
