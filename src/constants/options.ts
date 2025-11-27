// Central Asia countries and regions
export const CENTRAL_ASIA_COUNTRIES = [
  { value: "kazakhstan", label: "Kazakhstan" },
  { value: "uzbekistan", label: "Uzbekistan" },
  { value: "kyrgyzstan", label: "Kyrgyzstan" },
  { value: "tajikistan", label: "Tajikistan" },
  { value: "turkmenistan", label: "Turkmenistan" },
  { value: "afghanistan", label: "Afghanistan" },
  { value: "mongolia", label: "Mongolia" },
  { value: "azerbaijan", label: "Azerbaijan" },
  { value: "georgia", label: "Georgia" },
  { value: "armenia", label: "Armenia" },
] as const;

// School types available on the platform
export const SCHOOL_TYPES = [
  { value: "international", label: "International School" },
  { value: "english-language", label: "English Language School" },
  { value: "german-language", label: "German Language School" },
  { value: "spanish-language", label: "Spanish Language School" },
  { value: "french-language", label: "French Language School" },
  { value: "university", label: "University" },
  { value: "exam-prep", label: "Exam Preparation (IELTS/SAT/TOEFL)" },
  { value: "university-prep", label: "University Preparation" },
  { value: "private", label: "Private School (Other)" },
  { value: "public", label: "Public School" },
] as const;

// Job types
export const JOB_TYPES = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
] as const;

// Experience levels
export const EXPERIENCE_LEVELS = [
  { value: "0-2", label: "0-2 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "6-10", label: "6-10 years" },
  { value: "10+", label: "10+ years" },
] as const;

// Teacher qualifications
export const TEACHER_QUALIFICATIONS = [
  { value: "CELTA", label: "CELTA" },
  { value: "TESOL", label: "TESOL" },
  { value: "TEFL", label: "TEFL" },
  { value: "DELTA", label: "DELTA" },
  { value: "MA_TESOL", label: "MA in TESOL/Applied Linguistics" },
  { value: "MA_EDUCATION", label: "MA in Education" },
  { value: "PGCE", label: "PGCE" },
  { value: "QTS", label: "QTS (Qualified Teacher Status)" },
  { value: "OTHER", label: "Other Teaching Qualification" },
] as const;

// Languages
export const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "russian", label: "Russian" },
  { value: "kazakh", label: "Kazakh" },
  { value: "uzbek", label: "Uzbek" },
  { value: "kyrgyz", label: "Kyrgyz" },
  { value: "tajik", label: "Tajik" },
  { value: "turkmen", label: "Turkmen" },
  { value: "german", label: "German" },
  { value: "french", label: "French" },
  { value: "spanish", label: "Spanish" },
  { value: "mandarin", label: "Mandarin Chinese" },
  { value: "arabic", label: "Arabic" },
  { value: "turkish", label: "Turkish" },
  { value: "persian", label: "Persian/Farsi" },
] as const;

// Subject areas
export const SUBJECT_AREAS = [
  { value: "english", label: "English Language" },
  { value: "english_literature", label: "English Literature" },
  { value: "mathematics", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
  { value: "history", label: "History" },
  { value: "geography", label: "Geography" },
  { value: "economics", label: "Economics" },
  { value: "business", label: "Business Studies" },
  { value: "computer_science", label: "Computer Science" },
  { value: "art", label: "Art & Design" },
  { value: "music", label: "Music" },
  { value: "physical_education", label: "Physical Education" },
  { value: "psychology", label: "Psychology" },
  { value: "sociology", label: "Sociology" },
  { value: "philosophy", label: "Philosophy" },
] as const;

// Age groups
export const AGE_GROUPS = [
  { value: "early_years", label: "Early Years (3-5)" },
  { value: "primary", label: "Primary (6-11)" },
  { value: "middle", label: "Middle School (12-14)" },
  { value: "secondary", label: "Secondary (15-18)" },
  { value: "adult", label: "Adult Learners" },
  { value: "university", label: "University Level" },
] as const;

// Visa statuses
export const VISA_STATUSES = [
  { value: "citizen", label: "Citizen/Permanent Resident" },
  { value: "work_visa", label: "Have Work Visa" },
  { value: "need_sponsorship", label: "Need Visa Sponsorship" },
  { value: "student_visa", label: "Student Visa (Part-time only)" },
] as const;

// Type exports
export type Country = typeof CENTRAL_ASIA_COUNTRIES[number]["value"];
export type SchoolType = typeof SCHOOL_TYPES[number]["value"];
export type JobType = typeof JOB_TYPES[number]["value"];
export type ExperienceLevel = typeof EXPERIENCE_LEVELS[number]["value"];
export type Qualification = typeof TEACHER_QUALIFICATIONS[number]["value"];
export type Language = typeof LANGUAGES[number]["value"];
export type SubjectArea = typeof SUBJECT_AREAS[number]["value"];
export type AgeGroup = typeof AGE_GROUPS[number]["value"];
export type VisaStatus = typeof VISA_STATUSES[number]["value"];
