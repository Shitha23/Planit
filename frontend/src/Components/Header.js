import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import app from "../firebaseConfig";

const Header = ({ onOpenLogin, onOpenSignup }) => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || ""
  );
  const [userRole, setUserRole] = useState(
    localStorage.getItem("userRole") || "customer"
  );

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserName(localStorage.getItem("userName") || "User");

        try {
          const response = await fetch(
            `http://localhost:5000/api/auth/user/${currentUser.uid}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch role");
          }
          const data = await response.json();
          setUserRole(data.role);
          localStorage.setItem("userRole", data.role);
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole("customer");
        }
      } else {
        setUser(null);
        setUserName("");
        setUserRole("customer");
        localStorage.removeItem("userRole");
      }
    });

    const updateUserFromEvent = () => {
      setUserName(localStorage.getItem("userName") || "User");
    };
    window.addEventListener("userLoggedIn", updateUserFromEvent);

    return () => {
      unsubscribe();
      window.removeEventListener("userLoggedIn", updateUserFromEvent);
    };
  }, []);

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    setUser(null);
    setUserName("");
    setUserRole("customer");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
  };

  return (
    <header className="bg-white shadow-lg p-4 w-full">
      <div className="container mx-auto flex flex-wrap justify-between items-center relative">
        <div className="flex items-center">
          <img
            src="/Images/logo-header.png"
            alt="Company Logo"
            className="h-10 rounded-full mr-2"
          />
          <span className="text-navyBlue font-bold text-sm sm:text-lg">
            Plan It
          </span>
        </div>

        {user && (
          <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-4 text-sm sm:text-md">
            <a href="/" className="text-mediumBlue hover:text-deepBlue">
              Home
            </a>

            {userRole === "customer" && (
              <>
                <a href="#" className="text-mediumBlue hover:text-deepBlue">
                  Book Ticket
                </a>
                <a href="#" className="text-mediumBlue hover:text-deepBlue">
                  Volunteer an Event
                </a>
                <a href="#" className="text-mediumBlue hover:text-deepBlue">
                  Sponsor an Event
                </a>
              </>
            )}
            {userRole === "organizer" && (
              <>
                <Link
                  to="/events"
                  className="text-mediumBlue hover:text-deepBlue"
                >
                  Organize Event
                </Link>
                <a href="#" className="text-mediumBlue hover:text-deepBlue">
                  Ticket Analysis
                </a>
                <a href="#" className="text-mediumBlue hover:text-deepBlue">
                  Customer Queries
                </a>
              </>
            )}
          </nav>
        )}

        <nav className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-black font-medium text-sm sm:text-md">
                Welcome, {userName}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white text-xs sm:text-sm py-2 px-3 sm:px-4 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onOpenLogin}
                className="bg-mediumBlue text-white text-xs sm:text-sm py-2 px-3 sm:px-4 rounded-lg hover:bg-deepBlue"
              >
                Login
              </button>
              <button
                onClick={onOpenSignup}
                className="bg-navyBlue text-white text-xs sm:text-sm py-2 px-3 sm:px-4 rounded-lg hover:bg-deepBlue"
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
