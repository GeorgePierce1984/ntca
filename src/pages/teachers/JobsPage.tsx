import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Filter,
  ChevronDown,
  ChevronUp,
  Building2,
  Clock,
  Users,
  Globe,
  Briefcase,
  Heart,
  HeartOff,
  Send,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { countries, CENTRAL_ASIA_COUNTRIES } from "@/data/countries";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

interface School {
  id: string;
  name: string;
  city: string;
  country: string;
  logoUrl?: string;
  verified: boolean;
  description?: string;
}

interface Job {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  location: string;
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
  updatedAt: string;
  school: School;
  _count: {
    applications: number;
  };
  hasApplied: boolean;
  applicationStatus?: string;
  applicationDate?: string;
}

interface SavedJob {
  id: string;
  jobId: string;
  createdAt: string;
}

const qualifications = [
  "Teaching Certificate",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "CELTA",
  "DELTA",
  "TESOL",
  "TEFL",
];

const experienceLevels = [
  "Entry Level (0-2 years)",
  "Mid Level (3-5 years)",
  "Senior Level (6-10 years)",
  "Expert Level (10+ years)",
];

const sortOptions = [
  { value: "latest", label: "Latest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "deadline", label: "Application Deadline" },
  { value: "salary_high", label: "Salary: High to Low" },
  { value: "salary_low", label: "Salary: Low to High" },
];

export const TeacherJobsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get initial values from URL params
  const initialSearch = searchParams.get("search") || "";
  const initialLocation = searchParams.get("location") || "";

  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);
  const [country, setCountry] = useState("");
  const [jobType, setJobType] = useState("");
  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState("");
  const [visaRequired, setVisaRequired] = useState<string>("");
  const [sortBy, setSortBy] = useState("latest");
  const [showFilters, setShowFilters] = useState(false);

  // UI State
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [applying, setApplying] = useState(false);
  const [savingJob, setSavingJob] = useState<string | null>(null);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedLocation = useDebounce(location, 500);

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        sort: sortBy,
      });

      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      if (debouncedLocation) params.append("location", debouncedLocation);
      if (country) params.append("location", country);
      if (jobType) params.append("type", jobType);
      if (qualification) params.append("qualification", qualification);
      if (visaRequired) params.append("visa_required", visaRequired);

      const response = await fetch(`/api/teachers/jobs?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch jobs");

      const data = await response.json();
      setJobs(data.jobs);
      setTotalJobs(data.pagination.totalJobs);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [
    user,
    currentPage,
    sortBy,
    debouncedSearchTerm,
    debouncedLocation,
    country,
    jobType,
    qualification,
    visaRequired,
  ]);

  // Fetch saved jobs
  const fetchSavedJobs = async () => {
    if (!user) return;

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

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
  }, [fetchJobs]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (location) params.set("location", location);
    setSearchParams(params);
  }, [searchTerm, location, setSearchParams]);

  // Save/unsave job
  const toggleSaveJob = async (jobId: string) => {
    if (!user) {
      toast.error("Please sign in to save jobs");
      navigate("/signin");
      return;
    }

    setSavingJob(jobId);
    const isSaved = savedJobs.some((sj) => sj.jobId === jobId);

    try {
      const response = await fetch(`/api/teachers/saved-jobs/${jobId}`, {
        method: isSaved ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to save job");

      if (isSaved) {
        setSavedJobs(savedJobs.filter((sj) => sj.jobId !== jobId));
        toast.success("Job removed from saved jobs");
      } else {
        const data = await response.json();
        setSavedJobs([...savedJobs, data.savedJob]);
        toast.success("Job saved successfully");
      }
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error("Failed to save job");
    } finally {
      setSavingJob(null);
    }
  };

  // Apply for job
  const applyForJob = async (job: Job) => {
    if (!user) {
      toast.error("Please sign in to apply");
      navigate("/signin");
      return;
    }

    if (job.hasApplied) {
      toast("You have already applied for this job");
      return;
    }

    setApplying(true);
    try {
      const response = await fetch("/api/teachers/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          jobId: job.id,
          coverLetter: "I am interested in this position.", // In a real app, this would be a form
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to apply");
      }

      toast.success("Application submitted successfully!");
      setShowJobDetails(false);
      fetchJobs(); // Refresh to update application status
    } catch (error) {
      console.error("Error applying for job:", error);
      toast.error(error instanceof Error ? error.message : "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setLocation("");
    setCountry("");
    setJobType("");
    setQualification("");
    setExperience("");
    setVisaRequired("");
    setSortBy("latest");
    setCurrentPage(1);
  };

  const isJobSaved = (jobId: string) => {
    return savedJobs.some((sj) => sj.jobId === jobId);
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "PART_TIME":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "CONTRACT":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const formatJobType = (type: string) => {
    return type
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800">
      <div className="container-custom py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="heading-1 mb-4"
          >
            Find Your Dream Teaching Position
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-neutral-600 dark:text-neutral-400"
          >
            {totalJobs} teaching opportunities across Central Asia
          </motion.p>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          {/* Main Search */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input"
            >
              <option value="">All Countries</option>
              <optgroup label="Central Asia">
                {CENTRAL_ASIA_COUNTRIES.map((c: string) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other">
                {countries
                  .filter((c) => !CENTRAL_ASIA_COUNTRIES.includes(c.name))
                  .map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
            </select>

            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="secondary"
              className="w-full"
              leftIcon={<Filter className="w-5 h-5" />}
              rightIcon={
                showFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )
              }
            >
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
          </div>

          {/* Extended Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="input"
                  >
                    <option value="">All Job Types</option>
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                  </select>

                  <select
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="input"
                  >
                    <option value="">All Qualifications</option>
                    {qualifications.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>

                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="input"
                  >
                    <option value="">All Experience Levels</option>
                    {experienceLevels.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>

                  <select
                    value={visaRequired}
                    onChange={(e) => setVisaRequired(e.target.value)}
                    className="input"
                  >
                    <option value="">Visa Requirement</option>
                    <option value="false">No Visa Required</option>
                    <option value="true">Visa Required</option>
                  </select>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <Button onClick={resetFilters} variant="ghost" size="sm">
                    Reset Filters
                  </Button>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input w-auto"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <AlertCircle className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              No jobs found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Try adjusting your filters or search criteria
            </p>
            <Button onClick={resetFilters} variant="primary" className="mt-4">
              Reset Filters
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-xl p-6 hover:shadow-xl transition-all duration-300"
                >
                  {/* Job Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <Building2 className="w-4 h-4" />
                        <span>{job.school.name}</span>
                        {job.school.verified && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSaveJob(job.id)}
                      disabled={savingJob === job.id}
                      className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      {savingJob === job.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                      ) : isJobSaved(job.id) ? (
                        <Heart className="w-5 h-5 text-red-500 fill-current" />
                      ) : (
                        <HeartOff className="w-5 h-5 text-neutral-400" />
                      )}
                    </button>
                  </div>

                  {/* Location and Type */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getJobTypeColor(job.type),
                      )}
                    >
                      {formatJobType(job.type)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Key Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {job.salary}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-700 dark:text-neutral-300">
                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {job._count.applications} applicants
                      </span>
                    </div>
                  </div>

                  {/* Requirements Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.visaRequired && (
                      <span className="badge badge-secondary text-xs">
                        Visa Required
                      </span>
                    )}
                    {job.teachingLicenseRequired && (
                      <span className="badge badge-secondary text-xs">
                        Teaching License
                      </span>
                    )}
                    {job.kazakhLanguageRequired && (
                      <span className="badge badge-secondary text-xs">
                        Kazakh Required
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedJob(job);
                        setShowJobDetails(true);
                      }}
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    {job.hasApplied ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        className="flex-1"
                      >
                        Applied
                      </Button>
                    ) : (
                      <Button
                        onClick={() => applyForJob(job)}
                        variant="gradient"
                        size="sm"
                        className="flex-1"
                        disabled={applying}
                      >
                        {applying ? "Applying..." : "Quick Apply"}
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="ghost"
                  size="sm"
                >
                  Previous
                </Button>

                <div className="flex gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "w-10 h-10 rounded-lg font-medium transition-colors",
                          currentPage === pageNum
                            ? "bg-primary-600 text-white"
                            : "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="px-2">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={cn(
                          "w-10 h-10 rounded-lg font-medium transition-colors",
                          currentPage === totalPages
                            ? "bg-primary-600 text-white"
                            : "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                        )}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <Button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="ghost"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Job Details Modal */}
        <AnimatePresence>
          {showJobDetails && selectedJob && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowJobDetails(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                      {selectedJob.title}
                    </h2>
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                      <Building2 className="w-5 h-5" />
                      <span>{selectedJob.school.name}</span>
                      {selectedJob.school.verified && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowJobDetails(false)}
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Key Information */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass rounded-lg p-4">
                      <MapPin className="w-5 h-5 text-primary-600 mb-2" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Location
                      </p>
                      <p className="font-medium">{selectedJob.location}</p>
                    </div>
                    <div className="glass rounded-lg p-4">
                      <DollarSign className="w-5 h-5 text-primary-600 mb-2" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Salary
                      </p>
                      <p className="font-medium">{selectedJob.salary}</p>
                    </div>
                    <div className="glass rounded-lg p-4">
                      <Briefcase className="w-5 h-5 text-primary-600 mb-2" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Type
                      </p>
                      <p className="font-medium">
                        {formatJobType(selectedJob.type)}
                      </p>
                    </div>
                    <div className="glass rounded-lg p-4">
                      <Calendar className="w-5 h-5 text-primary-600 mb-2" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Deadline
                      </p>
                      <p className="font-medium">
                        {new Date(selectedJob.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Description</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                      {selectedJob.description}
                    </p>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                    <div className="space-y-2">
                      <p className="text-neutral-600 dark:text-neutral-400">
                        <strong>Qualification:</strong>{" "}
                        {selectedJob.qualification}
                      </p>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        <strong>Experience:</strong> {selectedJob.experience}
                      </p>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        <strong>Language:</strong> {selectedJob.language}
                      </p>
                      {selectedJob.requirements && (
                        <p className="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                          {selectedJob.requirements}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Benefits */}
                  {selectedJob.benefits && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Benefits</h3>
                      <p className="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                        {selectedJob.benefits}
                      </p>
                    </div>
                  )}

                  {/* Special Requirements */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Additional Requirements
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.visaRequired && (
                        <span className="badge badge-secondary">
                          <Globe className="w-4 h-4 mr-1" />
                          Visa Required
                        </span>
                      )}
                      {selectedJob.teachingLicenseRequired && (
                        <span className="badge badge-secondary">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Teaching License Required
                        </span>
                      )}
                      {selectedJob.kazakhLanguageRequired && (
                        <span className="badge badge-secondary">
                          <Globe className="w-4 h-4 mr-1" />
                          Kazakh Language Required
                        </span>
                      )}
                      {selectedJob.localCertificationRequired && (
                        <span className="badge badge-secondary">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Local Certification Required
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                    <Button
                      onClick={() => toggleSaveJob(selectedJob.id)}
                      variant="secondary"
                      leftIcon={
                        isJobSaved(selectedJob.id) ? (
                          <Heart className="w-5 h-5 fill-current" />
                        ) : (
                          <HeartOff className="w-5 h-5" />
                        )
                      }
                      disabled={savingJob === selectedJob.id}
                    >
                      {savingJob === selectedJob.id
                        ? "Saving..."
                        : isJobSaved(selectedJob.id)
                          ? "Saved"
                          : "Save Job"}
                    </Button>
                    {selectedJob.hasApplied ? (
                      <Button variant="ghost" disabled className="flex-1">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Already Applied
                      </Button>
                    ) : (
                      <Button
                        onClick={() => applyForJob(selectedJob)}
                        variant="gradient"
                        className="flex-1"
                        leftIcon={<Send className="w-5 h-5" />}
                        disabled={applying}
                      >
                        {applying ? "Applying..." : "Apply Now"}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
