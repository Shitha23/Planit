const express = require("express");
const Volunteer = require("../models/Volunteer");
const Event = require("../models/Event");

const router = express.Router();

router.get("/events/need-volunteers", async (req, res) => {
  try {
    const events = await Event.find({ needVolunteers: true });

    const eventsWithCount = await Promise.all(
      events.map(async (event) => {
        const volunteerCount = await Volunteer.countDocuments({
          eventId: event._id,
        });
        return { ...event.toObject(), volunteerCount };
      })
    );

    res.json(eventsWithCount);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.get("/volunteers/user/:userId", async (req, res) => {
  try {
    const volunteers = await Volunteer.find({ volunteerId: req.params.userId });
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch volunteer data" });
  }
});

router.post("/volunteers/register", async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    const existingVolunteer = await Volunteer.findOne({
      eventId,
      volunteerId: userId,
    });
    if (existingVolunteer) {
      return res
        .status(400)
        .json({ error: "Already registered as a volunteer" });
    }

    const newVolunteer = new Volunteer({
      eventId,
      volunteerId: userId,
      accessLevel: "Basic",
      S,
    });

    await newVolunteer.save();
    res.status(201).json(newVolunteer);
  } catch (error) {
    res.status(500).json({ error: "Failed to register as volunteer" });
  }
});

module.exports = router;
