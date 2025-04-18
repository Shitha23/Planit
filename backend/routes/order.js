const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const mongoose = require("mongoose");
const Event = require("../models/Event");
const EventInstance = require("../models/EventInstance");
const User = require("../models/User");

router.post("/order", async (req, res) => {
  try {
    const { userId, tickets, totalAmount } = req.body;

    const user = await User.findOne({ firebaseId: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    for (const ticket of tickets) {
      if (!ticket.eventInstanceId) {
        return res
          .status(400)
          .json({ error: "Missing eventInstanceId in ticket" });
      }

      const eventInstance = await EventInstance.findById(
        ticket.eventInstanceId
      );
      if (!eventInstance) {
        return res.status(404).json({
          error: `EventInstance not found for ID: ${ticket.eventInstanceId}`,
        });
      }

      const event = await Event.findById(eventInstance.eventId);
      if (!event) {
        return res.status(404).json({
          error: `Event not found for eventInstanceId: ${ticket.eventInstanceId}`,
        });
      }

      if (eventInstance.ticketsSold + ticket.quantity > event.maxAttendees) {
        return res.status(400).json({
          error: `Not enough tickets available for event: ${
            event.title
          }. Available spots: ${
            event.maxAttendees - eventInstance.ticketsSold
          }`,
        });
      }
    }

    const order = new Order({
      userId: user.firebaseId,
      tickets,
      totalAmount,
      paymentStatus: "Completed",
      orderStatus: "Confirmed",
    });

    await order.save();

    for (const ticket of tickets) {
      await EventInstance.findByIdAndUpdate(ticket.eventInstanceId, {
        $inc: { ticketsSold: ticket.quantity },
      });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: error.message || "Error creating order" });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const { organizerId } = req.query;
    if (!organizerId) {
      return res.status(400).json({ error: "Organizer ID is required." });
    }

    const events = await Event.find({ organizerId }).select("_id title").lean();
    if (!events.length) return res.json([]);

    const eventIds = events.map((event) => event._id.toString());

    const eventInstances = await EventInstance.find({
      eventId: { $in: eventIds },
    })
      .select("_id eventId")
      .lean();

    if (!eventInstances.length) return res.json([]);

    const eventInstanceMap = {};
    eventInstances.forEach((instance) => {
      eventInstanceMap[instance._id.toString()] = instance.eventId.toString();
    });

    const eventMap = {};
    events.forEach((event) => {
      eventMap[event._id.toString()] = event.title;
    });

    const orders = await Order.find({
      "tickets.eventInstanceId": { $in: Object.keys(eventInstanceMap) },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!orders.length) return res.json([]);

    const userIds = orders.map((order) => order.userId);
    const users = await User.find({ firebaseId: { $in: userIds } })
      .select("firebaseId name email")
      .lean();

    const enrichedOrders = orders.map((order) => ({
      ...order,
      user: users.find((user) => user.firebaseId === order.userId) || {
        name: "Unknown",
        email: "Unknown",
      },
      tickets: order.tickets.map((ticket) => {
        const eventId = eventInstanceMap[ticket.eventInstanceId.toString()];
        return {
          ...ticket,
          eventInstance: {
            eventId,
            title: eventMap[eventId] || "Unknown",
          },
        };
      }),
    }));

    res.json(enrichedOrders);
  } catch (error) {
    res.status(500).json({ error: error.message || "Error fetching orders." });
  }
});

router.get("/user-ticket-count/:userId/:eventId", async (req, res) => {
  try {
    const { userId, eventId } = req.params;

    const eventObjectId = new mongoose.Types.ObjectId(eventId);
    const orders = await Order.find({ userId });

    let totalTicketsBooked = 0;
    orders.forEach((order) => {
      order.tickets.forEach((ticket) => {
        if (ticket.ticketId.equals(eventObjectId)) {
          totalTicketsBooked += ticket.quantity;
        }
      });
    });

    res.json({ totalTicketsBooked });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/user-orders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
    if (!orders.length) return res.json([]);

    const eventInstanceIds = orders.flatMap((order) =>
      order.tickets.map((ticket) => ticket.eventInstanceId)
    );

    const eventInstances = await EventInstance.find({
      _id: { $in: eventInstanceIds },
    }).lean();

    const eventIds = [
      ...new Set(eventInstances.map((ei) => ei.eventId.toString())),
    ];

    const events = await Event.find({ _id: { $in: eventIds } })
      .select("_id title")
      .lean();

    const eventMap = {};
    events.forEach((e) => {
      eventMap[e._id.toString()] = e.title;
    });

    const instanceMap = {};
    eventInstances.forEach((inst) => {
      instanceMap[inst._id.toString()] = {
        date: inst.instanceDate,
        eventId: inst.eventId.toString(),
        location: inst.location || "N/A",
      };
    });

    const enrichedOrders = orders.map((order) => ({
      ...order,
      tickets: order.tickets.map((ticket) => {
        const instance = instanceMap[ticket.eventInstanceId.toString()];
        const title = eventMap[instance?.eventId] || "Unknown";
        return {
          ...ticket,
          eventTitle: title,
          instanceDate: instance?.date || null,
          location: instance?.location || "N/A",
        };
      }),
    }));

    res.json(enrichedOrders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
});

module.exports = router;
