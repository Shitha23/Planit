import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const OrganizerQueryDetails = () => {
  const { eventId } = useParams();
  const [queries, setQueries] = useState([]);
  const [eventTitle, setEventTitle] = useState("Loading...");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEventDetails(eventId);
    fetchEventQueries(eventId);
  }, [eventId]);

  const fetchEventDetails = async (eventId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/event/${eventId}`
      );
      setEventTitle(response.data.title);
    } catch (error) {
      console.error("Error fetching event details:", error);
      setEventTitle("Event Queries");
    }
  };

  const fetchEventQueries = async (eventId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/event-queries/${eventId}`
      );
      setQueries(response.data);
    } catch (error) {
      console.error("Error fetching event queries:", error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-left">
        <button
          className="mb-4 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
          onClick={() => navigate(-1)}
        >
          Return{" "}
        </button>
      </div>

      <h2 className="text-4xl font-extrabold text-navyBlue mb-8">
        {eventTitle} - Queries
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading queries...</p>
      ) : queries.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-2 text-center">#</th>
                <th className="px-4 py-2 text-left">User Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Query</th>
                <th className="px-4 py-2 text-center">Date</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((query, index) => (
                <tr
                  key={query._id}
                  className={`border-b ${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  } text-center`}
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2 text-left">
                    {query.userId?.name || "Unknown"}
                  </td>
                  <td className="px-4 py-2 text-left">{query.email}</td>
                  <td className="px-4 py-2 text-left">{query.query}</td>
                  <td className="px-4 py-2 text-center">
                    {new Date(query.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">No queries for this event.</p>
      )}
    </div>
  );
};

export default OrganizerQueryDetails;
