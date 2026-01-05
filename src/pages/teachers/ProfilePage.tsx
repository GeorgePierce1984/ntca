import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Globe,
  FileText,
  Award,
  BookOpen,
  Languages,
  Star,
  Edit2,
  Save,
  X,
  Upload,
  Camera,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { countries, getCountryByCode } from "@/data/countries";
import toast from "react-hot-toast";

interface Teacher {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  phoneCountryCode: string;
  streetAddress?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  qualification: string;
  experienceYears?: number;
  experience: string;
  bio?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  photoUrl?: string;
  verified: boolean;
  rating?: number;
  teachingLicense?: string;
  certifications: string[];
  subjects: string[];
  ageGroups: string[];
  teachingStyle?: string;
  nativeLanguage?: string;
  languageSkills?: Record<string, string>;
  otherLanguages?: string;
  currentLocation?: string;
  willingToRelocate: boolean;
  preferredLocations: string[];
  visaStatus?: string;
  workAuthorization: string[];
  availability?: string;
  startDate?: string;
  education: Array<{
    degree: string;
    field: string;
    institution: string;
    year: string;
  }>;
  teachingExperience?: Array<{
    schoolName: string;
    country: string;
    startDate: string; // Month/Year format
    endDate: string; // Month/Year format or "Present"
    studentAgeGroups: string[];
    subjectsTaught: string[];
    otherSubject?: string;
    keyAchievements: string;
  }>;
  specializations: string[];
  previousSchools: string[];
  references: Array<{
    name: string;
    position: string;
    email: string;
    phone: string;
  }>;
  achievements: string[];
  publications: string[];
  dateOfBirth?: string;
  nationality?: string;
  gender?: string;
  maritalStatus?: string;
  profileComplete: boolean;
  profileViews: number;
  lastActive?: string;
  searchable: boolean;
  salaryExpectation?: string;
  jobTypePreference: string[];
  workEnvironmentPreference: string[];
  technicalSkills: string[];
  softSkills: string[];
  languageTestScores?: Record<string, string>;
  refereeAvailable?: boolean;
  createdAt: string;
  updatedAt: string;
}

const qualificationOptions = [
  "Teaching Certificate",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "CELTA",
  "DELTA",
  "TESOL",
  "TEFL",
];

const subjectOptions = [
  "English",
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Computer Science",
  "Art",
  "Music",
  "Physical Education",
  "Languages",
  "Business Studies",
];

const ageGroupOptions = ["Kids (5-12)", "Teens (13-17)", "Adults (18+)"];

const languageLevels = [
  "Native",
  "Fluent",
  "Advanced",
  "Intermediate",
  "Basic",
];

