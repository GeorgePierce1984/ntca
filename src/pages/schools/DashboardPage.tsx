import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Briefcase,
  Users,
  Eye,
  Edit3,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  Phone,
  Mail,
  FileText,
  Filter,
  Search,
  MoreVertical,
  Globe,
  Award,
  BookOpen,
  Building,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

import { ApplicantModal } from "@/components/schools/ApplicantModal";
import {
  InterviewScheduleModal,
  InterviewData,
} from "@/components/schools/InterviewScheduleModal";
import toast from "react-hot-toast";

// Types
interface JobPosting {
  id: string;
  title: string;
  location: string;
  salary: string;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT";
  status: "ACTIVE" | "PAUSED" | "CLOSED";
  deadline: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  qualification: string;
  experience: string;
  language: string;
  visaRequired: boolean;
  teachingLicenseRequired: boolean;
  kazakhLanguageRequired: boolean;
  localCertificationRequired: boolean;
  benefits?: string;
  requirements?: string;
  useSchoolProfile: boolean;
  schoolDescription?: string;
  school: {
    id: string;
    name: string;
    city: string;
    country: string;
    verified: boolean;
    description?: string;
    logoUrl?: string;
  };
  _count: {
    applications: number;
  };
}

interface Application {
  id: string;
  jobId: string;
  teacherId: string | null;
  status: "APPLIED" | "REVIEWING" | "INTERVIEW" | "DECLINED" | "HIRED";
  coverLetter?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  interviewDate?: string;
  interviewNotes?: string;
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  // Guest application fields
  guestFirstName?: string;
  guestLastName?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestCity?: string;
  guestCountry?: string;
  job: {
    id: string;
    title: string;
  };
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    qualification: string;
    experience: string;
    city: string;
    country: string;
    bio?: string;
    photoUrl?: string;
  } | null;
}

