const express = require("express");
const cors = require("cors");
const Event = require("./models/Event");
const connectDB = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

connectDB().then(async () => {
  const eventExists = await Event.findOne();
  if (!eventExists) {
    await Event.create({
      organizerId: "12345",
      title: "First Event",
      date: new Date(),
    });
    console.log("Test event created.");
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to the Plan-It API!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
