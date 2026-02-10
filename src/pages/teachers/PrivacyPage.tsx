import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Eye,
  EyeOff,
  Save,
  Loader2,
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
  const [deletionScheduledAt, setDeletionScheduledAt] = useState<string | null>(null);
  
  // Local state for form data (before saving)
  const [searchable, setSearchable] = useState(true);
  const [emailPreferences, setEmailPreferences] = useState<EmailPreferences>({
    jobAlerts: true,
    platformUpdates: true,
    marketing: false,
  });
  const [savingEmailPrefs, setSavingEmailPrefs] = useState(false);
  const [originalEmailPrefs, setOriginalEmailPrefs] = useState<EmailPreferences>({
    jobAlerts: true,
    platformUpdates: true,
    marketing: false,
  });

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
      setSearchable(data.teacher.searchable !== undefined ? data.teacher.searchable : true);
      setDeletionScheduledAt(data.account?.deletionScheduledAt ?? null);
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
        const prefs = {
          jobAlerts: data.jobAlerts ?? true,
          platformUpdates: data.platformUpdates ?? true,
          marketing: data.marketing ?? false,
        };
        setEmailPreferences(prefs);
        setOriginalEmailPrefs(prefs);
      }
    } catch (error) {
      console.error("Error fetching email preferences:", error);
    }
  };

  const handleSaveProfileVisibility = async () => {
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
          searchable: searchable,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile visibility");

      const data = await response.json();
      setTeacher(data.teacher);
      toast.success(
        searchable
          ? "Profile is now visible to schools"
          : "Profile hidden from schools. You will still receive emails."
      );
    } catch (error) {
      console.error("Error updating profile visibility:", error);
      toast.error("Failed to update profile visibility");
      // Revert on error
      setSearchable(teacher.searchable);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmailPreferences = async () => {
    setSavingEmailPrefs(true);
    try {
      const response = await fetch("/api/teachers/email-preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(emailPreferences),
      });

      if (!response.ok) throw new Error("Failed to update email preferences");

      setOriginalEmailPrefs(emailPreferences);
      toast.success("Email preferences updated");
    } catch (error) {
      console.error("Error updating email preferences:", error);
      toast.error("Failed to update email preferences");
      // Revert on error
      setEmailPreferences(originalEmailPrefs);
    } finally {
      setSavingEmailPrefs(false);
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

  const hasEmailPrefsChanges =
    emailPreferences.jobAlerts !== originalEmailPrefs.jobAlerts ||
    emailPreferences.platformUpdates !== originalEmailPrefs.platformUpdates ||
    emailPreferences.marketing !== originalEmailPrefs.marketing;

  const hasProfileVisibilityChanges = searchable !== (teacher?.searchable ?? true);
  const isDeletionScheduled =
    !!deletionScheduledAt && !Number.isNaN(Date.parse(deletionScheduledAt));

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
          {/* Deletion scheduled banner */}
          {isDeletionScheduled && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="card p-6 border-2 border-red-200 dark:border-red-900/50"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    Your account is scheduled for deletion
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Scheduled deletion date:{" "}
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {new Date(deletionScheduledAt as string).toLocaleDateString()}
                    </span>
                    . Your profile is removed from school search immediately.
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                    If this was a mistake, please email{" "}
                    <a className="text-primary-600 dark:text-primary-400 hover:underline" href="mailto:support@nt-ca.com">
                      support@nt-ca.com
                    </a>.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* A. Hide/Show Profile from Schools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl p-8"
          >
            <div className="flex items-center justify-between p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  {searchable ? (
                    <Eye className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  ) : (
                    <EyeOff className="w-6 h-6 text-neutral-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Hide my profile
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {searchable
                      ? "Your profile is visible to schools"
                      : "Your profile is hidden from schools. You will still receive emails."}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={searchable}
                  onChange={(e) => setSearchable(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                <span className="ml-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {searchable ? "Visible" : "Hidden"}
                </span>
              </label>
            </div>

            {hasProfileVisibilityChanges && (
              <div className="flex justify-end mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <Button
                  onClick={handleSaveProfileVisibility}
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
            )}
          </motion.div>

          {/* B. Email Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
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
              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                <span className="text-neutral-900 dark:text-white font-medium">
                  Job alerts
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailPreferences.jobAlerts}
                    onChange={(e) =>
                      setEmailPreferences({
                        ...emailPreferences,
                        jobAlerts: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                <span className="text-neutral-900 dark:text-white font-medium">
                  Platform updates
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailPreferences.platformUpdates}
                    onChange={(e) =>
                      setEmailPreferences({
                        ...emailPreferences,
                        platformUpdates: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                <span className="text-neutral-900 dark:text-white font-medium">
                  Marketing (optional)
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailPreferences.marketing}
                    onChange={(e) =>
                      setEmailPreferences({
                        ...emailPreferences,
                        marketing: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>

            {hasEmailPrefsChanges && (
              <div className="flex justify-end mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <Button
                  onClick={handleSaveEmailPreferences}
                  variant="gradient"
                  disabled={savingEmailPrefs}
                  size="sm"
                  leftIcon={
                    savingEmailPrefs ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )
                  }
                >
                  {savingEmailPrefs ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </motion.div>

          {/* C. Request My Data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="glass rounded-2xl p-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                <FileDown className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                  Request my data
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

          {/* D. Delete Account */}
          {!isDeletionScheduled && (
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
          )}
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
