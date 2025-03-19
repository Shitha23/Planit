const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/:firebaseId", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseId: req.params.firebaseId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user details", error });
  }
});

router.get("/mongo-id/:firebaseId", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseId: req.params.firebaseId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ mongoId: user._id });
  } catch (error) {
    console.error("Error fetching MongoDB user ID:", error);
    res.status(500).json({ error: "Error fetching user ID" });
  }
});

router.put("/:firebaseId", async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findOneAndUpdate(
      { firebaseId: req.params.firebaseId },
      { name, phone, address },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating user details", error });
  }
});

module.exports = router;
