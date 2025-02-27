const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const EventInstance = require("../models/EventInstance");
const Order = require("../models/Order");

router.post("/event", async (req, res) => {
  try {
    const {
      organizerId,
      title,
      description,
      date,
      time,
      location,
      maxAttendees,
      ticketPrice,
      isRecurring,
      recurrenceType,
      recurrenceEndDate,
      needVolunteers,
      volunteersRequired,
      needSponsorship,
      sponsorshipAmount,
    } = req.body;

    const event = new Event({
      organizerId,
      title,
      description,
      date,
      time,
      location,
      maxAttendees,
      ticketPrice,
      isRecurring,
      recurrenceType,
      recurrenceEndDate,
      needVolunteers,
      volunteersRequired,
      needSponsorship,
      sponsorshipAmount,
    });

    await event.save();

    if (isRecurring) {
      let instances = [];
      let currentDate = new Date(date);

      while (currentDate <= new Date(recurrenceEndDate)) {
        instances.push({
          eventId: event._id,
          instanceDate: new Date(currentDate),
          instanceTime: time,
          location,
          ticketsSold: event.ticketsSold,
        });

        if (recurrenceType === "daily") {
          currentDate.setDate(currentDate.getDate() + 1);
        } else if (recurrenceType === "weekly") {
          currentDate.setDate(currentDate.getDate() + 7);
        } else if (recurrenceType === "monthly") {
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      }

      await EventInstance.insertMany(instances);
    } else {
      await EventInstance.create({
        eventId: event._id,
        instanceDate: date,
        instanceTime: time,
        location,
        ticketsSold: 0,
      });
    }

    res
      .status(201)
      .json({ message: "Event and instances created successfully", event });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error creating event" });
  }
});

router.get("/event/:eventId", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const eventInstance = await EventInstance.findOne({ eventId: event._id });

    res.json({
      ...event.toObject(),
      eventInstanceId: eventInstance ? eventInstance._id : null,
      instanceDate: eventInstance ? eventInstance.instanceDate : null,
      instanceTime: eventInstance ? eventInstance.instanceTime : null,
      instanceLocation: eventInstance ? eventInstance.location : null,
      instanceTicketsSold: eventInstance ? eventInstance.ticketsSold : 0,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Error fetching event details" });
  }
});

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

router.get("/ticketevents", async (req, res) => {
  try {
    const events = await Event.find().lean();

    const eventsWithInstances = await Promise.all(
      events.map(async (event) => {
        const eventInstance = await EventInstance.findOne({
          eventId: event._id,
        }).lean();
        return {
          ...event,
          eventInstanceId: eventInstance ? eventInstance._id : null,
        };
      })
    );

    res.json(eventsWithInstances);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Error fetching events" });
  }
});

router.put("/event/:id", async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedEvent)
      return res.status(404).json({ error: "Event not found" });

    if (req.body.date || req.body.time || req.body.location) {
      await EventInstance.updateMany(
        { eventId: req.params.id },
        {
          instanceDate: req.body.date || updatedEvent.date,
          instanceTime: req.body.time || updatedEvent.time,
          location: req.body.location || updatedEvent.location,
        }
      );
    }

    res.json({
      message: "Event and instances updated successfully",
      updatedEvent,
    });
  } catch (error) {
    res.status(500).json({ error: "Error updating event" });
  }
});

router.delete("/event/:id", async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent)
      return res.status(404).json({ error: "Event not found" });

    await EventInstance.deleteMany({ eventId: req.params.id });

    res.json({ message: "Event and instances deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting event" });
  }
});

router.get("/tickets-sold/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    const eventInstances = await EventInstance.find({ eventId }).select("_id");

    if (!eventInstances || eventInstances.length === 0) {
      return res.json({ eventId, ticketsSold: 0, revenue: 0 });
    }

    const eventInstanceIds = eventInstances.map((instance) => instance._id);

    const ticketsSoldData = await Order.aggregate([
      { $unwind: "$tickets" },
      { $match: { "tickets.eventInstanceId": { $in: eventInstanceIds } } },
      {
        $group: {
          _id: null,
          totalTicketsSold: { $sum: "$tickets.quantity" },
          totalRevenue: { $sum: "$tickets.price" },
        },
      },
    ]);

    const ticketsSold =
      ticketsSoldData.length > 0 ? ticketsSoldData[0].totalTicketsSold : 0;
    const revenue =
      ticketsSoldData.length > 0 ? ticketsSoldData[0].totalRevenue : 0;

    res.json({ eventId, ticketsSold, revenue });
  } catch (error) {
    console.error("Error fetching ticket sales:", error);
    res
      .status(500)
      .json({ error: error.message || "Error fetching ticket sales." });
  }
});

module.exports = router;
