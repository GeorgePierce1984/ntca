import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
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
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Hourglass,
  Monitor,
  School,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MessagesModal } from "@/components/messages/MessagesModal";
import { InterviewInviteResponse } from "@/components/teachers/InterviewInviteResponse";
import { getCountryByName } from "@/data/countries";
import { countries } from "@/data/countries";
import { CENTRAL_ASIA_COUNTRIES } from "@/constants/options";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { timedFetch } from "@/utils/timedFetch";
import { TeacherProfilePage } from "@/pages/teachers/ProfilePage";

const getLocalTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

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
  teachingExperience?: any;
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
  city: string;
  country: string;
  salary: string;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | string;
  status: string;
  deadline: string;
  createdAt: string;
  contractLength?: string | null;
  studentAgeGroupMin?: number | null;
  studentAgeGroupMax?: number | null;
  requirements?: string;
  qualification?: string;
  experience?: string;
  language?: string;
  visaRequired?: boolean;
  teachingLicenseRequired?: boolean;
  kazakhLanguageRequired?: boolean;
  localCertificationRequired?: boolean;
  benefits?: string;
  hasApplied?: boolean;
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

// Filter to only Central Asian countries (using the same list as registration)
const centralAsiaCountries = countries.filter(c => 
  CENTRAL_ASIA_COUNTRIES.some(ca => 
    ca.label.toLowerCase() === c.name.toLowerCase()
  )
);

interface FilterState {
  // Core Primary Filters
  countries: string[];
  city: string;
  jobTypes: string[];
  onlineExperience: boolean;
  salaryMin: number | "";
  salaryMax: number | "";
  showUndisclosedSalaries: boolean;
  contractLengths: string[];
  
  // Qualification & Experience (Expandable)
  experienceMin: number;
  qualifications: string[];
  teachingContext: string[];
  
  // Eligibility & Visa
  visaRequirement: string;
  
  // School & Role Characteristics
  schoolTypes: string[];
  studentAgeGroups: string[];
  
  // Time & Urgency
  startDate: string;
  deadlineFilter: string;
  
