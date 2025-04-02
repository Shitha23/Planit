import React from "react";
import { useNavigate } from "react-router-dom";

const SponsorshipCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center mt-10">
      <h1 className="text-2xl font-bold text-red-600">Sponsorship Cancelled</h1>
      <p className="mt-2 text-gray-700">
        Your sponsorship was not completed. You can return to the event and try
        again later.
      </p>
      <button
        onClick={() => navigate("/sponsor-event")}
        className="mt-4 px-4 py-2 bg-navyBlue hover:bg-deepBlue text-white rounded"
      >
        Back to Sponsorships
      </button>
    </div>
  );
};

export default SponsorshipCancelled;
