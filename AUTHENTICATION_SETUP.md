# MongoDB Authentication Setup

## 🎉 Authentication System Implemented!

### ✅ What's Been Created:

1. **MongoDB Models**
   - User model with password hashing (bcryptjs)
   - Role-based system (admin/manager)

2. **Passport.js Authentication**
   - Local strategy with session management
   - Secure password comparison
   - Session storage in MongoDB

3. **API Endpoints** (`/api/auth/`)
   - `POST /login` - Login for admin/manager
   - `POST /logout` - Logout
   - `GET /me` - Get current user
   - `POST /create-manager` - Admin creates manager
   - `GET /managers` - List all managers
   - `PUT /manager/:id/toggle-status` - Activate/deactivate manager
   - `DELETE /manager/:id` - Delete manager

4. **Frontend Pages**
   - `/landing` - Login page with admin/manager tabs
   - `/manager-dashboard` - Manager portal
   - Updated App.tsx with new routes

---

## 📋 Setup Instructions:

### Step 1: Install MongoDB

**Option A: MongoDB Community Server (Recommended)**
1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run on `localhost:27017`

**Option B: MongoDB Atlas (Cloud)**
1. Create free account: https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `backend/.env`

**Option C: Using Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 2: Create Admin User

After MongoDB is running:
```bash
cd backend
node create-admin.js
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `Admin@123`
- Email: `admin@bput.com`

### Step 3: Start Backend Server
```bash
cd backend
node server.js
```

### Step 4: Start Frontend
```bash
npm run dev
```

### Step 5: Access the Application
1. Go to: `http://localhost:8081/landing`
2. Login as Admin with credentials above
3. Create managers from the admin panel

---

## 🔒 Security Features:

- ✅ Password hashing with bcryptjs (salt rounds: 10)
- ✅ Secure session management
- ✅ HTTP-only cookies
- ✅ CORS protection with credentials
- ✅ Role-based access control
- ✅ Protected API endpoints

---

## 👥 User Roles:

### Admin:
- Full system access
- Create/manage managers
- Access all features
- Dashboard, E-Governance, Training, Agent Dashboard

### Manager:
- Limited access
- View assigned projects
- Access Agent Dashboard
- Cannot create other users

---

## 🛠️ Package Dependencies Added:

```json
{
  "mongoose": "MongoDB ODM",
  "passport": "Authentication middleware",
  "passport-local": "Local strategy",
  "express-session": "Session management",
  "bcryptjs": "Password hashing",
  "connect-mongo": "MongoDB session store"
}
```

---

## 🔧 Configuration:

### Backend `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/bput-hackathon
SESSION_SECRET=bput-hackathon-secret-key-2025-secure-random-string
```

### Frontend API Calls:
- Base URL: `http://localhost:3001`
- Credentials: `include` (for cookies)

---

## 📝 Usage Flow:

1. **Admin Login** → `/landing`
2. **Create Manager** → Admin creates manager with credentials
3. **Manager Login** → `/landing` (using provided credentials)
4. **Access Features** → Based on role permissions

---

## 🚀 Next Steps:

1. Install and start MongoDB
2. Run `node create-admin.js`
3. Login at `/landing`
4. Start creating managers!

---

## 🐛 Troubleshooting:

**MongoDB Connection Error:**
- Ensure MongoDB is running: `mongod --version`
- Check port 27017 is free
- Verify `MONGODB_URI` in `.env`

**Cannot Login:**
- Check browser console for errors
- Verify backend is running on port 3001
- Clear browser cookies/session

**Session Not Persisting:**
- Ensure cookies are enabled
- Check CORS settings allow credentials
- Verify session secret in `.env`

