import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Modal from "./Components/Modal";
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

const PrivateRoute = ({ requiredRole }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const response = await fetch(
            `http://localhost:5000/api/auth/user/${currentUser.uid}`
          );
          const data = await response.json();
          setUserRole(data.role);
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (!user || userRole !== requiredRole) return <Navigate to="/" />;
  return <Outlet />;
};

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [authType, setAuthType] = useState("");
  const [cart, setCart] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  return (
    <Router>
      <div className="App flex flex-col min-h-screen">
        <Header
          onOpenLogin={openLoginModal}
          onOpenSignup={openSignupModal}
          cart={cart}
        />

        <div className="flex-grow">
          {successMessage && (
            <div className="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md transition-opacity duration-300">
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
            <div className="fixed top-5 right-5 bg-red-500 text-white px-4 py-2 rounded-lg shadow-md transition-opacity duration-300">
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
            <Route
              path="/checkout"
              element={<CheckoutPage cart={cart} setCart={setCart} />}
            />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route
              path="/customer-queries"
              element={<OrganizerQueriesPage />}
            />
            <Route
              path="/organizer-queries/:eventId"
              element={<OrganizerQueryDetails />}
            />
            <Route
              path="/book-ticket/:id"
              element={<EventDetailsForBooking cart={cart} setCart={setCart} />}
            />
            <Route
              path="/ticket-analysis"
              element={<TicketAnalysisDashboard />}
            />
            <Route
              path="/cart"
              element={<CartPage cart={cart} setCart={setCart} />}
            />

            <Route element={<PrivateRoute requiredRole="organizer" />}>
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailsPage />} />
            </Route>
          </Routes>
        </div>

        <Footer onOpenLogin={openLoginModal} onOpenSignup={openSignupModal} />
      </div>
    </Router>
  );
}

export default App;
