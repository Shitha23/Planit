const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Event = require("../models/Event");
const EventInstance = require("../models/EventInstance");

const router = express.Router();

router.get("/sales-summary", async (req, res) => {
  try {
    const { organizerId } = req.query;
    if (!organizerId) {
      return res.status(400).json({ error: "Organizer ID is required." });
    }

    const events = await Event.find({ organizerId }).select("_id");
    if (!events.length) {
      return res.json({
        totalTickets: 0,
        totalRevenue: 0,
        paymentStatusCount: [],
      });
    }

    const eventInstances = await EventInstance.find({
      eventId: { $in: events.map((event) => event._id) },
    }).select("_id");

    if (!eventInstances.length) {
      return res.json({
        totalTickets: 0,
        totalRevenue: 0,
        paymentStatusCount: [],
      });
    }

    const eventInstanceIds = eventInstances.map((instance) => instance._id);

    const totalTicketsResult = await Order.aggregate([
      { $unwind: "$tickets" },
      { $match: { "tickets.eventInstanceId": { $in: eventInstanceIds } } },
      { $group: { _id: null, totalTickets: { $sum: "$tickets.quantity" } } },
    ]);

    const totalTickets =
      totalTicketsResult.length > 0 ? totalTicketsResult[0].totalTickets : 0;

    const totalRevenueResult = await Order.aggregate([
      { $unwind: "$tickets" },
      {
        $match: {
          paymentStatus: "Completed",
          "tickets.eventInstanceId": { $in: eventInstanceIds },
        },
      },
      {
        $group: {
          _id: null,
          revenue: {
            $sum: { $multiply: ["$tickets.price", "$tickets.quantity"] },
          },
        },
      },
    ]);

    const totalRevenue =
      totalRevenueResult.length > 0 ? totalRevenueResult[0].revenue : 0;

    const paymentStatusCount = await Order.aggregate([
      { $unwind: "$tickets" },
      { $match: { "tickets.eventInstanceId": { $in: eventInstanceIds } } },
      { $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
    ]);

    res.json({ totalTickets, totalRevenue, paymentStatusCount });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message || "Error fetching sales summary." });
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

    const events = await Event.find({ organizerId }).select("_id");
    if (!events.length) return res.json([]);

    const eventInstances = await EventInstance.find({
      eventId: { $in: events.map((event) => event._id) },
    }).select("_id");

    if (!eventInstances.length) return res.json([]);

    const eventInstanceIds = eventInstances.map((instance) => instance._id);

    const salesData = await Order.aggregate([
      { $unwind: "$tickets" },
      {
        $match: {
          paymentStatus: "Completed",
          "tickets.eventInstanceId": { $in: eventInstanceIds },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: {
            $sum: { $multiply: ["$tickets.price", "$tickets.quantity"] },
          },
          ticketsSold: { $sum: "$tickets.quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(salesData);
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message || "Error fetching sales timeline." });
  }
});

module.exports = router;
