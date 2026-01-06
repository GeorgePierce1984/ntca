import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MessagesModal } from "@/components/messages/MessagesModal";
import { getCountryByName } from "@/data/countries";

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
  const [profileFetchAttempted, setProfileFetchAttempted] = useState(false);
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
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

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

  useEffect(() => {
    // Initial data fetch on page load
    fetchTeacherProfile();
    fetchJobs();
    fetchSavedJobs();
    fetchUnreadMessageCount();
    
    // Only fetch when user switches back to the tab (not on intervals)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User switched back to the tab - refresh data
        fetchUnreadMessageCount();
        // Optionally refresh other data too
        fetchJobs();
        fetchSavedJobs();
      }
    };
    
    // Listen for tab visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (activeTab === "jobs") {
      fetchJobs();
    }
  }, [searchTerm, locationFilter, typeFilter, sortBy, currentPage]);

  const fetchTeacherProfile = async () => {
    setProfileFetchAttempted(true);
    
    try {
      const response = await fetch("/api/teachers/profile", {
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
            const retryResponse = await fetch("/api/teachers/profile", {
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
          const retryResponse = await fetch("/api/teachers/profile", {
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
              <Link to="/teachers/profile">
                <Button
                  variant="gradient"
                  leftIcon={<User className="w-4 h-4" />}
                  className="w-32"
                  glow
                >
                  Profile
                </Button>
              </Link>
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
              { key: "profile", label: "Profile", icon: User, isProfileLink: true },
              { key: "jobs", label: "Browse Jobs", icon: Search },
              { key: "applications", label: "My Applications", icon: Send },
              { key: "saved", label: "Saved Jobs", icon: Heart },
              { key: "messages", label: "Message Center", icon: MessageSquare, isLink: true },
            ].map(({ key, label, icon: Icon, isLink, isProfileLink }) => (
              isProfileLink ? (
                <Link
                  key={key}
                  to="/teachers/profile"
                  className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {label}
                  </div>
                </Link>
              ) : (
                <button
                  key={key}
                  onClick={() => {
                    if (isLink) {
                      setShowMessagesModal(true);
                    } else {
                      setActiveTab(key as any);
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
              )
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
                  <Link to="/teachers/profile">
                    <Button
                      variant="ghost"
                      size="sm"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
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
                          {app.job.city}, {app.job.country}
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
                              {job.city}, {job.country}
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

    </div>
  );
};

export default TeacherDashboard;
