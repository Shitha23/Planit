const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Event = require("../models/Event");

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "email role");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

router.put("/update-role", async (req, res) => {
  const { email, newRole } = req.body;

  if (!["customer", "organizer", "admin"].includes(newRole)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "organizer" && newRole !== "organizer") {
      const hostedEvents = await Event.findOne({
        organizerId: user.firebaseId,
      });

      if (hostedEvents) {
        return res.status(403).json({
          message: "Organizer with hosted events cannot change role.",
        });
      }
    }

    if (newRole === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });

      if (adminCount >= 2) {
        return res.status(403).json({ message: "Only 2 admins are allowed." });
      }
    }

    user.role = newRole;
    await user.save();

    res.json({ message: "Role updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
