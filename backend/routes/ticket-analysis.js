const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Event = require("../models/Event");

const router = express.Router();

router.get("/sales-summary", async (req, res) => {
  try {
    const { organizerId } = req.query;
    if (!organizerId) {
      return res.status(400).json({ error: "Organizer ID is required." });
    }

    console.log("Fetching sales summary for organizer:", organizerId);

    const events = await Event.find({ organizerId });
    if (!events.length) {
      return res.json({
        totalTickets: 0,
        totalRevenue: 0,
        paymentStatusCount: [],
      });
    }

    const eventIds = events.map((event) => event._id);
    console.log("Event IDs found:", eventIds);

    const eventInstances = await mongoose
      .model("EventInstance")
      .find({ eventId: { $in: eventIds } });
    if (!eventInstances.length) {
      console.log("No event instances found for these events.");
      return res.json({
        totalTickets: 0,
        totalRevenue: 0,
        paymentStatusCount: [],
      });
    }

    const eventInstanceIds = eventInstances.map((instance) => instance._id);
    console.log("EventInstance IDs found:", eventInstanceIds);

    const totalTicketsResult = await Order.aggregate([
      { $unwind: "$tickets" },
      { $match: { "tickets.eventInstanceId": { $in: eventInstanceIds } } },
      { $group: { _id: null, totalTickets: { $sum: "$tickets.quantity" } } },
    ]);
    const totalTickets =
      totalTicketsResult.length > 0 ? totalTicketsResult[0].totalTickets : 0;
    console.log("Total tickets sold:", totalTickets);

    const totalRevenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Completed",
          "tickets.eventInstanceId": { $in: eventInstanceIds },
        },
      },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue =
      totalRevenueResult.length > 0 ? totalRevenueResult[0].revenue : 0;
    console.log("Total revenue:", totalRevenue);

    const paymentStatusCount = await Order.aggregate([
      { $match: { "tickets.eventInstanceId": { $in: eventInstanceIds } } },
      { $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
    ]);
    console.log("Payment status count:", paymentStatusCount);

    res.json({
      totalTickets,
      totalRevenue,
      paymentStatusCount,
    });
  } catch (error) {
    console.error("Error fetching sales summary:", error);
    res.status(500).json({ error: "Error fetching sales summary." });
  }
});

router.get("/event-sales/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { organizerId } = req.query;

    if (!organizerId) {
      return res.status(400).json({ error: "Organizer ID is required." });
    }

    const event = await Event.findOne({ _id: eventId, organizerId });

    if (!event) {
      return res
        .status(404)
        .json({ error: "Event not found or unauthorized." });
    }

    const ticketsSold = await Order.aggregate([
      { $unwind: "$tickets" },
      {
        $match: {
          "tickets.eventInstanceId": new mongoose.Types.ObjectId(eventId),
        },
      },
      {
        $group: { _id: null, totalTicketsSold: { $sum: "$tickets.quantity" } },
      },
    ]);

    const totalTicketsSold =
      ticketsSold.length > 0 ? ticketsSold[0].totalTicketsSold : 0;

    const totalRevenue = await Order.aggregate([
      { $unwind: "$tickets" },
      {
        $match: {
          "tickets.eventInstanceId": new mongoose.Types.ObjectId(eventId),
        },
      },
      { $group: { _id: null, revenue: { $sum: "$tickets.price" } } },
    ]);

    res.json({
      eventId,
      totalTicketsSold,
      totalRevenue: totalRevenue[0]?.revenue || 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching event sales data." });
  }
});

router.get("/timeline", async (req, res) => {
  try {
    const { organizerId } = req.query;
    if (!organizerId) {
      return res.status(400).json({ error: "Organizer ID is required." });
    }

    const events = await Event.find({ organizerId });
    if (!events.length) {
      return res.json([]);
    }

    const eventIds = events.map((event) => event._id);
    const eventInstances = await mongoose
      .model("EventInstance")
      .find({ eventId: { $in: eventIds } });
    if (!eventInstances.length) {
      return res.json([]);
    }

    const eventInstanceIds = eventInstances.map((instance) => instance._id);

    const salesData = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Completed",
          "tickets.eventInstanceId": { $in: eventInstanceIds },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalAmount" },
          ticketsSold: { $sum: { $size: "$tickets" } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(salesData);
  } catch (error) {
    res.status(500).json({ error: "Error fetching sales timeline." });
  }
});

module.exports = router;
