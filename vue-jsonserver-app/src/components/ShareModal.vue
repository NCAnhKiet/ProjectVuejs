<template>
  <div class="modal fade" id="shareModal" tabindex="-1" aria-hidden="true" ref="modalElement">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fw-bold">Chia sẻ bài viết</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p class="text-muted small mb-3">Gửi bài viết này qua tin nhắn trực tiếp cho bạn bè của bạn.</p>
          
          <!-- Search Recipient -->
          <div class="input-group mb-3">
            <span class="input-group-text"><i class="bi bi-search"></i></span>
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control" 
              placeholder="Tìm kiếm bạn bè..."
            >
          </div>

          <!-- Recipients List -->
          <div class="list-group overflow-auto" style="max-height: 300px;">
            <div v-if="loading" class="text-center p-3">
              <div class="spinner-border spinner-border-sm text-primary"></div>
            </div>
            
            <div v-else-if="filteredUsers.length === 0" class="text-center p-3 text-muted small">
              Không tìm thấy người dùng nào
            </div>

            <button 
              v-for="u in filteredUsers" 
              :key="u.id"
              class="list-group-item list-group-item-action d-flex align-items-center gap-3 p-3 border-0 rounded mb-1"
              :class="{'bg-primary bg-opacity-10': selectedUserId === u.id}"
              @click="selectedUserId = u.id"
            >
              <div class="avatar-sm">
                {{ getInitials(u.name) }}
              </div>
              <div class="flex-grow-1">
                <div class="fw-semibold">{{ u.name }}</div>
                <div class="small text-muted">{{ u.email }}</div>
              </div>
              <div v-if="selectedUserId === u.id" class="text-primary">
                <i class="bi bi-check-circle-fill"></i>
              </div>
            </button>
          </div>

          <!-- Message (Optional) -->
          <div class="mt-3">
            <label class="form-label small fw-bold">Tin nhắn kèm theo (tùy chọn)</label>
            <textarea 
                v-model="shareMessage" 
                class="form-control" 
                rows="2" 
                placeholder="Nói gì đó về bài viết này..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Hủy</button>
          <button 
            type="button" 
            class="btn btn-primary rounded-pill px-4" 
            :disabled="!selectedUserId || sharing"
            @click="handleShare"
          >
            <span v-if="sharing" class="spinner-border spinner-border-sm me-2"></span>
            Gửi ngay
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineExpose } from 'vue'
import messageService from '../services/messageService'
import friendService from '../services/friendService'
import { useAuthStore } from '../stores/auth'
import Swal from 'sweetalert2'
import * as bootstrap from 'bootstrap'

const props = defineProps(['postId'])
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const friends = ref([])
const searchQuery = ref('')
const selectedUserId = ref(null)
const shareMessage = ref('')
const loading = ref(true)
const sharing = ref(false)
const modalElement = ref(null)
let modalInstance = null

const filteredUsers = computed(() => {
  return friends.value.filter(u => 
    u.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const fetchFriends = async () => {
  if (!user.value) return
  loading.value = true
  try {
    const res = await friendService.getFriends(user.value.id)
    friends.value = res
  } catch (error) {
    console.error('Lỗi khi tải danh sách bạn bè:', error)
  } finally {
    loading.value = false
  }
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

const handleShare = async () => {
  if (!selectedUserId.value || !props.postId) return
  
  sharing.value = true
  try {
    await messageService.sendMessage({
      senderId: user.value.id,
      receiverId: selectedUserId.value,
      content: shareMessage.value || 'Mình vừa chia sẻ một bài viết với bạn.',
      sharedPostId: props.postId
    })
    
    // Close modal
    if (modalInstance) {
      modalInstance.hide()
    }
    
    Swal.fire({
      icon: 'success',
      title: 'Đã gửi!',
      text: 'Bài viết đã được chia sẻ qua tin nhắn.',
      timer: 1500,
      showConfirmButton: false
    })
    
    // Reset state
    selectedUserId.value = null
    shareMessage.value = ''
    searchQuery.value = ''
  } catch (error) {
    console.error('Failed to share', error)
    Swal.fire('Lỗi', 'Không thể chia sẻ bài viết lúc này.', 'error')
  } finally {
    sharing.value = false
  }
}

onMounted(() => {
  fetchFriends()
})

const open = () => {
    if (!modalInstance) {
        modalInstance = new bootstrap.Modal(modalElement.value)
    }
    modalInstance.show()
}

defineExpose({ open })
</script>

<style scoped>
.avatar-sm {
  width: 40px;
  height: 40px;
  background-color: #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #495057;
}
</style>
