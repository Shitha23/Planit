const User = require("../models/User");

const isAdmin = async (req, res, next) => {
  try {
    console.log("Middleware: Checking admin access...");

    if (!req.user || !req.user.uid) {
      console.log("Middleware Error: No user found in request.");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ firebaseId: req.user.uid });

    if (!user) {
      console.log("Middleware Error: User not found in database.");
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      console.log(`Middleware Error: User ${user.email} is not an admin.`);
      return res.status(403).json({ message: "Access denied" });
    }

    console.log(`Middleware Success: User ${user.email} is an admin.`);
    next();
  } catch (error) {
    console.error("Middleware Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = isAdmin;
