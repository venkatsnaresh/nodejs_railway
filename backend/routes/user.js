const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../models/database");

const router = express.Router();

const svgCaptcha = require("svg-captcha");


const sendMail = require("../utils/sendMail"); 


const { generateToken, authenticateToken } = require("../middleware/authenticate"); // token verification


// **Sign Up**
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword],
      function (err) {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "User registered successfully", id: this.lastID });
      }
    );
  });
});



// **Login Route**
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
      if (err) return res.status(500).json({ message: "Database error", error: err });
      if (!user) return res.status(400).json({ message: "Invalid email or password" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

      const token = generateToken(user); // Generate JWT token
      console.log(token);

      res.json({
          message: "Login successful",
          token,
          user: { id: user.id, email }
      });
  });
});





router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  // Debugging: Check if email is received in request body
  console.log("📩 Forgot Password Request for Email:", email);

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      console.error("❌ Database Error:", err);
      return res.status(500).json({ message: "Internal Server Error", error: err });
    }

    if (!user) {
      console.warn("⚠️ User Not Found:", email);
      return res.status(400).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 3600000; // 1 hour expiry

    db.run(
      "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
      [resetToken, expiresAt, email],
      async (updateErr) => {
        if (updateErr) {
          console.error("❌ Error Updating Database:", updateErr);
          return res.status(500).json({ message: "Database error", error: updateErr });
        }

        try {
          // Debugging: Check if email is sent
          console.log("✉️ Sending Reset Email to:", email);

          await sendMail(
            email,
            "Password Reset Request",
            `Use this token to reset your password: ${resetToken}`,
            `<p>Click <a href="http://localhost:5173/Kpmpp.com/#/resetpass?token=${resetToken}">here</a> to reset your password.</p>`
          );

          console.log("✅ Reset Email Sent Successfully");
          res.json({ message: "Reset email sent successfully" });
        } catch (emailErr) {
          console.error("❌ Error Sending Email:", emailErr);
          res.status(500).json({ message: "Error sending email", error: emailErr });
        }
      }
    );
  });
});






// **Reset Password**
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  db.get("SELECT * FROM users WHERE reset_token = ?", [token], async (err, user) => {
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    if (user.reset_token_expiry < Date.now()) {
      return res.status(400).json({ message: "Token expired, request a new one" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.run(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
      [hashedPassword, user.id],
      async (err) => {
        if (err) return res.status(500).json({ message: "Database error" });

        try {
          // Send confirmation email after password reset
          await sendMail(
            user.email,
            "Password Reset Successful",
            "Your password has been successfully reset.",
            "<p>Your password has been successfully reset.</p>"
          );

          res.json({ message: "Password reset successfully" });
        } catch (error) {
          res.status(500).json({ message: "Error sending confirmation email", error });
        }
      }
    );
  });
});






// get the status of the compiant based on the user id fro the subscribed customers to represent the complaint status 

router.post("/complaint_status/", authenticateToken, (req, res) => {
  const { id } = req.body;

  // Query the database for the complaint with the given ID
  db.get("SELECT * FROM complaints WHERE id = ?", [id], (err, complaint) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    // Check if the complaint exists
    if (!complaint) {
      return res.status(400).json({ message: "Complaint not found" });
    }

    // Send the entire complaint row as the response
    res.json({ message: "Complaint details retrieved successfully", complaint });
  });
});





// inserting  Complaints**
router.post("/submit_complaint", (req, res) => {
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





module.exports = router;
