const express = require("express");
const Notification = require("../models/Notification");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userId = req.headers["user-id"];
    if (!userId)
      return res.status(400).json({ error: "User ID is required in headers" });

    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Error fetching notifications" });
  }
});

router.put("/mark-read", async (req, res) => {
  try {
    const userId = req.headers["user-id"];
    if (!userId)
      return res.status(400).json({ error: "User ID is required in headers" });

    await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Error updating notifications" });
  }
});

module.exports = router;
