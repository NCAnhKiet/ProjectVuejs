<template>
  <div class="container mt-4 mb-5">
    <div class="row">
      <!-- Sidebar / Tabs -->
      <div class="col-md-3 mb-4">
        <div class="card shadow-sm border-0 rounded-4 sticky-top" style="top: 80px;">
          <div class="card-body p-2">
            <h5 class="fw-bold px-3 pt-2 pb-2 mb-0">Bạn bè</h5>
            <div class="list-group list-group-flush border-0">
              <button 
                class="list-group-item list-group-item-action border-0 rounded-3 mb-1 d-flex justify-content-between align-items-center bg-transparent text-light"
                :class="{ 'active fw-bold': activeTab === 'friends' }"
                @click="activeTab = 'friends'"
              >
                <div><i class="bi bi-people-fill me-2"></i>Tất cả bạn bè</div>
                <span v-if="friends.length > 0" class="badge bg-secondary rounded-pill">{{ friends.length }}</span>
              </button>
              <button 
                class="list-group-item list-group-item-action border-0 rounded-3 mb-1 d-flex justify-content-between align-items-center bg-transparent text-light"
                :class="{ 'active fw-bold': activeTab === 'requests' }"
                @click="activeTab = 'requests'"
              >
                <div><i class="bi bi-person-lines-fill me-2"></i>Lời mời kết bạn</div>
                <span v-if="friendRequests.length > 0" class="badge bg-danger rounded-pill">{{ friendRequests.length }}</span>
              </button>
              <button 
                class="list-group-item list-group-item-action border-0 rounded-3 d-flex justify-content-between align-items-center bg-transparent text-light"
                :class="{ 'active fw-bold': activeTab === 'find' }"
                @click="activeTab = 'find'"
              >
                <div><i class="bi bi-search me-2"></i>Tìm kiếm bạn bè</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="col-md-9">
        <div class="card shadow-sm border-0 rounded-4 min-vh-50">
          <div class="card-body p-4">
            <!-- All Friends Tab -->
            <div v-if="activeTab === 'friends'">
              <h4 class="fw-bold mb-4">Tất cả bạn bè</h4>
              <div v-if="loading" class="text-center py-4"><span class="spinner-border text-primary"></span></div>
              <div v-else-if="friends.length === 0" class="text-center py-5 text-muted">
                <i class="bi bi-people display-1 mb-3"></i>
                <h5>Chưa có bạn bè nào</h5>
                <p>Hãy tìm kiếm và kết bạn mới nhé!</p>
                <button class="btn btn-primary rounded-pill mt-2" @click="activeTab = 'find'">Tìm kiếm ngay</button>
              </div>
              <div v-else class="row g-3">
                <div v-for="friend in friends" :key="friend.id" class="col-md-6 col-lg-4">
                  <div class="card h-100 border rounded-3 text-center p-3 user-card shadow-sm">
                    <router-link :to="`/user/${friend.id}`" class="text-decoration-none text-dark">
                      <div class="avatar-md mx-auto mb-2">{{ getInitials(friend.name) }}</div>
                      <h6 class="fw-bold text-truncate mb-1">{{ friend.name }}</h6>
                      <small class="text-muted d-block text-truncate mb-3">{{ friend.email }}</small>
                    </router-link>
                    <div class="mt-auto d-flex gap-2">
                      <router-link :to="`/messages?u=${friend.id}`" class="btn btn-primary btn-sm flex-grow-1 rounded-pill">
                        <i class="bi bi-chat-text me-1"></i>Nhắn tin
                      </router-link>
                      <button class="btn btn-light btn-sm rounded-pill" @click="unfriend(friend.id)" title="Hủy kết bạn">
                        <i class="bi bi-person-x"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Friend Requests Tab -->
            <div v-if="activeTab === 'requests'">
              <h4 class="fw-bold mb-4">Lời mời kết bạn ({{ friendRequests.length }})</h4>
              <div v-if="loading" class="text-center py-4"><span class="spinner-border text-primary"></span></div>
              <div v-else-if="friendRequests.length === 0" class="text-center py-5 text-muted">
                <i class="bi bi-envelope-open display-1 mb-3"></i>
                <h5>Không có lời mời kết bạn nào</h5>
              </div>
              <div v-else class="row g-3">
                <div v-for="req in friendRequests" :key="req.id" class="col-md-6">
                  <div class="card border rounded-3 p-3 d-flex flex-row align-items-center gap-3 shadow-sm">
                    <router-link :to="`/user/${req.user.id}`" class="text-decoration-none">
                      <div class="avatar-md">{{ getInitials(req.user.name) }}</div>
                    </router-link>
                    <div class="flex-grow-1 overflow-hidden">
                      <router-link :to="`/user/${req.user.id}`" class="text-decoration-none text-dark">
                        <h6 class="fw-bold mb-0 text-truncate">{{ req.user.name }}</h6>
                      </router-link>
                      <small class="text-muted">{{ formatDate(req.createdAt) }}</small>
                    </div>
                    <div class="d-flex flex-column gap-2">
                      <button class="btn btn-primary btn-sm rounded-pill px-3 fw-semibold" @click="handleRequest(req.id, true)">Chấp nhận</button>
                      <button class="btn btn-light btn-sm rounded-pill px-3" @click="handleRequest(req.id, false)">Từ chối</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Find Friends Tab -->
            <div v-if="activeTab === 'find'">
              <h4 class="fw-bold mb-4">Tìm kiếm bạn bè</h4>
              <div class="input-group mb-4 shadow-sm rounded-pill overflow-hidden" style="border: 1px solid #333;">
                <span class="input-group-text border-0 ps-4" style="background-color: #181818;"><i class="bi bi-search text-muted"></i></span>
                <input v-model="searchQuery" type="text" class="form-control border-0 py-2 shadow-none" style="background-color: #181818; color: #f3f5f7;" placeholder="Nhập tên hoặc email...">
              </div>
              
              <div v-if="searchQuery && searchedUsers.length === 0" class="text-center py-5 text-muted">
                <i class="bi bi-search display-1 mb-3 text-secondary"></i>
                <h5>Không tìm thấy kết quả nào.</h5>
              </div>
              <div v-else class="row g-3">
                <div v-if="!searchQuery && displayUsers.length > 0" class="col-12 mb-2">
                  <h6 class="text-muted text-uppercase small fw-bold">Gợi ý kết bạn</h6>
                </div>
                <div v-for="u in displayUsers" :key="u.id" class="col-md-6 col-lg-4">
                  <div class="card h-100 border rounded-3 text-center p-3 user-card shadow-sm">
                    <router-link :to="`/user/${u.id}`" class="text-decoration-none text-dark">
                      <div class="avatar-md mx-auto mb-2">{{ getInitials(u.name) }}</div>
                      <h6 class="fw-bold text-truncate mb-1">{{ u.name }}</h6>
                      <small class="text-muted d-block text-truncate mb-3">{{ u.email }}</small>
                    </router-link>
                    <div class="mt-auto">
                      <button v-if="friendshipMap[u.id] === 'accepted'" class="btn btn-light btn-sm w-100 rounded-pill fw-semibold" disabled><i class="bi bi-check-lg me-1"></i>Bạn bè</button>
                      <button v-else-if="friendshipMap[u.id] === 'pending_sent'" class="btn btn-outline-secondary btn-sm w-100 rounded-pill" disabled><i class="bi bi-clock me-1"></i>Đã gửi lời mời</button>
                      <button v-else-if="friendshipMap[u.id] === 'pending_received'" class="btn btn-success btn-sm w-100 rounded-pill fw-semibold" @click="activeTab = 'requests'">Xem lời mời</button>
                      <button v-else class="btn btn-primary btn-sm w-100 rounded-pill fw-semibold" @click="addFriend(u.id)"><i class="bi bi-person-plus-fill me-1"></i>Thêm bạn bè</button>
                    </div>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import friendService from '../services/friendService'
