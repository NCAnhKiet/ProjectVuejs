<template>
  <div class="container-fluid py-4" style="height: calc(100vh - 100px);">
    <div class="row h-100 g-3">
      <!-- Sidebar: Conversations List -->
      <div class="col-md-4 col-lg-3 h-100">
        <div class="card shadow-sm h-100 border-0 rounded-4 overflow-hidden">
          <div class="card-header bg-white border-bottom p-3">
            <h5 class="fw-bold mb-0">Tin nhắn</h5>
          </div>
          <div class="list-group list-group-flush overflow-auto">
            <div v-if="loading" class="text-center p-4">
              <div class="spinner-border spinner-border-sm text-primary"></div>
            </div>
            <div v-else-if="conversations.length === 0" class="p-4 text-center text-muted">
              <i class="bi bi-chat-dots fs-1 mb-2 d-block"></i>
              Chưa có cuộc trò chuyện nào
            </div>
            <button 
              v-for="conv in conversations" 
              :key="conv.otherId"
              class="list-group-item list-group-item-action p-3 border-0"
              :class="{'active-conv': activeChatId === String(conv.otherId)}"
              @click="selectConversation(conv.otherId)"
            >
              <div class="d-flex align-items-center">
                <div class="avatar-md me-3">
                  {{ getUserInitials(conv.otherId) }}
                </div>
                <div class="flex-grow-1 overflow-hidden">
                  <div class="d-flex justify-content-between align-items-center">
                    <h6 class="mb-0 fw-bold text-truncate">{{ getUserName(conv.otherId) }}</h6>
                    <small class="text-muted">{{ formatTime(conv.lastMessage.createdAt) }}</small>
                  </div>
                  <p class="mb-0 text-muted text-truncate small" :class="{'fw-bold text-dark': conv.unreadCount > 0}">
                    <template v-if="conv.lastMessage.isUnsent">
                      <span class="fst-italic">{{ String(conv.lastMessage.senderId) === String(user.id) ? 'Bạn đã thu hồi một tin nhắn' : 'Tin nhắn đã bị thu hồi' }}</span>
                    </template>
                    <template v-else>
                      {{ String(conv.lastMessage.senderId) === String(user.id) ? 'Bạn: ' : '' }}{{ conv.lastMessage.sharedPostId ? 'Đã chia sẻ một bài viết' : conv.lastMessage.content }}
                    </template>
                  </p>
                </div>
                <div v-if="conv.unreadCount > 0" class="badge rounded-pill bg-danger ms-2">
                  {{ conv.unreadCount }}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="col-md-8 col-lg-9 h-100">
        <div class="card shadow-sm h-100 border-0 rounded-4 overflow-hidden d-flex flex-column">
          <template v-if="activeChatId">
            <!-- Chat Header -->
            <div class="card-header bg-white border-bottom p-3 d-flex align-items-center">
              <div class="avatar-sm me-3">
                {{ getUserInitials(activeChatId) }}
              </div>
              <div>
                <h6 class="mb-0 fw-bold">{{ getUserName(activeChatId) }}</h6>
                <small class="text-success"><i class="bi bi-circle-fill me-1 small"></i> Đang hoạt động</small>
              </div>
            </div>

            <!-- Messages Body -->
            <div class="card-body bg-light overflow-auto p-4 flex-grow-1" ref="messageBox">
              <div v-for="msg in messages" :key="msg.id" class="mb-3 d-flex" :class="String(msg.senderId) === String(user.id) ? 'justify-content-end' : 'justify-content-start'">
                <div class="message-wrapper" :class="String(msg.senderId) === String(user.id) ? 'flex-row-reverse' : ''">
                  <div class="message-bubble px-3 py-2 shadow-sm" 
                    :class="[
                      msg.isUnsent ? 'bg-transparent border border-secondary border-opacity-25 text-muted fst-italic' : (String(msg.senderId) === String(user.id) ? 'bg-primary text-white' : 'bg-white text-dark'),
                      String(msg.senderId) === String(user.id) ? 'sender' : 'receiver'
                    ]">
                    
                    <template v-if="msg.isUnsent">
                      <div class="content-text opacity-75">
                         {{ String(msg.senderId) === String(user.id) ? 'Bạn đã thu hồi một tin nhắn' : 'Tin nhắn đã bị thu hồi' }}
                      </div>
                    </template>
                    
                    <template v-else>
                      <div v-if="msg.sharedPostId" class="shared-post p-2 mb-2 rounded bg-opacity-10" :class="String(msg.senderId) === String(user.id) ? 'bg-light' : 'bg-primary'" @click="goToPost(msg.sharedPostId)">
                        <small class="d-block opacity-75 mb-1"><i class="bi bi-share-fill me-1"></i> Chia sẻ bài viết</small>
                        <div class="fw-bold small">Xem chi tiết bài viết...</div>
                      </div>
                      <div class="content-text">
                        {{ msg.content }}
                      </div>
                      <div class="d-flex justify-content-between align-items-center mt-1">
                        <small v-if="msg.isEdited" class="opacity-50 me-2" style="font-size: 0.6rem;">(Đã sửa)</small>
                        <small class="opacity-75" style="font-size: 0.7rem;">{{ formatTime(msg.createdAt) }}</small>
                      </div>
                    </template>
                  </div>
                  
                  <!-- Message Actions (Only for sender and only if not unsent) -->
                  <div v-if="String(msg.senderId) === String(user.id) && !msg.isUnsent" class="message-actions mx-2">
                    <button class="btn btn-link btn-sm p-0 text-muted" title="Sửa" @click="startEdit(msg)"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-link btn-sm p-0 text-danger ms-2" title="Thu hồi" @click="confirmUnsend(msg.id)"><i class="bi bi-arrow-counterclockwise"></i></button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Chat Input -->
            <div class="card-footer bg-white border-top p-3">
              <div v-if="editingMessageId" class="small text-primary mb-2 d-flex justify-content-between">
                <span><i class="bi bi-pencil-square me-1"></i> Đang chỉnh sửa tin nhắn...</span>
                <button class="btn btn-link btn-sm p-0 text-muted" @click="cancelEdit">Hủy</button>
              </div>
              <form @submit.prevent="sendMessage" class="d-flex gap-2">
                <input 
                  v-model="newMessage" 
                  type="text" 
                  class="form-control rounded-pill bg-light border-0 px-4" 
                  :placeholder="editingMessageId ? 'Sửa tin nhắn...' : 'Nhập tin nhắn...'"
                  required
                >
                <button type="submit" class="btn btn-primary rounded-circle shadow-sm" :disabled="!newMessage.trim()">
                  <i :class="editingMessageId ? 'bi bi-check-lg' : 'bi bi-send-fill'"></i>
                </button>
              </form>
            </div>
          </template>

          <div v-else class="h-100 d-flex flex-column align-items-center justify-content-center text-muted p-5">
            <div class="bg-light rounded-circle p-4 mb-4">
              <i class="bi bi-chat-dots-fill" style="font-size: 4rem; color: #dee2e6;"></i>
            </div>
            <h4>Bắt đầu trò chuyện</h4>
            <p class="text-center">Chọn một người bạn từ danh sách để bắt đầu trao đổi tin nhắn hoặc chia sẻ những nội dung thú vị.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import messageService from '../services/messageService'
