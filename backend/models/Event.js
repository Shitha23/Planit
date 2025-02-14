const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  organizerId: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  date: Date,
  time: String,
  location: String,
  maxAttendees: Number,
  ticketsSold: { type: Number, default: 0 },
  ticketPrice: { type: Number, required: true },
  isRecurring: Boolean,
  recurrenceType: String,
  recurrenceEndDate: Date,
  needVolunteers: Boolean,
  volunteersRequired: { type: Number, default: 0 },
  needSponsorship: Boolean,
  sponsorshipAmount: { type: Number, default: 1000 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Event", eventSchema);
