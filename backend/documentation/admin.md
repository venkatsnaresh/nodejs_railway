Here’s the **Admin Authentication API Documentation** with detailed explanations, symbols, and Postman testing details. 🚀  

---

# **📜 Admin Authentication API Documentation**

## **📌 Base URL:**  
```
http://localhost:3000/admin
```

## **🔹 Endpoints Overview**  

| HTTP Method | Endpoint          | Description                         | Authentication |
|------------|------------------|-------------------------------------|---------------|
| `POST`     | `/login`          | Admin login                        | ❌ No Auth    |
| `POST`     | `/forgot-password` | Generate reset token & send email  | ❌ No Auth    |
| `POST`     | `/reset-password`  | Reset password using token         | ❌ No Auth    |

---

## **🟢 Admin Login**
**🔹 Endpoint:**  
```http
POST /admin/login
```

**🔹 Request Body (JSON)**
```json
{
  "email": "admin@example.com",
  "password": "admin@123"
}
```

**🔹 Response (Success)**
```json
{
  "message": "Admin login successful",
  "id": 1
}
```

**🔹 Response (Failure - Invalid Credentials)**
```json
{
  "message": "Invalid email or password"
}
```

📌 **📌 Testing in Postman:**  
- **Method:** `POST`  
- **URL:** `http://localhost:3000/admin/login`  
- **Body:** Select **raw JSON**, enter email & password.  
- **Expected:** Returns success message if credentials are valid.

---

## **🔵 Forgot Password - Generate Token**
**🔹 Endpoint:**  
```http
POST /admin/forgot-password
```

**🔹 Request Body (JSON)**
```json
{
  "email": "admin@example.com"
}
```

**🔹 Response (Success)**
```json
{
  "message": "Password reset link sent to email"
}
```

**🔹 Response (Failure - Admin Not Found)**
```json
{
  "message": "Admin not found"
}
```

📌 **📌 Testing in Postman:**  
- **Method:** `POST`  
- **URL:** `http://localhost:3000/admin/forgot-password`  
- **Body:** Enter valid email.  
- **Expected:** If the admin exists, generates a reset token & sends an email.

---

## **🟣 Reset Password**
**🔹 Endpoint:**  
```http
POST /admin/reset-password
```

**🔹 Request Body (JSON)**
```json
{
  "token": "random-generated-token",
  "newPassword": "newSecurePassword@123"
}
```

**🔹 Response (Success)**
```json
{
  "message": "Password reset successful"
}
```

**🔹 Response (Failure - Invalid/Expired Token)**
```json
{
  "message": "Invalid or expired token"
}
```

📌 **📌 Testing in Postman:**  
- **Method:** `POST`  
- **URL:** `http://localhost:3000/admin/reset-password`  
- **Body:** Enter reset token & new password.  
- **Expected:** Password resets successfully if token is valid.

---

## **✉️ Sending Password Reset Email**
- **Uses**: `nodemailer`  
- **Email Service**: Gmail  
- **Config Needed**:  
  - Set up SMTP credentials in `.env`  
  - Replace `"--email@gmail.com"` with your actual email  

---

## **🛠️ Additional Improvements**
- 🔒 **Use JWT tokens** for authentication after login.  
- ⏳ **Token Expiry Handling** to improve security.  
- ✅ **Validation**: Use middleware for input sanitizatio