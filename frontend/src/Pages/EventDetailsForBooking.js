import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaClock,
  FaRedo,
  FaUsers,
  FaShoppingCart,
} from "react-icons/fa";

const EventDetailsForBooking = ({ cart, setCart }) => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [alert, setAlert] = useState(null);

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

  const handleAddToCart = () => {
    if (!event || !event.eventInstanceId) return;

    let newCart = [...cart];
    const existingItem = newCart.find(
      (item) =>
        item._id === event._id && item.eventInstanceId === event.eventInstanceId
    );

    if (existingItem) {
      if (existingItem.quantity >= 2) {
        setAlert({
          type: "error",
          message: "Max 2 tickets allowed per event instance!",
        });
        return;
      }
      newCart = newCart.map((item) =>
        item._id === event._id && item.eventInstanceId === event.eventInstanceId
          ? { ...item, quantity: Math.min(item.quantity + quantity, 2) }
          : item
      );
    } else {
      newCart.push({
        ...event,
        eventInstanceId: event.eventInstanceId,
        quantity,
      });
    }

    setCart(newCart);
    setAlert({ type: "success", message: "Tickets added to cart!" });
    setTimeout(() => setAlert(null), 3000);
  };

  if (!event) return <p className="text-gray-500 text-center">Loading...</p>;

  return (
    <div className="container mx-auto p-6">
      {alert && (
        <div
          className={`fixed bottom-5 right-5 px-4 py-2 rounded-md shadow-md ${
            alert.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {alert.message}
        </div>
      )}

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
          <div className="flex items-center gap-4">
            <span className="text-lg text-gray-800 font-semibold">
              Quantity:
            </span>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="bg-gray-300 px-3 py-1 rounded-lg"
            >
              -
            </button>
            <span className="text-lg">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(2, quantity + 1))}
              className="bg-gray-300 px-3 py-1 rounded-lg"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className="mt-6 bg-mediumBlue hover:bg-deepBlue text-white text-lg font-semibold px-6 py-3 rounded-xl flex items-center gap-2 justify-center"
          >
            <FaShoppingCart /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsForBooking;
