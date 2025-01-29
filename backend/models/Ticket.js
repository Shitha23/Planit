const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  eventInstanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EventInstance",
    required: true,
  },
  audienceId: { type: String, required: true },
  quantity: Number,
  totalPrice: Number,
  isPaid: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Ticket", ticketSchema);
