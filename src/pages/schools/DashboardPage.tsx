import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
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
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

import { ApplicantModal } from "@/components/schools/ApplicantModal";
import {
  InterviewScheduleModal,
  InterviewData,
} from "@/components/schools/InterviewScheduleModal";
import { SubscriptionWarningBanner } from "@/components/schools/SubscriptionWarningBanner";
import { MessagesModal } from "@/components/messages/MessagesModal";
import { PostJobModal } from "@/components/schools/PostJobModal";
import { ProfileCompletionModal } from "@/components/schools/ProfileCompletionModal";
import { Paywall } from "@/components/paywall/Paywall";
import { canAccessPremiumFeatures } from "@/utils/subscription";
import toast from "react-hot-toast";

// Types
interface JobPosting {
  id: string;
  title: string;
  subjectsTaught?: string;
  studentAgeGroupMin?: number;
  studentAgeGroupMax?: number;
  startDate?: string;
  contractLength?: string;
  city: string;
  country: string;
  salary: string;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT";
  status: "ACTIVE" | "PAUSED" | "CLOSED";
  deadline: string;
  teachingHoursPerWeek?: string;
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
  useSchoolBenefits?: boolean;
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
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  // Initialize activeTab from URL parameter if present
  const getInitialTab = (): "overview" | "jobs" | "applicants" => {
    return 'overview';
  };
  
