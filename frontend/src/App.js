import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  Outlet,
} from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Modal from "./Components/Modal";
import AdminPage from "./Pages/AdminPage";
import NotificationIcon from "./Components/NotificationIcon";
import AuthForm from "./Components/AuthForm";
import EventDetailsPage from "./Pages/EventDetailsPage";
import Home from "./Pages/Home";
import EventsPage from "./Pages/EventsPage";
import CartPage from "./Pages/CartPage";
import "./App.css";
import BookTicketPage from "./Pages/BookTicketPage";
import TicketAnalysisDashboard from "./Pages/TicketAnalysisDashboard";
import EventDetailsForBooking from "./Pages/EventDetailsForBooking";
import CheckoutPage from "./Pages/CheckoutPage";
import OrganizerQueriesPage from "./Pages/OrganizerQueriesPage";
import OrderSuccessPage from "./Pages/OrderSuccessPage";
import OrganizerQueryDetails from "./Pages/OrganizerQueryDetails";
import VolunteerPage from "./Pages/VolunteerPage";
import SponsorshipPage from "./Pages/SponsorshipPage";
import AccountPage from "./Pages/AccountPage";
import SponsorshipCancelled from "./Pages/SponsorshipCancelled";
import PaymentCancelled from "./Pages/PaymentCancelled";
import AdminOrganizerRequests from "./Pages/AdminOrganizerRequests";
import VolunteerReviewPage from "./Pages/VolunteerReviewPage";
import SponsorshipSuccess from "./Pages/SponsorshipSuccess";
import axios from "./axiosConfig";

const PrivateRoute = ({ requiredRole, userRole }) => {
  if (!userRole || userRole !== requiredRole) {
    return <Navigate to="/" />;
  }
  return <Outlet />;
};

const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [authType, setAuthType] = useState("");
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const storedRole = localStorage.getItem("userRole");

        if (storedRole) {
          setUserRole(storedRole);
        } else {
          try {
            const response = await axios.get(
              `/api/auth/user/${currentUser.uid}`
            );
            const data = await response.json();
            setUserRole(data.role);
            localStorage.setItem("userRole", data.role);
          } catch (error) {
            console.error("Error fetching user role:", error);
            setUserRole("customer");
          }
        }
      } else {
        setUser(null);
        setUserRole(null);
        localStorage.clear();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!loading && userRole) {
      if (userRole === "organizer" && window.location.pathname !== "/events") {
        navigate("/events");
      } else if (
        userRole === "admin" &&
        window.location.pathname !== "/admin"
      ) {
        navigate("/admin");
      }
    }
  }, [userRole, loading]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const openLoginModal = () => {
    setModalTitle("Log In");
    setAuthType("login");
    setIsModalOpen(true);
  };

  const openSignupModal = () => {
    setModalTitle("Sign Up");
    setAuthType("signup");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAuthType("");
    setModalTitle("");
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="App flex flex-col min-h-screen">
      <Header
        onOpenLogin={openLoginModal}
        onOpenSignup={openSignupModal}
        cart={cart}
      />

      <div className="flex-grow">
        {successMessage && (
          <div className="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md transition-opacity duration-300  z-[9999]">
            {successMessage}
            <button
              className="ml-4 text-lg font-bold"
              onClick={() => setSuccessMessage("")}
            >
              ✖
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="fixed bottom-5 right-5 bg-red-500 text-white px-4 py-2 rounded-lg shadow-md transition-opacity duration-300  z-[9999]">
            {errorMessage}
            <button
              className="ml-4 text-lg font-bold"
              onClick={() => setErrorMessage("")}
            >
              ✖
            </button>
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={closeModal} Title={modalTitle}>
          <AuthForm
            type={authType}
            onClose={closeModal}
            setSuccessMessage={setSuccessMessage}
            setErrorMessage={setErrorMessage}
          />
        </Modal>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/book-ticket"
            element={<BookTicketPage cart={cart} setCart={setCart} />}
          />
          <Route path="/account" element={<AccountPage />} />
          <Route path="sponsorship-success" element={<SponsorshipSuccess />} />
          <Route
            path="/sponsorship-cancelled"
            element={<SponsorshipCancelled />}
          />
          <Route
            path="/payment-cancelled"
            element={<PaymentCancelled setCart={setCart} />}
          />
          <Route
            path="/checkout"
            element={<CheckoutPage cart={cart} setCart={setCart} />}
          />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route
            path="/volunteer-event"
            element={<VolunteerPage userId={user?.uid} />}
          />

          <Route path="/sponsor-event" element={<SponsorshipPage />} />
          <Route
            path="/book-ticket/:id"
            element={<EventDetailsForBooking cart={cart} setCart={setCart} />}
          />

          <Route
            path="/cart"
            element={<CartPage cart={cart} setCart={setCart} />}
          />

          <Route
            element={<PrivateRoute requiredRole="admin" userRole={userRole} />}
          >
            <Route path="/admin" element={<AdminPage />} />
            <Route
              path="/admin/organizer-requests"
              element={<AdminOrganizerRequests />}
            />
          </Route>

          <Route
            element={
              <PrivateRoute requiredRole="organizer" userRole={userRole} />
            }
          >
            <Route path="/events" element={<EventsPage />} />
            <Route
              path="/volunteer-review"
              element={<VolunteerReviewPage organizerId={user?.uid} />}
            />
            <Route path="/events/:id" element={<EventDetailsPage />} />
            <Route
              path="/ticket-analysis"
              element={<TicketAnalysisDashboard />}
            />
            <Route
              path="/organizer-queries/:eventId"
              element={<OrganizerQueryDetails />}
            />
            <Route
              path="/customer-queries"
              element={<OrganizerQueriesPage />}
            />
          </Route>
        </Routes>
      </div>
      <Footer onOpenLogin={openLoginModal} onOpenSignup={openSignupModal} />
    </div>
  );
}

export default AppWrapper;
