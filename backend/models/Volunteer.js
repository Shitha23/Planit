const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  volunteerId: { type: String, required: true },
  payAmount: Number,
  accessLevel: {
    type: String,
    enum: ["Basic", "Coordinator"],
    default: "Basic",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

volunteerSchema.statics.getVolunteerCount = async function (eventId) {
  return await this.countDocuments({ eventId });
};

module.exports = mongoose.model("Volunteer", volunteerSchema);
