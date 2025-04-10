import React, { useState, useEffect } from "react";
import { FaTicketAlt, FaUsers, FaHandshake } from "react-icons/fa";
import axios from "axios";
import { Helmet } from "react-helmet";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ReviewSection from "../Components/ReviewSection";

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
  });
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/upcoming");
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
      }
    };

    fetchUpcomingEvents();
  }, []);

  const heroImages = [
    "/Images/event-hero.png",
    "/Images/event-hero2.jpg",
    "/Images/event-hero3.webp",
  ];

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user) return;
        const firebaseId = localStorage.getItem("firebaseId");
        if (!firebaseId) return;

        const response = await axios.get(
          `http://localhost:5001/api/auth/user/${firebaseId}`
        );
        if (response.data) {
          setFormData({
            name: response.data.name || "",
            email: response.data.email || "",
            phone: response.data.phone || "",
            reason: "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user, showModal]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const firebaseId = localStorage.getItem("firebaseId");
    if (!firebaseId) {
      setAlert({
        message: "User not logged in. Please log in first.",
        type: "error",
      });
      setTimeout(() => setAlert({ message: "", type: "" }), 5000);
      return;
    }

    const requestData = {
      userId: firebaseId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      reason: formData.reason,
    };

    try {
      const response = await axios.post(
        "http://localhost:5001/api/organizer-request",
        requestData
      );
      setAlert({ message: response.data.message, type: "success" });
      setTimeout(() => setAlert({ message: "", type: "" }), 5000);
      setShowModal(false);
    } catch (error) {
      setAlert({
        message: error.response?.data?.error || "Failed to submit request.",
        type: "error",
      });
      setTimeout(() => setAlert({ message: "", type: "" }), 5000);
    }
  };

  return (
    <>
      <Helmet>
        <title>Plan It – Discover, Attend & Organize Events</title>
        <meta
          name="description"
          content="Plan It helps you organize, sponsor, and attend events seamlessly. Discover upcoming events, book tickets, volunteer, or become an event organizer today!"
        />
        <meta
          name="keywords"
          content="Plan It, Event Management, Book Tickets, Become Organizer, Volunteer Events, Sponsor Events"
        />
        <meta name="author" content="Plan It Team" />
        <meta
          property="og:title"
          content="Plan It – Discover, Attend & Organize Events"
        />
        <meta
          property="og:description"
          content="Plan It makes it easy to plan, manage, and attend events. Get started today!"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://planit.com/" />
        <meta
          property="og:image"
          content="https://planit.com/Images/event-hero.png"
        />
      </Helmet>

      <div className="bg-white text-gray-900">
        <section className="relative h-[500px] overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            {heroImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Slide ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  currentImage === index ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>

          <div className="absolute inset-0 bg-black bg-opacity-50"></div>

          <div className="relative flex items-center justify-center text-center text-white h-full">
            <div className="p-10 rounded-lg">
              <h1 className="text-4xl font-bold">Welcome to Plan It</h1>
              <p className="mt-3 text-lg">
                Your ultimate platform for organizing, sponsoring, and attending
                events.
              </p>
            </div>
          </div>
        </section>

        {/* Alert Section */}
        {alert.message && (
          <div
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg w-[90%] max-w-md text-center ${
              alert.type === "success"
                ? "bg-green-100 text-green-800 border border-green-400"
                : "bg-red-100 text-red-800 border border-red-400"
            }`}
          >
            {alert.message}
          </div>
        )}

        <section className="py-16 px-6 md:px-20 bg-gradient-to-r from-blue-50 to-gray-100">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-navyBlue">
              Why Choose Plan It?
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              We simplify event management, making it easy for organizers,
              sponsors, and attendees to connect.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white shadow-lg p-6 rounded-lg flex flex-col items-center transition-transform transform hover:scale-105">
              <FaTicketAlt className="text-blue-600 text-5xl" />
              <h3 className="text-xl font-semibold text-navyBlue mt-4">
                Seamless Ticketing
              </h3>
              <p className="text-gray-600 mt-2 text-center">
                Hassle-free ticket sales and registrations with instant
                confirmations.
              </p>
            </div>

            <div className="bg-white shadow-lg p-6 rounded-lg flex flex-col items-center transition-transform transform hover:scale-105">
              <FaUsers className="text-green-600 text-5xl" />
              <h3 className="text-xl font-semibold text-navyBlue mt-4">
                Community Engagement
              </h3>
              <p className="text-gray-600 mt-2 text-center">
                Connect with attendees, receive feedback, and enhance
                experiences.
              </p>
            </div>

            <div className="bg-white shadow-lg p-6 rounded-lg flex flex-col items-center transition-transform transform hover:scale-105">
              <FaHandshake className="text-purple-600 text-5xl" />
              <h3 className="text-xl font-semibold text-navyBlue mt-4">
                Sponsorship Opportunities
              </h3>
              <p className="text-gray-600 mt-2 text-center">
                Get sponsorships easily to make your events successful.
              </p>
            </div>
          </div>
        </section>

        {/* Events Showcase Section */}
        <section className="py-16 px-6 md:px-20 bg-white">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-mediumBlue">
              Events Hosted Through Plan It
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              Plan It helps event organizers list their events, attract
              audiences, and connect with potential sponsors. Here are some of
              the events successfully hosted on our platform.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-gray-200 p-4 rounded-lg shadow-lg">
                <img
                  src="/Images/event1.jpg"
                  alt="Music Fest"
                  className="rounded-lg w-full"
                />
                <h3 className="text-xl font-semibold mt-4">Music Fest 2024</h3>
                <p className="text-sm mt-2 text-gray-700">
                  An electrifying night featuring top artists, live bands, and
                  an immersive music experience for thousands of fans.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Organized by: Rhythm Events | Venue: Los Angeles, CA
                </p>
              </div>
              <div className="bg-gray-200 p-4 rounded-lg shadow-lg">
                <img
                  src="/Images/event2.png"
                  alt="Google Tech Event"
                  className="rounded-lg w-full"
                />
                <h3 className="text-xl font-semibold mt-4">
                  Google Developer Summit
                </h3>
                <p className="text-sm mt-2 text-gray-700">
                  A global tech conference featuring keynotes, workshops, and
                  networking opportunities with Google engineers.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Organized by: Google Developers | Venue: San Francisco, CA
                </p>
              </div>
              <div className="bg-gray-200 p-4 rounded-lg shadow-lg">
                <img
                  src="/Images/event3.jpg"
                  alt="Gaming Expo"
                  className="rounded-lg w-full"
                />
                <h3 className="text-xl font-semibold mt-4">
                  Ultimate Gaming Expo
                </h3>
                <p className="text-sm mt-2 text-gray-700">
                  The biggest gaming convention of the year, showcasing new
                  releases, esports tournaments, and interactive experiences.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Organized by: GameVerse | Venue: New York, NY
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section className="py-16 px-6 md:px-20 bg-gray-50">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-mediumBlue">
              Upcoming Events This Week
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              Don't miss out on these events happening in the coming days!
            </p>

            <div className="mt-8">
              {events.length === 0 ? (
                <p className="text-gray-600 text-lg">
                  No upcoming events this week.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div
                      key={event._id}
                      className="bg-white p-4 rounded-lg shadow-md border"
                    >
                      <h3 className="text-xl font-semibold text-navyBlue">
                        {event.title}
                      </h3>
                      <p className="text-gray-700 mt-2">
                        {event.description || "No description available"}
                      </p>
                      <p className="mt-2 text-gray-600">
                        📍 {event.location} | 🗓{" "}
                        {new Date(event.date).toDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Call-to-Action Section */}
        {user && (
          <section className="py-16 px-6 md:px-20 bg-navyBlue text-white text-center">
            <h2 className="text-3xl font-bold">
              Ready to Create Your Own Event?
            </h2>
            <p className="mt-4 text-lg">
              Join us today and start planning, managing, and promoting events
              with ease.
            </p>
            <button
              className="mt-6 bg-lightBlue text-deepBlue px-6 py-3 rounded-lg text-lg hover:bg-deepBlue hover:text-white"
              onClick={() => setShowModal(true)}
            >
              Get Started
            </button>
          </section>
        )}

        {user && <ReviewSection />}

        {/* Organizer Request Modal */}
        {user && showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">Request Organizer Role</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-100"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-100"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Reason</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
