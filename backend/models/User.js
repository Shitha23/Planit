const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firebaseId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: false },
  address: { type: String, required: false },
  email: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("User", UserSchema);
