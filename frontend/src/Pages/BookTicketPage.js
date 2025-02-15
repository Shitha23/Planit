import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaClock, FaRedo } from "react-icons/fa";

const BookTicketPage = ({ addToCart }) => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [onlyRecurring, setOnlyRecurring] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/ticketevents")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  const formatTime = (time) => {
    const [hour, minute] = time.split(":");
    const formattedHour = hour % 12 || 12;
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isUpcoming = eventDate >= today;
    const isRecurringOngoing =
      event.isRecurring && new Date(event.recurrenceEndDate) >= today;

    return (
      (isUpcoming || isRecurringOngoing) &&
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      event.ticketPrice >= priceRange[0] &&
      event.ticketPrice <= priceRange[1] &&
      (!onlyRecurring || event.isRecurring)
    );
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-navyBlue mb-8">
        Book Your Ticket
      </h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-100 p-4 rounded-lg shadow-md mb-6">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/3 px-3 py-2 border border-gray-300 rounded-lg"
        />

        <div className="flex items-center gap-2 w-full sm:w-1/3">
          <span className="text-gray-700">Price:</span>
          <input
            type="number"
            min="0"
            max="1000"
            value={priceRange[0]}
            onChange={(e) =>
              setPriceRange([parseInt(e.target.value), priceRange[1]])
            }
            className="w-1/3 px-2 py-1 border border-gray-300 rounded-lg"
          />
          <span>-</span>
          <input
            type="number"
            min="0"
            max="1000"
            value={priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], parseInt(e.target.value)])
            }
            className="w-1/3 px-2 py-1 border border-gray-300 rounded-lg"
          />
        </div>

        <label className="flex items-center gap-2 text-gray-700">
          <input
            type="checkbox"
            checked={onlyRecurring}
            onChange={(e) => setOnlyRecurring(e.target.checked)}
            className="w-4 h-4"
          />
          Recurring Events
        </label>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              className="bg-gray-100 shadow-md rounded-lg overflow-hidden border border-gray-300 p-5 flex flex-col justify-between h-[296px]"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold text-navyBlue">
                    {event.title}
                  </h2>
                  <span className="text-lg text-gray-600">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>

                <hr className="border-gray-400 my-2" />

                <div className="text-gray-700 text-lg space-y-1">
                  <div className="flex items-center gap-2">
                    <FaClock className="text-gray-600" />
                    <span>{formatTime(event.time)}</span>
                  </div>
                  {event.isRecurring && (
                    <div className="flex items-center gap-2">
                      <FaRedo className="text-gray-600" />
                      <span>
                        {event.recurrenceType} • Ends:{" "}
                        {new Date(event.recurrenceEndDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-600" />
                    <span>{event.location}</span>
                  </div>
                  <p className="text-green-600 font-bold">
                    ${event.ticketPrice}
                  </p>
                </div>
              </div>

              <div className="flex justify-between gap-4 mt-4">
                <Link
                  to={`/book-ticket/${event._id}`}
                  className="bg-navyBlue hover:bg-deepBlue text-white text-sm font-semibold py-2 px-4 rounded-md w-1/2 text-center"
                >
                  View Details
                </Link>
                <button
                  onClick={() => addToCart(event)}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-4 rounded-md w-1/2"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-lg text-center">
          No upcoming events available.
        </p>
      )}
    </div>
  );
};

export default BookTicketPage;
