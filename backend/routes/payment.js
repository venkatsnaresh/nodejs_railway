const express = require('express');
const crypto = require('crypto');
const db = require("../models/database");

const sendMail = require("../utils/sendMail");

const router = express.Router();



const razorpay = require("../config/razorpay");




// **Subscribe & Payment**
router.post("/pay", async (req, res) => {
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
    const category = notes.category || 'unknown';  // Determine if donation or subscription based on category
    const amount = Number(notes.amount) || 0;     // For donations, amount comes from notes
    const email = notes.email; // Extract email for donation thank you email

    if (category === 'subscription') {
      // Handle Subscription Logic
      const plan = Number(notes.plan) || 0; // Extract subscription plan
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
          res.json({
            message: "Subscription activated",
            user_id: userId,
            plan,
            created_on: createdAt,
            expiring_on: expiringOn,
          });
        }
      );
    } else if (category === 'donation') {
      // Handle Donation Logic
      const orderId = payment.order_id; // Get Razorpay order ID for donation

      // Insert the donation details into the database after payment capture
      db.run(
        "INSERT INTO donations (user_id, donated_amount, donated_date) VALUES (?, ?, ?)",
        [userId, amount, createdAt],
        function (err) {
          if (err) {
            console.error("[DONATION ERROR] Inserting donation:", err);
            return res.status(500).json({ message: "Failed to record donation", error: err });
          }

          // Send Thank You email for donation
          sendMail(
            email,
            "Thank You for Your Generous Donation!", 
            "Thank you for your generous support of KPMPP.", 
            thankYouEmailContent(email, amount)  // Use the function here
          );

          // Return success message after successful insertion into the database
          res.json({
            message: "Donation recorded successfully",
            user_id: userId,
            amount,
            razorpay_order_id: orderId,
          });
        }
      );
    } else {
      res.json({ message: "Event received but category is not recognized" });
    }
  } else {
    res.json({ message: "Event received but not processed" });
  }
});

const thankYouEmailContent = (email, amount) => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f7f7f7; color: #333;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
          <h2 style="text-align: center; color: #4CAF50;">Thank You for Your Donation!</h2>
          <p style="font-size: 16px; text-align: center;">
            <span style="color: #ff6347; font-size: 24px;">❤️</span> <strong>You're making a difference!</strong> <span style="color: #ff6347; font-size: 24px;">❤️</span>
          </p>
          <p style="font-size: 16px; text-align: center; margin-top: 20px;">
            Dear <strong>${email}</strong>,
          </p>
          <p style="font-size: 16px; text-align: center;">
            We are deeply grateful for your donation of <strong>₹${amount}</strong> to KPMPP! Your generous support is invaluable in helping us make a positive impact in the community.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <img src="https://img.icons8.com/ios/50/000000/donate-heart.png" alt="Donation Icon" />
          </div>
          <p style="font-size: 16px; text-align: center; margin-top: 20px;">
            Your contribution will help us <strong>expand our mission</strong> and bring about real change in the lives of those who need it most.
          </p>
          <p style="font-size: 16px; text-align: center; margin-top: 20px;">
            Thank you once again for your kindness and commitment to making the world a better place. Your support truly means the world to us!
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <span style="font-size: 14px; color: #999;">With heartfelt gratitude,</span><br />
            <span style="font-size: 16px; color: #4CAF50;">The KPMPP Team</span>
          </div>
        </div>
      </body>
    </html>
  `;
};

module.exports = router;
