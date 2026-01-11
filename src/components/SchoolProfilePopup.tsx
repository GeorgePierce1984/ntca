import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Building,
  MapPin,
  MessageSquare,
  CheckCircle,
  Award,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface School {
  id: string;
  name: string;
  city: string;
  country: string;
  logoUrl?: string;
  coverPhotoUrl?: string;
  verified: boolean;
  description?: string;
  website?: string;
  studentCount?: number;
  benefits?: string;
  schoolType?: string;
  established?: string;
  studentAgeRangeMin?: number;
  studentAgeRangeMax?: number;
  averageClassSize?: number;
  curriculum?: string;
  teachingPhilosophy?: string;
  streetAddress?: string;
  state?: string;
  postalCode?: string;
  contactName?: string;
  contactEmail?: string;
  telephone?: string;
  phoneCountryCode?: string;
}

interface SchoolProfilePopupProps {
  school: School;
  isOpen: boolean;
  onClose: () => void;
  onMessageSchool?: () => void;
}

export const SchoolProfilePopup: React.FC<SchoolProfilePopupProps> = ({
  school,
  isOpen,
  onClose,
  onMessageSchool,
}) => {
  // Parse benefits if it's a JSON string
  let benefits = null;
  if (school.benefits) {
    try {
      benefits = typeof school.benefits === "string" 
        ? JSON.parse(school.benefits) 
        : school.benefits;
    } catch (e) {
      // If parsing fails, treat as plain string
      benefits = null;
    }
  }

  // Benefit label mapping to match Profile & Settings page
  const benefitLabels: Record<string, string> = {
    housingProvided: "Housing Assistance",
    flightReimbursement: "Flight Reimbursement Allowance",
    visaWorkPermitSupport: "Visa & Work Permit Support",
    contractCompletionBonus: "Contract Completion Bonus",
    paidHolidays: "Paid Holidays",
    overtimePay: "Overtime Pay",
    paidAnnualLeave: "Paid Annual Leave",
    nationalHolidays: "National Holidays",
    sickLeave: "Sick Leave",
    healthInsurance: "Health Insurance",
    relocationSupport: "Relocation Support",
    teachingMaterialsProvided: "Teaching Materials Provided",
    curriculumGuidance: "Curriculum Guidance",
    teacherTraining: "Teacher Training",
    promotionOpportunities: "Promotion Opportunities",
    contractRenewalOptions: "Contract Renewal Options",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header with Close Button */}
              <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 flex items-center justify-end z-10">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Cover Photo and Logo Section */}
                <div className="relative mb-8">
                  {/* Cover Photo */}
                  <div className="relative h-48 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-lg overflow-hidden">
                    {school.coverPhotoUrl ? (
                      <img
                        src={school.coverPhotoUrl}
                        alt="School cover"
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>

                  {/* Logo positioned on top of cover photo */}
                  <div className="relative -mt-16 ml-6">
                    <div className="relative w-32 h-32 rounded-xl bg-white dark:bg-neutral-800 shadow-lg border-4 border-white dark:border-neutral-800 flex items-center justify-center overflow-hidden">
                      {school.logoUrl ? (
                        <img
                          src={school.logoUrl}
                          alt="School logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building className="w-12 h-12 text-neutral-400" />
                      )}
                    </div>
                  </div>

                  {/* School Name and Verification */}
                  <div className="mt-4 ml-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                          {school.name}
                        </h1>
                        {school.verified && (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        )}
                      </div>
                      {/* Message School Button - wider width to fit text on one line */}
                      {onMessageSchool && (
                        <div className="w-auto flex-shrink-0 min-w-[180px]">
                          <Button
                            onClick={() => {
                              onClose();
                              onMessageSchool();
                            }}
                            variant="secondary"
                            size="lg"
                            leftIcon={<MessageSquare className="w-5 h-5" />}
                          >
                            Message School
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                      {school.city}, {school.country}
                    </p>
                  </div>
                </div>

                {/* School Description */}
                {school.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      About
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                      {school.description}
                    </p>
                  </div>
                )}

                {/* Teaching Philosophy */}
                {school.teachingPhilosophy && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Teaching Philosophy
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                      {school.teachingPhilosophy}
                    </p>
                  </div>
                )}

                {/* School Details Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {school.schoolType && (
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                        School Type
                      </p>
                      <p className="text-base font-medium text-neutral-900 dark:text-neutral-100 capitalize">
                        {school.schoolType}
                      </p>
                    </div>
                  )}

                  {school.established && (
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                        Year Established
                      </p>
                      <p className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                        {new Date(school.established).getFullYear()}
                      </p>
                    </div>
                  )}

                  {school.curriculum && (
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                        Curriculum
                      </p>
                      <p className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                        {school.curriculum}
                      </p>
                    </div>
                  )}

                  {school.studentCount && (
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                        Student Count
                      </p>
                      <p className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                        {school.studentCount.toLocaleString()} students
                      </p>
                    </div>
                  )}

                  {(school.studentAgeRangeMin != null && school.studentAgeRangeMax != null) && (
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                        Student Age Range
                      </p>
                      <p className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                        {school.studentAgeRangeMin} - {school.studentAgeRangeMax} years
                      </p>
                    </div>
                  )}

                  {school.averageClassSize != null && (
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                        Average Class Size
                      </p>
                      <p className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                        {school.averageClassSize} students
                      </p>
                    </div>
                  )}
                </div>

                {/* Address - Only City and Country */}
                {(school.city || school.country) && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Location
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {school.city}
                      {school.country && (school.city ? `, ${school.country}` : school.country)}
                    </p>
                  </div>
                )}


                {/* Benefits */}
                {benefits && typeof benefits === "object" && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Benefits
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {Object.entries(benefits).map(([key, value]) => {
                        if (value === true) {
                          // Use the mapped label if available, otherwise generate from key
                          const label = benefitLabels[key] || key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())
                            .trim();
                          return (
                            <div
                              key={key}
                              className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span>{label}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
