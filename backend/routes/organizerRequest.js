const express = require("express");
const router = express.Router();
const OrganizerRequest = require("../models/OrganizerRequest");
const User = require("../models/User");

// Submit an organizer request (Limit: 1 per week)
router.post("/", async (req, res) => {
  try {
    const { userId, name, email, phone, reason } = req.body;

    if (!userId || !name || !email || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if the user has a pending request
    const existingPendingRequest = await OrganizerRequest.findOne({
      userId,
      status: "Pending",
    });

    if (existingPendingRequest) {
      return res
        .status(400)
        .json({ error: "You already have a pending request." });
    }

    // Check if the user has submitted a request in the past 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentRequest = await OrganizerRequest.findOne({
      userId,
      createdAt: { $gte: oneWeekAgo },
    });

    if (recentRequest) {
      return res.status(400).json({
        error:
          "You can only submit one request per week. Please try again later.",
      });
    }

    const request = new OrganizerRequest({
      userId,
      name,
      email,
      phone,
      reason,
    });

    await request.save();
    res
      .status(201)
      .json({ message: "Request submitted successfully", request });
  } catch (error) {
    console.error("Error submitting request:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all organizer requests (Admin only)
router.get("/", async (req, res) => {
  try {
    const requests = await OrganizerRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

// Approve or reject organizer request
router.put("/:requestId", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const request = await OrganizerRequest.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    request.status = status;
    await request.save();

    // If approved, update the user's role
    if (status === "Approved") {
      await User.findOneAndUpdate(
        { firebaseId: request.userId },
        { role: "organizer" }
      );
    }

    res.json({
      message: `Request ${status.toLowerCase()} successfully`,
      request,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update request" });
  }
});

module.exports = router;
