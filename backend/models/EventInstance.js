const mongoose = require("mongoose");

const eventInstanceSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  instanceDate: Date,
  instanceTime: String,
  location: String,
  ticketsSold: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("EventInstance", eventInstanceSchema);
