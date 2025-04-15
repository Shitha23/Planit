import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axiosConfig";

const OrderSuccessPage = ({ setCart }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const completeOrder = async () => {
      const alreadyProcessed = sessionStorage.getItem("orderCompleted");
      if (alreadyProcessed === "true") {
        if (typeof setCart === "function") setCart([]);
        return;
      }

      const cart = JSON.parse(sessionStorage.getItem("cart"));
      const userId = sessionStorage.getItem("userId");
      const totalAmount = parseFloat(sessionStorage.getItem("totalAmount"));

      if (!cart || !userId || !totalAmount) {
        navigate("/");
        return;
      }

      try {
        sessionStorage.setItem("orderCompleted", "true");
        if (typeof setCart === "function") setCart([]);

        console.log("Order completed successfully");
        await axios.post("/api/order", {
          userId,
          tickets: cart.map((item) => ({
            eventInstanceId: item.eventInstanceId,
            ticketId: item._id,
            quantity: item.quantity,
            price: item.ticketPrice,
          })),
          totalAmount,
          paymentStatus: "Completed",
          orderStatus: "Confirmed",
        });

        localStorage.removeItem("cart");
        sessionStorage.removeItem("cart");
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("totalAmount");
      } catch (err) {
        sessionStorage.removeItem("orderCompleted");
      }
    };

    completeOrder();
  }, [navigate, setCart]);

  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold text-green-600">Order Successful!</h1>
      <p>Your ticket has been confirmed. Check your account for details.</p>
    </div>
  );
};

export default OrderSuccessPage;
