import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const OrganizerQueriesPage = () => {
  const [events, setEvents] = useState([]);
  const [organizerId, setOrganizerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setOrganizerId(user.uid);
        fetchOrganizerEvents(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchOrganizerEvents = async (id) => {
    try {
      if (!id) return;
      const response = await axios.get(
        `http://localhost:5001/api/organizer-events/${id}`
      );
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching organizer events:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-4xl font-extrabold text-navyBlue mb-8">
        Event Queries
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : organizerId ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event._id}
                className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {event.title}
                </h3>
                <p className="text-gray-600 mt-2">
                  <strong>Queries:</strong> {event.queryCount}
                </p>
                <button
                  type="button"
                  className="mt-3 w-full bg-navyBlue text-white text-center py-2 rounded-xl hover:bg-deepBlue transition duration-300 ease-in-out shadow-md"
                  onClick={() => navigate(`/organizer-queries/${event._id}`)}
                >
                  View Queries
                </button>
              </div>
            ))
          ) : (
            <p className="text-center col-span-full text-gray-500">
              No events found.
            </p>
          )}
        </div>
      ) : (
        <p className="text-center text-red-500">
          No user found. Please log in.
        </p>
      )}
    </div>
  );
};

export default OrganizerQueriesPage;
