import React, { useEffect, useState } from "react";
import axios from "axios";

const VolunteerPage = ({ userId }) => {
  const [events, setEvents] = useState([]);
  const [volunteerStatus, setVolunteerStatus] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/events/need-volunteers")
      .then((res) => {
        setEvents(res.data);
      });

    axios
      .get(`http://localhost:5000/api/volunteers/user/${userId}`)
      .then((res) => {
        setVolunteerStatus(
          res.data.reduce((acc, vol) => {
            acc[vol.eventId] = vol.accessLevel;
            return acc;
          }, {})
        );
      });
  }, [userId]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-4xl font-extrabold text-navyBlue mb-8">
        Volunteer Dashboard
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event._id}
            className="p-6 bg-white border border-gray-200 rounded-lg shadow-lg"
          >
            <h3 className="text-xl font-semibold text-gray-900">
              {event.title}
            </h3>
            <p className="text-gray-600 mt-2">{event.description}</p>
            <p className="mt-2">
              <strong className="text-gray-700">Location:</strong>{" "}
              {event.location}
            </p>
            <p>
              <strong className="text-gray-700">Date:</strong>{" "}
              {new Date(event.date).toLocaleDateString()}
            </p>
            <p className="mt-2 text-blue-600 font-semibold">
              Volunteers Registered: {event.volunteerCount} /{" "}
              {event.volunteersRequired}
            </p>
            {volunteerStatus[event._id] ? (
              <p className="mt-2 text-green-600 font-semibold">
                Registered as {volunteerStatus[event._id]}
              </p>
            ) : event.volunteerCount >= event.volunteersRequired ? (
              <p className="mt-2 text-red-600 font-semibold">
                Volunteer slots are full
              </p>
            ) : (
              <button className="mt-4 px-5 py-2 bg-navyBlue hover:bg-deepBlue text-white font-medium rounded-lg shadow-md">
                Register as Volunteer
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VolunteerPage;
