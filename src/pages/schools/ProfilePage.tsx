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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { countries } from "@/data/countries";
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
  estimateJobs: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  established?: string;
  studentCount?: number;
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

const schoolTypeOptions = [
  "Private International School",
  "Public School",
  "Language Institute",
  "University",
  "Community College",
  "Training Center",
  "Online Education Platform",
  "Other",
];

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

  useEffect(() => {
    if (!user || user.userType !== "SCHOOL") {
      navigate("/signin");
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/schools/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();
      setSchool(data.school);
      setFormData(data.school);
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
      const response = await fetch("/api/schools/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(formData),
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

    setUploadingLogo(true);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("type", "logo"); // Required parameter for upload API

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Unable to load your school profile.
          </p>
          <Button onClick={() => navigate("/schools/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20">
      <div className="container-custom max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="heading-1">School Profile</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage your school information and settings
            </p>
          </div>
          <div className="flex items-center gap-4">
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
                variant="primary"
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
            {/* School Basic Information */}
            <div className="card p-6">
              <h2 className="heading-2 mb-6 flex items-center gap-2">
                <Building className="w-5 h-5" />
                School Information
              </h2>

              <div className="space-y-6">
                {/* Logo Upload */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                      {formData.logoUrl ? (
                        <img 
                          src={formData.logoUrl} 
                          alt="School logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building className="w-8 h-8 text-neutral-400" />
                      )}
                    </div>
                    {editMode && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
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
                  <div>
                    <h3 className="font-medium">School Logo</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Upload a logo for your school (max 5MB)
                    </p>
                    {editMode && (
                      <div className="mt-2">
                        <label className="cursor-pointer">
                          <span className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
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
                          </span>
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
                        <option value="">Select school type</option>
                        {schoolTypeOptions.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100">{school.schoolType}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    School Description *
                  </label>
                  {editMode ? (
                    <textarea
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input"
                      rows={4}
                      placeholder="Describe your school, its mission, values, and what makes it special..."
                      required
                    />
                  ) : (
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {school.description || "No description provided"}
                    </p>
                  )}
                  <p className="text-xs text-neutral-500 mt-1">
                    This description will be shown to teachers on job postings
                  </p>
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
                    <label className="block text-sm font-medium mb-2">
                      Estimated Jobs Per Year
                    </label>
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
                    <label className="block text-sm font-medium mb-2">
                      Established Year
                    </label>
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
                    <label className="block text-sm font-medium mb-2">
                      Number of Students
                    </label>
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
                    <label className="block text-sm font-medium mb-2">
                      Contact Email
                    </label>
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
                    <div className="flex gap-2">
                      <select
                        value={formData.phoneCountryCode || "+1"}
                        onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })}
                        className="input w-24"
                      >
                        <option value="+1">+1</option>
                        <option value="+7">+7</option>
                        <option value="+44">+44</option>
                        <option value="+86">+86</option>
                        <option value="+33">+33</option>
                        <option value="+49">+49</option>
                      </select>
                      <input
                        type="tel"
                        value={formData.telephone || ""}
                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                        className="input flex-1"
                        placeholder="123-456-7890"
                        required
                      />
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
                    <label className="block text-sm font-medium mb-2">
                      State/Province
                    </label>
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
                    <label className="block text-sm font-medium mb-2">
                      Postal Code
                    </label>
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
                      <select
                        value={formData.country || ""}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="input"
                        required
                      >
                        <option value="">Select country</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
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
  );
}; 