import api from '../services/api'
import Swal from 'sweetalert2'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const activeTab = ref('friends')
const loading = ref(true)
const friends = ref([])
const friendRequests = ref([])
const allUsers = ref([])
const searchQuery = ref('')
const friendshipMap = ref({}) // mapping userId -> status (accepted, pending_sent, pending_received)

const getInitials = (name) => {
  if (!name) return 'U'
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
  const diff = Math.floor((now - d) / 1000 / 60)
  if (diff < 60) return `${diff} phút trước`
  if (diff < 24 * 60) return `${Math.floor(diff / 60)} giờ trước`
  return d.toLocaleDateString('vi-VN')
}

const loadData = async () => {
  if (!user.value) return
  loading.value = true
  try {
    // Load friends
    const fRes = await friendService.getFriends(user.value.id)
    friends.value = fRes

    // Load pending requests mapped with user data
    const reqRes = await friendService.getPendingRequests(user.value.id)
    const userRes = await api.get('/users')
    allUsers.value = userRes.data.filter(u => u.id !== user.value.id) // excluding self

    friendRequests.value = reqRes.map(r => {
      const u = allUsers.value.find(user => user.id === r.senderId)
      return { ...r, user: u || { name: 'Unknown', id: r.senderId } }
    })

    // Load friendship mapping for 'Find Friends' feature
    const allReqsRes = await api.get('/friendRequests')
    const map = {}
    allReqsRes.data.forEach(r => {
      if (r.senderId === user.value.id) {
        map[r.receiverId] = r.status === 'pending' ? 'pending_sent' : 'accepted'
      } else if (r.receiverId === user.value.id) {
        map[r.senderId] = r.status === 'pending' ? 'pending_received' : 'accepted'
      }
    })
    friendshipMap.value = map

    // Update global store request count
    authStore.setFriendRequestsCount(friendRequests.value.length)

  } catch (err) {
    console.error('Error loading friends data', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

watch(activeTab, () => {
  if (activeTab.value === 'requests') loadData()
})

const handleRequest = async (id, accept) => {
  try {
    if (accept) {
      await friendService.acceptRequest(id)
      Swal.fire({ icon: 'success', title: 'Đã chấp nhận', toast: true, position: 'top-end', timer: 1500, showConfirmButton: false })
    } else {
      await friendService.rejectRequest(id)
      Swal.fire({ icon: 'success', title: 'Đã từ chối', toast: true, position: 'top-end', timer: 1500, showConfirmButton: false })
    }
    loadData()
  } catch (err) {
    console.error(err)
    Swal.fire('Lỗi', 'Thao tác thất bại', 'error')
  }
}

const addFriend = async (targetId) => {
  try {
    await friendService.sendFriendRequest(user.value.id, targetId)
    friendshipMap.value[targetId] = 'pending_sent'
    Swal.fire({ icon: 'success', title: 'Đã gửi lời mời', toast: true, position: 'top-end', timer: 1500, showConfirmButton: false })
  } catch (err) {
    console.error(err)
    Swal.fire('Lỗi', 'Không thể gửi lời mời', 'error')
  }
}

const unfriend = async (friendId) => {
  const result = await Swal.fire({
    title: 'Hủy kết bạn?',
    text: "Bạn có chắc muốn hủy kết bạn với người này?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Hủy kết bạn',
    cancelButtonText: 'Đóng'
  })

  if (result.isConfirmed) {
    try {
      const request = await friendService.checkFriendship(user.value.id, friendId)
      if (request) {
        await api.delete(`/friendRequests/${request.id}`)
        Swal.fire({ icon: 'success', title: 'Đã hủy kết bạn', timer: 1500, showConfirmButton: false })
        loadData()
      }
    } catch (error) {
      console.error(error)
      Swal.fire('Lỗi', 'Không thể hủy kết bạn', 'error')
    }
  }
}

const searchedUsers = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return allUsers.value.filter(u => 
    u.name.toLowerCase().includes(query) || 
    u.email.toLowerCase().includes(query)
  )
})

const displayUsers = computed(() => {
  if (searchQuery.value) return searchedUsers.value
  // Randomly suggest some users who are not friends yet
  return allUsers.value.filter(u => !friendshipMap.value[u.id]).slice(0, 6)
})

</script>

<style scoped>
.avatar-md {
  width: 70px;
  height: 70px;
  background-color: #2d2d2d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 28px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
}
.user-card {
  transition: all 0.2s ease-in-out;
}
.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.1)!important;
}
.list-group-item.active {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
  border-color: transparent;
}
.min-vh-50 {
  min-height: 50vh;
}
</style>
