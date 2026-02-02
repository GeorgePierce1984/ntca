import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Legacy route handler.
 *
 * We keep `/schools/signup` for backwards compatibility (links from pricing, ads, etc),
 * but the actual signup UX lives in the unified `/signup` flow (same as the modal).
 */
const SignupRedirectPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plan = (params.get("plan") || "").toLowerCase();

    // Preserve plan (if present) and force school signup UX in /signup
    const next = new URLSearchParams();
    next.set("type", "school");
    if (plan) next.set("plan", plan);

    navigate(`/signup?${next.toString()}`, { replace: true });
  }, [location.search, navigate]);

  return null;
};

export default SignupRedirectPage;


