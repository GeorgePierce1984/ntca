import React, { useState, useEffect } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  qualification: string;
  experienceYears: number;
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

    fetchTeachers();
    fetchSubscriptionStatus();
  }, [isAuthenticated, user, navigate]);

  // Fetch subscription status
  const fetchSubscriptionStatus = async () => {
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
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      // For now, show mock data
      setTeachers([
        {
          id: "1",
          firstName: "Sarah",
          lastName: "Johnson",
          city: "London",
          country: "UK",
          qualification: "CELTA, MA Applied Linguistics",
          experienceYears: 5,
          verified: true,
          rating: 4.8,
          subjects: ["English", "IELTS Preparation"],
          languages: ["English", "Spanish"],
          availability: "Immediate",
          bio: "Experienced English language teacher with a passion for helping students achieve their language learning goals. Specialized in IELTS preparation and academic English. I have taught students from diverse backgrounds and age groups, from young learners to adult professionals.",
          certifications: ["CELTA", "MA Applied Linguistics", "TEFL"],
          ageGroups: ["Teens", "Adults"],
          teachingStyle: "Communicative approach with focus on practical language use",
          nativeLanguage: "English",
          currentLocation: "London, UK",
          willingToRelocate: true,
          preferredLocations: ["Central Asia", "Southeast Asia"],
          visaStatus: "Available for sponsorship",
          workAuthorization: ["UK", "EU"],
          education: [
            {
              degree: "Master of Arts",
              field: "Applied Linguistics",
              institution: "University of London",
              year: "2018",
            },
            {
              degree: "Bachelor of Arts",
              field: "English Literature",
              institution: "University of Manchester",
              year: "2015",
            },
          ],
          teachingExperience: [
            {
              schoolName: "British Council",
              country: "UK",
              startDate: "Jan 2019",
              endDate: "Present",
              studentAgeGroups: ["Adults"],
              subjectsTaught: ["IELTS Preparation", "Business English"],
              keyAchievements: "Achieved 95% pass rate for IELTS students, developed specialized curriculum for business English courses",
            },
            {
              schoolName: "International Language School",
              country: "Spain",
              startDate: "Sep 2017",
              endDate: "Dec 2018",
              studentAgeGroups: ["Teens", "Adults"],
              subjectsTaught: ["General English", "Conversational English"],
              keyAchievements: "Taught classes of up to 20 students, improved student retention by 30%",
            },
          ],
          specializations: ["IELTS Preparation", "Academic Writing", "Business English"],
          achievements: ["Teacher of the Year 2020", "Published research paper on language acquisition"],
          resumeUrl: "https://example.com/resume-sarah-johnson.pdf",
          email: "sarah.johnson@example.com",
          phone: "1234567890",
          phoneCountryCode: "+44",
        },
        {
          id: "2",
          firstName: "Michael",
          lastName: "Chen",
          city: "Singapore",
          country: "Singapore",
          qualification: "DELTA, BA English Literature",
          experienceYears: 8,
          verified: true,
          rating: 4.9,
          subjects: ["Business English", "Academic Writing"],
          languages: ["English", "Mandarin"],
          availability: "1 month notice",
          bio: "Dedicated English teacher with extensive experience in business and academic contexts. Passionate about creating engaging learning environments and helping students develop both language skills and cultural awareness. Strong background in curriculum development and teacher training.",
          certifications: ["DELTA", "BA English Literature", "TESOL", "CELTA"],
          ageGroups: ["Adults"],
          teachingStyle: "Task-based learning with emphasis on real-world application",
          nativeLanguage: "English",
          currentLocation: "Singapore",
          willingToRelocate: true,
          preferredLocations: ["Central Asia", "China", "Japan"],
          visaStatus: "Singapore PR",
          workAuthorization: ["Singapore", "China"],
          education: [
            {
              degree: "Bachelor of Arts",
              field: "English Literature",
              institution: "National University of Singapore",
              year: "2014",
            },
          ],
          teachingExperience: [
            {
              schoolName: "Singapore International School",
              country: "Singapore",
              startDate: "Jan 2016",
              endDate: "Present",
              studentAgeGroups: ["Adults"],
              subjectsTaught: ["Business English", "Academic Writing", "Presentation Skills"],
              keyAchievements: "Led teacher training workshops, developed award-winning business English curriculum",
            },
            {
              schoolName: "Language Academy",
              country: "China",
              startDate: "Mar 2014",
              endDate: "Dec 2015",
              studentAgeGroups: ["Adults"],
              subjectsTaught: ["General English", "Business English"],
              keyAchievements: "Taught over 500 students, maintained 98% student satisfaction rate",
            },
          ],
          specializations: ["Business English", "Academic Writing", "Teacher Training"],
          achievements: ["Outstanding Teacher Award 2021", "Published 3 articles on language teaching"],
          resumeUrl: "https://example.com/resume-michael-chen.pdf",
          portfolioUrl: "https://example.com/portfolio-michael-chen",
          email: "michael.chen@example.com",
          phone: "9876543210",
          phoneCountryCode: "+65",
        },
      ]);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.qualification.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()));

    // Qualification filter - show all if empty
    const matchesQualification = filters.qualification === "" || 
      teacher.qualification.toLowerCase().includes(filters.qualification.toLowerCase());

    // Experience filter - show all if empty
    const matchesExperience = filters.experience === "" || 
      teacher.experienceYears >= parseInt(filters.experience);

    // Location filter - show all if empty
    const matchesLocation = filters.location === "" ||
      teacher.city.toLowerCase().includes(filters.location.toLowerCase()) ||
      teacher.country.toLowerCase().includes(filters.location.toLowerCase());

    return matchesSearch && matchesQualification && matchesExperience && matchesLocation;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
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
            {filteredTeachers.map((teacher) => (
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
                            {teacher.firstName[0]}
                            {teacher.lastName[0]}
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
                          {teacher.qualification}
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
                        {teacher.city}, {teacher.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      <span>{teacher.experienceYears} years experience</span>
                    </div>
                    {teacher.languages && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>{teacher.languages.join(", ")}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-500">
                        Available: {teacher.availability}
                      </span>
                      <ChevronRight className="w-5 h-5 text-neutral-400" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredTeachers.length === 0 && (
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
