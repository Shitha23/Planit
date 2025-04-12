import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PaymentCancelled = ({ setCart }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = sessionStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, [setCart]);

  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Payment Cancelled
      </h2>
      <p className="mb-4">Your payment was not completed.</p>
      <button
        onClick={() => navigate("/cart")}
        className="bg-navyBlue hover:bg-deepBlue text-white px-4 py-2 rounded"
      >
        Back to Cart
      </button>
    </div>
  );
};

export default PaymentCancelled;
