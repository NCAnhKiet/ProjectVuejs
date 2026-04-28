<template>
  <div class="container-fluid mt-4">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <!-- Header -->
        <div class="card shadow-sm mb-4 border-0 overflow-hidden rounded-4">
          <div class="profile-cover"></div>
          <div class="card-body text-center pt-0 pb-4">
            <div class="avatar-lg mx-auto mb-3 border border-4 border-white position-relative overflow-hidden" 
                 :style="targetUser.avatar ? `background-image: url(${targetUser.avatar}); background-size: cover; background-position: center;` : ''">
              <span v-if="!targetUser.avatar">{{ userInitials }}</span>
            </div>
            <h3 class="fw-bold mb-1">
              {{ targetUser.name }}
              <i v-if="targetUser.isVerified" class="bi bi-patch-check-fill text-primary ms-1" title="Đã xác minh"></i>
            </h3>
            <p class="text-muted mb-3">@{{ targetUser.email?.split('@')[0] }}</p>
            
            <div class="d-flex justify-content-center gap-4 mt-2 mb-4">
              <div class="text-center">
                <div class="fw-bold fs-5">{{ targetUser.following?.length || 0 }}</div>
                <small class="text-muted text-uppercase tracking-wider" style="font-size: 0.7rem;">Đang theo dõi</small>
              </div>
              <div class="text-center">
                <div class="fw-bold fs-5">{{ followerCount }}</div>
                <small class="text-muted text-uppercase tracking-wider" style="font-size: 0.7rem;">Người theo dõi</small>
              </div>
              <div class="text-center">
                <div class="fw-bold fs-5">{{ friendCount }}</div>
                <small class="text-muted text-uppercase tracking-wider" style="font-size: 0.7rem;">Bạn bè</small>
              </div>
              <div class="text-center">
                <div class="fw-bold fs-5">{{ myPosts.length }}</div>
                <small class="text-muted text-uppercase tracking-wider" style="font-size: 0.7rem;">Bài viết</small>
              </div>
            </div>

            <!-- Social Actions -->
            <div v-if="user && !isOwnProfile" class="d-flex justify-content-center gap-2 mb-2">
              <!-- Friend Button -->
              <button 
                v-if="friendshipStatus === 'none'"
                class="btn btn-primary rounded-pill px-4"
                @click="sendFriendRequest"
              >
                <i class="bi bi-person-plus-fill me-1"></i> Kết bạn
              </button>
              <button 
                v-else-if="friendshipStatus === 'pending_sent'"
                class="btn btn-outline-secondary rounded-pill px-4"
                disabled
              >
                <i class="bi bi-clock-history me-1"></i> Đã gửi lời mời
              </button>
              <div v-else-if="friendshipStatus === 'pending_received'" class="btn-group">
                <button class="btn btn-success rounded-start-pill px-3" @click="handleFriendRequest(true)">
                  Chấp nhận
                </button>
                <button class="btn btn-danger rounded-end-pill px-3" @click="handleFriendRequest(false)">
                  Từ chối
                </button>
              </div>
              <button 
                v-else-if="friendshipStatus === 'accepted'"
                class="btn btn-light rounded-pill px-4"
                @click="unfriend"
                title="Bấm để hủy kết bạn"
              >
                <i class="bi bi-person-check-fill me-1 text-primary"></i> Bạn bè
              </button>

              <button 
                class="btn rounded-pill px-4"
                :class="isFollowing ? 'btn-secondary' : 'btn-outline-primary'"
                @click="toggleFollow"
              >
                {{ isFollowing ? 'Đang theo dõi' : '+ Theo dõi' }}
              </button>
              
              <router-link :to="`/messages?u=${targetUser.id}`" class="btn btn-outline-primary rounded-pill px-4">
                <i class="bi bi-chat-text me-1"></i> Nhắn tin
              </router-link>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="card-footer bg-white p-0 border-top-0">
            <ul class="nav nav-tabs nav-fill border-0">
              <li class="nav-item">
                <a class="nav-link border-0 py-3 fw-semibold" :class="{ active: activeTab === 'posts' }" href="#" @click.prevent="activeTab = 'posts'">
                  <i class="bi bi-grid-3x3 me-1"></i> Bài viết
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link border-0 py-3 fw-semibold" :class="{ active: activeTab === 'about' }" href="#" @click.prevent="activeTab = 'about'">
                  <i class="bi bi-info-circle me-1"></i> Giới thiệu
                </a>
              </li>
              <li v-if="isOwnProfile" class="nav-item">
                <a class="nav-link border-0 py-3 fw-semibold text-danger" :class="{ active: activeTab === 'settings' }" href="#" @click.prevent="activeTab = 'settings'">
                  <i class="bi bi-gear me-1"></i> Cài đặt
                </a>
              </li>
            </ul>
          </div>
        </div>



        <!-- Tab Content -->
        <div class="tab-content mt-2">
          <!-- Posts Tab -->
          <div v-if="activeTab === 'posts'" class="tab-pane fade show active">
            <div v-if="loadingPosts" class="text-center py-5">
              <span class="spinner-border text-primary"></span>
            </div>
            <div v-else-if="myPosts.length === 0" class="card shadow-sm border-0 rounded-4 py-5 text-center">
              <div class="text-muted fs-1 mb-2"><i class="bi bi-journal-x"></i></div>
              <p class="text-muted">Chưa có bài viết nào được đăng.</p>
            </div>
            <div v-else class="row g-4">
              <div v-for="p in myPosts" :key="p.id" class="col-md-6">
                <div class="card h-100 shadow-sm border-0 rounded-4 overflow-hidden post-card-mini">
                  <div v-if="p.image" class="post-img-container">
                    <img :src="p.image" class="card-img-top" alt="post">
                  </div>
                  <div class="card-body">
                    <h5 class="card-title fw-bold mb-1 text-truncate">{{ p.title }}</h5>
                    <p class="text-muted small mb-3">
                      <i class="bi bi-calendar3 me-1"></i>{{ formatDate(p.createdAt) }}
                    </p>
                    <div class="d-flex justify-content-between align-items-center mt-auto">
                      <router-link :to="`/post/${p.id}`" class="btn btn-sm btn-primary rounded-pill px-3">
                        Xem bài viết
                      </router-link>
                      <button v-if="isOwnProfile" class="btn btn-sm btn-outline-danger border-0 rounded-circle" @click="deleteMyPost(p.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- About Tab -->
          <div v-if="activeTab === 'about'" class="tab-pane fade show active">
            <div class="card shadow-sm border-0 rounded-4">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-4"><i class="bi bi-info-circle me-2 text-primary"></i>Thông tin cơ bản</h5>
                <div class="row gy-4">
                  <div class="col-sm-6">
                    <label class="text-muted small text-uppercase fw-bold">Họ và tên</label>
                    <div class="fw-semibold fs-5">{{ targetUser.name }}</div>
                  </div>
                  <div class="col-sm-6">
                    <label class="text-muted small text-uppercase fw-bold">Email</label>
                    <div class="fw-semibold fs-5">{{ targetUser.email }}</div>
                  </div>
                  <div class="col-sm-6">
                    <label class="text-muted small text-uppercase fw-bold">Ngày tham gia</label>
                    <div class="fw-semibold fs-5">{{ formatDate(targetUser.createdAt) }}</div>
                  </div>
                  <div class="col-sm-12" v-if="targetUser.bio">
                    <label class="text-muted small text-uppercase fw-bold">Tiểu sử</label>
                    <div class="fw-semibold fs-6 fst-italic text-secondary mt-1">"{{ targetUser.bio }}"</div>
                  </div>
                  <div class="col-sm-6" v-if="targetUser.location">
                    <label class="text-muted small text-uppercase fw-bold">Nơi sống</label>
                    <div class="fw-semibold fs-5"><i class="bi bi-geo-alt-fill text-danger me-1"></i> {{ targetUser.location }}</div>
                  </div>
                  <div class="col-sm-6" v-if="targetUser.job">
                    <label class="text-muted small text-uppercase fw-bold">Công việc</label>
                    <div class="fw-semibold fs-5"><i class="bi bi-briefcase-fill text-primary me-1"></i> {{ targetUser.job }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Settings Tab -->
          <div v-if="activeTab === 'settings' && isOwnProfile" class="tab-pane fade show active">
            <div class="card shadow-sm border-0 rounded-4">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-4"><i class="bi bi-person-gear me-2 text-danger"></i>Quản lý tài khoản</h5>
                
                <form @submit.prevent="updateProfile" class="row g-4">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Họ và tên</label>
                    <input v-model="editUser.name" type="text" class="form-control rounded-pill px-3" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Email</label>
                    <input v-model="editUser.email" type="email" class="form-control rounded-pill px-3" required disabled>
                    <small class="text-muted">Email không thể thay đổi</small>
                  </div>
                  <div class="col-md-12 text-center mb-3">
                    <label class="form-label fw-semibold d-block text-start">Ảnh đại diện</label>
                    <div class="position-relative d-inline-block mt-2" style="width: 130px; height: 130px; cursor: pointer;" @click="triggerAvatarUpload" title="Chọn ảnh mới">
                      <div class="rounded-circle border border-3 shadow-sm overflow-hidden bg-light" style="width: 100%; height: 100%;">
                        <img v-if="editUser.avatar" :src="editUser.avatar" class="w-100 h-100" style="object-fit: cover;" alt="Avatar">
                        <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-secondary fs-1 fw-bold">
                          {{ userInitials }}
                        </div>
                      </div>
                      <div class="position-absolute bg-white border rounded-circle d-flex align-items-center justify-content-center shadow" style="width: 36px; height: 36px; bottom: 5px; right: 5px; transition: 0.2s;">
                        <i class="bi bi-camera-fill text-dark fs-5"></i>
                      </div>
                    </div>
                    <input type="file" ref="avatarInput" class="d-none" accept="image/png, image/jpeg, image/jpg, image/webp" @change="handleAvatarUpload">
                    <div class="small text-muted mt-2">Nhấp vào khung ảnh để tải lên từ thiết bị (Tối đa 2MB)</div>
                    <button v-if="editUser.avatar" @click="editUser.avatar = ''" type="button" class="btn btn-sm btn-outline-danger mt-2 rounded-pill px-3">
                      <i class="bi bi-trash-fill me-1"></i> Gỡ ảnh hiện tại
                    </button>
                  </div>
                  <div class="col-md-12">
                    <label class="form-label fw-semibold">Tiểu sử</label>
                    <textarea v-model="editUser.bio" class="form-control rounded-4 px-3 py-2" rows="2" placeholder="Một vài điều về bạn..."></textarea>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Nơi sống</label>
                    <input v-model="editUser.location" type="text" class="form-control rounded-pill px-3" placeholder="Ví dụ: TP. HCM">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Công việc</label>
                    <input v-model="editUser.job" type="text" class="form-control rounded-pill px-3" placeholder="Ví dụ: Lập trình viên">
                  </div>
                  
                  <hr class="my-4">
                  
                  <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <h6 class="fw-bold mb-0"><i class="bi bi-shield-lock me-2"></i>Đổi mật khẩu</h6>
                      <router-link :to="`/forgot-password?email=${targetUser.email}`" class="text-decoration-none small">Quên mật khẩu?</router-link>
                    </div>
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label small">Mật khẩu cũ</label>
                        <input 
                          v-model="oldPassword" 
                          type="password"
                          class="form-control rounded-pill px-3"
                          placeholder="Nhập mật khẩu cũ"
                        >
                      </div>
                      <div class="col-md-6">
                        <label class="form-label small">Mật khẩu mới</label>
                        <div class="input-group">
                          <input 
                            v-model="editUser.password" 
                            :type="showPassword ? 'text' : 'password'"
                            class="form-control rounded-start-pill px-3"
                            placeholder="Nhập mật khẩu mới"
                          >
                          <button class="btn btn-outline-secondary rounded-end-pill px-3" type="button" @click="showPassword = !showPassword">
                            <i v-if="showPassword" class="bi bi-eye-slash"></i>
                            <i v-else class="bi bi-eye"></i>
                          </button>
                        </div>
                        <div class="form-text">Để trống nếu không đổi mật khẩu</div>
                      </div>
                    </div>
                  </div>

                  <div class="col-12 mt-5">
                    <button type="submit" class="btn btn-primary rounded-pill px-5 py-2 shadow-sm" :disabled="isUpdating">
                      <span v-if="!isUpdating">Lưu thay đổi</span>
                      <span v-else class="spinner-border spinner-border-sm"></span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

</template>



<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../services/api'
import friendService from '../services/friendService'
import Swal from 'sweetalert2'
import * as bootstrap from 'bootstrap'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const activeTab = ref('posts')
const showPassword = ref(false)
const oldPassword = ref('')
const isUpdating = ref(false)
const myPosts = ref([])
const loadingPosts = ref(false)
const followerCount = ref(0)
const friendCount = ref(0)
const friendshipStatus = ref('none') // none, pending_sent, pending_received, accepted
const friendRequestId = ref(null)

const user = computed(() => authStore.user)
const targetUser = ref({})
const editUser = ref({}) // Dùng cho form edit trong Cài đặt
const avatarInput = ref(null)

const triggerAvatarUpload = () => {
  if (avatarInput.value) {
    avatarInput.value.click()
  }
}

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Check file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    Swal.fire('Lỗi', 'Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 2MB.', 'error')
    event.target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    editUser.value.avatar = e.target.result
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

const isOwnProfile = computed(() => {
  if (!user.value || !targetUser.value) return false
  return user.value.id === targetUser.value.id
})

const isFollowing = computed(() => {
  if (!user.value || !targetUser.value || !user.value.following) return false
  return user.value.following.includes(targetUser.value.id)
})

const fetchUserData = async () => {
  const userId = route.params.id || user.value?.id
  
  if (!userId) {
    router.push('/login')
    return
  }

  try {
    const res = await api.get(`/users/${userId}`)
    targetUser.value = res.data
    editUser.value = { ...res.data, password: '' } // Clear password for edit form
    
    // Load data khác
    loadPosts(userId)
    fetchFollowerCount(userId)
    checkFriendStatus(userId)
  } catch (err) {
    console.error(err)
    Swal.fire('Lỗi', 'Không tìm thấy người dùng!', 'error')
    router.push('/')
  }
}

const checkFriendStatus = async (targetId) => {
  if (!user.value) return
  try {
    const request = await friendService.checkFriendship(user.value.id, targetId)
    if (!request) {
      friendshipStatus.value = 'none'
    } else if (request.status === 'accepted') {
      friendshipStatus.value = 'accepted'
    } else if (String(request.senderId) === String(user.value.id)) {
      friendshipStatus.value = 'pending_sent'
    } else {
      friendshipStatus.value = 'pending_received'
      friendRequestId.value = request.id
    }
  } catch (err) {
    console.error(err)
  }
}

const sendFriendRequest = async () => {
  try {
    await friendService.sendFriendRequest(user.value.id, targetUser.value.id)
    friendshipStatus.value = 'pending_sent'
    Swal.fire({
      icon: 'success',
      title: 'Đã gửi lời mời!',
      timer: 1500,
      showConfirmButton: false
    })
  } catch (err) {
    console.error(err)
  }
}

const handleFriendRequest = async (accept) => {
  try {
    if (accept) {
      await friendService.acceptRequest(friendRequestId.value)
      friendshipStatus.value = 'accepted'
      friendCount.value++
    } else {
      await friendService.rejectRequest(friendRequestId.value)
      friendshipStatus.value = 'none'
    }
  } catch (err) {
    console.error(err)
  }
}

const unfriend = async () => {
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
      const request = await friendService.checkFriendship(user.value.id, targetUser.value.id)
      if (request) {
        await api.delete(`/friendRequests/${request.id}`)
        Swal.fire({ icon: 'success', title: 'Đã hủy kết bạn', timer: 1500, showConfirmButton: false })
        friendshipStatus.value = 'none'
        friendCount.value--
      }
    } catch (error) {
      console.error(error)
      Swal.fire('Lỗi', 'Không thể hủy kết bạn', 'error')
    }
  }
}

