import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import FileUpload from "@/components/ui/FileUpload";
import {
  User,
  Briefcase,
  Search,
  Filter,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Star,
  Eye,
  Heart,
  Send,
  Upload,
  Edit3,
  Save,
  X,
  Plus,
  Award,
  Globe,
  Phone,
  Mail,
  Building,
  GraduationCap,
  Languages,
  Shield,
  FileText,
  CheckCircle,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
  ArrowRight,
  Loader,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  phoneCountryCode: string;
  city: string;
  state?: string;
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
  languageSkills: Record<string, string>;
  currentLocation?: string;
  willingToRelocate: boolean;
  preferredLocations: string[];
  visaStatus?: string;
  workAuthorization: string[];
  availability?: string;
  startDate?: string;
  education: any[];
  specializations: string[];
  previousSchools: string[];
  achievements: string[];
  nationality?: string;
  profileComplete: boolean;
  profileViews: number;
  salaryExpectation?: string;
  jobTypePreference: string[];
  workEnvironmentPreference: string[];
  technicalSkills: string[];
  softSkills: string[];
  searchable: boolean;
  applications: Application[];
  savedJobs: SavedJob[];
}

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT";
  status: string;
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
  hasApplied: boolean;
  applicationStatus?: string;
  applicationDate?: string;
  school: {
    id: string;
    name: string;
    city: string;
    country: string;
    logoUrl?: string;
    verified: boolean;
    description?: string;
  };
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
  createdAt: string;
  job: {
    id: string;
    title: string;
    location: string;
    salary: string;
    deadline: string;
    school: {
      name: string;
      city: string;
      country: string;
    };
  };
}

