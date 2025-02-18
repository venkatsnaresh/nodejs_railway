# **Project Requirement Documentation**

## **Customers/Users:**
- Only registered (logged-in) customers can submit complaints to the database.
- Subscribed customers can view the status of their submitted complaints.
- If a customer is not subscribed, an alert will be displayed prompting them to subscribe.

## **Admins:**
- Admins can log in to a dedicated admin panel.
- They are responsible for updating the status of complaints, and accessing all complaint data.

## **Master Admins:**
- Master Admins have a separate login and possess full access across the system.
- They can manage users, admins, and all complaint data.

This structure ensures that customers only see and interact with the functionalities they are entitled to, while admins and master admins have increasing levels of control over the system.

## **Payment and Subscription API**

The payment system is integrated with Razorpay to handle user subscriptions. Users can initiate a payment request to subscribe to the service. Once the payment is completed, Razorpay sends a webhook event to update the subscription status in the system. This ensures a smooth payment process, allowing users to access premium features only after successful payment verification.






**  api end end points**



## **ADMINS (`"/admins"`)**     {{base_url}}/
| **Method**   | **Endpoint**                          | **Description**                                   | **Protected** |
|-------------|--------------------------------------|---------------------------------------------------|--------------|
| **POST**    | `"/admins/login"`                    | Admin login and token generation                 | ❌ No        |
| **POST**    | `"/admins/forgot-password"`          | Send password reset link to admin's email       | ❌ No        |
| **POST**    | `"/admins/reset-password"`           | Reset password using the reset token            | ❌ No        |
| **GET**     | `"/admins/complaint_stats"`          | Fetch total, pending, resolved & rejected complaints | ✅ Yes       |
| **PUT**     | `"/admins/update_complaint"`         | Update complaint status                         | ✅ Yes       |





## **USERS (`"/users"`)**    {{base_url}}/
| **Method**   | **Endpoint**                          | **Description**                                | **Protected** |
|-------------|--------------------------------------|------------------------------------------------|--------------|
| **POST**    | `"/users/signup"`                    | Register a new user                           | ❌ No        |
| **POST**    | `"/users/login"`                     | User login and token generation               | ❌ No        |
| **POST**    | `"/users/forgot-password"`           | Send password reset link                      | ❌ No        |
| **POST**    | `"/users/reset-password"`            | Reset password using token                    | ❌ No        |
| **POST**    | `"/users/complaint_status/"`         | Get complaint status based on user ID         | ✅ Yes       |





## **MASTER ADMINS (`"/masters"`)**  
**Base URL:** `{{base_url}}/`

| **Method**   | **Endpoint**                          | **Description**                                | **Protected** |
|-------------|--------------------------------------|------------------------------------------------|--------------|
| **POST**    | `"/masters/signup"`                 | Master Admin sign-up                          | ❌ No        |
| **POST**    | `"/masters/login"`                  | Master Admin login and token generation       | ❌ No        |

| **POST**    | `"/masters/admin_create"`           | Create a new admin                            | ✅ Yes       |
| **GET**     | `"/masters/admin_data"`             | Get all admins                                | ✅ Yes       |
| **GET**     | `"/masters/admin_data/:id"`         | Get a single admin by ID                      | ✅ Yes       |
| **PUT**     | `"/masters/admin_update/:id"`       | Update an admin                               | ✅ Yes       |
| **DELETE**  | `"/masters/admin_delete/:id"`       | Delete an admin                               | ✅ Yes       |

| **GET**     | `"/masters/complaints_stats"`       | Fetch complaints statistics                   | ✅ Yes       |
| **GET**     | `"/masters/complaints_data"`        | Fetch and filter complaints                   | ✅ Yes       |
| **PUT**     | `"/masters/update_complaint"`       | Update complaint status                       | ✅ Yes       |
| **DELETE**  | `"/masters/complaint_delete/:id"`   | Delete a complaint by ID                      | ✅ Yes       |

| **GET**     | `"/masters/users_data"`             | Get all users                                 | ✅ Yes       |
| **GET**     | `"/masters/users_data/:id"`         | Get a single user by ID                       | ✅ Yes       |





## **Payment and Subscription API**

| **Method**   | **Endpoint**               | **Description**                                      | **Protected** |
|--------------|----------------------------|------------------------------------------------------|---------------|
| **POST**     | `"/pay"`                   | Initiates Razorpay payment for subscription          | ❌ No         |
| **POST**     | `"/webhook"`               | Handles Razorpay webhook events for payment capture  | ✅ Yes        |










