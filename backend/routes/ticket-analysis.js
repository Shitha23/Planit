const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Ticket = require("../models/Ticket");
const Event = require("../models/Event");
const User = require("../models/User");
const router = express.Router();

router.get("/sales-summary", async (req, res) => {
  try {
    const totalTicketsResult = await Order.aggregate([
      { $unwind: "$tickets" },
      { $group: { _id: null, totalTickets: { $sum: "$tickets.quantity" } } },
    ]);
    const totalTickets =
      totalTicketsResult.length > 0 ? totalTicketsResult[0].totalTickets : 0;

    const totalRevenueResult = await Order.aggregate([
      { $match: { paymentStatus: "Completed" } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue =
      totalRevenueResult.length > 0 ? totalRevenueResult[0].revenue : 0;

    const paymentStatusCount = await Order.aggregate([
      { $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
    ]);

    res.json({
      totalTickets,
      totalRevenue,
      paymentStatusCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching sales summary." });
  }
});

router.get("/event-sales/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const ticketsSold = await Ticket.find({
      eventInstanceId: eventId,
    }).countDocuments();
    const totalRevenue = await Order.aggregate([
      { $unwind: "$tickets" },
      {
        $match: { "tickets.eventInstanceId": mongoose.Types.ObjectId(eventId) },
      },
      { $group: { _id: null, revenue: { $sum: "$tickets.price" } } },
    ]);
    res.json({
      eventId,
      ticketsSold,
      totalRevenue: totalRevenue[0]?.revenue || 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching event sales data." });
  }
});

router.get("/timeline", async (req, res) => {
  try {
    const salesData = await Order.aggregate([
      { $match: { paymentStatus: "Completed" } },
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
