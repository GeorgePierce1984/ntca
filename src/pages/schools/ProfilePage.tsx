import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  Calendar,
  Edit2,
  Save,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  User,
  Briefcase,
  Info,
  ExternalLink,
  Camera,
  Award,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { InfoIcon } from "@/components/ui/Tooltip";
import { CountrySelector } from "@/components/forms/CountrySelector";
import { countries, type Country, getCountryByCode } from "@/data/countries";
import { SCHOOL_TYPES, CURRICULUM_OPTIONS, CENTRAL_ASIA_COUNTRIES } from "@/constants/options";
import toast from "react-hot-toast";

interface School {
  id: string;
  userId: string;
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
  benefits?: string; // JSON string of benefits
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    email: string;
  };
  _count: {
    jobs: number;
  };
  profileComplete: boolean;
  completionPercentage: number;
}

// Use the same constants as signup form for consistency
const schoolTypeOptions = SCHOOL_TYPES;
const curriculumOptions = CURRICULUM_OPTIONS;

const estimateJobsOptions = [
  "1-2 jobs per year",
  "3-5 jobs per year", 
  "6-10 jobs per year",
  "10+ jobs per year",
  "As needed",
];

export const SchoolProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<School>>({});
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCoverPhoto, setUploadingCoverPhoto] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<Country | undefined>(undefined);

  useEffect(() => {
    if (!user || user.userType !== "SCHOOL") {
      navigate("/signin");
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    setLoading(true); // Ensure loading is true at start
    try {
      const token = localStorage.getItem("authToken");
      if (!token || token === "null" || token === "undefined") {
        console.error("No valid auth token found");
        navigate("/signin");
        return;
      }

      const response = await fetch("/api/schools/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Profile API error:", response.status, errorData);
        
        if (response.status === 404) {
          // Don't show error toast immediately - let the auto-create logic handle it
          // The API will auto-create the profile, so we'll get a response
          setLoading(false);
          return;
        }
        
        throw new Error(errorData.error || "Failed to fetch profile");
      }

      const data = await response.json();
      
      if (!data.school) {
        console.error("Profile data missing school object:", data);
        // Don't show error toast - just keep loading state
        setLoading(false);
        return;
      }
      
      // If profile was just created, show a message
      if (data._created) {
        toast.success("Profile created! Please complete your school information.", {
          duration: 5000,
        });
        setEditMode(true); // Automatically open edit mode for new profiles
      }
      
      // Set school data before setting loading to false
      setSchool(data.school);
      
      // Parse benefits if they exist
      let parsedBenefits = {};
      if (data.school.benefits) {
        try {
          parsedBenefits = JSON.parse(data.school.benefits);
        } catch (e) {
          // If not JSON, keep as empty object
        }
      }
      
      // Initialize formData with parsed benefits
      setFormData({
        ...data.school,
        // Financial benefits
        housingProvided: parsedBenefits.housingProvided || false,
        flightReimbursement: parsedBenefits.flightReimbursement || false,
        visaWorkPermitSupport: parsedBenefits.visaWorkPermitSupport || false,
        contractCompletionBonus: parsedBenefits.contractCompletionBonus || false,
        paidHolidays: parsedBenefits.paidHolidays || false,
        overtimePay: parsedBenefits.overtimePay || false,
        // Lifestyle & Wellbeing
        paidAnnualLeave: parsedBenefits.paidAnnualLeave || false,
        nationalHolidays: parsedBenefits.nationalHolidays || false,
        sickLeave: parsedBenefits.sickLeave || false,
        healthInsurance: parsedBenefits.healthInsurance || false,
        relocationSupport: parsedBenefits.relocationSupport || false,
        // Professional Support
        teachingMaterialsProvided: parsedBenefits.teachingMaterialsProvided || false,
        curriculumGuidance: parsedBenefits.curriculumGuidance || false,
        teacherTraining: parsedBenefits.teacherTraining || false,
        promotionOpportunities: parsedBenefits.promotionOpportunities || false,
        contractRenewalOptions: parsedBenefits.contractRenewalOptions || false,
      });
      
      // Set selected countries based on form data
      if (data.school.country) {
        const country = countries.find(c => c.name === data.school.country);
        if (country) {
          setSelectedCountry(country);
        }
      }
      if (data.school.phoneCountryCode) {
        const phoneCountry = countries.find(c => c.phoneCode === data.school.phoneCountryCode);
        if (phoneCountry) {
          setSelectedPhoneCountry(phoneCountry);
        }
      }
      
      setLoading(false); // Only set loading to false after data is set
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Only show error toast for actual errors, not for 404s that will be auto-created
      if (!(error instanceof Error && error.message.includes("404"))) {
        toast.error(error instanceof Error ? error.message : "Failed to load profile");
      }
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token || token === "null" || token === "undefined") {
        toast.error("Authentication required. Please log in again.");
        navigate("/signin");
        return;
      }

      // Stringify benefits before sending
      const benefitsData = {
        // Financial
        housingProvided: formData.housingProvided || false,
        flightReimbursement: formData.flightReimbursement || false,
        visaWorkPermitSupport: formData.visaWorkPermitSupport || false,
        contractCompletionBonus: formData.contractCompletionBonus || false,
        paidHolidays: formData.paidHolidays || false,
        overtimePay: formData.overtimePay || false,
        // Lifestyle & Wellbeing
        paidAnnualLeave: formData.paidAnnualLeave || false,
        nationalHolidays: formData.nationalHolidays || false,
        sickLeave: formData.sickLeave || false,
        healthInsurance: formData.healthInsurance || false,
        relocationSupport: formData.relocationSupport || false,
        // Professional Support
        teachingMaterialsProvided: formData.teachingMaterialsProvided || false,
        curriculumGuidance: formData.curriculumGuidance || false,
        teacherTraining: formData.teacherTraining || false,
        promotionOpportunities: formData.promotionOpportunities || false,
        contractRenewalOptions: formData.contractRenewalOptions || false,
      };

      const { 
        housingProvided, flightReimbursement, visaWorkPermitSupport, contractCompletionBonus, 
        paidHolidays, overtimePay, paidAnnualLeave, nationalHolidays, sickLeave, 
        healthInsurance, relocationSupport, teachingMaterialsProvided, curriculumGuidance, 
        teacherTraining, promotionOpportunities, contractRenewalOptions, ...restFormData 
      } = formData;

      const response = await fetch("/api/schools/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...restFormData,
          benefits: JSON.stringify(benefitsData),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      const data = await response.json();
      setSchool(data.school);
      setEditMode(false);
      toast.success("Profile updated successfully");
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
      navigate("/signin");
      return;
    }

    setUploadingLogo(true);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("type", "logo"); // Required parameter for upload API

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
      navigate("/signin");
      return;
    }

    setUploadingCoverPhoto(true);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("type", "coverPhoto"); // Required parameter for upload API

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
    } catch (error) {
      console.error("Error uploading cover photo:", error);
      toast.error("Failed to upload cover photo");
    } finally {
      setUploadingCoverPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Only show "not found" if we're not loading and school is still null after a reasonable time
  // This prevents the flash of "not found" during the API call
  if (!school && !loading) {
    // Give it a moment - the API might be auto-creating the profile
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">Setting up your profile...</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Please wait while we prepare your profile.
          </p>
        </div>
      </div>
    );
  }

  // If school is still null after loading, show error
  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Unable to load your school profile. Please try refreshing the page.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            <Button variant="secondary" onClick={() => navigate("/schools/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-[90px]">
      <div className="pb-4">
        <div className="container-custom max-w-4xl mx-auto px-4 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center mt-[10px]">
              <p className="text-neutral-600 dark:text-neutral-400">
                Manage your School profile here
              </p>
            </div>
          <div className="flex items-center gap-4 mt-[15px]">
            {editMode ? (
              <>
                <Button
                  onClick={() => {
                    setFormData(school);
                    setEditMode(false);
                  }}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  variant="gradient"
                  disabled={saving}
                  leftIcon={
                    saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )
                  }
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setEditMode(true)}
                variant="gradient"
                leftIcon={<Edit2 className="w-4 h-4" />}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Profile Completion Alert */}
        {!school.profileComplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-8"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800 dark:text-amber-200">
                  Complete Your Profile
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Your profile is {school.completionPercentage}% complete. Complete your profile to start posting jobs and attract qualified teachers.
                </p>
                {!editMode && (
                  <Button
                    onClick={() => setEditMode(true)}
                    variant="primary"
                    size="sm"
                    className="mt-3"
                  >
                    Complete Profile
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cover Photo and Logo Section */}
            <div className="card p-0 overflow-hidden">
              {/* Cover Photo */}
              <div className="relative h-48 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30">
                {(formData.coverPhotoUrl || school.coverPhotoUrl) ? (
                  <img 
                    src={formData.coverPhotoUrl || school.coverPhotoUrl} 
                    alt="School cover"
                    className="w-full h-full object-cover"
                  />
                ) : null}
                {editMode && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors">
                    <label className="cursor-pointer px-4 py-2 bg-white/90 dark:bg-neutral-800/90 rounded-lg hover:bg-white dark:hover:bg-neutral-800 transition-colors">
                      {uploadingCoverPhoto ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm font-medium">Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {formData.coverPhotoUrl || school.coverPhotoUrl ? "Change Cover Photo" : "Upload Cover Photo"}
                          </span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverPhotoUpload}
                        className="hidden"
                        disabled={uploadingCoverPhoto}
                      />
                    </label>
                  </div>
                )}
              </div>
              
              {/* Logo positioned on top of cover photo */}
              <div className="relative px-6 pb-6">
                <div className="relative -mt-16 mb-6">
                  <div className="relative w-32 h-32 rounded-xl bg-white dark:bg-neutral-800 shadow-lg border-4 border-white dark:border-neutral-800 flex items-center justify-center overflow-hidden">
                    {(formData.logoUrl || school.logoUrl) ? (
                      <img 
                        src={formData.logoUrl || school.logoUrl} 
                        alt="School logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building className="w-12 h-12 text-neutral-400" />
                    )}
                    {editMode && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                        <label className="cursor-pointer">
                          <Camera className="w-5 h-5 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            disabled={uploadingLogo}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                
                {editMode && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-sm">School Logo</h3>
                      <InfoIcon content="Upload a logo for your school. Maximum file size is 5MB. Supported formats: JPG, PNG, WebP." />
                    </div>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                      {uploadingLogo ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload Logo
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={uploadingLogo}
                      />
                    </label>
                  </div>
                )}
                
                {/* School Name */}
                <div className="mt-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                    {formData.name || school.name}
                  </h1>
                </div>
              </div>
            </div>

            {/* School Basic Information */}
            <div className="card p-6">
              <h2 className="heading-2 mb-6 flex items-center gap-2">
                <Building className="w-5 h-5" />
                School Information
              </h2>

              <div className="space-y-6">

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      School Name *
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input"
                        placeholder="Enter school name"
                        required
                      />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100">{school.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      School Type *
                    </label>
                    {editMode ? (
                      <select
                        value={formData.schoolType || ""}
                        onChange={(e) => setFormData({ ...formData, schoolType: e.target.value })}
                        className="input"
                        required
                      >
                        <option value="">Select...</option>
                        {schoolTypeOptions.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100">
                        {schoolTypeOptions.find(type => type.value === school.schoolType)?.label || school.schoolType}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Curriculum/Focus
                    </label>
                    {editMode ? (
                      <select
                        value={formData.curriculum || ""}
                        onChange={(e) => setFormData({ ...formData, curriculum: e.target.value })}
                        className="input"
                      >
                        <option value="">Select...</option>
                        {curriculumOptions.map((curriculum) => (
                          <option key={curriculum.value} value={curriculum.value}>
                            {curriculum.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100">
                        {curriculumOptions.find(c => c.value === school.curriculum)?.label || school.curriculum || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium">
                      School Description
                    </label>
                    <InfoIcon content="This description will be shown to teachers on job postings. You can set it here or add it when creating your first job posting." />
                  </div>
                  {editMode ? (
                    <textarea
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input"
                      rows={4}
                      placeholder="Describe your school, its mission, values, and what makes it special..."
                    />
                  ) : (
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {school.description || "No description provided. You can add one here or when creating a job posting."}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium">
                      Teaching Philosophy & Values
                    </label>
                    <InfoIcon content="Share your school's teaching philosophy, educational values, and approach to teaching. This helps teachers understand your school's culture and teaching methods." />
                  </div>
                  {editMode ? (
                    <textarea
                      value={formData.teachingPhilosophy || ""}
                      onChange={(e) => setFormData({ ...formData, teachingPhilosophy: e.target.value })}
                      className="input"
                      rows={4}
                      placeholder="Describe your school's teaching philosophy, educational values, and approach to teaching..."
                    />
                  ) : (
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {school.teachingPhilosophy || "No teaching philosophy provided."}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Website
                    </label>
                    {editMode ? (
                      <input
                        type="url"
                        value={formData.website || ""}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="input"
                        placeholder="https://yourschool.com"
                      />
                    ) : (
                      <>
                        {school.website ? (
                          <a
                            href={school.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                          >
                            {school.website}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <p className="text-neutral-500">No website provided</p>
                        )}
                      </>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium">
                        Estimated Jobs Per Year
                      </label>
                      <InfoIcon content="Help us understand your hiring needs. This helps us match you with the right subscription plan and provide better service." />
                    </div>
                    {editMode ? (
                      <select
                        value={formData.estimateJobs || ""}
                        onChange={(e) => setFormData({ ...formData, estimateJobs: e.target.value })}
                        className="input"
                      >
                        <option value="">Select estimate</option>
                        {estimateJobsOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100">
                        {school.estimateJobs || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium">
                        Established Year
                      </label>
                      <InfoIcon content="The year your school was founded. This helps teachers understand your school's history and experience." />
                    </div>
                    {editMode ? (
                      <input
                        type="number"
                        value={formData.established ? new Date(formData.established).getFullYear() : ""}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          established: e.target.value ? `${e.target.value}-01-01` : ""
                        })}
                        className="input"
                        min="1800"
                        max={new Date().getFullYear()}
                        placeholder="2020"
                      />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100">
                        {school.established 
                          ? new Date(school.established).getFullYear()
                          : "Not specified"
                        }
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium">
                        Number of Students
                      </label>
                      <InfoIcon content="The approximate number of students enrolled at your school. This helps teachers understand the size of your institution." />
                    </div>
                    {editMode ? (
                      <input
                        type="number"
                        value={formData.studentCount || ""}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          studentCount: e.target.value ? parseInt(e.target.value) : undefined
                        })}
                        className="input"
                        min="1"
                        placeholder="500"
                      />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100">
                        {school.studentCount ? school.studentCount.toLocaleString() : "Not specified"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium">
                        Typical Student Age Range
                      </label>
                      <InfoIcon content="Select the age range of students typically enrolled at your school (including adults). This helps teachers understand the student demographics." />
                    </div>
                    {editMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">Min Age</label>
                          <input
                            type="number"
                            value={formData.studentAgeRangeMin || ""}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              studentAgeRangeMin: e.target.value ? parseInt(e.target.value) : undefined
                            })}
                            className="input"
                            min="0"
                            placeholder="3"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">Max Age</label>
                          <input
                            type="number"
                            value={formData.studentAgeRangeMax || ""}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              studentAgeRangeMax: e.target.value ? parseInt(e.target.value) : undefined
                            })}
                            className="input"
                            min="0"
                            max="30"
                            placeholder="30+"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100">
                        {school.studentAgeRangeMin !== undefined && school.studentAgeRangeMax !== undefined
                          ? `${school.studentAgeRangeMin} - ${school.studentAgeRangeMax >= 30 ? '30+' : school.studentAgeRangeMax} years`
                          : "Not specified"}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium">
                        Average Class Size
                      </label>
                      <InfoIcon content="The typical number of students in a class at your school. This helps teachers understand class dynamics and teaching environment." />
                    </div>
                    {editMode ? (
                      <input
                        type="number"
                        value={formData.averageClassSize || ""}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          averageClassSize: e.target.value ? parseInt(e.target.value) : undefined
                        })}
                        className="input"
                        min="1"
                        placeholder="25"
                      />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100">
                        {school.averageClassSize ? `${school.averageClassSize} students` : "Not specified"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits & Support */}
            <div className="card p-6">
              <h2 className="heading-2 mb-6 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Benefits & Support
              </h2>
              
              <div className="space-y-6">
                {/* Financial Subsection */}
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Financial</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.housingProvided || false}
                        onChange={(e) => setFormData({ ...formData, housingProvided: e.target.checked })}
                        disabled={!editMode}
                        className="rounded" 
                      />
                      <span className="text-sm">Housing Assistance</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.flightReimbursement || false}
                        onChange={(e) => setFormData({ ...formData, flightReimbursement: e.target.checked })}
                        disabled={!editMode}
                        className="rounded" 
                      />
                      <span className="text-sm">Flight Reimbursement Allowance</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.visaWorkPermitSupport || false}
                        onChange={(e) => setFormData({ ...formData, visaWorkPermitSupport: e.target.checked })}
                        disabled={!editMode}
                        className="rounded" 
                      />
                      <span className="text-sm">Visa & Work Permit Support</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.contractCompletionBonus || false}
                        onChange={(e) => setFormData({ ...formData, contractCompletionBonus: e.target.checked })}
                        disabled={!editMode}
                        className="rounded" 
                      />
                      <span className="text-sm">Contract Completion Bonus</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.paidHolidays || false}
                        onChange={(e) => setFormData({ ...formData, paidHolidays: e.target.checked })}
                        disabled={!editMode}
                        className="rounded" 
                      />
                      <span className="text-sm">Paid Holidays</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.overtimePay || false}
                        onChange={(e) => setFormData({ ...formData, overtimePay: e.target.checked })}
                        disabled={!editMode}
                        className="rounded" 
                      />
                      <span className="text-sm">Overtime Pay</span>
                    </label>
                  </div>
                </div>

                {/* Lifestyle & Wellbeing Subsection */}
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Lifestyle & Wellbeing</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.paidAnnualLeave || false}
                        onChange={(e) => setFormData({ ...formData, paidAnnualLeave: e.target.checked })}
                        disabled={!editMode}
                        className="rounded" 
                      />
                      <span className="text-sm">Paid Annual Leave</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.nationalHolidays || false}
                        onChange={(e) => setFormData({ ...formData, nationalHolidays: e.target.checked })}
                        disabled={!editMode}
                        className="rounded" 
                      />
                      <span className="text-sm">National Holidays</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.sickLeave || false}
                        onChange={(e) => setFormData({ ...formData, sickLeave: e.target.checked })}
                        disabled={!editMode}
                        className="rounded" 
                      />
                      <span className="text-sm">Sick Leave</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.healthInsurance || false}
                        onChange={(e) => setFormData({ ...formData, healthInsurance: e.target.checked })}
                        disabled={!editMode}
                        className="rounded" 
                      />
                      <span className="text-sm">Health Insurance</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.relocationSupport || false}
                        onChange={(e) => setFormData({ ...formData, relocationSupport: e.target.checked })}
                        disabled={!editMode}
                        className="rounded" 
                      />
                      <span className="text-sm">Relocation Support</span>
                    </label>
                  </div>
                </div>

                {/* Professional Support Subsection */}
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Professional Support</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.teachingMaterialsProvided || false}
                        onChange={(e) => setFormData({ ...formData, teachingMaterialsProvided: e.target.checked })}
                        disabled={!editMode}
                        className="rounded" 
                      />
                      <span className="text-sm">Teaching Materials Provided</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.curriculumGuidance || false}
                        onChange={(e) => setFormData({ ...formData, curriculumGuidance: e.target.checked })}
                        disabled={!editMode}
                        className="rounded" 
                      />
                      <span className="text-sm">Curriculum Guidance</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.teacherTraining || false}
                        onChange={(e) => setFormData({ ...formData, teacherTraining: e.target.checked })}
                        disabled={!editMode}
                        className="rounded" 
                      />
                      <span className="text-sm">Teacher Training</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.promotionOpportunities || false}
                        onChange={(e) => setFormData({ ...formData, promotionOpportunities: e.target.checked })}
                        disabled={!editMode}
                        className="rounded" 
                      />
                      <span className="text-sm">Promotion Opportunities</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.contractRenewalOptions || false}
                        onChange={(e) => setFormData({ ...formData, contractRenewalOptions: e.target.checked })}
                        disabled={!editMode}
                        className="rounded" 
                      />
                      <span className="text-sm">Contract Renewal Options</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="card p-6">
              <h2 className="heading-2 mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact Information
              </h2>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Contact Person Name *
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.contactName || ""}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        className="input"
                        placeholder="John Smith"
                        required
                      />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100">{school.contactName}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium">
                        Contact Email
                      </label>
                      <InfoIcon content="A specific contact email for job inquiries. If not provided, your account email will be used." />
                    </div>
                    {editMode ? (
                      <input
                        type="email"
                        value={formData.contactEmail || ""}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        className="input"
                        placeholder="contact@school.com"
                      />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100">
                        {school.contactEmail || school.user.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  {editMode ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Phone Country
                        </label>
                        <CountrySelector
                          selectedCountry={selectedPhoneCountry}
                          onSelect={(country) => {
                            setSelectedPhoneCountry(country);
                            setFormData({ ...formData, phoneCountryCode: country.phoneCode });
                          }}
                          showPhoneCode={true}
                          placeholder="Search countries..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.telephone || ""}
                          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                          className="input"
                          placeholder="123-456-7890"
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-neutral-900 dark:text-neutral-100">
                      {school.phoneCountryCode} {school.telephone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="card p-6">
              <h2 className="heading-2 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                School Address
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Street Address *
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.streetAddress || ""}
                      onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                      className="input"
                      placeholder="123 Main Street"
                      required
                    />
                  ) : (
                    <p className="text-neutral-900 dark:text-neutral-100">{school.streetAddress}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      City *
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.city || ""}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="input"
                        placeholder="Almaty"
                        required
                      />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100">{school.city}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium">
                        State/Province
                      </label>
                      <InfoIcon content="Optional. The state or province where your school is located." />
                    </div>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.state || ""}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="input"
                        placeholder="Almaty Region"
                      />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100">
                        {school.state || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium">
                        Postal Code
                      </label>
                      <InfoIcon content="Optional. The postal or ZIP code for your school's address." />
                    </div>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.postalCode || ""}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="input"
                        placeholder="050000"
                      />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100">
                        {school.postalCode || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Country *
                    </label>
                    {editMode ? (
                      <CountrySelector
                        selectedCountry={selectedCountry}
                        onSelect={(country) => {
                          setSelectedCountry(country);
                          setFormData({ ...formData, country: country.name });
                        }}
                        placeholder="Search countries..."
                      />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100">{school.country}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Stats */}
            <div className="card p-6">
              <h3 className="font-medium mb-4">Profile Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Profile Completion
                  </span>
                  <span className="font-medium">
                    {school.completionPercentage}%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all"
                    style={{ width: `${school.completionPercentage}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Job Postings
                  </span>
                  <span className="font-medium">{school._count.jobs}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Account Status
                  </span>
                  <div className="flex items-center gap-1">
                    {school.verified ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                    <span className="text-sm">
                      {school.verified ? "Verified" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="font-medium mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/schools/dashboard")}
                  variant="secondary"
                  className="w-full justify-start"
                  leftIcon={<Briefcase className="w-4 h-4" />}
                >
                  View Dashboard
                </Button>
                <Button
                  onClick={() => navigate("/schools/dashboard?tab=post-job")}
                  variant="primary"
                  className="w-full justify-start"
                  leftIcon={<Building className="w-4 h-4" />}
                  disabled={!school.profileComplete}
                >
                  Post New Job
                </Button>
                {!school.profileComplete && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Complete your profile to post jobs
                  </p>
                )}
              </div>
            </div>

            {/* Profile Tips */}
            <div className="card p-6">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Profile Tips
              </h3>
              <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                <p>• Add a compelling school description to attract qualified teachers</p>
                <p>• Upload your school logo for better recognition</p>
                <p>• Keep contact information up to date</p>
                <p>• Complete all profile sections to improve visibility</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}; 