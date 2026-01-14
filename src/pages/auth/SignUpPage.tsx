import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Building2,
  GraduationCap,
  Check,
  Star,
  ArrowRight,
  ArrowLeft,
  Mail,
  User,
  Phone,
  MapPin,
  Globe,
  Lock,
  CreditCard,
  AlertCircle,
  Eye,
  EyeOff,
  MailCheck,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { CountrySelector } from "@/components/forms/CountrySelector";
import { countries, type Country, getCountryByCode, getCountryByName } from "@/data/countries";
import {
  validatePassword,
  validateEmail,
  validatePhoneNumber,
  getPasswordStrengthLabel,
  getPasswordStrengthBarColor,
} from "@/utils/validation";
import { CENTRAL_ASIA_COUNTRIES } from "@/constants/options";

type UserType = "school" | "teacher";

interface SchoolForm {
  name: string;
  contactName: string;
  email: string;
  password: string;
  confirmPassword: string;
  telephone: string;
  phoneCountryCode: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  established: string;
  studentCount: string;
}

interface TeacherForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  phoneCountryCode: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  qualification: string;
  experience: string;
  bio: string;
  dateOfBirth: string;
  nationality: string;
}

interface SchoolPlan {
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  jobLimit: string;
  features: string[];
  priceIdMonthly?: string;
  priceIdAnnual?: string;
  popular?: boolean;
}

