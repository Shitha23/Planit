import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const Header = ({ onOpenLogin, onOpenSignup }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
  };

  return (
    <header className="bg-white shadow-lg p-4">
      <div className="container mx-auto flex justify-between items-center relative">
        <div className="flex items-center">
          <img
            src="/Images/logo-header.png"
            alt="Company Logo"
            className="h-10 rounded-full mr-2"
          />
          <span className="text-navyBlue font-bold text-l">Plan It</span>
        </div>

        {user && (
          <nav className="absolute left-1/2 transform -translate-x-1/2 space-x-8">
            <a href="#" className="text-mediumBlue hover:text-deepBlue">
              Home
            </a>
            <a href="#" className="text-mediumBlue hover:text-deepBlue">
              Book Ticket
            </a>
            <a href="#" className="text-mediumBlue hover:text-deepBlue">
              Volunteer an Event
            </a>
            <a href="#" className="text-mediumBlue hover:text-deepBlue">
              Sponsor an Event
            </a>
          </nav>
        )}

        <nav className="space-x-4 flex items-center">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-red-500">{user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onOpenLogin}
                className="bg-mediumBlue text-white py-2 px-4 rounded-lg hover:bg-deepBlue"
              >
                Login
              </button>
              <button
                onClick={onOpenSignup}
                className="bg-navyBlue text-white py-2 px-4 rounded-lg hover:bg-deepBlue"
              >
                Signup
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
