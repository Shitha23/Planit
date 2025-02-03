import React from "react";

const Home = () => {
  return (
    <div className="bg-white text-gray-900">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center h-[500px] flex items-center justify-center text-center text-white"
        style={{ backgroundImage: "url('/Images/event-hero.png')" }}
      >
        <div className="bg-black bg-opacity-50 p-10 rounded-lg">
          <h1 className="text-4xl font-bold">Welcome to Plan It</h1>
          <p className="mt-3 text-lg">
            Your ultimate platform for organizing, sponsoring, and attending
            events.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-6 md:px-20 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-navyBlue">
            Why Choose Plan It?
          </h2>
          <p className="mt-4 text-lg">
            We simplify event management, making it easy for organizers,
            sponsors, and attendees to connect. From ticketing to sponsorship,
            Plan It has got you covered.
          </p>
        </div>
      </section>

      {/* Events Showcase Section */}
      <section className="py-16 px-6 md:px-20 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-mediumBlue">
            Events Hosted Through Plan It
          </h2>
          <p className="mt-4 text-lg text-gray-700">
            Plan It helps event organizers list their events, attract audiences,
            and connect with potential sponsors. Here are some of the events
            successfully hosted on our platform.
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
                An electrifying night featuring top artists, live bands, and an
                immersive music experience for thousands of fans.
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

      {/* Call-to-Action Section */}
      <section className="py-16 px-6 md:px-20 bg-navyBlue text-white text-center">
        <h2 className="text-3xl font-bold">Ready to Create Your Own Event?</h2>
        <p className="mt-4 text-lg">
          Join us today and start planning, managing, and promoting events with
          ease.
        </p>
        <button className="mt-6 bg-lightBlue text-deepBlue px-6 py-3 rounded-lg text-lg hover:bg-deepBlue hover:text-white">
          Get Started
        </button>
      </section>
    </div>
  );
};

export default Home;
