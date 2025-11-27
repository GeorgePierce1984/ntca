import React, { useState } from "react";
import { format } from "date-fns";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  ExternalLink,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Download,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneCountryCode: string;
  city: string;
  country: string;
  qualification: string;
  experienceYears: number;
  experience: string;
  bio?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  photoUrl?: string;
  teachingLicense?: string;
  certifications: string[];
  subjects: string[];
  ageGroups: string[];
  languageSkills?: Record<string, string>;
  currentLocation?: string;
  willingToRelocate: boolean;
  availability?: string;
  startDate?: string;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  specializations: string[];
  previousSchools: string[];
  salaryExpectation?: string;
  verified: boolean;
  rating?: number;
}

interface ApplicationNote {
  id: string;
  content: string;
  authorType: string;
  authorName?: string;
  createdAt: string;
}

interface Application {
  id: string;
  status: "APPLIED" | "REVIEWING" | "INTERVIEW" | "DECLINED" | "HIRED";
  coverLetter?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  interviewDate?: string;
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  teacher: Teacher;
  notes: ApplicationNote[];
}

interface ApplicationsListProps {
  jobId: string;
  jobTitle: string;
  applications: Application[];
  onStatusUpdate?: (applicationId: string, status: string) => void;
  onRefresh?: () => void;
}

const statusColors = {
  APPLIED: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  REVIEWING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  INTERVIEW:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  DECLINED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  HIRED: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
};

const statusIcons = {
  APPLIED: Clock,
  REVIEWING: AlertCircle,
  INTERVIEW: Calendar,
  DECLINED: XCircle,
  HIRED: CheckCircle,
};

export function ApplicationsList({
  applications,
  onStatusUpdate,
  onRefresh,
}: ApplicationsListProps) {
  const [expandedApplication, setExpandedApplication] = useState<string | null>(
    null,
  );
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");

  const handleStatusChange = async (
    applicationId: string,
    newStatus: string,
  ) => {
    try {
      setUpdatingStatus(applicationId);
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `/api/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success("Application status updated");
      onStatusUpdate?.(applicationId, newStatus);
      onRefresh?.();
    } catch {
      toast.error("Failed to update application status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleAddNote = async (applicationId: string) => {
    if (!noteContent.trim()) return;

    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `/api/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ note: noteContent }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to add note");
      }

      toast.success("Note added successfully");
      setNoteContent("");
      setShowNoteModal(null);
      onRefresh?.();
    } catch {
      toast.error("Failed to add note");
    }
  };

  const toggleExpanded = (applicationId: string) => {
    setExpandedApplication(
      expandedApplication === applicationId ? null : applicationId,
    );
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
        <p className="text-neutral-600 dark:text-neutral-400">
          No applications received yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => {
        const StatusIcon = statusIcons[application.status];
        const isExpanded = expandedApplication === application.id;

        return (
          <div
            key={application.id}
            className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800"
          >
            {/* Header */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {application.teacher.photoUrl ? (
                    <img
                      src={application.teacher.photoUrl}
                      alt={`${application.teacher.firstName} ${application.teacher.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                      <User className="w-8 h-8 text-neutral-400" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {application.teacher.firstName}{" "}
                      {application.teacher.lastName}
                      {application.teacher.verified && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {application.teacher.qualification}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {application.teacher.city},{" "}
                        {application.teacher.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {application.teacher.experienceYears} years
                      </span>
                      {application.teacher.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {application.teacher.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                      statusColors[application.status]
                    }`}
                  >
                    <StatusIcon className="w-4 h-4" />
                    {application.status}
                  </span>

                  <button
                    onClick={() => toggleExpanded(application.id)}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <a
                  href={`mailto:${application.teacher.email}`}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Mail className="w-4 h-4" />
                  {application.teacher.email}
                </a>
                <a
                  href={`tel:${application.teacher.phoneCountryCode}${application.teacher.phone}`}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Phone className="w-4 h-4" />
                  {application.teacher.phoneCountryCode}{" "}
                  {application.teacher.phone}
                </a>
                {application.resumeUrl && (
                  <a
                    href={application.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Resume
                  </a>
                )}
                {application.portfolioUrl && (
                  <a
                    href={application.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Portfolio
                  </a>
                )}
              </div>

              {/* Applied Date */}
              <p className="text-sm text-neutral-500 mt-3">
                Applied{" "}
                {format(
                  new Date(application.createdAt),
                  "MMM d, yyyy 'at' h:mm a",
                )}
              </p>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-neutral-200 dark:border-neutral-800">
                {/* Cover Letter */}
                {application.coverLetter && (
                  <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                    <h4 className="font-medium mb-2">Cover Letter</h4>
                    <p className="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                      {application.coverLetter}
                    </p>
                  </div>
                )}

                {/* Teacher Details */}
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                  <h4 className="font-medium mb-4">Detailed Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {application.teacher.bio && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-neutral-500 mb-1">
                          Bio
                        </p>
                        <p className="text-neutral-700 dark:text-neutral-300">
                          {application.teacher.bio}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-neutral-500 mb-1">
                        Teaching License
                      </p>
                      <p className="text-neutral-700 dark:text-neutral-300">
                        {application.teacher.teachingLicense || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-neutral-500 mb-1">
                        Certifications
                      </p>
                      <p className="text-neutral-700 dark:text-neutral-300">
                        {application.teacher.certifications.length > 0
                          ? application.teacher.certifications.join(", ")
                          : "None"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-neutral-500 mb-1">
                        Subjects
                      </p>
                      <p className="text-neutral-700 dark:text-neutral-300">
                        {application.teacher.subjects.join(", ")}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-neutral-500 mb-1">
                        Age Groups
                      </p>
                      <p className="text-neutral-700 dark:text-neutral-300">
                        {application.teacher.ageGroups.join(", ")}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-neutral-500 mb-1">
                        Salary Expectation
                      </p>
                      <p className="text-neutral-700 dark:text-neutral-300">
                        {application.teacher.salaryExpectation ||
                          "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-neutral-500 mb-1">
                        Availability
                      </p>
                      <p className="text-neutral-700 dark:text-neutral-300">
                        {application.teacher.availability || "Immediate"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {application.notes.length > 0 && (
                  <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                    <h4 className="font-medium mb-3">Notes</h4>
                    <div className="space-y-3">
                      {application.notes.map((note) => (
                        <div
                          key={note.id}
                          className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3"
                        >
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {note.content}
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {note.authorName || "System"} •{" "}
                            {format(new Date(note.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <select
                      value={application.status}
                      onChange={(e) =>
                        handleStatusChange(application.id, e.target.value)
                      }
                      disabled={updatingStatus === application.id}
                      className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                    >
                      <option value="APPLIED">Applied</option>
                      <option value="REVIEWING">Reviewing</option>
                      <option value="INTERVIEW">Interview</option>
                      <option value="DECLINED">Declined</option>
                      <option value="HIRED">Hired</option>
                    </select>

                    <button
                      onClick={() => setShowNoteModal(application.id)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Add Note
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Note</h3>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              rows={4}
              placeholder="Enter your note..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleAddNote(showNoteModal)}
                className="btn-primary flex-1"
              >
                Save Note
              </button>
              <button
                onClick={() => {
                  setShowNoteModal(null);
                  setNoteContent("");
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
