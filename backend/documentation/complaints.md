Here’s the **Complaint Management API Documentation** with a structured table format, explanations, and Postman testing details. 🚀  

---

# **📜 Complaint Management API Documentation**

## **📌 Base URL:**  
```
http://localhost:3000/complaints
```

## **🔹 Endpoints Overview**  

| HTTP Method | Endpoint         | Description                                          | Authentication |
|------------|-----------------|------------------------------------------------------|---------------|
| `POST`     | `/`              | Submit a new complaint                              | ❌ No Auth    |
| `GET`      | `/`              | Fetch complaints (Admin panel)                      | ❌ No Auth    |
| `PUT`      | `/update`        | Update complaint status (Admin)                     | ❌ No Auth    |
| `POST`     | `/userdata/`     | Fetch complaint status for a user                   | ❌ No Auth    |
| `DELETE`   | `/delete/:id`    | Delete a complaint                                 | ❌ No Auth    |
| `GET`      | `/stats`         | Get complaint statistics                           | ❌ No Auth    |

---

## **🟢 Submit a Complaint**
**🔹 Endpoint:**  
```http
POST /complaints/
```

**🔹 Request Body (JSON)**
```json
{
  "fullName": "John Doe",
  "lastname": "Doe",
  "adhar": "123456789012",
  "voter": "ABC12345",
  "phno": "9876543210",
  "hno": "123",
  "city": "New York",
  "mandal": "Central",
  "district": "Manhattan",
  "state": "NY",
  "country": "USA",
  "pincode": "10001",
  "professionCategory": "Business",
  "mainProfession": "Retail",
  "subProfession": "Clothing",
  "organization": {
    "name": "XYZ Corp",
    "city": "New York",
    "phone": "1234567890",
    "pincode": "10001",
    "email": "xyz@example.com",
    "sourceType": "Private"
  },
  "problemCategories": ["Financial Issue"],
  "problemDescriptions": ["Need financial support for business"]
}
```

**🔹 Response (Success)**
```json
{
  "message": "Complaint submitted successfully",
  "id": 1
}
```

📌 **Testing in Postman:**  
- **Method:** `POST`  
- **URL:** `http://localhost:3000/complaints/`  
- **Body:** Select **raw JSON**, enter complaint details.  
- **Expected:** Complaint is successfully stored in the database.

---

## **🔵 Fetch Complaints (Admin Panel)**
**🔹 Endpoint:**  
```http
GET /complaints/
```

**🔹 Query Parameters (Optional)**
| Parameter         | Type   | Description                           |
|------------------|--------|--------------------------------------|
| `pincode`       | String | Filter by pincode                    |
| `mobile_no`     | String | Filter by phone number               |
| `professionCategory` | String | Filter by profession category |

**🔹 Response (Success)**
```json
{
  "job": [],
  "business": [
    {
      "id": 1,
      "fullName": "John Doe",
      "professionCategory": "Business",
      "problemCategories": ["Financial Issue"],
      "status": "Pending"
    }
  ],
  "farming": [],
  "student": []
}
```

📌 **Testing in Postman:**  
- **Method:** `GET`  
- **URL:** `http://localhost:3000/complaints/?pincode=10001`  
- **Expected:** Returns complaints grouped by profession category.

---

## **🟣 Update Complaint Status (Admin)**
**🔹 Endpoint:**  
```http
PUT /complaints/update
```

**🔹 Request Body (JSON)**
```json
{
  "complaint_id": 1,
  "status": "Resolved"
}
```

**🔹 Response (Success)**
```json
{
  "success": true,
  "message": "Complaint status updated successfully"
}
```

📌 **Testing in Postman:**  
- **Method:** `PUT`  
- **URL:** `http://localhost:3000/complaints/update`  
- **Body:** Select **raw JSON**, enter complaint ID and new status.  
- **Expected:** Status is updated in the database.

---

## **🟠 Get Complaint Status (User)**
**🔹 Endpoint:**  
```http
POST /complaints/userdata/
```

**🔹 Request Body (JSON)**
```json
{
  "id": 1
}
```

**🔹 Response (Success)**
```json
{
  "id": 1,
  "fullName": "John Doe",
  "status": "Pending"
}
```

📌 **Testing in Postman:**  
- **Method:** `POST`  
- **URL:** `http://localhost:3000/complaints/userdata/`  
- **Body:** Enter user ID.  
- **Expected:** Returns complaint details.

---

## **🔴 Delete a Complaint**
**🔹 Endpoint:**  
```http
DELETE /complaints/delete/:id
```

**🔹 Example URL:**  
```
http://localhost:3000/complaints/delete/1
```

**🔹 Response (Success)**
```json
{
  "success": true,
  "message": "Complaint deleted successfully"
}
```

📌 **Testing in Postman:**  
- **Method:** `DELETE`  
- **URL:** `http://localhost:3000/complaints/delete/1`  
- **Expected:** Complaint is deleted from the database.

---

## **📊 Get Complaint Statistics**
**🔹 Endpoint:**  
```http
GET /complaints/stats
```

**🔹 Response (Success)**
```json
{
  "total_complaints": 100,
  "pending_complaints": 40,
  "resolved_complaints": 50,
  "rejected_complaints": 10
}
```

📌 **Testing in Postman:**  
- **Method:** `GET`  
- **URL:** `http://localhost:3000/complaints/stats`  
- **Expected:** Returns total complaint count with status breakdown.

---

## **🛠️ Additional Improvements**
- ✅ **Use JWT tokens** for admin authentication.  
- ⏳ **Pagination & Sorting** for `GET /complaints` API.  
- 🔔 **Email Notifications** when complaint status changes.  

Let me know if you need any modifications! 😊