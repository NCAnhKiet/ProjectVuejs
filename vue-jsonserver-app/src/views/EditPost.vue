<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h3 class="fw-bold mb-3">
              <i class="bi bi-pencil-square me-2"></i>Sửa bài viết
            </h3>

            <div v-if="loading" class="text-center py-4">
              <span class="spinner-border"></span>
            </div>

            <form v-else @submit.prevent="updatePost">
                <label class="form-label fw-semibold">Ảnh bài viết</label>
<input ref="fileInput" type="file" class="form-control mb-2" @change="handleImage" />


<div v-if="previewImage || post.image" class="position-relative">
  <img
    :src="previewImage || post.image"
    class="img-fluid mt-2 rounded"
    style="max-height:400px; object-fit:cover;"
  />

  <button
    type="button"
    class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
    @click="removeImage"
  >
    <i class="bi bi-x-lg"></i>
  </button>
</div>


              <div class="mb-3">
                <label class="form-label fw-semibold pt-2">Tiêu đề</label>
                <input v-model="post.title" class="form-control" required />
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Nội dung</label>
                <textarea
                  v-model="post.content"
                  class="form-control"
                  rows="6"
                  required
                ></textarea>
              </div>

              <div class="d-flex gap-2">
                <button class="btn btn-primary">
                  <i class="bi bi-save me-1"></i>Lưu
                </button>

                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="$router.push('/')"
                >
                  Hủy
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const router = useRouter()

const post = ref({})
const loading = ref(true)
const previewImage = ref(null)
const fileInput = ref(null)

const resizeImage = (file, max = 800) => {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(max / img.width, max / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.src = URL.createObjectURL(file)
  })
}


const user = JSON.parse(localStorage.getItem('user') || '{}')

onMounted(async () => {
  if (!user.id) {
    router.push('/login')
    return
  }

  try {
    const res = await api.get(`/posts/${route.params.id}`)
    post.value = res.data

    if (post.value.userId !== user.id) {
      alert('Bạn không có quyền sửa bài này')
      router.push('/')
    }

  } catch (err) {
    alert('Không tìm thấy bài viết')
    router.push('/')
  } finally {
    loading.value = false
  }
})


const handleImage = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    alert('Ảnh phải nhỏ hơn 2MB')
    return
  }

  const base64 = await resizeImage(file)
  post.value.image = base64
  previewImage.value = base64
}

const removeImage = () => {
  post.value.image = ''
  previewImage.value = null
  if (fileInput.value) fileInput.value.value = ''
}


const updatePost = async () => {
  try {
    await api.put(`/posts/${route.params.id}`, post.value)
    alert('✅ Cập nhật thành công!')
    router.push('/')
  } catch (err) {
    alert('❌ Cập nhật thất bại!')
  }
}
</script>
