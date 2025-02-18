const express = require("express");
const db = require("../models/database");

const router = express.Router();


// inserting  Complaints**
router.post("/", (req, res) => {
    const data = req.body;
  
    const query = `
      INSERT INTO complaints (
        fullName, lastname, adhar, voter, phno, hno, city, mandal, district, state, country, pincode,
        professionCategory, mainProfession, subProfession,
        organization_name, organization_city, organization_phone, organization_pincode, organization_email, organization_sourceType,
        business_name, business_city, business_phone, business_pincode, business_email,
        farming_land, farming_buffalo, farming_ox, farming_cows,
        student_category, student_institution_name, student_institution_city, student_institution_phone, student_institution_pincode,
        problemCategories, problemDescriptions,status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;
  
    const values = [
      data.fullName, data.lastname, data.adhar, data.voter, data.phno, data.hno, data.city, data.mandal, data.district, data.state, data.country, data.pincode,
      data.professionCategory, data.mainProfession, data.subProfession,
      data.organization?.name, data.organization?.city, data.organization?.phone, data.organization?.pincode, data.organization?.email, data.organization?.sourceType,
      data.business?.name, data.business?.city, data.business?.phone, data.business?.pincode, data.business?.email,
      data.farming?.land, data.farming?.buffalo, data.farming?.ox, data.farming?.cows,
      data.student?.category, data.student?.institution?.name, data.student?.institution?.city, data.student?.institution?.phone, data.student?.institution?.pincode,
      JSON.stringify(data.problemCategories), JSON.stringify(data.problemDescriptions),"Pending"
    ];
  
    db.run(query, values, function (err) {
      if (err) {
        console.error("Error inserting complaint:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ message: "Complaint submitted successfully", id: this.lastID });
    });
  });
  
  
  











  




// get the complaints for the admin panel 

  router.get("/", (req, res) => {
    let query = "SELECT * FROM complaints";
    const params = [];
    let conditions = [];
  
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
  
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error("Error fetching complaints:", err);
        return res.status(500).json({ error: "Database error" });
      }
  
      // Clustering data based on profession category
      const clusteredData = {
        job: [],
        business: [],
        farming: [],
        student: [],
      };
  
      rows.forEach((row) => {
        const category = row.professionCategory?.toLowerCase(); // Ensure case insensitivity
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
  
      res.json(clusteredData);
    });
  });
  
  
  
  
  
  
  
  
  
  // complaint update form the admin panel 
  router.put("/update", (req, res) => {
    const { complaint_id, status } = req.body;
    console.log(complaint_id,status);
  
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
  



// get the status of the compiant based on the user id fro the subscribed customers to represent the complaint status 

router.post("/userdata/", (req, res) => {
    const { id } = req.body;
  
    db.get("SELECT * FROM complaints  WHERE id = ?", [id], (err, user) => {
      if (!user || user.password !== password) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
  
      res.json({ message: "Master Admin login successful", id: user.id });
    });
  });
  
  


// **Delete Complaint**   admins only 
router.delete("/delete/:id", (req, res) => {
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





// **Complaint Stats Route**   for the addmins 
router.get("/stats", (req, res) => {
    const query = `
      SELECT 
        COUNT(*) AS total_complaints,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_complaints,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved_complaints,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected_complaints
      FROM complaints;
    `;
  
    db.get(query, (err, stats) => {
      if (err) {
        console.error("Error fetching stats:", err);
        return res.status(500).json({ error: "Database error" });
      }
  
      res.json(stats);
    });



});







module.exports = router;
