import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Star,
  GraduationCap,
  Briefcase,
  Languages,
  Users,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InterviewInviteModal } from "./InterviewInviteModal";
import { Paywall } from "@/components/paywall/Paywall";
import { canAccessPremiumFeatures } from "@/utils/subscription";
import { getCountryByName } from "@/data/countries";
import toast from "react-hot-toast";

interface ApplicationNote {
  id: string;
  content: string;
  authorType: string;
  authorName?: string;
  createdAt: string;
}

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
  createdAt?: string;
  updatedAt?: string;
  resumeUrl?: string;
  coverLetter?: string;
  portfolioUrl?: string;
  rating?: number;
  notes?: ApplicationNote[];
  interviewDate?: string;
  skills?: string[];
  languages?: string[];
  visaStatus?: string;
  availability?: string;
  // Teacher profile fields
  photoUrl?: string;
  nationality?: string;
  firstName?: string;
  lastName?: string;
  experienceYears?: number;
  verified?: boolean;
  certifications?: string[];
  subjects?: string[];
  ageGroups?: string[];
  bio?: string;
  education?: Array<{
    degree: string;
    field: string;
    institution: string;
    year: string;
  }>;
  teachingExperience?: Array<{
    schoolName: string;
    country: string;
    startDate: string;
    endDate: string;
    studentAgeGroups: string[];
    subjectsTaught: string[];
    keyAchievements: string;
  }>;
  specializations?: string[];
  teachingStyle?: string;
  nativeLanguage?: string;
  otherLanguages?: string;
  workAuthorization?: string[];
  startDate?: string;
  currentLocation?: string;
  willingToRelocate?: boolean;
  preferredLocations?: string[];
  interviewRequest?: {
    id: string;
    duration: number;
    locationType: string;
    location?: string;
    message?: string;
    timeSlots: Array<{
      date: string;
      time: string;
      timezone: string;
    }>;
    selectedSlot?: number;
    alternativeSlot?: {
      date: string;
      time: string;
      timezone: string;
    };
    status: "pending" | "accepted" | "alternative_suggested";
    createdAt: string;
    updatedAt: string;
  };
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
  onRefresh?: () => void; // Optional callback to refresh applicant data
  jobTitle?: string;
  subscriptionStatus?: string | null;
  isUpdating?: boolean;
  school?: {
    name: string;
    city?: string;
    country?: string;
    timezone?: string;
  };
}

