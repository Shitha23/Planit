const express = require("express");
const cors = require("cors");
const User = require("./models/User");
const event = require("./routes/event");
const connectDB = require("./db");
const auth = require("./routes/auth");

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
