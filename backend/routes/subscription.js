const express = require("express");
const db = require("../models/database");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

const router = express.Router();


const sendMail = require("../utils/sendMail");



// **Check Subscription**
router.get("/checksubscribe", (req, res) => {
  const { user_id } = req.query;

  console.log("Calling the check subscription");

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  db.get("SELECT * FROM subscriptions WHERE user_id = ?", [user_id], (err, subscription) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (!subscription) {
      return res.json({ status: "inactive" }); // No subscription found
    }

    const currentDate = new Date().toISOString();
    if ( subscription.expiring_on < currentDate) {
      return res.json({ status: "inactive" }); // Subscription expired or inactive
    }

    res.json({ status: "active", ...subscription }); // Return valid subscription details
  });
});






// **Subscribe & Payment**
router.post("/subscribe", async (req, res) => {
  const { amount } = req.body;
  console.log("[SUBSCRIBE] Initiating payment for amount:", amount);

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      payment_capture: 1,
    });
    res.json(order);
  } catch (error) {
    console.error("[SUBSCRIBE ERROR]", error);
    res.status(500).json({ message: "Payment failed", error });
  }
});



// **Razorpay Webhook - Handle Payment Updates**

// **Razorpay Webhook - Handle Payment Updates**
router.post("/webhook", express.json({ type: "application/json" }), (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  console.log("Webhook Payload:", body);

  // Validate Razorpay webhook signature
  const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  const event = req.body.event;
  const payment = req.body.payload.payment.entity;

  if (event === "payment.captured") {
    const createdAt = new Date(payment.created_at * 1000).toISOString();
    const notes = payment.notes || {}; // Extract notes from payload
    const userId = Number(notes.user_id) || 0;  // Convert userId to a number, default to 0 if invalid 
    const plan = Number(notes.plan) || 0;      // Convert plan to a number, default to 0 if invalid
    
    // Calculate expiry date based on 'plan' years
    const expiringOn = new Date(payment.created_at * 1000 + plan * 365 * 24 * 60 * 60 * 1000).toISOString();
    

    // Insert subscription details into database
    db.run(
      "INSERT INTO subscriptions (user_id, plan, created_on, expiring_on, status) VALUES (?, ?, ?, ?, ?) ",
      [userId, plan, createdAt, expiringOn, "active"],
      (err) => {
        if (err) {
          console.error("Database insert error:", err);
          return res.status(500).json({ message: "Database error" });
        }
        res.json({ message: "Subscription activated", user_id: userId, plan, created_on: createdAt, expiring_on: expiringOn });
      }
    );
  } else {
    res.json({ message: "Event received but not processed" });
  }
});


module.exports = router;