export const ApplicantModal: React.FC<ApplicantModalProps> = ({
  applicant,
  isOpen,
  onClose,
  onStatusUpdate,
  onRefresh,
  jobTitle,
  subscriptionStatus,
  isUpdating = false,
  school,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "documents" | "notes" | "timeline"
  >("overview");
  const [newNote, setNewNote] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [rating, setRating] = useState(applicant?.rating || 0);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [notes, setNotes] = useState<ApplicationNote[]>(applicant?.notes || []);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [processingAlternative, setProcessingAlternative] = useState(false);
  const fetchingRef = useRef(false);

  const fetchNotes = useCallback(async () => {
    if (!applicant?.id || fetchingRef.current) return;
    
    fetchingRef.current = true;
    setLoadingNotes(true);
    
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`/api/applications/${applicant.id}/notes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch notes");
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setLoadingNotes(false);
      fetchingRef.current = false;
    }
  }, [applicant?.id]);

  const addNote = async () => {
    if (!newNote.trim() || !applicant?.id || addingNote) return;

    setAddingNote(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`/api/applications/${applicant.id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newNote.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes([data.note, ...notes]);
        setNewNote("");
        toast.success("Note added successfully");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to add note");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  // Fetch notes when notes tab is opened or when applicant changes
  useEffect(() => {
    if (activeTab === "notes" && applicant?.id) {
      fetchNotes();
    }
  }, [activeTab, applicant?.id, fetchNotes]);

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

  const handleSendInterviewInvite = async (data: {
    applicationId: string;
    duration: number;
    locationType: "video" | "phone" | "onsite";
    location: string;
    message?: string;
    timeSlots: Array<{ date: string; time: string; timezone: string }>;
  }) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`/api/applications/${data.applicationId}/interview-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to send interview invite" }));
        throw new Error(error.error || "Failed to send interview invite");
      }

      // Status will be updated to INTERVIEW by the API
      toast.success("Interview invite sent successfully!");
      setShowInterviewModal(false);
      // Refresh the applicant data by calling onStatusUpdate
      onStatusUpdate(applicant.id, "interview");
    } catch (error) {
      console.error("Error sending interview invite:", error);
      throw error; // Re-throw to let modal handle the error
    }
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
        const error = await response.json().catch(() => ({ error: "Failed to download document" }));
        throw new Error(error.error || "Failed to download document");
      }

      // Handle file response
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
      } else {
        // Try to determine filename from resume URL if available
        if (applicant.resumeUrl) {
          const urlParts = applicant.resumeUrl.split('/');
          const lastPart = urlParts[urlParts.length - 1];
          if (lastPart && lastPart.includes('.')) {
            filename = lastPart.split('?')[0]; // Remove query params if any
          }
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to download document",
      );
    } finally {
      setIsDownloading(null);
    }
  };

  // Build timeline from actual application data
  const buildTimeline = () => {
    const timeline: Array<{
      date: string;
      action: string;
      status: string;
      note: string;
    }> = [];

    // 1. Application submitted
    const appliedDate = applicant.appliedDate || applicant.createdAt;
    if (appliedDate) {
      timeline.push({
        date: appliedDate,
        action: "Applied",
        status: "applied",
        note: "Application submitted" + (applicant.resumeUrl ? " with resume" : ""),
      });
    }

    // 2. Status progression based on current status
    const statusOrder = ["applied", "reviewing", "interview", "hired", "declined"];
    const currentStatusIndex = statusOrder.indexOf(applicant.status);
    
    // Add status changes based on current status
    if (currentStatusIndex >= 1) {
      // Status changed to reviewing
      const reviewingDate = applicant.updatedAt || appliedDate;
      timeline.push({
        date: reviewingDate,
        action: "Status Changed",
        status: "reviewing",
        note: "Application moved to review stage",
      });
    }

    if (currentStatusIndex >= 2) {
      // Status changed to interview
      const interviewDate = applicant.interviewDate || applicant.updatedAt || appliedDate;
      timeline.push({
        date: interviewDate,
        action: "Interview Scheduled",
        status: "interview",
        note: applicant.interviewDate
          ? `Interview scheduled for ${new Date(applicant.interviewDate).toLocaleDateString()}`
          : "Interview scheduled",
      });
    }

    if (currentStatusIndex >= 3) {
      // Final status (hired or declined)
      const finalDate = applicant.updatedAt || appliedDate;
      const finalStatus = applicant.status === "hired" ? "hired" : "declined";
      timeline.push({
        date: finalDate,
        action: applicant.status === "hired" ? "Hired" : "Declined",
        status: finalStatus,
        note: applicant.status === "hired" 
          ? "Application accepted and candidate hired"
          : "Application declined",
      });
    }

    // Sort timeline by date (oldest first)
    return timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const timeline = buildTimeline();

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
                  {applicant.photoUrl ? (
                    <img
                      src={applicant.photoUrl}
                      alt={applicant.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                      {applicant.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      {applicant.nationality && (() => {
                        const country = getCountryByName(applicant.nationality);
                        return country?.flag ? <span className="text-2xl">{country.flag}</span> : null;
                      })()}
                      {applicant.name}
                      {applicant.verified && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </h2>
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
                    {/* Key Information */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {applicant.rating && (
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          <span className="font-medium">{applicant.rating} Rating</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-neutral-400" />
                        <span>{applicant.location}</span>
                      </div>
                      {applicant.experienceYears !== undefined && applicant.experienceYears !== null && (
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-neutral-400" />
                          <span>{applicant.experienceYears} years experience</span>
                        </div>
                      )}
                      {applicant.availability && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-neutral-400" />
                          <span>Available: {applicant.availability}</span>
                        </div>
                      )}
                    </div>

                    {/* Subjects */}
                    {applicant.subjects && applicant.subjects.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          Subjects Taught
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {applicant.subjects.map((subject, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bio/Summary */}
                    {applicant.bio && applicant.bio.trim() && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                          <User className="w-5 h-5" />
                          About
                        </h3>
                        <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                          {applicant.bio}
                        </p>
                      </div>
                    )}

                    {/* Languages */}
                    {applicant.languages && applicant.languages.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                          <Globe className="w-5 h-5" />
                          Languages
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {applicant.languages.map((language, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                            >
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Age Groups */}
                    {applicant.ageGroups && applicant.ageGroups.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Age Groups
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {applicant.ageGroups.map((ageGroup, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                            >
                              {ageGroup}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Qualifications - Certifications and Education */}
                    {(() => {
                      const hasCertInArray = (certName: string) => {
                        if (!applicant.certifications || applicant.certifications.length === 0) return false;
                        return applicant.certifications.some(cert => 
                          cert.toLowerCase().includes(certName.toLowerCase())
                        );
                      };

                      const hasCertInEducation = (certName: string) => {
                        if (!applicant.education || applicant.education.length === 0) return false;
                        return applicant.education.some((edu: any) => {
                          if (!edu?.degree) return false;
                          const degree = edu.degree.toLowerCase();
                          return degree.includes(certName.toLowerCase());
                        });
                      };

                      const hasCertInQualification = (certName: string) => {
                        if (!applicant.qualification) return false;
                        return applicant.qualification.toLowerCase().includes(certName.toLowerCase());
                      };

                      const hasCertification = (certName: string) => {
                        return hasCertInArray(certName) || hasCertInEducation(certName) || hasCertInQualification(certName);
                      };

                      const certs = [];
                      if (hasCertification('TEFL')) certs.push({ name: 'TEFL', icon: Award });
                      if (hasCertification('CELTA')) certs.push({ name: 'CELTA', icon: Award });
                      if (hasCertification('TESOL')) certs.push({ name: 'TESOL', icon: Award });
                      if (hasCertification('DELTA')) certs.push({ name: 'DELTA', icon: Award });

                      const degrees = applicant.education && applicant.education.length > 0
                        ? applicant.education.filter((edu: any) => {
                            if (!edu?.degree) return false;
                            const degree = edu.degree.toLowerCase();
                            return degree.includes("master") || degree.includes("bachelor") || degree.includes("phd") || degree.includes("degree");
                          })
                        : [];

                      if (certs.length > 0 || degrees.length > 0) {
                        return (
                          <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                              <GraduationCap className="w-5 h-5" />
                              Qualifications
                            </h3>
                            
                            {certs.length > 0 && (
                              <div className="mb-4">
                                <div className="flex flex-wrap gap-4">
                                  {certs.map((cert, index) => {
                                    const Icon = cert.icon;
                                    return (
                                      <div key={index} className="flex items-center gap-2" title={`${cert.name} Certified`}>
                                        <Icon className="w-5 h-5 text-primary-600" />
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">{cert.name}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {degrees.length > 0 && (
                              <div className="space-y-3">
                                {degrees.map((edu: any, index: number) => (
                                  <div
                                    key={index}
                                    className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg"
                                  >
                                    <p className="font-medium">
                                      {edu.degree}
                                      {edu.field && edu.field.trim() && ` in ${edu.field}`}
                                    </p>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                      {edu.institution && edu.institution.trim() && `${edu.institution}`}
                                      {edu.institution && edu.institution.trim() && edu.year && ` • `}
                                      {edu.year && edu.year.trim() && `${edu.year}`}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}

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

                    {/* Teaching Experience */}
                    {applicant.teachingExperience && applicant.teachingExperience.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                          <Briefcase className="w-5 h-5" />
                          Teaching Experience
                        </h3>
                        <div className="space-y-4">
                          {applicant.teachingExperience.map((exp, index) => (
                            <div
                              key={index}
                              className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-medium">{exp.schoolName}</p>
                                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {exp.country}
                                  </p>
                                </div>
                                <span className="text-sm text-neutral-500">
                                  {exp.startDate} - {exp.endDate}
                                </span>
                              </div>
                              {exp.subjectsTaught && exp.subjectsTaught.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium mb-1">Subjects:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {exp.subjectsTaught.map((subject, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs"
                                      >
                                        {subject}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {exp.keyAchievements && (
                                <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-2">
                                  {exp.keyAchievements}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Specializations */}
                    {applicant.specializations && applicant.specializations.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                          <Award className="w-5 h-5" />
                          Specializations
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {applicant.specializations.map((spec, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Contact Information
                      </h3>
                      <div className="space-y-3">
                        {applicant.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-neutral-400" />
                            <div>
                              <span className="text-sm text-neutral-500">Email</span>
                              <p className="font-medium">{applicant.email}</p>
                            </div>
                          </div>
                        )}
                        {applicant.phone && applicant.phone !== 'N/A' && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-neutral-400" />
                            <div>
                              <span className="text-sm text-neutral-500">Phone</span>
                              <p className="font-medium">{applicant.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Interview Request Information - Moved to main body */}
                    {applicant.interviewRequest && (
                      <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300">
                              Interview Request
                            </h3>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            applicant.interviewRequest.status === "pending"
                              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                              : applicant.interviewRequest.status === "accepted"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                              : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400"
                          }`}>
                            {applicant.interviewRequest.status === "pending"
                              ? "Pending Response"
                              : applicant.interviewRequest.status === "accepted"
                              ? "Accepted"
                              : "Alternative Suggested"}
                          </span>
                        </div>

                        {/* Original Time Slots */}
                        {applicant.interviewRequest.timeSlots && applicant.interviewRequest.timeSlots.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">
                              Suggested Time Slots:
                            </p>
                            <div className="space-y-2">
                              {applicant.interviewRequest.timeSlots.map((slot, index) => {
                                const formatTime = (date: string, time: string, timezone: string) => {
                                  try {
                                    const dateTime = new Date(`${date}T${time}`);
                                    return new Intl.DateTimeFormat("en-US", {
                                      timeZone: timezone,
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    }).format(dateTime);
                                  } catch {
                                    return `${date} ${time}`;
                                  }
                                };
                                
                                return (
                                  <div
                                    key={index}
                                    className={`p-2 rounded text-sm ${
                                      applicant.interviewRequest?.selectedSlot === index
                                        ? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"
                                        : "bg-white dark:bg-neutral-800"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>
                                        Option {index + 1}: {formatTime(slot.date, slot.time, slot.timezone)}
                                      </span>
                                      {applicant.interviewRequest?.selectedSlot === index && (
                                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Alternative Time Slot Suggested */}
                        {applicant.interviewRequest.status === "alternative_suggested" && applicant.interviewRequest.alternativeSlot && (
                          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-amber-900 dark:text-amber-300">
                                Teacher Suggested Alternative Time:
                              </p>
                              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <p className="text-sm text-amber-800 dark:text-amber-400 mb-3">
                              {(() => {
                                const alt = applicant.interviewRequest.alternativeSlot;
                                try {
                                  const dateTime = new Date(`${alt.date}T${alt.time}`);
                                  return new Intl.DateTimeFormat("en-US", {
                                    timeZone: alt.timezone,
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }).format(dateTime);
                                } catch {
                                  return `${alt.date} ${alt.time}`;
                                }
                              })()}
                              {school?.timezone && applicant.interviewRequest.alternativeSlot.timezone !== school.timezone && (
                                <span className="ml-2 text-xs">
                                  ({school.timezone}: {(() => {
                                    const alt = applicant.interviewRequest.alternativeSlot;
                                    try {
                                      const dateTime = new Date(`${alt.date}T${alt.time}`);
                                      return new Intl.DateTimeFormat("en-US", {
                                        timeZone: school.timezone,
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      }).format(dateTime);
                                    } catch {
                                      return `${alt.date} ${alt.time}`;
                                    }
                                  })()})
                                </span>
                              )}
                            </p>
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="gradient"
                                disabled={processingAlternative}
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  
                                  if (processingAlternative) return;
                                  
                                  setProcessingAlternative(true);
                                  try {
                                    const token = localStorage.getItem("authToken");
                                    if (!token) {
                                      throw new Error("Authentication required");
                                    }

                                    const response = await fetch(`/api/applications/${applicant.id}/interview-alternative-response`, {
                                      method: "PATCH",
                                      headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${token}`,
                                      },
                                      body: JSON.stringify({ action: "accept" }),
                                    });

                                    if (!response.ok) {
                                      const errorData = await response.json().catch(() => ({ error: "Failed to accept alternative time" }));
                                      throw new Error(errorData.error || "Failed to accept alternative time");
                                    }

                                    toast.success("Alternative time accepted!");
                                    
                                    // Refresh applicant data with error handling
                                    try {
                                      if (onRefresh) {
                                        await onRefresh();
                                      } else {
                                        // Fallback: trigger status update to refresh
                                        await onStatusUpdate(applicant.id, applicant.status);
                                      }
                                    } catch (refreshError) {
                                      console.error("Error refreshing applicant data:", refreshError);
                                      // Don't show error to user, just log it - the API call succeeded
                                    }
                                  } catch (error) {
                                    console.error("Error accepting alternative time:", error);
                                    toast.error(error instanceof Error ? error.message : "Failed to accept alternative time");
                                  } finally {
                                    setProcessingAlternative(false);
                                  }
                                }}
                              >
                                {processingAlternative ? (
                                  <>
                                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Accept Alternative
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={processingAlternative}
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  
                                  if (processingAlternative) return;
                                  
                                  setProcessingAlternative(true);
                                  try {
                                    const token = localStorage.getItem("authToken");
                                    if (!token) {
                                      throw new Error("Authentication required");
                                    }

                                    const response = await fetch(`/api/applications/${applicant.id}/interview-alternative-response`, {
                                      method: "PATCH",
                                      headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${token}`,
                                      },
                                      body: JSON.stringify({ action: "decline" }),
                                    });

                                    if (!response.ok) {
                                      const errorData = await response.json().catch(() => ({ error: "Failed to decline alternative time" }));
                                      throw new Error(errorData.error || "Failed to decline alternative time");
                                    }

                                    toast.success("Alternative time declined. Teacher will be notified.");
                                    
                                    // Refresh applicant data with error handling
                                    try {
                                      if (onRefresh) {
                                        await onRefresh();
                                      } else {
                                        // Fallback: trigger status update to refresh
                                        await onStatusUpdate(applicant.id, applicant.status);
                                      }
                                    } catch (refreshError) {
                                      console.error("Error refreshing applicant data:", refreshError);
                                      // Don't show error to user, just log it - the API call succeeded
                                    }
                                  } catch (error) {
                                    console.error("Error declining alternative time:", error);
                                    toast.error(error instanceof Error ? error.message : "Failed to decline alternative time");
                                  } finally {
                                    setProcessingAlternative(false);
                                  }
                                }}
                              >
                                {processingAlternative ? (
                                  <>
                                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Decline Alternative
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Accepted Interview Details */}
                        {applicant.interviewRequest.status === "accepted" && applicant.interviewRequest.selectedSlot !== undefined && (
                          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-sm font-medium text-green-900 dark:text-green-300 mb-1">
                              Interview Confirmed:
                            </p>
                            <p className="text-sm text-green-800 dark:text-green-400">
                              {(() => {
                                const slot = applicant.interviewRequest.timeSlots[applicant.interviewRequest.selectedSlot];
                                try {
                                  const dateTime = new Date(`${slot.date}T${slot.time}`);
                                  return new Intl.DateTimeFormat("en-US", {
                                    timeZone: slot.timezone,
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }).format(dateTime);
                                } catch {
                                  return `${slot.date} ${slot.time}`;
                                }
                              })()}
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-500 mt-1">
                              {applicant.interviewRequest.locationType === "video"
                                ? "Video Interview"
                                : applicant.interviewRequest.locationType === "phone"
                                ? "Phone Interview"
                                : "Onsite Interview"}{" "}
                              - {applicant.interviewRequest.duration} minutes
                            </p>
                            {applicant.interviewRequest.location && (
                              <p className="text-xs text-green-700 dark:text-green-500 mt-1">
                                Location: {applicant.interviewRequest.location}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Interview Details */}
                        <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                          <p className="text-xs text-purple-700 dark:text-purple-400">
                            <strong>Type:</strong> {applicant.interviewRequest.locationType === "video"
                              ? "Video Interview"
                              : applicant.interviewRequest.locationType === "phone"
                              ? "Phone Interview"
                              : "Onsite Interview"}
                          </p>
                          <p className="text-xs text-purple-700 dark:text-purple-400">
                            <strong>Duration:</strong> {applicant.interviewRequest.duration} minutes
                          </p>
                          {applicant.interviewRequest.location && (
                            <p className="text-xs text-purple-700 dark:text-purple-400">
                              <strong>Location:</strong> {applicant.interviewRequest.location}
                            </p>
                          )}
                          {applicant.interviewRequest.message && (
                            <p className="text-xs text-purple-700 dark:text-purple-400 mt-2">
                              <strong>Message:</strong> {applicant.interviewRequest.message}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "documents" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">
                      CV/Resume
                    </h3>
                    <div className="space-y-3">
                      {applicant.resumeUrl ? (
                        <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-blue-500" />
                            <div>
                              <h4 className="font-medium">Resume/CV</h4>
                              <p className="text-sm text-neutral-500">
                                {(() => {
                                  const url = applicant.resumeUrl || '';
                                  if (url.toLowerCase().includes('.pdf')) {
                                    return 'PDF Document';
                                  } else if (url.toLowerCase().includes('.docx')) {
                                    return 'DOCX Document';
                                  } else if (url.toLowerCase().includes('.doc')) {
                                    return 'DOC Document';
                                  }
                                  return 'Document';
                                })()}
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
                      ) : (
                        <div className="text-center py-8 text-neutral-500">
                          <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                          <p>No CV/Resume available</p>
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
                          disabled={!newNote.trim() || addingNote}
                        >
                          {addingNote ? "Adding..." : "Add Note"}
                        </Button>
                      </div>
                    </div>

                    {/* Existing notes */}
                    {loadingNotes ? (
                      <div className="text-center py-8 text-neutral-500">
                        <Clock className="w-8 h-8 mx-auto mb-3 text-neutral-300 animate-spin" />
                        <p>Loading notes...</p>
                      </div>
                    ) : notes.length > 0 ? (
                      <div className="space-y-3">
                        {notes.map((note) => (
                          <div
                            key={note.id}
                            className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg"
                          >
                            <p className="text-neutral-700 dark:text-neutral-300">
                              {note.content}
                            </p>
                            <p className="text-xs text-neutral-500 mt-2">
                              Added on {new Date(note.createdAt).toLocaleDateString()}
                              {note.authorName && ` by ${note.authorName}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-neutral-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                        <p>No notes yet. Add your first note above.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "timeline" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">
                      Application Timeline
                    </h3>
                    <div className="space-y-4">
                      {timeline.length > 0 ? (
                        timeline.map((event, index) => (
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
                      ))
                      ) : (
                        <div className="text-center py-8 text-neutral-500">
                          <Clock className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                          <p>No timeline events available</p>
                        </div>
                      )}
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
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Updating..." : "Move to Review"}
                        </Button>
                        <Button
                          variant="gradient"
                          leftIcon={<Calendar className="w-4 h-4" />}
                          onClick={openInterviewModal}
                          disabled={isUpdating}
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
                        disabled={isUpdating}
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
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Updating..." : "Hire Candidate"}
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
                        disabled={isUpdating}
                      >
                        {isUpdating ? "Updating..." : "Decline"}
                      </Button>
                    )}
                  </div>

                  {applicant.status === "interview" &&
                    applicant.interviewDate &&
                    !applicant.interviewRequest && (
                      <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
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
      {school && applicant && (
        <InterviewInviteModal
          isOpen={showInterviewModal}
          onClose={() => setShowInterviewModal(false)}
          applicant={{
            id: applicant.id,
            name: applicant.name,
            email: applicant.email,
            currentLocation: applicant.currentLocation,
            timezone: applicant.currentLocation ? "UTC" : undefined, // TODO: Get actual teacher timezone
          }}
          school={school}
          jobTitle={jobTitle || ""}
          onSend={handleSendInterviewInvite}
        />
      )}
    </>
  );
};
