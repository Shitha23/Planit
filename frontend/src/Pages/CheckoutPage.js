import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

  const uid = localStorage.getItem("firebaseId");

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/auth/user/${uid}`)
      .then((response) => {
        if (response.status === 200) {
          setUserData((prevData) => ({
            ...prevData,
            ...response.data,
          }));
        } else {
          console.error("User not found:", response);
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
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

      console.log(uid);
      for (const item of cart) {
        const response = await axios.get(
          `http://localhost:5000/api/user-ticket-count/${uid}/${item._id}`
        );

        const totalTicketsBooked = response.data.totalTicketsBooked;

        if (totalTicketsBooked + item.quantity > 2) {
          setAlertMessage(
            `You cannot book more than 2 tickets for ${item.title}!`
          );
          return;
        }
      }

      const orderData = {
        userId: uid,
        tickets: cart.map((item) => ({
          eventInstanceId: item.eventInstanceId,
          ticketId: item._id,
          quantity: item.quantity,
          price: item.ticketPrice,
        })),
        totalAmount: totalPrice,
        paymentStatus: "Completed",
        orderStatus: "Confirmed",
      };

      const response = await axios.post(
        "http://localhost:5000/api/order",
        orderData
      );

      if (response.status === 201) {
        localStorage.removeItem("cart");
        setCart([]);
        navigate("/order-success");
      }
    } catch (error) {
      setAlertMessage(error.response?.data?.error || "Error placing order.");
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
          Proceed to Cash on Delivery
        </button>
        <p className="text-sm text-gray-500">
          *Payment gateway will be implemented later
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
