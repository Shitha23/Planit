const mongoose = require("mongoose");

const customerQuerySchema = new mongoose.Schema({
  eventInstanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EventInstance",
    required: true,
  },
  audienceId: { type: String, required: true },
  query: { type: String, required: true },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Resolved"],
    default: "Open",
  },
  assignedTo: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CustomerQuery", customerQuerySchema);
