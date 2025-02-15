import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetch(`http://localhost:5000/api/event/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
        setFormData({
          title: data.title,
          description: data.description,
          needSponsorship: data.needSponsorship || false,
          sponsorshipAmount: data.sponsorshipAmount || "",
          needVolunteers: data.needVolunteers || false,
          volunteersRequired: data.volunteersRequired || "",
        });
      })
      .catch((err) => console.error("Error fetching event:", err));
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/event/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update event");
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
            <p>
              <strong>Needs Sponsorship:</strong>{" "}
              {event.needSponsorship
                ? `Yes ($${event.sponsorshipAmount})`
                : "No"}
            </p>
            <p>
              <strong>Needs Volunteers:</strong>{" "}
              {event.needVolunteers
                ? `Yes (${event.volunteersRequired})`
                : "No"}
            </p>
          </div>
          <button
            onClick={() => setEditMode(true)}
            className="mt-4 bg-mediumBlue text-white px-4 py-2 rounded-xl"
          >
            Edit Event
          </button>
        </div>
      )}
    </div>
  );
};

export default EventDetailsPage;
