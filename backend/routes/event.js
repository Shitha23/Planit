const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Notification = require("../models/Notification");
const Event = require("../models/Event");
const EventInstance = require("../models/EventInstance");
const Order = require("../models/Order");
const { sendEmail } = require("../config/emailService");

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
          ticketsSold: 0,
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

    const customers = await User.find({ role: "customer" });

    const notifications = customers.map((customer) => ({
      userId: customer._id.toString(),
      message: `A new event "${title}" has been hosted. Check it out!`,
      read: false,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    for (const customer of customers) {
      sendEmail(
        customer.email,
        `New Event: ${title}`,
        `Hello ${customer.name},\n\nA new event "${title}" has been hosted on our platform.\n\nEvent Details:\n- Location: ${location}\n- Date: ${date}\n- Time: ${time}\n\nVisit our platform to book your tickets now!`
      );
    }

    res.status(201).json({
      message: "Event created successfully. Notifications and emails sent.",
      event,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Error creating event" });
  }
});

// Fetch event details
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
    res.status(500).json({ error: "Error fetching event details" });
  }
});

// Fetch events for an organizer
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

// Fetch upcoming events within 7 days
router.get("/upcoming", async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcomingEvents = await Event.find({
      date: { $gte: today, $lte: nextWeek },
    }).sort({ date: 1 });

    res.json(upcomingEvents);
  } catch (error) {
    res.status(500).json({ error: "Error fetching upcoming events" });
  }
});

// Update event details
router.put("/event/:id", async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
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

// Delete event and instances
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

// Fetch ticket sales for an event
router.get("/tickets-sold/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    const eventInstances = await EventInstance.find({ eventId }).select("_id");

    if (!eventInstances.length) {
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

    res.json({
      eventId,
      ticketsSold: ticketsSoldData[0]?.totalTicketsSold || 0,
      revenue: ticketsSoldData[0]?.totalRevenue || 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching ticket sales." });
  }
});

router.get("/ticketevents", async (req, res) => {
  try {
    const today = new Date();
    const upcomingEvents = await Event.find({ date: { $gte: today } }).sort({
      date: 1,
    });

    const eventIds = upcomingEvents.map((event) => event._id);
    const eventInstances = await EventInstance.find({
      eventId: { $in: eventIds },
    });

    const eventMap = new Map();
    eventInstances.forEach((instance) => {
      eventMap.set(instance.eventId.toString(), instance);
    });

    const updatedEvents = upcomingEvents.map((event) => {
      const instance = eventMap.get(event._id.toString());
      return {
        ...event.toObject(),
        eventInstanceId: instance ? instance._id : null,
        instanceDate: instance ? instance.instanceDate : null,
        instanceTime: instance ? instance.instanceTime : null,
        instanceLocation: instance ? instance.location : null,
        instanceTicketsSold: instance ? instance.ticketsSold : 0,
      };
    });

    res.json(updatedEvents);
  } catch (error) {
    res.status(500).json({ error: "Error fetching upcoming events" });
  }
});

router.get("/organizer/:organizerId", async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.params.organizerId });
    res.json(events);
  } catch (err) {
    console.error("Error fetching organizer's events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

module.exports = router;
