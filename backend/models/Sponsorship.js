const mongoose = require("mongoose");

const sponsorshipSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  sponsorId: { type: String, required: true },
  amount: Number,
  ticketPrice: Number,
  salesRevenue: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Sponsorship", sponsorshipSchema);
