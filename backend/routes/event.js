const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// Create Event
router.post("/event", async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    res.status(500).json({ error: "Error creating event" });
  }
});

// Get Event by ID
router.get("/event/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Error fetching event" });
  }
});

// Get All Events by Organizer ID
router.get("/events", async (req, res) => {
  try {
    const { organizerId } = req.query;
    if (!organizerId)
      return res.status(400).json({ error: "Organizer ID is required" });

    const events = await Event.find({ organizerId });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Error fetching events" });
  }
});

// Update Event
router.put("/event/:id", async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedEvent)
      return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event updated successfully", updatedEvent });
  } catch (error) {
    res.status(500).json({ error: "Error updating event" });
  }
});

// Delete Event
router.delete("/event/:id", async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent)
      return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting event" });
  }
});

module.exports = router;