const fetchFollowerCount = async (userId) => {
  try {
    const res = await api.get('/users')
    const allUsers = res.data
    
    followerCount.value = allUsers.filter(u => u.following && u.following.includes(userId)).length
    
    // Count accepted friends
    const friendsRes = await api.get('/friendRequests')
    friendCount.value = friendsRes.data.filter(r => 
        r.status === 'accepted' && (String(r.senderId) === String(userId) || String(r.receiverId) === String(userId))
    ).length
  } catch (err) {
    console.error('Lỗi khi lấy số liệu mạng xã hội:', err)
  }
}

const toggleFollow = async () => {
  if (!user.value) {
    Swal.fire('Thông báo', 'Vui lòng đăng nhập để theo dõi!', 'info')
    return
  }

  const following = [...(user.value.following || [])]
  const idx = following.indexOf(targetUser.value.id)

  if (idx > -1) {
    following.splice(idx, 1)
  } else {
    following.push(targetUser.value.id)
  }

  try {
    await api.patch(`/users/${user.value.id}`, { following })
    authStore.updateUser({ following })
    
    // Cập nhật local follower count để trải nghiệm mượt hơn
    if (idx > -1) followerCount.value--
    else followerCount.value++
    
  } catch (error) {
    console.error('Lỗi khi follow:', error)
  }
}

