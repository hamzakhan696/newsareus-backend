# 🔐 Admin Authentication Setup

## Environment Variables Required

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_db_password
DB_DATABASE=newsareus

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-newsareus-admin-2025
JWT_EXPIRES_IN=24h

# Admin Credentials
ADMIN_EMAIL=admin@newsareus.com
ADMIN_PASSWORD=admin123

# Server Configuration
PORT=3000
NODE_ENV=development
```

## 🔑 Default Admin Credentials

- **Email**: `admin@newsareus.com`
- **Password**: `admin123`

**⚠️ Important**: Change these credentials in production!

## 🚀 API Endpoints

### **Admin Authentication**

#### **1. Admin Login**
```
POST /admin/auth/login
```

**Request Body:**
```json
{
  "email": "admin@newsareus.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "email": "admin@newsareus.com",
      "role": "admin"
    }
  }
}
```

#### **2. Get Admin Profile**
```
GET /admin/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Admin profile retrieved successfully",
  "data": {
    "email": "admin@newsareus.com",
    "role": "admin"
  }
}
```

#### **3. Admin Logout**
```
POST /admin/auth/logout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Admin logout successful"
}
```

### **Protected Admin Routes**

All admin routes now require authentication:

#### **Get Users**
```
GET /admin/users?page=1&search=john
Authorization: Bearer <token>
```

#### **Get Companies**
```
GET /admin/companies?page=1&search=media
Authorization: Bearer <token>
```

## 🔒 Security Features

1. **JWT Token Authentication** - Secure token-based auth
2. **Admin Role Validation** - Only admin role allowed
3. **Token Expiration** - 24-hour token expiry
4. **Protected Routes** - All admin endpoints require auth
5. **Environment-based Credentials** - Secure credential management

## 📱 Frontend Integration

### **Login Flow:**
1. User enters admin credentials
2. Frontend calls `POST /admin/auth/login`
3. Store JWT token in localStorage/sessionStorage
4. Include token in all admin API calls
5. Handle token expiration and refresh

### **API Call Example:**
```javascript
// Login
const loginResponse = await fetch('/admin/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@newsareus.com',
    password: 'admin123'
  })
});

const { data } = await loginResponse.json();
const token = data.token;

// Use token in subsequent calls
const usersResponse = await fetch('/admin/users', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 🛠️ Testing

### **Using Swagger UI:**
1. Start the server: `npm run start:dev`
2. Visit: `http://localhost:3000/api`
3. Look for "Admin Auth" section
4. Click "Authorize" and enter Bearer token
5. Test protected endpoints

### **Using cURL:**
```bash
# Login
curl -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@newsareus.com","password":"admin123"}'

# Get users (replace TOKEN with actual token)
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer TOKEN"
```

## ✅ Implementation Complete

- ✅ Admin authentication system
- ✅ JWT token generation and validation
- ✅ Protected admin routes
- ✅ Environment-based credentials
- ✅ Swagger documentation
- ✅ Easy integration with frontend

**Ready for frontend integration!** 🚀
