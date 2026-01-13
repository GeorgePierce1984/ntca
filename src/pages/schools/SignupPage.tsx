import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ArrowRight, CreditCard, Building2 } from "lucide-react";
import { CENTRAL_ASIA_COUNTRIES, SCHOOL_TYPES } from "@/constants/options";
import { CountrySelector } from "@/components/forms/CountrySelector";
import { type Country, getCountryByName } from "@/data/countries";

interface SchoolForm {
  name: string;
  streetAddress: string; // Changed from 'address' to match database
  email: string;
  password: string;
  contactName: string;
  telephone: string;
  country: string;
  estimateJobs: string;
  schoolType: string;
  city: string;
  state: string;
  postalCode: string;
}

const initialForm: SchoolForm = {
  name: "",
  streetAddress: "", // Changed from 'address'
  email: "",
  password: "",
  contactName: "",
  telephone: "",
  country: "",
  estimateJobs: "",
  schoolType: "",
  city: "",
  state: "",
  postalCode: "",
};

const planEnvMap: Record<
  string,
  { monthly: string; annual: string; price: number }
> = {
  basic: {
    monthly: import.meta.env.VITE_STRIPE_BASIC_MONTHLY_USD as string,
    annual: import.meta.env.VITE_STRIPE_BASIC_ANNUAL_USD as string,
    price: 49,
  },
  standard: {
    monthly: import.meta.env.VITE_STRIPE_STANDARD_MONTHLY_USD as string,
    annual: import.meta.env.VITE_STRIPE_STANDARD_ANNUAL_USD as string,
    price: 109,
  },
  premium: {
    monthly: import.meta.env.VITE_STRIPE_PREMIUM_MONTHLY_USD as string,
    annual: import.meta.env.VITE_STRIPE_PREMIUM_ANNUAL_USD as string,
    price: 199,
  },
};

const SignupPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => {
    // Try to restore form data from sessionStorage
    const savedForm = sessionStorage.getItem("schoolSignupForm");
    return savedForm ? JSON.parse(savedForm) : initialForm;
  });
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);
  const planKey = (params.get("plan") || "basic").toLowerCase();
  const plan = planEnvMap[planKey] || planEnvMap.basic;

  // Save form data to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("schoolSignupForm", JSON.stringify(form));
  }, [form]);

  // Initialize selected country from form data
  useEffect(() => {
    if (form.country && !selectedCountry) {
      const country = getCountryByName(form.country);
      if (country) {
        setSelectedCountry(country);
      }
    }
  }, [form.country, selectedCountry]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setForm({ ...form, country: country.name });
    // Clear error for this field
    if (errors.country) {
      setErrors({ ...errors, country: "" });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name) newErrors.name = "School name is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";
    if (form.password && form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (form.password !== passwordConfirm) {
      newErrors.passwordConfirm = "Passwords do not match";
    }
    if (!form.contactName) newErrors.contactName = "Contact name is required";
    if (!form.telephone) newErrors.telephone = "Telephone is required";
    if (!form.country) newErrors.country = "Country is required";
    if (!form.schoolType) newErrors.schoolType = "School type is required";
    if (!form.city) newErrors.city = "City is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const priceId = billing === "monthly" ? plan.monthly : plan.annual;
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, metadata: form }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error creating checkout session");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
  };

  const getAnnualPrice = () => {
    return Math.round(plan.price * 12 * 0.83); // 17% discount
  };

  const getSavings = () => {
    const monthlyTotal = plan.price * 12;
    const annualTotal = getAnnualPrice();
    return monthlyTotal - annualTotal;
  };

  return (
    <section className="section">
      <div className="container-custom max-w-3xl mx-auto">
        {/* Back button */}
        <Button
          variant="secondary"
          onClick={() => navigate("/pricing")}
          leftIcon={<ArrowLeft className="w-5 h-5" />}
          className="mb-6"
        >
          Back to Plans
        </Button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-4">
            <Building2 className="w-5 h-5" />
            <span className="font-medium">
              {planKey.charAt(0).toUpperCase() + planKey.slice(1)} Plan
            </span>
          </div>
          <h1 className="heading-1 mb-6">Complete Your School Registration</h1>

          {/* Billing toggle */}
          <div className="inline-flex mb-6 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                billing === "monthly"
                  ? "bg-white dark:bg-neutral-900 shadow-sm"
                  : "opacity-70"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                billing === "annual"
                  ? "bg-white dark:bg-neutral-900 shadow-sm"
                  : "opacity-70"
              }`}
            >
              Annual (Save ${getSavings()})
            </button>
          </div>

          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            ${billing === "monthly" ? plan.price : getAnnualPrice()}
            <span className="text-neutral-500 text-lg font-normal">
              /{billing === "monthly" ? "month" : "year"}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-6">
          <h2 className="heading-3 mb-6">School Information</h2>

          {/* School Name and Type */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                School Name *
              </label>
              <input
                className={`input ${errors.name ? "border-red-500" : ""}`}
                placeholder="Enter school name"
                name="name"
                value={form.name}
                required
                onChange={handleChange}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                School Type *
              </label>
              <select
                name="schoolType"
                value={form.schoolType}
                onChange={handleChange}
                className={`w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 ${errors.schoolType ? "border-red-500" : ""}`}
                required
              >
                <option value="">Select...</option>
                {SCHOOL_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.schoolType && (
                <p className="text-red-500 text-sm mt-1">{errors.schoolType}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Street Address *
            </label>
            <input
              className="input"
              placeholder="Enter street address"
              name="streetAddress"
              value={form.streetAddress}
              required
              onChange={handleChange}
            />
          </div>

          {/* City, State, Postal/ZIP Code */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">City *</label>
              <input
                className={`input ${errors.city ? "border-red-500" : ""}`}
                placeholder="City"
                name="city"
                value={form.city}
                required
                onChange={handleChange}
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                State/Province
              </label>
              <input
                className="input"
                placeholder="State or province"
                name="state"
                value={form.state}
                onChange={handleChange}
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
                className="input"
                placeholder="e.g., 12345, SW1A 1AA"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium mb-2">Country *</label>
            <CountrySelector
              selectedCountry={selectedCountry}
              onSelect={handleCountrySelect}
              placeholder="Select country"
              filterToCentralAsia={true}
            />
            {errors.country && (
              <p className="text-red-500 text-sm mt-1">{errors.country}</p>
            )}
          </div>

          <h2 className="heading-3 mb-6 mt-8">Contact Information</h2>

          {/* Contact Name and Email */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Contact Name *
              </label>
              <input
                className={`input ${errors.contactName ? "border-red-500" : ""}`}
                placeholder="Full name"
                name="contactName"
                value={form.contactName}
                required
                onChange={handleChange}
              />
              {errors.contactName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.contactName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Telephone *
              </label>
              <input
                className={`input ${errors.telephone ? "border-red-500" : ""}`}
                placeholder="+1 234 567 8900"
                name="telephone"
                value={form.telephone}
                required
                onChange={handleChange}
              />
              {errors.telephone && (
                <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>
              )}
            </div>
          </div>

          {/* Email and Password */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                className={`input ${errors.email ? "border-red-500" : ""}`}
                placeholder="email@school.edu"
                name="email"
                value={form.email}
                required
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Estimated Jobs Per Year *
              </label>
              <select
                name="estimateJobs"
                value={form.estimateJobs}
                onChange={handleChange}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                required
              >
                <option value="">Select estimate</option>
                <option value="1-2 jobs per year">1-2 jobs per year</option>
                <option value="3-5 jobs per year">3-5 jobs per year</option>
                <option value="6-10 jobs per year">6-10 jobs per year</option>
                <option value="10+ jobs per year">10+ jobs per year</option>
                <option value="As needed">As needed</option>
              </select>
            </div>
          </div>

          <h2 className="heading-3 mb-6 mt-8">Create Your Account</h2>

          {/* Password fields */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Password *
              </label>
              <input
                type="password"
                className={`input ${errors.password ? "border-red-500" : ""}`}
                placeholder="Min. 8 characters"
                name="password"
                value={form.password}
                required
                onChange={handleChange}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                className={`input ${errors.passwordConfirm ? "border-red-500" : ""}`}
                placeholder="Re-enter password"
                value={passwordConfirm}
                onChange={(e) => {
                  setPasswordConfirm(e.target.value);
                  if (errors.passwordConfirm) {
                    setErrors({ ...errors, passwordConfirm: "" });
                  }
                }}
                required
              />
              {errors.passwordConfirm && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.passwordConfirm}
                </p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              type="submit"
              variant="gradient"
              rightIcon={<CreditCard className="w-5 h-5" />}
              className="w-full"
            >
              Continue to Payment
            </Button>
            <p className="text-sm text-center text-neutral-500 mt-4">
              You will be redirected to Stripe for secure payment processing
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignupPage;
