import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const SponsorshipPage = () => {
  const [activeEvents, setActiveEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/events/needsponsorship"
        );
        const data = await response.json();
        const now = new Date();

        const future = [];
        const past = [];

        data.forEach((event) => {
          const eventDate = new Date(event.date);
          if (eventDate >= now) {
            future.push(event);
          } else {
            past.push(event);
          }
        });

        setActiveEvents(future);
        setPastEvents(past);
      } catch (error) {
        triggerAlert("Error fetching events", "error");
      }
    };

    fetchEvents();
  }, []);

  const triggerAlert = (message, type = "error") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleSponsorship = async (eventId) => {
    const sponsorId = localStorage.getItem("firebaseId");
    const amount = parseFloat(amounts[eventId]);

    if (!amount || amount <= 0) {
      triggerAlert("Please enter a valid amount.");
      return;
    }

    try {
      const stripe = await stripePromise;

      const res = await fetch(
        "http://localhost:5001/api/create-sponsorship-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sponsorId, eventId, amount }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        triggerAlert(data?.error || "Server error.");
        return;
      }

      const result = await stripe.redirectToCheckout({ sessionId: data.id });
      if (result.error) triggerAlert(result.error.message);
    } catch (error) {
      console.error("Stripe checkout error:", error);
      triggerAlert("Stripe checkout failed.");
    }
  };

  const renderEventCard = (event, isPast = false) => {
    const remaining = event.remaining > 0 ? event.remaining : 0;
    const percent = Math.min(
      100,
      Math.round((event.totalSponsored / event.sponsorshipAmount) * 100)
    );

    return (
      <div key={event._id} className="border p-4 rounded-lg shadow-md bg-white">
        <h2 className="text-xl font-semibold mb-1">{event.title}</h2>
        <p className="text-gray-600 mb-1">{event.description}</p>
        <p className="text-sm text-gray-800">
          <strong>Total Needed:</strong> ${event.sponsorshipAmount}
        </p>
        <p className="text-sm text-green-700">
          <strong>Sponsored:</strong> ${event.totalSponsored || 0}
        </p>
        <p className="text-sm text-red-600">
          <strong>Remaining:</strong> ${remaining}
        </p>

        <div className="w-full bg-gray-200 rounded-full h-3 my-3">
          <div
            className="bg-green-500 h-3 rounded-full"
            style={{ width: `${percent}%` }}
          ></div>
        </div>

        {!isPast && (
          <>
            <input
              type="number"
              placeholder="Enter amount"
              className="w-full border px-2 py-1 rounded mt-2"
              value={amounts[event._id] || ""}
              onChange={(e) =>
                setAmounts((prev) => ({ ...prev, [event._id]: e.target.value }))
              }
            />
            <button
              onClick={() => handleSponsorship(event._id)}
              disabled={remaining <= 0}
              className={`w-full mt-2 bg-navyBlue hover:bg-deepBlue text-white py-2 px-4 rounded ${
                remaining <= 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Sponsor Event
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      {alert && (
        <div
          className={`mb-4 p-3 rounded text-white ${
            alert.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {alert.message}
        </div>
      )}

      <h1 className="text-4xl font-extrabold text-navyBlue mb-6">
        Sponsor Active Events
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {activeEvents.length > 0 ? (
          activeEvents.map((event) => renderEventCard(event))
        ) : (
          <p className="text-gray-500 italic">
            No upcoming events need sponsorship.
          </p>
        )}
      </div>

      <h2 className="text-3xl font-bold text-navyBlue mb-4">
        Past Events (Closed)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pastEvents.length > 0 ? (
          pastEvents.map((event) => renderEventCard(event, true))
        ) : (
          <p className="text-gray-500 italic">No past sponsored events.</p>
        )}
      </div>
    </div>
  );
};

export default SponsorshipPage;
