import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  GraduationCap,
  Star,
  CheckCircle,
  Globe,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  FileText,
  Award,
  BookOpen,
  Languages,
  User,
  Clock,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getCountryByName } from "@/data/countries";

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
  nationality?: string;
}

interface TeacherDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
}

export const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({
  isOpen,
  onClose,
  teacher,
}) => {
  if (!teacher) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  {teacher.photoUrl ? (
                    <img
                      src={teacher.photoUrl}
                      alt={`${teacher.firstName} ${teacher.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <span className="text-2xl font-semibold text-primary-600 dark:text-primary-400">
                        {teacher.firstName[0]}
                        {teacher.lastName[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      {teacher.nationality && (() => {
                        const country = getCountryByName(teacher.nationality);
                        return country?.flag ? <span className="text-2xl">{country.flag}</span> : null;
                      })()}
                      {teacher.firstName} {teacher.lastName}
                      {teacher.verified && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {teacher.qualification}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Key Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  {teacher.rating && (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="font-medium">{teacher.rating} Rating</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-neutral-400" />
                    <span>
                      {teacher.city}, {teacher.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-neutral-400" />
                    <span>{teacher.experienceYears} years experience</span>
                  </div>
                  {teacher.availability && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-neutral-400" />
                      <span>Available: {teacher.availability}</span>
                    </div>
                  )}
                </div>

                {/* Subjects */}
                {teacher.subjects && teacher.subjects.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Subjects Taught
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {teacher.subjects.map((subject, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {teacher.bio && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      About
                    </h3>
                    <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                      {teacher.bio}
                    </p>
                  </div>
                )}

                {/* Languages */}
                {teacher.languages && teacher.languages.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {teacher.languages.map((language, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Age Groups */}
                {teacher.ageGroups && teacher.ageGroups.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Age Groups
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {teacher.ageGroups.map((ageGroup, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                        >
                          {ageGroup}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Qualifications - Certifications (CELTA, DELTA, TESOL, TEFL) and Education (Masters, Bachelors, PhD) */}
                {(() => {
                  // Check certifications array
                  const hasCertInArray = (certName: string) => {
                    if (!teacher.certifications || teacher.certifications.length === 0) return false;
                    return teacher.certifications.some(cert => 
                      cert.toLowerCase().includes(certName.toLowerCase())
                    );
                  };

                  // Check education array (like DashboardPage does)
                  const hasCertInEducation = (certName: string) => {
                    if (!teacher.education || teacher.education.length === 0) return false;
                    return teacher.education.some((edu: any) => {
                      if (!edu?.degree) return false;
                      const degree = edu.degree.toLowerCase();
                      return degree.includes(certName.toLowerCase());
                    });
                  };

                  // Check qualification field
                  const hasCertInQualification = (certName: string) => {
                    if (!teacher.qualification) return false;
                    return teacher.qualification.toLowerCase().includes(certName.toLowerCase());
                  };

                  const hasCertification = (certName: string) => {
                    return hasCertInArray(certName) || hasCertInEducation(certName) || hasCertInQualification(certName);
                  };

                  // Get certifications (CELTA, DELTA, TESOL, TEFL)
                  const certs = [];
                  if (hasCertification('TEFL')) certs.push({ name: 'TEFL', icon: Award });
                  if (hasCertification('CELTA')) certs.push({ name: 'CELTA', icon: Award });
                  if (hasCertification('TESOL')) certs.push({ name: 'TESOL', icon: Award });
                  if (hasCertification('DELTA')) certs.push({ name: 'DELTA', icon: Award });

                  // Get degrees (Masters, Bachelors, PhD)
                  const degrees = teacher.education && teacher.education.length > 0
                    ? teacher.education.filter((edu: any) => {
                        if (!edu?.degree) return false;
                        const degree = edu.degree.toLowerCase();
                        return degree.includes("master") || degree.includes("bachelor") || degree.includes("phd") || degree.includes("degree");
                      })
                    : [];

                  // Only show Qualifications section if we have certifications or degrees
                  if (certs.length > 0 || degrees.length > 0) {
                    return (
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                          <GraduationCap className="w-5 h-5" />
                          Qualifications
                        </h3>
                        
                        {/* Certifications with icons */}
                        {certs.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-4">
                              {certs.map((cert, index) => {
                                const Icon = cert.icon;
                                return (
                                  <div key={index} className="flex items-center gap-2" title={`${cert.name} Certified`}>
                                    <Icon className="w-5 h-5 text-primary-600" />
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">{cert.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Education degrees */}
                        {degrees.length > 0 && (
                          <div className="space-y-3">
                            {degrees.map((edu: any, index: number) => (
                              <div
                                key={index}
                                className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg"
                              >
                                <p className="font-medium">
                                  {edu.degree}
                                  {edu.field && edu.field.trim() && ` in ${edu.field}`}
                                </p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                  {edu.institution && edu.institution.trim() && `${edu.institution}`}
                                  {edu.institution && edu.institution.trim() && edu.year && ` • `}
                                  {edu.year && edu.year.trim() && `${edu.year}`}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Teaching Experience */}
                {teacher.teachingExperience && teacher.teachingExperience.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Teaching Experience
                    </h3>
                    <div className="space-y-4">
                      {teacher.teachingExperience.map((exp, index) => (
                        <div
                          key={index}
                          className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{exp.schoolName}</p>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {exp.country}
                              </p>
                            </div>
                            <span className="text-sm text-neutral-500">
                              {exp.startDate} - {exp.endDate}
                            </span>
                          </div>
                          {exp.subjectsTaught && exp.subjectsTaught.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium mb-1">Subjects:</p>
                              <div className="flex flex-wrap gap-1">
                                {exp.subjectsTaught.map((subject, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs"
                                  >
                                    {subject}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {exp.keyAchievements && (
                            <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-2">
                              {exp.keyAchievements}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specializations */}
                {teacher.specializations && teacher.specializations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Specializations
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {teacher.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resume & Portfolio */}
                {(teacher.resumeUrl || teacher.portfolioUrl) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Documents
                    </h3>
                    <div className="flex gap-4">
                      {teacher.resumeUrl && (
                        <a
                          href={teacher.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          View Resume
                        </a>
                      )}
                      {teacher.portfolioUrl && (
                        <a
                          href={teacher.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          View Portfolio
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 px-6 py-4 flex justify-end">
                <Button onClick={onClose} variant="secondary">
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