import api from '../services/api'
import { useRouter, useRoute } from 'vue-router'
import Swal from 'sweetalert2'
import * as bootstrap from 'bootstrap'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const router = useRouter()
const route = useRoute()

const conversations = ref([])
const messages = ref([])
const activeChatId = ref(null)
const newMessage = ref('')
const loading = ref(true)
const allUsers = ref([])
const messageBox = ref(null)
const editingMessageId = ref(null)

const fetchInitialData = async () => {
  if (!user.value) return
  try {
    const [convs, users] = await Promise.all([
      messageService.getConversations(user.value.id),
      api.get('/users')
    ])
    conversations.value = convs
    allUsers.value = users.data
    
    // Auto select if user ID in query
    const targetId = route.query.userId || route.query.u
    if (targetId) {
      selectConversation(targetId)
    }
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu tin nhắn:', error)
  } finally {
    loading.value = false
  }
}

const selectConversation = async (otherId) => {
  if (!otherId || !user.value?.id) return
  
  const targetId = String(otherId)
  activeChatId.value = targetId
  editingMessageId.value = null // Clear editing state when switching chat
  
  try {
    const history = await messageService.getChatHistory(user.value.id, targetId)
    messages.value = history
    scrollToBottom()
    
    // Mark as read and update store count
    let readCount = 0
    const readPromises = history.map(m => {
      if (String(m.receiverId) === String(user.value.id) && !m.isRead) {
        readCount++
        return messageService.markAsRead(m.id)
      }
    }).filter(Boolean)
    
    if (readPromises.length > 0) {
      await Promise.all(readPromises)
      authStore.setUnreadCount(Math.max(0, authStore.unreadMessagesCount - readCount))
    }
  } catch (error) {
    console.error('Lỗi khi tải lịch sử chat:', error)
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !activeChatId.value) return
  
  try {
    if (editingMessageId.value) {
      await messageService.editMessage(editingMessageId.value, newMessage.value)
      const index = messages.value.findIndex(m => m.id === editingMessageId.value)
      if (index !== -1) {
        messages.value[index].content = newMessage.value
        messages.value[index].isEdited = true
      }
      editingMessageId.value = null
    } else {
      const sent = await messageService.sendMessage({
        senderId: user.value.id,
        receiverId: activeChatId.value,
        content: newMessage.value
      })
      messages.value.push(sent)
      
      // Update local conversations list
      const convIndex = conversations.value.findIndex(c => String(c.otherId) === String(activeChatId.value))
      if (convIndex !== -1) {
        conversations.value[convIndex].lastMessage = sent
        // Move to top
        const [moved] = conversations.value.splice(convIndex, 1)
        conversations.value.unshift(moved)
      } else {
        // New conversation, re-fetch list
        const res = await messageService.getConversations(user.value.id)
        conversations.value = res
      }
    }
    newMessage.value = ''
    scrollToBottom()
  } catch (error) {
    console.error('Lỗi khi gửi/sửa tin nhắn:', error)
  }
}

