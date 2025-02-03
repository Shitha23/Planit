import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Footer = ({ onOpenLogin, onOpenSignup }) => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert(`Thank you for subscribing, ${email}!`);
    setEmail("");
  };

  return (
    <footer className="bg-navyBlue text-white py-8 mt-10">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-6 md:mb-0">
          <img
            src="/Images/logo-footer.png"
            alt="Company Logo"
            className="h-20 mr-2"
          />
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
