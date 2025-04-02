import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center mt-10">
      <h1 className="text-2xl font-bold text-red-600">Payment Cancelled</h1>
      <p className="mt-2 text-gray-700">
        Your ticket order was not completed. You can return to the cart and try
        again.
      </p>
      <button
        onClick={() => navigate("/cart")}
        className="mt-4 px-4 py-2 bg-navyBlue hover:bg-deepBlue text-white rounded"
      >
        Back to Cart
      </button>
    </div>
  );
};

export default PaymentCancelled;
