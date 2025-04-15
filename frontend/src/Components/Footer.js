import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import axios from "../axiosConfig";

const Footer = ({ onOpenLogin, onOpenSignup }) => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/newsletter/subscribe", { email });
      const data = response.data;

      setAlert({ message: data.message, type: "success" });
      setEmail("");
    } catch (error) {
      setAlert({
        message:
          error.response?.data?.error ||
          "Failed to subscribe. Please try again.",
        type: "error",
      });
    }

    setTimeout(() => setAlert({ message: "", type: "" }), 4000);
  };

  return (
    <footer className="bg-navyBlue text-white py-8 mt-10">
      {alert.message && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg transition-opacity duration-500 ${
            alert.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <div className="flex items-center justify-between space-x-4">
            <span>{alert.message}</span>
            <button
              onClick={() => setAlert({ message: "", type: "" })}
              className="text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex flex-col items-center mb-6 md:mb-0">
          <img
            src="/Images/logo-footer.png"
            alt="Company Logo"
            className="h-20 mb-2"
          />
          <div className="flex space-x-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-lightBlue"
            >
              <FaFacebookF size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-lightBlue"
            >
              <FaTwitter size={20} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-lightBlue"
            >
              <FaInstagram size={20} />
            </a>
          </div>
        </div>

        {!user ? (
          <div className="flex space-x-6">
            <span
              onClick={onOpenLogin}
              className="text-lightBlue cursor-pointer hover:underline"
            >
              Login
            </span>
            <span
              onClick={onOpenSignup}
              className="text-lightBlue cursor-pointer hover:underline"
            >
              Signup
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-lg mb-2">
              Subscribe to get updates on the latest events!
            </p>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="p-2 rounded-lg text-black w-64 md:w-auto"
              />
              <button
                type="submit"
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                Subscribe
              </button>
            </form>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
