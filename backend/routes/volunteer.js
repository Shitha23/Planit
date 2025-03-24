const express = require("express");
const Volunteer = require("../models/Volunteer");
const Event = require("../models/Event");
const User = require("../models/User");
const router = express.Router();
const { sendEmail } = require("../config/emailService");

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
    const volunteers = await Volunteer.find({
      volunteerId: req.params.userId,
    }).populate("eventId");
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch volunteer data" });
  }
});

router.post("/volunteers/register", async (req, res) => {
  try {
    const { eventId, userId, reason } = req.body;

    const existing = await Volunteer.findOne({ eventId, volunteerId: userId });
    if (existing) {
      return res.status(400).json({ error: "Already registered" });
    }

    const newVolunteer = new Volunteer({
      eventId,
      volunteerId: userId,
      accessLevel: "Basic",
      reasonForCoordinator: reason,
    });

    await newVolunteer.save();
    res.status(201).json(newVolunteer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register" });
  }
});

router.get("/volunteers/pending/:organizerId", async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.params.organizerId });
    const eventIds = events.map((e) => e._id);

    const volunteers = await Volunteer.find({
      eventId: { $in: eventIds },
      accessLevel: { $ne: "Coordinator" },
      $or: [
        { reasonForCoordinator: { $exists: true, $ne: "" } },
        { coverFilePath: { $exists: true, $ne: "" } },
      ],
    })
      .populate("eventId")
      .lean();

    const populatedVolunteers = await Promise.all(
      volunteers.map(async (v) => {
        const user = await User.findOne({ firebaseId: v.volunteerId }).lean();
        return {
          ...v,
          user,
          event: v.eventId,
        };
      })
    );

    res.json(populatedVolunteers);
  } catch (error) {
    console.error("Failed to fetch coordinator volunteers", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/volunteers/approve", async (req, res) => {
  const { volunteerId } = req.body;

  try {
    const updated = await Volunteer.findByIdAndUpdate(
      volunteerId,
      { accessLevel: "Coordinator" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Volunteer not found" });
    }

    const user = await User.findOne({ firebaseId: updated.volunteerId });
    if (user) {
      await sendEmail(
        user.email,
        "Volunteer Request Approved",
        `Hi ${user.name},\n\nCongratulations! Your request to volunteer as a coordinator for the event has been approved.\n\nThank you for your contribution!`
      );
    }

    res.json({ message: "Volunteer approved", volunteer: updated });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ error: "Failed to approve volunteer" });
  }
});

router.get("/volunteers/event/:eventId", async (req, res) => {
  try {
    const volunteers = await Volunteer.find({
      eventId: req.params.eventId,
    }).lean();

    const enrichedVolunteers = await Promise.all(
      volunteers.map(async (v) => {
        const user = await User.findOne({ firebaseId: v.volunteerId }).lean();
        return { ...v, user };
      })
    );

    res.json(enrichedVolunteers);
  } catch (err) {
    console.error("Error fetching event volunteers:", err);
    res.status(500).json({ error: "Failed to fetch volunteers" });
  }
});

router.put("/volunteers/deny", async (req, res) => {
  const { volunteerId } = req.body;

  try {
    const deleted = await Volunteer.findByIdAndDelete(volunteerId);

    if (!deleted) {
      return res.status(404).json({ error: "Volunteer not found" });
    }

    const user = await User.findOne({ firebaseId: deleted.volunteerId });
    if (user) {
      await sendEmail(
        user.email,
        "Volunteer Request Denied",
        `Hi ${user.name},\n\nThank you for applying to volunteer as a coordinator. Unfortunately, your request was not approved at this time.\n\nWe appreciate your interest and encourage you to participate in future events.`
      );
    }

    res.json({ message: "Volunteer request denied and removed" });
  } catch (err) {
    console.error("Denial error:", err);
    res.status(500).json({ error: "Failed to deny volunteer" });
  }
});

module.exports = router;
