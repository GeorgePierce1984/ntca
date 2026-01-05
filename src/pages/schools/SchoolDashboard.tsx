import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import "@/styles/scrollbar.css";
import {
  Plus,
  Briefcase,
  Users,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Star,
  Search,
  User,
  Mail,
  Phone,
  Award,
  Globe,
  CheckCircle,
  Pause,
  Play,
  X,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Job {
  id: string;
  title: string;
  description: string;
  city: string;
  country: string;
  salary: string;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT";
  status: "ACTIVE" | "PAUSED" | "CLOSED";
  deadline: string;
  qualification: string;
  experience: string;
  language: string;
  visaRequired: boolean;
  teachingLicenseRequired: boolean;
  kazakhLanguageRequired: boolean;
  localCertificationRequired: boolean;
  benefits?: string;
  requirements?: string;
  createdAt: string;
  useSchoolProfile?: boolean;
  schoolDescription?: string;
  _count: {
    applications: number;
  };
}

interface Application {
  id: string;
  status: "APPLIED" | "REVIEWING" | "INTERVIEW" | "DECLINED" | "HIRED";
  coverLetter?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  interviewDate?: string;
  rating?: number;
  createdAt: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    country: string;
    qualification: string;
    experience: string;
    bio?: string;
    verified: boolean;
    rating?: number;
    languages: string[];
    skills: string[];
  };
  job: {
    id: string;
    title: string;
  };
}

interface JobFormData {
  title: string;
  description: string;
  city: string;
  country: string;
  salary: string;
  type: string;
  deadline: string;
  qualification: string;
  experience: string;
  language: string;
  visaRequired: boolean;
  teachingLicenseRequired: boolean;
  kazakhLanguageRequired: boolean;
  localCertificationRequired: boolean;
  benefits: string;
  requirements: string;
  status?: string;
  useSchoolProfile: boolean;
  schoolDescription?: string;
}

const initialJobForm: JobFormData = {
  title: "",
  description: "",
  city: "",
  country: "",
  salary: "",
  type: "FULL_TIME",
  deadline: "",
  qualification: "",
  experience: "",
  language: "English",
  visaRequired: false,
  teachingLicenseRequired: false,
  kazakhLanguageRequired: false,
  localCertificationRequired: false,
  benefits: "",
  requirements: "",
  useSchoolProfile: true,
  schoolDescription: "",
};

