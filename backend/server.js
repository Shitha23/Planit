const express = require("express");
const cors = require("cors");
const event = require("./routes/event");
const connectDB = require("./db");
const auth = require("./routes/auth");
const order = require("./routes/order");
const ticket = require("./routes/ticket-analysis");
const eventQueries = require("./routes/eventqueries");
const volunteer = require("./routes/volunteer");
const sponsorship = require("./routes/sponsorship");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

connectDB();

app.get("/", (req, res) => {
  res.send("Welcome to the Plan-It API!");
});

app.use("/api/auth", auth);
app.use("/api", event);
app.use("/api", order);
app.use("/api", volunteer);
app.use("/api", ticket);
app.use("/api", eventQueries);
app.use("/api", sponsorship);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
