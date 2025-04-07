const express = require("express");
const Notification = require("../models/Notification");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userId = req.headers["user-id"];
    if (!userId)
      return res.status(400).json({ error: "User ID is required in headers" });

    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Error fetching notifications" });
  }
});

router.put("/mark-read", async (req, res) => {
  try {
    const userId = req.headers["user-id"];
    if (!userId)
      return res.status(400).json({ error: "User ID is required in headers" });

    await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Error updating notifications" });
  }
});

router.post("/remind-upcoming-events", async (req, res) => {
  try {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const instances = await EventInstance.find({
      instanceDate: {
        $gte: new Date(threeDaysLater.setHours(0, 0, 0, 0)),
        $lt: new Date(threeDaysLater.setHours(23, 59, 59, 999)),
      },
    });

    const instanceIds = instances.map((i) => i._id.toString());
    const eventMap = {};
    const events = await Event.find({
      _id: { $in: instances.map((i) => i.eventId) },
    });
    events.forEach((e) => (eventMap[e._id.toString()] = e.title));

    const orders = await Order.find({
      "tickets.eventInstanceId": { $in: instanceIds },
    });
    const userIds = [...new Set(orders.map((o) => o.userId))];
    const users = await User.find({ firebaseId: { $in: userIds } });

    const userMap = {};
    users.forEach((u) => {
      userMap[u.firebaseId] = u;
    });

    for (const order of orders) {
      for (const ticket of order.tickets) {
        const instanceId = ticket.eventInstanceId.toString();
        if (instanceIds.includes(instanceId)) {
          const eventId = instances
            .find((i) => i._id.toString() === instanceId)
            ?.eventId?.toString();
          const eventTitle = eventMap[eventId] || "Event";
          const user = userMap[order.userId];
          if (user) {
            const message = `Reminder: Your event "${eventTitle}" is happening in 3 days. Don’t forget to attend.`;

            await Notification.create({
              userId: order.userId,
              message,
              read: false,
            });

            await sendEmail(user.email, "Upcoming Event Reminder", message);
          }
        }
      }
    }

    res.json({ message: "Reminders sent" });
  } catch (error) {
    console.error("Error sending reminders:", error);
    res.status(500).json({ error: "Error sending reminders" });
  }
});
module.exports = router;
