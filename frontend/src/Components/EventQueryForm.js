import { useState, useEffect } from "react";
import axios from "axios";

const EventQueryForm = ({ eventId }) => {
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const firebaseId = localStorage.getItem("firebaseId");
    if (firebaseId) {
      fetchUserDetails(firebaseId);
    }
  }, []);

  const fetchUserDetails = async (firebaseId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/auth/user/${firebaseId}`
      );
      setEmail(response.data.email || "");
    } catch (error) {
      console.error("Error fetching user details:", error);
      setErrorMessage("Error fetching user details.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/event-queries",
        {
          eventId,
          email,
          query,
        }
      );

      if (response.status !== 201) throw new Error("Failed to submit query");

      setSuccessMessage("Your query has been submitted successfully!");
      setQuery("");
    } catch (error) {
      console.error("Query submission error:", error);
      setErrorMessage("Error submitting query. Please try again later.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-3">
      <h3 className="text-lg font-semibold mb-4">
        Have questions for this event? Ask here, and a representative will get
        back to you soon.
      </h3>
      {successMessage && <p className="text-green-600">{successMessage}</p>}
      {errorMessage && <p className="text-red-600">{errorMessage}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          className="w-full p-2 border rounded-lg"
          placeholder="Your Email"
          value={email}
          readOnly
          required
        />
        <textarea
          className="w-full p-2 border rounded-lg"
          placeholder="Enter your question here..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        ></textarea>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Submit Query
        </button>
      </form>
    </div>
  );
};

export default EventQueryForm;
