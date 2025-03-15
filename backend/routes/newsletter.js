const express = require("express");

const router = express.Router();
const Newsletter = require("../models/Newsletter");
const { sendSubscriptionEmail } = require("../config/emailConfig");

// Subscribe to Newsletter
router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res
        .status(400)
        .json({ error: "This email is already subscribed." });
    }

    const newSubscriber = new Newsletter({ email });
    await newSubscriber.save();

    await sendSubscriptionEmail(email);

    res
      .status(201)
      .json({ message: "Subscription successful. Check your email!" });
  } catch (error) {
    console.error("Subscription Error:", error);
    res.status(500).json({ error: "Server error. Try again later." });
  }
});

// Get All Subscribers (Admin only)
router.get("/subscribers", async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ subscribedAt: -1 });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subscribers." });
  }
});

module.exports = router;
