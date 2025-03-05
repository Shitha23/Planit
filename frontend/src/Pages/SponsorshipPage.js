import React, { useEffect, useState } from "react";

const SponsorshipPage = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/events/needsponsorship"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event._id} className="border p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p className="text-gray-600">{event.description}</p>
              <p className="text-gray-800 font-medium mt-2">
                Sponsorship Needed: ${event.sponsorshipAmount}
              </p>
              <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                Sponsor Event
              </button>
            </div>
          ))
        ) : (
          <p>No events currently require sponsorship.</p>
        )}
      </div>
    </div>
  );
};

export default SponsorshipPage;
