import React, { useState, useEffect } from "react";
import axios from "../axiosConfig";

import { useParams, useNavigate } from "react-router-dom";

const OrganizerQueryDetails = () => {
  const { eventId } = useParams();
  const [queries, setQueries] = useState([]);
  const [eventTitle, setEventTitle] = useState("Loading...");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [replyModal, setReplyModal] = useState({
    open: false,
    queryId: null,
    userName: "",
  });
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEventDetails(eventId);
    fetchEventQueries(eventId);
  }, [eventId]);

  const fetchEventDetails = async (eventId) => {
    try {
      const response = await axios.get(`/api/event/${eventId}`);
      setEventTitle(response.data.title);
    } catch (error) {
      console.error("Error fetching event details:", error);
      setEventTitle("Event Queries");
    }
  };

  const fetchEventQueries = async (eventId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/event-queries/${eventId}`);
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
                <th className="px-4 py-2 text-center">Reply</th>
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
                  <td className="px-4 py-2">
                    {query.reply ? (
                      <span className="text-green-600 font-medium">
                        {query.reply}
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          setReplyModal({
                            open: true,
                            queryId: query._id,
                            userName: query.userId?.name || "User",
                          })
                        }
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Reply
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">No queries for this event.</p>
      )}

      {replyModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setReplyModal({ open: false, queryId: null })}
              className="absolute top-2 right-3 text-lg font-bold text-gray-600"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">
              Reply to {replyModal.userName}
            </h2>
            <textarea
              rows="4"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your reply..."
            />
            <div className="flex justify-end mt-4 gap-3">
              <button
                onClick={() => setReplyModal({ open: false, queryId: null })}
                className="px-4 py-2 bg-gray-300 text-black rounded"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    await axios.put(`/api/reply/${replyModal.queryId}`, {
                      reply: replyText,
                    });
                    setReplyModal({ open: false, queryId: null });
                    setReplyText("");
                    fetchEventQueries(eventId);
                  } catch (err) {
                    console.error("Error sending reply:", err);
                  }
                  setSubmitting(false);
                }}
                disabled={submitting || replyText.trim() === ""}
                className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerQueryDetails;
