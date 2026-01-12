import React, { useState } from "react";
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

interface JobForm {
  title: string;
  subjectsTaught: string;
  studentAgeGroupMin?: number;
  studentAgeGroupMax?: number;
  startDate: string;
  contractLength: string;
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
  minimumTeachingExperience: string;
  // Requirements - Preferred
  ieltsExperience: boolean;
  cambridgeExperience: boolean;
  satExperience: boolean;
  classroomExperience: boolean;
  onlineExperience: boolean;
  centralAsiaExperience: boolean;
  // Requirements - Legal
  eligibleNationalities: boolean;
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

  const tabs = [
    { key: "role", label: "Role Information", icon: Briefcase },
    { key: "description", label: "Job Description", icon: FileText },
    { key: "requirements", label: "Requirements", icon: Award },
    { key: "benefits", label: "Benefits & Support", icon: Users },
    { key: "school", label: "School Information", icon: Building },
  ];

  const currentTabIndex = tabs.findIndex(tab => tab.key === activeTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === tabs.length - 1;

  const handlePreviousTab = () => {
    if (!isFirstTab) {
      setActiveTab(tabs[currentTabIndex - 1].key);
    }
  };

  const handleNextTab = () => {
    if (!isLastTab) {
      setActiveTab(tabs[currentTabIndex + 1].key);
    }
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
              className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-6xl w-full h-[85vh] flex flex-col"
            >
              {/* Header with Close Button */}
              <div className="flex-shrink-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="heading-2">
                  {selectedJobForEdit ? "Edit Job Posting" : "Post a New Teaching Position"}
                </h2>
                <div className="flex items-center gap-3">
                  {activeTab === "school" && schoolProfile && !schoolProfile.profileComplete && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Missing required fields</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = "/schools/profile"}
                        className="text-xs h-7"
                      >
                        Complete Profile Now →
                      </Button>
                    </div>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
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

                <form id="job-form" className="space-y-6" onSubmit={handleJobSubmit}>
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
                            value={jobForm.deadline}
                            onChange={(e) => setJobForm({
                              ...jobForm,
                              deadline: e.target.value,
                            })}
                            className="input w-auto" 
                            required 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Job Title *
                        </label>
                        <input
                          type="text"
                          value={jobForm.title}
                          onChange={(e) => setJobForm({
                            ...jobForm,
                            title: e.target.value,
                          })}
                          className="input"
                          placeholder="e.g., Senior English Teacher - CELTA Required"
                          required
                        />
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
                            value={jobForm.city}
                            onChange={(e) => setJobForm({
                              ...jobForm,
                              city: e.target.value,
                            })}
                            className="input"
                            placeholder="e.g., Almaty"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Country *
                          </label>
                          <input
                            type="text"
                            value={jobForm.country}
                            onChange={(e) => setJobForm({
                              ...jobForm,
                              country: e.target.value,
                            })}
                            className="input"
                            placeholder="e.g., Kazakhstan"
                            required
                          />
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
                          <input
                            type="text"
                            value={jobForm.contractLength}
                            onChange={(e) => setJobForm({
                              ...jobForm,
                              contractLength: e.target.value,
                            })}
                            className="input"
                            placeholder="e.g., 1 year, 2 years, Permanent"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Employment Type *
                          </label>
                          <select 
                            value={jobForm.employmentType}
                            onChange={(e) => setJobForm({
                              ...jobForm,
                              employmentType: e.target.value,
                            })}
                            className="input" 
                            required
                          >
                            <option value="">Select type</option>
                            <option value="FULL_TIME">Full-time</option>
                            <option value="PART_TIME">Part-time</option>
                            <option value="CONTRACT">Contract</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Salary Range *
                          </label>
                          <input
                            type="text"
                            value={jobForm.salary}
                            onChange={(e) => setJobForm({
                              ...jobForm,
                              salary: e.target.value,
                            })}
                            className="input"
                            placeholder="e.g., $2,800 - $3,500/month"
                            required
                          />
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
                        value={jobForm.description}
                        onChange={(e) => setJobForm({
                          ...jobForm,
                          description: e.target.value,
                        })}
                        className="input"
                        rows={6}
                        placeholder="Describe the role, responsibilities, and what makes your school a great place to work..."
                        required
                      />
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
                            <div className="grid md:grid-cols-3 gap-3">
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
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={jobForm.eligibleNationalities}
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                eligibleNationalities: e.target.checked,
                              })}
                              className="rounded" 
                            />
                            <span className="text-sm break-words overflow-wrap-anywhere">Nationalities Eligible for Work Visa</span>
                          </label>
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
                    type="submit" 
                    form="job-form"
                    variant="gradient" 
                    size="lg"
                    disabled={subscriptionStatus?.toLowerCase() === "cancelled" || subscriptionStatus?.toLowerCase() === "past_due"}
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
