import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Phone,
  Mail,
  MapPin,
  Award,
  BookOpen,
  Download,
  Calendar,
  User,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Globe,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  InterviewScheduleModal,
  InterviewData,
} from "./InterviewScheduleModal";
import { Paywall } from "@/components/paywall/Paywall";
import { canAccessPremiumFeatures } from "@/utils/subscription";

interface Applicant {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  experience: string;
  location: string;
  status: "applied" | "reviewing" | "interview" | "declined" | "hired";
  appliedDate: string;
  resumeUrl?: string;
  coverLetter?: string;
  portfolioUrl?: string;
  rating?: number;
  notes?: string[];
  interviewDate?: string;
  skills?: string[];
  languages?: string[];
  visaStatus?: string;
  availability?: string;
}

interface ApplicantModalProps {
  applicant: Applicant | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (
    applicantId: string,
    status: Applicant["status"],
    note?: string,
  ) => void;
  jobTitle?: string;
  subscriptionStatus?: string | null;
}

export const ApplicantModal: React.FC<ApplicantModalProps> = ({
  applicant,
  isOpen,
  onClose,
  onStatusUpdate,
  jobTitle,
  subscriptionStatus,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "documents" | "notes" | "timeline"
  >("overview");
  const [newNote, setNewNote] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [rating, setRating] = useState(applicant?.rating || 0);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  if (!applicant) return null;

  // Only block if we have a subscription status and it's not active
  // If subscriptionStatus is null/undefined, allow access to prevent flash
  const isBlocked = subscriptionStatus !== null && subscriptionStatus !== undefined && !canAccessPremiumFeatures(subscriptionStatus, false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
      case "reviewing":
        return "text-amber-600 bg-amber-100 dark:bg-amber-900/30";
      case "interview":
        return "text-purple-600 bg-purple-100 dark:bg-purple-900/30";
      case "declined":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      case "hired":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      default:
        return "text-neutral-600 bg-neutral-100 dark:bg-neutral-900/30";
    }
  };

  const handleStatusUpdate = (newStatus: Applicant["status"]) => {
    const note =
      newStatus === "interview" && interviewDate
        ? `Interview scheduled for ${new Date(interviewDate).toLocaleDateString()}`
        : newNote;

    onStatusUpdate(applicant.id, newStatus, note);
    setNewNote("");
    setInterviewDate("");
  };

  const handleScheduleInterview = (interviewData: InterviewData) => {
    // Update the applicant status with interview details
    const note = `Interview scheduled for ${new Date(interviewData.date + " " + interviewData.time).toLocaleString()}`;
    onStatusUpdate(applicant.id, "interview", note);
    setShowInterviewModal(false);
  };

  const openInterviewModal = () => {
    setShowInterviewModal(true);
  };

  const handleDownloadDocument = async (documentType: string) => {
    try {
      setIsDownloading(documentType);

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `/api/applications/${applicant.id}/download?type=${documentType}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to download document");
      }

      // If it's a redirect response, open in new tab
      if (response.redirected) {
        window.open(response.url, "_blank");
      } else {
        // Handle direct file response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;

        // Get filename from content-disposition header or use default
        const contentDisposition = response.headers.get("content-disposition");
        let filename = `${documentType}_${applicant.name.replace(/\s+/g, "_")}.pdf`;

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Download error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to download document",
      );
    } finally {
      setIsDownloading(null);
    }
  };

  const addNote = () => {
    if (newNote.trim()) {
      // In a real app, this would make an API call
      console.log("Adding note:", newNote);
      setNewNote("");
    }
  };

  const mockTimeline = [
    {
      date: applicant.appliedDate,
      action: "Applied",
      status: "applied",
      note: "Application submitted with resume and cover letter",
    },
    {
      date: "2024-01-19",
      action: "Status Changed",
      status: "reviewing",
      note: "Application moved to review stage",
    },
    ...(applicant.status === "interview"
      ? [
          {
            date: "2024-01-22",
            action: "Interview Scheduled",
            status: "interview",
            note: applicant.interviewDate
              ? `Interview scheduled for ${applicant.interviewDate}`
              : "Interview scheduled",
          },
        ]
      : []),
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />
            <Paywall
              isBlocked={isBlocked}
              featureName="Applicant Details"
              description="Subscribe to view applicant details, manage applications, and schedule interviews."
            >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {applicant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{applicant.name}</h2>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {jobTitle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(applicant.status)}`}
                  >
                    {applicant.status}
                  </span>
                  <button
                    onClick={onClose}
                    className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="border-b border-neutral-200 dark:border-neutral-800">
                <nav className="flex px-6">
                  {[
                    { key: "overview", label: "Overview", icon: User },
                    { key: "documents", label: "Documents", icon: FileText },
                    { key: "notes", label: "Notes", icon: MessageSquare },
                    { key: "timeline", label: "Timeline", icon: Clock },
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() =>
                        setActiveTab(
                          key as
                            | "overview"
                            | "documents"
                            | "notes"
                            | "timeline",
                        )
                      }
                      className={`flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === key
                          ? "border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Contact Information */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">
                          Contact Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-neutral-400" />
                            <div>
                              <span className="text-sm text-neutral-500">
                                Email
                              </span>
                              <p className="font-medium">{applicant.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-neutral-400" />
                            <div>
                              <span className="text-sm text-neutral-500">
                                Phone
                              </span>
                              <p className="font-medium">{applicant.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-neutral-400" />
                            <div>
                              <span className="text-sm text-neutral-500">
                                Location
                              </span>
                              <p className="font-medium">
                                {applicant.location}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">
                          Qualifications
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Award className="w-5 h-5 text-neutral-400" />
                            <div>
                              <span className="text-sm text-neutral-500">
                                Qualification
                              </span>
                              <p className="font-medium">
                                {applicant.qualification}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <BookOpen className="w-5 h-5 text-neutral-400" />
                            <div>
                              <span className="text-sm text-neutral-500">
                                Experience
                              </span>
                              <p className="font-medium">
                                {applicant.experience}
                              </p>
                            </div>
                          </div>
                          {applicant.languages && (
                            <div className="flex items-center gap-3">
                              <Globe className="w-5 h-5 text-neutral-400" />
                              <div>
                                <span className="text-sm text-neutral-500">
                                  Languages
                                </span>
                                <p className="font-medium">
                                  {applicant.languages.join(", ")}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Rating</h3>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`text-2xl ${star <= rating ? "text-amber-500" : "text-neutral-300"}`}
                          >
                            ★
                          </button>
                        ))}
                        <span className="ml-2 text-neutral-600 dark:text-neutral-400">
                          {rating}/5
                        </span>
                      </div>
                    </div>

                    {/* Cover Letter Preview */}
                    {applicant.coverLetter && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Cover Letter
                        </h3>
                        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                            {applicant.coverLetter}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "documents" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">
                      Documents & Portfolio
                    </h3>
                    <div className="space-y-3">
                      {applicant.resumeUrl && (
                        <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-blue-500" />
                            <div>
                              <h4 className="font-medium">Resume/CV</h4>
                              <p className="text-sm text-neutral-500">
                                PDF Document
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            leftIcon={<Download className="w-4 h-4" />}
                            onClick={() => handleDownloadDocument("resume")}
                            disabled={isDownloading === "resume"}
                          >
                            {isDownloading === "resume"
                              ? "Downloading..."
                              : "Download"}
                          </Button>
                        </div>
                      )}

                      {applicant.coverLetter && (
                        <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-green-500" />
                            <div>
                              <h4 className="font-medium">Cover Letter</h4>
                              <p className="text-sm text-neutral-500">
                                Text Document
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            leftIcon={<Download className="w-4 h-4" />}
                            onClick={() =>
                              handleDownloadDocument("coverletter")
                            }
                            disabled={isDownloading === "coverletter"}
                          >
                            {isDownloading === "coverletter"
                              ? "Downloading..."
                              : "Download"}
                          </Button>
                        </div>
                      )}

                      {/* Portfolio download - check if portfolioUrl exists on applicant */}
                      {applicant.portfolioUrl && (
                        <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-purple-500" />
                            <div>
                              <h4 className="font-medium">
                                Teaching Portfolio
                              </h4>
                              <p className="text-sm text-neutral-500">
                                PDF Document
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            leftIcon={<Download className="w-4 h-4" />}
                            onClick={() => handleDownloadDocument("portfolio")}
                            disabled={isDownloading === "portfolio"}
                          >
                            {isDownloading === "portfolio"
                              ? "Downloading..."
                              : "Download"}
                          </Button>
                        </div>
                      )}

                      {!applicant.resumeUrl &&
                        !applicant.coverLetter &&
                        !applicant.portfolioUrl && (
                          <div className="text-center py-8 text-neutral-500">
                            <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                            <p>No documents available</p>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {activeTab === "notes" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">
                      Internal Notes
                    </h3>

                    {/* Add new note */}
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note about this applicant..."
                        className="w-full p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 resize-none"
                        rows={3}
                      />
                      <div className="flex justify-end mt-3">
                        <Button
                          size="sm"
                          onClick={addNote}
                          disabled={!newNote.trim()}
                        >
                          Add Note
                        </Button>
                      </div>
                    </div>

                    {/* Existing notes */}
                    <div className="space-y-3">
                      {(
                        applicant.notes || [
                          "Strong teaching background",
                          "Excellent communication skills",
                          "Available for immediate start",
                        ]
                      ).map((note, index) => (
                        <div
                          key={index}
                          className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg"
                        >
                          <p className="text-neutral-700 dark:text-neutral-300">
                            {note}
                          </p>
                          <p className="text-xs text-neutral-500 mt-2">
                            Added on {new Date().toLocaleDateString()} by HR
                            Team
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "timeline" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">
                      Application Timeline
                    </h3>
                    <div className="space-y-4">
                      {mockTimeline.map((event, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(event.status)}`}
                          >
                            {event.status === "applied" && (
                              <User className="w-4 h-4" />
                            )}
                            {event.status === "reviewing" && (
                              <Clock className="w-4 h-4" />
                            )}
                            {event.status === "interview" && (
                              <Calendar className="w-4 h-4" />
                            )}
                            {event.status === "hired" && (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            {event.status === "declined" && (
                              <XCircle className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{event.action}</h4>
                              <span className="text-sm text-neutral-500">
                                {new Date(event.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
                              {event.note}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="border-t border-neutral-200 dark:border-neutral-800 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {applicant.status === "applied" && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => handleStatusUpdate("reviewing")}
                        >
                          Move to Review
                        </Button>
                        <Button
                          variant="gradient"
                          leftIcon={<Calendar className="w-4 h-4" />}
                          onClick={openInterviewModal}
                        >
                          Schedule Interview
                        </Button>
                      </>
                    )}

                    {applicant.status === "reviewing" && (
                      <Button
                        variant="gradient"
                        leftIcon={<Calendar className="w-4 h-4" />}
                        onClick={openInterviewModal}
                      >
                        Schedule Interview
                      </Button>
                    )}

                    {applicant.status === "interview" && (
                      <>
                        <Button
                          variant="gradient"
                          leftIcon={<CheckCircle className="w-4 h-4" />}
                          onClick={() => handleStatusUpdate("hired")}
                        >
                          Hire Candidate
                        </Button>
                      </>
                    )}

                    {(applicant.status === "applied" ||
                      applicant.status === "reviewing" ||
                      applicant.status === "interview") && (
                      <Button
                        variant="ghost"
                        leftIcon={<XCircle className="w-4 h-4" />}
                        onClick={() => handleStatusUpdate("declined")}
                      >
                        Decline
                      </Button>
                    )}
                  </div>

                  {applicant.status === "interview" &&
                    applicant.interviewDate && (
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Interview scheduled:{" "}
                          {new Date(applicant.interviewDate).toLocaleString()}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </motion.div>
            </Paywall>
          </div>
        )}
      </AnimatePresence>

      {/* Interview Schedule Modal */}
      <InterviewScheduleModal
        isOpen={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        applicant={{
          id: applicant.id,
          name: applicant.name,
          email: applicant.email,
          phone: applicant.phone,
        }}
        jobTitle={jobTitle || ""}
        onSchedule={handleScheduleInterview}
      />
    </>
  );
};
