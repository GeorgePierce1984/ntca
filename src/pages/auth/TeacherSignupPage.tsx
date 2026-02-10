import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  GraduationCap,
  ArrowRight,
  Mail,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  MailCheck,
  CheckCircle2,
  Sparkles,
  Shield,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { CountrySelector } from "@/components/forms/CountrySelector";
import { getCountryByName } from "@/data/countries";
import {
  validatePassword,
  validateEmail,
  getPasswordStrengthLabel,
  getPasswordStrengthBarColor,
} from "@/utils/validation";
import { TermsModal } from "@/components/modals/TermsModal";

interface TeacherForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  phoneCountryCode: string;
  country: string;
}

export const TeacherSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any>(undefined);
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<any>(undefined);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [storedVerificationCode, setStoredVerificationCode] = useState<string | null>(null);
  const [verificationCodeExpiry, setVerificationCodeExpiry] = useState<Date | null>(null);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [teacherForm, setTeacherForm] = useState<TeacherForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    phoneCountryCode: "",
    country: "",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath =
        user.userType === "SCHOOL"
          ? "/schools/dashboard"
          : "/teachers/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Simple gradient animation style
  const gradientStyle = {
    backgroundSize: "400% 400%",
  };

  const passwordValidation = validatePassword(teacherForm.password);
  const strengthInfo = {
    label: getPasswordStrengthLabel(passwordValidation.score),
    color: getPasswordStrengthBarColor(passwordValidation.score),
  };

  const handleCountrySelect = (country: any) => {
    setSelectedCountry(country);
    setTeacherForm({ ...teacherForm, country: country.name });
    if (errors.country) {
      setErrors({ ...errors, country: "" });
    }
  };

  const handlePhoneCountrySelect = (country: any) => {
    setSelectedPhoneCountry(country);
    setTeacherForm({ ...teacherForm, phoneCountryCode: country.phoneCode });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!teacherForm.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!teacherForm.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!teacherForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(teacherForm.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!teacherForm.password) {
      newErrors.password = "Password is required";
    } else if (passwordValidation.score < 50) {
      newErrors.password = "Password is too weak";
    }
    if (!selectedCountry) {
      newErrors.country = "Country is required";
    }
    if (!termsAccepted) {
      newErrors.termsAccepted = "You must accept the Terms & Conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendVerificationCode = async () => {
    setSendingCode(true);
    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: teacherForm.email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send code");

      setStoredVerificationCode(data.code);
      setVerificationCodeExpiry(new Date(data.expiry));
      setVerificationCodeSent(true);
      toast.success("Verification code sent to your email");
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification code");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setErrors({ ...errors, verification: "Please enter a 6-digit code" });
      return;
    }

    setVerifyingCode(true);
    try {
      if (!storedVerificationCode || !verificationCodeExpiry) {
        throw new Error("Verification code expired. Please request a new one.");
      }

      if (new Date() > verificationCodeExpiry) {
        throw new Error("Verification code expired. Please request a new one.");
      }

      if (verificationCode !== storedVerificationCode) {
        setErrors({ ...errors, verification: "Invalid verification code" });
        return;
      }

      setEmailVerified(true);
      toast.success("Email verified successfully");
      setCurrentStep(3);
      
      // Automatically proceed to create account after verification
      await handleSubmit();
    } catch (error: any) {
      setErrors({ ...errors, verification: error.message });
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!emailVerified) {
      await handleSendVerificationCode();
      setCurrentStep(2);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...teacherForm,
          userType: "teacher",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed");

      localStorage.setItem("authToken", data.token);
      toast.success("Account created successfully!");
      navigate("/teachers/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!validateForm()) return;
      await handleSendVerificationCode();
      setCurrentStep(2);
    } else if (currentStep === 2) {
      await handleVerifyCode();
    } else if (currentStep === 3) {
      await handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Signup Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-900 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8 py-12"
        >
          {/* Logo and Title */}
          <div className="text-center mt-[40px]">
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
              <GraduationCap className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
              Join the NTCA Teacher Network
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-1">
              Schools across Central Asia are hiring English-speaking teachers for 2026 and beyond.
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 mb-1">
              Create your profile to be visible to schools and receive interview opportunities.
            </p>
            <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
              Takes 2 minutes.
            </p>
          </div>

          {/* Step 1: Registration Form */}
          {currentStep === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="text"
                      value={teacherForm.firstName}
                      onChange={(e) =>
                        setTeacherForm({ ...teacherForm, firstName: e.target.value })
                      }
                      className={`input pl-10 w-full ${errors.firstName ? "border-red-500" : ""}`}
                      placeholder="First name"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="text"
                      value={teacherForm.lastName}
                      onChange={(e) =>
                        setTeacherForm({ ...teacherForm, lastName: e.target.value })
                      }
                      className={`input pl-10 w-full ${errors.lastName ? "border-red-500" : ""}`}
                      placeholder="Last name"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type="email"
                    value={teacherForm.email}
                    onChange={(e) =>
                      setTeacherForm({ ...teacherForm, email: e.target.value })
                    }
                    className={`input pl-10 w-full ${errors.email ? "border-red-500" : ""}`}
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={teacherForm.password}
                    onChange={(e) =>
                      setTeacherForm({ ...teacherForm, password: e.target.value })
                    }
                    className={`input pl-10 pr-10 w-full ${errors.password ? "border-red-500" : ""}`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-neutral-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-neutral-400" />
                    )}
                  </button>
                </div>
                {teacherForm.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className={strengthInfo.color}>{strengthInfo.label}</span>
                      <span className="text-neutral-500">{passwordValidation.score}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthBarColor(passwordValidation.score)}`}
                        style={{ width: `${passwordValidation.score}%` }}
                      />
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Country *
                </label>
                <CountrySelector
                  selectedCountry={selectedCountry}
                  onSelect={handleCountrySelect}
                  placeholder="Search countries..."
                  className={errors.country ? "border-red-500" : ""}
                />
                {errors.country && (
                  <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Phone (optional)
                </label>
                <div className="flex gap-3">
                  <div className="min-w-[210px]">
                    <CountrySelector
                      selectedCountry={selectedPhoneCountry}
                      onSelect={handlePhoneCountrySelect}
                      showPhoneCode={true}
                      placeholder="Country code..."
                    />
                  </div>
                  <div className="flex-1 relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={teacherForm.phone}
                      onChange={(e) =>
                        setTeacherForm({ ...teacherForm, phone: e.target.value })
                      }
                      className="input pl-10 w-full"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Terms acceptance */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
                <label className="flex items-start gap-3 text-sm text-neutral-700 dark:text-neutral-200">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-neutral-300 dark:border-neutral-700"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (errors.termsAccepted) {
                        setErrors({ ...errors, termsAccepted: "" });
                      }
                    }}
                  />
                  <span>
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                    >
                      Terms &amp; Conditions
                    </button>
                    .
                  </span>
                </label>
                {errors.termsAccepted && (
                  <p className="text-red-500 text-sm mt-2">{errors.termsAccepted}</p>
                )}
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-600 dark:text-red-400">{errors.submit}</p>
                  </div>
                </div>
              )}

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
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )
                }
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>

              {/* Trust signals */}
              <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span>No fees for teachers</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span>Direct school contact</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span>International roles only</span>
                  </div>
                </div>
              </div>

              {/* Login link */}
              <div className="text-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Sign in
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* Step 2: Email Verification */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                  Verify Your Email
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                  {verificationCodeSent
                    ? "We've sent a verification code to"
                    : "We'll send a verification code to"}
                </p>
                <p className="font-semibold text-lg">{teacherForm.email}</p>
              </div>

              {!verificationCodeSent ? (
                <div className="text-center">
                  <Button
                    onClick={handleSendVerificationCode}
                    variant="gradient"
                    disabled={sendingCode}
                    leftIcon={sendingCode ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                    fullWidth
                  >
                    {sendingCode ? "Sending..." : "Send Verification Code"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Enter Verification Code
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setVerificationCode(value);
                        if (errors.verification) {
                          setErrors({ ...errors, verification: "" });
                        }
                      }}
                      placeholder="000000"
                      className="input text-center text-2xl font-mono tracking-widest w-full"
                      maxLength={6}
                    />
                    {errors.verification && (
                      <p className="text-red-500 text-sm mt-2">{errors.verification}</p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={handleSendVerificationCode}
                      variant="secondary"
                      disabled={sendingCode}
                      leftIcon={<RefreshCw className={`w-4 h-4 ${sendingCode ? "animate-spin" : ""}`} />}
                      className="flex-1"
                    >
                      {sendingCode ? "Resending..." : "Resend Code"}
                    </Button>
                    <Button
                      onClick={handleVerifyCode}
                      variant="gradient"
                      disabled={verificationCode.length !== 6 || verifyingCode}
                      className="flex-1"
                    >
                      {verifyingCode ? "Verifying..." : "Verify Email"}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Success */}
          {currentStep === 3 && emailVerified && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <MailCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                  Email Verified!
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Creating your account...
                </p>
              </div>
            </motion.div>
          )}
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
              Join the Teacher Network
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg mb-8 text-white/90"
            >
              Connect with schools across Central Asia. Join a growing network of international educators actively seeking roles in the region.
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

      {/* Terms Modal */}
      {showTermsModal && (
        <TermsModal
          onClose={() => setShowTermsModal(false)}
          onAccept={() => {
            setTermsAccepted(true);
            setShowTermsModal(false);
            if (errors.termsAccepted) {
              setErrors({ ...errors, termsAccepted: "" });
            }
          }}
        />
      )}
    </div>
  );
};