export const SchoolDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "jobs" | "applicants" | "post-job"
  >("overview");
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(
    null,
  );
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApplicantForInterview, setSelectedApplicantForInterview] =
    useState<Application | null>(null);

  // Add ref for post job form
  const postJobFormRef = useRef<HTMLDivElement>(null);

  // Add job form state
  const [jobForm, setJobForm] = useState({
    title: "",
    location: "",
    employmentType: "",
    salary: "",
    deadline: "",
    description: "",
    qualifications: "",
    benefits: "",
    useSchoolProfile: true,
    schoolDescription: "",
    teachingLicenseRequired: false,
    kazakhLanguageRequired: false,
    localCertificationRequired: false,
  });

  // Real data state
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Add job modal state
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJobForEdit, setSelectedJobForEdit] = useState<JobPosting | null>(null);

  // Calculate stats from real data
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((job) => job.status === "ACTIVE").length;
  const totalApplicants = applications.length;
  const pendingApplications = applications.filter(
    (app) => app.status === "APPLIED" || app.status === "REVIEWING",
  ).length;

  // Define tabs with badge for Post Job to make it more visible
  const tabs = [
    { key: "overview", label: "Overview", icon: Eye },
    { key: "jobs", label: "Job Postings", icon: Briefcase },
    { key: "applicants", label: "Applicants", icon: Users },
    { key: "post-job", label: "Post Job", icon: Plus, badge: "New" },
    { key: "profile", label: "Profile", icon: User },
  ];

  // Fetch real data
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
      toast.error("Failed to load jobs");
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
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  // Job editing functions
  const openEditModal = (job: JobPosting) => {
    setSelectedJobForEdit(job);
    setJobForm({
      title: job.title,
      location: job.location,
      employmentType: job.type,
      salary: job.salary,
      deadline: job.deadline.split('T')[0],
      description: job.description,
      qualifications: job.qualification,
      benefits: job.benefits || "",
      useSchoolProfile: job.useSchoolProfile,
      schoolDescription: job.schoolDescription || "",
      teachingLicenseRequired: job.teachingLicenseRequired,
      kazakhLanguageRequired: job.kazakhLanguageRequired,
      localCertificationRequired: job.localCertificationRequired,
    });
    setShowJobModal(true);
  };

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Job ${newStatus.toLowerCase()} successfully!`);
        fetchJobs(); // Refresh jobs list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update job status');
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
    }
  };



  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = selectedJobForEdit 
        ? `/api/jobs/${selectedJobForEdit.id}/update`
        : '/api/jobs';
      
      const method = selectedJobForEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          title: jobForm.title,
          description: jobForm.description,
          location: jobForm.location,
          salary: jobForm.salary,
          type: jobForm.employmentType,
          deadline: jobForm.deadline,
          qualification: jobForm.qualifications,
          benefits: jobForm.benefits,
          useSchoolProfile: jobForm.useSchoolProfile,
          schoolDescription: jobForm.schoolDescription,
          teachingLicenseRequired: jobForm.teachingLicenseRequired,
          kazakhLanguageRequired: jobForm.kazakhLanguageRequired,
          localCertificationRequired: jobForm.localCertificationRequired,
          status: 'ACTIVE',
        }),
      });

      if (response.ok) {
        toast.success(
          selectedJobForEdit 
            ? 'Job updated successfully!' 
            : 'Job posted successfully!'
        );
        // Reset form
        setJobForm({
          title: "",
          location: "",
          employmentType: "",
          salary: "",
          deadline: "",
          description: "",
          qualifications: "",
          benefits: "",
          useSchoolProfile: true,
          schoolDescription: "",
          teachingLicenseRequired: false,
          kazakhLanguageRequired: false,
          localCertificationRequired: false,
        });
        setSelectedJobForEdit(null);
        setShowJobModal(false);
        // Refresh jobs list
        fetchJobs();
        // Switch to jobs tab to show the updated listing
        setActiveTab('jobs');
      } else {
        const error = await response.json();
        
        // Handle profile incomplete error specifically
        if (!error.profileComplete) {
          toast.error(
            <div>
              <p className="font-medium">{error.error}</p>
              <p className="text-sm mt-1">{error.message}</p>
              <button
                onClick={() => window.location.href = '/schools/profile'}
                className="text-primary-600 hover:text-primary-700 underline text-sm mt-2 block"
              >
                Complete Profile Now →
              </button>
            </div>,
            { duration: 6000 }
          );
        } else {
          toast.error(error.error || 'Failed to save job');
        }
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job. Please try again.');
    }
  };

  const handlePostNewJobClick = () => {
    setActiveTab("post-job");
    toast.success("Let's create a new job posting!", {
      icon: "📝",
      duration: 2000,
    });
    
    // Add a small delay to ensure the tab content has rendered
    setTimeout(() => {
      // Scroll to the form with offset for header
      if (postJobFormRef.current) {
        const offsetTop = postJobFormRef.current.offsetTop - 100;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
        // Focus on the first input for better UX
        const firstInput = postJobFormRef.current.querySelector("input");
        firstInput?.focus();
      }
    }, 150);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case "PAUSED":
        return "text-amber-600 bg-amber-100 dark:bg-amber-900/30";
      case "CLOSED":
        return "text-neutral-600 bg-neutral-100 dark:bg-neutral-900/30";
      case "APPLIED":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
      case "REVIEWING":
        return "text-amber-600 bg-amber-100 dark:bg-amber-900/30";
      case "INTERVIEW":
        return "text-purple-600 bg-purple-100 dark:bg-purple-900/30";
      case "DECLINED":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      case "HIRED":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      default:
        return "text-neutral-600 bg-neutral-100 dark:bg-neutral-900/30";
    }
  };

  // Transform Application to Applicant format for modal compatibility
  const transformToApplicant = (application: Application) => {
    const isGuestApplication = !application.teacher;
    const firstName = isGuestApplication ? application.guestFirstName || 'Guest' : application.teacher?.firstName || 'Unknown';
    const lastName = isGuestApplication ? application.guestLastName || 'User' : application.teacher?.lastName || 'User';
    const email = isGuestApplication ? application.guestEmail || 'N/A' : application.teacher?.email || 'N/A';
    
    return {
      id: application.id,
      jobId: application.jobId,
      name: `${firstName} ${lastName}`,
      email: email,
      phone: isGuestApplication ? 'N/A' : application.teacher?.phone || 'N/A',
      qualification: isGuestApplication ? 'Guest Applicant' : application.teacher?.qualification || 'N/A',
      experience: isGuestApplication ? 'Not specified' : application.teacher?.experience || 'Not specified',
      location: isGuestApplication ? 'Not specified' : (application.teacher?.city && application.teacher?.country ? `${application.teacher.city}, ${application.teacher.country}` : 'Not specified'),
      status: application.status.toLowerCase() as "applied" | "reviewing" | "interview" | "declined" | "hired",
      appliedDate: application.createdAt,
      resumeUrl: application.resumeUrl,
      coverLetter: application.coverLetter,
      portfolioUrl: application.portfolioUrl,
      rating: application.rating,
      interviewDate: application.interviewDate,
    };
  };

  const updateApplicantStatus = (
    applicantId: string,
    newStatus: "applied" | "reviewing" | "interview" | "declined" | "hired",
    note?: string,
  ) => {
    // Convert lowercase status to uppercase for API
    const apiStatus = newStatus.toUpperCase() as Application["status"];
    
    // In a real app, this would make an API call
    console.log(
      `Updating applicant ${applicantId} to status ${apiStatus}`,
      note ? `with note: ${note}` : "",
    );

    // If the new status is interview, open the interview scheduling modal
    if (newStatus === "interview") {
      const applicant = applications.find((a) => a.id === applicantId);
      if (applicant) {
        setSelectedApplicantForInterview(applicant);
        setShowInterviewModal(true);
      }
    }

    setShowApplicantModal(false);
    setSelectedApplicant(null);
  };

  const openApplicantModal = (applicant: Application) => {
    setSelectedApplicant(transformToApplicant(applicant));
    setShowApplicantModal(true);
  };

  const handleScheduleInterview = (interviewData: InterviewData) => {
    // In a real app, this would make an API call to save the interview
    console.log("Interview scheduled:", interviewData);

    // Update the applicant status to interview
    const applicantId = interviewData.applicantId;
    const note = `Interview scheduled for ${new Date(interviewData.date + " " + interviewData.time).toLocaleString()}`;

    // Update mock data (in real app, this would be handled by the backend)
    const applicantIndex = applications.findIndex(
      (a) => a.id === applicantId,
    );
    if (applicantIndex !== -1) {
      applications[applicantIndex].status = "INTERVIEW";
      applications[applicantIndex].interviewDate =
        interviewData.date + " " + interviewData.time;
    }

    setShowInterviewModal(false);
    setSelectedApplicantForInterview(null);
  };

  return (
    <div className="min-h-screen pt-20">
      <section className="section">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center justify-between mb-8"
            >
              <div>
                <h1 className="heading-1 mb-2">School Dashboard</h1>
                <p className="text-xl text-neutral-600 dark:text-neutral-400">
                  Manage your job postings and applicants
                </p>
              </div>
              <div className="flex gap-4 mt-4 md:mt-0">
                <Button
                  variant="gradient"
                  leftIcon={<Plus className="w-5 h-5" />}
                  onClick={handlePostNewJobClick}
                >
                  Post New Job
                </Button>
              </div>
            </motion.div>

            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid md:grid-cols-4 gap-6 mb-8"
            >
              {loading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="card p-6">
                    <div className="animate-pulse">
                      <div className="h-12 w-12 bg-neutral-200 dark:bg-neutral-700 rounded-full mb-4"></div>
                      <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {activeJobs}/{totalJobs} Active
                      </span>
                    </div>
                    <div className="text-2xl font-bold mb-1">{totalJobs}</div>
                    <div className="text-sm text-neutral-500">
                      Total Job Postings
                    </div>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                        <Users className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                        {pendingApplications} Pending
                      </span>
                    </div>
                    <div className="text-2xl font-bold mb-1">{totalApplicants}</div>
                    <div className="text-sm text-neutral-500">Total Applicants</div>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                        <Eye className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold mb-1">-</div>
                    <div className="text-sm text-neutral-500">Profile Views</div>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                        <UserCheck className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {applications.filter(app => app.status === "HIRED").length}
                    </div>
                    <div className="text-sm text-neutral-500">Teachers Hired</div>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Mobile Navigation Grid - Responsive */}
          <div className="mb-8">
            {/* Desktop Tabs - Hidden on mobile */}
            <div className="hidden md:block">
              <div className="border-b border-neutral-200 dark:border-neutral-800">
                <nav className="flex space-x-8">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => {
                          if (tab.key === "post-job") {
                            handlePostNewJobClick();
                          } else if (tab.key === "profile") {
                            window.location.href = "/schools/profile";
                          } else {
                            setActiveTab(tab.key as "overview" | "jobs" | "applicants" | "post-job");
                          }
                        }}
                        className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          isActive
                            ? "border-primary-500 text-primary-600 dark:text-primary-400"
                            : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {tab.label}
                        {tab.badge && (
                          <span className="ml-1 px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-full">
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Mobile Navigation Grid - Shown only on mobile */}
            <div className="md:hidden">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => {
                        if (tab.key === "post-job") {
                          handlePostNewJobClick();
                        } else if (tab.key === "profile") {
                          window.location.href = "/schools/profile";
                        } else {
                          setActiveTab(tab.key as "overview" | "jobs" | "applicants" | "post-job");
                        }
                      }}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                        isActive
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`p-2 rounded-lg ${
                          isActive 
                            ? "bg-primary-100 dark:bg-primary-900/30" 
                            : "bg-neutral-100 dark:bg-neutral-700"
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isActive 
                              ? "text-primary-600 dark:text-primary-400" 
                              : "text-neutral-600 dark:text-neutral-400"
                          }`} />
                        </div>
                        <span className={`text-sm font-medium ${
                          isActive 
                            ? "text-primary-600 dark:text-primary-400" 
                            : "text-neutral-700 dark:text-neutral-300"
                        }`}>
                          {tab.label}
                        </span>
                        {tab.badge && (
                          <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                            {tab.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
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
                className="space-y-8"
              >
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Recent Job Postings */}
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
                          className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg mb-1">
                                {job.title}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-neutral-500 mb-2">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {job.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {job.salary}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}
                                >
                                  {job.status}
                                </span>
                                <span className="text-sm text-neutral-500">
                                  {job._count.applications} applicants
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {jobs.length === 0 && !loading && (
                        <p className="text-neutral-500 text-center py-8">
                          No job postings yet. Create your first job posting!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Recent Applicants */}
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="heading-3">Recent Applicants</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("applicants")}
                      >
                        View All
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {applications.slice(0, 4).map((applicant) => {
                        // Handle both teacher applications and guest applications
                        const isGuestApplication = !applicant.teacher;
                        const firstName = isGuestApplication ? applicant.guestFirstName : applicant.teacher?.firstName;
                        const lastName = isGuestApplication ? applicant.guestLastName : applicant.teacher?.lastName;
                        const qualification = isGuestApplication ? 'Guest Applicant' : applicant.teacher?.qualification;
                        
                        return (
                          <div
                            key={applicant.id}
                            className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                            onClick={() => openApplicantModal(applicant)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {firstName?.[0] && lastName?.[0] ? (firstName[0] + lastName[0]).toUpperCase() : '?'}
                              </div>
                              <div>
                                <h4 className="font-medium">{firstName} {lastName}</h4>
                                <p className="text-sm text-neutral-500">
                                  {qualification}
                                </p>
                              </div>
                                                          </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(applicant.status)}`}
                            >
                              {applicant.status}
                            </span>
                          </div>
                        );
                      })}
                      {applications.length === 0 && !loading && (
                        <p className="text-neutral-500 text-center py-8">
                          No applications yet.
                        </p>
                      )}
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
                className="space-y-6"
              >
                {/* Job Listings */}
                <div className="space-y-4">
                  {jobs.map((job) => (
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
                          <div className="grid md:grid-cols-3 gap-4 text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {job.salary}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Posted{" "}
                              {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Kazakhstan-specific requirements */}
                          {(job.teachingLicenseRequired || job.kazakhLanguageRequired || job.localCertificationRequired) && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-1">
                                <Globe className="w-4 h-4" />
                                Kazakhstan Teaching Requirements
                              </h4>
                              <div className="grid md:grid-cols-3 gap-2 text-sm">
                                {job.teachingLicenseRequired && (
                                  <span className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="w-3 h-3" />
                                    Teaching License
                                  </span>
                                )}
                                {job.kazakhLanguageRequired && (
                                  <span className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="w-3 h-3" />
                                    Kazakh Language
                                  </span>
                                )}
                                {job.localCertificationRequired && (
                                  <span className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="w-3 h-3" />
                                    Local Certification
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye className="w-4 h-4" />}
                            onClick={() => setActiveTab("applicants")}
                          >
                            {job._count.applications} Applicants
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Edit3 className="w-4 h-4" />}
                            onClick={() => openEditModal(job)}
                          >
                            Edit
                          </Button>
                          {job.status === "ACTIVE" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateJobStatus(job.id, "PAUSED")}
                              title="Pause job posting"
                            >
                              Pause
                            </Button>
                          )}
                          {job.status === "PAUSED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateJobStatus(job.id, "ACTIVE")}
                              title="Activate job posting"
                            >
                              Activate
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateJobStatus(job.id, "CLOSED")}
                            title="Close job posting"
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {jobs.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <p className="text-neutral-500 mb-4">No job postings yet.</p>
                      <Button
                        variant="gradient"
                        leftIcon={<Plus className="w-5 h-5" />}
                        onClick={handlePostNewJobClick}
                      >
                        Post Your First Job
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "applicants" && (
              <motion.div
                key="applicants"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Filters */}
                <div className="card p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search applicants..."
                          className="input pl-10"
                        />
                      </div>
                    </div>
                    <select className="input">
                      <option value="">All Jobs</option>
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title}
                        </option>
                      ))}
                    </select>
                    <select className="input">
                      <option value="">All Status</option>
                      <option value="APPLIED">Applied</option>
                      <option value="REVIEWING">Reviewing</option>
                      <option value="INTERVIEW">Interview</option>
                      <option value="DECLINED">Declined</option>
                      <option value="HIRED">Hired</option>
                    </select>
                  </div>
                </div>

                {/* Applicants List */}
                <div className="space-y-4">
                  {applications.map((applicant) => {
                    const job = jobs.find((j) => j.id === applicant.jobId);
                    return (
                      <div
                        key={applicant.id}
                        className="card p-6 cursor-pointer hover:shadow-lg transition-all duration-200"
                        onClick={() => openApplicantModal(applicant)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                              {applicant.teacher?.firstName?.[0] || applicant.guestFirstName?.[0] || '?'}
                              {applicant.teacher?.lastName?.[0] || applicant.guestLastName?.[0] || ''}
                            </div>
                            <div className="flex-1">
                              <h3 className="heading-3 mb-1">
                                {applicant.teacher ? `${applicant.teacher.firstName} ${applicant.teacher.lastName}` : `${applicant.guestFirstName || 'Guest'} ${applicant.guestLastName || 'User'}`}
                              </h3>
                              <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                                {job?.title}
                              </p>
                              <div className="grid md:grid-cols-3 gap-4 text-sm text-neutral-500 mb-3">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {applicant.teacher?.email || applicant.guestEmail || 'N/A'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  {applicant.teacher?.phone || applicant.guestPhone || 'N/A'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {applicant.teacher ? `${applicant.teacher.city}, ${applicant.teacher.country}` : 
                                   (applicant.guestCity && applicant.guestCountry ? `${applicant.guestCity}, ${applicant.guestCountry}` : 'Location not specified')}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  <Award className="w-4 h-4" />
                                  {applicant.teacher?.qualification || 'Guest Applicant'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <BookOpen className="w-4 h-4" />
                                  {applicant.teacher?.experience || 'Not specified'}
                                </span>
                                {applicant.rating && (
                                  <span className="flex items-center gap-1">
                                    <span className="text-amber-500">★</span>
                                    {applicant.rating}/5
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(applicant.status)}`}
                            >
                              {applicant.status}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                          <Button
                            size="sm"
                            variant="secondary"
                            leftIcon={<Eye className="w-4 h-4" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              openApplicantModal(applicant);
                            }}
                          >
                            View Details
                          </Button>
                          {applicant.status === "APPLIED" && (
                            <>
                              <Button
                                size="sm"
                                variant="gradient"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedApplicantForInterview(applicant);
                                  setShowInterviewModal(true);
                                }}
                              >
                                Schedule Interview
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateApplicantStatus(
                                    applicant.id,
                                    "declined",
                                  );
                                }}
                              >
                                Decline
                              </Button>
                            </>
                          )}
                          {applicant.status === "INTERVIEW" && (
                            <>
                              <Button
                                size="sm"
                                variant="gradient"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateApplicantStatus(applicant.id, "hired");
                                }}
                              >
                                Hire
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateApplicantStatus(
                                    applicant.id,
                                    "declined",
                                  );
                                }}
                              >
                                Decline
                              </Button>
                            </>
                          )}
                          {applicant.status === "REVIEWING" && (
                            <Button
                              size="sm"
                              variant="gradient"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedApplicantForInterview(applicant);
                                setShowInterviewModal(true);
                              }}
                            >
                              Move to Interview
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {applications.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <p className="text-neutral-500">No applications yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "post-job" && (
              <motion.div
                key="post-job"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                ref={postJobFormRef}
              >
                {/* Job Posting Form */}
                <div className="card p-8">
                  <h2 className="heading-2 mb-6">
                    Post a New Teaching Position
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                    Create a detailed job posting to attract qualified English
                    teachers to your school.
                  </p>

                  <form className="space-y-6" onSubmit={handleJobSubmit}>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Job Title *
                        </label>
                        <input
                          type="text"
                          value={jobForm.title}
                          onChange={(e) => setJobForm({
                            ...jobForm,
                            title: e.target.value,
                          })}
                          className="input"
                          placeholder="e.g., Senior English Teacher - CELTA Required"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Location *
                        </label>
                        <input
                          type="text"
                          value={jobForm.location}
                          onChange={(e) => setJobForm({
                            ...jobForm,
                            location: e.target.value,
                          })}
                          className="input"
                          placeholder="e.g., Almaty, Kazakhstan"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Employment Type *
                        </label>
                        <select 
                          value={jobForm.employmentType}
                          onChange={(e) => setJobForm({
                            ...jobForm,
                            employmentType: e.target.value,
                          })}
                          className="input" 
                          required
                        >
                          <option value="">Select type</option>
                          <option value="FULL_TIME">Full-time</option>
                          <option value="PART_TIME">Part-time</option>
                          <option value="CONTRACT">Contract</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Salary Range *
                        </label>
                        <input
                          type="text"
                          value={jobForm.salary}
                          onChange={(e) => setJobForm({
                            ...jobForm,
                            salary: e.target.value,
                          })}
                          className="input"
                          placeholder="e.g., $2,800 - $3,500/month"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Application Deadline *
                        </label>
                        <input 
                          type="date" 
                          value={jobForm.deadline}
                          onChange={(e) => setJobForm({
                            ...jobForm,
                            deadline: e.target.value,
                          })}
                          className="input" 
                          required 
                        />
                      </div>
                    </div>

                    {/* Kazakhstan-specific Requirements */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                      <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Kazakhstan Teaching Requirements
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={jobForm.teachingLicenseRequired}
                            onChange={(e) => setJobForm({
                              ...jobForm,
                              teachingLicenseRequired: e.target.checked,
                            })}
                            className="rounded" 
                          />
                          <span className="text-sm">
                            Teaching License Required
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={jobForm.kazakhLanguageRequired}
                            onChange={(e) => setJobForm({
                              ...jobForm,
                              kazakhLanguageRequired: e.target.checked,
                            })}
                            className="rounded" 
                          />
                          <span className="text-sm">
                            Kazakh Language Preferred
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={jobForm.localCertificationRequired}
                            onChange={(e) => setJobForm({
                              ...jobForm,
                              localCertificationRequired: e.target.checked,
                            })}
                            className="rounded" 
                          />
                          <span className="text-sm">
                            Local Certification Required
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Job Description *
                      </label>
                      <textarea
                        value={jobForm.description}
                        onChange={(e) => setJobForm({
                          ...jobForm,
                          description: e.target.value,
                        })}
                        className="input"
                        rows={6}
                        placeholder="Describe the role, responsibilities, and what makes your school a great place to work..."
                        required
                      />
                    </div>

                    {/* School Description Section */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                      <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        School Information for Job Posting
                      </h3>
                      
                      <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={jobForm.useSchoolProfile}
                            onChange={(e) => setJobForm({
                              ...jobForm,
                              useSchoolProfile: e.target.checked,
                              schoolDescription: e.target.checked ? "" : jobForm.schoolDescription,
                            })}
                            className="rounded"
                          />
                          <span className="text-sm font-medium">Use school profile information</span>
                        </label>
                        
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          {jobForm.useSchoolProfile 
                            ? "Your school's profile description will be displayed to candidates"
                            : "Provide a custom description specific to this job posting"
                          }
                        </p>

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
                              onChange={(e) => setJobForm({
                                ...jobForm,
                                schoolDescription: e.target.value,
                              })}
                              className="input"
                              placeholder="Provide a custom description about your school for this specific position..."
                            />
                            <p className="text-xs text-neutral-500 mt-1">
                              This will override your school profile description for this job posting only
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Required Qualifications *
                        </label>
                        <textarea
                          value={jobForm.qualifications}
                          onChange={(e) => setJobForm({
                            ...jobForm,
                            qualifications: e.target.value,
                          })}
                          className="input"
                          rows={4}
                          placeholder="e.g., CELTA/TESOL certification, Bachelor's degree, 3+ years experience..."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Benefits & Perks
                        </label>
                        <textarea
                          value={jobForm.benefits}
                          onChange={(e) => setJobForm({
                            ...jobForm,
                            benefits: e.target.value,
                          })}
                          className="input"
                          rows={4}
                          placeholder="e.g., Housing allowance, health insurance, professional development..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <Button type="submit" variant="gradient" size="lg">
                        Publish Job Posting
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Applicant Modal */}
      <ApplicantModal
        applicant={selectedApplicant}
        isOpen={showApplicantModal}
        onClose={() => {
          setShowApplicantModal(false);
          setSelectedApplicant(null);
        }}
        onStatusUpdate={updateApplicantStatus}
        jobTitle={
          selectedApplicant
            ? jobs.find((j) => j.id === selectedApplicant.jobId)?.title
            : ""
        }
      />

      {/* Interview Schedule Modal */}
      {selectedApplicantForInterview && (
        <InterviewScheduleModal
          isOpen={showInterviewModal}
          onClose={() => {
            setShowInterviewModal(false);
            setSelectedApplicantForInterview(null);
          }}
          applicant={{
            id: selectedApplicantForInterview.id,
            name: selectedApplicantForInterview.teacher.firstName + " " + selectedApplicantForInterview.teacher.lastName,
            email: selectedApplicantForInterview.teacher.email,
            phone: selectedApplicantForInterview.teacher.phone,
          }}
          jobTitle={
            jobs.find((j) => j.id === selectedApplicantForInterview.jobId)
              ?.title || ""
          }
          onSchedule={handleScheduleInterview}
        />
      )}

      {/* Job Edit Modal */}
      {showJobModal && selectedJobForEdit && (
        <motion.div
          key="job-edit-modal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
        >
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="heading-2 mb-6">
              {selectedJobForEdit ? "Edit Job Posting" : "Post a New Job"}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">
              {selectedJobForEdit ? "Modify your existing job posting." : "Create a detailed job posting to attract qualified English teachers to your school."}
            </p>

            <form className="space-y-6" onSubmit={handleJobSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({
                      ...jobForm,
                      title: e.target.value,
                    })}
                    className="input"
                    placeholder="e.g., Senior English Teacher - CELTA Required"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({
                      ...jobForm,
                      location: e.target.value,
                    })}
                    className="input"
                    placeholder="e.g., Almaty, Kazakhstan"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Employment Type *
                  </label>
                  <select 
                    value={jobForm.employmentType}
                    onChange={(e) => setJobForm({
                      ...jobForm,
                      employmentType: e.target.value,
                    })}
                    className="input" 
                    required
                  >
                    <option value="">Select type</option>
                    <option value="FULL_TIME">Full-time</option>
                    <option value="PART_TIME">Part-time</option>
                    <option value="CONTRACT">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Salary Range *
                  </label>
                  <input
                    type="text"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({
                      ...jobForm,
                      salary: e.target.value,
                    })}
                    className="input"
                    placeholder="e.g., $2,800 - $3,500/month"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Application Deadline *
                  </label>
                  <input 
                    type="date" 
                    value={jobForm.deadline}
                    onChange={(e) => setJobForm({
                      ...jobForm,
                      deadline: e.target.value,
                    })}
                    className="input" 
                    required 
                  />
                </div>
              </div>

              {/* Kazakhstan-specific Requirements */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Kazakhstan Teaching Requirements
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={jobForm.teachingLicenseRequired}
                      onChange={(e) => setJobForm({
                        ...jobForm,
                        teachingLicenseRequired: e.target.checked,
                      })}
                      className="rounded" 
                    />
                    <span className="text-sm">
                      Teaching License Required
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={jobForm.kazakhLanguageRequired}
                      onChange={(e) => setJobForm({
                        ...jobForm,
                        kazakhLanguageRequired: e.target.checked,
                      })}
                      className="rounded" 
                    />
                    <span className="text-sm">
                      Kazakh Language Preferred
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={jobForm.localCertificationRequired}
                      onChange={(e) => setJobForm({
                        ...jobForm,
                        localCertificationRequired: e.target.checked,
                      })}
                      className="rounded" 
                    />
                    <span className="text-sm">
                      Local Certification Required
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Job Description *
                </label>
                <textarea
                  value={jobForm.description}
                  onChange={(e) => setJobForm({
                    ...jobForm,
                    description: e.target.value,
                  })}
                  className="input"
                  rows={6}
                  placeholder="Describe the role, responsibilities, and what makes your school a great place to work..."
                  required
                />
              </div>

              {/* School Description Section */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  School Information for Job Posting
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={jobForm.useSchoolProfile}
                      onChange={(e) => setJobForm({
                        ...jobForm,
                        useSchoolProfile: e.target.checked,
                        schoolDescription: e.target.checked ? "" : jobForm.schoolDescription,
                      })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Use school profile information</span>
                  </label>
                  
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {jobForm.useSchoolProfile 
                      ? "Your school's profile description will be displayed to candidates"
                      : "Provide a custom description specific to this job posting"
                    }
                  </p>

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
                        onChange={(e) => setJobForm({
                          ...jobForm,
                          schoolDescription: e.target.value,
                        })}
                        className="input"
                        placeholder="Provide a custom description about your school for this specific position..."
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        This will override your school profile description for this job posting only
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Required Qualifications *
                  </label>
                  <textarea
                    value={jobForm.qualifications}
                    onChange={(e) => setJobForm({
                      ...jobForm,
                      qualifications: e.target.value,
                    })}
                    className="input"
                    rows={4}
                    placeholder="e.g., CELTA/TESOL certification, Bachelor's degree, 3+ years experience..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Benefits & Perks
                  </label>
                  <textarea
                    value={jobForm.benefits}
                    onChange={(e) => setJobForm({
                      ...jobForm,
                      benefits: e.target.value,
                    })}
                    className="input"
                    rows={4}
                    placeholder="e.g., Housing allowance, health insurance, professional development..."
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button 
                  type="submit" 
                  variant="gradient" 
                  size="lg"
                >
                  {selectedJobForEdit ? "Update Job Posting" : "Publish Job Posting"}
                </Button>
                <Button type="button" variant="ghost" size="lg" onClick={() => setShowJobModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
};
