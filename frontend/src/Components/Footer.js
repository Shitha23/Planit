import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

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
      const response = await fetch(
        "http://localhost:5001/api/newsletter/subscribe",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setAlert({ message: data.message, type: "success" });
        setEmail("");
      } else {
        setAlert({ message: data.error, type: "error" });
      }
    } catch (error) {
      setAlert({
        message: "Failed to subscribe. Please try again.",
        type: "error",
      });
    }

    setTimeout(() => setAlert({ message: "", type: "" }), 4000);
  };

  return (
    <footer className="bg-navyBlue text-white py-8 mt-10">
      {alert.message && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg w-[90%] max-w-md text-center ${
            alert.type === "success"
              ? "bg-green-100 text-green-800 border border-green-400"
              : "bg-red-100 text-red-800 border border-red-400"
          }`}
        >
          {alert.message}
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