const userInitials = computed(() => {
  if (!targetUser.value.name) return 'U'
  const names = targetUser.value.name.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return targetUser.value.name[0].toUpperCase()
})

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('vi-VN', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const updateProfile = async () => {
  if (!editUser.value.name || !editUser.value.email) {
    Swal.fire('Cảnh báo', 'Vui lòng nhập đầy đủ thông tin!', 'warning')
    return
  }

  // Yêu cầu mật khẩu cũ nếu muốn đổi mật khẩu
  if (editUser.value.password) {
    if (!oldPassword.value) {
      Swal.fire('Cảnh báo', 'Vui lòng nhập mật khẩu cũ để thay đổi mật khẩu!', 'warning')
      return
    }
    if (oldPassword.value !== targetUser.value.password) {
      Swal.fire('Lỗi', 'Mật khẩu cũ không chính xác!', 'error')
      return
    }
  }

  isUpdating.value = true

  try {
    // Nếu pass trống, giữ nguyên pass cũ
    const updateData = { ...editUser.value }
    if (!updateData.password) {
      delete updateData.password
    }

    await api.patch(`/users/${user.value.id}`, updateData)
    
    // Cập nhật targetUser để hiển thị thay đổi ngay
    targetUser.value = { ...targetUser.value, ...updateData }
    authStore.updateUser(targetUser.value)
    
    oldPassword.value = ''
    editUser.value.password = ''
    
    Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Cập nhật thông tin thành công!',
      timer: 1500,
      showConfirmButton: false
    })
    
    activeTab.value = 'about'
  } catch (error) {
    console.error('Lỗi khi cập nhật:', error)
    Swal.fire('Lỗi', 'Cập nhật thất bại. Vui lòng thử lại!', 'error')
  } finally {
    isUpdating.value = false
  }
}

