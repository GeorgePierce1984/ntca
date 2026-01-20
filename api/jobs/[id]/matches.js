import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Helper function to retry database operations
async function retryOperation(operation, maxRetries = 3, initialDelay = 500) {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt === 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
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
        await prisma.$disconnect().catch(() => {});
        if (error.message?.includes("Engine is not yet connected")) {
          await new Promise(resolve => setTimeout(resolve, 1500 + (attempt * 500)));
        } else {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay = Math.min(delay * 1.5, 2000);
        }
        continue;
      }
      throw error;
    }
  }
}

// Calculate match strength between job and teacher
function calculateMatchStrength(job, teacher) {
  let score = 0;
  let maxScore = 0;
  
  // Parse job requirements
  let jobRequirements = {};
  try {
    if (job.requirements) {
      const parsed = typeof job.requirements === 'string' 
        ? JSON.parse(job.requirements) 
        : job.requirements;
      jobRequirements = parsed || {};
    }
  } catch (e) {
    console.error("Error parsing job requirements:", e, "Raw requirements:", job.requirements);
  }

  // 1. Qualifications (20 points) - Proportional scoring based on selected requirements
  // Count how many qualifications are selected in the job posting
  const selectedQualifications = [];
  if (jobRequirements.tefl === true || jobRequirements.tefl === "true") selectedQualifications.push("tefl");
  if (jobRequirements.celta === true || jobRequirements.celta === "true") selectedQualifications.push("celta");
  if (jobRequirements.tesol === true || jobRequirements.tesol === "true") selectedQualifications.push("tesol");
  if (jobRequirements.delta === true || jobRequirements.delta === "true") selectedQualifications.push("delta");
  
  if (selectedQualifications.length === 0) {
    // No qualifications required, don't score this section
    // maxScore stays the same (we'll subtract 20 later if needed, but for consistency we'll keep it)
  } else {
    maxScore += 20;
    // Calculate points per qualification (20 points divided by number of selected qualifications)
    const pointsPerQualification = 20 / selectedQualifications.length;
    
    // Check TEFL (only if selected)
    if (selectedQualifications.includes("tefl")) {
      const hasTEFL = teacher.certifications?.some(cert => 
        cert.toLowerCase().includes('tefl')
      ) || teacher.education?.some(edu => 
        edu?.degree?.toLowerCase().includes('tefl')
      );
      if (hasTEFL) score += pointsPerQualification;
    }
    
    // Check CELTA (only if selected)
    if (selectedQualifications.includes("celta")) {
      const hasCELTA = teacher.certifications?.some(cert => 
        cert.toLowerCase().includes('celta')
      ) || teacher.education?.some(edu => 
        edu?.degree?.toLowerCase().includes('celta')
      );
      if (hasCELTA) score += pointsPerQualification;
    }
    
    // Check TESOL (only if selected)
    if (selectedQualifications.includes("tesol")) {
      const hasTESOL = teacher.certifications?.some(cert => 
        cert.toLowerCase().includes('tesol')
      ) || teacher.education?.some(edu => 
        edu?.degree?.toLowerCase().includes('tesol')
      );
      if (hasTESOL) score += pointsPerQualification;
    }
    
    // Check DELTA (only if selected)
    if (selectedQualifications.includes("delta")) {
      const hasDELTA = teacher.certifications?.some(cert => 
        cert.toLowerCase().includes('delta')
      ) || teacher.education?.some(edu => 
        edu?.degree?.toLowerCase().includes('delta')
      );
      if (hasDELTA) score += pointsPerQualification;
    }
  }

  // 2. Degree (15 points)
  maxScore += 15;
  if (jobRequirements.bachelorsDegree === true || jobRequirements.bachelorsDegree === "true") {
    const hasDegree = teacher.education?.some(edu => {
      if (!edu?.degree) return false;
      const degree = edu.degree.toLowerCase();
      return degree.includes("bachelor") || degree.includes("master") || degree.includes("phd") || degree.includes("degree");
    });
    if (hasDegree) score += 15;
  } else {
    // No degree requirement - if teacher has a degree, they're overskilled, so score max
    const hasDegree = teacher.education?.some(edu => {
      if (!edu?.degree) return false;
      const degree = edu.degree.toLowerCase();
      return degree.includes("bachelor") || degree.includes("master") || degree.includes("phd") || degree.includes("degree");
    });
    if (hasDegree) score += 15;
  }

  // 3. Experience (20 points)
  maxScore += 20;
  if (jobRequirements.minimumTeachingExperience && 
      (jobRequirements.minimumTeachingExperience !== "" && 
       jobRequirements.minimumTeachingExperience !== null && 
       jobRequirements.minimumTeachingExperience !== undefined)) {
    const minExp = parseInt(jobRequirements.minimumTeachingExperience) || 0;
    
    // Check experienceYears first
    if (teacher.experienceYears && teacher.experienceYears >= minExp) {
      // Bonus for exceeding minimum
      const excess = teacher.experienceYears - minExp;
      score += Math.min(20, 15 + (excess * 2));
    } else if (teacher.teachingExperience) {
      // Fallback: check teachingExperience array for relevant experience
      try {
        const teachingExp = Array.isArray(teacher.teachingExperience) 
          ? teacher.teachingExperience 
          : JSON.parse(teacher.teachingExperience || '[]');
        
        // Count years of experience from teachingExperience entries
        let totalYears = 0;
        teachingExp.forEach(exp => {
          if (exp.startDate && exp.endDate) {
            const start = new Date(exp.startDate);
            const end = exp.endDate.toLowerCase() === 'present' ? new Date() : new Date(exp.endDate);
            const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
            if (years > 0) totalYears += years;
          }
        });
        
        if (totalYears >= minExp) {
          const excess = totalYears - minExp;
          score += Math.min(20, 15 + (excess * 2));
        }
      } catch (e) {
        // If parsing fails, skip this check
      }
    }
  }

  // 4. Age Groups (15 points)
  maxScore += 15;
  // Check for both null and undefined, and also ensure values are valid numbers
  if (job.studentAgeGroupMin != null && job.studentAgeGroupMax != null && 
      typeof job.studentAgeGroupMin === 'number' && typeof job.studentAgeGroupMax === 'number') {
    // Get age groups from both teacher.ageGroups and teachingExperience
    const teacherAgeGroups = teacher.ageGroups || [];
    const teachingExp = teacher.teachingExperience || [];
    const teachingExpAgeGroups = [];
    
    // Extract age groups from teaching experience
    if (Array.isArray(teachingExp)) {
      teachingExp.forEach(exp => {
        if (exp.studentAgeGroups && Array.isArray(exp.studentAgeGroups)) {
          exp.studentAgeGroups.forEach(ageGroup => {
            if (!teachingExpAgeGroups.includes(ageGroup)) {
              teachingExpAgeGroups.push(ageGroup);
            }
          });
        }
      });
    }
    
    // Combine both sources
    const allTeacherAgeGroups = [...new Set([...teacherAgeGroups, ...teachingExpAgeGroups])];
    
    const jobMinAge = job.studentAgeGroupMin;
    const jobMaxAge = job.studentAgeGroupMax;
    
    // Map age group strings to numeric ranges
    const ageGroupRanges = {
      "0-5": [0, 5],
      "6-11": [6, 11],
      "12-14": [12, 14],
      "15-18": [15, 18],
      "19-30": [19, 30],
      "30+": [30, 100],
      // Handle common string formats from teaching experience
      "Kids (5-12)": [5, 12],
      "Teens (13-17)": [13, 17],
      "Adults (18+)": [18, 100],
      "Young Adults (18-25)": [18, 25],
      "Adults (25+)": [25, 100],
    };
    
    let hasOverlap = false;
    allTeacherAgeGroups.forEach(ageGroup => {
      const range = ageGroupRanges[ageGroup];
      if (range) {
        // Check if ranges overlap
        if (range[0] <= jobMaxAge && range[1] >= jobMinAge) {
          hasOverlap = true;
        }
      }
    });
    
    if (hasOverlap) score += 15;
  }

  // 5. Location (5 points)
  maxScore += 5;
  if (teacher.willingToRelocate || 
      teacher.preferredLocations?.some(loc => 
        loc.toLowerCase().includes(job.country.toLowerCase()) ||
        loc.toLowerCase().includes(job.city.toLowerCase())
      )) {
    score += 5;
  }

  // Calculate percentage
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  
  return {
    percentage,
    score,
    maxScore
  };
}

