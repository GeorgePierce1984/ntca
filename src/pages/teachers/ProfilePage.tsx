import React, { useState, useEffect } from "react";
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
  const [editMode, setEditMode] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("personal");
  const [formData, setFormData] = useState<Partial<Teacher>>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

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
      setEditMode(false);
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

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload photo");

      const data = await response.json();
      setFormData({ ...formData, photoUrl: data.url });
      toast.success("Photo uploaded successfully");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Resume must be less than 10MB");
      return;
    }

    setUploadingResume(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload resume");

      const data = await response.json();
      setFormData({ ...formData, resumeUrl: data.url });
      toast.success("Resume uploaded successfully");
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast.error("Failed to upload resume");
    } finally {
      setUploadingResume(false);
    }
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

  const calculateProfileCompleteness = () => {
    if (!teacher) return 0;

    const requiredFields = [
      "firstName",
      "lastName",
      "phone",
      "city",
      "country",
      "qualification",
      "experience",
      "bio",
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
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
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
                {editMode && (
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
                )}
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

            {/* Actions */}
            <div className="flex items-center gap-4">
              {editMode ? (
                <>
                  <Button
                    onClick={() => {
                      setFormData(teacher);
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
                  variant="primary"
                  leftIcon={<Edit2 className="w-4 h-4" />}
                >
                  Edit Profile
                </Button>
              )}
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
          <div className="flex flex-wrap gap-2">
            {[
              { id: "personal", label: "Personal Info", icon: User },
              { id: "education", label: "Education", icon: GraduationCap },
              { id: "experience", label: "Experience", icon: Briefcase },
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
                      disabled={!editMode}
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
                      disabled={!editMode}
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
                      disabled={!editMode}
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
                      disabled={!editMode}
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nationality
                    </label>
                    <select
                      value={formData.nationality || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nationality: e.target.value,
                        })
                      }
                      disabled={!editMode}
                      className="input w-full"
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
                      disabled={!editMode}
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
                      disabled={!editMode}
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
                  <label className="block text-sm font-medium mb-2">
                    Bio / About Me *
                  </label>
                  <textarea
                    value={formData.bio || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    disabled={!editMode}
                    rows={4}
                    className="input w-full"
                    placeholder="Tell schools about yourself, your teaching philosophy, and what makes you unique..."
                  />
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
                        disabled={!editMode}
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
                        disabled={!editMode}
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
                        disabled={!editMode}
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
                        disabled={!editMode}
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
                        disabled={!editMode}
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
              </div>
            )}

            {/* Education */}
            {activeSection === "education" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Education</h2>
                  {editMode && (
                    <Button
                      onClick={addEducation}
                      variant="secondary"
                      size="sm"
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Add Education
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {formData.education?.map((edu, index) => (
                    <div key={index} className="glass rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold">Education {index + 1}</h3>
                        {editMode && (
                          <button
                            onClick={() => removeEducation(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Degree
                          </label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) =>
                              updateEducation(index, "degree", e.target.value)
                            }
                            disabled={!editMode}
                            className="input w-full"
                            placeholder="e.g., Bachelor of Education"
                          />
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
                            disabled={!editMode}
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
                            disabled={!editMode}
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
                            disabled={!editMode}
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
              </div>
            )}

            {/* Experience */}
            {activeSection === "experience" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Teaching Experience</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Qualification *
                    </label>
                    <select
                      value={formData.qualification || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          qualification: e.target.value,
                        })
                      }
                      disabled={!editMode}
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
                      Years of Experience
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
                      disabled={!editMode}
                      className="input w-full"
                      min="0"
                      max="50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Experience Description *
                  </label>
                  <textarea
                    value={formData.experience || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                    disabled={!editMode}
                    rows={4}
                    className="input w-full"
                    placeholder="Describe your teaching experience..."
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
                    disabled={!editMode}
                    className="input w-full"
                    placeholder="e.g., State Teaching License #12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Certifications
                  </label>
                  <input
                    type="text"
                    value={formData.certifications?.join(", ") || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        certifications: e.target.value
                          .split(",")
                          .map((cert) => cert.trim()),
                      })
                    }
                    disabled={!editMode}
                    className="input w-full"
                    placeholder="e.g., CELTA, TESOL, DELTA (comma separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subjects You Can Teach
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {subjectOptions.map((subject) => (
                      <label
                        key={subject}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            formData.subjects?.includes(subject) || false
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                subjects: [
                                  ...(formData.subjects || []),
                                  subject,
                                ],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                subjects: formData.subjects?.filter(
                                  (s) => s !== subject,
                                ),
                              });
                            }
                          }}
                          disabled={!editMode}
                          className="rounded"
                        />
                        <span className="text-sm">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Age Groups
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
                            formData.ageGroups?.includes(ageGroup) || false
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                ageGroups: [
                                  ...(formData.ageGroups || []),
                                  ageGroup,
                                ],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                ageGroups: formData.ageGroups?.filter(
                                  (a) => a !== ageGroup,
                                ),
                              });
                            }
                          }}
                          disabled={!editMode}
                          className="rounded"
                        />
                        <span className="text-sm">{ageGroup}</span>
                      </label>
                    ))}
                  </div>
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
                    disabled={!editMode}
                    className="input w-full"
                    placeholder="e.g., English"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Other Languages
                  </label>
                  <p className="text-sm text-neutral-500 mb-2">
                    Add languages and proficiency levels
                  </p>
                  {/* Language skills would need a more complex UI */}
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
                    disabled={!editMode}
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
                    disabled={!editMode}
                    className="input w-full"
                    placeholder="e.g., Communication, Leadership, Patience (comma separated)"
                  />
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
                      disabled={!editMode}
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
                    disabled={!editMode}
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
                    disabled={!editMode}
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
                          disabled={!editMode}
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
                          disabled={!editMode}
                          className="rounded"
                        />
                        <span className="text-sm">{env}</span>
                      </label>
                    ))}
                  </div>
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
                    disabled={!editMode}
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

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Profile Visibility
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.searchable !== false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          searchable: e.target.checked,
                        })
                      }
                      disabled={!editMode}
                      className="rounded"
                    />
                    <span>Make my profile visible to schools</span>
                  </label>
                </div>
              </div>
            )}

            {/* Documents */}
            {activeSection === "documents" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Documents</h2>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Resume/CV
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.resumeUrl ? (
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary-600" />
                        <span className="text-sm">Resume uploaded</span>
                        <a
                          href={formData.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline text-sm"
                        >
                          View
                        </a>
                      </div>
                    ) : (
                      <span className="text-sm text-neutral-500">
                        No resume uploaded
                      </span>
                    )}
                    {editMode && (
                      <label className="cursor-pointer">
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Upload className="w-4 h-4" />}
                          disabled={uploadingResume}
                        >
                          {uploadingResume ? "Uploading..." : "Upload Resume"}
                        </Button>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeUpload}
                          className="hidden"
                          disabled={uploadingResume}
                        />
                      </label>
                    )}
                  </div>
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
                    disabled={!editMode}
                    className="input w-full"
                    placeholder="https://your-portfolio.com"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">References</h3>
                  {editMode && (
                    <Button
                      onClick={addReference}
                      variant="secondary"
                      size="sm"
                      leftIcon={<Plus className="w-4 h-4" />}
                      className="mb-4"
                    >
                      Add Reference
                    </Button>
                  )}

                  <div className="space-y-4">
                    {formData.references?.map((ref, index) => (
                      <div key={index} className="glass rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium">Reference {index + 1}</h4>
                          {editMode && (
                            <button
                              onClick={() => removeReference(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={ref.name}
                            onChange={(e) =>
                              updateReference(index, "name", e.target.value)
                            }
                            disabled={!editMode}
                            className="input"
                            placeholder="Name"
                          />
                          <input
                            type="text"
                            value={ref.position}
                            onChange={(e) =>
                              updateReference(index, "position", e.target.value)
                            }
                            disabled={!editMode}
                            className="input"
                            placeholder="Position"
                          />
                          <input
                            type="email"
                            value={ref.email}
                            onChange={(e) =>
                              updateReference(index, "email", e.target.value)
                            }
                            disabled={!editMode}
                            className="input"
                            placeholder="Email"
                          />
                          <input
                            type="tel"
                            value={ref.phone}
                            onChange={(e) =>
                              updateReference(index, "phone", e.target.value)
                            }
                            disabled={!editMode}
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
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
