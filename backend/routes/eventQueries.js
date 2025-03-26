const express = require("express");
const mongoose = require("mongoose");
const EventQuery = require("../models/EventQuery");
const User = require("../models/User");
const Event = require("../models/Event");
const router = express.Router();
const Notification = require("../models/Notification");
const { sendEmail } = require("../config/emailService");

router.put("/reply/:queryId", async (req, res) => {
  try {
    const { reply } = req.body;

    const query = await EventQuery.findById(req.params.queryId)
      .populate("userId")
      .populate("eventId", "title");

    if (!query) {
      return res.status(404).json({ error: "Query not found" });
    }

    query.reply = reply;
    query.status = "Responded";
    await query.save();

    await Notification.create({
      userId: query.userId._id,
      message: `You received a response to your query for event: ${query.eventId.title}`,
    });

    await sendEmail(
      query.userId.email,
      "Your Event Query Received a Response",
      `Hi ${query.userId.name},\n\nYou received a reply to your query regarding the event "${query.eventId.title}".\n\nYour question: "${query.query}"\n\nResponse: "${reply}"\n\nVisit your dashboard to view more.\n\nThank you!`
    );

    res.json({ message: "Reply sent and user notified." });
  } catch (error) {
    console.error("Error replying to query:", error);
    res.status(500).json({ error: "Error sending reply" });
  }
});

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

router.get("/user-queries/:firebaseId", async (req, res) => {
  try {
    const { firebaseId } = req.params;

    const user = await User.findOne({ firebaseId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const queries = await EventQuery.find({ userId: user._id })
      .populate("eventId", "title date")
      .sort({ createdAt: -1 })
      .lean();

    res.json(queries);
  } catch (error) {
    console.error("Error fetching user queries:", error);
    res.status(500).json({ error: "Failed to fetch user queries" });
  }
});

module.exports = router;
