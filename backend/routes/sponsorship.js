const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Sponsorship = require("../models/Sponsorship");

router.get("/events/needsponsorship", async (req, res) => {
  try {
    const events = await Event.find({ needSponsorship: true });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

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

router.post("/sponsorships", async (req, res) => {
  try {
    const { eventId, sponsorId, amount } = req.body;

    if (!eventId || !sponsorId || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const sponsorship = new Sponsorship({
      eventId,
      sponsorId,
      amount,
    });

    await sponsorship.save();
    res.status(201).json({ message: "Sponsorship successful", sponsorship });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
