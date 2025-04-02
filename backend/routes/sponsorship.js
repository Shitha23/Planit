const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Sponsorship = require("../models/Sponsorship");
const mongoose = require("mongoose");

// Get events that need sponsorship with aggregated sponsorship info
router.get("/events/needsponsorship", async (req, res) => {
  try {
    const events = await Event.find({ needSponsorship: true }).lean();

    const sponsorships = await Sponsorship.aggregate([
      { $group: { _id: "$eventId", totalSponsored: { $sum: "$amount" } } },
    ]);

    const sponsorshipMap = {};
    sponsorships.forEach((s) => {
      sponsorshipMap[s._id.toString()] = s.totalSponsored;
    });

    const enrichedEvents = events.map((event) => {
      const sponsored = sponsorshipMap[event._id.toString()] || 0;
      return {
        ...event,
        totalSponsored: sponsored,
        remaining: event.sponsorshipAmount - sponsored,
      };
    });

    res.json(enrichedEvents);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Get sponsorships by sponsor ID
router.get("/sponsorships/:sponsorId", async (req, res) => {
  try {
    const { sponsorId } = req.params;

    const sponsorships = await Sponsorship.find({ sponsorId })
      .populate("eventId", "title date time location")
      .sort({ createdAt: -1 })
      .lean();

    res.json(sponsorships);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sponsorships", error });
  }
});

// Sponsor an event
router.post("/sponsorships", async (req, res) => {
  try {
    const { eventId, sponsorId, amount } = req.body;

    if (!eventId || !sponsorId || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Total amount already sponsored
    const totalSponsored = await Sponsorship.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const currentSponsored = totalSponsored[0]?.total || 0;
    const remaining = event.sponsorshipAmount - currentSponsored;

    if (amount > remaining) {
      return res.status(400).json({
        message: `Sponsorship exceeds goal. Only $${remaining} remaining.`,
      });
    }

    const sponsorship = new Sponsorship({
      eventId,
      sponsorId,
      amount,
    });

    await sponsorship.save();
    res.status(201).json({ message: "Sponsorship successful", sponsorship });
  } catch (error) {
    console.error("Error in sponsorship:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
