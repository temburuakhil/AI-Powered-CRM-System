# Manager Login Credentials

## Admin Account
- **Username:** admin
- **Password:** Admin@123
- **Email:** admin@bput.com
- **Role:** Admin
- **Access:** Full system access including all features and manager creation

---

## Manager Accounts

### 1. Training Manager
- **Username:** manager_training
- **Password:** Training@123
- **Email:** training@bput.com
- **Full Name:** Training Manager
- **Department:** Training
- **Role:** Manager
- **Access:** 
  - Only Training page (`/training`)
  - Can view and manage training data
  - Can run email, call, WhatsApp, SMS campaigns
  - Can collect feedback from students
  - **CANNOT** access:
    - Admin Portal
    - E-Governance section
    - Other admin features
    - Sidebar navigation (managers don't see sidebar)

### 2. E-Governance Manager
- **Username:** manager_egovernance
- **Password:** EGov@123
- **Email:** egovernance@bput.com
- **Full Name:** E-Governance Manager
- **Department:** E-Governance
- **Role:** Manager
- **Access:** 
  - Only E-Governance page (`/e-governance`)
  - Can view Schemes and Scholarships
  - Can navigate to `/schemes` and `/scholarships`
  - **CANNOT** access:
    - Admin Portal
    - Training section
    - Other admin features
    - Sidebar navigation (managers don't see sidebar)

---

## Login Flow

1. Go to `http://localhost:8081/landing`
2. Select **Manager** tab
3. Enter credentials
4. After login:
   - **Training Manager** → Auto-redirected to `/training`
   - **E-Governance Manager** → Auto-redirected to `/e-governance`

---

## Security Features

✅ Passwords are hashed using bcryptjs (salt rounds: 10)
✅ Session-based authentication with MongoDB store
✅ Role-based access control (RBAC)
✅ Department-based content isolation
✅ Managers cannot access admin features
✅ Managers cannot see other departments' data
✅ Logout functionality on all manager pages

---

## Manager Restrictions

- **No Sidebar Access:** Managers don't see the admin sidebar navigation
- **Department Locked:** Each manager can only access their department
- **No Admin Features:** Cannot create/manage other users
- **Content Isolation:** Can only see their department's content
- **Auto Redirect:** Attempting to access other pages redirects to their department

---

## Testing Instructions

### Test Training Manager:
1. Login as `manager_training` / `Training@123`
2. Should redirect to Training page
3. Should NOT see sidebar
4. Should see logout button in header
5. Try accessing `/e-governance` → Should be blocked

### Test E-Governance Manager:
1. Login as `manager_egovernance` / `EGov@123`
2. Should redirect to E-Governance page
3. Should NOT see sidebar
4. Should see logout button in header
5. Try accessing `/training` → Should be blocked

### Test Admin:
1. Login as `admin` / `Admin@123`
2. Should redirect to Admin Portal
3. Should see full sidebar
4. Can access all pages
5. Can manage managers
