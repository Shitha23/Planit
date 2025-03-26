import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserIcon, MailIcon, PhoneIcon } from "lucide-react";

const VolunteerReviewPage = ({ organizerId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventsAndVolunteers();
  }, []);

  const fetchEventsAndVolunteers = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/organizer/${organizerId}`
      );
      const eventsData = res.data;

      const eventsWithVolunteers = await Promise.all(
        eventsData.map(async (event) => {
          const volRes = await axios.get(
            `http://localhost:5001/api/volunteers/event/${event._id}`
          );
          return { ...event, volunteers: volRes.data };
        })
      );

      setEvents(eventsWithVolunteers);
    } catch (err) {
      console.error("Failed to fetch events and volunteers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (volunteerId, action) => {
    try {
      await axios.put(`http://localhost:5001/api/volunteers/${action}`, {
        volunteerId,
      });
      fetchEventsAndVolunteers();
    } catch (err) {
      console.error(`${action} failed`, err);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  return (
    <div className="p-6 sm:p-10 bg-gray-50 min-h-screen">
      <h2 className="text-4xl font-bold text-navyBlue mb-10 text-center">
        Volunteer Applications
      </h2>

      {events.length === 0 ? (
        <p className="text-gray-500 text-center">No events found.</p>
      ) : (
        events.map((event) => (
          <div
            key={event._id}
            className="mb-12 bg-white rounded-xl shadow-md border p-6"
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
              {event.title}
            </h3>

            {event.volunteers.length === 0 ? (
              <p className="text-gray-500">No volunteers registered yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {event.volunteers.map((v) => (
                  <div
                    key={v._id}
                    className="border p-5 rounded-lg bg-gray-50 hover:bg-white transition shadow-sm text-center"
                  >
                    <div className="space-y-2">
                      <h4 className="text-xl font-semibold text-gray-900 flex justify-center items-center gap-2">
                        <UserIcon size={18} /> {v.user?.name}
                      </h4>
                      <p className="text-sm text-gray-600 flex justify-center items-center gap-1">
                        <MailIcon size={16} /> {v.user?.email}
                      </p>
                      <p className="text-sm text-gray-600 flex justify-center items-center gap-1">
                        <PhoneIcon size={16} /> {v.user?.phone || "N/A"}
                      </p>
                      <p className="text-sm">
                        <strong>Role:</strong>{" "}
                        {v.accessLevel === "Coordinator" ? (
                          <span className="text-green-600 font-semibold">
                            Coordinator
                          </span>
                        ) : (
                          <span className="text-blue-600">Basic</span>
                        )}
                      </p>
                      {v.reasonForCoordinator && (
                        <p className="text-sm text-gray-700">
                          <strong>Reason:</strong> {v.reasonForCoordinator}
                        </p>
                      )}
                    </div>

                    {v.accessLevel !== "Coordinator" &&
                      v.reasonForCoordinator && (
                        <div className="mt-4 flex justify-center gap-4">
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                            onClick={() => handleAction(v._id, "approve")}
                          >
                            Approve
                          </button>
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                            onClick={() => handleAction(v._id, "deny")}
                          >
                            Deny
                          </button>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default VolunteerReviewPage;