// Determine availability category
function getAvailabilityCategory(teacher, jobStartDate) {
  if (!teacher.availability && !teacher.startDate) {
    return "unknown";
  }

  const now = new Date();
  const thirtyDays = new Date();
  thirtyDays.setDate(thirtyDays.getDate() + 30);
  const threeMonths = new Date();
  threeMonths.setMonth(threeMonths.getMonth() + 3);

  // Check availability string
  if (teacher.availability) {
    const avail = teacher.availability.toLowerCase();
    if (avail.includes("immediate") || avail.includes("now") || avail.includes("available now")) {
      return "now";
    }
    if (avail.includes("30 days") || avail.includes("within 30")) {
      return "30days";
    }
    if (avail.includes("3 months") || avail.includes("within 3")) {
      return "3months";
    }
  }

  // Check startDate
  if (teacher.startDate) {
    const startDate = new Date(teacher.startDate);
    if (startDate <= now) {
      return "now";
    }
    if (startDate <= thirtyDays) {
      return "30days";
    }
    if (startDate <= threeMonths) {
      return "3months";
    }
  }

  // Check if job start date matches teacher availability
  if (jobStartDate) {
    const jobStart = new Date(jobStartDate);
    if (jobStart <= now) {
      return "now";
    }
    if (jobStart <= thirtyDays) {
      return "30days";
    }
    if (jobStart <= threeMonths) {
      return "3months";
    }
  }

  return "unknown";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Verify authentication (optional but recommended for school-specific data)
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    // Fetch the job
    const job = await retryOperation(async () => {
      return await prisma.job.findUnique({
        where: { id },
        include: {
          school: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Fetch all searchable teachers
    const teachers = await retryOperation(async () => {
      return await prisma.teacher.findMany({
        where: {
          searchable: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          experienceYears: true,
          certifications: true,
          subjects: true,
          ageGroups: true,
          visaStatus: true,
          workAuthorization: true,
          availability: true,
          startDate: true,
          willingToRelocate: true,
          preferredLocations: true,
          education: true,
          teachingExperience: true,
          profileComplete: true,
        },
      });
    });

    // Calculate matches
    const matches = teachers
      .map(teacher => {
        const match = calculateMatchStrength(job, teacher);
        const availability = getAvailabilityCategory(teacher, job.startDate);
        
        return {
          teacherId: teacher.id,
          teacherName: `${teacher.firstName} ${teacher.lastName}`,
          matchStrength: match.percentage,
          availability,
        };
      })
      .filter(match => match.matchStrength >= 40); // Only include matches >= 40%

    // Group by availability
    const byAvailability = {
      now: matches.filter(m => m.availability === "now"),
      within30Days: matches.filter(m => m.availability === "30days"),
      within3Months: matches.filter(m => m.availability === "3months"),
      unknown: matches.filter(m => m.availability === "unknown"),
    };

    // Group by match strength
    const byStrength = {
      strong: matches.filter(m => m.matchStrength >= 80),
      medium: matches.filter(m => m.matchStrength >= 60 && m.matchStrength < 80),
      partial: matches.filter(m => m.matchStrength >= 40 && m.matchStrength < 60),
    };

    return res.status(200).json({
      totalMatches: matches.length,
      byAvailability: {
        now: byAvailability.now.length,
        within30Days: byAvailability.within30Days.length,
        within3Months: byAvailability.within3Months.length,
      },
      byStrength: {
        strong: byStrength.strong.length,
        medium: byStrength.medium.length,
        partial: byStrength.partial.length,
      },
      // Include detailed breakdown for potential future use
      matches: matches.slice(0, 100), // Limit to first 100 for performance
    });
  } catch (error) {
    console.error("Job matches API error:", error);
    return res.status(500).json({
      error: "Failed to calculate job matches",
      message: error.message,
    });
  } finally {
    // In serverless, Prisma client is reused
    // await prisma.$disconnect();
  }
}

