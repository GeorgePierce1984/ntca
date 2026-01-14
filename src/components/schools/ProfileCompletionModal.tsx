import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Users,
  Award,
  Camera,
  FileText,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowLeft,
  Upload,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CountrySelector } from "@/components/forms/CountrySelector";
import { countries, type Country, getCountryByName } from "@/data/countries";
import { SCHOOL_TYPES, CURRICULUM_OPTIONS } from "@/constants/options";
import toast from "react-hot-toast";

interface School {
  id: string;
  name: string;
  contactName: string;
  contactEmail?: string;
  telephone: string;
  phoneCountryCode: string;
  streetAddress: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  schoolType: string;
  curriculum?: string;
  estimateJobs: string;
  website?: string;
  description?: string;
  teachingPhilosophy?: string;
  logoUrl?: string;
  coverPhotoUrl?: string;
  established?: string;
  studentCount?: number;
  studentAgeRangeMin?: number;
  studentAgeRangeMax?: number;
  averageClassSize?: number;
  benefits?: string;
  completionPercentage?: number;
  user?: {
    email: string;
  };
}

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School | null;
  onUpdate: () => void;
}

const schoolTypeOptions = SCHOOL_TYPES;
const curriculumOptions = CURRICULUM_OPTIONS;

const estimateJobsOptions = [
  "1-2 jobs per year",
  "3-5 jobs per year",
  "6-10 jobs per year",
  "10+ jobs per year",
  "As needed",
];