const loadPosts = async (userId) => {
  loadingPosts.value = true
  try {
    const res = await api.get(`/posts?userId=${userId}`)
    myPosts.value = res.data.reverse()
  } catch (err) {
    console.log(err)
  } finally {
    loadingPosts.value = false
  }
}

onMounted(() => {
  fetchUserData()
})

// Watch route params change to reload data when switching profiles
watch(() => route.params.id, () => {
  fetchUserData()
  activeTab.value = 'posts'
})

const deleteMyPost = async (id) => {
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

  if (!result.isConfirmed) return

  try {
    await api.delete(`/posts/${id}`)
    myPosts.value = myPosts.value.filter(p => p.id !== id)
    Swal.fire({
      icon: 'success',
      title: 'Đã xóa!',
      text: 'Bài viết của bạn đã bị xóa.',
      timer: 1500,
      showConfirmButton: false
    })
  } catch (err) {
    Swal.fire('Lỗi', 'Xóa thất bại', 'error')
  }
}

</script>

<style scoped>
.avatar-lg {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 45px;
  box-shadow: 0 4px 15px rgba(0,0,0,.15);
  margin-top: -60px;
  position: relative;
  z-index: 2;
}

.profile-cover {
  height: 160px;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
}

.nav-tabs .nav-link {
  border-bottom: 3px solid transparent;
  color: #6c757d;
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  border-bottom-color: #0d6efd;
  background: transparent;
}

.post-card-mini {
  transition: transform 0.2s;
  cursor: pointer;
}

.post-card-mini:hover {
  transform: translateY(-5px);
}

.post-img-container {
  height: 150px;
  overflow: hidden;
}

.post-img-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tracking-wider {
  letter-spacing: 0.05em;
}
</style>