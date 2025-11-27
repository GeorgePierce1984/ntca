import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, LogOut, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const SessionExpiryModal: React.FC = () => {
  const { showLogoutModal, setShowLogoutModal, logout } = useAuth();
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (showLogoutModal) {
      setCountdown(5);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showLogoutModal]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleStayLoggedIn = () => {
    // This would need to refresh the token
    setShowLogoutModal(false);
    window.location.reload(); // Simple refresh to get new token
  };

  return (
    <AnimatePresence>
      {showLogoutModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={(e) => e.preventDefault()}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-md w-full p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <Clock className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                  Session Expiring
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Your session has expired due to inactivity. You will be logged
                  out in:
                </p>

                {/* Countdown */}
                <div className="mt-4 mb-4">
                  <span className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                    {countdown}
                  </span>
                  <span className="text-lg text-neutral-600 dark:text-neutral-400 ml-2">
                    seconds
                  </span>
                </div>

                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Click below to stay logged in or you will be redirected to the
                  login page.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleStayLoggedIn}
                  variant="primary"
                  fullWidth
                  size="lg"
                >
                  Stay Logged In
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  fullWidth
                  size="lg"
                  leftIcon={<LogOut className="w-5 h-5" />}
                >
                  Log Out Now
                </Button>
              </div>

              {/* Warning */}
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    For security reasons, sessions expire after 1 hour of
                    activity. This helps protect your account from unauthorized
                    access.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
