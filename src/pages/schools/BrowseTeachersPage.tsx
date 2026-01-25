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
  }, [isAuthenticated, user, navigate, fetchTeachers, fetchSubscriptionStatus]);

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

  const groupedTeachers = groupTeachersByMatchStrength(teachers || []);
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
                            {/* Match Score Ring - positioned around the photo container */}
                            {teacher.matchPercentage !== undefined && (
                              <>
                                <div className="absolute -inset-0.5 z-10" style={{ top: '-2px', left: '-2px' }}>
                                  <MatchScoreRing
                                    percentage={teacher.matchPercentage}
                                    size={68}
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

              {/* Teachers Grid - Grouped by match strength when jobId is present */}
              {showGrouped ? (
                <div className="space-y-12">
                  {/* Strong Matches Section */}
                  {groupedTeachers.strong.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
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
                        <CheckCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
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
                        <CheckCircle className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
                        <h2 className="text-2xl font-bold text-neutral-600 dark:text-neutral-400">
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
