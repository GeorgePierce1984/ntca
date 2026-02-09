import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Eye,
  EyeOff,
  Save,
  Loader2,
  UserX,
  FileDown,
  Mail,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  searchable: boolean;
  [key: string]: any;
}

interface EmailPreferences {
  jobAlerts: boolean;
  platformUpdates: boolean;
  marketing: boolean;
}

export const TeacherPrivacyPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [emailPreferences, setEmailPreferences] = useState<EmailPreferences>({
    jobAlerts: true,
    platformUpdates: true,
    marketing: false,
  });
  const [savingEmailPrefs, setSavingEmailPrefs] = useState(false);

  useEffect(() => {
    if (!user || user.userType !== "TEACHER") {
      navigate("/login");
      return;
    }
    fetchProfile();
    fetchEmailPreferences();
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
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load privacy settings");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailPreferences = async () => {
    try {
      const response = await fetch("/api/teachers/email-preferences", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEmailPreferences({
          jobAlerts: data.jobAlerts ?? true,
          platformUpdates: data.platformUpdates ?? true,
          marketing: data.marketing ?? false,
        });
      }
    } catch (error) {
      console.error("Error fetching email preferences:", error);
    }
  };

  const handleHideProfile = async () => {
    if (!teacher) return;

    setSaving(true);
    try {
      const response = await fetch("/api/teachers/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          ...teacher,
          searchable: false,
        }),
      });

      if (!response.ok) throw new Error("Failed to hide profile");

      const data = await response.json();
      setTeacher(data.teacher);
      toast.success("Profile hidden from schools. You will still receive emails.");
    } catch (error) {
      console.error("Error hiding profile:", error);
      toast.error("Failed to hide profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const response = await fetch("/api/teachers/delete-account", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete account");
      }

      const data = await response.json();
      toast.success(
        `Account deletion scheduled. Your profile has been hidden immediately. Full deletion will occur in 7 days.`,
        { duration: 6000 }
      );

      // Logout and redirect
      setTimeout(() => {
        logout();
        navigate("/");
      }, 2000);
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Failed to delete account");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEmailPreferencesChange = async (
    key: keyof EmailPreferences,
    value: boolean
  ) => {
    const newPrefs = { ...emailPreferences, [key]: value };
    setEmailPreferences(newPrefs);

    setSavingEmailPrefs(true);
    try {
      const response = await fetch("/api/teachers/email-preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(newPrefs),
      });

      if (!response.ok) throw new Error("Failed to update email preferences");

      toast.success("Email preferences updated");
    } catch (error) {
      console.error("Error updating email preferences:", error);
      toast.error("Failed to update email preferences");
      // Revert on error
      setEmailPreferences(emailPreferences);
    } finally {
      setSavingEmailPrefs(false);
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
        <div className="space-y-6">
          {/* A. Hide Profile from Schools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl p-8"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  {teacher.searchable ? (
                    <Eye className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  ) : (
                    <EyeOff className="w-6 h-6 text-neutral-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                    Hide my profile
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    {teacher.searchable
                      ? "Your profile is currently visible to schools. Hide it to remove it from school searches while keeping your account active. You will still receive emails."
                      : "Your profile is hidden from schools. You will still receive emails."}
                  </p>
                  {teacher.searchable && (
                    <Button
                      onClick={handleHideProfile}
                      disabled={saving}
                      variant="secondary"
                      size="sm"
                      leftIcon={
                        saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )
                      }
                    >
                      {saving ? "Hiding..." : "Hide my profile"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* B. Download My Data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="glass rounded-2xl p-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                <FileDown className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                  Download my data
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Request a copy of all your personal data stored on NTCA.
                </p>
                <a
                  href="mailto:support@nt-ca.com?subject=Data Export Request"
                  className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  <Mail className="w-4 h-4" />
                  Email support@nt-ca.com to request your data
                </a>
              </div>
            </div>
          </motion.div>

          {/* C. Email Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="glass rounded-2xl p-8"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                  Email preferences
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Choose which emails you want to receive from NTCA.
                </p>
              </div>
            </div>

            <div className="space-y-4 pl-16">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={emailPreferences.jobAlerts}
                  onChange={(e) =>
                    handleEmailPreferencesChange("jobAlerts", e.target.checked)
                  }
                  disabled={savingEmailPrefs}
                  className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                />
                <span className="text-neutral-900 dark:text-white font-medium">
                  Job alerts
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={emailPreferences.platformUpdates}
                  onChange={(e) =>
                    handleEmailPreferencesChange(
                      "platformUpdates",
                      e.target.checked
                    )
                  }
                  disabled={savingEmailPrefs}
                  className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                />
                <span className="text-neutral-900 dark:text-white font-medium">
                  Platform updates
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={emailPreferences.marketing}
                  onChange={(e) =>
                    handleEmailPreferencesChange("marketing", e.target.checked)
                  }
                  disabled={savingEmailPrefs}
                  className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                />
                <span className="text-neutral-900 dark:text-white font-medium">
                  Marketing (optional)
                </span>
              </label>
            </div>
          </motion.div>

          {/* D. Delete Account */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="glass rounded-2xl p-8 border-2 border-red-200 dark:border-red-900/50"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                  Delete my account permanently
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Deleting your account permanently removes your profile, CV and
                  personal data from NTCA systems. Your profile will be removed
                  from public view immediately, and full deletion will occur in 7
                  days. This action cannot be undone.
                </p>
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Delete my account permanently
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-neutral-800 rounded-2xl p-8 max-w-md w-full shadow-xl"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  Delete Account?
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  This will immediately hide your profile from schools and
                  schedule permanent deletion in 7 days. All your data, CV, and
                  applications will be removed. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowDeleteModal(false)}
                variant="secondary"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                variant="danger"
                size="sm"
                disabled={deleting}
                leftIcon={
                  deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )
                }
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
