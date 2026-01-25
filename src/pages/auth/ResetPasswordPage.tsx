import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  validatePassword,
  getPasswordStrengthLabel,
  getPasswordStrengthBarColor,
} from "@/utils/validation";

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // Check if token is valid on mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      toast.error("Invalid or missing reset token");
      return;
    }

    // Token format validation (basic check)
    if (token.length < 32) {
      setTokenValid(false);
      toast.error("Invalid reset token format");
      return;
    }

    setTokenValid(true);
  }, [token]);

  const passwordValidation = password ? validatePassword(password) : null;
  const strengthInfo = passwordValidation
    ? getPasswordStrengthLabel(passwordValidation.score)
    : { label: "", color: "" };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValidation || !passwordValidation.isValid) {
      toast.error("Please enter a valid password");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success("Password reset successfully! Redirecting to login...");
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(data.error || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              Invalid Reset Link
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Button
              variant="gradient"
              onClick={() => navigate("/forgot-password")}
            >
              Request New Reset Link
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              Password Reset Successful!
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Your password has been reset. You can now log in with your new password.
            </p>
          </div>
          <Button
            variant="gradient"
            onClick={() => navigate("/login")}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Go to Login
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Logo and Title */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg mb-6"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Reset Password
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input pl-10 pr-10 w-full"
                placeholder="Enter new password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                ) : (
                  <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                )}
              </button>
            </div>
            {password && passwordValidation && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={strengthInfo.color}>
                    {strengthInfo.label}
                  </span>
                  <span className="text-neutral-500">
                    {passwordValidation.score}%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthBarColor(passwordValidation.score)}`}
                    style={{
                      width: `${passwordValidation.score}%`,
                    }}
                  />
                </div>
                {!passwordValidation.isValid && (
                  <ul className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                    {passwordValidation.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="input pl-10 pr-10 w-full"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                ) : (
                  <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                )}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                Passwords do not match
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="gradient"
            fullWidth
            size="lg"
            disabled={loading || !password || !confirmPassword || password !== confirmPassword}
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </Button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};


