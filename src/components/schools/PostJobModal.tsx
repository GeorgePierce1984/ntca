import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Briefcase,
  Award,
  Building,
  AlertCircle,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { countries, type Country, getCountryByName } from "@/data/countries";
import { CountrySelector } from "@/components/forms/CountrySelector";

interface JobForm {
  title: string;
  subjectsTaught: string;
  studentAgeGroupMin: number | undefined;
  studentAgeGroupMax: number | undefined;
  startDate: string;
  contractLength: string;
  contractMonths: number | string | undefined;
  contractYears: number | string | undefined;
  city: string;
  country: string;
  employmentType: string;
  salary: string;
  deadline: string;
  teachingHoursPerWeek: string;
  description: string;
  qualifications: string;
  benefits: string;
  useSchoolProfile: boolean;
  schoolDescription: string;
  useSchoolBenefits: boolean;
  teachingLicenseRequired: boolean;
  kazakhLanguageRequired: boolean;
  localCertificationRequired: boolean;
  // Financial benefits
  housingProvided: boolean;
  flightReimbursement: boolean;
  visaWorkPermitSupport: boolean;
  contractCompletionBonus: boolean;
  paidHolidays: boolean;
  overtimePay: boolean;
  // Lifestyle & Wellbeing
  paidAnnualLeave: boolean;
  nationalHolidays: boolean;
  sickLeave: boolean;
  healthInsurance: boolean;
  relocationSupport: boolean;
  // Professional Support
  teachingMaterialsProvided: boolean;
  curriculumGuidance: boolean;
  teacherTraining: boolean;
  promotionOpportunities: boolean;
  contractRenewalOptions: boolean;
  // Requirements - Essential
  nativeEnglishLevel: boolean;
  bachelorsDegree: boolean;
  bachelorsDegreeSubject: string;
  tefl: boolean;
  celta: boolean;
  tesol: boolean;
  delta: boolean;
  minimumTeachingExperience: string;
  // Requirements - Preferred
  ieltsExperience: boolean;
  cambridgeExperience: boolean;
  satExperience: boolean;
  classroomExperience: boolean;
  onlineExperience: boolean;
  centralAsiaExperience: boolean;
  // Requirements - Legal
  visaSupport: string;
  backgroundCheckRequired: boolean;
}

interface SchoolProfile {
  description?: string;
  studentAgeRangeMin?: number;
  studentAgeRangeMax?: number;
  benefits?: string;
  profileComplete?: boolean;
  completionPercentage?: number;
}

