const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/signup", async (req, res) => {
  try {
    const { firebaseId, name, phone, address, email } = req.body;

    let user = await User.findOne({ firebaseId });

    if (!user) {
      user = new User({
        firebaseId,
        name,
        phone,
        address,
        email,
        role: "customer",
      });
      await user.save();
    }

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Error registering user" });
  }
});

router.get("/user/:firebaseId", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseId: req.params.firebaseId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Fetch User Error:", error);
    res.status(500).json({ error: "Error fetching user details" });
  }
});

router.get("/user/role/:firebaseId", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseId: req.params.firebaseId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ role: user.role });
  } catch (error) {
    console.error("Fetch Role Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
