import React, { useEffect, useState } from "react";

const SponsorshipPage = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/events/needsponsorship"
        );
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-extrabold text-navyBlue mb-8">
        Events Needing Sponsorship
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length > 0 ? (
          events.map((event) => {
            const remaining = event.remaining > 0 ? event.remaining : 0;
            const percent = Math.min(
              100,
              Math.round((event.totalSponsored / event.sponsorshipAmount) * 100)
            );

            return (
              <div
                key={event._id}
                className="border p-4 rounded-lg shadow-md bg-white"
              >
                <h2 className="text-xl font-semibold mb-1">{event.title}</h2>
                <p className="text-gray-600 mb-1">{event.description}</p>
                <p className="text-sm text-gray-800">
                  <strong>Total Sponsorship Needed:</strong> $
                  {event.sponsorshipAmount}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Already Sponsored:</strong> $
                  {event.totalSponsored || 0}
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

                <button
                  disabled
                  className={`w-full mt-2 bg-navyBlue hover:bg-deepBlue text-white py-2 px-4 rounded ${
                    remaining <= 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Sponsor Event
                </button>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 italic">
            No events currently require sponsorship.
          </p>
        )}
      </div>
    </div>
  );
};

export default SponsorshipPage;