export const TeacherProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(true); // Always in edit mode
  const [activeSection, setActiveSection] = useState<string>("personal");
  const [formData, setFormData] = useState<Partial<Teacher>>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [dragOverCV, setDragOverCV] = useState(false);
  const cvFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || user.userType !== "TEACHER") {
      navigate("/signin");
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/teachers/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();
      setTeacher(data.teacher);
      setFormData(data.teacher);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/teachers/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const data = await response.json();
      setTeacher(data.teacher);
      setFormData(data.teacher); // Update form data with saved data
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be less than 5MB");
      return;
    }

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "photo"); // Required by the upload API

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload photo");
      }

      const data = await response.json();
      setFormData({ ...formData, photoUrl: data.fileUrl || data.url });
      toast.success("Photo uploaded successfully");
      
      // Refresh profile to get updated data
      await fetchProfile();
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const validateCVFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
    
    if (!isValidType) {
      return "Only PDF, DOC, and DOCX files are allowed";
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return "File size must be less than 5MB";
    }

    return null;
  };

  const handleCVUpload = async (file: File) => {
    // Validate file
    const error = validateCVFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setUploadingResume(true);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("type", "resume"); // Required by the upload API

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload CV");
      }

      const data = await response.json();
      const updatedFormData = { 
        ...formData, 
        resumeUrl: data.fileUrl || data.url
      };
      // Store original filename temporarily (will be lost on refresh, but helps for current session)
      (updatedFormData as any).resumeFileName = data.originalName || file.name;
      setFormData(updatedFormData);
      toast.success("CV uploaded successfully");
      
      // Refresh profile to get updated data
      await fetchProfile();
    } catch (error) {
      console.error("Error uploading CV:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload CV");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleCVUpload(file);
  };

  const handleCVDelete = async () => {
    if (!confirm("Are you sure you want to delete your CV?")) return;

    try {
      setFormData({ ...formData, resumeUrl: "" });
      toast.success("CV removed");
    } catch (error) {
      console.error("Error deleting CV:", error);
      toast.error("Failed to remove CV");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverCV(false);
    
    if (!editMode) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleCVUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (editMode) {
      setDragOverCV(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverCV(false);
  };

  const addEducation = () => {
    const newEducation = {
      degree: "",
      field: "",
      institution: "",
      year: "",
    };
    setFormData({
      ...formData,
      education: [...(formData.education || []), newEducation],
    });
  };

  const removeEducation = (index: number) => {
    const updated = [...(formData.education || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, education: updated });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...(formData.education || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, education: updated });
  };

  const addReference = () => {
    const newReference = {
      name: "",
      position: "",
      email: "",
      phone: "",
    };
    setFormData({
      ...formData,
      references: [...(formData.references || []), newReference],
    });
  };

  const removeReference = (index: number) => {
    const updated = [...(formData.references || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, references: updated });
  };

  const updateReference = (index: number, field: string, value: string) => {
    const updated = [...(formData.references || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, references: updated });
  };

  const addTeachingExperience = () => {
    const newExperience = {
      schoolName: "",
      country: "",
      startDate: "",
      endDate: "",
      studentAgeGroups: [],
      subjectsTaught: [],
      otherSubject: "",
      keyAchievements: "",
    };
    setFormData({
      ...formData,
      teachingExperience: [...(formData.teachingExperience || []), newExperience],
    });
  };

  const removeTeachingExperience = (index: number) => {
    const updated = [...(formData.teachingExperience || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, teachingExperience: updated });
  };

  const updateTeachingExperience = (index: number, field: string, value: any) => {
    const updated = [...(formData.teachingExperience || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, teachingExperience: updated });
  };

  const calculateTotalYearsExperience = () => {
    if (!formData.teachingExperience || formData.teachingExperience.length === 0) {
      return 0;
    }

    let totalMonths = 0;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    formData.teachingExperience.forEach((exp) => {
      // Only calculate if both start and end dates are complete
      if (!exp.startDate) return;

      const startParts = exp.startDate.split("/");
      if (startParts.length !== 2) return; // Start date must be complete (MM/YYYY)

      const startMonth = parseInt(startParts[0]);
      const startYear = parseInt(startParts[1]);

      let endMonth, endYear;
      if (exp.endDate === "Present") {
        // Only use "Present" if explicitly selected
        endMonth = currentMonth;
        endYear = currentYear;
      } else if (exp.endDate && exp.endDate.includes("/")) {
        // End date must be complete (MM/YYYY)
        const endParts = exp.endDate.split("/");
        if (endParts.length !== 2) return;
        endMonth = parseInt(endParts[0]);
        endYear = parseInt(endParts[1]);
      } else {
        // If end date is not complete or not "Present", skip this entry
        return;
      }

      const months = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
      totalMonths += Math.max(0, months);
    });

    return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
  };

  const calculateAgeRange = () => {
    if (!formData.teachingExperience || formData.teachingExperience.length === 0) {
      return "N/A";
    }

    const allAges: number[] = [];
    formData.teachingExperience.forEach((exp) => {
      exp.studentAgeGroups?.forEach((ageGroup) => {
        if (ageGroup === "Kids (5-12)") {
          allAges.push(5, 6, 7, 8, 9, 10, 11, 12);
        } else if (ageGroup === "Teens (13-17)") {
          allAges.push(13, 14, 15, 16, 17);
        } else if (ageGroup === "Adults (18+)") {
          allAges.push(18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31);
        }
      });
    });

    if (allAges.length === 0) return "N/A";

    const minAge = Math.min(...allAges);
    const maxAge = Math.max(...allAges);
    // If max age is 30 or higher, show as 30+
    if (maxAge >= 30) {
      return `${minAge}-30+`;
    }
    return `${minAge}-${maxAge}`;
  };

  const calculateProfileCompleteness = () => {
    if (!teacher) return 0;

    const requiredFields = [
      "firstName",
      "lastName",
      "phone",
      "city",
      "country",
      "nationality",
      "qualification",
      "experienceYears",
      "experience",
    ];

    const optionalFields = [
      "resumeUrl",
      "photoUrl",
      "certifications",
      "subjects",
      "languageSkills",
      "education",
    ];

    const requiredComplete = requiredFields.filter(
      (field) => teacher[field as keyof Teacher],
    ).length;

    const optionalComplete = optionalFields.filter((field) => {
      const value = teacher[field as keyof Teacher];
      return value && (Array.isArray(value) ? value.length > 0 : true);
    }).length;

    const totalFields = requiredFields.length + optionalFields.length;
    const completedFields = requiredComplete + optionalComplete;

    return Math.round((completedFields / totalFields) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Unable to load your profile. Please try again.
          </p>
          <Button onClick={() => navigate("/teachers/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const profileCompletion = calculateProfileCompleteness();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800">
      <div className="container-custom py-24">
        {/* Header */}
        <div className="glass rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              {/* Profile Photo */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                  {formData.photoUrl ? (
                    <img
                      src={formData.photoUrl}
                      alt={`${formData.firstName} ${formData.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-neutral-400" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </label>
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                  {teacher.firstName} {teacher.lastName}
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {teacher.qualification} • {teacher.experienceYears || "N/A"}{" "}
                  years experience
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                    <MapPin className="w-4 h-4" />
                    {teacher.city}, {teacher.country}
                  </span>
                  {teacher.verified && (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Profile Completion */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Profile Completion
              </span>
              <span className="text-sm font-bold text-primary-600">
                {profileCompletion}%
              </span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            {profileCompletion < 100 && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
                Complete your profile to increase visibility to schools
              </p>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="glass rounded-xl p-2 mb-8">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "personal", label: "Personal Info", icon: User },
                { id: "experience", label: "Experience", icon: Briefcase },
                { id: "education", label: "Qualifications", icon: GraduationCap },
                { id: "skills", label: "Skills", icon: Award },
                { id: "preferences", label: "Preferences", icon: Globe },
                { id: "documents", label: "Documents", icon: FileText },
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                    activeSection === section.id
                      ? "bg-primary-600 text-white"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                  )}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </button>
              ))}
            </div>
            
            {/* Save Button */}
            <div className="flex items-center gap-4">
              <Button
                onClick={() => {
                  setFormData(teacher); // Reset to original data
                }}
                variant="secondary"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="gradient"
                disabled={saving}
                size="sm"
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
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl p-8"
          >
            {/* Personal Information */}
            {activeSection === "personal" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="input w-full opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dateOfBirth: e.target.value,
                        })
                      }
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nationality *
                    </label>
                    <select
                      value={formData.nationality || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nationality: e.target.value,
                        })
                      }
                      className="input w-full"
                      required
                    >
                      <option value="">Select nationality</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="input w-full"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">
                        Prefer not to say
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Marital Status
                    </label>
                    <select
                      value={formData.maritalStatus || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maritalStatus: e.target.value,
                        })
                      }
                      className="input w-full"
                    >
                      <option value="">Select status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={formData.streetAddress || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            streetAddress: e.target.value,
                          })
                        }
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.city || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        State/Province
                      </label>
                      <input
                        type="text"
                        value={formData.state || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        className="input w-full"
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
                        value={formData.postalCode || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            postalCode: e.target.value,
                          })
                        }
                        className="input w-full"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Country *
                      </label>
                      <select
                        value={formData.country || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        className="input w-full"
                      >
                        <option value="">Select country</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Save Button at Bottom */}
                <div className="flex justify-end mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <Button
                    onClick={() => {
                      setFormData(teacher); // Reset to original data
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="gradient"
                    disabled={saving}
                    size="sm"
                    leftIcon={
                      saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )
                    }
                    className="ml-4"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}

            {/* Education */}
            {activeSection === "education" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Qualifications</h2>
                  <Button
                    onClick={addEducation}
                    variant="secondary"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Education
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.education?.map((edu, index) => (
                    <div key={index} className="glass rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-semibold">Education {index + 1}</h3>
                          <button
                            onClick={() => removeEducation(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Degree / Qualification
                          </label>
                          <select
                            value={edu.degree}
                            onChange={(e) =>
                              updateEducation(index, "degree", e.target.value)
                            }
                            className="input w-full"
                          >
                            <option value="">Select qualification</option>
                            {qualificationOptions.map((qual) => (
                              <option key={qual} value={qual}>
                                {qual}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Field of Study
                          </label>
                          <input
                            type="text"
                            value={edu.field}
                            onChange={(e) =>
                              updateEducation(index, "field", e.target.value)
                            }
                            className="input w-full"
                            placeholder="e.g., English Literature"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Institution
                          </label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) =>
                              updateEducation(
                                index,
                                "institution",
                                e.target.value,
                              )
                            }
                            className="input w-full"
                            placeholder="e.g., University of London"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Year
                          </label>
                          <input
                            type="text"
                            value={edu.year}
                            onChange={(e) =>
                              updateEducation(index, "year", e.target.value)
                            }
                            className="input w-full"
                            placeholder="e.g., 2020"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!formData.education || formData.education.length === 0) && (
                    <div className="text-center py-8 text-neutral-500">
                      No education information added yet
                    </div>
                  )}
                </div>
                
                {/* Save Button at Bottom */}
                <div className="flex justify-end mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <Button
                    onClick={() => {
                      setFormData(teacher); // Reset to original data
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="gradient"
                    disabled={saving}
                    size="sm"
                    leftIcon={
                      saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )
                    }
                    className="ml-4"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}

            {/* Experience */}
            {activeSection === "experience" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Teaching Experience</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    value={formData.experienceYears || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experienceYears: parseInt(e.target.value) || 0,
                      })
                    }
                    className="input w-full"
                    min="0"
                    max="50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Professional Bio/Summary *
                  </label>
                  <textarea
                    value={formData.experience || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                    rows={4}
                    className="input w-full"
                    placeholder="Tell schools about yourself, who you are professionally, what you teach well, what students you enjoy teaching, what makes you unique and what kind of school you are looking for..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Teaching License
                  </label>
                  <input
                    type="text"
                    value={formData.teachingLicense || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teachingLicense: e.target.value,
                      })
                    }
                    className="input w-full"
                    placeholder="e.g., State Teaching License #12345"
                  />
                </div>

                {/* Teaching Experience Entries */}
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Teaching Positions</h3>
                    <Button
                      onClick={addTeachingExperience}
                      variant="secondary"
                      size="sm"
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Add Experience
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.teachingExperience?.map((exp, index) => (
                      <div key={index} className="glass rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-semibold">
                            Experience {index + 1}
                          </h4>
                          <button
                            onClick={() => removeTeachingExperience(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              School Name *
                            </label>
                            <input
                              type="text"
                              value={exp.schoolName}
                              onChange={(e) =>
                                updateTeachingExperience(
                                  index,
                                  "schoolName",
                                  e.target.value,
                                )
                              }
                              className="input w-full"
                              placeholder="e.g., International School of Almaty"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Country *
                            </label>
                            <select
                              value={exp.country}
                              onChange={(e) =>
                                updateTeachingExperience(
                                  index,
                                  "country",
                                  e.target.value,
                                )
                              }
                              className="input w-full"
                            >
                              <option value="">Select country</option>
                              {countries.map((country) => (
                                <option key={country.code} value={country.name}>
                                  {country.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Start Date *
                            </label>
                            <div className="flex gap-2">
                              <select
                                value={
                                  exp.startDate
                                    ? exp.startDate.includes("/")
                                      ? exp.startDate.split("/")[0] || ""
                                      : /^\d{2}$/.test(exp.startDate)
                                      ? exp.startDate
                                      : ""
                                    : ""
                                }
                                onChange={(e) => {
                                  const month = e.target.value;
                                  const currentDate = exp.startDate || "";
                                  const parts = currentDate.split("/");
                                  const year = parts.length === 2 ? parts[1] : "";
                                  if (month && year) {
                                    updateTeachingExperience(
                                      index,
                                      "startDate",
                                      `${month}/${year}`,
                                    );
                                  } else if (month) {
                                    // Store just month if year not selected yet
                                    updateTeachingExperience(
                                      index,
                                      "startDate",
                                      month,
                                    );
                                  } else {
                                    updateTeachingExperience(
                                      index,
                                      "startDate",
                                      year || "",
                                    );
                                  }
                                }}
                                className="input flex-1"
                              >
                                <option value="">Month</option>
                                {Array.from({ length: 12 }, (_, i) => {
                                  const monthNum = (i + 1).toString().padStart(2, "0");
                                  const monthNames = [
                                    "January",
                                    "February",
                                    "March",
                                    "April",
                                    "May",
                                    "June",
                                    "July",
                                    "August",
                                    "September",
                                    "October",
                                    "November",
                                    "December",
                                  ];
                                  return (
                                    <option key={monthNum} value={monthNum}>
                                      {monthNames[i]}
                                    </option>
                                  );
                                })}
                              </select>
                              <select
                                value={
                                  exp.startDate
                                    ? exp.startDate.includes("/")
                                      ? exp.startDate.split("/")[1] || ""
                                      : /^\d{4}$/.test(exp.startDate)
                                      ? exp.startDate
                                      : ""
                                    : ""
                                }
                                onChange={(e) => {
                                  const year = e.target.value;
                                  const currentDate = exp.startDate || "";
                                  const parts = currentDate.split("/");
                                  // Check if currentDate is just a month (2 digits) or a year (4 digits)
                                  const month = parts.length === 2 
                                    ? parts[0] 
                                    : /^\d{2}$/.test(currentDate)
                                    ? currentDate
                                    : "";
                                  if (month && year) {
                                    updateTeachingExperience(
                                      index,
                                      "startDate",
                                      `${month}/${year}`,
                                    );
                                  } else if (year) {
                                    // Store just year if month not selected yet
                                    updateTeachingExperience(
                                      index,
                                      "startDate",
                                      year,
                                    );
                                  } else {
                                    updateTeachingExperience(
                                      index,
                                      "startDate",
                                      month || "",
                                    );
                                  }
                                }}
                                className="input flex-1"
                              >
                                <option value="">Year</option>
                                {Array.from({ length: 36 }, (_, i) => {
                                  const year = new Date().getFullYear() - i;
                                  return (
                                    <option key={year} value={year.toString()}>
                                      {year}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              End Date *
                            </label>
                            <div className="flex gap-2">
                              <select
                                value={
                                  exp.endDate && exp.endDate !== "Present"
                                    ? exp.endDate.includes("/")
                                      ? exp.endDate.split("/")[0] || ""
                                      : /^\d{2}$/.test(exp.endDate)
                                      ? exp.endDate
                                      : ""
                                    : ""
                                }
                                onChange={(e) => {
                                  const month = e.target.value;
                                  const currentDate = exp.endDate && exp.endDate !== "Present" ? exp.endDate : "";
                                  const parts = currentDate.split("/");
                                  const year = parts.length === 2 ? parts[1] : "";
                                  if (month && year) {
                                    updateTeachingExperience(
                                      index,
                                      "endDate",
                                      `${month}/${year}`,
                                    );
                                  } else if (month) {
                                    // Store just month if year not selected yet
                                    updateTeachingExperience(
                                      index,
                                      "endDate",
                                      month,
                                    );
                                  } else {
                                    updateTeachingExperience(
                                      index,
                                      "endDate",
                                      year || "",
                                    );
                                  }
                                }}
                                disabled={!editMode || exp.endDate === "Present"}
                                className="input flex-1"
                              >
                                <option value="">Month</option>
                                {Array.from({ length: 12 }, (_, i) => {
                                  const monthNum = (i + 1).toString().padStart(2, "0");
                                  const monthNames = [
                                    "January",
                                    "February",
                                    "March",
                                    "April",
                                    "May",
                                    "June",
                                    "July",
                                    "August",
                                    "September",
                                    "October",
                                    "November",
                                    "December",
                                  ];
                                  return (
                                    <option key={monthNum} value={monthNum}>
                                      {monthNames[i]}
                                    </option>
                                  );
                                })}
                              </select>
                              <select
                                value={
                                  exp.endDate && exp.endDate !== "Present"
                                    ? exp.endDate.includes("/")
                                      ? exp.endDate.split("/")[1] || ""
                                      : /^\d{4}$/.test(exp.endDate)
                                      ? exp.endDate
                                      : ""
                                    : ""
                                }
                                onChange={(e) => {
                                  const year = e.target.value;
                                  const currentDate = exp.endDate && exp.endDate !== "Present" ? exp.endDate : "";
                                  const parts = currentDate.split("/");
                                  // Check if currentDate is just a month (2 digits) or a year (4 digits)
                                  const month = parts.length === 2 
                                    ? parts[0] 
                                    : /^\d{2}$/.test(currentDate)
                                    ? currentDate
                                    : "";
                                  if (month && year) {
                                    updateTeachingExperience(
                                      index,
                                      "endDate",
                                      `${month}/${year}`,
                                    );
                                  } else if (year) {
                                    // Store just year if month not selected yet
                                    updateTeachingExperience(
                                      index,
                                      "endDate",
                                      year,
                                    );
                                  } else {
                                    updateTeachingExperience(
                                      index,
                                      "endDate",
                                      month || "",
                                    );
                                  }
                                }}
                                disabled={!editMode || exp.endDate === "Present"}
                                className="input flex-1"
                              >
                                <option value="">Year</option>
                                {Array.from({ length: 36 }, (_, i) => {
                                  const year = new Date().getFullYear() - i;
                                  return (
                                    <option key={year} value={year.toString()}>
                                      {year}
                                    </option>
                                  );
                                })}
                              </select>
                              <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={exp.endDate === "Present"}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      updateTeachingExperience(
                                        index,
                                        "endDate",
                                        "Present",
                                      );
                                    } else {
                                      updateTeachingExperience(
                                        index,
                                        "endDate",
                                        "",
                                      );
                                    }
                                  }}
                                  className="rounded"
                                />
                                <span className="text-sm">Present</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Student Age Groups *
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {ageGroupOptions.map((ageGroup) => (
                                <label
                                  key={ageGroup}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      exp.studentAgeGroups?.includes(ageGroup) ||
                                      false
                                    }
                                    onChange={(e) => {
                                      const currentGroups =
                                        exp.studentAgeGroups || [];
                                      if (e.target.checked) {
                                        updateTeachingExperience(
                                          index,
                                          "studentAgeGroups",
                                          [...currentGroups, ageGroup],
                                        );
                                      } else {
                                        updateTeachingExperience(
                                          index,
                                          "studentAgeGroups",
                                          currentGroups.filter(
                                            (a) => a !== ageGroup,
                                          ),
                                        );
                                      }
                                    }}
                                    className="rounded"
                                  />
                                  <span className="text-sm">{ageGroup}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Subjects Taught *
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {["English", "Maths", "Science", "IT"].map(
                                (subject) => (
                                  <label
                                    key={subject}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={
                                        exp.subjectsTaught?.includes(subject) ||
                                        false
                                      }
                                      onChange={(e) => {
                                        const currentSubjects =
                                          exp.subjectsTaught || [];
                                        if (e.target.checked) {
                                          updateTeachingExperience(
                                            index,
                                            "subjectsTaught",
                                            [...currentSubjects, subject],
                                          );
                                        } else {
                                          updateTeachingExperience(
                                            index,
                                            "subjectsTaught",
                                            currentSubjects.filter(
                                              (s) => s !== subject,
                                            ),
                                          );
                                        }
                                      }}
                                      className="rounded"
                                    />
                                    <span className="text-sm">{subject}</span>
                                  </label>
                                ),
                              )}
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={
                                    exp.subjectsTaught?.includes("Other") ||
                                    false
                                  }
                                  onChange={(e) => {
                                    const currentSubjects = Array.isArray(exp.subjectsTaught)
                                      ? [...exp.subjectsTaught]
                                      : [];
                                    
                                    if (e.target.checked) {
                                      // Add "Other" if not already present
                                      if (!currentSubjects.includes("Other")) {
                                        const newSubjects = [...currentSubjects, "Other"];
                                        const updatedExp = {
                                          ...exp,
                                          subjectsTaught: newSubjects,
                                        };
                                        const updated = [...(formData.teachingExperience || [])];
                                        updated[index] = updatedExp;
                                        setFormData({
                                          ...formData,
                                          teachingExperience: updated,
                                        });
                                      }
                                    } else {
                                      // Remove "Other" and clear the text field in one update
                                      const filtered = currentSubjects.filter((s) => s !== "Other");
                                      const updatedExp = {
                                        ...exp,
                                        subjectsTaught: filtered,
                                        otherSubject: "",
                                      };
                                      const updated = [...(formData.teachingExperience || [])];
                                      updated[index] = updatedExp;
                                      setFormData({
                                        ...formData,
                                        teachingExperience: updated,
                                      });
                                    }
                                  }}
                                  className="rounded"
                                />
                                <span className="text-sm">Other</span>
                              </label>
                            </div>
                            {exp.subjectsTaught?.includes("Other") && (
                              <input
                                type="text"
                                value={exp.otherSubject || ""}
                                onChange={(e) =>
                                  updateTeachingExperience(
                                    index,
                                    "otherSubject",
                                    e.target.value,
                                  )
                                }
                                className="input w-full mt-2"
                                placeholder="Specify other subject..."
                              />
                            )}
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium mb-2">
                            Key Achievements
                          </label>
                          <textarea
                            value={exp.keyAchievements}
                            onChange={(e) =>
                              updateTeachingExperience(
                                index,
                                "keyAchievements",
                                e.target.value,
                              )
                            }
                            rows={3}
                            className="input w-full"
                            placeholder="Describe key achievements, accomplishments, or notable experiences..."
                          />
                        </div>
                      </div>
                    ))}

                    {(!formData.teachingExperience ||
                      formData.teachingExperience.length === 0) && (
                      <div className="text-center py-8 text-neutral-500">
                        No teaching experience added yet. Click "+ Add Experience"
                        to get started.
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="glass rounded-lg p-6">
                    <h4 className="font-semibold mb-2">Total Years Experience</h4>
                    <p className="text-2xl font-bold text-primary-600">
                      {calculateTotalYearsExperience()} years
                    </p>
                    <p className="text-sm text-neutral-500 mt-1">
                      Calculated from all experience entries
                    </p>
                  </div>

                  <div className="glass rounded-lg p-6">
                    <h4 className="font-semibold mb-2">Years by Age Group</h4>
                    <p className="text-2xl font-bold text-primary-600">
                      Ages {calculateAgeRange()}
                    </p>
                    <p className="text-sm text-neutral-500 mt-1">
                      Range of ages taught across all positions
                    </p>
                  </div>
                </div>
                
                {/* Save Button at Bottom */}
                <div className="flex justify-end mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <Button
                    onClick={() => {
                      setFormData(teacher); // Reset to original data
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="gradient"
                    disabled={saving}
                    size="sm"
                    leftIcon={
                      saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )
                    }
                    className="ml-4"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}

            {/* Skills */}
            {activeSection === "skills" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Skills & Languages</h2>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Native Language
                  </label>
                  <input
                    type="text"
                    value={formData.nativeLanguage || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nativeLanguage: e.target.value,
                      })
                    }
                    className="input w-full"
                    placeholder="e.g., English"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Other Languages
                  </label>
                  <textarea
                    value={formData.otherLanguages || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        otherLanguages: e.target.value,
                      })
                    }
                    rows={4}
                    className="input w-full"
                    placeholder="List any other languages you speak and your proficiency level (e.g., Spanish - Fluent, French - Intermediate)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Technical Skills
                  </label>
                  <input
                    type="text"
                    value={formData.technicalSkills?.join(", ") || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        technicalSkills: e.target.value
                          .split(",")
                          .map((skill) => skill.trim()),
                      })
                    }
                    className="input w-full"
                    placeholder="e.g., MS Office, Google Classroom, Zoom (comma separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Soft Skills
                  </label>
                  <input
                    type="text"
                    value={formData.softSkills?.join(", ") || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        softSkills: e.target.value
                          .split(",")
                          .map((skill) => skill.trim()),
                      })
                    }
                    className="input w-full"
                    placeholder="e.g., Communication, Leadership, Patience (comma separated)"
                  />
                </div>
                
                {/* Save Button at Bottom */}
                <div className="flex justify-end mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <Button
                    onClick={() => {
                      setFormData(teacher); // Reset to original data
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="gradient"
                    disabled={saving}
                    size="sm"
                    leftIcon={
                      saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )
                    }
                    className="ml-4"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}

            {/* Preferences */}
            {activeSection === "preferences" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Job Preferences</h2>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Willing to Relocate
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.willingToRelocate || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          willingToRelocate: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span>Yes, I'm willing to relocate</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Preferred Locations
                  </label>
                  <input
                    type="text"
                    value={formData.preferredLocations?.join(", ") || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferredLocations: e.target.value
                          .split(",")
                          .map((loc) => loc.trim()),
                      })
                    }
                    className="input w-full"
                    placeholder="e.g., Kazakhstan, Uzbekistan, Kyrgyzstan (comma separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Salary Expectation
                  </label>
                  <input
                    type="text"
                    value={formData.salaryExpectation || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salaryExpectation: e.target.value,
                      })
                    }
                    className="input w-full"
                    placeholder="e.g., $2,000 - $3,000 per month"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Job Type Preference
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Full-time", "Part-time", "Contract"].map((type) => (
                      <label
                        key={type}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            formData.jobTypePreference?.includes(type) || false
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                jobTypePreference: [
                                  ...(formData.jobTypePreference || []),
                                  type,
                                ],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                jobTypePreference:
                                  formData.jobTypePreference?.filter(
                                    (t) => t !== type,
                                  ),
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Work Environment Preference
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["In-person", "Online", "Hybrid"].map((env) => (
                      <label
                        key={env}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            formData.workEnvironmentPreference?.includes(env) ||
                            false
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                workEnvironmentPreference: [
                                  ...(formData.workEnvironmentPreference || []),
                                  env,
                                ],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                workEnvironmentPreference:
                                  formData.workEnvironmentPreference?.filter(
                                    (e) => e !== env,
                                  ),
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{env}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Referee Available on Request
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.refereeAvailable || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          refereeAvailable: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span>Referee available on request</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Availability
                  </label>
                  <select
                    value={formData.availability || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, availability: e.target.value })
                    }
                    className="input w-full"
                  >
                    <option value="">Select availability</option>
                    <option value="Immediately">Immediately</option>
                    <option value="Within 2 weeks">Within 2 weeks</option>
                    <option value="Within 1 month">Within 1 month</option>
                    <option value="Within 3 months">Within 3 months</option>
                    <option value="Not actively looking">
                      Not actively looking
                    </option>
                  </select>
                </div>
                
                {/* Save Button at Bottom */}
                <div className="flex justify-end mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <Button
                    onClick={() => {
                      setFormData(teacher); // Reset to original data
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="gradient"
                    disabled={saving}
                    size="sm"
                    leftIcon={
                      saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )
                    }
                    className="ml-4"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}

            {/* Documents */}
            {activeSection === "documents" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Documents</h2>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    CV / Resume
                  </label>
                  
                  {formData.resumeUrl ? (
                    <div className="glass rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-primary-600" />
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white">
                              CV Uploaded
                            </p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate max-w-md">
                              {(() => {
                                // First try to use stored original filename if available
                                if ((formData as any).resumeFileName) {
                                  return (formData as any).resumeFileName;
                                }
                                
                                // Otherwise extract from URL
                                try {
                                  const url = new URL(formData.resumeUrl);
                                  const pathParts = url.pathname.split('/');
                                  const filename = pathParts[pathParts.length - 1];
                                  // Remove timestamp prefix (e.g., "1767346943862-MyResume.doc" -> "MyResume.doc")
                                  // Handle both old format (timestamp-resume.ext) and new format (timestamp-originalname.ext)
                                  const cleanFilename = filename.replace(/^\d+-/, '');
                                  // If it's still "resume.ext" (old format), show generic name
                                  if (cleanFilename.startsWith('resume.')) {
                                    return 'resume' + cleanFilename.substring(6);
                                  }
                                  return decodeURIComponent(cleanFilename);
                                } catch {
                                  // Fallback: extract filename from URL string
                                  const urlParts = formData.resumeUrl.split('/');
                                  const filename = urlParts[urlParts.length - 1];
                                  const cleanFilename = filename.replace(/^\d+-/, '');
                                  if (cleanFilename.startsWith('resume.')) {
                                    return 'resume' + cleanFilename.substring(6);
                                  }
                                  return decodeURIComponent(cleanFilename);
                                }
                              })()}
                            </p>
                            <a
                              href={formData.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary-600 hover:underline"
                            >
                              View CV
                            </a>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Upload className="w-4 h-4" />}
                            disabled={uploadingResume}
                            onClick={() => cvFileInputRef.current?.click()}
                            type="button"
                          >
                            Replace
                          </Button>
                          <input
                            ref={cvFileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeUpload}
                            className="hidden"
                            disabled={uploadingResume}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Trash2 className="w-4 h-4" />}
                            onClick={handleCVDelete}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                        dragOverCV
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-neutral-300 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-600",
                      )}
                    >
                      {uploadingResume ? (
                        <div className="space-y-4">
                          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto" />
                          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Uploading CV...
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="w-12 h-12 text-neutral-400 mx-auto" />
                          <div>
                            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                              Drop your CV here or click to browse
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              PDF, DOC, or DOCX files only • Max 5MB
                            </p>
                          </div>
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              leftIcon={<Upload className="w-4 h-4" />}
                              onClick={() => cvFileInputRef.current?.click()}
                              type="button"
                            >
                              Select File
                            </Button>
                            <input
                              ref={cvFileInputRef}
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleResumeUpload}
                              className="hidden"
                            />
                          </>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={formData.portfolioUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, portfolioUrl: e.target.value })
                    }
                    className="input w-full"
                    placeholder="https://your-portfolio.com"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">References</h3>
                  <Button
                    onClick={addReference}
                    variant="secondary"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    className="mb-4"
                  >
                    Add Reference
                  </Button>

                  <div className="space-y-4">
                    {formData.references?.map((ref, index) => (
                      <div key={index} className="glass rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium">Reference {index + 1}</h4>
                          <button
                            onClick={() => removeReference(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={ref.name}
                            onChange={(e) =>
                              updateReference(index, "name", e.target.value)
                            }
                            className="input"
                            placeholder="Name"
                          />
                          <input
                            type="text"
                            value={ref.position}
                            onChange={(e) =>
                              updateReference(index, "position", e.target.value)
                            }
                            className="input"
                            placeholder="Position"
                          />
                          <input
                            type="email"
                            value={ref.email}
                            onChange={(e) =>
                              updateReference(index, "email", e.target.value)
                            }
                            className="input"
                            placeholder="Email"
                          />
                          <input
                            type="tel"
                            value={ref.phone}
                            onChange={(e) =>
                              updateReference(index, "phone", e.target.value)
                            }
                            className="input"
                            placeholder="Phone"
                          />
                        </div>
                      </div>
                    ))}

                    {(!formData.references ||
                      formData.references.length === 0) && (
                      <div className="text-center py-8 text-neutral-500">
                        No references added yet
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Save Button at Bottom */}
                <div className="flex justify-end mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <Button
                    onClick={() => {
                      setFormData(teacher); // Reset to original data
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="gradient"
                    disabled={saving}
                    size="sm"
                    leftIcon={
                      saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )
                    }
                    className="ml-4"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