  // Sort
  sort: string;
}

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileFetchAttempted, setProfileFetchAttempted] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);
  
  // Get initial tab from URL params, default to "overview"
  const initialTab = searchParams.get("tab") as "overview" | "profile" | "jobs" | "applications" | "saved" | null;
  const [activeTab, setActiveTab] = useState<
    "overview" | "profile" | "jobs" | "applications" | "saved"
  >(initialTab || "overview");

  const setTabAndURL = useCallback(
    (tab: "overview" | "profile" | "jobs" | "applications" | "saved") => {
      setActiveTab(tab);
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", tab);
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  
  // Update active tab when URL param changes
  useEffect(() => {
    const tabParam = searchParams.get("tab") as "overview" | "profile" | "jobs" | "applications" | "saved" | null;
    if (tabParam && ["overview", "profile", "jobs", "applications", "saved"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Job search and filtering - matching Jobs page exactly
  const parseFiltersFromURL = (): FilterState => {
    return {
      countries: searchParams.getAll("country") || [],
      city: searchParams.get("city") || "",
      jobTypes: searchParams.getAll("job_type") || [],
      onlineExperience: searchParams.get("online_experience") === "true",
      salaryMin: searchParams.get("salary_min") ? parseInt(searchParams.get("salary_min")!) : 0,
      salaryMax: searchParams.get("salary_max") ? parseInt(searchParams.get("salary_max")!) : 10000,
      showUndisclosedSalaries: false,
      contractLengths: searchParams.getAll("contract_length") || [],
      experienceMin: searchParams.get("experience_min") ? parseInt(searchParams.get("experience_min")!) : 0,
      qualifications: searchParams.getAll("qualification") || [],
      teachingContext: searchParams.getAll("teaching_context") || [],
      visaRequirement: searchParams.get("visa_requirement") || "",
      schoolTypes: searchParams.getAll("school_type") || [],
      studentAgeGroups: searchParams.getAll("student_age") || [],
      startDate: searchParams.get("start_date") || "",
      deadlineFilter: searchParams.get("deadline") || "",
      sort: searchParams.get("sort") || "latest",
    };
  };

  // Applied filters (from URL) - these trigger API calls
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(parseFiltersFromURL);
  // Staged filters (local state) - these don't trigger API calls until applied
  const [stagedFilters, setStagedFilters] = useState<FilterState>(parseFiltersFromURL);
  const [stagedSearchTerm, setStagedSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [showFilters, setShowFilters] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [totalJobs, setTotalJobs] = useState(0);
  
  // State for collapsible filter sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    location: false,
    jobType: false,
    salary: false,
    contractLength: false,
    experienceLevel: false,
    qualifications: false,
    teachingContext: false,
    visaRequirement: false,
    schoolType: false,
    studentAgeGroup: false,
    startDate: false,
    deadline: false,
  });
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Refs for scrolling
  const scrollableContentRef = useRef<HTMLDivElement>(null);
  const expandableFiltersRef = useRef<HTMLDivElement>(null);
  const moreFiltersButtonRef = useRef<HTMLDivElement>(null);

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

  // Function to open application modal and pre-fill with teacher profile data
  const openApplicationModal = (job: Job) => {
    setSelectedJob(job);
    // Pre-fill form with teacher profile data (except cover letter)
    setApplicationForm({
      coverLetter: "",
      resumeUrl: teacher?.resumeUrl || "",
      portfolioUrl: teacher?.portfolioUrl || "",
    });
    setShowApplicationModal(true);
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Interview requests
  const [interviewRequests, setInterviewRequests] = useState<Record<string, any>>({});
  const [selectedInterviewRequest, setSelectedInterviewRequest] = useState<{
    applicationId: string;
    interviewRequest: any;
    jobTitle: string;
    schoolName: string;
  } | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  // Fetch unread message count
  const fetchUnreadMessageCount = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch("/api/messages/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const totalUnread = (data.conversations || []).reduce(
          (sum: number, conv: any) => sum + (conv.unreadCount || 0),
          0
        );
        setUnreadMessageCount(totalUnread);
      }
    } catch (error) {
      console.error("Error fetching unread message count:", error);
    }
  };

  // Fetch interview request for an application
  const fetchInterviewRequest = async (applicationId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`/api/applications/${applicationId}/interview-request`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.interviewRequest) {
          setInterviewRequests((prev) => ({
            ...prev,
            [applicationId]: data.interviewRequest,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching interview request:", error);
    }
  };

  // Fetch all interview requests when applications tab is active
  useEffect(() => {
    if (activeTab === "applications" && teacher?.applications) {
      teacher.applications.forEach((app) => {
        // If application already has interviewRequest from API, use it
        if (app.interviewRequest) {
          setInterviewRequests((prev) => ({
            ...prev,
            [app.id]: app.interviewRequest,
          }));
        } else if (app.status === "INTERVIEW" || app.status === "REVIEWING") {
          // Otherwise, fetch it if status suggests there might be one
          fetchInterviewRequest(app.id);
        }
      });
    }
  }, [activeTab, teacher?.applications]);

  useEffect(() => {
    // Initial data fetch on page load
    fetchTeacherProfile();
    fetchSavedJobs();
    fetchUnreadMessageCount();
    
    // Only fetch when user switches back to the tab (not on intervals)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User switched back to the tab - refresh data
        fetchUnreadMessageCount();
        // Optionally refresh other data too
        fetchSavedJobs();
      }
    };
    
    // Listen for tab visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useCallback((filterState: FilterState, search: string = "") => {
    return (
      filterState.countries.length > 0 ||
      filterState.city !== "" ||
      filterState.jobTypes.length > 0 ||
      filterState.onlineExperience ||
      filterState.salaryMin !== 0 ||
      filterState.salaryMax !== 10000 ||
      filterState.contractLengths.length > 0 ||
      filterState.experienceMin > 0 ||
      filterState.qualifications.length > 0 ||
      filterState.teachingContext.length > 0 ||
      filterState.visaRequirement !== "" ||
      filterState.schoolTypes.length > 0 ||
      filterState.studentAgeGroups.length > 0 ||
      filterState.startDate !== "" ||
      filterState.deadlineFilter !== "" ||
      search !== ""
    );
  }, []);

  // Build URL params from filters
  const buildURLParams = useCallback((filterState: FilterState, search: string = "") => {
    const params = new URLSearchParams();
    
    // Only add params if filters are active (for SEO-friendly URLs)
    if (!hasActiveFilters(filterState, search)) {
      return params; // Empty params = show all
    }
    
    if (search) params.append("search", search);
    
    // Core filters
    filterState.countries.forEach(c => params.append("country", c));
    if (filterState.city) params.append("city", filterState.city);
    filterState.jobTypes.forEach(t => params.append("job_type", t));
    if (filterState.onlineExperience) params.append("online_experience", "true");
    // Only add salary filters if they're not at default values
    if (typeof filterState.salaryMin === "number" && filterState.salaryMin > 0) params.append("salary_min", filterState.salaryMin.toString());
    if (typeof filterState.salaryMax === "number" && filterState.salaryMax < 10000) params.append("salary_max", filterState.salaryMax.toString());
    filterState.contractLengths.forEach(c => params.append("contract_length", c));
    
    // Expandable filters
    if (filterState.experienceMin > 0) params.append("experience_min", filterState.experienceMin.toString());
    filterState.qualifications.forEach(q => params.append("qualification", q));
    filterState.teachingContext.forEach(t => params.append("teaching_context", t));
    
    // Eligibility
    if (filterState.visaRequirement) params.append("visa_requirement", filterState.visaRequirement);
    
    // School & Role
    filterState.schoolTypes.forEach(s => params.append("school_type", s));
    filterState.studentAgeGroups.forEach(a => params.append("student_age", a));
    
    // Time filters
    if (filterState.startDate) params.append("start_date", filterState.startDate);
    if (filterState.deadlineFilter) params.append("deadline", filterState.deadlineFilter);
    
    // Sort
    if (filterState.sort && filterState.sort !== "latest") params.append("sort", filterState.sort);
    
    return params;
  }, [hasActiveFilters]);

  // Fetch jobs using the public API (same as Jobs page)
  const fetchJobs = useCallback(async () => {
    if (activeTab !== "jobs") return;
    
    try {
      setJobsLoading(true);
      const params = buildURLParams(appliedFilters, searchTerm);
      const queryString = params.toString();
      
      // Always call the API, even with empty params (to get all jobs)
      const url = `/api/jobs/public${queryString ? `?${queryString}` : ''}`;
      
      const response = await timedFetch(url, { label: "jobs.public (GET)" });
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
        setTotalJobs(data.pagination?.totalJobs || data.jobs?.length || 0);
      } else {
        setJobs([]);
        setTotalJobs(0);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setJobsLoading(false);
    }
  }, [appliedFilters, searchTerm, buildURLParams, activeTab]);

  // Fetch jobs when applied filters or search term changes
  useEffect(() => {
    if (activeTab === "jobs") {
      fetchJobs();
    }
  }, [fetchJobs, activeTab]);

  // Update applied filters when URL changes (e.g., browser back/forward)
  useEffect(() => {
    if (activeTab === "jobs") {
      const urlFilters = parseFiltersFromURL();
      setAppliedFilters(urlFilters);
      setStagedFilters(urlFilters);
      setStagedSearchTerm(searchParams.get("search") || "");
      setSearchTerm(searchParams.get("search") || "");
    }
  }, [searchParams, activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Apply staged filters and search term
    setAppliedFilters(stagedFilters);
    setSearchTerm(stagedSearchTerm);
    const params = buildURLParams(stagedFilters, stagedSearchTerm);
    setSearchParams(params, { replace: true });
    setShowFilters(false); // Close filters when search is submitted
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    // Only update staged filters (local state) - don't trigger API call
    const newFilters = { ...stagedFilters, [key]: value };
    setStagedFilters(newFilters);
  };

  const handleMultiSelect = (key: keyof FilterState, value: string) => {
    // Only update staged filters (local state) - don't trigger API call
    const newFilters = {
      ...stagedFilters,
      [key]: (() => {
        const current = stagedFilters[key] as string[];
        return current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value];
      })(),
    };
    setStagedFilters(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      countries: [],
      city: "",
      jobTypes: [],
      onlineExperience: false,
      salaryMin: 0,
      salaryMax: 10000,
      showUndisclosedSalaries: false,
      contractLengths: [],
      experienceMin: 0,
      qualifications: [],
      teachingContext: [],
      visaRequirement: "",
      schoolTypes: [],
      studentAgeGroups: [],
      startDate: "",
      deadlineFilter: "",
      sort: "latest",
    };
    setStagedFilters(emptyFilters);
    setStagedSearchTerm("");
    setAppliedFilters(emptyFilters);
    setSearchTerm("");
    setSearchParams({}, { replace: true });
    // Don't close filters modal - let user continue filtering
  };

  const clearAllFiltersAndSearch = () => {
    clearFilters();
    // This function is called from the main search area, so we also want to close the modal if it's open
    setShowFilters(false);
  };

  const handleJobClick = (jobId: string) => {
    // Preserve current filters in URL when navigating to job detail
    const params = buildURLParams(appliedFilters, searchTerm);
    const queryString = params.toString();
    navigate(`/jobs/${jobId}`, { 
      state: { from: 'dashboard' },
      ...(queryString ? { search: queryString } : {})
    });
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return days;
  };

  const activeFilterCount = 
    appliedFilters.countries.length +
    (appliedFilters.city ? 1 : 0) +
    appliedFilters.jobTypes.length +
    (appliedFilters.onlineExperience ? 1 : 0) +
    (appliedFilters.salaryMin !== 0 ? 1 : 0) +
    (appliedFilters.salaryMax !== 10000 ? 1 : 0) +
    appliedFilters.contractLengths.length +
    (appliedFilters.experienceMin > 0 ? 1 : 0) +
    appliedFilters.qualifications.length +
    appliedFilters.teachingContext.length +
    (appliedFilters.visaRequirement !== "" ? 1 : 0) +
    appliedFilters.schoolTypes.length +
    appliedFilters.studentAgeGroups.length +
    (appliedFilters.startDate ? 1 : 0) +
    (appliedFilters.deadlineFilter ? 1 : 0);

  const fetchTeacherProfile = async () => {
    setProfileFetchAttempted(true);
    
    try {
      const response = await timedFetch("/api/teachers/profile", {
        label: "teacher.profile (GET)",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.teacher) {
          setTeacher(data.teacher);
          setProfileForm(data.teacher);
        }
        // Only set loading to false after successful fetch
        setLoading(false);
      } else if (response.status === 404) {
        // Profile doesn't exist - this is expected for new users
        console.log("Teacher profile not found - may need to complete registration");
        setLoading(false);
      } else {
        // Other errors - retry once after a delay
        console.error("Error fetching teacher profile:", response.status, response.statusText);
        // Retry once after a short delay for connection issues
        setTimeout(async () => {
          try {
            const retryResponse = await timedFetch("/api/teachers/profile", {
              label: "teacher.profile (GET retry)",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            });
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              if (retryData.teacher) {
                setTeacher(retryData.teacher);
                setProfileForm(retryData.teacher);
              }
            }
            setLoading(false);
          } catch (retryError) {
            console.error("Retry failed:", retryError);
            setLoading(false);
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Error fetching teacher profile:", error);
      // Retry once for network errors
      setTimeout(async () => {
        try {
          const retryResponse = await timedFetch("/api/teachers/profile", {
            label: "teacher.profile (GET retry 2)",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          });
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            if (retryData.teacher) {
              setTeacher(retryData.teacher);
              setProfileForm(retryData.teacher);
            }
          }
          setLoading(false);
        } catch (retryError) {
          console.error("Retry failed:", retryError);
          setLoading(false);
        }
      }, 2000);
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
      const response = await timedFetch("/api/teachers/profile", {
        label: "teacher.profile (PUT)",
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

  const normalizeInterviewRequest = (raw: any) => {
    if (!raw || typeof raw !== "object") return null;
    const ir: any = { ...raw };

    if (typeof ir.timeSlots === "string") {
      try {
        ir.timeSlots = JSON.parse(ir.timeSlots);
      } catch {
        ir.timeSlots = [];
      }
    }
    if (!Array.isArray(ir.timeSlots)) ir.timeSlots = [];
    ir.timeSlots = ir.timeSlots.filter((s: any) => s && typeof s === "object" && s.date && s.time);

    if (typeof ir.alternativeSlot === "string") {
      try {
        ir.alternativeSlot = JSON.parse(ir.alternativeSlot);
      } catch {
        delete ir.alternativeSlot;
      }
    }
    if (ir.alternativeSlot && (!ir.alternativeSlot.date || !ir.alternativeSlot.time)) {
      delete ir.alternativeSlot;
    }

    if (ir.selectedSlot === null || ir.selectedSlot === undefined) {
      delete ir.selectedSlot;
    } else if (typeof ir.selectedSlot !== "number" || !Number.isFinite(ir.selectedSlot)) {
      delete ir.selectedSlot;
    } else if (ir.selectedSlot < 0 || ir.selectedSlot >= ir.timeSlots.length) {
      delete ir.selectedSlot;
    }

    return ir;
  };

  const getConfirmedInterviewSlot = (ir: any) => {
    if (!ir) return null;
    if (typeof ir.selectedSlot === "number" && Array.isArray(ir.timeSlots)) {
      const slot = ir.timeSlots[ir.selectedSlot];
      if (slot?.date && slot?.time) return slot;
    }
    if (ir.alternativeSlot?.date && ir.alternativeSlot?.time) return ir.alternativeSlot;
    return null;
  };

  const formatInterviewSlot = (slot: any, timezone: string) => {
    if (!slot?.date || !slot?.time) return "";
    try {
      const dateTime = new Date(`${slot.date}T${slot.time}`);
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
      return `${slot.date} ${slot.time}`;
    }
  };

  const getCountdownLabel = (slot: any) => {
    if (!slot?.date || !slot?.time) return null;
    const dateTime = new Date(`${slot.date}T${slot.time}`);
    if (isNaN(dateTime.getTime())) return null;
    const diffMs = dateTime.getTime() - Date.now();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "In 1 day";
    return `In ${diffDays} days`;
  };

  const getInterviewLocationHref = (ir: any) => {
    const raw = ir?.location || "";
    if (!raw) return null;
    if (ir?.locationType === "phone") return `tel:${String(raw).replace(/\s+/g, "")}`;
    if (ir?.locationType === "video") {
      if (/^https?:\/\//i.test(raw)) return raw;
      if (/^[\w-]+(\.[\w-]+)+/i.test(raw)) return `https://${raw}`;
    }
    return null;
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

  // Only show "Profile Not Found" if we've attempted to fetch and confirmed it doesn't exist
  // Don't show it while loading or if we haven't tried fetching yet
  if (!teacher && !loading && profileFetchAttempted) {
    // Only show error if we've actually tried to fetch and got a 404 or no data
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Please complete your teacher registration.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  const calculateProfileCompleteness = () => {
    if (!teacher) return 0;

    const requiredFields = [
      "firstName",
      "lastName",
      "phone",
      "city",
      "country",
      "nationality",
      "qualification",
      "experienceYears",
      "experience",
    ];

    const optionalFields = [
      "resumeUrl",
      "photoUrl",
      "certifications",
      "subjects",
      "languageSkills",
      "education",
    ];

    const requiredComplete = requiredFields.filter(
      (field) => teacher[field as keyof Teacher],
    ).length;

    const optionalComplete = optionalFields.filter((field) => {
      const value = teacher[field as keyof Teacher];
      return value && (Array.isArray(value) ? value.length > 0 : true);
    }).length;

    const totalFields = requiredFields.length + optionalFields.length;
    const completedFields = requiredComplete + optionalComplete;

    return Math.round((completedFields / totalFields) * 100);
  };

  const stats = {
    totalApplications: teacher?.applications?.length || 0,
    pendingApplications:
      teacher?.applications?.filter((app) => app.status === "APPLIED").length ||
      0,
    savedJobsCount: savedJobs.length,
    profileViews: teacher?.profileViews || 0,
  };

  const profileCompletion = calculateProfileCompleteness();

  // Calculate age range from preferred age groups
  const calculatePreferredAgeRange = () => {
    if (!teacher?.ageGroups || teacher.ageGroups.length === 0) {
      return "N/A";
    }

    const allAges: number[] = [];
    teacher.ageGroups.forEach((ageGroup) => {
      if (ageGroup === "Kids (5-12)") {
        allAges.push(5, 6, 7, 8, 9, 10, 11, 12);
      } else if (ageGroup === "Teens (13-17)") {
        allAges.push(13, 14, 15, 16, 17);
      } else if (ageGroup === "Adults (18+)") {
        allAges.push(18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31);
      }
    });

    if (allAges.length === 0) return "N/A";

    const minAge = Math.min(...allAges);
    const maxAge = Math.max(...allAges);
    // If max age is 30 or higher, show as 30+
    if (maxAge >= 30) {
      return `${minAge}-30+`;
    }
    return `${minAge}-${maxAge}`;
  };

  // Calculate teaching ages from teaching experience (Years by Age Group)
  const calculateTeachingAges = () => {
    if (!teacher?.teachingExperience) {
      // Try to parse if it's a string
      if (typeof teacher?.teachingExperience === 'string') {
        try {
          const parsed = JSON.parse(teacher.teachingExperience);
          if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
            return null;
          }
          return calculateAgesFromExperience(parsed);
        } catch {
          return null;
        }
      }
      return null;
    }

    if (Array.isArray(teacher.teachingExperience) && teacher.teachingExperience.length === 0) {
      return null;
    }

    return calculateAgesFromExperience(teacher.teachingExperience);
  };

  const calculateAgesFromExperience = (experienceArray: any[]) => {
    const allAges: number[] = [];
    
    experienceArray.forEach((exp) => {
      if (exp.studentAgeGroups && Array.isArray(exp.studentAgeGroups)) {
        exp.studentAgeGroups.forEach((ageGroup: string) => {
          if (ageGroup === "Kids (5-12)") {
            allAges.push(5, 6, 7, 8, 9, 10, 11, 12);
          } else if (ageGroup === "Teens (13-17)") {
            allAges.push(13, 14, 15, 16, 17);
          } else if (ageGroup === "Adults (18+)") {
            allAges.push(18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31);
          }
        });
      }
    });

    if (allAges.length === 0) return null;

    const minAge = Math.min(...allAges);
    const maxAge = Math.max(...allAges);
    // If max age is 30 or higher, show as 30+
    if (maxAge >= 30) {
      return `${minAge}-30+`;
    }
    return `${minAge}-${maxAge}`;
  };

  // Get nationality flag
  const getNationalityFlag = () => {
    if (!teacher?.nationality) return null;
    const country = getCountryByName(teacher.nationality);
    return country?.flag || null;
  };

  // Check if teacher has specific certification from education array
  const hasCertification = (certName: string) => {
    if (!teacher?.education || teacher.education.length === 0) return false;
    // Check all education entries for the certification
    return teacher.education.some(edu => {
      if (!edu?.degree) return false;
      const degree = edu.degree.toLowerCase();
      return degree.includes(certName.toLowerCase());
    });
  };

  // Check if teacher has a degree from education (check all entries)
  const hasDegree = () => {
    if (!teacher?.education || teacher.education.length === 0) return false;
    // Check all education entries for degree
    return teacher.education.some(edu => {
      if (!edu?.degree) return false;
      const degree = edu.degree.toLowerCase();
      return degree.includes("bachelor") || degree.includes("master") || degree.includes("phd") || degree.includes("degree");
    });
  };

  // Get qualification from education (prioritize degree, then certifications)
  const getQualification = () => {
    if (!teacher?.education || teacher.education.length === 0) return null;
    // First try to find a degree
    const degree = teacher.education.find(edu => {
      if (!edu?.degree) return false;
      const deg = edu.degree.toLowerCase();
      return deg.includes("bachelor") || deg.includes("master") || deg.includes("phd") || deg.includes("degree");
    });
    if (degree?.degree) return degree.degree;
    // If no degree, return first education entry
    return teacher.education[0]?.degree || null;
  };

  // Check if teacher is Native/Near Native English
  const isNativeEnglish = () => {
    if (!teacher) return false;
    // Check nativeLanguage
    if (teacher.nativeLanguage?.toLowerCase().includes('english')) return true;
    // Check languageSkills for English
    if (teacher.languageSkills && typeof teacher.languageSkills === 'object') {
      const englishLevel = (teacher.languageSkills as Record<string, string>)['English']?.toLowerCase();
      return englishLevel === 'native' || englishLevel === 'near-native' || englishLevel === 'near native';
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20">
      <div className="container-custom max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-3 mb-2">
                Welcome back,
                <br />
                {teacher?.firstName || user?.teacher?.firstName || "Teacher"}
              </h1>
              <p className="text-xl text-neutral-500">
                Manage your profile and applications
              </p>
            </div>
            <div className="flex items-center gap-4">
              {teacher && !teacher.profileComplete && (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-4 py-2 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">
                    Complete your profile to get more job matches
                  </span>
                </div>
              )}
              <Button
                variant="gradient"
                leftIcon={<User className="w-4 h-4" />}
                className="w-32"
                glow
                onClick={() => setTabAndURL("profile")}
              >
                Profile
              </Button>
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
              { key: "messages", label: "Message Center", icon: MessageSquare, isLink: true },
            ].map(({ key, label, icon: Icon, isLink }) => (
                <button
                  key={key}
                  onClick={() => {
                    if (isLink) {
                      setShowMessagesModal(true);
                    } else {
                      setTabAndURL(key as any);
                    }
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === key
                      ? "border-primary-500 text-primary-600 dark:text-primary-400"
                      : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Icon className="w-4 h-4" />
                      {key === "messages" && unreadMessageCount > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                        {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                      </span>
                    )}
                  </div>
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
              {/* Profile Snapshot */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="heading-3">Profile Snapshot</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTabAndURL("profile")}
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getNationalityFlag() && (
                          <span className="text-xl">{getNationalityFlag()}</span>
                        )}
                        <h4 className="font-semibold">
                          {teacher.firstName} {teacher.lastName}
                        </h4>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {teacher.city}, {teacher.country}
                      </p>
                      {teacher.experienceYears !== undefined && teacher.experienceYears !== null && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          {teacher.experienceYears} {teacher.experienceYears === 1 ? 'Year' : 'Years'} Experience
                        </p>
                      )}
                      {calculateTeachingAges() && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          Ages {calculateTeachingAges()}
                        </p>
                      )}
                      {teacher.ageGroups && teacher.ageGroups.length > 0 && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          Preferred ages: {calculatePreferredAgeRange()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Certification Icons */}
                  <div className="flex items-center gap-4 pt-2 border-t border-neutral-200 dark:border-neutral-700 flex-wrap">
                    {hasCertification('TEFL') && (
                      <div className="flex items-center gap-2" title="TEFL Certified">
                        <Award className="w-5 h-5 text-primary-600" />
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">TEFL</span>
                      </div>
                    )}
                    {hasCertification('CELTA') && (
                      <div className="flex items-center gap-2" title="CELTA Certified">
                        <Award className="w-5 h-5 text-primary-600" />
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">CELTA</span>
                      </div>
                    )}
                    {hasCertification('TESOL') && (
                      <div className="flex items-center gap-2" title="TESOL Certified">
                        <Award className="w-5 h-5 text-primary-600" />
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">TESOL</span>
                      </div>
                    )}
                    {hasCertification('DELTA') && (
                      <div className="flex items-center gap-2" title="DELTA Certified">
                        <Award className="w-5 h-5 text-primary-600" />
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">DELTA</span>
                      </div>
                    )}
                    {hasDegree() && (
                      <div className="flex items-center gap-2" title="Has Degree">
                        <GraduationCap className="w-5 h-5 text-primary-600" />
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          {getQualification() || 'Degree'}
                        </span>
                      </div>
                    )}
                    {isNativeEnglish() && (
                      <div className="flex items-center gap-2" title="Native/Near Native English">
                        <Languages className="w-5 h-5 text-primary-600" />
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Native English</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Profile Completion
                      </span>
                      <span className="text-sm font-bold text-primary-600">
                        {profileCompletion}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${profileCompletion}%` }}
                      ></div>
                    </div>
                    {profileCompletion < 100 && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
                        Complete your profile to increase visibility to schools
                      </p>
                    )}
                  </div>
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
                  {teacher.applications?.slice(0, 3).map((app) => {
                    const interviewReq = normalizeInterviewRequest(app.interviewRequest || interviewRequests[app.id]);
                    const hasPendingInterview = interviewReq && interviewReq.status === "pending";
                    const confirmedSlot =
                      interviewReq && interviewReq.status === "accepted"
                        ? getConfirmedInterviewSlot(interviewReq)
                        : null;
                    const tz = getLocalTimezone();
                    
                    return (
                      <div
                        key={app.id}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          hasPendingInterview 
                            ? "bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800" 
                            : "bg-neutral-50 dark:bg-neutral-800"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{app.job.title}</h4>
                            {hasPendingInterview && (
                              <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-xs font-medium flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Action Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {app.job.school.name}
                          </p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {app.job.city}, {app.job.country}
                          </p>
                          {interviewReq && (
                            <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                              <span className="font-medium">Interview:</span>{" "}
                              {interviewReq.locationType === "video"
                                ? "Video"
                                : interviewReq.locationType === "phone"
                                ? "Phone"
                                : "Onsite"}
                              {confirmedSlot ? (
                                <>
                                  {" "}
                                  • {formatInterviewSlot(confirmedSlot, tz)}
                                  {getCountdownLabel(confirmedSlot) ? ` • ${getCountdownLabel(confirmedSlot)}` : ""}
                                </>
                              ) : interviewReq.status === "pending" ? (
                                <> • Awaiting your response</>
                              ) : null}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
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
                    );
                  })}
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
              <TeacherProfilePage embedded />
              {false && (
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
              )}
            </motion.div>
          )}

          {activeTab === "jobs" && (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {console.log('Dashboard: Rendering jobs tab, jobs count:', jobs.length, 'loading:', jobsLoading)}
              {/* Search Bar - Matching Jobs page exactly */}
              <form onSubmit={handleSearch} className="max-w-6xl mx-auto mb-8">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by job title, school, or keyword..."
                      value={stagedSearchTerm}
                      onChange={(e) => setStagedSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowFilters(!showFilters)}
                    leftIcon={<Filter className="w-4 h-4" />}
                  >
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                        {activeFilterCount}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 ml-2 transition-transform ${
                        showFilters ? "rotate-180" : ""
                      }`}
                    />
                  </Button>

                  {/* Filters Dropdown Panel - Centered on page */}
                  <AnimatePresence>
                    {showFilters && (
                      <>
                        {/* Backdrop */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setShowFilters(false)}
                          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
                        />
                        {/* Filters Panel - Centered on screen */}
                        <div
                          style={{
                            position: 'fixed',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 50,
                            width: '800px',
                            maxWidth: '95vw',
                            maxHeight: '85vh',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                          className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700"
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            style={{ 
                              height: '100%', 
                              display: 'flex', 
                              flexDirection: 'column',
                              overflow: 'hidden'
                            }}
                            className="w-full"
                          >
                            {/* Header with Close Button */}
                            <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 flex items-center justify-between rounded-t-lg flex-shrink-0">
                              <h3 className="text-lg font-semibold">Filters</h3>
                              <button
                                onClick={() => setShowFilters(false)}
                                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                                aria-label="Close filters"
                              >
                                <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                              </button>
                            </div>

                            {/* Scrollable Content */}
                            <div 
                              ref={scrollableContentRef}
                              className="overflow-y-auto px-6 py-4 space-y-6" 
                              style={{ 
                                flex: '1 1 0%',
                                minHeight: 0,
                                overflowY: 'auto'
                              }}
                            >
                              {/* Location */}
                              <div>
                                <button
                                  type="button"
                                  onClick={() => toggleSection('location')}
                                  className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary-600" />
                                    Location
                                  </div>
                                  {expandedSections.location ? (
                                    <ChevronUp className="w-4 h-4 text-neutral-500" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                                  )}
                                </button>
                                <AnimatePresence>
                                  {expandedSections.location && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="space-y-3">
                                        <div>
                                          <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                                            Country (multi-select)
                                          </label>
                                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-neutral-200 dark:border-neutral-700 rounded">
                                            {centralAsiaCountries.map((country) => (
                                              <label
                                                key={country.code}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-700 rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-600"
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={stagedFilters.countries.includes(country.name)}
                                                  onChange={() => handleMultiSelect("countries", country.name)}
                                                  className="rounded"
                                                />
                                                <span className="text-base">{country.flag}</span>
                                                <span className="text-sm">{country.name}</span>
                                              </label>
                                            ))}
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                                            City (optional)
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="Enter city name"
                                            value={stagedFilters.city}
                                            onChange={(e) => handleFilterChange("city", e.target.value)}
                                            className="input"
                                          />
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              {/* Job Type */}
                              <div>
                                <button
                                  type="button"
                                  onClick={() => toggleSection('jobType')}
                                  className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-primary-600" />
                                    Job Type
                                  </div>
                                  {expandedSections.jobType ? (
                                    <ChevronUp className="w-4 h-4 text-neutral-500" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                                  )}
                                </button>
                                <AnimatePresence>
                                  {expandedSections.jobType && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="space-y-3">
                                        <div className="flex flex-wrap gap-3">
                                          {["Full-time", "Part-time", "Contract"].map((type) => {
                                            const value = type.toUpperCase().replace("-", "_");
                                            return (
                                              <label
                                                key={type}
                                                className="flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-700 rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-600"
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={stagedFilters.jobTypes.includes(value)}
                                                  onChange={() => handleMultiSelect("jobTypes", value)}
                                                  className="rounded"
                                                />
                                                <span className="text-sm">{type}</span>
                                              </label>
                                            );
                                          })}
                                        </div>
                                        <div>
                                          <label className="flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-700 rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-600">
                                            <input
                                              type="checkbox"
                                              checked={stagedFilters.onlineExperience}
                                              onChange={(e) => handleFilterChange("onlineExperience", e.target.checked)}
                                              className="rounded"
                                            />
                                            <span className="text-sm">Online Experience</span>
                                          </label>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              {/* Salary Range */}
                              <div>
                                <button
                                  type="button"
                                  onClick={() => toggleSection('salary')}
                                  className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-primary-600" />
                                    Salary Range (Monthly)
                                  </div>
                                  {expandedSections.salary ? (
                                    <ChevronUp className="w-4 h-4 text-neutral-500" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                                  )}
                                </button>
                                <AnimatePresence>
                                  {expandedSections.salary && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="space-y-4">
                                        <div className="px-2">
                                          <div className="flex items-center justify-between mb-4">
                                            <div className="text-center">
                                              <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                                ${typeof stagedFilters.salaryMin === "number" ? stagedFilters.salaryMin.toLocaleString() : "0"}
                                              </div>
                                              <div className="text-xs text-neutral-500">Min</div>
                                            </div>
                                            <div className="text-center">
                                              <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                                ${typeof stagedFilters.salaryMax === "number" && stagedFilters.salaryMax === 10000 ? "10,000+" : (typeof stagedFilters.salaryMax === "number" ? stagedFilters.salaryMax.toLocaleString() : "10,000")}
                                              </div>
                                              <div className="text-xs text-neutral-500">Max</div>
                                            </div>
                                          </div>
                                          <div className="relative h-6">
                                            <div className="absolute top-2 left-0 w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                                            <div
                                              className="absolute top-2 h-2 bg-primary-600 rounded-full"
                                              style={{
                                                left: `${((typeof stagedFilters.salaryMin === "number" ? stagedFilters.salaryMin : 0) / 10000) * 100}%`,
                                                width: `${((typeof stagedFilters.salaryMax === "number" ? stagedFilters.salaryMax : 10000) - (typeof stagedFilters.salaryMin === "number" ? stagedFilters.salaryMin : 0)) / 10000 * 100}%`,
                                              }}
                                            ></div>
                                            <input
                                              type="range"
                                              min="0"
                                              max={typeof stagedFilters.salaryMax === "number" ? stagedFilters.salaryMax : 10000}
                                              step="100"
                                              value={typeof stagedFilters.salaryMin === "number" ? stagedFilters.salaryMin : 0}
                                              onChange={(e) => {
                                                const maxVal = typeof stagedFilters.salaryMax === "number" ? stagedFilters.salaryMax : 10000;
                                                const newMin = Math.min(parseInt(e.target.value), maxVal);
                                                handleFilterChange("salaryMin", newMin);
                                              }}
                                              className="absolute top-0 left-0 w-full h-6 bg-transparent appearance-none cursor-pointer z-10"
                                              style={{ WebkitAppearance: "none", appearance: "none" }}
                                            />
                                            <input
                                              type="range"
                                              min={typeof stagedFilters.salaryMin === "number" ? stagedFilters.salaryMin : 0}
                                              max="10000"
                                              step="100"
                                              value={typeof stagedFilters.salaryMax === "number" ? stagedFilters.salaryMax : 10000}
                                              onChange={(e) => {
                                                const minVal = typeof stagedFilters.salaryMin === "number" ? stagedFilters.salaryMin : 0;
                                                const newMax = Math.max(parseInt(e.target.value), minVal);
                                                handleFilterChange("salaryMax", newMax);
                                              }}
                                              className="absolute top-0 left-0 w-full h-6 bg-transparent appearance-none cursor-pointer z-10"
                                              style={{ WebkitAppearance: "none", appearance: "none" }}
                                            />
                                          </div>
                                          <div className="flex items-center justify-between mt-2 text-xs text-neutral-500">
                                            <span>$0</span>
                                            <span>$10,000+</span>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              {/* Contract Length */}
                              <div>
                                <button
                                  type="button"
                                  onClick={() => toggleSection('contractLength')}
                                  className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary-600" />
                                    Contract Length
                                  </div>
                                  {expandedSections.contractLength ? (
                                    <ChevronUp className="w-4 h-4 text-neutral-500" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                                  )}
                                </button>
                                <AnimatePresence>
                                  {expandedSections.contractLength && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="flex flex-wrap gap-3">
                                        {["< 6 months", "6–9 months", "9-12 months", "Greater than 12 months"].map((length) => (
                                          <label
                                            key={length}
                                            className="flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-700 rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-600"
                                          >
                                            <input
                                              type="checkbox"
                                              checked={stagedFilters.contractLengths.includes(length)}
                                              onChange={() => handleMultiSelect("contractLengths", length)}
                                              className="rounded"
                                            />
                                            <span className="text-sm">{length}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              {/* More Filters Button */}
                              <div ref={moreFiltersButtonRef} className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                <button
                                  type="button"
                                  onClick={() => setShowMoreFilters(!showMoreFilters)}
                                  className="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                                >
                                  {showMoreFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  {showMoreFilters ? "Hide" : "Show"} More Filters
                                </button>
                              </div>

                              {/* Expandable Filters */}
                              <AnimatePresence>
                                {showMoreFilters && (
                                  <motion.div
                                    ref={expandableFiltersRef}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="space-y-6 pt-4 border-t border-neutral-200 dark:border-neutral-700"
                                  >
                                    {/* Minimum Teaching Experience */}
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => toggleSection('experienceLevel')}
                                        className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Award className="w-4 h-4 text-primary-600" />
                                          Minimum Teaching Experience
                                        </div>
                                        {expandedSections.experienceLevel ? (
                                          <ChevronUp className="w-4 h-4 text-neutral-500" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4 text-neutral-500" />
                                        )}
                                      </button>
                                      <AnimatePresence>
                                        {expandedSections.experienceLevel && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                          >
                                            <div className="space-y-4">
                                              <div className="px-2">
                                                <div className="flex items-center justify-between mb-4">
                                                  <div className="text-center">
                                                    <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                                      {stagedFilters.experienceMin} {stagedFilters.experienceMin === 1 ? 'year' : 'years'}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">Minimum</div>
                                                  </div>
                                                </div>
                                                <div className="relative h-6">
                                                  <div className="absolute top-2 left-0 w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                                                  <div
                                                    className="absolute top-2 h-2 bg-primary-600 rounded-full"
                                                    style={{
                                                      left: '0%',
                                                      width: `${(stagedFilters.experienceMin / 30) * 100}%`,
                                                    }}
                                                  ></div>
                                                  <input
                                                    type="range"
                                                    min="0"
                                                    max="30"
                                                    step="1"
                                                    value={stagedFilters.experienceMin}
                                                    onChange={(e) => handleFilterChange("experienceMin", parseInt(e.target.value))}
                                                    className="absolute top-0 left-0 w-full h-6 bg-transparent appearance-none cursor-pointer z-10"
                                                    style={{ WebkitAppearance: "none", appearance: "none" }}
                                                  />
                                                </div>
                                                <div className="flex items-center justify-between mt-2 text-xs text-neutral-500">
                                                  <span>0 years</span>
                                                  <span>30+ years</span>
                                                </div>
                                              </div>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>

                                    {/* Required Qualifications */}
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => toggleSection('qualifications')}
                                        className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                      >
                                        <div className="flex items-center gap-2">
                                          <GraduationCap className="w-4 h-4 text-primary-600" />
                                          Required Qualifications
                                        </div>
                                        {expandedSections.qualifications ? (
                                          <ChevronUp className="w-4 h-4 text-neutral-500" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4 text-neutral-500" />
                                        )}
                                      </button>
                                      <AnimatePresence>
                                        {expandedSections.qualifications && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                          >
                                            <div className="flex flex-wrap gap-3">
                                              {["Degree required", "TEFL", "TESOL", "CELTA", "DELTA"].map((qual) => (
                                                <label
                                                  key={qual}
                                                  className="flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-700 rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-600"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    checked={stagedFilters.qualifications.includes(qual)}
                                                    onChange={() => handleMultiSelect("qualifications", qual)}
                                                    className="rounded"
                                                  />
                                                  <span className="text-sm">{qual}</span>
                                                </label>
                                              ))}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>

                                    {/* Teaching Context */}
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => toggleSection('teachingContext')}
                                        className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Monitor className="w-4 h-4 text-primary-600" />
                                          Teaching Context
                                        </div>
                                        {expandedSections.teachingContext ? (
                                          <ChevronUp className="w-4 h-4 text-neutral-500" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4 text-neutral-500" />
                                        )}
                                      </button>
                                      <AnimatePresence>
                                        {expandedSections.teachingContext && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                          >
                                            <div className="flex flex-wrap gap-3">
                                              {["Classroom", "Online", "Both"].map((context) => (
                                                <label
                                                  key={context}
                                                  className="flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-700 rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-600"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    checked={stagedFilters.teachingContext.includes(context)}
                                                    onChange={() => handleMultiSelect("teachingContext", context)}
                                                    className="rounded"
                                                  />
                                                  <span className="text-sm">{context}</span>
                                                </label>
                                              ))}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>

                                    {/* Visa Requirement */}
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => toggleSection('visaRequirement')}
                                        className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Globe className="w-4 h-4 text-primary-600" />
                                          Visa Requirement
                                        </div>
                                        {expandedSections.visaRequirement ? (
                                          <ChevronUp className="w-4 h-4 text-neutral-500" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4 text-neutral-500" />
                                        )}
                                      </button>
                                      <AnimatePresence>
                                        {expandedSections.visaRequirement && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                          >
                                            <select
                                              value={stagedFilters.visaRequirement}
                                              onChange={(e) => handleFilterChange("visaRequirement", e.target.value)}
                                              className="input"
                                            >
                                              <option value="">All</option>
                                              <option value="Visa Sponsored">Visa Sponsored</option>
                                              <option value="Visa Assistance">Visa Assistance</option>
                                              <option value="No Visa Support">No Visa Support</option>
                                              <option value="Must Already Have Right to Work">Must Already Have Right to Work</option>
                                            </select>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>

                                    {/* School Type */}
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => toggleSection('schoolType')}
                                        className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                      >
                                        <div className="flex items-center gap-2">
                                          <School className="w-4 h-4 text-primary-600" />
                                          School Type
                                        </div>
                                        {expandedSections.schoolType ? (
                                          <ChevronUp className="w-4 h-4 text-neutral-500" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4 text-neutral-500" />
                                        )}
                                      </button>
                                      <AnimatePresence>
                                        {expandedSections.schoolType && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                          >
                                            <div className="flex flex-wrap gap-3">
                                              {["Language centre", "International school", "Private school", "University", "Public school"].map((type) => (
                                                <label
                                                  key={type}
                                                  className="flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-700 rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-600"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    checked={stagedFilters.schoolTypes.includes(type)}
                                                    onChange={() => handleMultiSelect("schoolTypes", type)}
                                                    className="rounded"
                                                  />
                                                  <span className="text-sm">{type}</span>
                                                </label>
                                              ))}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>

                                    {/* Student Age Group */}
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => toggleSection('studentAgeGroup')}
                                        className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Users className="w-4 h-4 text-primary-600" />
                                          Student Age Group
                                        </div>
                                        {expandedSections.studentAgeGroup ? (
                                          <ChevronUp className="w-4 h-4 text-neutral-500" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4 text-neutral-500" />
                                        )}
                                      </button>
                                      <AnimatePresence>
                                        {expandedSections.studentAgeGroup && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                          >
                                            <div className="flex flex-wrap gap-3">
                                              {["0-5", "6-11", "12-14", "15-18", "19-30", "30+"].map((age) => (
                                                <label
                                                  key={age}
                                                  className="flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-700 rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-600"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    checked={stagedFilters.studentAgeGroups.includes(age)}
                                                    onChange={() => handleMultiSelect("studentAgeGroups", age)}
                                                    className="rounded"
                                                  />
                                                  <span className="text-sm">{age} years</span>
                                                </label>
                                              ))}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>

                                    {/* Start Date */}
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => toggleSection('startDate')}
                                        className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Calendar className="w-4 h-4 text-primary-600" />
                                          Start Date
                                        </div>
                                        {expandedSections.startDate ? (
                                          <ChevronUp className="w-4 h-4 text-neutral-500" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4 text-neutral-500" />
                                        )}
                                      </button>
                                      <AnimatePresence>
                                        {expandedSections.startDate && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                          >
                                            <select
                                              value={stagedFilters.startDate}
                                              onChange={(e) => handleFilterChange("startDate", e.target.value)}
                                              className="input"
                                            >
                                              <option value="">All</option>
                                              <option value="immediate">Immediate</option>
                                              <option value="1-3_months">Next 1–3 months</option>
                                              <option value="greater_than_3_months">{'>'} 3 Months</option>
                                            </select>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>

                                    {/* Application Deadline */}
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => toggleSection('deadline')}
                                        className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Clock className="w-4 h-4 text-primary-600" />
                                          Application Deadline
                                        </div>
                                        {expandedSections.deadline ? (
                                          <ChevronUp className="w-4 h-4 text-neutral-500" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4 text-neutral-500" />
                                        )}
                                      </button>
                                      <AnimatePresence>
                                        {expandedSections.deadline && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                          >
                                            <select
                                              value={stagedFilters.deadlineFilter}
                                              onChange={(e) => handleFilterChange("deadlineFilter", e.target.value)}
                                              className="input"
                                            >
                                              <option value="">All</option>
                                              <option value="closing_soon">Closing soon (≤7 days)</option>
                                              <option value="8-30_days">8–30 days</option>
                                              <option value="rolling">&gt; 30 days</option>
                                            </select>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Sticky Footer with Action Buttons */}
                            <div className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 px-6 py-4 flex items-center justify-between rounded-b-lg flex-shrink-0">
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={clearFilters}
                                className="text-sm"
                              >
                                Clear All Filters
                              </Button>
                              <Button
                                type="button"
                                variant="gradient"
                                onClick={handleSearch}
                              >
                                Apply Filters
                              </Button>
                            </div>
                          </motion.div>
                        </div>
                      </>
                    )}
                  </AnimatePresence>
                  <Button type="submit" variant="gradient">
                    Search
                  </Button>
                  {(activeFilterCount > 0 || searchTerm) && (
                    <Button 
                      type="button" 
                      variant="ghost"
                      onClick={clearAllFiltersAndSearch}
                      className="text-sm"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </form>

              {/* Results Count */}
              <div className="mb-6 flex items-center gap-3">
                <p className="text-neutral-600 dark:text-neutral-400">
                  Found <span className="font-semibold">{totalJobs}</span>{" "}
                  teaching positions
                </p>
                {jobsLoading && (
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    <span>Updating...</span>
                  </div>
                )}
              </div>

              {/* Job Listings - Matching Jobs page exactly */}
              <div className="grid gap-6 max-w-4xl mx-auto">
                {jobsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-8 h-8 animate-spin text-primary-600" />
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                    <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-4">
                      No jobs found matching your criteria
                    </p>
                    <Button onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  jobs.map((job) => {
                    const daysLeft = getDaysUntilDeadline(job.deadline);
                    // Get country flag
                    const countryData = countries.find(
                      (c) => c.name.toLowerCase() === job.country.toLowerCase()
                    );
                    const countryFlag = countryData?.flag || null;
                    
                    return (
                      <motion.div
                        key={job.id}
                        whileHover={{ y: -4 }}
                        onClick={() => handleJobClick(job.id)}
                        className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-xl font-semibold">{job.title}</h2>
                                {job.status === "ACTIVE" && daysLeft <= 7 && (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium">
                                    Closing Soon
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 mb-2">
                                <Building className="w-4 h-4" />
                                <span>{job.school.name}</span>
                                {job.school.verified && (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-2">
                                <span className="flex items-center gap-1">
                                  {countryFlag && <span className="text-base">{countryFlag}</span>}
                                  {job.city}, {job.country}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {job.salary}
                                </span>
                                {(job.type || job.contractLength) && (
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="w-4 h-4" />
                                    {(() => {
                                      const employmentType = job.type
                                        .split("_")
                                        .map(
                                          (word) =>
                                            word.charAt(0).toUpperCase() +
                                            word.slice(1).toLowerCase()
                                        )
                                        .join(" ");
                                      
                                      if (job.contractLength) {
                                        const contractMatch = job.contractLength.match(/(\d+)\s*(year|years|month|months)/i);
                                        if (contractMatch) {
                                          const number = contractMatch[1];
                                          const unit = contractMatch[2].toLowerCase();
                                          const singularUnit = unit === 'years' ? 'year' : unit === 'months' ? 'month' : unit;
                                          return `${number}-${singularUnit.charAt(0).toUpperCase() + singularUnit.slice(1)} ${employmentType}`;
                                        }
                                        return `${job.contractLength} ${employmentType}`;
                                      }
                                      return employmentType;
                                    })()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-center ml-4">
                              <div className="flex items-center gap-1 text-sm text-neutral-500">
                                <Hourglass className="w-4 h-4" />
                                <span className="font-medium">
                                  {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
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
                              {app.job.city}, {app.job.country}
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

                      {/* Interview Request Section */}
                      {(app.interviewRequest || interviewRequests[app.id]) && (
                        <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          {(() => {
                            const interviewReq = normalizeInterviewRequest(app.interviewRequest || interviewRequests[app.id]);
                            if (!interviewReq) return null;
                            const tz = getLocalTimezone();
                            const confirmedSlot =
                              interviewReq.status === "accepted" ? getConfirmedInterviewSlot(interviewReq) : null;
                            const countdown = confirmedSlot ? getCountdownLabel(confirmedSlot) : null;
                            const href = getInterviewLocationHref(interviewReq);
                            
                            return (
                              <>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    <h4 className="font-medium text-purple-900 dark:text-purple-300">
                                      Interview Invitation
                                    </h4>
                                  </div>
                                  {interviewReq.status === "pending" && (
                                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-xs font-medium">
                                      Action Required
                                    </span>
                                  )}
                                  {interviewReq.status === "accepted" && (
                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs font-medium">
                                      Accepted
                                    </span>
                                  )}
                                  {interviewReq.status === "alternative_suggested" && (
                                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full text-xs font-medium">
                                      Alternative Suggested
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-purple-700 dark:text-purple-400 mb-3">
                                  {interviewReq.locationType === "video"
                                    ? "Video Interview"
                                    : interviewReq.locationType === "phone"
                                    ? "Phone Interview"
                                    : "Onsite Interview"}{" "}
                                  - {interviewReq.duration} minutes
                                </p>

                                {/* Location / Join link */}
                                {interviewReq.location && (
                                  <div className="mb-3 text-sm text-purple-800 dark:text-purple-300">
                                    <span className="font-medium">Details:</span>{" "}
                                    {href ? (
                                      <a
                                        href={href}
                                        target={interviewReq.locationType === "video" ? "_blank" : undefined}
                                        rel={interviewReq.locationType === "video" ? "noreferrer" : undefined}
                                        className="underline text-primary-700 dark:text-primary-300 break-all"
                                      >
                                        {interviewReq.locationType === "video"
                                          ? "Join meeting"
                                          : interviewReq.location}
                                      </a>
                                    ) : (
                                      <span className="break-words">{interviewReq.location}</span>
                                    )}
                                  </div>
                                )}

                                {/* Confirmed time + countdown */}
                                {confirmedSlot && (
                                  <div className="mb-3 text-sm text-purple-800 dark:text-purple-300">
                                    <span className="font-medium">Confirmed:</span>{" "}
                                    {formatInterviewSlot(confirmedSlot, tz)}
                                    {countdown ? ` • ${countdown}` : ""}
                                  </div>
                                )}

                                {/* Pending: show the first proposed slot as a hint */}
                                {interviewReq.status === "pending" && interviewReq.timeSlots?.[0] && (
                                  <div className="mb-3 text-sm text-purple-800 dark:text-purple-300">
                                    <span className="font-medium">Next option:</span>{" "}
                                    {formatInterviewSlot(interviewReq.timeSlots[0], tz)}
                                  </div>
                                )}
                                <Button
                                  size="sm"
                                  variant="gradient"
                                  onClick={() => {
                                    setSelectedInterviewRequest({
                                      applicationId: app.id,
                                      interviewRequest: interviewReq,
                                      jobTitle: app.job.title,
                                      schoolName: app.job.school.name,
                                    });
                                    setShowInterviewModal(true);
                                  }}
                                >
                                  {interviewReq.status === "pending"
                                    ? "View & Respond"
                                    : "View Details"}
                                </Button>
                              </>
                            );
                          })()}
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
                                {savedJob.job.city}, {savedJob.job.country}
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
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => navigate(`/jobs/${savedJob.job.id}`)}
                            >
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
                                onClick={() => navigate(`/jobs/${savedJob.job.id}`)}
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

        {/* Interview Invite Response Modal */}
        {showInterviewModal && selectedInterviewRequest && (
          <InterviewInviteResponse
            isOpen={showInterviewModal}
            onClose={() => {
              setShowInterviewModal(false);
              setSelectedInterviewRequest(null);
            }}
            interviewRequest={selectedInterviewRequest.interviewRequest}
            applicationId={selectedInterviewRequest.applicationId}
            jobTitle={selectedInterviewRequest.jobTitle}
            schoolName={selectedInterviewRequest.schoolName}
            teacherTimezone={teacher?.timezone || "UTC"}
            onAccept={async (slotIndex: number) => {
              try {
                const token = localStorage.getItem("authToken");
                if (!token) {
                  throw new Error("No authentication token found");
                }

                const response = await fetch(
                  `/api/applications/${selectedInterviewRequest.applicationId}/interview-response`,
                  {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ selectedSlot: slotIndex }),
                  }
                );

                if (!response.ok) {
                  const error = await response.json().catch(() => ({
                    error: "Failed to accept interview slot",
                  }));
                  throw new Error(error.error || "Failed to accept interview slot");
                }

                // Refresh interview request
                await fetchInterviewRequest(selectedInterviewRequest.applicationId);
                // Refresh teacher profile to update application status
                await fetchTeacherProfile();
              } catch (error) {
                console.error("Error accepting interview slot:", error);
                throw error;
              }
            }}
            onSuggestAlternative={async (alternativeSlot: any) => {
              try {
                const token = localStorage.getItem("authToken");
                if (!token) {
                  throw new Error("No authentication token found");
                }

                const response = await fetch(
                  `/api/applications/${selectedInterviewRequest.applicationId}/interview-response`,
                  {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ alternativeSlot }),
                  }
                );

                if (!response.ok) {
                  const error = await response.json().catch(() => ({
                    error: "Failed to suggest alternative slot",
                  }));
                  throw new Error(
                    error.error || "Failed to suggest alternative slot"
                  );
                }

                // Refresh interview request
                await fetchInterviewRequest(selectedInterviewRequest.applicationId);
              } catch (error) {
                console.error("Error suggesting alternative slot:", error);
                throw error;
              }
            }}
          />
        )}

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
                  {selectedJob.city}, {selectedJob.country}
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

      {/* Messages Modal */}
      <MessagesModal
        isOpen={showMessagesModal}
        onClose={() => setShowMessagesModal(false)}
        onUnreadCountChange={setUnreadMessageCount}
      />
    </div>
  );
};

export default TeacherDashboard;
