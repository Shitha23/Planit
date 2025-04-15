import { useState, useEffect } from "react";
import NotificationIcon from "./NotificationIcon";
import { Link } from "react-router-dom";
import axios from "../axiosConfig";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import app from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

const Header = ({ onOpenLogin, onOpenSignup, cart = [] }) => {
  const navigate = useNavigate();
  const [mongoUserId, setMongoUserId] = useState(null);
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

        const storedName =
          localStorage.getItem("userName") || currentUser.displayName || "User";
        setUserName(storedName);

        const storedRole = localStorage.getItem("userRole");

        if (storedRole) {
          setUserRole(storedRole);
        } else {
          try {
            const response = await axios.get(
              `/api/auth/user/${currentUser.uid}`
            );
            const data = response.data;

            setUserRole(data.role);
            localStorage.setItem("userRole", data.role);
          } catch (error) {
            console.error("Error fetching user role:", error);
            setUserRole("customer");
          }
        }
        fetchMongoUserId(currentUser.uid);
      } else {
        setUser(null);
        setUserName("");
        setUserRole("customer");
        localStorage.clear();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchMongoUserId = async (firebaseUid) => {
    try {
      const response = await axios.get(`/api/users/mongo-id/${firebaseUid}`);
      const data = response.data;

      setMongoUserId(data.mongoId);
    } catch (error) {
      console.error("Error fetching MongoDB User ID:", error);
      setMongoUserId(null);
    }
  };

  useEffect(() => {
    const updateUserFromEvent = () => {
      const storedUserName = localStorage.getItem("userName") || "User";
      setUserName((prevUserName) =>
        prevUserName !== storedUserName ? storedUserName : prevUserName
      );
    };

    window.addEventListener("userLoggedIn", updateUserFromEvent);

    return () => {
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

    if (window.location.pathname !== "/") {
      navigate("/", { replace: true });
    }

    setDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-mediumBlue">
          <img
            src="/Images/logo-header.png"
            alt="Plan It"
            className="h-10 mb-1  "
          />
          <div className="mt-1">Plan It</div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 text-sm sm:text-md">
          {userRole === "customer" && (
            <>
              <Link to="/" className="text-mediumBlue hover:text-deepBlue">
                Home
              </Link>
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
              <Link
                to="/volunteer-review"
                className="text-mediumBlue hover:text-deepBlue"
              >
                Volunteer Review
              </Link>
            </>
          )}
          {userRole === "admin" && (
            <>
              <Link to="/admin" className="text-mediumBlue hover:text-deepBlue">
                Users
              </Link>
              <Link
                to="/admin/organizer-requests"
                className="text-mediumBlue hover:text-deepBlue"
              >
                Organizer Requests
              </Link>
            </>
          )}
        </nav>

        {/* Desktop Icons */}
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
                Hi, {user.displayName || "User"}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md py-2 border border-gray-200 z-[9999]">
                  <Link
                    to="/account"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <FaUser className="mr-2" /> Account
                  </Link>
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

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-mediumBlue focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <FaTimes className="text-2xl" />
          ) : (
            <FaBars className="text-2xl" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col items-center p-4 md:hidden z-50 space-y-4">
          <nav className="flex flex-col space-y-4 text-sm sm:text-md items-center">
            {userRole === "customer" && (
              <>
                <Link to="/" className="text-mediumBlue hover:text-deepBlue">
                  Home
                </Link>
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
                <Link
                  to="/volunteer-review"
                  className="text-mediumBlue hover:text-deepBlue"
                >
                  Volunteer Review
                </Link>
              </>
            )}
            {userRole === "admin" && (
              <>
                <Link
                  to="/admin"
                  className="text-mediumBlue hover:text-deepBlue"
                >
                  Users
                </Link>
                <Link
                  to="/admin/organizer-requests"
                  className="text-mediumBlue hover:text-deepBlue"
                >
                  Organizer Requests
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Account Links */}
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
                  Hi, {user.displayName || "User"}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md py-2 border border-gray-200">
                    <Link
                      to="/account"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
                    >
                      <FaUser className="mr-2" /> Account
                    </Link>
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
          </div>
        </div>
      )}
      {user && userRole === "customer" && mongoUserId && (
        <NotificationIcon userId={mongoUserId} />
      )}
    </header>
  );
};

export default Header;
