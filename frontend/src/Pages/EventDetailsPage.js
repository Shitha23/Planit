import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "../axiosConfig";

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`/api/event/${id}`);
        const data = res.data;
        setEvent(data);
        setFormData({
          title: data.title,
          description: data.description,
          needSponsorship: data.needSponsorship || false,
          sponsorshipAmount: data.sponsorshipAmount || "",
          needVolunteers: data.needVolunteers || false,
          volunteersRequired: data.volunteersRequired || "",
        });
      } catch (err) {
        console.error("Error fetching event:", err);
      }
    };

    fetchEvent();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/event/${id}`);
      setShowDeleteModal(false);
      navigate("/events");
    } catch (error) {
      const errMsg = error.response?.data?.error || "Error deleting event.";
      console.error("Error deleting event:", error);
      alert(errMsg);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await axios.put(`/api/event/${id}`, formData);
      setEvent({ ...event, ...formData });
      setEditMode(false);
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  if (!event) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="container mx-auto p-6">
      <nav className="flex text-gray-600 text-sm mb-4">
        <Link to="/" className="hover:text-navyBlue">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/events" className="hover:text-navyBlue">
          Events
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-semibold">{event.title}</span>
      </nav>

      <h2 className="text-2xl font-bold text-navyBlue mb-4">Event Details</h2>

      {editMode ? (
        <div className="bg-white p-6 shadow-lg rounded-xl border border-blueGray">
          <label className="block text-gray-700">Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 mb-2 border border-blueGray rounded-xl"
          />
          <label className="block text-gray-700">Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 mb-2 border border-blueGray rounded-xl"
          />
          <label className="flex items-center mt-3">
            <input
              type="checkbox"
              name="needSponsorship"
              checked={formData.needSponsorship}
              onChange={handleInputChange}
              className="mr-2"
            />
            Needs Sponsorship
          </label>
          {formData.needSponsorship && (
            <input
              type="number"
              name="sponsorshipAmount"
              placeholder="Sponsorship Amount"
              value={formData.sponsorshipAmount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 mb-2 border border-blueGray rounded-xl"
            />
          )}
          <label className="flex items-center mt-3">
            <input
              type="checkbox"
              name="needVolunteers"
              checked={formData.needVolunteers}
              onChange={handleInputChange}
              className="mr-2"
            />
            Needs Volunteers
          </label>
          {formData.needVolunteers && (
            <input
              type="number"
              name="volunteersRequired"
              placeholder="Volunteers Required"
              value={formData.volunteersRequired}
              onChange={handleInputChange}
              className="w-full px-3 py-2 mb-2 border border-blueGray rounded-xl"
            />
          )}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleUpdate}
              className="bg-mediumBlue text-white px-4 py-2 rounded-xl"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 shadow-lg rounded-xl border border-blueGray">
          <h3 className="text-lg font-semibold text-navyBlue">{event.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
          <div className="mt-3 text-sm text-gray-700">
            <p>
              <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
            </p>
            <p>
              <strong>Time:</strong> {event.time}
            </p>
            <p>
              <strong>Location:</strong> {event.location}
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition mr-2"
          >
            Delete Event
          </button>
          <button
            onClick={() => setEditMode(true)}
            className="mt-4 bg-mediumBlue text-white px-4 py-2 rounded-xl"
          >
            Edit Event
          </button>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold text-gray-800">
              Confirm Delete
            </h2>
            <p className="text-gray-600 mt-2">
              Are you sure you want to delete this event?
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailsPage;
