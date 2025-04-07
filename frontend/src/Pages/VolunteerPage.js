import React, { useEffect, useState } from "react";
import axios from "axios";

const VolunteerPage = ({ userId }) => {
  const [events, setEvents] = useState([]);
  const [volunteerStatus, setVolunteerStatus] = useState({});
  const [userDetails, setUserDetails] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [viewInfoEvent, setViewInfoEvent] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    if (!userId) return;

    axios
      .get("http://localhost:5001/api/events/need-volunteers")
      .then((res) => setEvents(res.data));

    axios
      .get(`http://localhost:5001/api/volunteers/user/${userId}`)
      .then((res) => {
        const status = res.data.reduce((acc, vol) => {
          acc[vol.eventId._id || vol.eventId] = vol.accessLevel;
          return acc;
        }, {});
        setVolunteerStatus(status);
      });

    axios
      .get(`http://localhost:5001/api/auth/user/${userId}`)
      .then((res) => setUserDetails(res.data));
  }, [userId]);

  const handleRegister = async () => {
    try {
      const payload = {
        eventId: selectedEvent._id,
        userId: userId,
        reason: reason,
      };

      await axios.post(
        "http://localhost:5001/api/volunteers/register",
        payload
      );

      setVolunteerStatus((prev) => ({
        ...prev,
        [selectedEvent._id]: "Basic",
      }));

      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === selectedEvent._id
            ? { ...ev, volunteerCount: ev.volunteerCount + 1 }
            : ev
        )
      );

      setShowModal(false);
      setReason("");
      setSuccessMessage("Successfully registered as a volunteer!");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  if (!userId) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <p className="text-lg text-gray-600">
          Please log in to view volunteer opportunities.
        </p>
      </div>
    );
  }

  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.date) >= now);
  const pastEvents = events.filter((e) => new Date(e.date) < now);

  const renderEventCard = (event, isPast = false) => {
    const isRegistered = !!volunteerStatus[event._id];
    const userRole = volunteerStatus[event._id];

    return (
      <div
        key={event._id}
        className="p-6 bg-white border border-gray-200 rounded-lg shadow-lg"
      >
        <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
        <p className="text-gray-600 mt-2">{event.description}</p>
        <p className="mt-2">
          <strong className="text-gray-700">Location:</strong> {event.location}
        </p>
        <p>
          <strong className="text-gray-700">Date:</strong>{" "}
          {new Date(event.date).toLocaleDateString()}
        </p>
        <p className="mt-2 text-blue-600 font-semibold">
          Volunteers Registered: {event.volunteerCount} /{" "}
          {event.volunteersRequired}
        </p>

        {isRegistered ? (
          <>
            <p className="mt-2 text-green-600 font-semibold">
              Registered as {userRole}
            </p>
            <button
              className="mt-2 px-4 py-1 bg-indigo-600 text-white rounded shadow"
              onClick={() => {
                setViewInfoEvent(event);
                setShowInfoModal(true);
              }}
            >
              View Volunteer Info
            </button>
          </>
        ) : !isPast && event.volunteerCount < event.volunteersRequired ? (
          <button
            className="mt-4 px-5 py-2 bg-navyBlue hover:bg-deepBlue text-white font-medium rounded-lg shadow-md"
            onClick={() => {
              setSelectedEvent(event);
              setShowModal(true);
            }}
          >
            Register as Volunteer
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen relative">
      <h2 className="text-4xl font-extrabold text-navyBlue mb-8">
        Volunteer Dashboard
      </h2>

      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {successMessage}
          <button
            className="ml-3 font-bold"
            onClick={() => setSuccessMessage("")}
          >
            ✕
          </button>
        </div>
      )}

      <h3 className="text-2xl font-bold mb-4">
        Upcoming Volunteer Opportunities
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {upcomingEvents.map((event) => renderEventCard(event))}
      </div>

      <h3 className="text-2xl font-bold mb-4">Past Events</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pastEvents.map((event) => renderEventCard(event, true))}
      </div>

      {showModal && selectedEvent && userDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Registration</h2>
            <p>
              Name: <strong>{userDetails.name}</strong>
            </p>
            <p>
              Email: <strong>{userDetails.email}</strong>
            </p>
            <p>
              Phone: <strong>{userDetails.phone || "N/A"}</strong>
            </p>
            <p>
              Event: <strong>{selectedEvent.title}</strong>
            </p>
            <p>
              Date:{" "}
              <strong>
                {new Date(selectedEvent.date).toLocaleDateString()} @{" "}
                {new Date(selectedEvent.date).toLocaleTimeString()}
              </strong>
            </p>

            <p className="mt-4 font-semibold">Want to become a Coordinator?</p>
            <textarea
              className="w-full mt-2 p-2 border rounded"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Your reason for applying as a coordinator..."
            ></textarea>

            <div className="mt-6 flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 text-black rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={handleRegister}
              >
                Confirm Register
              </button>
            </div>
          </div>
        </div>
      )}

      {showInfoModal && viewInfoEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-700 text-xl font-bold"
              onClick={() => setShowInfoModal(false)}
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4">Volunteer Info</h2>
            <p>
              Event: <strong>{viewInfoEvent.title}</strong>
            </p>
            <p>
              Date:{" "}
              <strong>
                {new Date(viewInfoEvent.date).toLocaleDateString()} @{" "}
                {new Date(viewInfoEvent.date).toLocaleTimeString()}
              </strong>
            </p>
            <p>
              Role: <strong>{volunteerStatus[viewInfoEvent._id]}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerPage;