const SchoolDashboard: React.FC = () => {
  const {} = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "jobs" | "applications" | "post-job"
  >("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobForm, setJobForm] = useState<JobFormData>(initialJobForm);
  const [submitting, setSubmitting] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const postJobFormRef = useRef<HTMLDivElement>(null);
  const [showFloatingButton, setShowFloatingButton] = useState(true);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchJobs();
    fetchApplications();

    // Handle query parameters
    const tabParam = searchParams.get("tab");
    const jobParam = searchParams.get("job");

    if (tabParam === "applications") {
      setActiveTab("applications");
      if (jobParam) {
        // Filter applications by job if provided
        setFilterStatus(jobParam);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    // Hide floating button when on post-job tab
    setShowFloatingButton(activeTab !== "post-job");
    
    // Scroll to form when post-job tab becomes active
    if (activeTab === "post-job" && postJobFormRef.current) {
      // Use double requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({
            top: postJobFormRef.current?.offsetTop
              ? postJobFormRef.current.offsetTop - 100
              : 0,
            behavior: "smooth",
          });
          // Focus first input after a brief delay to ensure it's rendered
          setTimeout(() => {
            const firstInput = postJobFormRef.current?.querySelector("input");
            firstInput?.focus();
          }, 100);
        });
      });
    }
  }, [activeTab]);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/applications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobSubmit = async (
    e: React.FormEvent,
    isDraft: boolean = false,
  ) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = selectedJob
        ? `/api/jobs/${selectedJob.id}/update`
        : "/api/jobs";
      const method = selectedJob ? "PUT" : "POST";

      const jobData = {
        ...jobForm,
        status: isDraft ? "DRAFT" : "ACTIVE",
        useSchoolProfile: jobForm.useSchoolProfile,
        schoolDescription: jobForm.useSchoolProfile
          ? undefined
          : jobForm.schoolDescription,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        await fetchJobs();
        setShowJobModal(false);
        setSelectedJob(null);
        setJobForm(initialJobForm);
        setActiveTab("jobs");
        toast.success(
          isDraft
            ? "Job saved as draft!"
            : selectedJob
              ? "Job updated successfully!"
              : "Job posted successfully!",
          {
            icon: isDraft ? "📝" : selectedJob ? "✏️" : "🎉",
            duration: 3000,
          },
        );
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save job");
      }
    } catch (error) {
      console.error("Error saving job:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        setJobs(jobs.filter((job) => job.id !== jobId));
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const updateJobStatus = async (
    jobId: string,
    status: "ACTIVE" | "PAUSED" | "CLOSED",
  ) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setJobs(
          jobs.map((job) => (job.id === jobId ? { ...job, status } : job)),
        );
      }
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    status: string,
    note?: string,
  ) => {
    try {
      const response = await fetch(
        `/api/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ status, note }),
        },
      );

      if (response.ok) {
        await fetchApplications();
      }
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  const openJobModal = (job?: Job) => {
    if (job) {
      setSelectedJob(job);
      setJobForm({
        title: job.title,
        description: job.description,
        city: job.city,
        country: job.country,
        salary: job.salary,
        type: job.type,
        deadline: job.deadline.split("T")[0],
        qualification: job.qualification,
        experience: job.experience,
        language: job.language,
        visaRequired: job.visaRequired,
        teachingLicenseRequired: job.teachingLicenseRequired,
        kazakhLanguageRequired: job.kazakhLanguageRequired,
        localCertificationRequired: job.localCertificationRequired,
        benefits: job.benefits || "",
        requirements: job.requirements || "",
        useSchoolProfile: job.useSchoolProfile !== false,
        schoolDescription: job.schoolDescription || "",
      });
    } else {
      setSelectedJob(null);
      setJobForm(initialJobForm);
    }
    setShowJobModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "PAUSED":
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "CLOSED":
      case "closed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "DRAFT":
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      case "APPLIED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "REVIEWING":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "INTERVIEW":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "HIRED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "DECLINED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return "Full-time";
      case "PART_TIME":
        return "Part-time";
      case "CONTRACT":
        return "Contract";
      default:
        return type;
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      job.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      app.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter((j) => j.status === "ACTIVE").length,
    totalApplications: applications.length,
    pendingApplications: applications.filter((a) => a.status === "APPLIED")
      .length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20">
      <div className="container-custom max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-1 mb-2">School Dashboard</h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Manage your job postings and applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {stats.activeJobs}/{stats.totalJobs} Active
              </span>
            </div>
            <div className="text-2xl font-bold mb-1">{stats.totalJobs}</div>
            <div className="text-sm text-neutral-500">Total Job Postings</div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {stats.pendingApplications} New
              </span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {stats.totalApplications}
            </div>
            <div className="text-sm text-neutral-500">Total Applications</div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <Star className="w-6 h-6" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">4.8</div>
            <div className="text-sm text-neutral-500">School Rating</div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                <Eye className="w-6 h-6" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">2.4k</div>
            <div className="text-sm text-neutral-500">Profile Views</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="relative border-b border-neutral-200 dark:border-neutral-700 mb-8">
          {/* Mobile scroll indicator - left */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-neutral-900 to-transparent pointer-events-none z-10 md:hidden" />

          {/* Mobile scroll indicator - right */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-neutral-900 to-transparent pointer-events-none z-10 md:hidden" />

          <nav className="-mb-px flex space-x-4 md:space-x-8 overflow-x-auto scrollbar-hide">
            {[
              {
                key: "overview",
                label: "Overview",
                icon: Eye,
                showOnMobile: true,
              },
              {
                key: "jobs",
                label: "Jobs",
                icon: Briefcase,
                showOnMobile: true,
              },
              {
                key: "applications",
                label: "Apps",
                icon: Users,
                showOnMobile: true,
              },
              {
                key: "post-job",
                label: "Post Job",
                icon: Plus,
                highlight: true,
              },
            ].map(({ key, label, icon: Icon, highlight }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(
                    key as "overview" | "jobs" | "applications" | "post-job",
                  );
                  setShowFloatingButton(key !== "post-job");
                  if (key === "post-job") {
                    toast.success("Let's create a new job posting!", {
                      icon: "📝",
                      duration: 2000,
                    });
                    // Add a small delay to ensure the tab content has rendered
                    setTimeout(() => {
                      // Scroll to the form with offset for header
                      window.scrollTo({
                        top: postJobFormRef.current?.offsetTop
                          ? postJobFormRef.current.offsetTop - 100
                          : 0,
                        behavior: "smooth",
                      });
                      // Focus on the first input for better UX
                      const firstInput =
                        postJobFormRef.current?.querySelector("input");
                      firstInput?.focus();
                    }, 150);
                  }
                }}
                className={`py-4 px-2 md:px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                  activeTab === key
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">
                    {key === "jobs"
                      ? "Jobs"
                      : key === "applications"
                        ? "Apps"
                        : label}
                  </span>
                  {highlight && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded animate-pulse">
                      New
                    </span>
                  )}
                </div>
              </button>
            ))}
          </nav>

          {/* Mobile hint */}
          <div className="md:hidden text-xs text-neutral-500 text-center mt-2">
            <span className="inline-flex items-center gap-1">
              Swipe for more options
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-8"
            >
              {/* Recent Jobs */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="heading-3">Recent Job Postings</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("jobs")}
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {jobs.slice(0, 3).map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{job.title}</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {job.city}, {job.country}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}
                        >
                          {job.status.toLowerCase()}
                        </span>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          {job._count.applications} applications
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Applications */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="heading-3">Recent Applications</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("applications")}
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {applications.slice(0, 3).map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {app.teacher.firstName} {app.teacher.lastName}
                          </h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {app.job.title}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}
                      >
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "jobs" && (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Jobs Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input min-w-[120px]"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <Button
                  onClick={() => {
                    setActiveTab("post-job");
                    toast.success("Let's create a new job posting!", {
                      icon: "📝",
                      duration: 2000,
                    });
                    // Scroll is handled by useEffect when activeTab changes
                  }}
                  variant="gradient"
                  leftIcon={<Plus className="w-5 h-5" />}
                >
                  Post New Job
                </Button>
              </div>

              {/* Jobs List */}
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="heading-3">{job.title}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}
                          >
                            {job.status}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-4 gap-4 text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {job.city}, {job.country}
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            {job.salary}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {getTypeLabel(job.type)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Deadline:{" "}
                            {new Date(job.deadline).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                          {job.description.length > 150
                            ? `${job.description.substring(0, 150)}...`
                            : job.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-primary-600 dark:text-primary-400 font-medium">
                            {job._count.applications} applications
                          </span>
                          <span className="text-neutral-500">
                            Posted{" "}
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openJobModal(job)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        {job.status === "ACTIVE" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateJobStatus(job.id, "PAUSED")}
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateJobStatus(job.id, "ACTIVE")}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteJob(job.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "applications" && (
            <motion.div
              key="applications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Applications Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input min-w-[120px]"
                  >
                    <option value="all">All Status</option>
                    <option value="applied">Applied</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="interview">Interview</option>
                    <option value="hired">Hired</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
              </div>

              {/* Applications List */}
              <div className="space-y-4">
                {filteredApplications.map((app) => (
                  <div key={app.id} className="card p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">
                              {app.teacher.firstName} {app.teacher.lastName}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}
                            >
                              {app.status}
                            </span>
                            {app.teacher.verified && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                            Applied for:{" "}
                            <span className="font-medium">{app.job.title}</span>
                          </p>
                          <div className="grid md:grid-cols-3 gap-4 text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              {app.teacher.firstName.toLowerCase()}@email.com
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              {app.teacher.city}, {app.teacher.country}
                            </div>
                            <div className="flex items-center gap-2">
                              <Award className="w-3 h-3" />
                              {app.teacher.qualification}
                            </div>
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Experience: {app.teacher.experience}
                          </p>
                          {app.teacher.languages.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <Globe className="w-3 h-3 text-neutral-400" />
                              <span className="text-xs text-neutral-500">
                                Languages: {app.teacher.languages.join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={app.status}
                          onChange={(e) =>
                            updateApplicationStatus(app.id, e.target.value)
                          }
                          className="text-sm border border-neutral-300 dark:border-neutral-600 rounded px-2 py-1 bg-white dark:bg-neutral-800"
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="REVIEWING">Reviewing</option>
                          <option value="INTERVIEW">Interview</option>
                          <option value="HIRED">Hired</option>
                          <option value="DECLINED">Declined</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(app);
                            setShowApplicationModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "post-job" && (
            <motion.div
              key="post-job"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="max-w-4xl mx-auto" ref={postJobFormRef}>
                <motion.div
                  className="card p-8"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h2 className="heading-2">Post a New Teaching Position</h2>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                    Create a detailed job posting to attract qualified English
                    teachers to your school.
                  </p>

                  <form
                    onSubmit={(e) => handleJobSubmit(e, false)}
                    className="space-y-6"
                  >
                    {/* Basic Information */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Job Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={jobForm.title}
                          onChange={(e) =>
                            setJobForm({ ...jobForm, title: e.target.value })
                          }
                          className="input"
                          placeholder="e.g. Senior English Teacher - CELTA Required"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          City/Town *
                        </label>
                        <input
                          type="text"
                          required
                          value={jobForm.city}
                          onChange={(e) =>
                            setJobForm({ ...jobForm, city: e.target.value })
                          }
                          className="input"
                          placeholder="e.g. Almaty"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Country *
                        </label>
                        <input
                          type="text"
                          required
                          value={jobForm.country}
                          onChange={(e) =>
                            setJobForm({ ...jobForm, country: e.target.value })
                          }
                          className="input"
                          placeholder="e.g. Kazakhstan"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Job Description *
                      </label>
                      <textarea
                        required
                        rows={6}
                        value={jobForm.description}
                        onChange={(e) =>
                          setJobForm({
                            ...jobForm,
                            description: e.target.value,
                          })
                        }
                        className="input"
                        placeholder="Describe the position, responsibilities, and what makes your school special..."
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Salary Range *
                        </label>
                        <input
                          type="text"
                          required
                          value={jobForm.salary}
                          onChange={(e) =>
                            setJobForm({ ...jobForm, salary: e.target.value })
                          }
                          className="input"
                          placeholder="e.g. $2,800 - $3,500/month"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Employment Type *
                        </label>
                        <select
                          required
                          value={jobForm.type}
                          onChange={(e) =>
                            setJobForm({
                              ...jobForm,
                              type: e.target.value as JobFormData["type"],
                            })
                          }
                          className="input"
                        >
                          <option value="FULL_TIME">Full-time</option>
                          <option value="PART_TIME">Part-time</option>
                          <option value="CONTRACT">Contract</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Application Deadline *
                        </label>
                        <input
                          type="date"
                          required
                          value={jobForm.deadline}
                          onChange={(e) =>
                            setJobForm({ ...jobForm, deadline: e.target.value })
                          }
                          className="input"
                        />
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Requirements
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Required Qualification *
                          </label>
                          <input
                            type="text"
                            required
                            value={jobForm.qualification}
                            onChange={(e) =>
                              setJobForm({
                                ...jobForm,
                                qualification: e.target.value,
                              })
                            }
                            className="input"
                            placeholder="e.g. CELTA, TESOL, TEFL"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Experience Required *
                          </label>
                          <input
                            type="text"
                            required
                            value={jobForm.experience}
                            onChange={(e) =>
                              setJobForm({
                                ...jobForm,
                                experience: e.target.value,
                              })
                            }
                            className="input"
                            placeholder="e.g. 3+ years teaching experience"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mt-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Language Requirements
                          </label>
                          <input
                            type="text"
                            value={jobForm.language}
                            onChange={(e) =>
                              setJobForm({
                                ...jobForm,
                                language: e.target.value,
                              })
                            }
                            className="input"
                            placeholder="e.g. Native English speaker"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="block text-sm font-medium">
                            Additional Requirements
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={jobForm.visaRequired}
                                onChange={(e) =>
                                  setJobForm({
                                    ...jobForm,
                                    visaRequired: e.target.checked,
                                  })
                                }
                                className="mr-2"
                              />
                              Visa/Work permit required
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={jobForm.teachingLicenseRequired}
                                onChange={(e) =>
                                  setJobForm({
                                    ...jobForm,
                                    teachingLicenseRequired: e.target.checked,
                                  })
                                }
                                className="mr-2"
                              />
                              Teaching license required
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={jobForm.kazakhLanguageRequired}
                                onChange={(e) =>
                                  setJobForm({
                                    ...jobForm,
                                    kazakhLanguageRequired: e.target.checked,
                                  })
                                }
                                className="mr-2"
                              />
                              Local language knowledge
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={jobForm.localCertificationRequired}
                                onChange={(e) =>
                                  setJobForm({
                                    ...jobForm,
                                    localCertificationRequired:
                                      e.target.checked,
                                  })
                                }
                                className="mr-2"
                              />
                              Local certification required
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Additional Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Benefits & Perks
                          </label>
                          <textarea
                            rows={3}
                            value={jobForm.benefits}
                            onChange={(e) =>
                              setJobForm({
                                ...jobForm,
                                benefits: e.target.value,
                              })
                            }
                            className="input"
                            placeholder="e.g. Health insurance, housing allowance, professional development..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Additional Requirements
                          </label>
                          <textarea
                            rows={3}
                            value={jobForm.requirements}
                            onChange={(e) =>
                              setJobForm({
                                ...jobForm,
                                requirements: e.target.value,
                              })
                            }
                            className="input"
                            placeholder="Any other specific requirements or information..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* School Information */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        School Information
                      </label>
                      <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={jobForm.useSchoolProfile}
                            onChange={(e) =>
                              setJobForm({
                                ...jobForm,
                                useSchoolProfile: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                          />
                          <span className="text-sm">
                            Use school profile information
                          </span>
                        </label>

                        {!jobForm.useSchoolProfile && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <textarea
                              rows={4}
                              value={jobForm.schoolDescription}
                              onChange={(e) =>
                                setJobForm({
                                  ...jobForm,
                                  schoolDescription: e.target.value,
                                })
                              }
                              className="input"
                              placeholder="Provide a custom description about your school for this specific position..."
                            />
                            <p className="text-xs text-neutral-500 mt-1">
                              This will override your school profile description
                              for this job posting only
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-6 border-t">
                      <Button
                        type="submit"
                        variant="gradient"
                        size="lg"
                        disabled={submitting}
                        leftIcon={
                          submitting ? undefined : <Save className="w-5 h-5" />
                        }
                      >
                        {submitting
                          ? "Publishing..."
                          : selectedJob
                            ? "Update Job Posting"
                            : "Publish Job Posting"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="lg"
                        disabled={submitting}
                        onClick={(e) => {
                          e.preventDefault();
                          handleJobSubmit(e, true);
                        }}
                      >
                        Save as Draft
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="lg"
                        onClick={() => setActiveTab("jobs")}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job Modal */}
        {showJobModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {selectedJob ? "Edit Job Posting" : "Create New Job"}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowJobModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleJobSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobForm.title}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, title: e.target.value })
                    }
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Job Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={jobForm.description}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, description: e.target.value })
                    }
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      City/Town *
                    </label>
                    <input
                      type="text"
                      required
                      value={jobForm.city}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, city: e.target.value })
                      }
                      className="input"
                      placeholder="e.g. Almaty"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={jobForm.country}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, country: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Salary *
                    </label>
                    <input
                      type="text"
                      required
                      value={jobForm.salary}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, salary: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Type *
                    </label>
                    <select
                      required
                      value={jobForm.type}
                      onChange={(e) =>
                        setJobForm({
                          ...jobForm,
                          type: e.target.value as JobFormData["type"],
                        })
                      }
                      className="input"
                    >
                      <option value="FULL_TIME">Full-time</option>
                      <option value="PART_TIME">Part-time</option>
                      <option value="CONTRACT">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Deadline *
                    </label>
                    <input
                      type="date"
                      required
                      value={jobForm.deadline}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, deadline: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Button type="submit" disabled={submitting}>
                    {submitting
                      ? "Saving..."
                      : selectedJob
                        ? "Update Job"
                        : "Create Job"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowJobModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Application Detail Modal */}
        {showApplicationModal && selectedApplication && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Application Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApplicationModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {selectedApplication.teacher.firstName}{" "}
                      {selectedApplication.teacher.lastName}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Applied for: {selectedApplication.job.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status)}`}
                      >
                        {selectedApplication.status}
                      </span>
                      {selectedApplication.teacher.verified && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-neutral-400" />
                        {selectedApplication.teacher.firstName.toLowerCase()}
                        @email.com
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-neutral-400" />
                        {selectedApplication.teacher.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-neutral-400" />
                        {selectedApplication.teacher.city},{" "}
                        {selectedApplication.teacher.country}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Qualifications</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-neutral-400" />
                        {selectedApplication.teacher.qualification}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-neutral-400" />
                        {selectedApplication.teacher.experience}
                      </div>
                      {selectedApplication.teacher.languages.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-neutral-400" />
                          {selectedApplication.teacher.languages.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedApplication.teacher.bio && (
                  <div>
                    <h4 className="font-medium mb-2">About</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {selectedApplication.teacher.bio}
                    </p>
                  </div>
                )}

                {selectedApplication.coverLetter && (
                  <div>
                    <h4 className="font-medium mb-2">Cover Letter</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">
                      Update Status
                    </label>
                    <select
                      value={selectedApplication.status}
                      onChange={(e) =>
                        updateApplicationStatus(
                          selectedApplication.id,
                          e.target.value,
                        )
                      }
                      className="input"
                    >
                      <option value="APPLIED">Applied</option>
                      <option value="REVIEWING">Reviewing</option>
                      <option value="INTERVIEW">Interview</option>
                      <option value="HIRED">Hired</option>
                      <option value="DECLINED">Declined</option>
                    </select>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowApplicationModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Action Button for Mobile */}
        {showFloatingButton && (
          <motion.button
            className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => {
              setActiveTab("post-job");
              toast.success("Let's create a new job posting!", {
                icon: "📝",
                duration: 2000,
              });
              setTimeout(() => {
                window.scrollTo({
                  top: postJobFormRef.current?.offsetTop
                    ? postJobFormRef.current.offsetTop - 100
                    : 0,
                  behavior: "smooth",
                });
                const firstInput =
                  postJobFormRef.current?.querySelector("input");
                firstInput?.focus();
              }, 150);
            }}
          >
            <Plus className="w-7 h-7" />
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default SchoolDashboard;
