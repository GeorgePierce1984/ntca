import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const PostJobPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to school dashboard with post-job tab selected
    if (user?.userType === "SCHOOL") {
      navigate("/schools/dashboard?tab=post-job");
    } else {
      navigate("/schools/dashboard");
    }
  }, [navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
};
