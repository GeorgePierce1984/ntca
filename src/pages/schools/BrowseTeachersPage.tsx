import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Award,
  Languages,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Paywall } from "@/components/paywall/Paywall";
import { TeacherDetailModal } from "@/components/schools/TeacherDetailModal";
import { MatchScoreRing } from "@/components/schools/MatchScoreRing";
import { canAccessPremiumFeatures } from "@/utils/subscription";
import { motion } from "framer-motion";
import { getCountryByName } from "@/data/countries";

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
  nationality?: string;
  languageSkills?: Record<string, string>;
  matchPercentage?: number; // Added for match scoring
}

export const BrowseTeachersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [minMatchPercentage, setMinMatchPercentage] = useState(0);
  
  // Round to nearest 10 for odometer increments
  const roundedMinPercentage = Math.floor(minMatchPercentage / 10) * 10;
  
  // Job match data state
  const [jobDetails, setJobDetails] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [jobMatchData, setJobMatchData] = useState<{
    totalMatches: number;
    byStrength: {
      strong: number;
      medium: number;
      partial: number;
    };
  } | null>(null);
  const [loadingJobMatchData, setLoadingJobMatchData] = useState(false);
  
  // Get URL parameters for match filtering
  const jobId = searchParams.get("jobId");
  const matchStrength = searchParams.get("matchStrength"); // "strong", "medium", "partial"

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

  // Fetch job details and match data
  const fetchJobDetailsAndMatches = useCallback(async (jobId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token available for fetching job details");
      return;
    }

    console.log("Fetching job details and matches for jobId:", jobId);
    setLoadingJobMatchData(true);
    try {
      // Fetch job details
      const jobResponse = await fetch(`/api/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (jobResponse.ok) {
        const jobData = await jobResponse.json();
        console.log("Job details fetched:", jobData);
        setJobDetails({
          id: jobData.job.id,
          title: jobData.job.title,
        });
      } else {
        const errorText = await jobResponse.text();
        console.error("Failed to fetch job details:", jobResponse.status, errorText);
      }

      // Fetch match data
      const matchResponse = await fetch(`/api/jobs/${jobId}/matches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (matchResponse.ok) {
        const matchData = await matchResponse.json();
        console.log("Match data fetched:", matchData);
        setJobMatchData({
          totalMatches: matchData.totalMatches || 0,
          byStrength: matchData.byStrength || {
            strong: 0,
            medium: 0,
            partial: 0,
          },
        });
      } else {
        const errorText = await matchResponse.text();
        console.error("Failed to fetch match data:", matchResponse.status, errorText);
      }
    } catch (error) {
      console.error("Error fetching job details and matches:", error);
      // Log more details for debugging
      if (error instanceof Error) {
        console.error("Error details:", error.message, error.stack);
      }
    } finally {
      setLoadingJobMatchData(false);
    }
  }, []);

  // Fetch match data for teachers if jobId is provided
  const fetchTeacherMatches = useCallback(async (teacherIds: string[], jobId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return {};

    try {
      // Fetch matches for the job
      const response = await fetch(`/api/jobs/${jobId}/matches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Create a map of teacherId -> match percentage
        const matchMap: Record<string, number> = {};
        
        // The matches array contains teacher matches
        if (data.matches && Array.isArray(data.matches)) {
          data.matches.forEach((match: any) => {
            // We need to match by teacher ID - the API returns teacherId
            // But we need to check if the API returns full teacher data or just IDs
            // For now, we'll need to enhance the API to return teacher IDs with match percentages
          });
        }
        
        return matchMap;
      }
    } catch (error) {
      console.error("Error fetching teacher matches:", error);
    }
    
    return {};
  }, []);

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
        let fetchedTeachers: Teacher[] = [];
        if (Array.isArray(data.teachers)) {
          fetchedTeachers = data.teachers;
        } else {
          console.error("Invalid teachers data format:", data);
          fetchedTeachers = [];
        }
        
        // If jobId is provided, fetch match data and filter by match strength
        if (jobId) {
          const token = localStorage.getItem("authToken");
          try {
            const matchResponse = await fetch(`/api/jobs/${jobId}/matches`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            
            if (matchResponse.ok) {
              const matchData = await matchResponse.json();
              
              // Create a map of teacherId -> matchPercentage
              const teacherMatchMap: Record<string, number> = {};
              
              if (matchData.matches && Array.isArray(matchData.matches)) {
                matchData.matches.forEach((match: any) => {
                  if (match.teacherId && match.matchStrength !== undefined) {
                    teacherMatchMap[match.teacherId] = match.matchStrength;
                  }
                });
              }
              
              // Add match percentages to teachers
              fetchedTeachers = fetchedTeachers.map(teacher => ({
                ...teacher,
                matchPercentage: teacherMatchMap[teacher.id],
              }));
              
              // Filter teachers based on match strength if specified
              if (matchStrength) {
                const minPercentage = matchStrength === "strong" ? 80 : matchStrength === "medium" ? 60 : 40;
                const maxPercentage = matchStrength === "strong" ? 100 : matchStrength === "medium" ? 79 : 59;
                
                fetchedTeachers = fetchedTeachers.filter(teacher => {
                  const matchPct = teacher.matchPercentage;
                  return matchPct !== undefined && matchPct >= minPercentage && matchPct <= maxPercentage;
                });
              } else {
                // If no match strength filter, only show teachers with matches
                fetchedTeachers = fetchedTeachers.filter(teacher => teacher.matchPercentage !== undefined);
              }
            }
          } catch (matchError) {
            console.error("Error fetching matches:", matchError);
          }
        }
        
        setTeachers(fetchedTeachers);
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
  }, [searchTerm, filters, jobId, matchStrength]);

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
    
    // If jobId is present, fetch job details and match data
    if (jobId) {
      console.log("jobId found in URL, fetching job details:", jobId);
      fetchJobDetailsAndMatches(jobId);
    } else {
      console.log("No jobId in URL");
    }
  }, [isAuthenticated, user, navigate, fetchTeachers, fetchSubscriptionStatus, jobId, fetchJobDetailsAndMatches]);

  // Filter teachers by match percentage range when jobId is present
  const filteredTeachersByRange = React.useMemo(() => {
    if (!jobId) {
      return teachers || [];
    }
    return (teachers || []).filter(teacher => {
      const matchPct = teacher.matchPercentage;
      if (matchPct === undefined) return false;
      return matchPct >= roundedMinPercentage && matchPct <= 100;
    });
  }, [teachers, jobId, roundedMinPercentage]);

  // Group teachers by match strength when jobId is present
  const groupTeachersByMatchStrength = (teachersList: Teacher[]) => {
    if (!jobId) {
      return { strong: [], medium: [], partial: [], ungrouped: teachersList };
    }

    const grouped = {
      strong: [] as Teacher[],
      medium: [] as Teacher[],
      partial: [] as Teacher[],
      ungrouped: [] as Teacher[],
    };

    teachersList.forEach(teacher => {
      const matchPct = teacher.matchPercentage;
      if (matchPct === undefined) {
        grouped.ungrouped.push(teacher);
      } else if (matchPct >= 80) {
        grouped.strong.push(teacher);
      } else if (matchPct >= 60) {
        grouped.medium.push(teacher);
      } else if (matchPct >= 40) {
        grouped.partial.push(teacher);
      } else {
        grouped.ungrouped.push(teacher);
      }
    });

    return grouped;
  };

  const groupedTeachers = groupTeachersByMatchStrength(filteredTeachersByRange);
  const showGrouped = jobId && !matchStrength; // Show grouped view when jobId present but no specific strength filter

  // Helper function to render teacher card
  const renderTeacherCard = (teacher: Teacher) => {
    const getNationalityFlag = () => {
      if (!teacher.nationality) return null;
      const country = getCountryByName(teacher.nationality);
      return country?.flag || null;
    };

    const hasCertification = (certName: string) => {
      if (!teacher.certifications || teacher.certifications.length === 0) return false;
      return teacher.certifications.some(cert => 
        cert.toLowerCase().includes(certName.toLowerCase())
      );
    };

    const hasDegree = () => {
      if (!teacher.education || teacher.education.length === 0) return false;
      return teacher.education.some((edu: any) => {
        if (!edu?.degree) return false;
        const degree = edu.degree.toLowerCase();
        return degree.includes("bachelor") || degree.includes("master") || degree.includes("phd") || degree.includes("degree");
      });
    };

    const getQualification = () => {
      if (!teacher.education || teacher.education.length === 0) return null;
      const degree = teacher.education.find((edu: any) => {
        if (!edu?.degree) return false;
        const deg = edu.degree.toLowerCase();
        return deg.includes("bachelor") || deg.includes("master") || deg.includes("phd") || deg.includes("degree");
      });
      if (degree?.degree) return degree.degree;
      return teacher.education[0]?.degree || null;
    };

    const isNativeEnglish = () => {
      if (teacher.nativeLanguage?.toLowerCase().includes('english')) return true;
      if (teacher.languageSkills && typeof teacher.languageSkills === 'object') {
        const englishLevel = (teacher.languageSkills as Record<string, string>)['English']?.toLowerCase();
        return englishLevel === 'native' || englishLevel === 'near-native' || englishLevel === 'near native';
      }
      return false;
    };

    const calculatePreferredAgeRange = () => {
      if (!teacher.ageGroups || teacher.ageGroups.length === 0) return null;
      return teacher.ageGroups.join(", ");
    };

    return (
      <motion.div
        key={teacher.id}
        whileHover={{ y: -4 }}
        className="card p-6 cursor-pointer hover:shadow-lg transition-all duration-200"
        onClick={() => {
          setSelectedTeacher(teacher);
          setShowTeacherModal(true);
        }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
                          <div className="relative flex-shrink-0">
                            {/* Match Score Ring - positioned around the photo container with gap */}
                            {teacher.matchPercentage !== undefined && (
                              <>
                                <div className="absolute z-10" style={{ top: '-10px', left: '-10px' }}>
                                  <MatchScoreRing
                                    percentage={teacher.matchPercentage}
                                    size={84}
                                    strokeWidth={3}
                                    showText={false}
                                  />
                                </div>
                                {/* Percentage text - top left outside image */}
                                <div 
                                  className="absolute -top-1 -left-1 z-20 bg-white dark:bg-neutral-800 rounded-full px-1.5 py-0.5 border border-neutral-200 dark:border-neutral-700 shadow-sm"
                                  style={{ 
                                    color: teacher.matchPercentage >= 80 ? '#22c55e' : teacher.matchPercentage >= 60 ? '#eab308' : '#9ca3af',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    lineHeight: '1'
                                  }}
                                >
                                  {Math.round(teacher.matchPercentage)}%
                                </div>
                              </>
                            )}
                            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center relative z-0">
                              {teacher.photoUrl ? (
                                <img
                                  src={teacher.photoUrl}
                                  alt={`${teacher.firstName} ${teacher.lastName}`}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                              )}
                            </div>
                          </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {getNationalityFlag() && (
                  <span className="text-xl">{getNationalityFlag()}</span>
                )}
                <h4 className="font-semibold text-lg truncate">
                  {teacher.firstName} {teacher.lastName}
                </h4>
                {teacher.verified && (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {teacher.city || "Unknown"}, {teacher.country || "Unknown"}
              </p>
              {teacher.experienceYears !== undefined && teacher.experienceYears !== null && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  {teacher.experienceYears} {teacher.experienceYears === 1 ? 'Year' : 'Years'} Experience
                </p>
              )}
              {calculatePreferredAgeRange() && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Ages: {calculatePreferredAgeRange()}
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

          {teacher.availability && (
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Available: {teacher.availability}
                </span>
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

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
              {/* Job Match Header - Show when jobId is present */}
              {jobId && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <div className="card p-6">
                    {/* Debug info - remove in production */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mb-4 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded text-xs">
                        Debug: jobId={jobId}, jobDetails={jobDetails ? 'loaded' : 'null'}, 
                        loading={loadingJobMatchData ? 'yes' : 'no'}, 
                        matchData={jobMatchData ? 'loaded' : 'null'}
                      </div>
                    )}
                    
                    {/* Job Title */}
                    {jobDetails ? (
                      <h2 className="heading-2 mb-6">{jobDetails.title}</h2>
                    ) : loadingJobMatchData ? (
                      <div className="mb-6">
                        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                      </div>
                    ) : (
                      <h2 className="heading-2 mb-6">Loading job details...</h2>
                    )}
                    
                    {/* Match Insights */}
                    {loadingJobMatchData ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-neutral-300 dark:border-neutral-600 border-t-neutral-600 dark:border-t-neutral-400"></div>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          Calculating matches...
                        </span>
                      </div>
                    ) : jobMatchData ? (
                      <>
                        {/* Headline - Top Left */}
                        <div className="flex justify-start mb-4">
                          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                            Matches Found: {jobMatchData.totalMatches}
                          </h4>
                        </div>

                        {/* Match Category Boxes - Bottom Left */}
                        <div className="flex items-center justify-start gap-3">
                          {/* Strong Matches Box */}
                          <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                              {jobMatchData.byStrength.strong}
                            </span>
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                              Strong
                            </span>
                          </div>

                          {/* Good Matches Box */}
                          <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
                            <CheckCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                            <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                              {jobMatchData.byStrength.medium}
                            </span>
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                              Good
                            </span>
                          </div>

                          {/* Partial Matches Box */}
                          <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                            <CheckCircle className="w-4 h-4 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                            <span className="text-lg font-bold text-neutral-600 dark:text-neutral-400">
                              {jobMatchData.byStrength.partial}
                            </span>
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                              Partial
                            </span>
                          </div>
                        </div>
                      </>
                    ) : !loadingJobMatchData ? (
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        No match data available
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              )}

              {/* Default Header - Show when no jobId */}
              {!jobId && (
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
              )}

              {/* Match Percentage Semi-Circular Dial Filter - Show when jobId is present */}
              {jobId ? (
                <div className="max-w-4xl mx-auto mb-8">
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Filter by Minimum Match Percentage
                      </label>
                      <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                        {roundedMinPercentage}% - 100%
                      </span>
                    </div>
                    
                    {/* Semi-Circular Dial Gauge */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-full max-w-lg mb-6">
                        <svg className="w-full h-64" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
                          <defs>
                            <linearGradient id="dialGradient" x1="0%" y1="100%" x2="100%" y1="100%">
                              <stop offset="0%" stopColor="#ef4444" /> {/* Red - bottom left */}
                              <stop offset="30%" stopColor="#f97316" /> {/* Orange */}
                              <stop offset="50%" stopColor="#eab308" /> {/* Yellow */}
                              <stop offset="70%" stopColor="#fbbf24" /> {/* Light Yellow */}
                              <stop offset="100%" stopColor="#22c55e" /> {/* Green - top right */}
                            </linearGradient>
                          </defs>
                          
                          {/* Background semi-circle - goes from left (180°) to right (0°) counter-clockwise */}
                          <path
                            d="M 50 180 A 150 150 0 0 0 350 180"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="20"
                            strokeLinecap="round"
                            className="dark:stroke-neutral-700"
                          />
                          
                          {/* Color-coded segments - filled from left to right */}
                          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((value) => {
                            // Convert percentage to angle: 0% = 180° (left), 100% = 0° (right)
                            // Angles go counter-clockwise from left to right
                            const startAngle = 180 - (value / 100) * 180;
                            const endAngle = 180 - ((value + 10) / 100) * 180;
                            
                            const radius = 150;
                            const centerX = 200;
                            const centerY = 180;
                            
                            // Calculate start and end points on the arc
                            const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
                            const startY = centerY - radius * Math.sin((startAngle * Math.PI) / 180);
                            const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
                            const endY = centerY - radius * Math.sin((endAngle * Math.PI) / 180);
                            
                            // Color for this segment
                            let segmentColor = '';
                            if (value <= 30) {
                              segmentColor = '#ef4444'; // red
                            } else if (value <= 50) {
                              segmentColor = '#f97316'; // orange
                            } else if (value <= 70) {
                              segmentColor = '#eab308'; // yellow
                            } else {
                              segmentColor = '#22c55e'; // green
                            }
                            
                            const isSelected = roundedMinPercentage <= value;
                            const isActive = roundedMinPercentage === value;
                            
                            if (!isSelected) return null;
                            
                            // Draw arc segment following the curve from left to right (counter-clockwise, matching background)
                            // Each segment is 18 degrees (180/10), so large arc flag is always 0
                            return (
                              <path
                                key={value}
                                d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 0 ${endX} ${endY}`}
                                fill="none"
                                stroke={segmentColor}
                                strokeWidth={isActive ? "24" : "20"}
                                strokeLinecap="round"
                                className="transition-all duration-200"
                                style={{
                                  filter: isActive ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none',
                                }}
                              />
                            );
                          })}
                          
                          {/* Segment dividers - full lines through the arc */}
                          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((value) => {
                            const angle = 180 - (value / 100) * 180;
                            const radius = 150;
                            const centerX = 200;
                            const centerY = 180;
                            
                            // Calculate points on the arc
                            const x1 = centerX + radius * Math.cos((angle * Math.PI) / 180);
                            const y1 = centerY - radius * Math.sin((angle * Math.PI) / 180);
                            
                            // Extend line through center and beyond
                            const lineLength = radius + 30; // Extend beyond the arc
                            const x2 = centerX + lineLength * Math.cos((angle * Math.PI) / 180);
                            const y2 = centerY - lineLength * Math.sin((angle * Math.PI) / 180);
                            
                            return (
                              <line
                                key={`divider-${value}`}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke="#ffffff"
                                strokeWidth="2"
                                opacity="0.6"
                              />
                            );
                          })}
                          
                          {/* Percentage labels at key points */}
                          {[0, 25, 50, 75, 100].map((value) => {
                            const angle = 180 - (value / 100) * 180;
                            const radius = 140; // Position labels slightly outside the arc
                            const centerX = 200;
                            const centerY = 180;
                            
                            const x = centerX + radius * Math.cos((angle * Math.PI) / 180);
                            const y = centerY - radius * Math.sin((angle * Math.PI) / 180);
                            
                            const isEmphasized = value === 0 || value === 50 || value === 100;
                            
                            return (
                              <text
                                key={`label-${value}`}
                                x={x}
                                y={y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={isEmphasized ? "#1f2937" : "#9ca3af"}
                                className="dark:fill-neutral-300 dark:fill-neutral-500"
                                fontSize={isEmphasized ? "16" : "12"}
                                fontWeight={isEmphasized ? "bold" : "normal"}
                                opacity={isEmphasized ? "1" : "0.7"}
                                style={{
                                  pointerEvents: 'none',
                                  userSelect: 'none',
                                }}
                              >
                                {value}%
                              </text>
                            );
                          })}
                        </svg>
                        
                        {/* Clickable area for selecting percentage */}
                        <div className="absolute inset-0">
                          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((value) => {
                            const angle = 180 - (value / 100) * 180;
                            const radius = 120;
                            const centerX = 200;
                            const centerY = 180;
                            
                            const x = centerX + radius * Math.cos((angle * Math.PI) / 180);
                            const y = centerY - radius * Math.sin((angle * Math.PI) / 180);
                            
                            return (
                              <button
                                key={value}
                                onClick={() => setMinMatchPercentage(value)}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200"
                                style={{
                                  left: `${(x / 400) * 100}%`,
                                  top: `${(y / 200) * 100}%`,
                                }}
                                title={`Filter: ${value}% - 100%`}
                              />
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Current selection display */}
                      <div className="text-center mt-4">
                        <div className="text-3xl font-bold mb-1" style={{
                          color: roundedMinPercentage <= 30 ? '#ef4444' : 
                                 roundedMinPercentage <= 50 ? '#f97316' : 
                                 roundedMinPercentage <= 70 ? '#eab308' : '#22c55e'
                        }}>
                          {roundedMinPercentage}%
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          Minimum Match Threshold
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-sm text-neutral-600 dark:text-neutral-400 text-center">
                      Showing <span className="font-semibold text-neutral-900 dark:text-neutral-100">{filteredTeachersByRange.length}</span> of <span className="font-semibold text-neutral-900 dark:text-neutral-100">{teachers.length}</span> matches
                    </div>
                  </div>
                </div>
              ) : (
                /* Search and Filters - Show when no jobId */
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
              )}

              {/* Teachers Grid - Grouped by match strength when jobId is present */}
              {showGrouped ? (
                <div className="space-y-12">
                  {/* Strong Matches Section */}
                  {groupedTeachers.strong.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <h2 className="text-lg font-semibold text-green-600 dark:text-green-400">
                          Strong Matches ({groupedTeachers.strong.length})
                        </h2>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupedTeachers.strong.map((teacher) => {
                          return renderTeacherCard(teacher);
                        })}
                      </div>
                    </div>
                  )}

                  {/* Good Matches Section */}
                  {groupedTeachers.medium.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <CheckCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <h2 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                          Good Matches ({groupedTeachers.medium.length})
                        </h2>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupedTeachers.medium.map((teacher) => {
                          return renderTeacherCard(teacher);
                        })}
                      </div>
                    </div>
                  )}

                  {/* Partial Matches Section */}
                  {groupedTeachers.partial.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <CheckCircle className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                        <h2 className="text-lg font-semibold text-neutral-600 dark:text-neutral-400">
                          Partial Matches ({groupedTeachers.partial.length})
                        </h2>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupedTeachers.partial.map((teacher) => {
                          return renderTeacherCard(teacher);
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.isArray(filteredTeachers) && filteredTeachers.length > 0 ? filteredTeachers.map((teacher) => {
                    return renderTeacherCard(teacher);
                  }) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-neutral-500 dark:text-neutral-400">No teachers found matching your criteria.</p>
                    </div>
                  )}
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
