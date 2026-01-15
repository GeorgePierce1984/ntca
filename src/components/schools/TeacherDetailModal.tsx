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

                {/* Certifications */}
                {teacher.certifications && teacher.certifications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Certifications
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {teacher.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm"
                        >
                          {cert}
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

                {/* Education */}
                {teacher.education && teacher.education.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Education
                    </h3>
                    <div className="space-y-3">
                      {teacher.education.map((edu, index) => (
                        <div
                          key={index}
                          className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg"
                        >
                          <p className="font-medium">{edu.degree} in {edu.field}</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {edu.institution} • {edu.year}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

                {/* Contact Information */}
                {(teacher.email || teacher.phone) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Contact Information
                    </h3>
                    <div className="space-y-2">
                      {teacher.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-neutral-400" />
                          <span>{teacher.email}</span>
                        </div>
                      )}
                      {teacher.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-neutral-400" />
                          <span>
                            {teacher.phoneCountryCode} {teacher.phone}
                          </span>
                        </div>
                      )}
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

