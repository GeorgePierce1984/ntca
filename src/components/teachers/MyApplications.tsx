import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Briefcase,
  Building,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

interface School {
  id: string;
  name: string;
  city: string;
  country: string;
  logoUrl?: string;
  verified: boolean;
}

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  type: string;
  status: string;
  deadline: string;
  createdAt: string;
  qualification: string;
  experience: string;
  language: string;
  visaRequired: boolean;
  benefits?: string;
  requirements?: string;
  school: School;
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
  appliedAt: string;
  updatedAt: string;
  coverLetter?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  interviewDate?: string;
  rating?: number;
  feedback?: string;
  notes: ApplicationNote[];
  job: Job;
}

interface Statistics {
  total: number;
  APPLIED: number;
  REVIEWING: number;
  INTERVIEW: number;
  DECLINED: number;
  HIRED: number;
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

export function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    APPLIED: 0,
    REVIEWING: 0,
    INTERVIEW: 0,
    DECLINED: 0,
    HIRED: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [expandedApplication, setExpandedApplication] = useState<string | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [selectedStatus, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (selectedStatus) {
        params.append("status", selectedStatus);
      }

      const response = await fetch(`/api/teachers/applications?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data.applications);
      setStatistics(data.statistics);
      setHasMore(data.pagination.hasNext);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = (applicationId: string) => {
    setExpandedApplication(
      expandedApplication === applicationId ? null : applicationId,
    );
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "APPLIED":
        return "Your application has been submitted and is awaiting review.";
      case "REVIEWING":
        return "The school is currently reviewing your application.";
      case "INTERVIEW":
        return "Congratulations! You've been selected for an interview.";
      case "DECLINED":
        return "Unfortunately, your application was not selected for this position.";
      case "HIRED":
        return "Congratulations! You've been hired for this position.";
      default:
        return "";
    }
  };

  if (isLoading && applications.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <button
          onClick={() => setSelectedStatus(null)}
          className={`p-4 rounded-lg text-center transition-colors ${
            selectedStatus === null
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          }`}
        >
          <p className="text-2xl font-bold">{statistics.total}</p>
          <p className="text-sm">Total</p>
        </button>

        {Object.entries(statistics).map(([status, count]) => {
          if (status === "total") return null;
          const Icon = statusIcons[status as keyof typeof statusIcons];
          return (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`p-4 rounded-lg text-center transition-colors ${
                selectedStatus === status
                  ? "bg-blue-500 text-white"
                  : "bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              }`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm capitalize">{status.toLowerCase()}</p>
            </button>
          );
        })}
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-lg p-12 text-center">
          <Briefcase className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">
            {selectedStatus
              ? `No ${selectedStatus.toLowerCase()} applications`
              : "You haven't applied to any jobs yet"}
          </p>
          <a href="/jobs" className="btn-primary inline-block mt-4">
            Browse Jobs
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => {
            const StatusIcon = statusIcons[application.status];
            const isExpanded = expandedApplication === application.id;

            return (
              <div
                key={application.id}
                className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      {application.job.school.logoUrl ? (
                        <img
                          src={application.job.school.logoUrl}
                          alt={application.job.school.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                          <Building className="w-8 h-8 text-neutral-400" />
                        </div>
                      )}

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">
                          {application.job.title}
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                          {application.job.school.name}
                          {application.job.school.verified && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {application.job.location}
                          </span>
                          <span>{application.job.salary}</span>
                          <span>{application.job.type.replace("_", " ")}</span>
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

                  {/* Status Message */}
                  <div
                    className={`p-3 rounded-lg mb-3 ${statusColors[application.status]} bg-opacity-10`}
                  >
                    <p className="text-sm">
                      {getStatusMessage(application.status)}
                    </p>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-6 text-sm text-neutral-500">
                    <span>
                      Applied:{" "}
                      {format(new Date(application.appliedAt), "MMM d, yyyy")}
                    </span>
                    <span>
                      Updated:{" "}
                      {format(new Date(application.updatedAt), "MMM d, yyyy")}
                    </span>
                    {application.interviewDate && (
                      <span className="text-purple-600 dark:text-purple-400 font-medium">
                        Interview:{" "}
                        {format(
                          new Date(application.interviewDate),
                          "MMM d, yyyy 'at' h:mm a",
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-neutral-200 dark:border-neutral-800">
                    {/* Cover Letter */}
                    {application.coverLetter && (
                      <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                        <h4 className="font-medium mb-2">Your Cover Letter</h4>
                        <p className="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                          {application.coverLetter}
                        </p>
                      </div>
                    )}

                    {/* Documents */}
                    <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                      <h4 className="font-medium mb-3">Submitted Documents</h4>
                      <div className="flex gap-3">
                        {application.resumeUrl && (
                          <a
                            href={application.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            Resume
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {application.portfolioUrl && (
                          <a
                            href={application.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            Portfolio
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Notes from School */}
                    {application.notes.length > 0 && (
                      <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Messages from School
                        </h4>
                        <div className="space-y-3">
                          {application.notes.map((note) => (
                            <div
                              key={note.id}
                              className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3"
                            >
                              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                {note.content}
                              </p>
                              <p className="text-xs text-neutral-500 mt-1">
                                {note.authorName || "School"} •{" "}
                                {format(
                                  new Date(note.createdAt),
                                  "MMM d, yyyy 'at' h:mm a",
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Feedback */}
                    {application.feedback && (
                      <div className="p-6">
                        <h4 className="font-medium mb-2">Feedback</h4>
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {application.feedback}
                        </p>
                        {application.rating && (
                          <div className="mt-3 flex items-center gap-1">
                            <span className="text-sm text-neutral-500">
                              Rating:
                            </span>
                            {[...Array(5)].map((_, i) => (
                              <CheckCircle
                                key={i}
                                className={`w-4 h-4 ${
                                  i < application.rating!
                                    ? "text-yellow-500"
                                    : "text-neutral-300 dark:text-neutral-700"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {applications.length > 0 && (
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="flex items-center px-4 py-2">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!hasMore}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