export const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({
  isOpen,
  onClose,
  school,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [formData, setFormData] = useState<Partial<School>>({});
  const [saving, setSaving] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCoverPhoto, setUploadingCoverPhoto] = useState(false);

  useEffect(() => {
    if (school) {
      setFormData(school);
      if (school.country) {
        setSelectedCountry(getCountryByName(school.country));
      }
    }
  }, [school, isOpen]); // Re-initialize when modal opens

  // Get incomplete fields and organize by tabs
  const getIncompleteFields = () => {
    if (!school) return { basic: [], details: [], media: [] };

    const incomplete: { basic: string[]; details: string[]; media: string[] } = {
      basic: [],
      details: [],
      media: [],
    };

    // Basic Information (checking for empty strings, null, or undefined)
    // Note: Contact Email is not checked as it's auto-populated from account email
    if (!school.name || !school.name.trim() || school.name === "School Name") incomplete.basic.push("School Name");
    if (!school.contactName || !school.contactName.trim() || school.contactName === "Contact Name") incomplete.basic.push("Contact Person");
    // Contact Email is auto-populated from account email, so we don't check it
    if (!school.telephone || !school.telephone.trim() || school.telephone === "N/A") incomplete.basic.push("Phone Number");
    if (!school.streetAddress || !school.streetAddress.trim() || school.streetAddress === "Address") incomplete.basic.push("Street Address");
    if (!school.city || !school.city.trim() || school.city === "City") incomplete.basic.push("City");
    if (!school.country || !school.country.trim()) incomplete.basic.push("Country");
    if (!school.schoolType || !school.schoolType.trim()) incomplete.basic.push("School Type");

    // Additional Details
    if (!school.description || !school.description.trim()) incomplete.details.push("School Description");
    // website removed - not all schools have websites
    if (!school.curriculum || !school.curriculum.trim()) incomplete.details.push("Curriculum");
    if (!school.established) incomplete.details.push("Established Date");
    if (!school.studentCount) incomplete.details.push("Student Count");
    if (!school.studentAgeRangeMin || !school.studentAgeRangeMax) incomplete.details.push("Student Age Range");
    if (!school.averageClassSize) incomplete.details.push("Average Class Size");
    if (!school.teachingPhilosophy || !school.teachingPhilosophy.trim()) incomplete.details.push("Teaching Philosophy");

    // Media
    if (!school.logoUrl || !school.logoUrl.trim()) incomplete.media.push("School Logo");
    if (!school.coverPhotoUrl || !school.coverPhotoUrl.trim()) incomplete.media.push("Cover Photo");

    return incomplete;
  };

  const incompleteFields = getIncompleteFields();
  const hasIncompleteFields = 
    incompleteFields.basic.length > 0 || 
    incompleteFields.details.length > 0 || 
    incompleteFields.media.length > 0;

  // Set initial tab to first tab with incomplete fields
  useEffect(() => {
    if (incompleteFields.basic.length > 0) {
      setActiveTab("basic");
    } else if (incompleteFields.details.length > 0) {
      setActiveTab("details");
    } else if (incompleteFields.media.length > 0) {
      setActiveTab("media");
    }
  }, [school]);

  const handleSave = async () => {
    if (!school) return;

    setSaving(true);
    try {
      // Don't send contactEmail as it's read-only (uses account email)
      const { contactEmail, ...dataToSend } = formData;
      
      const response = await fetch("/api/schools/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        const data = await response.json();
        onUpdate(); // This will refresh the school data
        
        // For Media tab, always close after saving
        if (activeTab === "media") {
          setTimeout(() => {
            onClose();
          }, 500); // Small delay to show success message
          return;
        }
        
        // For other tabs, check if we should move to next tab or close
        // Wait a bit for the data to update, then check incomplete fields
        setTimeout(() => {
          // Re-fetch to get updated completion data
          fetch("/api/schools/profile", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          })
            .then(res => res.json())
            .then(updatedData => {
              if (updatedData.school) {
                // Check incomplete fields from updated data
                const checkIncomplete = (schoolData: School) => {
                  const incomplete: { basic: string[]; details: string[]; media: string[] } = {
                    basic: [],
                    details: [],
                    media: [],
                  };
                  
                  if (!schoolData.name || !schoolData.name.trim() || schoolData.name === "School Name") incomplete.basic.push("School Name");
                  if (!schoolData.contactName || !schoolData.contactName.trim() || schoolData.contactName === "Contact Name") incomplete.basic.push("Contact Person");
                  if (!schoolData.telephone || !schoolData.telephone.trim() || schoolData.telephone === "N/A") incomplete.basic.push("Phone Number");
                  if (!schoolData.streetAddress || !schoolData.streetAddress.trim() || schoolData.streetAddress === "Address") incomplete.basic.push("Street Address");
                  if (!schoolData.city || !schoolData.city.trim() || schoolData.city === "City") incomplete.basic.push("City");
                  if (!schoolData.country || !schoolData.country.trim()) incomplete.basic.push("Country");
                  if (!schoolData.schoolType || !schoolData.schoolType.trim()) incomplete.basic.push("School Type");
                  
                  if (!schoolData.description || !schoolData.description.trim()) incomplete.details.push("School Description");
                  // website removed - not all schools have websites
                  if (!schoolData.curriculum || !schoolData.curriculum.trim()) incomplete.details.push("Curriculum");
                  if (!schoolData.established) incomplete.details.push("Established Date");
                  if (!schoolData.studentCount) incomplete.details.push("Student Count");
                  if (!schoolData.studentAgeRangeMin || !schoolData.studentAgeRangeMax) incomplete.details.push("Student Age Range");
                  if (!schoolData.averageClassSize) incomplete.details.push("Average Class Size");
                  if (!schoolData.teachingPhilosophy || !schoolData.teachingPhilosophy.trim()) incomplete.details.push("Teaching Philosophy");
                  
                  if (!schoolData.logoUrl || !schoolData.logoUrl.trim()) incomplete.media.push("School Logo");
                  if (!schoolData.coverPhotoUrl || !schoolData.coverPhotoUrl.trim()) incomplete.media.push("Cover Photo");
                  
                  return incomplete;
                };
                
                const updatedIncomplete = checkIncomplete(updatedData.school);
                
                // If all complete, close modal
                if (updatedIncomplete.basic.length === 0 && updatedIncomplete.details.length === 0 && updatedIncomplete.media.length === 0) {
                  onClose();
                } else {
                  // Move to next tab with incomplete fields
                  if (activeTab === "basic" && updatedIncomplete.details.length > 0) {
                    setActiveTab("details");
                  } else if (activeTab === "details" && updatedIncomplete.media.length > 0) {
                    setActiveTab("media");
                  } else if (activeTab === "basic" && updatedIncomplete.basic.length === 0 && updatedIncomplete.media.length > 0) {
                    // If basic is complete but details is also complete, go to media
                    setActiveTab("media");
                  }
                }
              }
            })
            .catch(err => {
              console.error("Error checking updated profile:", err);
              // If fetch fails, just move to next tab based on current tab
              if (activeTab === "basic") {
                setActiveTab("details");
              } else if (activeTab === "details") {
                setActiveTab("media");
              }
            });
        }, 300);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be less than 5MB");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token || token === "null" || token === "undefined") {
      toast.error("Authentication required. Please log in again.");
      return;
    }

    setUploadingLogo(true);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("type", "logo");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) throw new Error("Failed to upload logo");

      const data = await response.json();
      setFormData({ ...formData, logoUrl: data.fileUrl });
      toast.success("Logo uploaded successfully");
      onUpdate(); // Refresh to update completion percentage
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Cover photo must be less than 10MB");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token || token === "null" || token === "undefined") {
      toast.error("Authentication required. Please log in again.");
      return;
    }

    setUploadingCoverPhoto(true);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("type", "coverPhoto");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) throw new Error("Failed to upload cover photo");

      const data = await response.json();
      setFormData({ ...formData, coverPhotoUrl: data.fileUrl });
      toast.success("Cover photo uploaded successfully");
      onUpdate(); // Refresh to update completion percentage
    } catch (error) {
      console.error("Error uploading cover photo:", error);
      toast.error("Failed to upload cover photo");
    } finally {
      setUploadingCoverPhoto(false);
    }
  };

  // Don't render if not open, but allow school to be null initially (it will be set)
  if (!isOpen) return null;
  
  // If school is not yet loaded, show a loading state or wait
  if (!school) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-center text-neutral-600 dark:text-neutral-400">Loading profile data...</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      Complete Your School Profile
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      Adding more details helps attract better applicants to your job postings
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Completion Bar */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Profile Completion
                    </span>
                    <span className="text-sm font-bold text-primary-600">
                      {school.completionPercentage || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all"
                      style={{ width: `${school.completionPercentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-neutral-200 dark:border-neutral-700 px-6">
                <div className="flex gap-4">
                  {[
                    { key: "basic", label: "Basic Information", icon: Building, count: incompleteFields.basic.length },
                    { key: "details", label: "Additional Details", icon: FileText, count: incompleteFields.details.length },
                    { key: "media", label: "Media & Images", icon: Camera, count: incompleteFields.media.length },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                        activeTab === tab.key
                          ? "border-primary-600 text-primary-600"
                          : "border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      {tab.count > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "basic" && (
                    <motion.div
                      key="basic"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              <strong>Why complete your profile?</strong> Schools with complete profiles receive up to 3x more applications. 
                              Teachers prefer applying to schools that provide clear information about their institution.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            School Name
                          </label>
                          <input
                            type="text"
                            value={formData.name || ""}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input w-full"
                            placeholder="Enter school name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Contact Person
                          </label>
                          <input
                            type="text"
                            value={formData.contactName || ""}
                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                            className="input w-full"
                            placeholder="Full name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Contact Email
                          </label>
                          <input
                            type="email"
                            value={(school?.user?.email || formData.contactEmail || "") as string}
                            disabled
                            className="input w-full bg-neutral-100 dark:bg-neutral-700 cursor-not-allowed"
                            placeholder="contact@school.com"
                          />
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            This is your account email and cannot be changed
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={formData.telephone || ""}
                            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                            className="input w-full"
                            placeholder="123-456-7890"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Street Address
                          </label>
                          <input
                            type="text"
                            value={formData.streetAddress || ""}
                            onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                            className="input w-full"
                            placeholder="123 Main Street"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={formData.city || ""}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="input w-full"
                            placeholder="City name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Country
                          </label>
                          <CountrySelector
                            selectedCountry={selectedCountry}
                            onSelect={(country) => {
                              setSelectedCountry(country);
                              setFormData({ ...formData, country: country.name });
                            }}
                            placeholder="Select country"
                            filterToCentralAsia={true}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            School Type
                          </label>
                          <select
                            value={formData.schoolType || ""}
                            onChange={(e) => setFormData({ ...formData, schoolType: e.target.value })}
                            className="input w-full"
                          >
                            <option value="">Select school type</option>
                            {schoolTypeOptions.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "details" && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              <strong>Stand out from other schools!</strong> Detailed profiles help teachers understand your school's culture, 
                              values, and what makes you unique. This leads to more qualified applicants who are a better fit.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            School Description
                          </label>
                          <textarea
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input w-full min-h-[120px]"
                            placeholder="Tell teachers about your school, its mission, values, and what makes it special..."
                          />
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            A compelling description helps attract teachers who align with your school's values
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Website
                            </label>
                            <input
                              type="url"
                              value={formData.website || ""}
                              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                              className="input w-full"
                              placeholder="https://www.school.com"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Curriculum
                            </label>
                            <select
                              value={formData.curriculum || ""}
                              onChange={(e) => setFormData({ ...formData, curriculum: e.target.value })}
                              className="input w-full"
                            >
                              <option value="">Select curriculum</option>
                              {curriculumOptions.map((cur) => (
                                <option key={cur.value} value={cur.value}>
                                  {cur.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Established Year
                            </label>
                            <input
                              type="date"
                              value={(() => {
                                if (!formData.established) return "";
                                const established = formData.established;
                                if (typeof established === 'string') {
                                  // If it's already in YYYY-MM-DD format, use it directly
                                  if (/^\d{4}-\d{2}-\d{2}$/.test(established)) {
                                    return established;
                                  }
                                  // If it's an ISO string, extract the date part
                                  if (established.includes('T')) {
                                    return established.split('T')[0];
                                  }
                                  return established;
                                }
                                // If it's a Date object, convert to YYYY-MM-DD
                                try {
                                  return new Date(established).toISOString().split('T')[0];
                                } catch {
                                  return "";
                                }
                              })()}
                              onChange={(e) => setFormData({ ...formData, established: e.target.value })}
                              className="input w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Student Count
                            </label>
                            <input
                              type="number"
                              value={formData.studentCount || ""}
                              onChange={(e) => setFormData({ ...formData, studentCount: parseInt(e.target.value) || undefined })}
                              className="input w-full"
                              placeholder="500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Student Age Range (Min)
                            </label>
                            <input
                              type="number"
                              value={formData.studentAgeRangeMin || ""}
                              onChange={(e) => setFormData({ ...formData, studentAgeRangeMin: parseInt(e.target.value) || undefined })}
                              className="input w-full"
                              placeholder="5"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Student Age Range (Max)
                            </label>
                            <input
                              type="number"
                              value={formData.studentAgeRangeMax || ""}
                              onChange={(e) => setFormData({ ...formData, studentAgeRangeMax: parseInt(e.target.value) || undefined })}
                              className="input w-full"
                              placeholder="18"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Average Class Size
                            </label>
                            <input
                              type="number"
                              value={formData.averageClassSize || ""}
                              onChange={(e) => setFormData({ ...formData, averageClassSize: parseInt(e.target.value) || undefined })}
                              className="input w-full"
                              placeholder="25"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Teaching Philosophy
                          </label>
                          <textarea
                            value={formData.teachingPhilosophy || ""}
                            onChange={(e) => setFormData({ ...formData, teachingPhilosophy: e.target.value })}
                            className="input w-full min-h-[100px]"
                            placeholder="Describe your school's approach to teaching and learning..."
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "media" && (
                    <motion.div
                      key="media"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              <strong>Visual appeal matters!</strong> Schools with logos and cover photos receive significantly more profile views. 
                              Help teachers visualize what it's like to work at your school.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            School Logo
                          </label>
                          {formData.logoUrl ? (
                            <div className="space-y-2">
                              <img
                                src={formData.logoUrl}
                                alt="School Logo"
                                className="w-32 h-32 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700"
                              />
                              <div>
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                  <Upload className="w-4 h-4" />
                                  {uploadingLogo ? "Uploading..." : "Replace Logo"}
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                    disabled={uploadingLogo}
                                  />
                                </label>
                              </div>
                            </div>
                          ) : (
                            <label className="cursor-pointer flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                              {uploadingLogo ? (
                                <div className="flex flex-col items-center gap-2">
                                  <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Uploading...</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <Upload className="w-8 h-8 text-neutral-400" />
                                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Click to upload logo</span>
                                  <span className="text-xs text-neutral-500 dark:text-neutral-500">JPG, PNG, or WebP (max 5MB)</span>
                                </div>
                              )}
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleLogoUpload}
                                className="hidden"
                                disabled={uploadingLogo}
                              />
                            </label>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Cover Photo
                          </label>
                          {formData.coverPhotoUrl ? (
                            <div className="space-y-2">
                              <img
                                src={formData.coverPhotoUrl}
                                alt="Cover Photo"
                                className="w-full h-48 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700"
                              />
                              <div>
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                  <Upload className="w-4 h-4" />
                                  {uploadingCoverPhoto ? "Uploading..." : "Replace Cover Photo"}
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleCoverPhotoUpload}
                                    className="hidden"
                                    disabled={uploadingCoverPhoto}
                                  />
                                </label>
                              </div>
                            </div>
                          ) : (
                            <label className="cursor-pointer flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                              {uploadingCoverPhoto ? (
                                <div className="flex flex-col items-center gap-2">
                                  <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Uploading...</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <Upload className="w-8 h-8 text-neutral-400" />
                                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Click to upload cover photo</span>
                                  <span className="text-xs text-neutral-500 dark:text-neutral-500">JPG, PNG, or WebP (max 10MB)</span>
                                </div>
                              )}
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleCoverPhotoUpload}
                                className="hidden"
                                disabled={uploadingCoverPhoto}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {(activeTab === "details" || activeTab === "media") && (
                    <Button
                      onClick={() => {
                        if (activeTab === "details") {
                          setActiveTab("basic");
                        } else if (activeTab === "media") {
                          setActiveTab("details");
                        }
                      }}
                      variant="secondary"
                      leftIcon={<ArrowLeft className="w-4 h-4" />}
                    >
                      Back
                    </Button>
                  )}
                  <button
                    onClick={onClose}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    I'll complete this later
                  </button>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  variant="gradient"
                >
                  {saving ? "Saving..." : activeTab === "media" ? "Save & Close" : "Save & Continue"}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

