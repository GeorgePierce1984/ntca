import jwt from 'jsonwebtoken';
import { prisma } from "../_utils/prisma.js";

// Helper function to retry database operations
// Prisma auto-connects on first query, so we don't need manual connection management
async function retryOperation(operation, maxRetries = 3, initialDelay = 1000) {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isConnectionError = 
        error.message?.includes("Engine was empty") ||
        error.message?.includes("Engine is not yet connected") ||
        error.message?.includes("connection") ||
        error.message?.includes("Response from the Engine was empty") ||
        error.code === "P1001" ||
        error.code === "P1017" ||
        error.code === "P1008" ||
        error.code === "GenericFailure" ||
        error.name === "PrismaClientUnknownRequestError";

      if (isConnectionError && attempt < maxRetries) {
        console.log(`Connection error on attempt ${attempt}, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * 1.5, 1500);
        continue;
      }
      throw error;
    }
  }
}

// Middleware to verify JWT token
function verifyToken(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw new Error('No token provided');

  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  try {
    const decoded = verifyToken(req);

    // Only teachers can access this endpoint
    if (decoded.userType !== 'TEACHER') {
      return res.status(403).json({ error: 'Teacher access required' });
    }

    // Try to get user with teacher, handle missing columns gracefully
    let user;
    try {
      user = await retryOperation(async () => {
        return await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: { teacher: true }
        });
      });
    } catch (error) {
      // If error is due to missing columns (P2022), try with explicit select
      if (error.code === 'P2022' || error.message?.includes('does not exist')) {
        user = await retryOperation(async () => {
          return await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
              teacher: {
                select: {
                  id: true,
                  userId: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                  phoneCountryCode: true,
                  streetAddress: true,
                  city: true,
                  state: true,
                  postalCode: true,
                  country: true,
                  qualification: true,
                  experienceYears: true,
                  experience: true,
                  bio: true,
                  resumeUrl: true,
                  portfolioUrl: true,
                  photoUrl: true,
                  verified: true,
                  rating: true,
                  teachingLicense: true,
                  certifications: true,
                  subjects: true,
                  ageGroups: true,
                  teachingStyle: true,
                  nativeLanguage: true,
                  languageSkills: true,
                  otherLanguages: true,
                  currentLocation: true,
                  willingToRelocate: true,
                  preferredLocations: true,
                  visaStatus: true,
                  workAuthorization: true,
                  availability: true,
                  startDate: true,
                  education: true,
                  teachingExperience: true,
                  specializations: true,
                  previousSchools: true,
                  references: true,
                  achievements: true,
                  publications: true,
                  dateOfBirth: true,
                  nationality: true,
                  gender: true,
                  maritalStatus: true,
                  profileComplete: true,
                  profileViews: true,
                  lastActive: true,
                  searchable: true,
                  salaryExpectation: true,
                  salaryExpectationVisible: true,
                  anonymiseProfile: true,
                  downloadableProfilePDF: true,
                  jobTypePreference: true,
                  workEnvironmentPreference: true,
                  technicalSkills: true,
                  softSkills: true,
                  languageTestScores: true,
                  createdAt: true,
                  updatedAt: true,
                  // Exclude new fields if columns don't exist
                }
              }
            }
          });
        });
        // Set default values for missing columns
        if (user?.teacher) {
          if (user.teacher.refereeAvailable === undefined) {
            user.teacher.refereeAvailable = false;
          }
          if (user.teacher.salaryExpectationVisible === undefined) {
            user.teacher.salaryExpectationVisible = true;
          }
        }
      } else {
        throw error;
      }
    }

    if (!user || !user.teacher) {
      return res.status(404).json({ error: 'Teacher profile not found' });
    }

    if (req.method === 'GET') {
      // Get teacher profile
      let teacher;
      try {
        teacher = await retryOperation(async () => {
          return await prisma.teacher.findUnique({
            where: { userId: decoded.userId },
            include: {
              applications: {
                include: {
                  job: {
                    include: {
                      school: {
                        select: {
                          name: true,
                          city: true,
                          country: true
                        }
                      }
                    }
                  },
                  interviewRequest: true
                },
                orderBy: { createdAt: 'desc' }
              },
              savedJobs: {
                include: {
                  job: {
                    include: {
                      school: {
                        select: {
                          name: true,
                          city: true,
                          country: true
                        }
                      }
                    }
                  }
                },
                orderBy: { createdAt: 'desc' }
              }
            }
          });
        });
      } catch (error) {
        // If error is due to missing columns, try without include and add default
        if (error.code === 'P2022' || error.message?.includes('does not exist')) {
          teacher = await retryOperation(async () => {
            return await prisma.teacher.findUnique({
              where: { userId: decoded.userId },
            });
          });
          // Set default value for missing column
          if (teacher) {
            teacher.refereeAvailable = false;
            teacher.applications = [];
            teacher.savedJobs = [];
          }
        } else {
          throw error;
        }
      }

      // Update last active timestamp
      await retryOperation(async () => {
        return await prisma.teacher.update({
          where: { id: teacher.id },
          data: { lastActive: new Date() }
        });
      });

      // Parse teachingExperience if it's stored as JSON string (for backward compatibility)
      if (teacher.teachingExperience) {
        if (typeof teacher.teachingExperience === 'string') {
          try {
            teacher.teachingExperience = JSON.parse(teacher.teachingExperience);
          } catch (e) {
            teacher.teachingExperience = null;
          }
        }
        // If it's already an object/array, Prisma returns it as-is for Json fields
      }

      return res.status(200).json({ teacher });

    } else if (req.method === 'PUT') {
      // Update teacher profile
      const {
        firstName,
        lastName,
        phone,
        phoneCountryCode,
        streetAddress,
        city,
        state,
        postalCode,
        country,
        qualification,
        experienceYears,
        experience,
        bio,
        resumeUrl,
        portfolioUrl,
        photoUrl,
        teachingLicense,
        certifications,
        subjects,
        ageGroups,
        teachingStyle,
        nativeLanguage,
        languageSkills,
        otherLanguages,
        currentLocation,
        willingToRelocate,
        preferredLocations,
        visaStatus,
        workAuthorization,
        availability,
        startDate,
        education,
        specializations,
        previousSchools,
        references,
        achievements,
        publications,
        dateOfBirth,
        nationality,
        gender,
        maritalStatus,
        salaryExpectation,
        jobTypePreference,
        workEnvironmentPreference,
        technicalSkills,
        softSkills,
        languageTestScores,
        teachingExperience,
        refereeAvailable,
        searchable,
        salaryExpectationVisible,
        anonymiseProfile,
        downloadableProfilePDF
      } = req.body;

      // Calculate profile completeness
      const requiredFields = [
        firstName, lastName, phone, city, country, qualification, experience, bio
      ];
      const optionalButImportantFields = [
        resumeUrl, certifications, subjects, languageSkills, availability
      ];

      // Helper function to check if a field has a value
      const hasValue = (field) => {
        if (!field) return false;
        if (Array.isArray(field)) return field.length > 0;
        if (typeof field === 'object') return Object.keys(field).length > 0;
        if (typeof field === 'string') return field.trim().length > 0;
        return Boolean(field);
      };

      const requiredComplete = requiredFields.every(field => hasValue(field));
      const optionalComplete = optionalButImportantFields.filter(field => hasValue(field)).length;

      const profileComplete = requiredComplete && optionalComplete >= 3;

      // Build base update data
      const baseUpdateData = {
        firstName,
        lastName,
        phone,
        phoneCountryCode,
        streetAddress,
        city,
        state,
        postalCode,
        country,
        qualification,
        experienceYears: experienceYears ? parseInt(experienceYears) : null,
        experience,
        bio,
        resumeUrl,
        portfolioUrl,
        photoUrl,
        teachingLicense,
        certifications: certifications || [],
        subjects: subjects || [],
        ageGroups: ageGroups || [],
        teachingStyle,
        nativeLanguage,
        languageSkills: languageSkills || {},
        otherLanguages,
        currentLocation,
        willingToRelocate: willingToRelocate || false,
        preferredLocations: preferredLocations || [],
        visaStatus,
        workAuthorization: workAuthorization || [],
        availability,
        startDate: startDate ? new Date(startDate) : null,
        education: education || [],
        specializations: specializations || [],
        previousSchools: previousSchools || [],
        references: references || [],
        achievements: achievements || [],
        publications: publications || [],
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        nationality,
        gender,
        maritalStatus,
        salaryExpectation,
        jobTypePreference: jobTypePreference || [],
        workEnvironmentPreference: workEnvironmentPreference || [],
        technicalSkills: technicalSkills || [],
        softSkills: softSkills || [],
        languageTestScores: languageTestScores || {},
        teachingExperience: teachingExperience ? (typeof teachingExperience === 'string' ? JSON.parse(teachingExperience) : teachingExperience) : null,
        searchable: searchable !== undefined ? searchable : true,
        anonymiseProfile: anonymiseProfile !== undefined ? anonymiseProfile : false,
        downloadableProfilePDF: downloadableProfilePDF !== undefined ? downloadableProfilePDF : true,
        profileComplete,
        lastActive: new Date()
      };

      // Try to update with new fields, fallback if columns don't exist
      let updatedTeacher;
      try {
        updatedTeacher = await retryOperation(async () => {
          return await prisma.teacher.update({
            where: { userId: decoded.userId },
            data: {
              ...baseUpdateData,
              refereeAvailable: refereeAvailable !== undefined ? refereeAvailable : false,
              salaryExpectationVisible: salaryExpectationVisible !== undefined ? salaryExpectationVisible : true,
              anonymiseProfile: anonymiseProfile !== undefined ? anonymiseProfile : false,
              downloadableProfilePDF: downloadableProfilePDF !== undefined ? downloadableProfilePDF : true,
            }
          });
        });
      } catch (error) {
        // If error is due to missing columns, update without them
        if (error.code === 'P2022' || error.message?.includes('does not exist')) {
          const fallbackData = { ...baseUpdateData };
          // Remove fields that might not exist
          if (error.message?.includes('refereeAvailable')) {
            delete fallbackData.refereeAvailable;
          }
          if (error.message?.includes('salaryExpectationVisible')) {
            delete fallbackData.salaryExpectationVisible;
          }
          if (error.message?.includes('anonymiseProfile')) {
            delete fallbackData.anonymiseProfile;
          }
          if (error.message?.includes('downloadableProfilePDF')) {
            delete fallbackData.downloadableProfilePDF;
          }
          
          updatedTeacher = await retryOperation(async () => {
            return await prisma.teacher.update({
              where: { userId: decoded.userId },
              data: fallbackData
            });
          });
          // Set default values for missing columns
          if (error.message?.includes('refereeAvailable')) {
            updatedTeacher.refereeAvailable = false;
          }
          if (error.message?.includes('salaryExpectationVisible')) {
            updatedTeacher.salaryExpectationVisible = true;
          }
          if (error.message?.includes('anonymiseProfile')) {
            updatedTeacher.anonymiseProfile = false;
          }
          if (error.message?.includes('downloadableProfilePDF')) {
            updatedTeacher.downloadableProfilePDF = true;
          }
        } else {
          throw error;
        }
      }

      // Parse teachingExperience if it's stored as JSON string
      if (updatedTeacher.teachingExperience && typeof updatedTeacher.teachingExperience === 'string') {
        try {
          updatedTeacher.teachingExperience = JSON.parse(updatedTeacher.teachingExperience);
        } catch (e) {
          updatedTeacher.teachingExperience = null;
        }
      }

      // Log activity
      await retryOperation(async () => {
        return await prisma.activityLog.create({
          data: {
            userId: decoded.userId,
            action: 'PROFILE_UPDATED',
            details: { profileComplete },
            ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
          }
        });
      });

      return res.status(200).json({
        message: 'Profile updated successfully',
        teacher: updatedTeacher
      });

    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

  } catch (error) {
    console.error('Teacher profile API error:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
