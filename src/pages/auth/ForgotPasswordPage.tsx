import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        toast.success("Password reset email sent! Please check your inbox.");
      } else {
        toast.error(data.error || "Failed to send reset email. Please try again.");
      }
    } catch (error) {
      console.error("Password reset request error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            Forgot Password?
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {emailSent
              ? "Check your email for reset instructions"
              : "Enter your email address and we'll send you a link to reset your password"}
          </p>
        </div>

        {emailSent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                Email Sent!
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
                Please check your inbox and click the link to reset your password.
                The link will expire in 1 hour.
              </p>
            </div>
            <div className="space-y-3">
              <Button
                variant="gradient"
                fullWidth
                onClick={() => navigate("/login")}
              >
                Back to Login
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
              >
                Send Another Email
              </Button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input pl-10 w-full"
                  placeholder="you@example.com"
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              fullWidth
              size="lg"
              disabled={loading || !email}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
