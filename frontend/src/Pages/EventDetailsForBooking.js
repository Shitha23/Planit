import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaMapMarkerAlt, FaClock, FaRedo, FaUsers } from "react-icons/fa";

const EventDetailsForBooking = ({ addToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`http://localhost:5000/api/event/${id}`)
      .then((res) => res.json())
      .then((data) => setEvent(data))
      .catch((err) => console.error("Error fetching event:", err));
  }, [id]);

  const formatTime = (time) => {
    const [hour, minute] = time.split(":");
    const formattedHour = hour % 12 || 12;
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const handleAddToCart = () => {};

  if (!event) return <p className="text-gray-500 text-center">Loading...</p>;

  return (
    <div className="container mx-auto p-6">
      <nav className="flex text-gray-600 text-sm mb-4">
        <Link to="/" className="hover:text-navyBlue">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/book-ticket" className="hover:text-navyBlue">
          Book Ticket
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-semibold">{event.title}</span>
      </nav>

      <h1 className="text-4xl font-extrabold text-navyBlue mb-6">
        {event.title}
      </h1>

      <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-300 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-lg text-gray-800">
            <FaClock className="text-gray-600" />
            <span>{formatTime(event.time)}</span>
          </div>

          {event.isRecurring && (
            <div className="flex items-center gap-3 text-lg text-gray-800">
              <FaRedo className="text-gray-600" />
              <span>
                {event.recurrenceType} • Ends:{" "}
                {new Date(event.recurrenceEndDate).toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 text-lg text-gray-800">
            <FaMapMarkerAlt className="text-gray-600" />
            <span>{event.location}</span>
          </div>

          <div className="flex items-center gap-3 text-lg text-gray-800">
            <FaUsers className="text-gray-600" />
            <span>
              {event.ticketsSold} / {event.maxAttendees} Attendees
            </span>
          </div>

          <p className="text-xl text-green-600 font-bold">
            ${event.ticketPrice}
          </p>

          <h3 className="text-xl font-semibold text-navyBlue">
            About This Event
          </h3>
          <p className="text-gray-700">{event.description}</p>
        </div>

        <div className="flex flex-col justify-between">
          <div className="flex items-center">
            <span className="text-lg text-gray-800 font-semibold">
              Quantity:
            </span>
            <input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Math.min(2, e.target.value)))
              }
              className="ml-3 w-20 px-3 py-2 border border-gray-300 rounded-xl text-lg text-center"
              min="1"
              max="2"
            />
          </div>

          <button
            onClick={handleAddToCart}
            className="mt-6 bg-mediumBlue hover:bg-deepBlue text-white text-lg font-semibold px-6 py-3 rounded-xl w-full"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsForBooking;
