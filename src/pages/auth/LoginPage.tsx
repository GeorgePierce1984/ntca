import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  Sparkles,
  GraduationCap,
  Building2,
  ArrowRight,
  Shield,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectPath =
        user.userType === "SCHOOL"
          ? "/schools/dashboard"
          : "/teachers/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  // Get redirect URL from location state or default based on user type
  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store token
      localStorage.setItem("authToken", data.token);

      // Call login from auth context
      await login(email, password);

      // Redirect based on user type or return URL
      const redirectPath =
        from ||
        (data.user.userType === "SCHOOL"
          ? "/schools/dashboard"
          : "/teachers/dashboard");
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  };

  // Simple gradient animation style
  const gradientStyle = {
    backgroundSize: "400% 400%",
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-900">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
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
              Welcome back
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Sign in to continue to NTCA
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </motion.div>
            )}

            <div className="space-y-5">
              {/* Email Input */}
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
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                >
                  Password
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
                    placeholder="••••••••"
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
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="gradient"
              fullWidth
              size="lg"
              disabled={loading}
              rightIcon={
                loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <LogIn className="w-5 h-5" />
                )
              }
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            {/* Quick Login Options */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-300 dark:border-neutral-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-neutral-900 text-neutral-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg shadow-sm bg-white dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Demo Teacher
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg shadow-sm bg-white dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  <Building2 className="w-5 h-5 mr-2" />
                  Demo School
                </button>
              </div>
            </div>

            {/* Sign up link */}
            <div className="text-center">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Sign up
                </Link>
              </span>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Right side - Background */}
      <div className="hidden lg:block relative flex-1">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 animate-gradient"
          style={gradientStyle}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full flex items-center justify-center text-white p-12">
          <div className="max-w-lg">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold mb-6"
            >
              Welcome to NTCA
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg mb-8 text-white/90"
            >
              Connect with top schools and qualified teachers across Central
              Asia. Join thousands of educators who have found their dream
              teaching positions through our platform.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span>AI-powered job matching</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <span>Verified schools and teachers</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <span>Opportunities across Central Asia</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
