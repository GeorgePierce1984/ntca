import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Building,
  Globe,
  CheckCircle,
  XCircle,
  Eye,
  Users,
  ChevronLeft,
  Briefcase,
  Award,
  Languages,
  FileText,
  Share2,
  Bookmark,
  BookmarkCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Job {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  type: string;
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
  updatedAt: string;
  school: {
    id: string;
    name: string;
    city: string;
    country: string;
    logoUrl?: string;
    verified: boolean;
    description?: string;
    website?: string;
    studentCount?: number;
  };
  _count: {
    applications: number;
  };
  useSchoolProfile?: boolean;
  schoolDescription?: string;
}

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applying, setApplying] = useState(false);
  const [guestForm, setGuestForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    coverLetter: "",
    cv: null as File | null,
    createAccount: false,
  });

  useEffect(() => {
    fetchJobDetails();
    if (user?.userType === "TEACHER") {
      checkIfSaved();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/jobs/${id}/public`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch job details");
      }
      const data = await response.json();
      setJob(data.job);
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast.error("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/teachers/saved-jobs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.savedJobs.some((j: any) => j.id === id));
      }
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  const handleSaveToggle = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.userType !== "TEACHER") {
      toast.error("Only teachers can save jobs");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const method = isSaved ? "DELETE" : "POST";
      const response = await fetch(`/api/teachers/saved-jobs/${id}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsSaved(!isSaved);
        toast.success(
          isSaved ? "Job removed from saved" : "Job saved successfully",
        );
      }
    } catch (error) {
      toast.error("Failed to update saved status");
    }
  };

  const handleApply = () => {
    // Open application form for everyone (both authenticated teachers and guests)
    setShowApplicationForm(true);
  };

  const handleViewApplicants = () => {
    if (!user || user.userType !== "SCHOOL") {
      toast.error("Only schools can view applicants");
      return;
    }

    // Navigate to the school dashboard with the applications tab selected
    navigate(`/schools/dashboard?tab=applications&job=${id}`);
  };

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload PDF, DOC, or DOCX files only");
        return;
      }
      
      setGuestForm({ ...guestForm, cv: file });
    }
  };

  const handleGuestApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);

    try {
      const formData = new FormData();
      formData.append("jobId", id!);
      formData.append("firstName", guestForm.firstName);
      formData.append("lastName", guestForm.lastName);
      formData.append("email", guestForm.email);
      
      if (guestForm.phone) formData.append("phone", guestForm.phone);
      if (guestForm.city) formData.append("city", guestForm.city);
      if (guestForm.country) formData.append("country", guestForm.country);
      if (guestForm.coverLetter) formData.append("coverLetter", guestForm.coverLetter);
      if (guestForm.cv) formData.append("cv", guestForm.cv);

      const response = await fetch("/api/applications/guest", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit application");
      }

      toast.success("Application submitted successfully!");
      setShowApplicationForm(false);
      
      // Reset form
      setGuestForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        city: "",
        country: "",
        coverLetter: "",
        cv: null,
        createAccount: false,
      });

    } catch (error) {
      console.error("Application submission error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Job Not Found</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            This job posting may have been removed or does not exist.
          </p>
          <Button onClick={() => navigate("/jobs")}>Browse Jobs</Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.userType === "SCHOOL" && job.school.id === user.id;
  const canApply = job.status === "ACTIVE" && new Date() < new Date(job.deadline); // Anyone can apply if job is active and not expired

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20">
      <div className="container-custom max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Jobs
        </button>

        {/* Job Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 md:p-8 mb-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-2xl md:text-3xl font-bold">{job.title}</h1>
                {job.status !== "ACTIVE" && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      job.status === "PAUSED"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {job.status}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>{job.school.name}</span>
                  {job.school.verified && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>{job.salary}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Posted {format(new Date(job.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    Deadline: {format(new Date(job.deadline), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>

            {/* Applicants Badge - Now Clickable for School Owners */}
            {isOwner ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleViewApplicants}
                className="flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
              >
                <Eye className="w-5 h-5" />
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {job._count.applications}
                  </div>
                  <div className="text-xs">Applicants</div>
                </div>
              </motion.button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <Eye className="w-5 h-5 text-neutral-500" />
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {job._count.applications}
                  </div>
                  <div className="text-xs text-neutral-500">Applicants</div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            {canApply && (
              <Button onClick={handleApply} variant="gradient" size="lg">
                Apply Now
              </Button>
            )}
            {user?.userType === "TEACHER" && (
              <Button
                onClick={handleSaveToggle}
                variant="secondary"
                leftIcon={
                  isSaved ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )
                }
              >
                {isSaved ? "Saved" : "Save Job"}
              </Button>
            )}
            {isOwner && (
              <>
                <Button
                  onClick={() =>
                    navigate(`/schools/dashboard?tab=jobs&edit=${job.id}`)
                  }
                  variant="secondary"
                >
                  Edit Job
                </Button>
                <Button
                  onClick={handleViewApplicants}
                  variant="secondary"
                  leftIcon={<Users className="w-5 h-5" />}
                >
                  View All Applicants
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              leftIcon={<Share2 className="w-5 h-5" />}
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard!");
              }}
            >
              Share
            </Button>
          </div>
        </motion.div>

        {/* Job Details */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold mb-4">Job Description</h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </motion.div>

            {/* Requirements */}
            {job.requirements && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{job.requirements}</p>
                </div>
              </motion.div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold mb-4">Benefits</h2>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{job.benefits}</p>
                </div>
              </motion.div>
            )}

            {/* About the School */}
            {(job.school.description || job.school.studentCount || job.school.city || job.school.country) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold mb-4">About the School</h2>
                <div className="space-y-4">
                  {/* Location and Size */}
                  <div className="flex flex-wrap gap-6 text-neutral-600 dark:text-neutral-400">
                    {(job.school.city || job.school.country) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-neutral-500" />
                        <span>
                          {job.school.city && job.school.country
                            ? `${job.school.city}, ${job.school.country}`
                            : job.school.city || job.school.country}
                        </span>
                      </div>
                    )}
                    {job.school.studentCount && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-neutral-500" />
                        <span>{job.school.studentCount.toLocaleString()} students</span>
                      </div>
                    )}
                  </div>
                  
                  {/* School Description */}
                  {job.school.description && (
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                        {job.school.description}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Key Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">
                    Employment Type
                  </p>
                  <p className="font-medium">{job.type.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Qualification</p>
                  <p className="font-medium">{job.qualification}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Experience</p>
                  <p className="font-medium">{job.experience}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Language</p>
                  <p className="font-medium">{job.language}</p>
                </div>
                {job.visaRequired && (
                  <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Visa Sponsorship Available
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Kazakhstan Requirements */}
            {(job.teachingLicenseRequired ||
              job.kazakhLanguageRequired ||
              job.localCertificationRequired) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-300">
                    Kazakhstan Teaching Requirements
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {job.teachingLicenseRequired ? (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-neutral-400" />
                    )}
                    <span
                      className={
                        job.teachingLicenseRequired
                          ? "font-medium"
                          : "text-neutral-500"
                      }
                    >
                      Teaching License
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.kazakhLanguageRequired ? (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-neutral-400" />
                    )}
                    <span
                      className={
                        job.kazakhLanguageRequired
                          ? "font-medium"
                          : "text-neutral-500"
                      }
                    >
                      Kazakh Language
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.localCertificationRequired ? (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-neutral-400" />
                    )}
                    <span
                      className={
                        job.localCertificationRequired
                          ? "font-medium"
                          : "text-neutral-500"
                      }
                    >
                      Local Certification
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* School Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold mb-4">About the School</h3>
              <div className="space-y-4">
                {job.school.logoUrl && (
                  <img
                    src={job.school.logoUrl}
                    alt={job.school.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    {job.school.name}
                    {job.school.verified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </h4>
                  <p className="text-sm text-neutral-500">
                    {job.school.city}, {job.school.country}
                  </p>
                </div>
                {job.useSchoolProfile === false && job.schoolDescription ? (
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {job.schoolDescription}
                    </p>
                    <p className="text-xs text-neutral-500 mt-2 italic">
                      * Custom description for this position
                    </p>
                  </div>
                ) : job.school.description ? (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {job.school.description}
                  </p>
                ) : null}
                {job.school.website && (
                  <a
                    href={job.school.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Visit School Website →
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                Apply for {job.title}
              </h2>
              <button
                onClick={() => setShowApplicationForm(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleGuestApplication} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={guestForm.firstName}
                      onChange={(e) => setGuestForm({...guestForm, firstName: e.target.value})}
                      className="input"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={guestForm.lastName}
                      onChange={(e) => setGuestForm({...guestForm, lastName: e.target.value})}
                      className="input"
                      placeholder="Smith"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={guestForm.email}
                    onChange={(e) => setGuestForm({...guestForm, email: e.target.value})}
                    className="input"
                    placeholder="john.smith@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={guestForm.phone}
                    onChange={(e) => setGuestForm({...guestForm, phone: e.target.value})}
                    className="input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={guestForm.city}
                      onChange={(e) => setGuestForm({...guestForm, city: e.target.value})}
                      className="input"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={guestForm.country}
                      onChange={(e) => setGuestForm({...guestForm, country: e.target.value})}
                      className="input"
                      placeholder="United States"
                    />
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cover Letter
                </label>
                <textarea
                  value={guestForm.coverLetter}
                  onChange={(e) => setGuestForm({...guestForm, coverLetter: e.target.value})}
                  className="input"
                  rows={4}
                  placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                />
              </div>

              {/* CV Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload CV/Resume
                </label>
                <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="cv-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCVUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="cv-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <FileText className="w-8 h-8 text-neutral-400" />
                    <span className="text-sm font-medium">
                      {guestForm.cv ? guestForm.cv.name : "Click to upload your CV"}
                    </span>
                    <span className="text-xs text-neutral-500">
                      PDF, DOC, or DOCX (max 10MB)
                    </span>
                  </label>
                </div>
                {guestForm.cv && (
                  <div className="mt-2 flex items-center justify-between bg-neutral-50 dark:bg-neutral-700 p-3 rounded-lg">
                    <span className="text-sm">{guestForm.cv.name}</span>
                    <button
                      type="button"
                      onClick={() => setGuestForm({...guestForm, cv: null})}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Sign up option */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="create-account"
                    checked={guestForm.createAccount}
                    onChange={(e) => setGuestForm({...guestForm, createAccount: e.target.checked})}
                    className="mt-1"
                  />
                  <div>
                    <label htmlFor="create-account" className="text-sm font-medium cursor-pointer">
                      Create an account to save my details
                    </label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                      This will create a teacher profile so you can apply faster to future jobs and track your applications.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowApplicationForm(false)}
                  variant="secondary"
                  disabled={applying}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={applying}
                  className="flex-1"
                >
                  {applying ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
