import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const OrderSuccessPage = ({ setCart }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const completeOrder = async () => {
      const cart = JSON.parse(sessionStorage.getItem("cart"));
      const userId = sessionStorage.getItem("userId");
      const totalAmount = parseFloat(sessionStorage.getItem("totalAmount"));

      if (!cart || !userId || !totalAmount) {
        navigate("/");
        return;
      }

      try {
        await axios.post("http://localhost:5001/api/order", {
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
        setCart([]);
      } catch (err) {
        console.error("Order finalization failed:", err);
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
