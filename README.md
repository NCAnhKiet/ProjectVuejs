# BlogVue - Mạng Xã Hội Mini với Vue 3 & JSON Server

**BlogVue** là một ứng dụng web mô phỏng mạng xã hội và blog cá nhân, được xây dựng bằng **Vue.js 3** (Composition API) kết hợp với **Vite** và backend giả lập **JSON Server**. Dự án này cung cấp các tính năng cốt lõi của một mạng xã hội thực thụ như quản lý bài viết, kết bạn, nhắn tin thời gian thực và nhiều tương tác thú vị khác.

## 🚀 Tính năng nổi bật

- **Quản lý Tài khoản**: Đăng ký, đăng nhập và bảo mật thông tin người dùng với Pinia store.
- **Quản lý Bài viết**: 
  - Tạo, chỉnh sửa, xóa bài viết kèm theo hình ảnh (Base64/URL).
  - Thích (Like) và Bình luận (Comment) trên bài viết của người khác.
- **Hệ thống Bạn bè (Chuẩn Facebook)**:
  - Gửi lời mời kết bạn, chấp nhận/từ chối lời mời.
  - Trang quản lý bạn bè chuyên dụng: Xem danh sách bạn bè, hủy kết bạn, tìm kiếm người dùng mới.
  - **Đặc quyền**: Chỉ những người đã kết bạn mới có thể chia sẻ bài viết cho nhau.
- **Hệ thống Nhắn tin (Messenger Style)**:
  - Nhắn tin 1-1 trực tiếp.
  - Chia sẻ bài viết dưới dạng tin nhắn.
  - **Thu hồi tin nhắn**: Cho phép thu hồi tin nhắn đã gửi. Tin nhắn thu hồi sẽ hiển thị dưới dạng viền xám in nghiêng ("Bạn đã thu hồi một tin nhắn") giống hệt Messenger.
- **Trang Cá Nhân (Profile)**:
  - Theo dõi (Follow) người dùng khác.
  - Thống kê lượng người theo dõi, bạn bè, tổng bài viết.
  - Quản lý thông tin cá nhân và thay đổi mật khẩu.

## 🛠 Công nghệ sử dụng

- **Frontend**: 
  - Vue.js 3 (Composition API, `<script setup>`)
  - Vite (Build tool siêu tốc)
  - Vue Router (Quản lý đa trang)
  - Pinia (Quản lý State / Auth)
  - Axios (Gọi API)
  - Bootstrap 5 & Bootstrap Icons (Giao diện UI/UX)
  - SweetAlert2 (Thông báo popup đẹp mắt)
- **Backend / Database**:
  - `json-server` (Tạo RESTful API nhanh chóng)
  - Cơ sở dữ liệu: `db.json`

## 📂 Cấu trúc thư mục dự án

```text
ProjectVuejs/
├── Data/
│   └── db.json                 # Nơi lưu trữ toàn bộ dữ liệu (users, posts, messages, comments, friendRequests)
└── vue-jsonserver-app/         # Source code ứng dụng Vue
    ├── src/
    │   ├── components/         # Các component dùng chung (Navbar, ShareModal,...)
    │   ├── services/           # Chứa các file giao tiếp API (api.js, messageService.js, friendService.js)
    │   ├── stores/             # Quản lý state toàn cục với Pinia (auth.js)
    │   ├── views/              # Các trang chính (Home, Profile, Messages, Friends, PostDetail...)
    │   ├── App.vue             # Component gốc
    │   ├── main.js             # File khởi chạy Vue app
    │   └── router/             # Cấu hình Vue Router
    ├── package.json
    └── vite.config.js
```

## ⚙️ Hướng dẫn cài đặt và chạy dự án

### 1. Yêu cầu hệ thống
- Đảm bảo bạn đã cài đặt **Node.js** (Phiên bản >= 16.x).

### 2. Khởi chạy Backend (JSON Server)
Mở terminal tại thư mục `ProjectVuejs` và chạy các lệnh sau:
```bash
# Di chuyển vào thư mục chứa Data
cd Data

# Cài đặt json-server (nếu chưa có)
npm install -g json-server

# Khởi chạy server ở cổng 3000
json-server --watch db.json --port 3000
```
*(Lưu ý: API sẽ chạy tại địa chỉ `http://localhost:3000`)*

### 3. Khởi chạy Frontend (Vue App)
Mở một terminal **mới** tại thư mục `ProjectVuejs/vue-jsonserver-app` và chạy:
```bash
# Cài đặt các thư viện cần thiết
npm install

# Khởi chạy ứng dụng với Vite
npm run dev
```
*(Lưu ý: Ứng dụng Frontend thường chạy tại `http://localhost:5173`)*

## 💡 Ghi chú dành cho nhà phát triển
- Các API Requests được cấu hình với Axios tại `src/services/api.js`. Nếu bạn đổi cổng của json-server, hãy đảm bảo cập nhật lại `baseURL` tại file này.
- Database (`db.json`) được mô phỏng với đầy đủ các object quan hệ (User -> Posts -> Comments -> Messages), vì vậy không được sửa đổi cấu trúc key gốc của file để tránh lỗi truy xuất.

---
**Chúc bạn có những trải nghiệm tuyệt vời và học hỏi được nhiều kiến thức với dự án BlogVue!** 🚀
