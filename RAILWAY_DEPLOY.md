# Hướng dẫn Deploy lên Railway với Docker

## 📋 Yêu cầu

- Node.js 18+
- Docker Desktop
- Tài khoản Railway (https://railway.app)
- Git

---

## 🐳 BƯỚC 1: Build và Test Docker Images Locally

### 1.1. Build từng Docker Image

```powershell
# Build Server (Backend)
cd server_app
docker build -t ktpm-server:latest .

# Build Client (Frontend)
cd ../client_app
docker build -t ktpm-client:latest .

# Build Admin (Admin Panel)
cd ../admin_app
docker build -t ktpm-admin:latest .

cd ..
```

### 1.2. Chạy thử từng container riêng lẻ

```powershell
# Chạy Server (Backend)
docker run -d -p 8000:8000 `
  -e PORT=8000 `
  -e MONGODB_URI="your_mongodb_connection_string" `
  -e CLOUDINARY_CLOUD_NAME="your_cloud_name" `
  -e CLOUDINARY_API_KEY="your_api_key" `
  -e CLOUDINARY_API_SECRET="your_api_secret" `
  -e PAYPAL_MODE="sandbox" `
  -e PAYPAL_CLIENT_ID="your_paypal_client_id" `
  -e PAYPAL_CLIENT_SECRET="your_paypal_secret" `
  --name ktpm-server ktpm-server:latest

# Chạy Client (Frontend) - Chờ Server chạy trước
docker run -d -p 3000:3000 `
  -e REACT_APP_API_URL="http://localhost:8000/api" `
  --name ktpm-client ktpm-client:latest

# Chạy Admin (Admin Panel)
docker run -d -p 3001:3001 `
  -e REACT_APP_API_URL="http://localhost:8000/api" `
  --name ktpm-admin ktpm-admin:latest
```

### 1.3. Kiểm tra containers

```powershell
# Xem danh sách containers đang chạy
docker ps

# Xem logs
docker logs ktpm-server -f
docker logs ktpm-client -f
docker logs ktpm-admin -f

# Dừng và xóa containers
docker stop ktpm-server ktpm-client ktpm-admin
docker rm ktpm-server ktpm-client ktpm-admin
```

### 1.4. Hoặc dùng Docker Compose (Khuyến nghị cho test local)

```powershell
# Build và chạy tất cả
docker compose up --build -d

# Xem logs
docker compose logs -f

# Dừng
docker compose down
```

---

## 🚂 BƯỚC 2: Deploy lên Railway

Railway hỗ trợ 2 cách deploy:

### **Cách A: Deploy từ GitHub (Khuyến nghị - Tự động CI/CD)**

#### 2A.1. Push code lên GitHub

```powershell
# Khởi tạo git (nếu chưa)
git init
git add .
git commit -m "Prepare for Railway deployment"

# Tạo repo trên GitHub và push
git remote add origin https://github.com/tienle-dev/ktpm-sgu-doan.git
git branch -M main
git push -u origin main
```

#### 2A.2. Tạo Project trên Railway Dashboard

1. Truy cập: https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Chọn repository `tienle-dev/ktpm-sgu-doan`
4. Railway sẽ tạo 1 project

#### 2A.3. Tạo Service cho Backend (server_app)

1. Trong project, click **"+ New"** → **"Service"** → **"GitHub Repo"**
2. Chọn repo `ktpm-sgu-doan`
3. Click **"Add variables"**:
   ```
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   PAYPAL_MODE=sandbox
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_secret
   ```

4. Click **"Settings"**:
   - **Root Directory**: `server_app`
   - **Build Command**: (để trống, Railway tự phát hiện Dockerfile)
   - **Start Command**: (để trống)

5. Deploy → Đợi build xong
6. Click **"Settings"** → **"Networking"** → **"Generate Domain"**
7. Copy domain (ví dụ: `https://ktpm-server.up.railway.app`)

#### 2A.4. Tạo Service cho Frontend (client_app)

1. Click **"+ New"** → **"Service"** → **"GitHub Repo"** (cùng repo)
2. Click **"Add variables"**:
   ```
   PORT=3000
   REACT_APP_API_URL=https://ktpm-server.up.railway.app/api
   ```
   ⚠️ Thay `ktpm-server.up.railway.app` bằng domain backend ở bước 2A.3

3. Click **"Settings"**:
   - **Root Directory**: `client_app`

4. Deploy → Đợi build xong
5. **"Generate Domain"** cho client

#### 2A.5. Tạo Service cho Admin (admin_app)

1. Click **"+ New"** → **"Service"** → **"GitHub Repo"** (cùng repo)
2. Click **"Add variables"**:
   ```
   PORT=3001
   REACT_APP_API_URL=https://ktpm-server.up.railway.app/api
   ```

3. Click **"Settings"**:
   - **Root Directory**: `admin_app`

4. Deploy → **"Generate Domain"** cho admin

---

### **Cách B: Deploy bằng Railway CLI (Thủ công)**

#### 2B.1. Cài Railway CLI

```powershell
npm install -g @railway/cli
```

#### 2B.2. Login Railway

```powershell
railway login
```
Trình duyệt sẽ mở, đăng nhập tài khoản Railway.

#### 2B.3. Tạo Project

```powershell
# Tại thư mục gốc repo
railway init
```
Chọn **"Create new project"** → Đặt tên (ví dụ: `ktpm-sgu-doan`)

#### 2B.4. Deploy Backend (server_app)

```powershell
cd server_app

# Set biến môi trường
railway variables set PORT=8000
railway variables set MONGODB_URI="your_mongodb_connection_string"
railway variables set CLOUDINARY_CLOUD_NAME="your_cloud_name"
railway variables set CLOUDINARY_API_KEY="your_api_key"
railway variables set CLOUDINARY_API_SECRET="your_api_secret"
railway variables set PAYPAL_MODE="sandbox"
railway variables set PAYPAL_CLIENT_ID="your_paypal_client_id"
railway variables set PAYPAL_CLIENT_SECRET="your_paypal_secret"

# Deploy
railway up

# Generate domain
railway domain
```

Copy domain backend (ví dụ: `https://ktpm-server.up.railway.app`)

#### 2B.5. Deploy Frontend (client_app)

```powershell
cd ../client_app

# Set biến môi trường
railway variables set PORT=3000
railway variables set REACT_APP_API_URL="https://ktpm-server.up.railway.app/api"

# Deploy
railway up

# Generate domain
railway domain
```

#### 2B.6. Deploy Admin (admin_app)

```powershell
cd ../admin_app

# Set biến môi trường
railway variables set PORT=3001
railway variables set REACT_APP_API_URL="https://ktpm-server.up.railway.app/api"

# Deploy
railway up

# Generate domain
railway domain
```

---

## 🔧 BƯỚC 3: Kiểm tra Deployment

### 3.1. Truy cập ứng dụng

- **Backend API**: `https://<backend-domain>.up.railway.app`
- **Client**: `https://<client-domain>.up.railway.app`
- **Admin**: `https://<admin-domain>.up.railway.app`

### 3.2. Xem logs trên Railway

```powershell
# Xem logs của từng service
railway logs
```

Hoặc xem trên Dashboard: Project → Service → **"Deployments"** → Click vào deployment → **"View Logs"**

### 3.3. Debug lỗi phổ biến

**Lỗi: Client không kết nối được Backend**
- Kiểm tra `REACT_APP_API_URL` đã đúng domain backend chưa
- Rebuild client sau khi update biến: Railway Dashboard → Service → **"Redeploy"**

**Lỗi: Backend crash**
- Kiểm tra `MONGODB_URI` và các biến môi trường
- Xem logs: `railway logs`

**Lỗi: Port conflict**
- Railway tự động assign port, nhưng đảm bảo app listen trên `process.env.PORT`

---

## 📝 Checklist Deploy

### Backend (server_app)
- [ ] Dockerfile tồn tại và build thành công
- [ ] `.dockerignore` loại trừ `node_modules`, `.env`
- [ ] `MONGODB_URI` kết nối thành công
- [ ] Cloudinary và PayPal credentials đúng
- [ ] Domain backend đã generate

### Frontend (client_app)
- [ ] Dockerfile tồn tại và build thành công
- [ ] `.dockerignore` loại trừ `node_modules`, `build`
- [ ] `REACT_APP_API_URL` trỏ đúng backend domain
- [ ] Domain client đã generate

### Admin (admin_app)
- [ ] Dockerfile tồn tại và build thành công
- [ ] `.dockerignore` loại trừ `node_modules`, `build`
- [ ] `REACT_APP_API_URL` trỏ đúng backend domain
- [ ] Domain admin đã generate

---

## 🔄 Update Ứng Dụng

### Với GitHub (Cách A)
```powershell
git add .
git commit -m "Update feature"
git push origin main
```
Railway tự động deploy khi detect push mới.

### Với CLI (Cách B)
```powershell
cd server_app  # hoặc client_app / admin_app
railway up
```

---

## 💡 Tips

1. **MongoDB**: Dùng MongoDB Atlas (free tier) cho production
2. **Environment Variables**: KHÔNG commit file `.env` lên Git
3. **Domain Custom**: Vào Railway Dashboard → Service → Settings → Domains để add domain riêng
4. **Logs**: Luôn check logs khi có lỗi: `railway logs` hoặc Dashboard
5. **Cost**: Railway free plan có giới hạn giờ sử dụng, nâng cấp nếu cần

---

## 📞 Support

- Railway Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

---

**Tóm tắt lệnh nhanh:**

```powershell
# Build local
docker compose up --build -d

# Deploy Railway (CLI)
cd server_app; railway up
cd ../client_app; railway up
cd ../admin_app; railway up

# Xem logs
railway logs
```
