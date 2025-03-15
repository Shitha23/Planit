const mongoose = require("mongoose");

const organizerRequestSchema = new mongoose.Schema({
  userId: { type: String, ref: "User", required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("OrganizerRequest", organizerRequestSchema);
