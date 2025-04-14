import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axiosConfig";

import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const TAX_RATE = 0.13;

const CheckoutPage = ({ cart, setCart }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [alertMessage, setAlertMessage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const uid = localStorage.getItem("firebaseId");

  useEffect(() => {
    axios
      .get(`/api/auth/user/${uid}`)
      .then((res) => {
        if (res.status === 200) {
          setUserData((prev) => ({ ...prev, ...res.data }));
        }
      })
      .catch((err) => console.error("User fetch error:", err));
  }, [uid]);

  useEffect(() => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.ticketPrice * item.quantity,
      0
    );
    const tax = subtotal * TAX_RATE;
    setTotalPrice(subtotal + tax);
  }, [cart]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async () => {
    try {
      if (!cart || cart.length === 0) {
        setAlertMessage("Your cart is empty!");
        return;
      }

      for (const item of cart) {
        const res = await axios.get(
          `/api/user-ticket-count/${uid}/${item._id}`
        );
        const totalBooked = res.data.totalTicketsBooked;
        if (totalBooked + item.quantity > 2) {
          setAlertMessage(
            `You cannot book more than 2 tickets for ${item.title}!`
          );
          return;
        }
      }

      if (paymentMethod === "cod") {
        const orderData = {
          userId: uid,
          tickets: cart.map((item) => ({
            eventInstanceId: item.eventInstanceId,
            ticketId: item._id,
            quantity: item.quantity,
            price: item.ticketPrice,
          })),
          totalAmount: totalPrice,
          paymentStatus: "Pending",
          orderStatus: "COD Requested",
        };

        const res = await axios.post("/api/order", orderData);

        if (res.status === 201) {
          localStorage.removeItem("cart");
          setCart([]);
          navigate("/order-success");
        }
      } else if (paymentMethod === "card") {
        sessionStorage.setItem("paymentMethod", "card");
        sessionStorage.setItem("orderCompleted", "false");
        const stripe = await stripePromise;

        sessionStorage.setItem("cart", JSON.stringify(cart));
        sessionStorage.setItem("userId", uid);
        sessionStorage.setItem("totalAmount", totalPrice.toString());

        const res = await axios.post("/api/create-stripe-session", {
          userId: uid,
          cart: cart.map((item) => ({
            name: item.title,
            quantity: item.quantity,
            price: item.ticketPrice,
            eventInstanceId: item.eventInstanceId,
            ticketId: item._id,
          })),
          totalAmount: totalPrice,
        });

        const result = await stripe.redirectToCheckout({
          sessionId: res.data.id,
        });

        if (result.error) {
          setAlertMessage(result.error.message);
        }
      }
    } catch (err) {
      setAlertMessage(err.response?.data?.error || "Checkout error occurred.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      {alertMessage && (
        <div className="bg-red-500 text-white text-center p-2 mb-4 rounded-md">
          {alertMessage}
        </div>
      )}

      <h2 className="text-xl font-bold mb-4 text-navyBlue">Checkout</h2>
      <div className="space-y-4">
        <input
          type="text"
          name="name"
          value={userData.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full p-2 border border-blueGray rounded-xl"
          disabled={!!userData.name}
        />
        <input
          type="email"
          name="email"
          value={userData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 border border-blueGray rounded-xl"
          disabled={!!userData.email}
        />
        <input
          type="tel"
          name="phone"
          value={userData.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          className="w-full p-2 border border-blueGray rounded-xl"
          disabled={!!userData.phone}
        />
        <input
          type="text"
          name="address"
          value={userData.address}
          onChange={handleChange}
          placeholder="Address"
          className="w-full p-2 border border-blueGray rounded-xl"
          disabled={!!userData.address}
        />

        <div className="space-y-2">
          <label className="font-medium">Select Payment Method:</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              Cash on Delivery
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="card"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
              />
              Pay with Card
            </label>
          </div>
        </div>

        <div className="border border-gray-300 rounded-xl p-4 mt-4">
          <h3 className="text-lg font-bold mb-2">Order Summary</h3>
          {cart.length === 0 ? (
            <p className="text-gray-500">No items in cart</p>
          ) : (
            cart.map((item, index) => (
              <div
                key={index}
                className="flex justify-between text-gray-700 mb-2"
              >
                <span>
                  {item.title} (x{item.quantity})
                </span>
                <span>${(item.ticketPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))
          )}
          <hr className="border-gray-400 my-2" />
          <div className="flex justify-between font-bold text-green-600 text-lg">
            <span>Total (incl. tax):</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          className="w-full mt-4 bg-deepBlue hover:bg-navyBlue text-white py-2 rounded-xl text-lg font-semibold"
        >
          {paymentMethod === "cod" ? "Confirm COD Order" : "Pay with Card"}
        </button>

        <p className="text-sm text-gray-500">
          *Stripe payment gateway is integrated for card payments
        </p>

        <button
          onClick={() => navigate("/cart")}
          className="w-full mt-2 bg-lightBlue hover:bg-mediumBlue text-black py-2 rounded-xl"
        >
          Back to Cart
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
