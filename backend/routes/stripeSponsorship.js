const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Sponsorship = require("../models/Sponsorship");
const Event = require("../models/Event");

router.post("/create-sponsorship-session", async (req, res) => {
  try {
    const { sponsorId, eventId, amount } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: `Sponsor: ${event.title}`,
              description: `Supporting event: ${event.description}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:3000/sponsorship-success?eventId=${eventId}&sponsorId=${sponsorId}&amount=${amount}`,
      cancel_url: `http://localhost:3000/sponsorship-cancelled`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe sponsorship error:", error.message);
    res.status(500).json({ error: "Stripe sponsorship session failed" });
  }
});

module.exports = router;