interface SavedJob {
  id: string;
  createdAt: string;
  job: Job;
}

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "profile" | "jobs" | "applications" | "saved"
  >("overview");

  // Job search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [showFilters, setShowFilters] = useState(false);

  // Profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<Teacher>>({});
  const [submitting, setSubmitting] = useState(false);

  // Job application
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: "",
    resumeUrl: "",
    portfolioUrl: "",
  });
  const [applying, setApplying] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTeacherProfile();
    fetchJobs();
    fetchSavedJobs();
  }, []);

  useEffect(() => {
    if (activeTab === "jobs") {
      fetchJobs();
    }
  }, [searchTerm, locationFilter, typeFilter, sortBy, currentPage]);

  const fetchTeacherProfile = async () => {
    try {
      const response = await fetch("/api/teachers/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeacher(data.teacher);
        setProfileForm(data.teacher);
      }
    } catch (error) {
      console.error("Error fetching teacher profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        sort: sortBy,
      });

      if (searchTerm) params.append("search", searchTerm);
      if (locationFilter) params.append("location", locationFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);

      const response = await fetch(`/api/teachers/jobs?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await fetch("/api/teachers/saved-jobs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSavedJobs(data.savedJobs);
      }
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    }
  };

  const updateProfile = async () => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/teachers/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        const data = await response.json();
        setTeacher(data.teacher);
        setIsEditingProfile(false);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating your profile");
    } finally {
      setSubmitting(false);
    }
  };

  const applyForJob = async () => {
    if (!selectedJob) return;

    setApplying(true);
    try {
      const response = await fetch("/api/teachers/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          jobId: selectedJob.id,
          ...applicationForm,
        }),
      });

      if (response.ok) {
        setShowApplicationModal(false);
        setApplicationForm({
          coverLetter: "",
          resumeUrl: "",
          portfolioUrl: "",
        });
        fetchJobs(); // Refresh to update application status
        fetchTeacherProfile(); // Refresh to update applications count
        alert("Application submitted successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error applying for job:", error);
      alert("An error occurred while submitting your application");
    } finally {
      setApplying(false);
    }
  };

  const toggleSaveJob = async (job: Job) => {
    try {
      const isSaved = savedJobs.some((savedJob) => savedJob.job.id === job.id);

      if (isSaved) {
        // Remove from saved jobs
        const response = await fetch("/api/teachers/saved-jobs", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ jobId: job.id }),
        });

        if (response.ok) {
          setSavedJobs(
            savedJobs.filter((savedJob) => savedJob.job.id !== job.id),
          );
        }
      } else {
        // Add to saved jobs
        const response = await fetch("/api/teachers/saved-jobs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ jobId: job.id }),
        });

        if (response.ok) {
          const data = await response.json();
          setSavedJobs([data.savedJob, ...savedJobs]);
        }
      }
    } catch (error) {
      console.error("Error toggling saved job:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const isJobSaved = (jobId: string) => {
    return savedJobs.some((savedJob) => savedJob.job.id === jobId);
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
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Please complete your teacher registration.
          </p>
        </div>
      </div>
    );
  }

  const stats = {
    totalApplications: teacher.applications?.length || 0,
    pendingApplications:
      teacher.applications?.filter((app) => app.status === "APPLIED").length ||
      0,
    savedJobsCount: savedJobs.length,
    profileViews: teacher.profileViews || 0,
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20">
      <div className="container-custom max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-1 mb-2">Teacher Dashboard</h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Welcome back, {teacher.firstName}!
              </p>
            </div>
            <div className="flex items-center gap-4">
              {!teacher.profileComplete && (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-4 py-2 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">
                    Complete your profile to get more job matches
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Send className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {stats.pendingApplications} Pending
              </span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {stats.totalApplications}
            </div>
            <div className="text-sm text-neutral-500">Applications Sent</div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                <Heart className="w-6 h-6" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">
              {stats.savedJobsCount}
            </div>
            <div className="text-sm text-neutral-500">Saved Jobs</div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <Eye className="w-6 h-6" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{stats.profileViews}</div>
            <div className="text-sm text-neutral-500">Profile Views</div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <Star className="w-6 h-6" />
              </div>
              {teacher.verified && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
            <div className="text-2xl font-bold mb-1">
              {teacher.rating || "—"}
            </div>
            <div className="text-sm text-neutral-500">Rating</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-neutral-200 dark:border-neutral-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: "overview", label: "Overview", icon: Eye },
              { key: "profile", label: "Profile", icon: User },
              { key: "jobs", label: "Browse Jobs", icon: Search },
              { key: "applications", label: "My Applications", icon: Send },
              { key: "saved", label: "Saved Jobs", icon: Heart },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {label}
                </div>
              </button>
            ))}
          </nav>
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
              {/* Profile Summary */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="heading-3">Profile Summary</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("profile")}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      {teacher.photoUrl ? (
                        <img
                          src={teacher.photoUrl}
                          alt="Profile"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {teacher.firstName} {teacher.lastName}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {teacher.qualification}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {teacher.city}, {teacher.country}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">
                        Profile Completeness
                      </span>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {teacher.profileComplete ? "100%" : "70%"}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: teacher.profileComplete ? "100%" : "70%",
                        }}
                      ></div>
                    </div>
                  </div>

                  {teacher.certifications.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Certifications</h5>
                      <div className="flex flex-wrap gap-2">
                        {teacher.certifications
                          .slice(0, 3)
                          .map((cert, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-xs"
                            >
                              {cert}
                            </span>
                          ))}
                        {teacher.certifications.length > 3 && (
                          <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full text-xs">
                            +{teacher.certifications.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
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
                  {teacher.applications?.slice(0, 3).map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{app.job.title}</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {app.job.school.name}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {app.job.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}
                        >
                          {app.status}
                        </span>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!teacher.applications ||
                    teacher.applications.length === 0) && (
                    <div className="text-center py-8">
                      <Send className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                      <p className="text-neutral-600 dark:text-neutral-400">
                        No applications yet
                      </p>
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => setActiveTab("jobs")}
                      >
                        Browse Jobs
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="max-w-4xl mx-auto">
                <div className="card p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="heading-2">Teacher Profile</h2>
                    <div className="flex items-center gap-4">
                      {isEditingProfile ? (
                        <>
                          <Button
                            onClick={updateProfile}
                            disabled={submitting}
                            leftIcon={
                              submitting ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )
                            }
                          >
                            {submitting ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setIsEditingProfile(false);
                              setProfileForm(teacher);
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setIsEditingProfile(true)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Basic Information
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            First Name *
                          </label>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={profileForm.firstName || ""}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  firstName: e.target.value,
                                })
                              }
                              className="input"
                            />
                          ) : (
                            <p className="py-2">{teacher.firstName}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Last Name *
                          </label>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={profileForm.lastName || ""}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  lastName: e.target.value,
                                })
                              }
                              className="input"
                            />
                          ) : (
                            <p className="py-2">{teacher.lastName}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Phone Number *
                          </label>
                          {isEditingProfile ? (
                            <input
                              type="tel"
                              value={profileForm.phone || ""}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  phone: e.target.value,
                                })
                              }
                              className="input"
                            />
                          ) : (
                            <p className="py-2">{teacher.phone}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Current Location *
                          </label>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={profileForm.city || ""}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  city: e.target.value,
                                })
                              }
                              className="input"
                              placeholder="City"
                            />
                          ) : (
                            <p className="py-2">
                              {teacher.city}, {teacher.country}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="border-t pt-8">
                      <h3 className="text-lg font-semibold mb-4">
                        Professional Information
                      </h3>
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Primary Qualification *
                            </label>
                            {isEditingProfile ? (
                              <input
                                type="text"
                                value={profileForm.qualification || ""}
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    qualification: e.target.value,
                                  })
                                }
                                className="input"
                                placeholder="e.g. CELTA, TESOL, TEFL"
                              />
                            ) : (
                              <p className="py-2">{teacher.qualification}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Years of Experience
                            </label>
                            {isEditingProfile ? (
                              <input
                                type="number"
                                value={profileForm.experienceYears || ""}
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    experienceYears: parseInt(e.target.value),
                                  })
                                }
                                className="input"
                                min="0"
                                max="50"
                              />
                            ) : (
                              <p className="py-2">
                                {teacher.experienceYears || "Not specified"}{" "}
                                years
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Teaching Experience Description *
                          </label>
                          {isEditingProfile ? (
                            <textarea
                              rows={3}
                              value={profileForm.experience || ""}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  experience: e.target.value,
                                })
                              }
                              className="input"
                              placeholder="Describe your teaching experience..."
                            />
                          ) : (
                            <p className="py-2">{teacher.experience}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Professional Bio
                          </label>
                          {isEditingProfile ? (
                            <textarea
                              rows={4}
                              value={profileForm.bio || ""}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  bio: e.target.value,
                                })
                              }
                              className="input"
                              placeholder="Tell schools about yourself, your teaching philosophy, and what makes you unique..."
                            />
                          ) : (
                            <p className="py-2">
                              {teacher.bio || "No bio provided"}
                            </p>
                          )}
                        </div>

                        {/* File Uploads Section */}
                        <div className="border-t pt-8">
                          <h4 className="text-lg font-semibold mb-6">
                            Documents & Media
                          </h4>
                          <div className="grid md:grid-cols-2 gap-8">
                            <div>
                              <FileUpload
                                type="resume"
                                currentUrl={teacher.resumeUrl}
                                onUploadSuccess={(url) => {
                                  setProfileForm({
                                    ...profileForm,
                                    resumeUrl: url,
                                  });
                                  if (!isEditingProfile) {
                                    // Auto-save if not in edit mode
                                    setTeacher({ ...teacher, resumeUrl: url });
                                  }
                                }}
                                onUploadError={(error) => {
                                  alert(`Upload failed: ${error}`);
                                }}
                              />
                            </div>
                            <div>
                              <FileUpload
                                type="photo"
                                currentUrl={teacher.photoUrl}
                                onUploadSuccess={(url) => {
                                  setProfileForm({
                                    ...profileForm,
                                    photoUrl: url,
                                  });
                                  if (!isEditingProfile) {
                                    // Auto-save if not in edit mode
                                    setTeacher({ ...teacher, photoUrl: url });
                                  }
                                }}
                                onUploadError={(error) => {
                                  alert(`Upload failed: ${error}`);
                                }}
                              />
                            </div>
                          </div>
                          <div className="mt-6">
                            <FileUpload
                              type="portfolio"
                              currentUrl={teacher.portfolioUrl}
                              onUploadSuccess={(url) => {
                                setProfileForm({
                                  ...profileForm,
                                  portfolioUrl: url,
                                });
                                if (!isEditingProfile) {
                                  // Auto-save if not in edit mode
                                  setTeacher({ ...teacher, portfolioUrl: url });
                                }
                              }}
                              onUploadError={(error) => {
                                alert(`Upload failed: ${error}`);
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Certifications
                          </label>
                          {isEditingProfile ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={
                                  profileForm.certifications?.join(", ") || ""
                                }
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    certifications: e.target.value
                                      .split(",")
                                      .map((cert) => cert.trim())
                                      .filter((cert) => cert),
                                  })
                                }
                                className="input"
                                placeholder="CELTA, TESOL, TEFL (comma separated)"
                              />
                            </div>
                          ) : (
                            <div className="py-2">
                              {teacher.certifications.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {teacher.certifications.map((cert, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm"
                                    >
                                      {cert}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                "No certifications listed"
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Subjects You Can Teach
                          </label>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={profileForm.subjects?.join(", ") || ""}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  subjects: e.target.value
                                    .split(",")
                                    .map((subject) => subject.trim())
                                    .filter((subject) => subject),
                                })
                              }
                              className="input"
                              placeholder="English, Literature, Business English (comma separated)"
                            />
                          ) : (
                            <div className="py-2">
                              {teacher.subjects.length > 0
                                ? teacher.subjects.join(", ")
                                : "No subjects specified"}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Preferred Age Groups
                          </label>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={profileForm.ageGroups?.join(", ") || ""}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  ageGroups: e.target.value
                                    .split(",")
                                    .map((age) => age.trim())
                                    .filter((age) => age),
                                })
                              }
                              className="input"
                              placeholder="Kids, Teens, Adults (comma separated)"
                            />
                          ) : (
                            <div className="py-2">
                              {teacher.ageGroups.length > 0
                                ? teacher.ageGroups.join(", ")
                                : "No preferences specified"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Language Skills */}
                    <div className="border-t pt-8">
                      <h3 className="text-lg font-semibold mb-4">
                        Language Skills
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Native Language
                          </label>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={profileForm.nativeLanguage || ""}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  nativeLanguage: e.target.value,
                                })
                              }
                              className="input"
                              placeholder="e.g. English"
                            />
                          ) : (
                            <p className="py-2">
                              {teacher.nativeLanguage || "Not specified"}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Teaching Languages
                          </label>
                          <p className="py-2 text-sm text-neutral-600 dark:text-neutral-400">
                            Languages you can teach in
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Preferences */}
                    <div className="border-t pt-8">
                      <h3 className="text-lg font-semibold mb-4">
                        Job Preferences
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Salary Expectation
                          </label>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={profileForm.salaryExpectation || ""}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  salaryExpectation: e.target.value,
                                })
                              }
                              className="input"
                              placeholder="e.g. $2,500 - $3,500/month"
                            />
                          ) : (
                            <p className="py-2">
                              {teacher.salaryExpectation || "Not specified"}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Availability
                          </label>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={profileForm.availability || ""}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  availability: e.target.value,
                                })
                              }
                              className="input"
                              placeholder="e.g. Available immediately"
                            />
                          ) : (
                            <p className="py-2">
                              {teacher.availability || "Not specified"}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-medium mb-2">
                          Willing to Relocate
                        </label>
                        {isEditingProfile ? (
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={profileForm.willingToRelocate || false}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  willingToRelocate: e.target.checked,
                                })
                              }
                              className="mr-2"
                            />
                            Yes, I am willing to relocate for the right
                            opportunity
                          </label>
                        ) : (
                          <p className="py-2">
                            {teacher.willingToRelocate ? "Yes" : "No"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
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
              {/* Jobs Header with Search and Filters */}
              <div className="mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-1 gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:min-w-[300px]">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search jobs by title, school, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10 w-full"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setShowFilters(!showFilters)}
                      leftIcon={<FilterIcon className="w-4 h-4" />}
                    >
                      Filters
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="input min-w-[120px]"
                    >
                      <option value="latest">Latest</option>
                      <option value="oldest">Oldest</option>
                      <option value="salary_high">Salary: High to Low</option>
                      <option value="salary_low">Salary: Low to High</option>
                      <option value="deadline">Deadline</option>
                    </select>
                  </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                  <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={locationFilter}
                          onChange={(e) => setLocationFilter(e.target.value)}
                          className="input"
                          placeholder="City or country"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Job Type
                        </label>
                        <select
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                          className="input"
                        >
                          <option value="all">All Types</option>
                          <option value="FULL_TIME">Full-time</option>
                          <option value="PART_TIME">Part-time</option>
                          <option value="CONTRACT">Contract</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setLocationFilter("");
                            setTypeFilter("all");
                            setSearchTerm("");
                          }}
                          className="w-full"
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Jobs Grid */}
              {jobsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="card p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-1">
                            <Building className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                              {job.school.name}
                            </span>
                            {job.school.verified && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                              {job.location}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSaveJob(job)}
                          className={
                            isJobSaved(job.id)
                              ? "text-red-500"
                              : "text-neutral-400"
                          }
                        >
                          {isJobSaved(job.id) ? (
                            <BookmarkCheck className="w-4 h-4" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-neutral-400" />
                          <span>{job.salary}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-neutral-400" />
                          <span>{getTypeLabel(job.type)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-neutral-400" />
                          <span>
                            Deadline:{" "}
                            {new Date(job.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-xs">
                          {job.qualification}
                        </span>
                        {job.visaRequired && (
                          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-xs">
                            Visa Required
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                        {job.description.length > 100
                          ? `${job.description.substring(0, 100)}...`
                          : job.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-neutral-500">
                          {job._count.applications} applications
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          {job.hasApplied ? (
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.applicationStatus || "")}`}
                            >
                              {job.applicationStatus}
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedJob(job);
                                setShowApplicationModal(true);
                              }}
                            >
                              Apply
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "applications" && (
            <motion.div
              key="applications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="space-y-6">
                {teacher.applications && teacher.applications.length > 0 ? (
                  teacher.applications.map((app) => (
                    <div key={app.id} className="card p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">
                            {app.job.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-1">
                            <Building className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                              {app.job.school.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                              {app.job.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                              {app.job.salary}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}
                          >
                            {app.status}
                          </span>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                            Applied{" "}
                            {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Deadline:{" "}
                            {new Date(app.job.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {app.coverLetter && (
                        <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                          <h4 className="font-medium mb-2">Cover Letter</h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {app.coverLetter.length > 200
                              ? `${app.coverLetter.substring(0, 200)}...`
                              : app.coverLetter}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Send className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No Applications Yet
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                      Start applying to jobs that match your qualifications
                    </p>
                    <Button onClick={() => setActiveTab("jobs")}>
                      Browse Jobs
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "saved" && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="space-y-6">
                {savedJobs.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedJobs.map((savedJob) => (
                      <div key={savedJob.id} className="card p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">
                              {savedJob.job.title}
                            </h3>
                            <div className="flex items-center gap-2 mb-1">
                              <Building className="w-4 h-4 text-neutral-400" />
                              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                {savedJob.job.school.name}
                              </span>
                              {savedJob.job.school.verified && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="w-4 h-4 text-neutral-400" />
                              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                {savedJob.job.location}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSaveJob(savedJob.job)}
                            className="text-red-500"
                          >
                            <BookmarkCheck className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-neutral-400" />
                            <span>{savedJob.job.salary}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-neutral-400" />
                            <span>{getTypeLabel(savedJob.job.type)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-neutral-400" />
                            <span>
                              Deadline:{" "}
                              {new Date(
                                savedJob.job.deadline,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="text-sm text-neutral-500">
                            Saved{" "}
                            {new Date(savedJob.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            {savedJob.job.hasApplied ? (
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(savedJob.job.applicationStatus || "")}`}
                              >
                                {savedJob.job.applicationStatus}
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedJob(savedJob.job);
                                  setShowApplicationModal(true);
                                }}
                              >
                                Apply
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Saved Jobs</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                      Save jobs you're interested in to apply later
                    </p>
                    <Button onClick={() => setActiveTab("jobs")}>
                      Browse Jobs
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Application Modal */}
        {showApplicationModal && selectedJob && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Apply for Position</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApplicationModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-lg">{selectedJob.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {selectedJob.school.name}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {selectedJob.location}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {selectedJob.salary}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cover Letter *
                  </label>
                  <textarea
                    rows={6}
                    value={applicationForm.coverLetter}
                    onChange={(e) =>
                      setApplicationForm({
                        ...applicationForm,
                        coverLetter: e.target.value,
                      })
                    }
                    className="input"
                    placeholder="Tell the school why you're perfect for this position..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Resume URL
                  </label>
                  <input
                    type="url"
                    value={applicationForm.resumeUrl || teacher.resumeUrl || ""}
                    onChange={(e) =>
                      setApplicationForm({
                        ...applicationForm,
                        resumeUrl: e.target.value,
                      })
                    }
                    className="input"
                    placeholder="https://..."
                  />
                  <p className="text-sm text-neutral-500 mt-1">
                    {teacher.resumeUrl
                      ? "Using your profile resume by default"
                      : "Add a resume URL if available"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Portfolio URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={
                      applicationForm.portfolioUrl || teacher.portfolioUrl || ""
                    }
                    onChange={(e) =>
                      setApplicationForm({
                        ...applicationForm,
                        portfolioUrl: e.target.value,
                      })
                    }
                    className="input"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t mt-6">
                <Button
                  onClick={applyForJob}
                  disabled={applying || !applicationForm.coverLetter.trim()}
                  leftIcon={
                    applying ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )
                  }
                >
                  {applying ? "Submitting..." : "Submit Application"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowApplicationModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
