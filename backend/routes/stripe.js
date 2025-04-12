const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Event = require("../models/Event");
const EventInstance = require("../models/EventInstance");
const User = require("../models/User");

router.post("/create-stripe-session", async (req, res) => {
  try {
    const { cart, userId, totalAmount } = req.body;

    const user = await User.findOne({ firebaseId: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    for (const ticket of cart) {
      if (!ticket.eventInstanceId) {
        return res
          .status(400)
          .json({ error: "Missing eventInstanceId in ticket" });
      }

      const eventInstance = await EventInstance.findById(
        ticket.eventInstanceId
      );
      if (!eventInstance) {
        return res.status(404).json({
          error: `EventInstance not found for ID: ${ticket.eventInstanceId}`,
        });
      }

      const event = await Event.findById(eventInstance.eventId);
      if (!event) {
        return res.status(404).json({
          error: `Event not found for eventInstanceId: ${ticket.eventInstanceId}`,
        });
      }

      if (eventInstance.ticketsSold + ticket.quantity > event.maxAttendees) {
        return res.status(400).json({
          error: `Not enough tickets available for ${event.title}. Remaining: ${
            event.maxAttendees - eventInstance.ticketsSold
          }`,
        });
      }
    }

    const line_items = cart.map((item) => ({
      price_data: {
        currency: "cad",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `http://localhost:3000/order-success?payment=success`,
      cancel_url: `http://localhost:3000/payment-cancelled`,
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Stripe session creation error:", error.message);
    res.status(500).json({ error: "Stripe session creation failed" });
  }
});

module.exports = router;
