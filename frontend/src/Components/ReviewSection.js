import React, { useState, useEffect } from "react";
import axios from "../axiosConfig";

import { FaStar } from "react-icons/fa";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ReviewSection = () => {
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({ name: "", rating: 0, review: "" });
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get("/api/reviews");
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAlert({
        message: "You must be logged in to submit a review.",
        type: "error",
      });
      return;
    }

    if (formData.rating < 1) {
      setAlert({ message: "Please select a star rating.", type: "error" });
      return;
    }

    const reviewData = {
      name: formData.name || "Anonymous",
      rating: formData.rating,
      review: formData.review,
    };

    try {
      const response = await axios.post("/api/reviews", reviewData);
      setReviews([...reviews, response.data]);
      setFormData({ ...formData, name: "", rating: 0, review: "" });
      setAlert({ message: "Review submitted successfully!", type: "success" });
      setTimeout(() => setAlert({ message: "", type: "" }), 3000);
    } catch (error) {
      setAlert({ message: "Failed to submit review.", type: "error" });
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <section className="py-16 px-6 md:px-20 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-navyBlue">User Reviews</h2>
        <p className="mt-2 text-lg text-gray-700">
          See what others say about Plan It.
        </p>
      </div>

      {alert.message && (
        <div
          className={`mt-4 max-w-md mx-auto px-4 py-2 rounded-md text-center ${
            alert.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {alert.message}
        </div>
      )}

      <div className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
        <h3 className="text-xl font-semibold text-navyBlue">Leave a Review</h3>
        <form onSubmit={handleSubmit} className="mt-4">
          <input
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded mb-4 bg-gray-100"
          />

          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`cursor-pointer text-2xl ${
                  star <= formData.rating ? "text-yellow-500" : "text-gray-300"
                }`}
                onClick={() => setFormData({ ...formData, rating: star })}
              />
            ))}
          </div>

          <textarea
            placeholder="Write your review..."
            value={formData.review}
            onChange={(e) =>
              setFormData({ ...formData, review: e.target.value })
            }
            className="w-full p-2 border rounded mt-4"
            required
          />

          <button
            type="submit"
            className={`mt-4 px-4 py-2 rounded ${
              isAuthenticated
                ? "bg-blue-600 text-white"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
            disabled={!isAuthenticated}
          >
            Submit Review
          </button>
        </form>
      </div>

      <div className="max-w-3xl mx-auto mt-8">
        <h3 className="text-xl font-semibold text-navyBlue text-center">
          Recent Reviews
        </h3>
        {reviews.length === 0 ? (
          <p className="text-gray-600 text-center mt-4">
            No reviews yet. Be the first to review!
          </p>
        ) : (
          <div className="mt-6 space-y-6">
            {reviews.map((review, index) => (
              <div key={index} className="bg-white p-4 shadow-md rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-navyBlue">
                    {review.name}
                  </h4>
                  <span className="text-gray-500 text-sm">
                    {formatDate(review.createdAt)}
                  </span>
                </div>

                <div className="flex mt-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={
                        i < review.rating ? "text-yellow-500" : "text-gray-300"
                      }
                    />
                  ))}
                </div>

                <p className="text-gray-700 mt-2">{review.review}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewSection;
