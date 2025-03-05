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
      paymentStatus: "Pending",
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

    const events = await Event.find({ organizerId }).select("_id");
    if (!events.length) {
      return res.json([]);
    }

    const eventInstances = await EventInstance.find({
      eventId: { $in: events.map((e) => e._id) },
    }).select("_id eventId");
    if (!eventInstances.length) {
      return res.json([]);
    }

    const eventInstanceIds = eventInstances.map((instance) => instance._id);
    const orders = await Order.find({
      "tickets.eventInstanceId": { $in: eventInstanceIds },
    }).sort({ createdAt: -1 });

    const userIds = orders.map((order) => order.userId);
    const users = await User.find({ firebaseId: { $in: userIds } }).select(
      "firebaseId name email"
    );

    const enrichedOrders = orders.map((order) => ({
      ...order.toObject(),
      user: users.find((user) => user.firebaseId === order.userId) || {
        name: "Unknown",
        email: "Unknown",
      },
      tickets: order.tickets.map((ticket) => {
        const eventInstance = eventInstances.find((instance) =>
          instance._id.equals(ticket.eventInstanceId)
        );
        return {
          ...ticket,
          eventInstance: eventInstance
            ? eventInstance.toObject()
            : { title: "Unknown" },
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

    if (!orders.length) {
      console.log("No previous orders found for this user.");
    }

    let totalTicketsBooked = 0;

    orders.forEach((order) => {
      order.tickets.forEach((ticket) => {
        console.log(
          `Checking ticket: ${ticket.ticketId} against event: ${eventId}`
        );

        if (ticket.ticketId.equals(eventObjectId)) {
          totalTicketsBooked += ticket.quantity;
        }
      });
    });

    console.log(`Total tickets booked: ${totalTicketsBooked}`);
    res.json({ totalTicketsBooked });
  } catch (error) {
    console.error("Error checking ticket count:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
