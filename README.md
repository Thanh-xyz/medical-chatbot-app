# 🏥 Bác Sĩ Ảo — Ứng dụng Tư vấn Y tế AI

Ứng dụng di động React Native (Expo) cho phép người dùng trò chuyện với bác sĩ ảo được hỗ trợ bởi AI, bao gồm cả giao diện quản trị dành cho admin.

---

## 📋 Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---|---|
| Node.js | 18.x trở lên |
| npm | 9.x trở lên (hoặc Yarn 1.22+) |
| Java JDK | 17 (khuyến nghị Temurin/Adoptium) |
| Android Studio | Hedgehog 2023.1.1 trở lên |
| Android SDK | API 34 (Android 14) |
| Expo CLI | Tự động qua `npx` |

---

## ⚙️ Phần 1 — Cài đặt Android Studio

### Bước 1: Tải Android Studio

Truy cập trang chính thức và tải về:
```
https://developer.android.com/studio
```

### Bước 2: Cài đặt Android Studio

```bash
# Giải nén file vừa tải về (thay tên file cho đúng)
tar -xzf android-studio-*.tar.gz -C /opt/

# Chạy script cài đặt
/opt/android-studio/bin/studio.sh
```


### Bước 3: Hoàn tất thiết lập trong Android Studio

Khi lần đầu mở Android Studio, nhấn **Next** qua các bước setup wizard:
1. Chọn **Standard** installation type
2. Chấp nhận tất cả license agreements
3. Nhấn **Finish** để tải Android SDK (~3-4 GB)

### Bước 4: Cài đặt SDK Components cần thiết

Vào **Android Studio → SDK Manager** (biểu tượng ⚙️ trên thanh công cụ):

**Tab "SDK Platforms"** — Bật ✅:
- Android 16.0 (API 36.1)

**Tab "SDK Tools"** — Bật ✅:
- Android SDK Build-Tools
- Android Emulator
- Android SDK Platform-Tools


Nhấn **Apply → OK** và chờ tải xong.

### Bước 5: Cấu hình biến môi trường

**Trên Linux/macOS** — Thêm vào cuối file `~/.bashrc` hoặc `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
```

Sau đó nạp lại:
```bash
source ~/.bashrc
```

### Bước 6: Tạo Android Virtual Device (AVD — Máy ảo)

1. Mở Android Studio → nhấn **Virtual Device Manager** (biểu tượng ba cham ở thanh bên phải)
2. Nhấn **Create Device**
3. Chọn thiết bị: **Medium phone**  → Next
4. Chọn system image: **API 37 ** → Next
5. Đặt tên AVD → **Finish**
6. Nhấn ▶️ để khởi động máy ảo

---

## 📦 Phần 2 — Cài đặt dự án


### Bước 1: Cài đặt các thư viện


```bash
yarn install
```

### Bước 2: Cài đặt Expo CLI (nếu chưa có)

```bash
npm install -g expo-cli
```

---

## 🚀 Phần 3 — Chạy ứng dụng

### Cách 1: Chạy trên máy ảo Android
### nen dung cach nay

```bash
cd MyApp
npx expo start
```

Khi Metro Bundler khởi động, nhấn phím **`a`** để mở ứng dụng trên Android Emulator.

### Cách 2: Chạy trên thiết bị thật

1. Kết nối điện thoại Android qua cáp USB
2. Bật **USB Debugging** trên điện thoại:
   - Vào **Cài đặt → Giới thiệu → Số phiên bản** (nhấn 7 lần để bật Developer Options)
   - Vào **Cài đặt → Tùy chọn nhà phát triển → USB Debugging** → Bật

3. Cài Expo Go từ CH Play:
   ```
   https://play.google.com/store/apps/details?id=host.exp.exponent
   ```

4. Chạy server:
   ```bash
   npx expo start
   ```

5. Quét QR code hiển thị trên terminal bằng app **Expo Go**.

> ⚠️ **Lưu ý kết nối API khi dùng thiết bị thật:**
> Mở file `src/utils/constants.js` và đổi `API_ROOT` từ `10.0.2.2` sang IP nội bộ của máy tính:
> ```js
> export const API_ROOT = 'http://192.168.x.x:8017'; // IP máy tính của bạn
> ```

### Cách 3: Build file APK (Android)

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleDebug
```

File APK sẽ nằm tại: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔑 Tài khoản demo (Chế độ Mock)

Ứng dụng mặc định chạy ở chế độ **mock** (không cần backend). Dùng các tài khoản sau để đăng nhập thử:

| Vai trò | Email | Mật khẩu |
|---|---|---|
| 👤 Người dùng | `user@medbot.com` | `user123` |
| 🔐 Admin | `admin@medbot.com` | `admin123` |

Để bật/tắt chế độ mock, mở file `src/utils/constants.js`:
```js
export const USE_MOCK = true;  // true = dùng dữ liệu giả, false = kết nối backend thật
```

---

## 🗂️ Cấu trúc thư mục

```
MyApp/
├── App.js                        # Điểm khởi đầu ứng dụng
├── src/
│   ├── components/
│   │   ├── Admin/                # Components dành cho admin (Sidebar, DataTable...)
│   │   └── Client/               # Components dành cho người dùng (Sidebar...)
│   ├── hooks/
│   │   ├── useAuth.js            # Hook xử lý đăng nhập/đăng xuất
│   │   └── useChat.js            # Hook truy cập ChatContext
│   ├── navigation/
│   │   ├── AppNavigator.js       # Navigator gốc (phân luồng Admin/Client)
│   │   ├── AuthNavigator.js      # Màn hình đăng nhập/đăng ký
│   │   ├── AdminNavigator.js     # Drawer navigator của Admin
│   │   └── ClientNavigator.js    # Drawer navigator của Client
│   ├── screens/
│   │   ├── Auth/                 # LoginScreen, RegisterScreen, AdminLoginScreen
│   │   ├── Client/               # ChatScreen, SettingScreen
│   │   └── Admin/                # Dashboard, Users, Conversations, Messages...
│   ├── services/
│   │   ├── apis/
│   │   │   ├── Admin/            # API calls phía admin
│   │   │   └── Client/           # API calls phía client
│   │   └── mock/
│   │       ├── mockData.js       # Dữ liệu giả (users, conversations, messages)
│   │       └── mockApi.js        # Triển khai API giả
│   ├── store/
│   │   ├── AuthContext.js        # Quản lý trạng thái xác thực toàn cục
│   │   └── ChatContext.js        # Quản lý trạng thái chat toàn cục
│   └── utils/
│       ├── constants.js          # API_ROOT, COLORS, USE_MOCK...
│       ├── authorizedAxiosAdmin.js
│       └── authorizedAxiosClient.js
└── assets/                       # Icon, splash screen
```



## 📱 Tính năng ứng dụng

### 👤 Phía người dùng (Client)
- Đăng nhập / Đăng ký tài khoản
- Trò chuyện với bác sĩ ảo AI (hỗ trợ Qwen, Gemini, Claude)
- Đính kèm hình ảnh trong chat (chụp ảnh / thư viện)
- Xem lịch sử các cuộc khám
- Tìm kiếm trong lịch sử khám
- Cài đặt tài khoản & đổi mật khẩu

### 🔐 Phía quản trị (Admin)
- Tổng quan hệ thống (Dashboard)
- Quản lý người dùng (xem, chỉnh sửa, vô hiệu hóa)
- Quản lý hội thoại
- Xem danh sách tin nhắn
- Cài đặt hệ thống

---
