import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Eye,
  EyeOff,
  DollarSign,
  Save,
  Loader2,
  User,
  HelpCircle,
  UserX,
  FileDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  phoneCountryCode: string;
  city: string;
  country: string;
  qualification: string;
  experienceYears?: number;
  experience: string;
  searchable: boolean;
  salaryExpectationVisible?: boolean;
  [key: string]: any; // Allow other fields
}

export const TeacherPrivacyPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    searchable: true,
    salaryExpectationVisible: true,
    anonymiseProfile: false,
    downloadableProfilePDF: true,
  });

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
      setFormData({
        searchable: data.teacher.searchable !== undefined ? data.teacher.searchable : true,
        salaryExpectationVisible: data.teacher.salaryExpectationVisible !== undefined ? data.teacher.salaryExpectationVisible : true,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load privacy settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!teacher) return;
    
    setSaving(true);
    try {
      // Merge privacy settings with existing teacher data
      const updateData = {
        ...teacher,
        searchable: formData.searchable,
        salaryExpectationVisible: formData.salaryExpectationVisible,
      };

      const response = await fetch("/api/teachers/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error("Failed to update privacy settings");

      const data = await response.json();
      setTeacher(data.teacher);
      setFormData({
        searchable: data.teacher.searchable !== undefined ? data.teacher.searchable : true,
        salaryExpectationVisible: data.teacher.salaryExpectationVisible !== undefined ? data.teacher.salaryExpectationVisible : true,
        anonymiseProfile: data.teacher.anonymiseProfile !== undefined ? data.teacher.anonymiseProfile : false,
        downloadableProfilePDF: data.teacher.downloadableProfilePDF !== undefined ? data.teacher.downloadableProfilePDF : true,
      });
      toast.success("Privacy settings updated successfully");
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast.error("Failed to update privacy settings");
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800">
      <div className="container-custom py-24">
        {/* Header */}
        <div className="glass rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                  Privacy & Control
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  Manage your profile visibility and privacy settings
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass rounded-2xl p-8"
        >
          <div className="space-y-8">
            {/* Visibility Setting */}
            <div className="flex items-center justify-between p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  {formData.searchable ? (
                    <Eye className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  ) : (
                    <EyeOff className="w-6 h-6 text-neutral-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Visibility
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formData.searchable
                      ? "Your profile is visible to schools"
                      : "Your profile is hidden from schools"}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.searchable}
                  onChange={(e) =>
                    setFormData({ ...formData, searchable: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                <span className="ml-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {formData.searchable ? "Public" : "Hidden"}
                </span>
              </label>
            </div>

            {/* Salary Expectations Setting */}
            <div className="flex items-center justify-between p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Salary Expectations
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formData.salaryExpectationVisible
                      ? "Your salary expectations are visible to schools"
                      : "Your salary expectations are hidden from schools"}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.salaryExpectationVisible}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salaryExpectationVisible: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                <span className="ml-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {formData.salaryExpectationVisible ? "Public" : "Hidden"}
                </span>
              </label>
            </div>

            {/* Anonymise Profile Setting */}
            <div className="flex items-center justify-between p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <UserX className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Anonymise Profile
                    </h3>
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-neutral-400 hover:text-primary-600 cursor-help" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-10">
                        <div className="bg-neutral-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                          Name Hidden until Application made
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-900 rotate-45"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formData.anonymiseProfile
                      ? "Your name will be hidden until a school makes an application"
                      : "Your name is visible to schools"}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.anonymiseProfile}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      anonymiseProfile: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                <span className="ml-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {formData.anonymiseProfile ? "Yes" : "No"}
                </span>
              </label>
            </div>

            {/* Downloadable Profile PDF Setting */}
            <div className="flex items-center justify-between p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <FileDown className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Downloadable Profile PDF
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formData.downloadableProfilePDF
                      ? "Schools can download your profile as a PDF"
                      : "Schools cannot download your profile as a PDF"}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.downloadableProfilePDF}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      downloadableProfilePDF: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                <span className="ml-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {formData.downloadableProfilePDF ? "Yes" : "No"}
                </span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              onClick={() => {
                setFormData({
                  searchable: teacher.searchable !== undefined ? teacher.searchable : true,
                  salaryExpectationVisible: teacher.salaryExpectationVisible !== undefined ? teacher.salaryExpectationVisible : true,
                  anonymiseProfile: teacher.anonymiseProfile !== undefined ? teacher.anonymiseProfile : false,
                  downloadableProfilePDF: teacher.downloadableProfilePDF !== undefined ? teacher.downloadableProfilePDF : true,
                });
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
        </motion.div>
      </div>
    </div>
  );
};

