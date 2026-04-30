# BlogVue (Premium Dark Mode) - Mạng Xã Hội Mini với Vue 3 & JSON Server

**BlogVue** là một ứng dụng web mô phỏng mạng xã hội và blog cá nhân, được xây dựng bằng **Vue.js 3** (Composition API) kết hợp với **Vite** và backend giả lập **JSON Server**. Trải qua bản cập nhật lớn về UI/UX, dự án giờ đây sở hữu giao diện **Dark Minimalist (Giao diện tối)** cực kỳ chuyên nghiệp, mượt mà và sang trọng lấy cảm hứng từ ứng dụng **Threads**, hứa hẹn mang lại trải nghiệm thị giác "wow" cho người sử dụng.

## 🚀 Tính năng nổi bật

- **Giao diện Premium Dark Mode**:
  - Thiết kế tối giản, sang trọng với tông màu `#181818` chủ đạo.
  - Các hiệu ứng hover, transition mượt mà, thiết kế chuẩn Responsive cho mọi thiết bị.
  - Các nút bấm, thanh điều hướng và giao diện nhắn tin được trau chuốt tỉ mỉ.
- **Quản lý Bài viết & Tương tác**: 
  - Tạo, chỉnh sửa bài viết với bộ soạn thảo văn bản giàu tính năng (Quill Editor) kết hợp thêm Tags/Nhãn.
  - **Thích (Like)**, **Chia sẻ (Share)** và **Đăng lại (Repost)** bài viết hiển thị số lượt thao tác cực kỳ sinh động.
- **Khám phá & Tìm kiếm (Explore)**:
  - Công cụ tìm kiếm bài viết thời gian thực: lọc bài viết nhanh chóng theo tiêu đề, nội dung, tác giả hoặc hashtag (`#tags`).
- **Hệ thống Bạn bè (Chuẩn mạng xã hội)**:
  - Gửi, chấp nhận/từ chối lời mời kết bạn.
  - Đặc quyền: Chỉ những người đã kết bạn mới có thể nhắn tin và chia sẻ bài viết nội bộ cho nhau.
- **Hệ thống Nhắn tin (Messenger Style)**:
  - Nhắn tin 1-1 trực tiếp với giao diện bóng thoại hiện đại.
  - Chia sẻ bài viết dưới dạng thẻ preview ngay trong tin nhắn.
  - **Thu hồi tin nhắn**: Cho phép thu hồi tin nhắn đã gửi (hiển thị dưới dạng viền xám in nghiêng giống Messenger).
- **Trang Cá Nhân (Profile)**:
  - Quản lý thông tin cá nhân, tiểu sử, vị trí, ảnh đại diện.
  - Quản lý bài viết đã đăng và các bài viết đã **Đăng lại (Repost)**.

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
