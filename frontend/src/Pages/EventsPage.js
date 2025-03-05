import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [step, setStep] = useState(1);

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    maxAttendees: "",
    ticketPrice: 0,
    ticketsSold: 0,
    isRecurring: false,
    recurrenceType: "",
    volunteersRequired: 0,
    recurrenceEndDate: "",
    needVolunteers: false,
    needSponsorship: false,
    sponsorshipAmount: 1000,
  });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchEvents(currentUser.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchEvents = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/events?organizerId=${userId}`
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventData({
      ...eventData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateStep = (step) => {
    let newErrors = {};

    if (step === 1) {
      if (!eventData.title.trim() || eventData.title.length < 3) {
        newErrors.title = "Title must be at least 3 characters long";
      }

      if (!eventData.description.trim() || eventData.description.length < 10) {
        newErrors.description =
          "Description must be at least 10 characters long";
      }

      if (!eventData.maxAttendees || eventData.maxAttendees < 1) {
        newErrors.maxAttendees = "Max attendees must be at least 1";
      }
    }

    if (step === 2) {
      if (!eventData.date) {
        newErrors.date = "Date is required";
      } else {
        const today = new Date().toISOString().split("T")[0];
        if (eventData.date < today) {
          newErrors.date = "Date must be today or in the future";
        }
      }

      if (!eventData.time) {
        newErrors.time = "Time is required";
      }

      if (!eventData.location.trim() || eventData.location.length < 3) {
        newErrors.location = "Location must be at least 3 characters long";
      }
    }

    if (step === 3) {
      if (eventData.isRecurring) {
        if (!eventData.recurrenceType) {
          newErrors.recurrenceType = "Please select a recurrence type";
        }
        if (!eventData.recurrenceEndDate) {
          newErrors.recurrenceEndDate = "Please select a recurrence end date";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    try {
      const response = await fetch("http://localhost:5000/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...eventData, organizerId: user.uid }),
      });

      if (!response.ok) throw new Error("Failed to create event");

      const newEvent = await response.json();
      setEvents([...events, newEvent.event]);
      setOpenModal(false);
      setStep(1);
      setEventData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        ticketPrice: "",
        maxAttendees: "",
        ticketsSold: 0,
        isRecurring: false,
        recurrenceType: "",
        recurrenceEndDate: "",
        needVolunteers: false,
        volunteersRequired: 0,
        needSponsorship: false,
        sponsorshipAmount: 1000,
      });
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-extrabold text-navyBlue mb-8">
          My Organized Events
        </h2>
        <button
          onClick={() => setOpenModal(true)}
          className="bg-mediumBlue hover:bg-deepBlue text-white px-4 py-2 rounded-xl"
        >
          Create Event
        </button>
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white shadow-lg rounded-xl p-5 border border-blueGray"
            >
              <h3 className="text-lg font-semibold text-navyBlue">
                {event.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
              <div className="mt-3 text-sm text-gray-700">
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong> {event.time}
                </p>
                <p>
                  <strong>Location:</strong> {event.location}
                </p>
              </div>
              <Link
                to={`/events/${event._id}`}
                className="mt-3 block bg-navyBlue text-white text-center py-2 rounded-xl hover:bg-deepBlue"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No events organized yet.</p>
      )}

      {openModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setOpenModal(false)}
        >
          <div
            className="bg-white p-6 rounded-xl w-96 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-navyBlue mb-4">
              Create New Event
            </h2>

            <div className="flex justify-between border-b pb-2 mb-4">
              {["Basic Info", "Date & Time", "Options"].map((tab, index) => (
                <div
                  key={index}
                  className={`text-sm font-semibold px-2 py-1 rounded ${
                    step === index + 1
                      ? "bg-mediumBlue text-white"
                      : "text-gray-600"
                  }`}
                >
                  {tab}
                </div>
              ))}
            </div>

            {step === 1 && (
              <>
                <input
                  type="text"
                  name="title"
                  placeholder="Event Title"
                  value={eventData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 mb-2 border border-blueGray rounded-xl"
                  required
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title}</p>
                )}

                <textarea
                  name="description"
                  placeholder="Description"
                  value={eventData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 mb-2 border border-blueGray rounded-xl"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}

                <input
                  type="number"
                  name="maxAttendees"
                  placeholder="Max Attendees"
                  value={eventData.maxAttendees}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 mb-2 border border-blueGray rounded-xl"
                  min="1"
                />
                {errors.maxAttendees && (
                  <p className="text-red-500 text-sm">{errors.maxAttendees}</p>
                )}

                <label className="flex items-center">Ticket Price </label>

                <input
                  type="number"
                  name="ticketPrice"
                  placeholder="Ticket Price"
                  value={eventData.ticketPrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 mb-2 border border-blueGray rounded-xl"
                  min="1"
                />
              </>
            )}

            {step === 2 && (
              <>
                <input
                  type="date"
                  name="date"
                  value={eventData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 mb-2 border border-blueGray rounded-xl"
                  required
                />
                {errors.date && (
                  <p className="text-red-500 text-sm">{errors.date}</p>
                )}

                <input
                  type="time"
                  name="time"
                  value={eventData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 mb-2 border border-blueGray rounded-xl"
                  required
                />
                {errors.time && (
                  <p className="text-red-500 text-sm">{errors.time}</p>
                )}

                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={eventData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 mb-2 border border-blueGray rounded-xl"
                  required
                />
                {errors.location && (
                  <p className="text-red-500 text-sm">{errors.location}</p>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={eventData.isRecurring}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Recurring Event
                </label>

                {eventData.isRecurring && (
                  <>
                    <label className="text-sm text-gray-700 mt-2 block">
                      Recurrence Type:
                    </label>
                    <select
                      name="recurrenceType"
                      value={eventData.recurrenceType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 mt-1 border border-blueGray rounded-xl"
                    >
                      <option value="">Select Recurrence Type</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    {errors.recurrenceType && (
                      <p className="text-red-500 text-sm">
                        {errors.recurrenceType}
                      </p>
                    )}

                    <label className="text-sm text-gray-700 mt-2 block">
                      Recurrence End Date:
                    </label>
                    <input
                      type="date"
                      name="recurrenceEndDate"
                      value={eventData.recurrenceEndDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 mt-1 border border-blueGray rounded-xl"
                    />
                    {errors.recurrenceEndDate && (
                      <p className="text-red-500 text-sm">
                        {errors.recurrenceEndDate}
                      </p>
                    )}
                  </>
                )}

                <label className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    name="needVolunteers"
                    checked={eventData.needVolunteers}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Needs Volunteers
                </label>

                {eventData.needVolunteers && (
                  <input
                    type="number"
                    name="volunteersRequired"
                    placeholder="Volunteers Required"
                    value={eventData.volunteersRequired}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 mt-1 border border-blueGray rounded-xl"
                    min="1"
                  />
                )}

                <label className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    name="needSponsorship"
                    checked={eventData.needSponsorship}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Needs Sponsorship
                </label>

                {eventData.needSponsorship && (
                  <input
                    type="number"
                    name="sponsorshipAmount"
                    placeholder="Sponsorship Amount"
                    value={eventData.sponsorshipAmount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 mt-1 border border-blueGray rounded-xl"
                    min="1"
                  />
                )}

                <button
                  onClick={handleSubmit}
                  className="bg-navyBlue text-white px-4 py-2 rounded-xl mt-6"
                >
                  Submit
                </button>
              </>
            )}

            <div className="flex justify-between mt-6">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-xl"
                >
                  Back
                </button>
              )}
              {step < 3 && (
                <button
                  onClick={handleNext}
                  className="bg-mediumBlue text-white px-4 py-2 rounded-xl"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