const startEdit = (msg) => {
  editingMessageId.value = msg.id
  newMessage.value = msg.content
}

const cancelEdit = () => {
  editingMessageId.value = null
  newMessage.value = ''
}

const confirmUnsend = async (messageId) => {
  const result = await Swal.fire({
    title: 'Thu hồi tin nhắn?',
    text: "Mọi người trong cuộc trò chuyện sẽ thấy tin nhắn đã được thu hồi.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Thu hồi',
    cancelButtonText: 'Hủy'
  })

  if (result.isConfirmed) {
    try {
      await messageService.unsendMessage(messageId)
      
      // Update local state
      const index = messages.value.findIndex(m => String(m.id) === String(messageId))
      if (index !== -1) {
        messages.value[index].content = 'Bạn đã thu hồi một tin nhắn'
        messages.value[index].isUnsent = true
      }
      
      // Update sidebar
      const res = await messageService.getConversations(user.value.id)
      conversations.value = res
      
      Swal.fire({
        icon: 'success',
        title: 'Đã thu hồi!',
        timer: 1000,
        showConfirmButton: false
      })
    } catch (error) {
      console.error('Lỗi khi thu hồi tin nhắn:', error)
      Swal.fire('Lỗi', 'Không thể thu hồi tin nhắn lúc này.', 'error')
    }
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messageBox.value) {
      messageBox.value.scrollTop = messageBox.value.scrollHeight
    }
  })
}

const getUserName = (userId) => {
  const u = allUsers.value.find(u => String(u.id) === String(userId))
  return u ? u.name : 'Người dùng hệ thống'
}

const getUserInitials = (userId) => {
  const name = getUserName(userId)
  const names = name.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return name[0].toUpperCase()
}

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' })
  } else {
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' })
  }
}

const goToPost = (postId) => {
  router.push(`/post/${postId}`)
}

onMounted(fetchInitialData)

// Real-time simulated polling every 5 seconds
let interval
onMounted(() => {
  interval = setInterval(async () => {
    if (!user.value?.id) return

    if (activeChatId.value) {
      try {
        const res = await messageService.getChatHistory(user.value.id, activeChatId.value)
        if (res.length > messages.value.length) {
          messages.value = res
          scrollToBottom()
        }
      } catch (e) { console.error(e) }
    }

    try {
      const res = await messageService.getConversations(user.value.id)
      if (res && Array.isArray(res) && res.length > 0) {
        conversations.value = res
      }
    } catch (e) { console.error(e) }
  }, 5000)
})

watch(user, (newVal) => {
  if (newVal) fetchInitialData()
}, { immediate: true })

watch(() => [route.query.userId, route.query.u], ([newId, newU]) => {
  const targetId = newId || newU
  if (targetId) selectConversation(targetId)
})

</script>

<style scoped>
.avatar-md {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e9ecef;
  color: #495057;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.avatar-sm {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e9ecef;
  color: #495057;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}
.active-conv {
  background-color: #f0f7ff !important;
  border-left: 4px solid #0d6efd !important;
}
.message-bubble {
  max-width: 75%;
  position: relative;
}
.sender {
  border-radius: 20px 20px 4px 20px;
}
.receiver {
  border-radius: 20px 20px 20px 4px;
}
.unread-dot {
  width: 10px;
  height: 10px;
  background-color: #0d6efd;
  border-radius: 50%;
}
.shared-post {
  cursor: pointer;
  transition: opacity 0.2s;
}
.shared-post:hover {
  opacity: 0.8;
}
.message-wrapper {
  display: flex;
  max-width: 85%;
  align-items: flex-end;
}
.message-bubble {
  max-width: 100%;
  word-wrap: break-word;
}
.message-wrapper:hover .message-actions {
  opacity: 1;
}
.message-actions {
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}
.content-text {
  word-break: break-word;
  white-space: pre-wrap;
  display: block;
}
</style>
