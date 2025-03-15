const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

router.post("/", async (req, res) => {
  try {
    const { name, rating, review } = req.body;
    if (!name || !rating || !review) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newReview = new Review({ name, rating, review });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ error: "Server error." });
  }
});

router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(5);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
