const express = require("express");
const mongoose = require("mongoose");
const EventQuery = require("../models/EventQuery");
const User = require("../models/User");
const Event = require("../models/Event");
const router = express.Router();

router.post("/event-queries", async (req, res) => {
  try {
    const { eventId, email, query } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const newQuery = new EventQuery({
      eventId,
      organizerId: event.organizerId,
      userId: user._id,
      email,
      query,
    });

    await newQuery.save();
    res.status(201).json({ message: "Query submitted successfully" });
  } catch (error) {
    console.error("Error storing query:", error);
    res.status(500).json({ error: error.message || "Error submitting query." });
  }
});

router.get("/organizer-events/:organizerId", async (req, res) => {
  try {
    const { organizerId } = req.params;

    const events = await Event.find({ organizerId });

    const eventsWithQueryCount = await Promise.all(
      events.map(async (event) => {
        const queryCount = await EventQuery.countDocuments({
          eventId: event._id,
        });
        return {
          _id: event._id,
          title: event.title,
          queryCount,
        };
      })
    );

    res.json(eventsWithQueryCount);
  } catch (error) {
    console.error("Error fetching organizer events:", error);
    res.status(500).json({ error: "Error fetching events." });
  }
});

router.get("/event-queries/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    const queries = await EventQuery.find({ eventId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(queries);
  } catch (error) {
    console.error("Error fetching event queries:", error);
    res.status(500).json({ error: "Error fetching event queries." });
  }
});

module.exports = router;
