<template>
  <div class="container mt-5 pt-4">
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div class="card-body p-4 p-md-5">
            <div class="text-center mb-4">
              <div
                class="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style="width: 70px; height: 70px"
              >
                <i class="bi bi-key-fill fs-1"></i>
              </div>
              <h3 class="fw-bold mb-2">Khôi phục mật khẩu</h3>
              <p class="text-muted">
                Không sao cả, chúng tôi sẽ giúp bạn lấy lại quyền truy cập.
              </p>
            </div>

            <!-- Step 1: Nhập Email -->
            <form
              v-if="step === 1"
              @submit.prevent="sendResetCode"
              class="animate__animated animate__fadeIn"
            >
              <div class="mb-4">
                <label class="form-label fw-semibold"
                  >Địa chỉ Email của bạn</label
                >
                <div class="input-group input-group-lg">
                  <span class="input-group-text bg-light border-end-0">
                    <i class="bi bi-envelope text-muted"></i>
                  </span>
                  <input
                    v-model="email"
                    type="email"
                    class="form-control border-start-0 ps-0 bg-light"
                    placeholder="Nhập email đã đăng ký..."
                    required
                    :disabled="isSending"
                  />
                </div>
              </div>
              <button
                type="submit"
                class="btn btn-primary w-100 btn-lg rounded-pill shadow-sm"
                :disabled="isSending"
              >
                <span v-if="!isSending"
                  ><i class="bi bi-send-fill me-2"></i>Gửi mã khôi phục</span
                >
                <span v-else
                  ><span class="spinner-border spinner-border-sm me-2"></span
                  >Đang gửi Email...</span
                >
              </button>
            </form>

            <!-- Step 2: Nhập Code và Pass mới -->
            <form
              v-else-if="step === 2"
              @submit.prevent="resetPassword"
              class="animate__animated animate__fadeIn"
            >
              <div
                class="alert alert-success bg-success bg-opacity-10 border-0 mb-4 rounded-3"
                role="alert"
              >
                <div class="d-flex align-items-center">
                  <i class="bi bi-check-circle-fill fs-4 me-3 text-success"></i>
                  <div>
                    Mã khôi phục đã được gửi đến<br />
                    <strong>{{ email }}</strong>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Mã xác nhận (6 số)</label>
                <input
                  v-model="code"
                  type="text"
                  class="form-control form-control-lg bg-light text-center tracking-wider fs-3 fw-bold"
                  placeholder="------"
                  maxlength="6"
                  required
                />
              </div>

              <div class="mb-4">
                <label class="form-label fw-semibold">Mật khẩu mới</label>
                <div class="input-group input-group-lg">
                  <span class="input-group-text bg-light border-end-0">
                    <i class="bi bi-lock text-muted"></i>
                  </span>
                  <input
                    v-model="newPassword"
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control border-start-0 ps-0 bg-light"
                    placeholder="Nhập mật khẩu mới..."
                    minlength="6"
                    required
                  />
                  <button
                    class="btn btn-light border"
                    type="button"
                    @click="showPassword = !showPassword"
                  >
                    <i v-if="showPassword" class="bi bi-eye-slash"></i>
                    <i v-else class="bi bi-eye"></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-success w-100 btn-lg rounded-pill shadow-sm"
                :disabled="isResetting"
              >
                <span v-if="!isResetting"
                  ><i class="bi bi-check2-circle me-2"></i>Đổi mật khẩu</span
                >
                <span v-else
                  ><span class="spinner-border spinner-border-sm me-2"></span
                  >Đang xử lý...</span
                >
              </button>

              <div class="text-center mt-3">
                <a
                  href="#"
                  @click.prevent="step = 1"
                  class="text-decoration-none text-muted small"
                >
                  <i class="bi bi-arrow-left me-1"></i>Thử lại với email khác
                </a>
              </div>
            </form>

            <div class="text-center mt-4 pt-3 border-top">
              <router-link
                to="/login"
                class="text-decoration-none text-secondary fw-semibold"
              >
                <i class="bi bi-box-arrow-in-left me-1"></i>Quay lại trang Đăng
                nhập
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "../services/api";
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";

const email = ref("");
const code = ref("");
const newPassword = ref("");
const step = ref(1);
const isSending = ref(false);
const isResetting = ref(false);
const showPassword = ref(false);
const targetUser = ref(null);

const router = useRouter();
const route = useRoute();

onMounted(() => {
  if (route.query.email) {
    email.value = route.query.email;
  }
});

const sendResetCode = async () => {
  if (!email.value) return;
  isSending.value = true;

  try {
    const res = await api.get(`/users?email=${email.value}`);
    if (res.data.length > 0) {
      targetUser.value = res.data[0];
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Update DB
      await api.patch(`/users/${targetUser.value.id}`, { verifyCode });

      // Send email via EmailJS
      await emailjs.send(
        "service_zb3cegd",
        "template_up4reia",
        {
          name: targetUser.value.name,
          code: verifyCode,
          to_email: targetUser.value.email,
        },
        "yEmGfervhOcGe4T3H",
      );

      step.value = 2;
    } else {
      Swal.fire("Lỗi", "Email không tồn tại trong hệ thống!", "error");
    }
  } catch (err) {
    console.error("Email error:", err);
    Swal.fire("Lỗi", "Không gửi được email khôi phục!", "error");
  } finally {
    isSending.value = false;
  }
};

const resetPassword = async () => {
  if (!code.value || !newPassword.value) return;

  isResetting.value = true;
  try {
    // Fetch user again to verify code
    const res = await api.get(`/users/${targetUser.value.id}`);
    const user = res.data;

    if (user.verifyCode === code.value) {
      // Success, update password
      await api.patch(`/users/${user.id}`, {
        password: newPassword.value,
        verifyCode: null,
      });

      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Mật khẩu đã được khôi phục. Vui lòng đăng nhập lại!",
        timer: 2000,
        showConfirmButton: false,
      });

      router.push("/login");
    } else {
      Swal.fire("Lỗi", "Mã xác nhận không chính xác!", "error");
    }
  } catch (err) {
    console.error(err);
    Swal.fire("Lỗi", "Đã có lỗi xảy ra!", "error");
  } finally {
    isResetting.value = false;
  }
};
</script>

<style scoped>
.tracking-wider {
  letter-spacing: 0.25em;
}
.animate__animated {
  animation-duration: 0.4s;
}
</style>