  const [activeTab, setActiveTab] = useState<
    "overview" | "jobs" | "applicants"
  >(getInitialTab());
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(
    null,
  );
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApplicantForInterview, setSelectedApplicantForInterview] =
    useState<Application | null>(null);

  // Add refs for post job form and heading
  const postJobFormRef = useRef<HTMLDivElement>(null);
  const postJobHeadingRef = useRef<HTMLHeadingElement>(null);
  

  // Add job form state
  const [jobForm, setJobForm] = useState({
    title: "",
    subjectsTaught: "",
    studentAgeGroupMin: undefined as number | undefined,
    studentAgeGroupMax: undefined as number | undefined,
    startDate: "",
    contractLength: "",
    contractMonths: undefined as number | string | undefined,
    contractYears: undefined as number | string | undefined,
    city: "",
    country: "",
    employmentType: "",
    salary: "",
    deadline: "",
    teachingHoursPerWeek: "",
    description: "",
    qualifications: "",
    benefits: "",
    useSchoolProfile: true,
    schoolDescription: "",
    useSchoolBenefits: true,
    teachingLicenseRequired: false,
    kazakhLanguageRequired: false,
    localCertificationRequired: false,
    // Financial benefits
    housingProvided: false,
    flightReimbursement: false,
    visaWorkPermitSupport: false,
    contractCompletionBonus: false,
    paidHolidays: false,
    overtimePay: false,
    // Lifestyle & Wellbeing
    paidAnnualLeave: false,
    nationalHolidays: false,
    sickLeave: false,
    healthInsurance: false,
    relocationSupport: false,
    // Professional Support
    teachingMaterialsProvided: false,
    curriculumGuidance: false,
    teacherTraining: false,
    promotionOpportunities: false,
    contractRenewalOptions: false,
    // Requirements - Essential
    nativeEnglishLevel: false,
    bachelorsDegree: false,
    bachelorsDegreeSubject: "",
    tefl: false,
    celta: false,
    tesol: false,
    delta: false,
    minimumTeachingExperience: "",
    // Requirements - Preferred
    ieltsExperience: false,
    cambridgeExperience: false,
    satExperience: false,
    classroomExperience: false,
    onlineExperience: false,
    centralAsiaExperience: false,
    // Requirements - Legal
    visaSupport: "",
    backgroundCheckRequired: false,
  });

  // Real data state
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [schoolProfile, setSchoolProfile] = useState<{ 
    description?: string;
    studentAgeRangeMin?: number;
    studentAgeRangeMax?: number;
    benefits?: string;
    coverPhotoUrl?: string;
    logoUrl?: string;
    profileComplete?: boolean;
    completionPercentage?: number;
  } | null>(null);

  // Add job modal state
  const [showJobModal, setShowJobModal] = useState(false);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [selectedJobForEdit, setSelectedJobForEdit] = useState<JobPosting | null>(null);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProfileCompletionModal, setShowProfileCompletionModal] = useState(false);
  const [fullSchoolData, setFullSchoolData] = useState<any>(null);

  // Calculate stats from real data
  const totalJobs = jobs.length;
  // Helper function to check if a job deadline has passed
  const isDeadlinePassed = (deadline: string): boolean => {
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(23, 59, 59, 999); // End of deadline day
    const now = new Date();
    return now > deadlineDate;
  };

  // Helper function to get effective job status (considers deadline)
  const getEffectiveStatus = (job: JobPosting): "ACTIVE" | "PAUSED" | "CLOSED" => {
    if (job.status === "CLOSED" || job.status === "PAUSED") {
      return job.status;
    }
    // If status is ACTIVE but deadline has passed, treat as CLOSED
    if (isDeadlinePassed(job.deadline)) {
      return "CLOSED";
    }
    return job.status;
  };

  const activeJobs = jobs.filter((job) => getEffectiveStatus(job) === "ACTIVE").length;
  const totalApplicants = applications.length;
  const pendingApplications = applications.filter(
    (app) => app.status === "APPLIED" || app.status === "REVIEWING",
  ).length;

  // Define tabs with badge for Post Job to make it more visible
  const tabs = [
    { key: "overview", label: "Overview", icon: Eye },
    { key: "jobs", label: "Job Postings", icon: Briefcase },
    { key: "applicants", label: "Applicants", icon: Users },
    { key: "messages", label: "Message Center", icon: MessageSquare },
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

  // Fetch subscription status
  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch("/api/subscription-details", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data.subscriptionStatus);
        setSubscriptionEndDate(data.subscriptionEndDate);
      }
    } catch (error) {
      console.error("Error fetching subscription status:", error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // Fetch school profile to check if description exists
  const fetchSchoolProfile = async () => {
    try {
      const response = await fetch("/api/schools/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSchoolProfile(data.school);
        setFullSchoolData(data.school);
        
        // Check if we should show the profile completion modal
        // Show on first dashboard load if completion < 100% and modal hasn't been dismissed
        const completionDismissed = sessionStorage.getItem("profileCompletionModalDismissed");
        const justActivated = sessionStorage.getItem("justActivated") === "true";
        const completionPercentage = data.school?.completionPercentage ?? 0;
        
        console.log("Profile completion check:", {
          justActivated,
          completionDismissed,
          completionPercentage,
          hasSchool: !!data.school,
          schoolName: data.school?.name,
          shouldShow: data.school && (justActivated || !completionDismissed) && completionPercentage < 100
        });
        
        // Show modal if:
        // 1. User just activated (always show for new accounts, regardless of completion % or dismissed flag), OR
        // 2. Modal hasn't been dismissed AND completion < 100%
        // For newly activated accounts, clear the dismissed flag to ensure modal shows
        if (justActivated && completionDismissed) {
          console.log("Newly activated account - clearing dismissed flag");
          sessionStorage.removeItem("profileCompletionModalDismissed");
        }
        
        const shouldShowModal = data.school && (
          justActivated || // Always show for newly activated accounts (regardless of dismissed flag)
          (!completionDismissed && completionPercentage < 100) // Or show if not dismissed and incomplete
        );
        
        if (shouldShowModal) {
          console.log("Setting up modal display...");
          // Ensure fullSchoolData is set first
          setFullSchoolData(data.school);
          
          // Use requestAnimationFrame to ensure DOM is ready, then setTimeout for state updates
          requestAnimationFrame(() => {
            setTimeout(() => {
              setShowProfileCompletionModal(true);
              console.log("Profile completion modal should now be visible");
              // Clear the justActivated flag after showing (but don't set dismissed yet)
              if (justActivated) {
                sessionStorage.removeItem("justActivated");
              }
            }, 500); // Increased timeout to ensure all state is set
          });
        } else {
          console.log("Modal not showing - conditions not met", {
            hasSchool: !!data.school,
            justActivated,
            completionDismissed,
            completionPercentage,
            shouldShow: shouldShowModal
          });
        }
      }
    } catch (error) {
      console.error("Error fetching school profile:", error);
    }
  };

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

  // Check for URL query parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'post-job') {
      setShowPostJobModal(true);
      // Clear the query parameter from URL
      window.history.replaceState({}, '', '/schools/dashboard');
    }
  }, []);

  useEffect(() => {
    // Check for justActivated flag immediately on mount
    const justActivated = sessionStorage.getItem("justActivated") === "true";
    if (justActivated) {
      console.log("justActivated flag detected on mount");
    }
    
    // Fetch school profile first (critical for header layout)
    fetchSchoolProfile();
    // Then fetch other data in parallel
    fetchJobs();
    fetchApplications();
    fetchSubscriptionStatus();
    fetchUnreadMessageCount();
    
    // Only fetch when user switches back to the tab (not on intervals)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User switched back to the tab - refresh data
        fetchUnreadMessageCount();
        // Optionally refresh other data too
        fetchJobs();
        fetchApplications();
      }
    };
    
    // Listen for tab visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Pre-populate student age group and benefits from school profile when opening post-job modal
  useEffect(() => {
    if (showPostJobModal && schoolProfile && !selectedJobForEdit) {
      // Only pre-populate if form is empty (new job, not editing)
      if (!jobForm.studentAgeGroupMin && !jobForm.studentAgeGroupMax && schoolProfile.studentAgeRangeMin && schoolProfile.studentAgeRangeMax) {
        setJobForm(prev => ({
          ...prev,
          studentAgeGroupMin: schoolProfile.studentAgeRangeMin,
          studentAgeGroupMax: schoolProfile.studentAgeRangeMax,
        }));
      }
      
      // Pre-populate benefits from school profile when form opens and useSchoolBenefits is false
      // This allows schools to see their defaults even when not using school profile benefits
      if (schoolProfile?.benefits && !jobForm.useSchoolBenefits) {
        try {
          const parsedBenefits: any = JSON.parse(schoolProfile.benefits);
          setJobForm(prev => ({
            ...prev,
            housingProvided: parsedBenefits.housingProvided || false,
            flightReimbursement: parsedBenefits.flightReimbursement || false,
            visaWorkPermitSupport: parsedBenefits.visaWorkPermitSupport || false,
            contractCompletionBonus: parsedBenefits.contractCompletionBonus || false,
            paidHolidays: parsedBenefits.paidHolidays || false,
            overtimePay: parsedBenefits.overtimePay || false,
            paidAnnualLeave: parsedBenefits.paidAnnualLeave || false,
            nationalHolidays: parsedBenefits.nationalHolidays || false,
            sickLeave: parsedBenefits.sickLeave || false,
            healthInsurance: parsedBenefits.healthInsurance || false,
            relocationSupport: parsedBenefits.relocationSupport || false,
            teachingMaterialsProvided: parsedBenefits.teachingMaterialsProvided || false,
            curriculumGuidance: parsedBenefits.curriculumGuidance || false,
            teacherTraining: parsedBenefits.teacherTraining || false,
            promotionOpportunities: parsedBenefits.promotionOpportunities || false,
            contractRenewalOptions: parsedBenefits.contractRenewalOptions || false,
          }));
        } catch (e) {
          // If parsing fails, keep existing values
        }
      }
    }
  }, [showPostJobModal, schoolProfile, selectedJobForEdit, jobForm.useSchoolBenefits]);

  // Helper function to parse contract length string into months and years
  const parseContractLength = (contractLength: string | null | undefined): { months: number | string | undefined, years: number | string | undefined } => {
    if (!contractLength || contractLength === "N/A") {
      return { months: undefined, years: undefined };
    }
    
    let months: number | string | undefined = undefined;
    let years: number | string | undefined = undefined;
    
    // Try to match patterns like "2 year(s) 3 month(s)" or "1 year(s)" or "6 month(s)"
    const yearMatch = contractLength.match(/(\d+)\s+year/i);
    const monthMatch = contractLength.match(/(\d+)\s+month/i);
    
    if (yearMatch) {
      years = parseInt(yearMatch[1]);
    }
    if (monthMatch) {
      months = parseInt(monthMatch[1]);
    }
    
    return { months, years };
  };

  // Function to open Post Job Modal
  const handlePostNewJobClick = () => {
    setShowPostJobModal(true);
    toast.success("Let's create a new job posting!", {
      icon: "📝",
      duration: 2000,
    });
  };

  // Job editing functions
  const openEditModal = (job: JobPosting) => {
    setSelectedJobForEdit(job);
    // Parse benefits JSON if it exists
    let parsedBenefits: any = {};
    if (job.benefits) {
      try {
        parsedBenefits = JSON.parse(job.benefits);
      } catch (e) {
        // If not JSON, keep as empty object
      }
    }
    // Parse requirements JSON if it exists
    let parsedRequirements: any = {};
    if (job.requirements) {
      try {
        parsedRequirements = JSON.parse(job.requirements);
      } catch (e) {
        // If not JSON, keep as empty object
      }
    }
    
    // Parse contract length
    const { months: contractMonths, years: contractYears } = parseContractLength(job.contractLength);
    
    setJobForm({
      title: job.title,
      subjectsTaught: job.subjectsTaught || "",
      studentAgeGroupMin: job.studentAgeGroupMin,
      studentAgeGroupMax: job.studentAgeGroupMax,
      startDate: job.startDate ? job.startDate.split('T')[0] : "",
      contractLength: job.contractLength || "",
      contractMonths: contractMonths,
      contractYears: contractYears,
      city: job.city,
      country: job.country || "",
      employmentType: job.type,
      salary: job.salary,
      deadline: job.deadline.split('T')[0],
      teachingHoursPerWeek: job.teachingHoursPerWeek ? String(job.teachingHoursPerWeek) : "",
      description: job.description,
      qualifications: job.qualification,
      benefits: typeof job.benefits === 'string' && !job.benefits.startsWith('{') ? job.benefits : "",
      useSchoolProfile: job.useSchoolProfile,
      schoolDescription: job.schoolDescription || "",
      useSchoolBenefits: job.useSchoolBenefits !== undefined ? job.useSchoolBenefits : true,
      teachingLicenseRequired: job.teachingLicenseRequired,
      kazakhLanguageRequired: job.kazakhLanguageRequired,
      localCertificationRequired: job.localCertificationRequired,
      // Financial benefits
      housingProvided: parsedBenefits.housingProvided || false,
      flightReimbursement: parsedBenefits.flightReimbursement || false,
      visaWorkPermitSupport: parsedBenefits.visaWorkPermitSupport || "No Visa Support",
      contractCompletionBonus: parsedBenefits.contractCompletionBonus || false,
      paidHolidays: parsedBenefits.paidHolidays || false,
      overtimePay: parsedBenefits.overtimePay || false,
      // Lifestyle & Wellbeing
      paidAnnualLeave: parsedBenefits.paidAnnualLeave || false,
      nationalHolidays: parsedBenefits.nationalHolidays || false,
      sickLeave: parsedBenefits.sickLeave || false,
      healthInsurance: parsedBenefits.healthInsurance || false,
      relocationSupport: parsedBenefits.relocationSupport || false,
      // Professional Support
      teachingMaterialsProvided: parsedBenefits.teachingMaterialsProvided || false,
      curriculumGuidance: parsedBenefits.curriculumGuidance || false,
      teacherTraining: parsedBenefits.teacherTraining || false,
      promotionOpportunities: parsedBenefits.promotionOpportunities || false,
      contractRenewalOptions: parsedBenefits.contractRenewalOptions || false,
      // Requirements - Essential
      nativeEnglishLevel: parsedRequirements.nativeEnglishLevel || false,
      bachelorsDegree: parsedRequirements.bachelorsDegree || false,
      bachelorsDegreeSubject: parsedRequirements.bachelorsDegreeSubject || "",
      tefl: parsedRequirements.tefl || false,
      celta: parsedRequirements.celta || false,
      tesol: parsedRequirements.tesol || false,
      delta: parsedRequirements.delta || false,
      minimumTeachingExperience: parsedRequirements.minimumTeachingExperience || "",
      // Requirements - Preferred
      ieltsExperience: parsedRequirements.ieltsExperience || false,
      cambridgeExperience: parsedRequirements.cambridgeExperience || false,
      satExperience: parsedRequirements.satExperience || false,
      classroomExperience: parsedRequirements.classroomExperience || false,
      onlineExperience: parsedRequirements.onlineExperience || false,
      centralAsiaExperience: parsedRequirements.centralAsiaExperience || false,
      // Requirements - Legal
      visaSupport: parsedRequirements.visaSupport || "No Visa Support",
      backgroundCheckRequired: parsedRequirements.backgroundCheckRequired || false,
    });
    setShowPostJobModal(true);
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
    
    // Check job limit for non-subscribed schools (max 1 job)
    if (!canAccessPremiumFeatures(subscriptionStatus, subscriptionLoading)) {
      const activeJobCount = jobs.filter((job) => getEffectiveStatus(job) === "ACTIVE").length;
      if (activeJobCount >= 1 && !selectedJobForEdit) {
        toast.error("Free accounts can post up to 1 job. Subscribe to post unlimited jobs and access premium features.", {
          duration: 6000,
          icon: "🔒",
        });
        // Open the choose plan modal
        setShowPostJobModal(false);
        // You can add logic here to show ChoosePlanModal
        return;
      }
    }
    
    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    
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
          subjectsTaught: jobForm.subjectsTaught,
          studentAgeGroupMin: jobForm.studentAgeGroupMin,
          studentAgeGroupMax: jobForm.studentAgeGroupMax,
          startDate: jobForm.startDate,
          contractLength: jobForm.contractLength,
          description: jobForm.description,
          city: jobForm.city,
          country: jobForm.country,
          salary: jobForm.salary,
          type: jobForm.employmentType,
          deadline: jobForm.deadline,
          teachingHoursPerWeek: jobForm.teachingHoursPerWeek,
          qualification: jobForm.qualifications,
          benefits: JSON.stringify({
            // Financial
            housingProvided: jobForm.housingProvided,
            flightReimbursement: jobForm.flightReimbursement,
            visaWorkPermitSupport: jobForm.visaWorkPermitSupport,
            contractCompletionBonus: jobForm.contractCompletionBonus,
            paidHolidays: jobForm.paidHolidays,
            overtimePay: jobForm.overtimePay,
            // Lifestyle & Wellbeing
            paidAnnualLeave: jobForm.paidAnnualLeave,
            nationalHolidays: jobForm.nationalHolidays,
            sickLeave: jobForm.sickLeave,
            healthInsurance: jobForm.healthInsurance,
            relocationSupport: jobForm.relocationSupport,
            // Professional Support
            teachingMaterialsProvided: jobForm.teachingMaterialsProvided,
            curriculumGuidance: jobForm.curriculumGuidance,
            teacherTraining: jobForm.teacherTraining,
            promotionOpportunities: jobForm.promotionOpportunities,
            contractRenewalOptions: jobForm.contractRenewalOptions,
          }),
          requirements: JSON.stringify({
            // Essential
            nativeEnglishLevel: jobForm.nativeEnglishLevel,
            bachelorsDegree: jobForm.bachelorsDegree,
            bachelorsDegreeSubject: jobForm.bachelorsDegreeSubject,
            tefl: jobForm.tefl,
            celta: jobForm.celta,
            tesol: jobForm.tesol,
            delta: jobForm.delta,
            minimumTeachingExperience: jobForm.minimumTeachingExperience,
            // Preferred
            ieltsExperience: jobForm.ieltsExperience,
            cambridgeExperience: jobForm.cambridgeExperience,
            satExperience: jobForm.satExperience,
            classroomExperience: jobForm.classroomExperience,
            onlineExperience: jobForm.onlineExperience,
            centralAsiaExperience: jobForm.centralAsiaExperience,
            // Legal
            visaSupport: jobForm.visaSupport,
            backgroundCheckRequired: jobForm.backgroundCheckRequired,
          }),
          useSchoolProfile: jobForm.useSchoolProfile,
          schoolDescription: jobForm.schoolDescription,
          useSchoolBenefits: jobForm.useSchoolBenefits,
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
        // Reset form with pre-populated student age group from school profile
        setJobForm({
          title: "",
          subjectsTaught: "",
          studentAgeGroupMin: schoolProfile?.studentAgeRangeMin,
          studentAgeGroupMax: schoolProfile?.studentAgeRangeMax,
          startDate: "",
          contractLength: "",
          city: "",
          country: "",
          employmentType: "",
          salary: "",
          deadline: "",
          teachingHoursPerWeek: "",
          description: "",
          qualifications: "",
          benefits: "",
          useSchoolProfile: true,
          schoolDescription: "",
          useSchoolBenefits: true,
          teachingLicenseRequired: false,
          kazakhLanguageRequired: false,
          localCertificationRequired: false,
          // Financial benefits
          housingProvided: false,
          flightReimbursement: false,
          visaWorkPermitSupport: false,
          contractCompletionBonus: false,
          paidHolidays: false,
          overtimePay: false,
          // Lifestyle & Wellbeing
          paidAnnualLeave: false,
          nationalHolidays: false,
          sickLeave: false,
          healthInsurance: false,
          relocationSupport: false,
          // Professional Support
          teachingMaterialsProvided: false,
          curriculumGuidance: false,
          teacherTraining: false,
          promotionOpportunities: false,
          contractRenewalOptions: false,
          // Requirements - Essential
          nativeEnglishLevel: false,
          bachelorsDegree: false,
          bachelorsDegreeSubject: "",
          tefl: false,
          celta: false,
          tesol: false,
          delta: false,
          minimumTeachingExperience: "",
          // Requirements - Preferred
          ieltsExperience: false,
          cambridgeExperience: false,
          satExperience: false,
          classroomExperience: false,
          onlineExperience: false,
          centralAsiaExperience: false,
          // Requirements - Legal
          visaSupport: "",
          backgroundCheckRequired: false,
          // Contract length fields
          contractMonths: undefined,
          contractYears: undefined,
        });
        setSelectedJobForEdit(null);
        setShowPostJobModal(false);
        // Refresh jobs list and school profile (in case description was updated)
        fetchJobs();
        fetchSchoolProfile();
        // Switch to jobs tab to show the updated listing
        setActiveTab('jobs');
      } else {
        const error = await response.json();
        
        // Handle subscription expired error
        if (error.error === "Subscription expired" || error.error === "Active subscription required") {
          toast.error(
            <div>
              <p className="font-medium">{error.error}</p>
              <p className="text-sm mt-1">{error.message}</p>
              <button
                onClick={() => window.location.href = error.redirectUrl || '/schools/subscription'}
                className="text-primary-600 hover:text-primary-700 underline text-sm mt-2 block"
              >
                {error.redirectUrl?.includes('subscription') ? 'Renew Subscription →' : 'View Plans →'}
              </button>
            </div>,
            { duration: 8000 }
          );
          // Refresh subscription status
          fetchSubscriptionStatus();
        } else {
          // Suppress "Missing required fields" error message
          if (error.error && error.error.toLowerCase().includes('missing required fields')) {
            // Don't show toast for this error
            return;
          }
          toast.error(error.error || 'Failed to save job');
        }
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="min-h-screen pt-[85px]">
      <div className="pb-4">
        <div className="container-custom">
          {/* Subscription Warning Banner */}
          <SubscriptionWarningBanner
            subscriptionStatus={subscriptionStatus || undefined}
            subscriptionEndDate={subscriptionEndDate || undefined}
            dismissed={bannerDismissed}
            onDismiss={() => setBannerDismissed(true)}
          />

          {/* Profile Completion Bar */}
          {schoolProfile && schoolProfile.completionPercentage !== undefined && schoolProfile.completionPercentage < 100 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-4 mb-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Complete your profile to attract more applicants
                  </span>
                </div>
                <span className="text-sm font-bold text-primary-600">
                  {schoolProfile.completionPercentage}%
                </span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all"
                  style={{ width: `${schoolProfile.completionPercentage}%` }}
                />
              </div>
              <button
                onClick={() => setShowProfileCompletionModal(true)}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                Complete your profile →
              </button>
            </motion.div>
          )}

          {/* Header */}
          <div className="mb-8 relative overflow-hidden rounded-xl">
            {/* Cover Photo Background with Fade */}
            {schoolProfile?.coverPhotoUrl && (
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${schoolProfile.coverPhotoUrl})`,
                  height: '200px',
                  bottom: 0,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-neutral-900 via-white/80 dark:via-neutral-900/80 to-transparent" />
              </div>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 min-h-[200px]"
            >
              <div className="flex items-start gap-6 flex-1">
                {/* School Logo/Profile Photo - Always reserve space */}
                <div className="flex-shrink-0 pt-1">
                  {schoolProfile?.logoUrl ? (
                    <img
                      src={schoolProfile.logoUrl}
                      alt="School Logo"
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white dark:border-neutral-800 shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-neutral-200 dark:bg-neutral-700 border-4 border-white dark:border-neutral-800" />
                  )}
                </div>
                
                {/* Text Content - Always in same position */}
                <div className="flex-1">
                  <h1 className="heading-3 mb-2">
                    Welcome back,
                    <br />
                    {user?.school?.name 
                      ? user.school.name.split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                        ).join(' ')
                      : "School"}
                  </h1>
                  <p className="text-base text-neutral-600 dark:text-neutral-400">
                    Manage your job postings and applicants
                  </p>
                </div>
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
          </div>

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
                    </div>
                    <div className="text-2xl font-bold mb-1">{activeJobs}</div>
                    <div className="text-sm text-neutral-500">
                      Active Job Posts
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

          {/* Mobile Navigation Grid - Responsive */}
          <div className="mb-8">
            {/* Desktop Tabs - Hidden on mobile */}
            <div className="hidden md:block">
              <div className="border-b border-neutral-200 dark:border-neutral-800">
                <nav className="flex space-x-8 items-center justify-between">
                  <div className="flex space-x-8">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.key;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => {
                            if (tab.key === "profile") {
                              window.location.href = "/schools/profile";
                            } else if (tab.key === "messages") {
                              setShowMessagesModal(true);
                            } else {
                              setActiveTab(tab.key as "overview" | "jobs" | "applicants");
                            }
                          }}
                          className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            isActive
                              ? "border-primary-500 text-primary-600 dark:text-primary-400"
                              : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300"
                          }`}
                        >
                          <div className="relative">
                            <Icon className="w-5 h-5" />
                            {tab.key === "messages" && unreadMessageCount > 0 && (
                              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                                {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                              </span>
                            )}
                          </div>
                          {tab.label}
                          {tab.badge && (
                            <span className="ml-1 px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-full">
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
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
                        if (tab.key === "profile") {
                          window.location.href = "/schools/profile";
                        } else if (tab.key === "messages") {
                          setShowMessagesModal(true);
                        } else {
                          setActiveTab(tab.key as "overview" | "jobs" | "applicants");
                        }
                      }}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                        isActive
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`relative p-2 rounded-lg ${
                          isActive 
                            ? "bg-primary-100 dark:bg-primary-900/30" 
                            : "bg-neutral-100 dark:bg-neutral-700"
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isActive 
                              ? "text-primary-600 dark:text-primary-400" 
                              : "text-neutral-600 dark:text-neutral-400"
                          }`} />
                          {tab.key === "messages" && unreadMessageCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                              {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                            </span>
                          )}
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
                          className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                          onClick={() => openEditModal(job)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg mb-1">
                                {job.title}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-neutral-500 mb-2">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {job.city}, {job.country}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {job.salary}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getEffectiveStatus(job))}`}
                                >
                                  {getEffectiveStatus(job)}
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
                  <Paywall
                    isBlocked={!canAccessPremiumFeatures(subscriptionStatus, subscriptionLoading)}
                    featureName="Recent Applicants"
                    description="Subscribe to view and manage applicants for your job postings."
                  >
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
                  </Paywall>
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
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getEffectiveStatus(job))}`}
                            >
                              {getEffectiveStatus(job)}
                            </span>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4 text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.city}, {job.country}
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

                          {/* Teaching requirements */}
                          {(job.teachingLicenseRequired || job.kazakhLanguageRequired || job.localCertificationRequired) && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-1">
                                <Globe className="w-4 h-4" />
                                Teaching Requirements
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
                                    Local Language
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
                          {getEffectiveStatus(job) === "ACTIVE" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateJobStatus(job.id, "PAUSED")}
                              title="Pause job posting"
                            >
                              Pause
                            </Button>
                          )}
                          {getEffectiveStatus(job) === "PAUSED" && (
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
              <Paywall
                isBlocked={!canAccessPremiumFeatures(subscriptionStatus, subscriptionLoading)}
                featureName="Applicants Management"
                description="Subscribe to view and manage applicants for your job postings, schedule interviews, and make hiring decisions."
              >
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
              </Paywall>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Post Job Modal */}
      <PostJobModal
        isOpen={showPostJobModal}
        onClose={() => {
          setShowPostJobModal(false);
          setSelectedJobForEdit(null);
          // Reset form when closing
          setJobForm({
            title: "",
            subjectsTaught: "",
            studentAgeGroupMin: schoolProfile?.studentAgeRangeMin,
            studentAgeGroupMax: schoolProfile?.studentAgeRangeMax,
            startDate: "",
            contractLength: "",
            contractMonths: undefined,
            contractYears: undefined,
            city: "",
            country: "",
            employmentType: "",
            salary: "",
            deadline: "",
            teachingHoursPerWeek: "",
            description: "",
            qualifications: "",
            benefits: "",
            useSchoolProfile: true,
            schoolDescription: "",
            useSchoolBenefits: true,
            teachingLicenseRequired: false,
            kazakhLanguageRequired: false,
            localCertificationRequired: false,
            // Financial benefits
            housingProvided: false,
            flightReimbursement: false,
            visaWorkPermitSupport: false,
            contractCompletionBonus: false,
            paidHolidays: false,
            overtimePay: false,
            // Lifestyle & Wellbeing
            paidAnnualLeave: false,
            nationalHolidays: false,
            sickLeave: false,
            healthInsurance: false,
            relocationSupport: false,
            // Professional Support
            teachingMaterialsProvided: false,
            curriculumGuidance: false,
            teacherTraining: false,
            promotionOpportunities: false,
            contractRenewalOptions: false,
            // Requirements - Essential
            nativeEnglishLevel: false,
            bachelorsDegree: false,
            bachelorsDegreeSubject: "",
            tefl: false,
            celta: false,
            tesol: false,
            delta: false,
            minimumTeachingExperience: "",
            // Requirements - Preferred
            ieltsExperience: false,
            cambridgeExperience: false,
            satExperience: false,
            classroomExperience: false,
            onlineExperience: false,
            centralAsiaExperience: false,
            // Requirements - Legal
            visaSupport: "",
            backgroundCheckRequired: false,
          });
        }}
        jobForm={jobForm}
        setJobForm={setJobForm}
        handleJobSubmit={handleJobSubmit}
        subscriptionStatus={subscriptionStatus}
        schoolProfile={schoolProfile}
        selectedJobForEdit={selectedJobForEdit}
      />

      {/* Applicant Modal */}
      <ApplicantModal
        applicant={selectedApplicant}
        isOpen={showApplicantModal}
        onClose={() => {
          setShowApplicantModal(false);
          setSelectedApplicant(null);
        }}
        onStatusUpdate={updateApplicantStatus}
        subscriptionStatus={subscriptionStatus}
        jobTitle={
          selectedApplicant
            ? jobs.find((j) => j.id === selectedApplicant.jobId)?.title
            : ""
        }
      />

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={showProfileCompletionModal}
        onClose={() => {
          setShowProfileCompletionModal(false);
          sessionStorage.setItem("profileCompletionModalDismissed", "true");
        }}
        school={fullSchoolData}
        onUpdate={() => {
          fetchSchoolProfile();
        }}
      />
      
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 text-xs rounded z-[100] font-mono">
          <div>Modal Open: {showProfileCompletionModal ? 'Yes' : 'No'}</div>
          <div>Has School Data: {fullSchoolData ? 'Yes' : 'No'}</div>
          <div>Just Activated: {typeof window !== 'undefined' && sessionStorage.getItem("justActivated") === "true" ? 'Yes' : 'No'}</div>
          <div>Completion: {fullSchoolData?.completionPercentage ?? 'N/A'}%</div>
        </div>
      )}

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

      {/* Job Edit Modal - Now using PostJobModal (removed old modal) */}

      {/* Messages Modal */}
      <MessagesModal
        isOpen={showMessagesModal}
        onClose={() => setShowMessagesModal(false)}
        onUnreadCountChange={setUnreadMessageCount}
      />
    </div>
  );
};
