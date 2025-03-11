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
