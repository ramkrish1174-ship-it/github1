import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function SubscriptionSuccess() {
  const [params] = useSearchParams();

  const navigate = useNavigate();

  useEffect(() => {
    verifySubscription();
  }, []);

  const verifySubscription = async () => {
    try {
      const sessionId = params.get("session_id");

      await api.get(`/subscriptions/verify/${sessionId}`);

      navigate("/courses");
    } catch {
      alert("Subscription verification failed");
    }
  };

  return <h2>Verifying Subscription...</h2>;
}