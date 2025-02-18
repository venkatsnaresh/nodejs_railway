const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../models/database");
const { generateMasterAdminToken, verifyMasterAdminToken } = require("../middleware/masterAdminAuth");

const router = express.Router();





// **Master Admin Sign-Up**
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  console.log("master admin sign up calling");

  // Check if the email already exists
  db.get("SELECT * FROM master_admins WHERE email = ?", [email], async (err, existingAdmin) => {
      if (existingAdmin) {
          return res.status(400).json({ message: "Email already exists" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new admin into the database
      db.run("INSERT INTO master_admins (username, email, password) VALUES (?, ?, ?)", 
          [username, email, hashedPassword], 
          function (err) {
              if (err) {
                  return res.status(500).json({ message: "Error creating admin" });
              }

              res.json({ message: "Master Admin registered successfully" });
          }
      );
  });
});





// **Master Admin Login**
router.post("/login", (req, res) => {
    const { email, password } = req.body;
    console.log("master admin login  up calling");


    db.get("SELECT * FROM master_admins WHERE email = ?", [email], async (err, masterAdmin) => {
        if (!masterAdmin || !(await bcrypt.compare(password, masterAdmin.password))) {
          console.log("not valid email/passwords");
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = generateMasterAdminToken(masterAdmin.id); // Generate secure token
        res.json({ message: "Master Admin login successful", token });
    });
});







// **Create a New Admin (Only Master Admins)**
router.post("/admin_create", verifyMasterAdminToken, async (req, res) => {
  const { username, email, password } = req.body;

  db.get("SELECT * FROM admins WHERE email = ?", [email], async (err, existingUser) => {
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO admins (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword],
      function (err) {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Admin created successfully", id: this.lastID });
      }
    );
  });
});





// **Get All Admins (Only Master Admins)**
router.get("/admin_data", verifyMasterAdminToken, (req, res) => {
  db.all("SELECT id, username, email FROM admins", (err, admins) => {
    if (err) {
      console.error("Error fetching admins:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(admins);
  });
});




// **Get a Single Admin by ID (Only Master Admins)**
router.get("/admin_data/:id", verifyMasterAdminToken, (req, res) => {
  const adminId = req.params.id;

  db.get("SELECT id, username, email  FROM admins WHERE id = ?", [adminId], (err, admin) => {
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  });
});





// **Update an Admin (Only Master Admins)**
router.put("/admin_upadte/:id", verifyMasterAdminToken, async (req, res) => {
  const adminId = req.params.id;
  const { username, email, password } = req.body;

  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  db.run(
    "UPDATE admins SET username = ?, email = ?, password = COALESCE(?, password) WHERE id = ?",
    [username, email, hashedPassword, adminId],
    (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Admin updated successfully" });
    }
  );
});




// **Delete an Admin (Only Master Admins)**
router.delete("/admin_delete/:id", verifyMasterAdminToken, (req, res) => {
  const adminId = req.params.id;

  db.run("DELETE FROM admins WHERE id = ?", [adminId], function (err) {
    if (err) return res.status(500).json({ message: "Database error" });
    if (this.changes === 0) return res.status(404).json({ message: "Admin not found" });

    res.json({ message: "Admin deleted successfully" });
  });
});








router.get("/complaints_stats",verifyMasterAdminToken,  (req, res) => {
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

router.get("/complaints_data",verifyMasterAdminToken,  (req, res) => {
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
router.put("/update_complaint",verifyMasterAdminToken,  (req, res) => {
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

router.delete("/complaint_delete/:id",verifyMasterAdminToken,  (req, res) => {
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



// **Get All users (Only Master Admins)**
router.get("/users_data", verifyMasterAdminToken, (req, res) => {
  db.all("SELECT id, username, email FROM admins", (err, admins) => {
    if (err) {
      console.error("Error fetching admins:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(admins);
  });
});



// **Get a Single user by ID (Only Master Admins)**
router.get("/users_data/:id", verifyMasterAdminToken, (req, res) => {
  const user_id = req.params.id;

  db.get("SELECT id, username, email  FROM users WHERE id = ?", [user_id], (err, admin) => {
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  });
});



module.exports = router;
