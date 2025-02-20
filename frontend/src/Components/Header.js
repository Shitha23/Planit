import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { FaShoppingCart, FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import app from "../firebaseConfig";

const Header = ({ onOpenLogin, onOpenSignup, cart = [] }) => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || ""
  );
  const [userRole, setUserRole] = useState(
    localStorage.getItem("userRole") || "customer"
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    localStorage.removeItem("firebaseId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    setDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-lg p-4 w-full">
      <div className="container mx-auto flex justify-between items-center relative">
        <div className="flex items-center">
          <img
            src="/Images/logo-header.png"
            alt="Company Logo"
            className="h-10 rounded-full mr-2"
          />
          <span className="text-navyBlue font-bold text-lg">Plan It</span>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-mediumBlue text-2xl"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav className="hidden md:flex space-x-6 text-sm sm:text-md">
          <Link to="/" className="text-mediumBlue hover:text-deepBlue">
            Home
          </Link>
          {userRole === "customer" && (
            <>
              <Link
                to="/book-ticket"
                className="text-mediumBlue hover:text-deepBlue"
              >
                Book Ticket
              </Link>
              <Link
                to="/volunteer-event"
                className="text-mediumBlue hover:text-deepBlue"
              >
                Volunteer an Event
              </Link>
              <Link
                to="/sponsor-event"
                className="text-mediumBlue hover:text-deepBlue"
              >
                Sponsor an Event
              </Link>
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
              <Link
                to="/ticket-analysis"
                className="text-mediumBlue hover:text-deepBlue"
              >
                Ticket Analysis
              </Link>
              <Link
                to="/customer-queries"
                className="text-mediumBlue hover:text-deepBlue"
              >
                Customer Queries
              </Link>
            </>
          )}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {userRole === "customer" && (
            <Link
              to="/cart"
              className="relative flex items-center text-mediumBlue hover:text-deepBlue"
            >
              <FaShoppingCart className="text-xl" />
              {Array.isArray(cart) && cart.length > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center px-4 py-2 text-black font-medium border border-red-500 rounded-full hover:bg-red-100"
              >
                Hi, {userName}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white shadow-md rounded-md py-2 border border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 w-full"
                  >
                    <FaSignOutAlt className="mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
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
            </div>
          )}
        </div>

        {menuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col items-center p-4 md:hidden z-50 space-y-4">
            <nav className="flex flex-col space-y-4 text-sm sm:text-md items-center">
              <Link to="/" className="text-mediumBlue hover:text-deepBlue">
                Home
              </Link>
              {userRole === "customer" && (
                <>
                  <Link
                    to="/book-ticket"
                    className="text-mediumBlue hover:text-deepBlue"
                  >
                    Book Ticket
                  </Link>
                  <Link
                    to="/volunteer-event"
                    className="text-mediumBlue hover:text-deepBlue"
                  >
                    Volunteer an Event
                  </Link>
                  <Link
                    to="/sponsor-event"
                    className="text-mediumBlue hover:text-deepBlue"
                  >
                    Sponsor an Event
                  </Link>
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
                  <Link
                    to="/ticket-analysis"
                    className="text-mediumBlue hover:text-deepBlue"
                  >
                    Ticket Analysis
                  </Link>
                  <Link
                    to="/customer-queries"
                    className="text-mediumBlue hover:text-deepBlue"
                  >
                    Customer Queries
                  </Link>
                </>
              )}
            </nav>

            <div className="flex flex-col items-center space-y-4">
              {userRole === "customer" && (
                <Link
                  to="/cart"
                  className="relative flex items-center text-mediumBlue hover:text-deepBlue"
                >
                  <FaShoppingCart className="text-xl" />
                  {Array.isArray(cart) && cart.length > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {cart.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  )}
                </Link>
              )}

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center px-4 py-2 text-black font-medium border border-red-500 rounded-full hover:bg-red-100"
                  >
                    Hi, {userName}
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-36 bg-white shadow-md rounded-md py-2 border border-gray-200">
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 w-full"
                      >
                        <FaSignOutAlt className="mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
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
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
