import { Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

const OrderSuccessPage = () => {
  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl text-center">
      <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-navyBlue">
        Order Placed Successfully!
      </h2>
      <p className="text-gray-700 mt-2">
        Thank you for your purchase. Your tickets have been booked successfully.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="bg-navyBlue hover:bg-deepBlue text-white py-2 px-6 rounded-lg text-lg font-semibold"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