interface JobPosting {
  id: string;
}

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobForm: JobForm;
  setJobForm: React.Dispatch<React.SetStateAction<JobForm>>;
  handleJobSubmit: (e: React.FormEvent) => void;
  subscriptionStatus: string | null;
  schoolProfile: SchoolProfile | null;
  selectedJobForEdit: JobPosting | null;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({
  isOpen,
  onClose,
  jobForm,
  setJobForm,
  handleJobSubmit,
  subscriptionStatus,
  schoolProfile,
  selectedJobForEdit,
}) => {
  const [activeTab, setActiveTab] = useState("role");
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const tabs = [
    { key: "role", label: "Role Information", icon: Briefcase },
    { key: "description", label: "Job Description", icon: FileText },
    { key: "requirements", label: "Requirements", icon: Award },
    { key: "benefits", label: "Benefits & Support", icon: Users },
    { key: "school", label: "School Information", icon: Building },
  ];

  // Reset to "Role Information" tab whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("role");
      setFieldErrors({}); // Clear errors when modal opens
    }
  }, [isOpen]);

  // Initialize selected country from jobForm.country
  useEffect(() => {
    if (jobForm.country) {
      const country = getCountryByName(jobForm.country);
      if (country) {
        setSelectedCountry(country);
      }
    } else {
      setSelectedCountry(undefined);
    }
  }, [jobForm.country]);

  const currentTabIndex = tabs.findIndex(tab => tab.key === activeTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === tabs.length - 1;

  const handlePreviousTab = () => {
    if (!isFirstTab) {
      setActiveTab(tabs[currentTabIndex - 1].key);
    }
  };

  const handleNextTab = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isLastTab) {
      setActiveTab(tabs[currentTabIndex + 1].key);
    }
  };

  // Validate required fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Required fields based on API validation
    if (!jobForm.title || !jobForm.title.trim()) {
      errors.title = "Job title is required";
    }
    if (!jobForm.description || !jobForm.description.trim()) {
      errors.description = "Job description is required";
    }
    if (!jobForm.city || !jobForm.city.trim()) {
      errors.city = "City is required";
    }
    if (!jobForm.country || !jobForm.country.trim()) {
      errors.country = "Country is required";
    }
    if (!jobForm.salary || !jobForm.salary.trim()) {
      errors.salary = "Salary is required";
    }
    if (!jobForm.employmentType || !jobForm.employmentType.trim()) {
      errors.employmentType = "Employment type is required";
    }
    if (!jobForm.deadline || !jobForm.deadline.trim()) {
      errors.deadline = "Application deadline is required";
    }

    setFieldErrors(errors);
    
    // If there are errors, navigate to the first tab with an error and focus on the first field
    if (Object.keys(errors).length > 0) {
      // Determine which tab contains the first error
      const errorFields = Object.keys(errors);
      const firstError = errorFields[0];
      
      // Map fields to tabs
      const fieldToTab: Record<string, string> = {
        title: "role",
        deadline: "role",
        city: "role",
        country: "role",
        employmentType: "role",
        salary: "role",
        description: "description",
      };
      
      const targetTab = fieldToTab[firstError] || "role";
      setActiveTab(targetTab);
      
      // Focus on the first error field after a short delay to ensure tab switch completes
      setTimeout(() => {
        const fieldId = firstError === "country" ? "country-selector" : firstError;
        const fieldElement = document.getElementById(fieldId) || 
                            document.querySelector(`[name="${firstError}"]`) ||
                            document.querySelector(`input[placeholder*="${firstError}"]`);
        
        if (fieldElement) {
          (fieldElement as HTMLElement).focus();
          (fieldElement as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      
      return false;
    }
    
    return true;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-6xl w-full h-[95vh] flex flex-col overflow-hidden"
            >
              {/* Header with Close Button */}
              <div className="flex-shrink-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="heading-2">
                  {selectedJobForEdit ? "Edit Job Posting" : "Post New Job"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Subscription Warning */}
              {(subscriptionStatus?.toLowerCase() === "cancelled" || subscriptionStatus?.toLowerCase() === "past_due") && (
                <div className="flex-shrink-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
                  <div className={`p-4 rounded-lg border ${
                    subscriptionStatus?.toLowerCase() === "cancelled"
                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                  }`}>
                    <div className="flex items-start gap-3">
                      <AlertCircle className={`w-5 h-5 mt-0.5 ${
                        subscriptionStatus?.toLowerCase() === "cancelled"
                          ? "text-red-600 dark:text-red-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`} />
                      <div className="flex-1">
                        <p className={`font-medium mb-1 ${
                          subscriptionStatus?.toLowerCase() === "cancelled"
                            ? "text-red-900 dark:text-red-100"
                            : "text-amber-900 dark:text-amber-100"
                        }`}>
                          {subscriptionStatus?.toLowerCase() === "cancelled"
                            ? "Subscription Expired"
                            : "Payment Past Due"}
                        </p>
                        <p className={`text-sm mb-3 ${
                          subscriptionStatus?.toLowerCase() === "cancelled"
                            ? "text-red-700 dark:text-red-300"
                            : "text-amber-700 dark:text-amber-300"
                        }`}>
                          {subscriptionStatus?.toLowerCase() === "cancelled"
                            ? "You cannot post new jobs until you renew your subscription. All active jobs have been paused."
                            : "Please update your payment method to continue posting jobs."}
                        </p>
                        <Button
                          variant={subscriptionStatus?.toLowerCase() === "cancelled" ? "gradient" : "primary"}
                          size="sm"
                          onClick={() => window.location.href = "/schools/subscription"}
                        >
                          {subscriptionStatus?.toLowerCase() === "cancelled" ? "Renew Subscription" : "Update Payment"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Navigation */}
              <div className="flex-shrink-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <nav className="flex space-x-1 overflow-x-auto px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                          isActive
                            ? "border-primary-500 text-primary-600 dark:text-primary-400"
                            : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8">

                <form 
                  id="job-form" 
                  className="space-y-6" 
                  onSubmit={(e) => {
                    // Only allow form submission if we're on the last tab
                    if (activeTab !== "school") {
                      e.preventDefault();
                      return;
                    }
                    
                    // Validate form before submission
                    if (!validateForm()) {
                      e.preventDefault();
                      return;
                    }
                    
                    handleJobSubmit(e);
                  }}
                  onKeyDown={(e) => {
                    // Prevent Enter key from submitting form unless we're on the last tab and submit button is focused
                    if (e.key === "Enter" && activeTab !== "school") {
                      e.preventDefault();
                    }
                    // If Enter is pressed in a textarea, don't submit
                    if (e.key === "Enter" && (e.target as HTMLElement).tagName === "TEXTAREA") {
                      return; // Allow default behavior for textareas
                    }
                  }}
                >
                  {/* Role Information Tab */}
                  {activeTab === "role" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-end mb-4">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium">
                            Application Deadline *
                          </label>
                          <input 
                            type="date" 
                            id="deadline"
                            value={jobForm.deadline}
                            onChange={(e) => {
                              setJobForm({
                                ...jobForm,
                                deadline: e.target.value,
                              });
                              // Clear error when user starts typing
                              if (fieldErrors.deadline) {
                                setFieldErrors({ ...fieldErrors, deadline: "" });
                              }
                            }}
                            className={`input w-auto ${fieldErrors.deadline ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                            required 
                          />
                          {fieldErrors.deadline && (
                            <p className="text-red-500 text-sm mt-1">{fieldErrors.deadline}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Job Title *
                        </label>
                        <input
                          type="text"
                          id="title"
                          value={jobForm.title}
                          onChange={(e) => {
                            setJobForm({
                              ...jobForm,
                              title: e.target.value,
                            });
                            // Clear error when user starts typing
                            if (fieldErrors.title) {
                              setFieldErrors({ ...fieldErrors, title: "" });
                            }
                          }}
                          className={`input ${fieldErrors.title ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                          placeholder="e.g., Senior English Teacher - CELTA Required"
                          required
                        />
                        {fieldErrors.title && (
                          <p className="text-red-500 text-sm mt-1">{fieldErrors.title}</p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Subject(s) Taught
                          </label>
                          <input
                            type="text"
                            value={jobForm.subjectsTaught}
                            onChange={(e) => setJobForm({
                              ...jobForm,
                              subjectsTaught: e.target.value,
                            })}
                            className="input"
                            placeholder="e.g., English, Mathematics, Science"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Student Age Group(s)
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-neutral-500 mb-1">Min Age</label>
                              <select
                                value={jobForm.studentAgeGroupMin || ""}
                                onChange={(e) => setJobForm({
                                  ...jobForm,
                                  studentAgeGroupMin: e.target.value ? parseInt(e.target.value) : undefined,
                                })}
                                className="input"
                              >
                                <option value="">Select...</option>
                                {Array.from({ length: 31 }, (_, i) => (
                                  <option key={i} value={i}>{i}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-neutral-500 mb-1">Max Age</label>
                              <select
                                value={jobForm.studentAgeGroupMax !== undefined && jobForm.studentAgeGroupMax >= 30 ? "30+" : (jobForm.studentAgeGroupMax || "")}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === "30+") {
                                    setJobForm({
                                      ...jobForm,
                                      studentAgeGroupMax: 30,
                                    });
                                  } else {
                                    setJobForm({
                                      ...jobForm,
                                      studentAgeGroupMax: value ? parseInt(value) : undefined,
                                    });
                                  }
                                }}
                                className="input"
                              >
                                <option value="">Select...</option>
                                {Array.from({ length: 31 }, (_, i) => (
                                  <option key={i} value={i}>{i}</option>
                                ))}
                                <option value="30+">30+</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            City/Town *
                          </label>
                          <input
                            type="text"
                            id="city"
                            value={jobForm.city}
                            onChange={(e) => {
                              setJobForm({
                                ...jobForm,
                                city: e.target.value,
                              });
                              // Clear error when user starts typing
                              if (fieldErrors.city) {
                                setFieldErrors({ ...fieldErrors, city: "" });
                              }
                            }}
                            className={`input ${fieldErrors.city ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                            placeholder="e.g., Almaty"
                            required
                          />
                          {fieldErrors.city && (
                            <p className="text-red-500 text-sm mt-1">{fieldErrors.city}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Country *
                          </label>
                          <div id="country-selector">
                            <CountrySelector
                              selectedCountry={selectedCountry}
                              onSelect={(country) => {
                                setSelectedCountry(country);
                                setJobForm({
                                  ...jobForm,
                                  country: country.name,
                                });
                                // Clear error when user selects a country
                                if (fieldErrors.country) {
                                  setFieldErrors({ ...fieldErrors, country: "" });
                                }
                              }}
                              placeholder="Select a country"
                              filterToCentralAsia={true}
                            />
                          </div>
                          {fieldErrors.country && (
                            <p className="text-red-500 text-sm mt-1">{fieldErrors.country}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={jobForm.startDate}
                            onChange={(e) => setJobForm({
                              ...jobForm,
                              startDate: e.target.value,
                            })}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Contract Length
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-neutral-500 mb-1">Years</label>
                              <select
                                value={jobForm.contractYears || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const years = value === "N/A" ? "N/A" : (value ? parseInt(value) : undefined);
                                  const months = jobForm.contractMonths;
                                  
                                  // Build contract length string
                                  let contractLengthStr = "";
                                  if (months === "N/A" && years === "N/A") {
                                    contractLengthStr = "N/A";
                                  } else if (months === "N/A" && years && years !== "N/A") {
                                    contractLengthStr = `${years} year(s)`;
                                  } else if (years === "N/A" && months && months !== "N/A") {
                                    contractLengthStr = `${months} month(s)`;
                                  } else if (months && months !== "N/A" && years && years !== "N/A") {
                                    contractLengthStr = `${years} year(s) ${months} month(s)`;
                                  } else if (months && months !== "N/A") {
                                    contractLengthStr = `${months} month(s)`;
                                  } else if (years && years !== "N/A") {
                                    contractLengthStr = `${years} year(s)`;
                                  }
                                  
                                  setJobForm({
                                    ...jobForm,
                                    contractYears: years,
                                    contractLength: contractLengthStr,
                                  });
                                }}
                                className={`input ${jobForm.contractYears === "N/A" ? "bg-neutral-100 dark:bg-neutral-700 text-neutral-400" : ""}`}
                              >
                                <option value="">Select...</option>
                                <option value="N/A">N/A</option>
                                {Array.from({ length: 5 }, (_, i) => (
                                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-neutral-500 mb-1">Months</label>
                              <select
                                value={jobForm.contractMonths || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const months = value === "N/A" ? "N/A" : (value ? parseInt(value) : undefined);
                                  const years = jobForm.contractYears;
                                  
                                  // Build contract length string
                                  let contractLengthStr = "";
                                  if (months === "N/A" && years === "N/A") {
                                    contractLengthStr = "N/A";
                                  } else if (months === "N/A" && years && years !== "N/A") {
                                    contractLengthStr = `${years} year(s)`;
                                  } else if (years === "N/A" && months && months !== "N/A") {
                                    contractLengthStr = `${months} month(s)`;
                                  } else if (months && months !== "N/A" && years && years !== "N/A") {
                                    contractLengthStr = `${years} year(s) ${months} month(s)`;
                                  } else if (months && months !== "N/A") {
                                    contractLengthStr = `${months} month(s)`;
                                  } else if (years && years !== "N/A") {
                                    contractLengthStr = `${years} year(s)`;
                                  }
                                  
                                  setJobForm({
                                    ...jobForm,
                                    contractMonths: months,
                                    contractLength: contractLengthStr,
                                  });
                                }}
                                className={`input ${jobForm.contractMonths === "N/A" ? "bg-neutral-100 dark:bg-neutral-700 text-neutral-400" : ""}`}
                              >
                                <option value="">Select...</option>
                                <option value="N/A">N/A</option>
                                {Array.from({ length: 12 }, (_, i) => (
                                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Employment Type *
                          </label>
                          <select 
                            id="employmentType"
                            value={jobForm.employmentType}
                            onChange={(e) => {
                              setJobForm({
                                ...jobForm,
                                employmentType: e.target.value,
                              });
                              // Clear error when user selects an option
                              if (fieldErrors.employmentType) {
                                setFieldErrors({ ...fieldErrors, employmentType: "" });
                              }
                            }}
                            className={`input ${fieldErrors.employmentType ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                            required
                          >
                            <option value="">Select type</option>
                            <option value="FULL_TIME">Full-time</option>
                            <option value="PART_TIME">Part-time</option>
                            <option value="CONTRACT">Contract</option>
                          </select>
                          {fieldErrors.employmentType && (
                            <p className="text-red-500 text-sm mt-1">{fieldErrors.employmentType}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Salary (Monthly) *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">$</span>
                            <input
                              type="text"
                              id="salary"
                              value={jobForm.salary}
                              onChange={(e) => {
                                setJobForm({
                                  ...jobForm,
                                  salary: e.target.value,
                                });
                                // Clear error when user starts typing
                                if (fieldErrors.salary) {
                                  setFieldErrors({ ...fieldErrors, salary: "" });
                                }
                              }}
                              className={`input pl-7 ${fieldErrors.salary ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                              placeholder="e.g., 2,800 - 3,500"
                              required
                            />
                            {fieldErrors.salary && (
                              <p className="text-red-500 text-sm mt-1">{fieldErrors.salary}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Teaching Hours Per Week
                          </label>
                          <input
                            type="number"
                            value={jobForm.teachingHoursPerWeek}
                            onChange={(e) => setJobForm({
                              ...jobForm,
                              teachingHoursPerWeek: e.target.value,
                            })}
                            className="input"
                            placeholder="e.g., 20, 25, 30"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Job Description Tab */}
                  {activeTab === "description" && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Job Description *
                      </label>
                      <textarea
                        id="description"
                        value={jobForm.description}
                        onChange={(e) => {
                          setJobForm({
                            ...jobForm,
                            description: e.target.value,
                          });
                          // Clear error when user starts typing
                          if (fieldErrors.description) {
                            setFieldErrors({ ...fieldErrors, description: "" });
                          }
                        }}
                        className={`input ${fieldErrors.description ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                        rows={6}
                        placeholder="Describe the role, responsibilities, and what makes your school a great place to work..."
                        required
                      />
                      {fieldErrors.description && (
                        <p className="text-red-500 text-sm mt-1">{fieldErrors.description}</p>
                      )}
                    </div>
                  )}

                  {/* Requirements Tab */}
                  {activeTab === "requirements" && (
                    <div className="space-y-6">
                      {/* Essential Subsection */}
                      <div>
                        <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3">Essential</h4>
                        <div className="space-y-4">
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={jobForm.nativeEnglishLevel}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                nativeEnglishLevel: e.target.checked,
                              })}
                              className="rounded" 
                            />
                            <span className="text-sm break-words overflow-wrap-anywhere">Native or Near-Native English Level</span>
                          </label>
                          
                          <div className="space-y-2">
                            <label className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                checked={jobForm.bachelorsDegree}
                                onChange={(e) => setJobForm({
                                  ...jobForm,
                                  bachelorsDegree: e.target.checked,
                                })}
                                className="rounded" 
                              />
                              <span className="text-sm break-words overflow-wrap-anywhere">Bachelor's Degree</span>
                            </label>
                            {jobForm.bachelorsDegree && (
                              <div className="ml-6">
                                <input
                                  type="text"
                                  value={jobForm.bachelorsDegreeSubject}
                                  onChange={(e) => setJobForm({
                                    ...jobForm,
                                    bachelorsDegreeSubject: e.target.value,
                                  })}
                                  className="input text-sm"
                                  placeholder="Subject Specific (Optional)"
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-xs text-neutral-500 mb-2 block">Certification:</label>
                            <div className="grid md:grid-cols-4 gap-3">
                              <label className="flex items-center gap-2">
                                <input 
                                  type="checkbox" 
                                  checked={jobForm.tefl}
                                  onChange={(e) => setJobForm({
                                    ...jobForm,
                                    tefl: e.target.checked,
                                  })}
                                  className="rounded" 
                                />
                                <span className="text-sm">TEFL</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input 
                                  type="checkbox" 
                                  checked={jobForm.celta}
                                  onChange={(e) => setJobForm({
                                    ...jobForm,
                                    celta: e.target.checked,
                                  })}
                                  className="rounded" 
                                />
                                <span className="text-sm">CELTA</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input 
                                  type="checkbox" 
                                  checked={jobForm.tesol}
                                  onChange={(e) => setJobForm({
                                    ...jobForm,
                                    tesol: e.target.checked,
                                  })}
                                  className="rounded" 
                                />
                                <span className="text-sm">TESOL</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input 
                                  type="checkbox" 
                                  checked={jobForm.delta}
                                  onChange={(e) => setJobForm({
                                    ...jobForm,
                                    delta: e.target.checked,
                                  })}
                                  className="rounded" 
                                />
                                <span className="text-sm">DELTA</span>
                              </label>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <label className="text-sm">Minimum Teaching Experience:</label>
                            <select
                              value={jobForm.minimumTeachingExperience}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                minimumTeachingExperience: e.target.value,
                              })}
                              className="input w-1/4"
                            >
                              <option value="">Select...</option>
                              {Array.from({ length: 30 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'year' : 'years'}</option>
                              ))}
                              <option value="30+">30+ years</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Preferred Subsection */}
                      <div>
                        <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3">Preferred</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-neutral-500 mb-2 block">Specific Exam Experience:</label>
                            <div className="grid md:grid-cols-3 gap-3">
                              <label className="flex items-center gap-2">
                                <input 
                                  type="checkbox" 
                                  checked={jobForm.ieltsExperience}
                                  onChange={(e) => setJobForm({
                                    ...jobForm,
                                    ieltsExperience: e.target.checked,
                                  })}
                                  className="rounded" 
                                />
                                <span className="text-sm">IELTS</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input 
                                  type="checkbox" 
                                  checked={jobForm.cambridgeExperience}
                                  onChange={(e) => setJobForm({
                                    ...jobForm,
                                    cambridgeExperience: e.target.checked,
                                  })}
                                  className="rounded" 
                                />
                                <span className="text-sm">Cambridge</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input 
                                  type="checkbox" 
                                  checked={jobForm.satExperience}
                                  onChange={(e) => setJobForm({
                                    ...jobForm,
                                    satExperience: e.target.checked,
                                  })}
                                  className="rounded" 
                                />
                                <span className="text-sm">SAT</span>
                              </label>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-xs text-neutral-500 mb-2 block">Experience Type:</label>
                            <div className="grid md:grid-cols-2 gap-3">
                              <label className="flex items-center gap-2">
                                <input 
                                  type="checkbox" 
                                  checked={jobForm.classroomExperience}
                                  onChange={(e) => setJobForm({
                                    ...jobForm,
                                    classroomExperience: e.target.checked,
                                  })}
                                  className="rounded" 
                                />
                                <span className="text-sm break-words overflow-wrap-anywhere">Classroom Experience</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input 
                                  type="checkbox" 
                                  checked={jobForm.onlineExperience}
                                  onChange={(e) => setJobForm({
                                    ...jobForm,
                                    onlineExperience: e.target.checked,
                                  })}
                                  className="rounded" 
                                />
                                <span className="text-sm break-words overflow-wrap-anywhere">Online Experience</span>
                              </label>
                            </div>
                          </div>
                          
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={jobForm.centralAsiaExperience}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                centralAsiaExperience: e.target.checked,
                              })}
                              className="rounded" 
                            />
                            <span className="text-sm break-words overflow-wrap-anywhere">Experience in Central Asia or Similar Region</span>
                          </label>
                        </div>
                      </div>

                      {/* Legal Subsection */}
                      <div>
                        <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3">Legal</h4>
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">Visa Support</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <label className="flex items-center gap-2">
                                <input 
                                  type="radio" 
                                  name="visaSupport"
                                  value="Visa Sponsored"
                                  checked={jobForm.visaSupport === "Visa Sponsored"}
                                  onChange={(e) => setJobForm({
                                    ...jobForm,
                                    visaSupport: e.target.value,
                                  })}
                                  className="rounded" 
                                />
                                <span className="text-sm break-words overflow-wrap-anywhere">Visa Sponsored</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input 
                                  type="radio" 
                                  name="visaSupport"
                                  value="Visa Assistance"
                                  checked={jobForm.visaSupport === "Visa Assistance"}
                                  onChange={(e) => setJobForm({
                                    ...jobForm,
                                    visaSupport: e.target.value,
                                  })}
                                  className="rounded" 
                                />
                                <span className="text-sm break-words overflow-wrap-anywhere">Visa Assistance</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input 
                                  type="radio" 
                                  name="visaSupport"
                                  value="No Visa Support"
                                  checked={jobForm.visaSupport === "No Visa Support"}
                                  onChange={(e) => setJobForm({
                                    ...jobForm,
                                    visaSupport: e.target.value,
                                  })}
                                  className="rounded" 
                                />
                                <span className="text-sm break-words overflow-wrap-anywhere">No Visa Support</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input 
                                  type="radio" 
                                  name="visaSupport"
                                  value="Must Already Have Right to Work"
                                  checked={jobForm.visaSupport === "Must Already Have Right to Work"}
                                  onChange={(e) => setJobForm({
                                    ...jobForm,
                                    visaSupport: e.target.value,
                                  })}
                                  className="rounded" 
                                />
                                <span className="text-sm break-words overflow-wrap-anywhere">Must Already Have Right to Work</span>
                              </label>
                            </div>
                          </div>
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={jobForm.backgroundCheckRequired}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                backgroundCheckRequired: e.target.checked,
                              })}
                              className="rounded" 
                            />
                            <span className="text-sm break-words overflow-wrap-anywhere">Background Check Requirement</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Benefits & Support Tab */}
                  {activeTab === "benefits" && (
                    <div className="space-y-6">
                      <div className="space-y-4 mb-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={jobForm.useSchoolBenefits}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            // Always populate benefits from school profile when available
                            // This allows schools to see their defaults whether checked or unchecked
                            if (schoolProfile?.benefits) {
                              try {
                                const parsedBenefits = JSON.parse(schoolProfile.benefits);
                                setJobForm({
                                  ...jobForm,
                                  useSchoolBenefits: checked,
                                  housingProvided: parsedBenefits.housingProvided || false,
                                  flightReimbursement: parsedBenefits.flightReimbursement || false,
                                  visaWorkPermitSupport: parsedBenefits.visaWorkPermitSupport || false,
                                  contractCompletionBonus: parsedBenefits.contractCompletionBonus || false,
                                  paidHolidays: parsedBenefits.paidHolidays || false,
                                  overtimePay: parsedBenefits.overtimePay || false,
                                  paidAnnualLeave: parsedBenefits.paidAnnualLeave || false,
                                  nationalHolidays: parsedBenefits.nationalHolidays || false,
                                  sickLeave: parsedBenefits.sickLeave || false,
                                  healthInsurance: parsedBenefits.healthInsurance || false,
                                  relocationSupport: parsedBenefits.relocationSupport || false,
                                  teachingMaterialsProvided: parsedBenefits.teachingMaterialsProvided || false,
                                  curriculumGuidance: parsedBenefits.curriculumGuidance || false,
                                  teacherTraining: parsedBenefits.teacherTraining || false,
                                  promotionOpportunities: parsedBenefits.promotionOpportunities || false,
                                  contractRenewalOptions: parsedBenefits.contractRenewalOptions || false,
                                });
                              } catch (e) {
                                setJobForm({ ...jobForm, useSchoolBenefits: checked });
                              }
                            } else {
                              setJobForm({ ...jobForm, useSchoolBenefits: checked });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm font-medium">Use School Benefits & Support Information</span>
                      </label>
                      
                      {jobForm.useSchoolBenefits && (!schoolProfile?.benefits || schoolProfile.benefits.trim() === "" || schoolProfile.benefits === "{}") && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                                No Benefits & Support Information Available
                              </p>
                              <p className="text-sm text-amber-700 dark:text-amber-300">
                                Please add Benefits & Support information in your school profile, or uncheck this option to add job-specific benefits below.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {!jobForm.useSchoolBenefits && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="space-y-6">
                      {/* Financial Subsection */}
                      <div>
                        <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-3">Financial</h4>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={jobForm.housingProvided}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                housingProvided: e.target.checked,
                              })}
                              className="rounded" 
                            />
                            <span className="text-sm break-words overflow-wrap-anywhere">Housing Provided/Allowance/Assistance</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={jobForm.flightReimbursement}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                flightReimbursement: e.target.checked,
                              })}
                              className="rounded" 
                            />
                            <span className="text-sm break-words overflow-wrap-anywhere">Flight Reimbursement (Full/Partial)</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={jobForm.visaWorkPermitSupport}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                visaWorkPermitSupport: e.target.checked,
                              })}
                              className="rounded" 
                            />
                            <span className="text-sm break-words overflow-wrap-anywhere">Visa & Work Permit Support</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={jobForm.contractCompletionBonus}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                contractCompletionBonus: e.target.checked,
                              })}
                              className="rounded" 
                            />
                            <span className="text-sm break-words overflow-wrap-anywhere">Contract Completion Bonus</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={jobForm.paidHolidays}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                paidHolidays: e.target.checked,
                              })}
                              className="rounded" 
                            />
                            <span className="text-sm break-words overflow-wrap-anywhere">Paid Holidays</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={jobForm.overtimePay}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                overtimePay: e.target.checked,
                              })}
                              className="rounded" 
                            />
                            <span className="text-sm break-words overflow-wrap-anywhere">Overtime Pay</span>
                          </label>
                        </div>
                      </div>

                      {/* Lifestyle & Wellbeing Subsection */}
                      <div>
                        <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-3">Lifestyle & Wellbeing</h4>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={jobForm.paidAnnualLeave}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                paidAnnualLeave: e.target.checked,
                              })}
                              className="rounded" 
                            />
                            <span className="text-sm break-words overflow-wrap-anywhere">Paid Annual Leave</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={jobForm.nationalHolidays}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                nationalHolidays: e.target.checked,
                              })}
                              className="rounded" 
                            />
                            <span className="text-sm break-words overflow-wrap-anywhere">National Holidays</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={jobForm.sickLeave}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                sickLeave: e.target.checked,
                              })}
                              className="rounded" 
                            />
                            <span className="text-sm break-words overflow-wrap-anywhere">Sick Leave</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={jobForm.healthInsurance}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                healthInsurance: e.target.checked,
                              })}
                              className="rounded" 
                            />
                            <span className="text-sm break-words overflow-wrap-anywhere">Health Insurance (Local/International)</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={jobForm.relocationSupport}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                relocationSupport: e.target.checked,
                              })}
                              className="rounded" 
                            />
                            <span className="text-sm break-words overflow-wrap-anywhere">Relocation Support</span>
                          </label>
                        </div>
                      </div>

                      {/* Professional Support Subsection */}
                      <div>
                        <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-3">Professional Support</h4>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={jobForm.teachingMaterialsProvided}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                teachingMaterialsProvided: e.target.checked,
                              })}
                              className="rounded" 
                            />
                            <span className="text-sm break-words overflow-wrap-anywhere">Teaching Materials Provided</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={jobForm.curriculumGuidance}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                curriculumGuidance: e.target.checked,
                              })}
                              className="rounded" 
                            />
                            <span className="text-sm break-words overflow-wrap-anywhere">Curriculum Guidance</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={jobForm.teacherTraining}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                teacherTraining: e.target.checked,
                              })}
                              className="rounded" 
                            />
                            <span className="text-sm break-words overflow-wrap-anywhere">Teacher Training</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={jobForm.promotionOpportunities}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                promotionOpportunities: e.target.checked,
                              })}
                              className="rounded" 
                            />
                            <span className="text-sm break-words overflow-wrap-anywhere">Promotion Opportunities</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={jobForm.contractRenewalOptions}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                contractRenewalOptions: e.target.checked,
                              })}
                              className="rounded" 
                            />
                            <span className="text-sm break-words overflow-wrap-anywhere">Contract Renewal Options</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                    </div>
                  )}

                  {/* School Information Tab */}
                  {activeTab === "school" && (
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={jobForm.useSchoolProfile}
                          onChange={(e) => setJobForm({
                            ...jobForm,
                            useSchoolProfile: e.target.checked,
                            schoolDescription: e.target.checked ? "" : jobForm.schoolDescription,
                          })}
                          className="rounded"
                        />
                        <span className="text-sm font-medium">Use school profile information</span>
                      </label>
                      
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {jobForm.useSchoolProfile 
                          ? schoolProfile?.description && schoolProfile.description.trim() !== ""
                            ? "Your school's profile description will be displayed to candidates"
                            : "⚠️ No profile description available - please add one or use custom description below"
                          : "Provide a custom description specific to this job posting"
                        }
                      </p>

                      {!jobForm.useSchoolProfile && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <textarea
                            rows={4}
                            value={jobForm.schoolDescription}
                            onChange={(e) => setJobForm({
                              ...jobForm,
                              schoolDescription: e.target.value,
                            })}
                            onKeyDown={(e) => {
                              // Prevent Enter from submitting form, but allow Shift+Enter for new lines
                              if (e.key === "Enter" && !e.shiftKey) {
                                // Don't prevent default - allow normal textarea behavior
                                // But prevent form submission
                                e.stopPropagation();
                              }
                            }}
                            className="input"
                            placeholder="Provide a custom description about your school for this specific position..."
                          />
                          <p className="text-xs text-neutral-500 mt-1">
                            This will override your school profile description for this job posting only
                          </p>
                        </motion.div>
                      )}
                    </div>
                  )}
                </form>
              </div>

              {/* Footer with Navigation */}
              <div className="flex-shrink-0 border-t border-neutral-200 dark:border-neutral-700 px-6 py-4 bg-white dark:bg-neutral-800 flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handlePreviousTab}
                  disabled={isFirstTab}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                {isLastTab ? (
                  <Button 
                    type="button"
                    variant="gradient" 
                    size="lg"
                    disabled={subscriptionStatus?.toLowerCase() === "cancelled" || subscriptionStatus?.toLowerCase() === "past_due"}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Only submit if we're on the last tab
                      if (activeTab === "school") {
                        // Validate form before submission
                        if (!validateForm()) {
                          return;
                        }
                        
                        const form = document.getElementById("job-form") as HTMLFormElement;
                        if (form) {
                          form.requestSubmit();
                        } else {
                          handleJobSubmit(e as any);
                        }
                      }
                    }}
                  >
                    {selectedJobForEdit ? "Update Job Posting" : "Publish Job Posting"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="gradient"
                    onClick={handleNextTab}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