interface TeacherPlan {
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string[];
  priceIdMonthly?: string;
  priceIdAnnual?: string;
  popular?: boolean;
  isFree?: boolean;
}

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // Check URL params for return from payment
  const urlParams = new URLSearchParams(window.location.search);
  const isReturningFromPayment = urlParams.get("from") === "payment";
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<
    SchoolPlan | TeacherPlan | null
  >(null);
  const [billingType, setBillingType] = useState<"monthly" | "annual">(
    "monthly",
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
    undefined, // No default - user must select
  );
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<
    Country | undefined
  >(
    undefined, // No default - user must select
  );
  const [selectedSchoolCountry, setSelectedSchoolCountry] = useState<Country | undefined>(
    undefined, // For school form country selection
  );
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [storedVerificationCode, setStoredVerificationCode] = useState<string | null>(null);
  const [verificationCodeExpiry, setVerificationCodeExpiry] = useState<Date | null>(null);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  const [schoolForm, setSchoolForm] = useState<SchoolForm>({
    name: "",
    contactName: "",
    email: "",
    password: "",
    confirmPassword: "",
    telephone: "",
    phoneCountryCode: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    established: "",
    studentCount: "",
  });

  const [teacherForm, setTeacherForm] = useState<TeacherForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    phoneCountryCode: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    qualification: "",
    experience: "",
    bio: "",
    dateOfBirth: "",
    nationality: "",
  });

  // Initialize component immediately - set initialized to true first
  useEffect(() => {
    // Set initialized immediately so the component can render
    setIsInitialized(true);
  }, []);

  // Redirect if already authenticated (separate effect)
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath =
        user.userType === "SCHOOL"
          ? "/schools/dashboard"
          : "/teachers/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Initialize form data from sessionStorage when component mounts
  useEffect(() => {
    // Only restore data if returning from payment
    if (isReturningFromPayment) {
      // Load saved form data from sessionStorage when returning from payment
      const savedSchoolForm = sessionStorage.getItem("signupSchoolForm");
      const savedTeacherForm = sessionStorage.getItem("signupTeacherForm");
      const savedUserType = sessionStorage.getItem("signupUserType");
      const savedStep = sessionStorage.getItem("signupStep");
      const savedSelectedPlan = sessionStorage.getItem("signupSelectedPlan");
      const savedBillingType = sessionStorage.getItem("signupBillingType");

      if (savedSchoolForm) {
        try {
          const parsed = JSON.parse(savedSchoolForm);
          setSchoolForm(parsed);
          // Restore selected country if country name exists
          if (parsed.country) {
            const country = getCountryByName(parsed.country);
            if (country) {
              setSelectedSchoolCountry(country);
            }
          }
        } catch (e) {
          console.error("Error parsing saved school form:", e);
        }
      }

      // Restore verification state
      const savedCode = sessionStorage.getItem("verificationCode");
      const savedExpiry = sessionStorage.getItem("verificationCodeExpiry");
      const savedVerified = sessionStorage.getItem("emailVerified");
      
      if (savedCode) {
        setStoredVerificationCode(savedCode);
        setVerificationCodeSent(true);
      }
      if (savedExpiry) {
        setVerificationCodeExpiry(new Date(savedExpiry));
      }
      if (savedVerified === "true") {
        setEmailVerified(true);
      }
      if (savedTeacherForm) {
        try {
          setTeacherForm(JSON.parse(savedTeacherForm));
        } catch (e) {
          console.error("Error parsing saved teacher form:", e);
        }
      }
      if (savedUserType) {
        setUserType(savedUserType as UserType);
      }
      if (savedSelectedPlan) {
        try {
          setSelectedPlan(JSON.parse(savedSelectedPlan));
        } catch (e) {
          console.error("Error parsing saved plan:", e);
        }
      }
      if (savedBillingType) {
        setBillingType(savedBillingType as "monthly" | "annual");
      }

      // If returning from payment, restore to step 3 (email verification)
      if (savedStep) {
        const step = parseInt(savedStep, 10);
        if (!isNaN(step) && step >= 1 && step <= 3) {
          setCurrentStep(step);
        }
      }
    } else {
      // Clear old sessionStorage data when starting fresh
      sessionStorage.removeItem("signupSchoolForm");
      sessionStorage.removeItem("signupTeacherForm");
      sessionStorage.removeItem("signupUserType");
      sessionStorage.removeItem("signupStep");
      sessionStorage.removeItem("signupSelectedPlan");
      sessionStorage.removeItem("signupBillingType");
      
      // Reset to initial state
      setCurrentStep(1);
      setUserType(null);
      setSelectedPlan(null);
      setBillingType("monthly");
    }
  }, [isReturningFromPayment]);

  // Save form data to sessionStorage whenever it changes
  useEffect(() => {
    if (userType) {
      sessionStorage.setItem("signupUserType", userType);
    }
    sessionStorage.setItem("signupStep", currentStep.toString());
    sessionStorage.setItem("signupSchoolForm", JSON.stringify(schoolForm));
    sessionStorage.setItem("signupTeacherForm", JSON.stringify(teacherForm));
    if (selectedPlan) {
      sessionStorage.setItem(
        "signupSelectedPlan",
        JSON.stringify(selectedPlan),
      );
    }
    sessionStorage.setItem("signupBillingType", billingType);
    if (storedVerificationCode) {
      sessionStorage.setItem("verificationCode", storedVerificationCode);
    }
    if (verificationCodeExpiry) {
      sessionStorage.setItem("verificationCodeExpiry", verificationCodeExpiry.toISOString());
    }
    if (emailVerified) {
      sessionStorage.setItem("emailVerified", "true");
    }
  }, [
    userType,
    currentStep,
    schoolForm,
    teacherForm,
    selectedPlan,
    billingType,
    storedVerificationCode,
    verificationCodeExpiry,
    emailVerified,
  ]);

  // Auto-send verification code when reaching step 3
  useEffect(() => {
    if (currentStep === 3 && !verificationCodeSent && !emailVerified) {
      const email = userType === "school" ? schoolForm.email : teacherForm.email;
      if (email) {
        // Auto-send code after a short delay
        const timer = setTimeout(() => {
          handleSendVerificationCode();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [currentStep, verificationCodeSent, emailVerified]);

  const schoolPlans: SchoolPlan[] = [
    {
      name: "Starter",
      priceMonthly: 49,
      priceAnnual: 470,
      jobLimit: "5 job postings",
      features: [
        "Up to 5 active job postings",
        "Basic applicant management",
        "Email notifications",
        "Standard support",
      ],
      priceIdMonthly: import.meta.env.VITE_STRIPE_BASIC_MONTHLY_USD?.trim(),
      priceIdAnnual: import.meta.env.VITE_STRIPE_BASIC_ANNUAL_USD?.trim(),
    },
    {
      name: "Professional",
      priceMonthly: 99,
      priceAnnual: 950,
      jobLimit: "15 job postings",
      features: [
        "Up to 15 active job postings",
        "Advanced applicant filtering",
        "Interview scheduling",
        "Analytics dashboard",
        "Priority support",
        "Custom branding",
      ],
      priceIdMonthly: import.meta.env.VITE_STRIPE_STANDARD_MONTHLY_USD?.trim(),
      priceIdAnnual: import.meta.env.VITE_STRIPE_STANDARD_ANNUAL_USD?.trim(),
      popular: true,
    },
    {
      name: "Enterprise",
      priceMonthly: 199,
      priceAnnual: 1910,
      jobLimit: "Unlimited postings",
      features: [
        "Unlimited job postings",
        "Advanced analytics",
        "API access",
        "Dedicated account manager",
        "Custom integrations",
        "White-label solution",
      ],
      priceIdMonthly: import.meta.env.VITE_STRIPE_PREMIUM_MONTHLY_USD?.trim(),
      priceIdAnnual: import.meta.env.VITE_STRIPE_PREMIUM_ANNUAL_USD?.trim(),
    },
  ];

  const _teacherPlans: TeacherPlan[] = [
    {
      name: "Free Account",
      priceMonthly: 0,
      priceAnnual: 0,
      features: [
        "Browse job listings",
        "Apply to unlimited jobs",
        "Basic profile",
        "Email notifications",
      ],
      isFree: true,
      popular: true,
    },
  ];

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 3) {
      // Validate email verification
      if (!emailVerified) {
        newErrors.verification = "Please verify your email before continuing";
      }
    }

    if (currentStep === 2) {
      const form = userType === "school" ? schoolForm : teacherForm;

      // Email validation
      if (!form.email) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(form.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      // Password validation
      if (!form.password) {
        newErrors.password = "Password is required";
      } else {
        const passwordValidation = validatePassword(form.password);
        if (!passwordValidation.isValid) {
          newErrors.password = passwordValidation.errors[0];
        }
      }

      // Password confirmation validation (only for school)
      if (userType === "school") {
        const sf = form as SchoolForm;
        if (!sf.confirmPassword) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (sf.password !== sf.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
      }

      // Phone validation (optional - only validate format if provided)
      const phoneField =
        userType === "school"
          ? (form as SchoolForm).telephone
          : (form as TeacherForm).phone;
      if (phoneField && !validatePhoneNumber(phoneField)) {
        newErrors.phone = "Please enter a valid phone number";
      }

      // Basic required fields for both types
      if (userType === "school") {
        const sf = form as SchoolForm;
        if (!sf.name) newErrors.name = "School name is required";
        if (!sf.contactName) newErrors.contactName = "Contact name is required";
        if (!sf.city) newErrors.city = "City is required";
        // Postal code is optional for international compatibility
        if (!sf.country) newErrors.country = "Country is required";
      } else {
        const tf = form as TeacherForm;
        if (!tf.firstName) newErrors.firstName = "First name is required";
        if (!tf.lastName) newErrors.lastName = "Last name is required";
        if (!tf.city) newErrors.city = "City is required";
        if (!tf.country) newErrors.country = "Country is required";
        if (!tf.qualification)
          newErrors.qualification = "Qualification is required";
        if (!tf.experience) newErrors.experience = "Experience is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      // Both schools and teachers have 3 steps now (email verification replaces plan selection)
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleUserTypeNext = () => {
    if (!userType) {
      setErrors({
        userType: "Please select whether you are a school or teacher",
      });
      return;
    }
    setErrors({});
    handleNext();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
      // Scroll to top when going back
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSendVerificationCode = async () => {
    const email = userType === "school" ? schoolForm.email : teacherForm.email;
    
    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }

    setSendingCode(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationCodeSent(true);
        setStoredVerificationCode(data.code);
        setVerificationCodeExpiry(new Date(data.expiresAt));
        // Store in sessionStorage
        sessionStorage.setItem("verificationCode", data.code);
        sessionStorage.setItem("verificationCodeExpiry", data.expiresAt);
        
        // Check if email was actually sent
        if (data.emailSent === false) {
          toast.error(
            `Email sending failed: ${data.emailError || "RESEND_API_KEY not configured"}. Code: ${data.code}`,
            {
              icon: "⚠️",
              duration: 5000,
            }
          );
          // Still allow them to use the code for testing
        } else {
          toast.success("Verification code sent to your email!", {
            icon: "📧",
            duration: 3000,
          });
        }
      } else {
        setErrors({ verification: data.error || "Failed to send verification code" });
        toast.error(data.error || "Failed to send verification code", {
          icon: "❌",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      setErrors({ verification: "Failed to send verification code. Please try again." });
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setErrors({ verification: "Please enter a valid 6-digit code" });
      return;
    }

    const email = userType === "school" ? schoolForm.email : teacherForm.email;
    const storedCode = storedVerificationCode || sessionStorage.getItem("verificationCode");
    const expiry = verificationCodeExpiry || sessionStorage.getItem("verificationCodeExpiry");

    // Check if code matches and is not expired
    if (storedCode && expiry) {
      const expiryDate = new Date(expiry);
      if (verificationCode === storedCode && expiryDate > new Date()) {
        setEmailVerified(true);
        sessionStorage.setItem("emailVerified", "true");
        toast.success("Email verified successfully!", {
          icon: "✅",
          duration: 2000,
        });
        // Both schools and teachers proceed directly to registration
        // Plan selection will be handled via modal later as a paywall
        handleRegistration();
        return;
      } else if (expiryDate <= new Date()) {
        setErrors({ verification: "Verification code has expired. Please request a new one." });
        setVerificationCodeSent(false);
        setStoredVerificationCode(null);
        return;
      }
    }

    // If stored code doesn't match, try API verification (for existing users)
    setVerifyingCode(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailVerified(true);
        sessionStorage.setItem("emailVerified", "true");
        toast.success("Email verified successfully!", {
          icon: "✅",
          duration: 2000,
        });
        // Both schools and teachers proceed directly to registration
        // Plan selection will be handled via modal later as a paywall
        handleRegistration();
      } else {
        setErrors({ verification: data.error || "Invalid verification code" });
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      setErrors({ verification: "Failed to verify code. Please try again." });
    } finally {
      setVerifyingCode(false);
    }
  };

  const clearStoredData = () => {
    sessionStorage.removeItem("signupSchoolForm");
    sessionStorage.removeItem("signupTeacherForm");
    sessionStorage.removeItem("signupUserType");
    sessionStorage.removeItem("signupStep");
    sessionStorage.removeItem("signupSelectedPlan");
    sessionStorage.removeItem("signupBillingType");
  };

  const handleRegistration = async () => {
    console.log("handleRegistration called", { emailVerified, userType, currentStep });
    
    // Validate email verification first
    if (!emailVerified) {
      setErrors({ verification: "Please verify your email before creating your account" });
      return;
    }

    // Validate form data (only validates step 2, but that's okay - we're past that)
    // We just need to make sure required fields are filled
    const form = userType === "school" ? schoolForm : teacherForm;
    if (!form.email || !form.password) {
      toast.error("Please fill in all required fields", {
        icon: "⚠️",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    setErrors({});
    
    console.log("Starting registration for", userType);

    try {
      if (userType === "teacher") {
        // Free teacher registration - directly create account
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...teacherForm,
            userType: "teacher", // API expects lowercase
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Validate token before storing
          if (!data.token || typeof data.token !== "string") {
            setErrors({
              submit:
                "Registration successful but authentication failed. Please try logging in.",
            });
            return;
          }

          // Check if token has proper JWT format
          const tokenParts = data.token.split(".");
          if (tokenParts.length !== 3) {
            setErrors({
              submit: "Authentication error. Please contact support.",
            });
            return;
          }

          // Store auth token and redirect appropriately
          localStorage.setItem("authToken", data.token);
          clearStoredData();

          // Check for intended action
          const intendedAction = sessionStorage.getItem("intendedAction");
          sessionStorage.removeItem("intendedAction");

          if (userType === "school") {
            // Set flag to show profile completion modal on first dashboard load
            sessionStorage.setItem("justActivated", "true");
            if (intendedAction === "post-job") {
              navigate("/schools/dashboard?tab=post-job");
            } else if (intendedAction === "browse") {
              navigate("/schools/browse-teachers");
            } else {
              navigate("/schools/dashboard");
            }
          } else {
            navigate("/teachers/dashboard");
          }
        } else {
          // Handle specific error cases
          const errorMessage = data.error || "Registration failed";
          if (errorMessage.includes("already exists") || errorMessage.includes("User already exists") || errorMessage.includes("account with this email")) {
            const email = teacherForm.email;
            toast.error(
              `An account with the email ${email} already exists. Please try logging in instead.`,
              {
                duration: 5000,
                icon: "⚠️",
              }
            );
            setErrors({
              submit:
                "An account with this email already exists. Please try logging in instead.",
            });
          } else if (errorMessage.includes("required")) {
            toast.error("Please fill in all required fields.", { duration: 4000 });
            setErrors({ submit: "Please fill in all required fields." });
          } else if (errorMessage.includes("password")) {
            toast.error("Password must be at least 8 characters long.", { duration: 4000 });
            setErrors({
              submit: "Password must be at least 8 characters long.",
            });
          } else if (errorMessage.includes("email")) {
            toast.error("Please provide a valid email address.", { duration: 4000 });
            setErrors({ submit: "Please provide a valid email address." });
          } else {
            toast.error(errorMessage, { duration: 4000 });
            setErrors({ submit: errorMessage });
          }
        }
      } else {
        // School registration - directly create account (no plan selection)
        // Plan selection will be handled via modal later as a paywall
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...schoolForm,
            confirmPassword: undefined, // Don't send confirmPassword to backend
            userType: "school", // API expects lowercase
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Validate token before storing
          if (!data.token || typeof data.token !== "string") {
            setErrors({
              submit:
                "Registration successful but authentication failed. Please try logging in.",
            });
            return;
          }

          // Check if token has proper JWT format
          const tokenParts = data.token.split(".");
          if (tokenParts.length !== 3) {
            setErrors({
              submit: "Authentication error. Please contact support.",
            });
            return;
          }

          // Store auth token and redirect
          localStorage.setItem("authToken", data.token);
          clearStoredData();

          // Set flag to show profile completion modal on first dashboard load
          sessionStorage.setItem("justActivated", "true");

          // Redirect to school dashboard
          navigate("/schools/dashboard");
        } else {
          // Handle specific error cases
          const errorMessage = data.error || "Registration failed";
          if (errorMessage.includes("already exists") || errorMessage.includes("User already exists") || errorMessage.includes("account with this email")) {
            const email = schoolForm.email;
            toast.error(
              `An account with the email ${email} already exists. Please try logging in instead.`,
              {
                duration: 5000,
                icon: "⚠️",
              }
            );
            setErrors({
              submit:
                "An account with this email already exists. Please try logging in instead.",
            });
          } else if (errorMessage.includes("required")) {
            toast.error("Please fill in all required fields.", { duration: 4000 });
            setErrors({ submit: "Please fill in all required fields." });
          } else if (errorMessage.includes("password")) {
            toast.error("Password must be at least 8 characters long.", { duration: 4000 });
            setErrors({
              submit: "Password must be at least 8 characters long.",
            });
          } else if (errorMessage.includes("email")) {
            toast.error("Please provide a valid email address.", { duration: 4000 });
            setErrors({ submit: "Please provide a valid email address." });
          } else {
            toast.error(errorMessage, { duration: 4000 });
            setErrors({ submit: errorMessage });
          }
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (
        error instanceof Error &&
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        setErrors({
          submit: "Network error. Please check your connection and try again.",
        });
      } else if (error instanceof Error && error.message.includes("JSON")) {
        setErrors({
          submit: "Server error. Please try again or contact support.",
        });
      } else {
        setErrors({
          submit: "An unexpected error occurred. Please try again.",
        });
      }
    }

    setLoading(false);
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    if (userType === "school") {
      setSchoolForm({ ...schoolForm, country: country.name });
    } else {
      setTeacherForm({ ...teacherForm, country: country.name });
    }
  };

  const handlePhoneCountrySelect = (country: Country) => {
    setSelectedPhoneCountry(country);
    if (userType === "school") {
      setSchoolForm({ ...schoolForm, phoneCountryCode: country.phoneCode });
    } else {
      setTeacherForm({ ...teacherForm, phoneCountryCode: country.phoneCode });
    }
  };

  const handleSchoolCountrySelect = (country: Country) => {
    setSelectedSchoolCountry(country);
    setSchoolForm({
      ...schoolForm,
      country: country.name,
    });
  };

  const currentForm = userType === "school" ? schoolForm : teacherForm;
  const passwordValidation = validatePassword(currentForm.password);
  const strengthInfo = getPasswordStrengthLabel(passwordValidation.score);

  // Don't render if redirecting authenticated users (but wait for auth to load)
  if (!authLoading && isAuthenticated && user) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20">
      <section className="section">
        <div className="container-custom max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="heading-1 mb-4">Join Our Teaching Community</h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              Connect with opportunities in Central Asia's growing education
              sector
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? "bg-blue-500 text-white"
                        : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {step < currentStep ? <Check className="w-4 h-4" /> : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-12 h-0.5 ${
                        step < currentStep
                          ? "bg-blue-500"
                          : "bg-neutral-200 dark:bg-neutral-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card p-8">
            {/* Loading state - show only briefly */}
            {!isInitialized ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <>

            {/* Step 1: User Type Selection */}
            {isInitialized && currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="heading-2 text-center mb-8">I am a...</h2>
                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setUserType("school")}
                    className={`p-6 border-2 rounded-xl text-left transition-all ${
                      userType === "school"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                    }`}
                  >
                    <Building2
                      className={`w-8 h-8 mb-4 ${
                        userType === "school"
                          ? "text-blue-500"
                          : "text-neutral-500"
                      }`}
                    />
                    <h3 className="font-semibold text-lg mb-2">
                      School/Institution
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Looking to hire qualified teachers for your educational
                      institution
                    </p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setUserType("teacher")}
                    className={`p-6 border-2 rounded-xl text-left transition-all ${
                      userType === "teacher"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                    }`}
                  >
                    <GraduationCap
                      className={`w-8 h-8 mb-4 ${
                        userType === "teacher"
                          ? "text-blue-500"
                          : "text-neutral-500"
                      }`}
                    />
                    <h3 className="font-semibold text-lg mb-2">
                      Teacher/Educator
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Seeking teaching opportunities in Central Asia
                    </p>
                  </motion.button>
                </div>

                {errors.userType && (
                  <p className="text-red-500 text-sm text-center mt-4">
                    {errors.userType}
                  </p>
                )}

                <div className="flex justify-center mt-8">
                  <Button
                    variant="gradient"
                    onClick={handleUserTypeNext}
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    disabled={!userType}
                    glow
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: User Information */}
            {isInitialized && currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="heading-2 text-center mb-8">
                  {userType === "school"
                    ? "School Information"
                    : "Your Information"}
                </h2>

                <form className="space-y-6">
                  {userType === "school" ? (
                    <>
                      {/* School Form */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          School Name *
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                          <input
                            type="text"
                            value={schoolForm.name}
                            onChange={(e) =>
                              setSchoolForm({
                                ...schoolForm,
                                name: e.target.value,
                              })
                            }
                            className={`input pl-10 ${errors.name ? "border-red-500" : ""}`}
                            placeholder="Enter school name"
                          />
                        </div>
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Email *
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                            <input
                              type="email"
                              value={schoolForm.email}
                              onChange={(e) =>
                                setSchoolForm({
                                  ...schoolForm,
                                  email: e.target.value,
                                })
                              }
                              className={`input pl-10 ${errors.email ? "border-red-500" : ""}`}
                              placeholder="school@example.com"
                            />
                          </div>
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Contact Person *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                            <input
                              type="text"
                              value={schoolForm.contactName}
                              onChange={(e) =>
                                setSchoolForm({
                                  ...schoolForm,
                                  contactName: e.target.value,
                                })
                              }
                              className={`input pl-10 ${errors.contactName ? "border-red-500" : ""}`}
                              placeholder="Contact person name"
                            />
                          </div>
                          {errors.contactName && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.contactName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Password *
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={schoolForm.password}
                              onChange={(e) =>
                                setSchoolForm({
                                  ...schoolForm,
                                  password: e.target.value,
                                })
                              }
                              className={`input pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                              placeholder="Create a strong password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                          {schoolForm.password && (
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
                            </div>
                          )}
                          {errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.password}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Confirm Password *
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={schoolForm.confirmPassword}
                              onChange={(e) =>
                                setSchoolForm({
                                  ...schoolForm,
                                  confirmPassword: e.target.value,
                                })
                              }
                              className={`input pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                              placeholder="Confirm your password"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                          {errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Street Address
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                          <input
                            type="text"
                            value={schoolForm.streetAddress}
                            onChange={(e) =>
                              setSchoolForm({
                                ...schoolForm,
                                streetAddress: e.target.value,
                              })
                            }
                            className={`input pl-10 ${errors.streetAddress ? "border-red-500" : ""}`}
                            placeholder="Street address"
                          />
                        </div>
                        {errors.streetAddress && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.streetAddress}
                          </p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            value={schoolForm.city}
                            onChange={(e) =>
                              setSchoolForm({
                                ...schoolForm,
                                city: e.target.value,
                              })
                            }
                            className={`input ${errors.city ? "border-red-500" : ""}`}
                            placeholder="City"
                          />
                          {errors.city && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.city}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            State/Province
                          </label>
                          <input
                            type="text"
                            value={schoolForm.state}
                            onChange={(e) =>
                              setSchoolForm({
                                ...schoolForm,
                                state: e.target.value,
                              })
                            }
                            className="input"
                            placeholder="State or province"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Postal / ZIP Code{" "}
                            <span className="text-sm font-normal text-neutral-500">
                              (Optional)
                            </span>
                          </label>
                          <input
                            type="text"
                            value={schoolForm.postalCode}
                            onChange={(e) =>
                              setSchoolForm({
                                ...schoolForm,
                                postalCode: e.target.value,
                              })
                            }
                            className={`input ${errors.postalCode ? "border-red-500" : ""}`}
                            placeholder="e.g., 12345, SW1A 1AA"
                          />
                          {errors.postalCode && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.postalCode}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Country *
                        </label>
                        <CountrySelector
                          selectedCountry={selectedSchoolCountry}
                          onSelect={handleSchoolCountrySelect}
                          placeholder="Select country"
                          filterToCentralAsia={true}
                        />
                        {errors.country && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.country}
                          </p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Phone Country
                          </label>
                          <CountrySelector
                            selectedCountry={selectedPhoneCountry}
                            onSelect={handlePhoneCountrySelect}
                            showPhoneCode={true}
                            placeholder="Search countries..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                            <input
                              type="tel"
                              value={schoolForm.telephone}
                              onChange={(e) =>
                                setSchoolForm({
                                  ...schoolForm,
                                  telephone: e.target.value,
                                })
                              }
                              className={`input pl-10 ${errors.phone ? "border-red-500" : ""}`}
                              placeholder="Phone number"
                            />
                          </div>
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.phone}
                            </p>
                          )}
                        </div>
                      </div>

                    </>
                  ) : (
                    <>
                      {/* Teacher Form */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            First Name *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                            <input
                              type="text"
                              value={teacherForm.firstName}
                              onChange={(e) =>
                                setTeacherForm({
                                  ...teacherForm,
                                  firstName: e.target.value,
                                })
                              }
                              className={`input pl-10 ${errors.firstName ? "border-red-500" : ""}`}
                              placeholder="First name"
                            />
                          </div>
                          {errors.firstName && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.firstName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Last Name *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                            <input
                              type="text"
                              value={teacherForm.lastName}
                              onChange={(e) =>
                                setTeacherForm({
                                  ...teacherForm,
                                  lastName: e.target.value,
                                })
                              }
                              className={`input pl-10 ${errors.lastName ? "border-red-500" : ""}`}
                              placeholder="Last name"
                            />
                          </div>
                          {errors.lastName && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.lastName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Email *
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                            <input
                              type="email"
                              value={teacherForm.email}
                              onChange={(e) =>
                                setTeacherForm({
                                  ...teacherForm,
                                  email: e.target.value,
                                })
                              }
                              className={`input pl-10 ${errors.email ? "border-red-500" : ""}`}
                              placeholder="your@email.com"
                            />
                          </div>
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Password *
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={teacherForm.password}
                              onChange={(e) =>
                                setTeacherForm({
                                  ...teacherForm,
                                  password: e.target.value,
                                })
                              }
                              className={`input pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                              placeholder="Create a strong password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                          {teacherForm.password && (
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
                            </div>
                          )}
                          {errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.password}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Phone Country
                          </label>
                          <CountrySelector
                            selectedCountry={selectedPhoneCountry}
                            onSelect={handlePhoneCountrySelect}
                            showPhoneCode={true}
                            placeholder="Search countries..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                            <input
                              type="tel"
                              value={teacherForm.phone}
                              onChange={(e) =>
                                setTeacherForm({
                                  ...teacherForm,
                                  phone: e.target.value,
                                })
                              }
                              className={`input pl-10 ${errors.phone ? "border-red-500" : ""}`}
                              placeholder="Phone number"
                            />
                          </div>
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Street Address
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                          <input
                            type="text"
                            value={teacherForm.streetAddress}
                            onChange={(e) =>
                              setTeacherForm({
                                ...teacherForm,
                                streetAddress: e.target.value,
                              })
                            }
                            className="input pl-10"
                            placeholder="Street address"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            value={teacherForm.city}
                            onChange={(e) =>
                              setTeacherForm({
                                ...teacherForm,
                                city: e.target.value,
                              })
                            }
                            className={`input ${errors.city ? "border-red-500" : ""}`}
                            placeholder="City"
                          />
                          {errors.city && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.city}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            State/Province
                          </label>
                          <input
                            type="text"
                            value={teacherForm.state}
                            onChange={(e) =>
                              setTeacherForm({
                                ...teacherForm,
                                state: e.target.value,
                              })
                            }
                            className="input"
                            placeholder="State or province"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Postal / ZIP Code{" "}
                            <span className="text-sm font-normal text-neutral-500">
                              (Optional)
                            </span>
                          </label>
                          <input
                            type="text"
                            value={teacherForm.postalCode}
                            onChange={(e) =>
                              setTeacherForm({
                                ...teacherForm,
                                postalCode: e.target.value,
                              })
                            }
                            className="input"
                            placeholder="e.g., 12345, SW1A 1AA"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Country *
                        </label>
                        <CountrySelector
                          selectedCountry={selectedCountry}
                          onSelect={handleCountrySelect}
                          placeholder="Search countries..."
                          className={errors.country ? "border-red-500" : ""}
                        />
                        {errors.country && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.country}
                          </p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Qualification *
                          </label>
                          <select
                            value={teacherForm.qualification}
                            onChange={(e) =>
                              setTeacherForm({
                                ...teacherForm,
                                qualification: e.target.value,
                              })
                            }
                            className={`input ${errors.qualification ? "border-red-500" : ""}`}
                          >
                            <option value="">Select qualification</option>
                            <option value="Bachelor's Degree">
                              Bachelor's Degree
                            </option>
                            <option value="Master's Degree">
                              Master's Degree
                            </option>
                            <option value="PhD">PhD</option>
                            <option value="Teaching Certificate">
                              Teaching Certificate
                            </option>
                            <option value="TESOL/TEFL">TESOL/TEFL</option>
                            <option value="Other">Other</option>
                          </select>
                          {errors.qualification && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.qualification}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Experience *
                          </label>
                          <select
                            value={teacherForm.experience}
                            onChange={(e) =>
                              setTeacherForm({
                                ...teacherForm,
                                experience: e.target.value,
                              })
                            }
                            className={`input ${errors.experience ? "border-red-500" : ""}`}
                          >
                            <option value="">Select experience</option>
                            <option value="Entry Level">
                              Entry Level (0-1 years)
                            </option>
                            <option value="Junior Level">
                              Junior Level (2-5 years)
                            </option>
                            <option value="Mid Level">
                              Mid Level (6-10 years)
                            </option>
                            <option value="Senior Level">
                              Senior Level (11+ years)
                            </option>
                          </select>
                          {errors.experience && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.experience}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Bio
                        </label>
                        <textarea
                          value={teacherForm.bio}
                          onChange={(e) =>
                            setTeacherForm({
                              ...teacherForm,
                              bio: e.target.value,
                            })
                          }
                          className="input min-h-[100px]"
                          placeholder="Tell us about yourself and your teaching experience..."
                        />
                      </div>
                    </>
                  )}

                  {errors.submit && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-red-600 dark:text-red-400">
                          {errors.submit}
                        </p>
                      </div>
                    </div>
                  )}
                </form>

                <div className="flex justify-between items-center gap-4 mt-8">
                  <Button
                    onClick={handleBack}
                    variant="secondary"
                    leftIcon={<ArrowLeft className="w-5 h-5" />}
                  >
                    Back
                  </Button>
                  {userType === "teacher" ? (
                    <Button
                      onClick={handleRegistration}
                      variant="gradient"
                      disabled={loading}
                      rightIcon={<Check className="w-5 h-5" />}
                    >
                      {loading ? "Creating Account..." : "Create Free Account"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      variant="gradient"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      Continue
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Email Verification */}
            {isInitialized && currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="heading-2 text-center mb-8">Verify Your Email</h2>

                {!emailVerified ? (
                  <>
                    <div className="max-w-md mx-auto mb-6">
                      <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                          {verificationCodeSent
                            ? "We've sent a verification code to"
                            : "We'll send a verification code to"}
                        </p>
                        <p className="font-semibold text-lg">
                          {userType === "school" ? schoolForm.email : teacherForm.email}
                        </p>
                      </div>

                      {!verificationCodeSent ? (
                        <div className="text-center">
                          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                            Click the button below to receive a verification code via email.
                          </p>
                          <Button
                            onClick={handleSendVerificationCode}
                            variant="gradient"
                            disabled={sendingCode}
                            leftIcon={sendingCode ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
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
                              className="input text-center text-2xl font-mono tracking-widest"
                              maxLength={6}
                            />
                            <p className="text-sm text-neutral-500 mt-2 text-center">
                              Enter the 6-digit code sent to your email
                            </p>
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

                      {errors.verification && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <p className="text-red-600 dark:text-red-400">
                              {errors.verification}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="max-w-md mx-auto text-center">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MailCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Email Verified!</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                      Your email has been successfully verified. You can now continue.
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center gap-4 mt-8">
                  <Button
                    onClick={handleBack}
                    variant="secondary"
                    leftIcon={<ArrowLeft className="w-5 h-5" />}
                  >
                    Back
                  </Button>
                  {emailVerified && (
                    <Button
                      onClick={handleRegistration}
                      variant="gradient"
                      disabled={loading}
                      rightIcon={<Check className="w-5 h-5" />}
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Removed - Plan selection moved to modal/paywall */}
            {false && isInitialized && currentStep === 4 && userType === "school" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="heading-2 text-center mb-8">Choose Your Plan</h2>

                {/* Show message when returning from payment */}
                {isReturningFromPayment && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-500" />
                      <p className="text-blue-600 dark:text-blue-400">
                        Welcome back! Your information has been saved. Please
                        select a plan to continue.
                      </p>
                    </div>
                  </div>
                )}

                {/* Billing Toggle */}
                <div className="flex justify-center mb-8">
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                    <button
                      onClick={() => setBillingType("monthly")}
                      className={`px-4 py-2 rounded-md transition-all ${
                        billingType === "monthly"
                          ? "bg-white dark:bg-neutral-700 shadow-sm"
                          : "text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingType("annual")}
                      className={`px-4 py-2 rounded-md transition-all ${
                        billingType === "annual"
                          ? "bg-white dark:bg-neutral-700 shadow-sm"
                          : "text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      Annual
                      <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                        Save 20%
                      </span>
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {schoolPlans.map((plan) => (
                    <motion.div
                      key={plan.name}
                      whileHover={{ scale: 1.02 }}
                      className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedPlan?.name === plan.name
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Popular
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-4">
                        <h3 className="font-bold text-xl mb-2">{plan.name}</h3>
                        <div className="mb-2">
                          <span className="text-3xl font-bold">
                            $
                            {billingType === "monthly"
                              ? plan.priceMonthly
                              : plan.priceAnnual}
                          </span>
                          <span className="text-neutral-600 dark:text-neutral-400">
                            /{billingType === "monthly" ? "month" : "year"}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {plan.jobLimit}
                        </p>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {selectedPlan?.name === plan.name && (
                        <div className="absolute top-4 right-4">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {errors.plan && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <p className="text-red-600 dark:text-red-400">
                        {errors.plan}
                      </p>
                    </div>
                  </div>
                )}

                {errors.submit && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <p className="text-red-600 dark:text-red-400">
                        {errors.submit}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center gap-4 mt-8">
                  <Button
                    onClick={handleBack}
                    variant="secondary"
                    leftIcon={<ArrowLeft className="w-5 h-5" />}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleRegistration}
                    variant="gradient"
                    disabled={!selectedPlan || loading}
                    rightIcon={<CreditCard className="w-5 h-5" />}
                  >
                    {loading ? "Processing..." : "Continue to Payment"}
                  </Button>
                </div>
              </motion.div>
            )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
