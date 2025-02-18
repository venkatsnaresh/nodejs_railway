const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../models/database");
const sendMail = require("../utils/sendMail");
const { generateAdminToken, verifyAdminToken } = require("../middleware/adminAuth");

const router = express.Router();


// **Admin Login**
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM admins WHERE email = ?", [email], async (err, user) => {
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateAdminToken(user.id); // Using adminAuth.js function
    res.json({ message: "Admin login successful", token });
  });
});


// **Admin Forgot Password**
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  db.get("SELECT * FROM admins WHERE email = ?", [email], (err, user) => {
    if (!user) return res.status(400).json({ message: "Admin not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiryTime = Date.now() + 30 * 60 * 1000;

    db.run(
      "UPDATE admins SET reset_token = ?, reset_expires = ? WHERE email = ?",
      [resetToken, expiryTime, email],
      async (err) => {
        if (err) return res.status(500).json({ message: "Database error" });

        try {
          await sendMail(
            email,
            "Admin Password Reset Request",
            `Use this token to reset your password: ${resetToken}`,
            `<p>Click <a href="http://localhost:3000/reset-password?token=${resetToken}">here</a> to reset your password.</p>`
          );
          res.json({ message: "Password reset link sent to email" });
        } catch (emailErr) {
          res.status(500).json({ message: "Error sending email", error: emailErr });
        }
      }
    );
  });
});




// **Admin Reset Password**
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  db.get("SELECT * FROM admins WHERE reset_token = ? AND reset_expires > ?", [token, Date.now()], async (err, user) => {
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.run(
      "UPDATE admins SET password = ?, reset_token = NULL, reset_expires = NULL WHERE email = ?",
      [hashedPassword, user.email],
      async (err) => {
        if (err) return res.status(500).json({ message: "Database error" });

        try {
          await sendMail(
            user.email,
            "Password Reset Successful",
            "Your password has been successfully reset.",
            "<p>Your password has been successfully reset.</p>"
          );
          res.json({ message: "Password reset successful" });
        } catch (emailErr) {
          res.status(500).json({ message: "Error sending confirmation email", error: emailErr });
        }
      }
    );
  });
});



router.get("/complaints_stats", (req, res) => {
  const query = `
    SELECT 
      professionCategory, 
      COUNT(*) AS total_complaints
    FROM complaints
    WHERE professionCategory IN ('job', 'business', 'farming', 'student')
    GROUP BY professionCategory
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error("Error fetching complaint counts:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Formatting the response to return total complaints per profession
    const formattedData = {
      job: 0,
      business: 0,
      farming: 0,
      student: 0
    };

    rows.forEach(row => {
      formattedData[row.professionCategory.toLowerCase()] = row.total_complaints;
    });

    res.json({ complaints_summary: formattedData });
  });
});















// /**Admin Dashboard - Fetch Complaints**

router.get("/complaints_data", (req, res) => {
  let query = "SELECT * FROM complaints";
  const params = [];
  let conditions = [];

  // Filtering based on query parameters
  if (req.query.pincode) {
    conditions.push("pincode LIKE ?");
    params.push(`%${req.query.pincode}%`); // Partial match
  }
  if (req.query.mobile_no) {
    conditions.push("phno = ?");
    params.push(req.query.mobile_no);
  }
  if (req.query.professionCategory) {
    conditions.push("LOWER(professionCategory) = ?");
    params.push(req.query.professionCategory.toLowerCase());
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  // Fetch complaints from the database
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Error fetching complaints:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Clustering complaints based on profession category
    const clusteredData = {
      job: [],
      business: [],
      farming: [],
      student: [],
    };

    rows.forEach((row) => {
      const category = row.professionCategory?.toLowerCase();
      if (category === "job") {
        clusteredData.job.push(row);
      } else if (category === "business") {
        clusteredData.business.push(row);
      } else if (category === "farming") {
        clusteredData.farming.push(row);
      } else if (category === "student") {
        clusteredData.student.push(row);
      }
    });

    res.json({ complaints: clusteredData });
  });
});







// **Update Complaint Status (Admins Only)**
router.put("/update_complaint", (req, res) => {
  const { complaint_id, status } = req.body;

  if (!complaint_id || !status) {
      return res.status(400).json({ error: "Complaint ID and status are required" });
  }

  const updateQuery = "UPDATE complaints SET status = ? WHERE id = ?";

  db.run(updateQuery, [status, complaint_id], function (err) {
      if (err) {
          console.error("Error updating status:", err);
          return res.status(500).json({ error: "Database update failed" });
      }

      if (this.changes === 0) {
          return res.status(404).json({ error: "Complaint not found" });
      }

      res.json({ success: true, message: "Complaint status updated successfully" });
  });
});








// **Delete Complaint (Admins Only)**

router.delete("/complaint_delete/:id", verifyAdminToken, (req, res) => {
  const complaint_id = req.params.id;

  if (!complaint_id) {
      return res.status(400).json({ error: "Complaint ID is required" });
  }

  db.run("DELETE FROM complaints WHERE id = ?", [complaint_id], function (err) {
      if (err) {
          console.error("Error deleting complaint:", err);
          return res.status(500).json({ error: "Database delete failed" });
      }

      if (this.changes === 0) {
          return res.status(404).json({ error: "Complaint not found" });
      }

      res.json({ success: true, message: "Complaint deleted successfully" });
  });
});




module.exports = router;
