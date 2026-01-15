import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Filter,
  MapPin,
  GraduationCap,
  Star,
  CheckCircle,
  Globe,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Paywall } from "@/components/paywall/Paywall";
import { TeacherDetailModal } from "@/components/schools/TeacherDetailModal";
import { canAccessPremiumFeatures } from "@/utils/subscription";
import { motion } from "framer-motion";

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  qualification: string;
  experienceYears?: number;
  verified: boolean;
  rating?: number;
  photoUrl?: string;
  subjects: string[];
  languages?: string[];
  availability?: string;
  bio?: string;
  certifications?: string[];
  ageGroups?: string[];
  teachingStyle?: string;
  nativeLanguage?: string;
  currentLocation?: string;
  willingToRelocate?: boolean;
  preferredLocations?: string[];
  visaStatus?: string;
  workAuthorization?: string[];
  startDate?: string;
  education?: Array<{
    degree: string;
    field: string;
    institution: string;
    year: string;
  }>;
  teachingExperience?: Array<{
    schoolName: string;
    country: string;
    startDate: string;
    endDate: string;
    studentAgeGroups: string[];
    subjectsTaught: string[];
    keyAchievements: string;
  }>;
  specializations?: string[];
  previousSchools?: string[];
  achievements?: string[];
  publications?: string[];
  resumeUrl?: string;
  portfolioUrl?: string;
  phone?: string;
  phoneCountryCode?: string;
  email?: string;
}

export const BrowseTeachersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [filters, setFilters] = useState({
    qualification: "",
    experience: "",
    location: "",
  });

  // Fetch subscription status
  const fetchSubscriptionStatus = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token || user?.userType !== "SCHOOL") {
      setSubscriptionLoading(false);
      return;
    }
    
    try {
      const response = await fetch("/api/subscription-details", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data.subscriptionStatus);
      }
    } catch (error) {
      console.error("Error fetching subscription status:", error);
    } finally {
      setSubscriptionLoading(false);
    }
  }, [user]);

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filters.qualification) params.append("qualification", filters.qualification);
      if (filters.experience) params.append("experience_min", filters.experience);
      if (filters.location) params.append("location", filters.location);
      params.append("limit", "50");
      
      const response = await fetch(`/api/teachers/public?${params}`);
      
      if (response.ok) {
        const data = await response.json().catch((err) => {
          console.error("Error parsing JSON:", err);
          return { teachers: [] };
        });
        // Ensure we have a valid array
        if (Array.isArray(data.teachers)) {
          setTeachers(data.teachers);
        } else {
          console.error("Invalid teachers data format:", data);
          setTeachers([]);
        }
      } else {
        const errorText = await response.text().catch(() => response.statusText);
        console.error("Error fetching teachers:", response.status, errorText);
        setError(`Failed to load teachers: ${response.status}`);
        setTeachers([]);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setError(error instanceof Error ? error.message : "Failed to load teachers");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters]);

  useEffect(() => {
    // Check if user is authenticated and is a school
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/schools/browse-teachers" } });
      return;
    }

    if (user?.userType !== "SCHOOL") {
      navigate("/schools/dashboard");
      return;
    }

    // Fetch data on mount
    fetchTeachers();
    fetchSubscriptionStatus();
  }, [isAuthenticated, user, navigate, fetchTeachers, fetchSubscriptionStatus]);

  // Teachers are already filtered by the API, so we can use them directly
  const filteredTeachers = teachers || [];

  // Show loading only on initial load
  if (loading && teachers.length === 0 && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading teachers...</p>
        </div>
      </div>
    );
  }

  if (error && teachers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center max-w-md">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => { setError(null); setLoading(true); fetchTeachers(); }}>Retry</Button>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated or not a school (will redirect)
  if (!isAuthenticated || user?.userType !== "SCHOOL") {
    return null;
  }

  const isBlocked = user?.userType === "SCHOOL" && !canAccessPremiumFeatures(subscriptionStatus, subscriptionLoading);

  return (
    <>
      <Paywall
        isBlocked={isBlocked}
        featureName="Browse Teachers"
        description="Subscribe to unlock access to our verified teacher database and find the perfect candidates for your school."
      >
        <div className="min-h-screen pt-20 bg-neutral-50 dark:bg-neutral-900">
          <div className="section">
            <div className="container-custom">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <h1 className="heading-1 mb-4">Browse Qualified Teachers</h1>
                <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
                  Find the perfect teacher for your school from our verified pool of
                  professionals
                </p>
              </motion.div>

              {/* Search and Filters */}
              <div className="max-w-4xl mx-auto mb-8">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search teachers by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                  <Button
                    variant="secondary"
                    leftIcon={<Filter className="w-4 h-4" />}
                  >
                    Filters
                  </Button>
                </div>
              </div>

              {/* Teachers Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(filteredTeachers) && filteredTeachers.length > 0 ? filteredTeachers.map((teacher) => (
                  <motion.div
                    key={teacher.id}
                    whileHover={{ y: -4 }}
                    className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      setSelectedTeacher(teacher);
                      setShowTeacherModal(true);
                    }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          {teacher.photoUrl ? (
                            <img
                              src={teacher.photoUrl}
                              alt={`${teacher.firstName} ${teacher.lastName}`}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                              <span className="text-xl font-semibold text-primary-600 dark:text-primary-400">
                                {teacher.firstName?.[0] || ""}
                                {teacher.lastName?.[0] || ""}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              {teacher.firstName} {teacher.lastName}
                              {teacher.verified && (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              )}
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              {teacher.qualification || "No qualification listed"}
                            </p>
                          </div>
                        </div>
                        {teacher.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">
                              {teacher.rating}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {teacher.city || "Unknown"}, {teacher.country || "Unknown"}
                          </span>
                        </div>
                        {teacher.experienceYears && (
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            <span>{teacher.experienceYears} years experience</span>
                          </div>
                        )}
                        {teacher.languages && Array.isArray(teacher.languages) && teacher.languages.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            <span>{teacher.languages.join(", ")}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-500">
                            {teacher.availability ? `Available: ${teacher.availability}` : "Availability: Not specified"}
                          </span>
                          <ChevronRight className="w-5 h-5 text-neutral-400" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )) : null}
              </div>

              {!loading && filteredTeachers && filteredTeachers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-neutral-600 dark:text-neutral-400">
                    No teachers found matching your search criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Paywall>

      {/* Teacher Detail Modal */}
      <TeacherDetailModal
        isOpen={showTeacherModal}
        onClose={() => {
          setShowTeacherModal(false);
          setSelectedTeacher(null);
        }}
        teacher={selectedTeacher}
      />
    </>
  );
};
