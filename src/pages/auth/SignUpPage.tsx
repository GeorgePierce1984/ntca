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
} from "lucide-react";
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
import { SCHOOL_TYPES, CENTRAL_ASIA_COUNTRIES } from "@/constants/options";

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
  schoolType: string;
  estimateJobs: string;
  website: string;
  description: string;
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
    schoolType: "",
    estimateJobs: "",
    website: "",
    description: "",
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

      // If returning from payment, restore to step 3 (plan selection)
      if (savedUserType === "school") {
        setCurrentStep(3);
      } else if (savedStep) {
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
  }, [
    userType,
    currentStep,
    schoolForm,
    teacherForm,
    selectedPlan,
    billingType,
  ]);

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

      // Phone validation
      const phoneField =
        userType === "school"
          ? (form as SchoolForm).telephone
          : (form as TeacherForm).phone;
      if (!phoneField) {
        newErrors.phone = "Phone number is required";
      } else if (!validatePhoneNumber(phoneField)) {
        newErrors.phone = "Please enter a valid phone number";
      }

      // Basic required fields for both types
      if (userType === "school") {
        const sf = form as SchoolForm;
        if (!sf.name) newErrors.name = "School name is required";
        if (!sf.contactName) newErrors.contactName = "Contact name is required";
        if (!sf.streetAddress)
          newErrors.streetAddress = "Street address is required";
        if (!sf.city) newErrors.city = "City is required";
        // Postal code is optional for international compatibility
        if (!sf.country) newErrors.country = "Country is required";
        if (!sf.estimateJobs)
          newErrors.estimateJobs = "Please select an estimate";
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
      if (currentStep < 3 && userType === "school") {
        setCurrentStep(currentStep + 1);
      } else if (currentStep < 2 && userType === "teacher") {
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

  const clearStoredData = () => {
    sessionStorage.removeItem("signupSchoolForm");
    sessionStorage.removeItem("signupTeacherForm");
    sessionStorage.removeItem("signupUserType");
    sessionStorage.removeItem("signupStep");
    sessionStorage.removeItem("signupSelectedPlan");
    sessionStorage.removeItem("signupBillingType");
  };

  const handleRegistration = async () => {
    if (!validateCurrentStep()) return;

    setLoading(true);

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
            userType: "TEACHER",
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

          if (userType === "teacher") {
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
          if (errorMessage.includes("already exists")) {
            setErrors({
              submit:
                "An account with this email already exists. Please try logging in instead.",
            });
          } else if (errorMessage.includes("required")) {
            setErrors({ submit: "Please fill in all required fields." });
          } else if (errorMessage.includes("password")) {
            setErrors({
              submit: "Password must be at least 8 characters long.",
            });
          } else if (errorMessage.includes("email")) {
            setErrors({ submit: "Please provide a valid email address." });
          } else {
            setErrors({ submit: errorMessage });
          }
        }
      } else {
        // School registration - redirect to Stripe
        if (!selectedPlan) {
          setErrors({ plan: "Please select a plan" });
          return;
        }

        const priceId =
          billingType === "monthly"
            ? selectedPlan.priceIdMonthly
            : selectedPlan.priceIdAnnual;

        if (!priceId) {
          setErrors({ plan: "Selected plan is not available" });
          return;
        }

        const response = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priceId: priceId,
            userType: "school",
            formData: {
              ...schoolForm,
              confirmPassword: undefined, // Don't send confirmPassword to backend
            },
            planName: selectedPlan.name,
            billingType,
            cancelUrl: `${window.location.origin}/signup?from=payment`,
          }),
        });

        const { url } = await response.json();
        window.location.href = url;
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
              {[1, 2, ...(userType === "school" ? [3] : [])].map((step) => (
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
                  {step < (userType === "school" ? 3 : 2) && (
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
                      <div className="grid md:grid-cols-2 gap-6">
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

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            School Type *
                          </label>
                          <select
                            value={schoolForm.schoolType}
                            onChange={(e) =>
                              setSchoolForm({
                                ...schoolForm,
                                schoolType: e.target.value,
                              })
                            }
                            className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                            required
                          >
                            <option value="">Select...</option>
                            {SCHOOL_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
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
                            Phone Number *
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

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Street Address *
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
                            Website
                          </label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                            <input
                              type="url"
                              value={schoolForm.website}
                              onChange={(e) =>
                                setSchoolForm({
                                  ...schoolForm,
                                  website: e.target.value,
                                })
                              }
                              className="input pl-10"
                              placeholder="https://www.yourschool.com"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Expected Hires/Year *
                          </label>
                          <select
                            value={schoolForm.estimateJobs}
                            onChange={(e) =>
                              setSchoolForm({
                                ...schoolForm,
                                estimateJobs: e.target.value,
                              })
                            }
                            className={`input ${errors.estimateJobs ? "border-red-500" : ""}`}
                          >
                            <option value="">Select estimate</option>
                            <option value="1-5">1-5 teachers</option>
                            <option value="6-15">6-15 teachers</option>
                            <option value="16-30">16-30 teachers</option>
                            <option value="31+">31+ teachers</option>
                          </select>
                          {errors.estimateJobs && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.estimateJobs}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          School Description
                        </label>
                        <textarea
                          value={schoolForm.description}
                          onChange={(e) =>
                            setSchoolForm({
                              ...schoolForm,
                              description: e.target.value,
                            })
                          }
                          className="input min-h-[100px]"
                          placeholder="Tell us about your school..."
                        />
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
                            Phone Number *
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

            {/* Step 3: School Plan Selection */}
            {isInitialized && currentStep === 3 && userType === "school" && (
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
