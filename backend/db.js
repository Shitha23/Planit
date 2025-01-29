const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://planiteventmanagement5:planIt_Group7@cluster0.enu4y.mongodb.net/plan_it_db?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("MongoDB connected successfully...");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
