import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../axiosConfig";

const SponsorshipSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const hasSaved = useRef(false);

  useEffect(() => {
    const saveSponsorship = async () => {
      if (hasSaved.current) return;
      hasSaved.current = true;

      const sponsorId = params.get("sponsorId");
      const eventId = params.get("eventId");
      const amount = parseFloat(params.get("amount"));

      if (!sponsorId || !eventId || !amount) return;

      try {
        await axios.post("/api/sponsorships", {
          sponsorId,
          eventId,
          amount,
        });
      } catch (err) {
        console.error("Failed to store sponsorship:", err);
      }
    };

    saveSponsorship();
  }, [params]);

  return (
    <div className="text-center mt-10">
      <h1 className="text-2xl font-bold text-green-600">
        Sponsorship Successful!
      </h1>
      <p>Thank you for supporting the event.</p>
      <button
        onClick={() => navigate("/")}
        className="mt-4 underline text-blue-500"
      >
        Go back home
      </button>
    </div>
  );
};

export default SponsorshipSuccess;
