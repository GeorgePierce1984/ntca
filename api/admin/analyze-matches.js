import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error"],
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

// Calculate match strength with detailed breakdown
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
  
  // Debug: Log requirements to help diagnose issues
  console.log("Job requirements parsed:", JSON.stringify(jobRequirements));

  const breakdown = {
    qualifications: { score: 0, maxScore: 0, details: [] },
    degree: { score: 0, maxScore: 0, details: [] },
    experience: { score: 0, maxScore: 0, details: [] },
    ageGroups: { score: 0, maxScore: 0, details: [] },
    location: { score: 0, maxScore: 0, details: [] },
  };

  // 1. Qualifications (20 points) - Proportional scoring based on selected requirements
  breakdown.qualifications.maxScore = 20;
  
  // Debug: Log what certifications are being checked
  breakdown.qualifications.details.push(`Job requirements object: ${JSON.stringify(jobRequirements)}`);
  
  // Count how many qualifications are selected in the job posting
  const selectedQualifications = [];
  if (jobRequirements.tefl === true || jobRequirements.tefl === "true") selectedQualifications.push("tefl");
  if (jobRequirements.celta === true || jobRequirements.celta === "true") selectedQualifications.push("celta");
  if (jobRequirements.tesol === true || jobRequirements.tesol === "true") selectedQualifications.push("tesol");
  if (jobRequirements.delta === true || jobRequirements.delta === "true") selectedQualifications.push("delta");
  
  breakdown.qualifications.details.push(`Selected qualifications in job: ${selectedQualifications.length} (${selectedQualifications.join(", ")})`);
  
  if (selectedQualifications.length === 0) {
    // No qualifications required, don't score this section
    breakdown.qualifications.details.push("No qualifications required (not scored)");
    // Don't add to maxScore
  } else {
    maxScore += 20;
    // Calculate points per qualification (20 points divided by number of selected qualifications)
    const pointsPerQualification = 20 / selectedQualifications.length;
    breakdown.qualifications.details.push(`Points per qualification: ${pointsPerQualification.toFixed(2)} (20 total ÷ ${selectedQualifications.length} qualifications)`);
    
    let matchedCount = 0;
    
    // Check TEFL (only if selected)
    if (selectedQualifications.includes("tefl")) {
      const hasTEFL = teacher.certifications?.some(cert => 
        cert.toLowerCase().includes('tefl')
      ) || teacher.education?.some(edu => 
        edu?.degree?.toLowerCase().includes('tefl')
      );
      if (hasTEFL) {
        score += pointsPerQualification;
        breakdown.qualifications.score += pointsPerQualification;
        matchedCount++;
        breakdown.qualifications.details.push(`TEFL: ✓ Found (+${pointsPerQualification.toFixed(2)} points)`);
      } else {
        breakdown.qualifications.details.push(`TEFL: ✗ Required but not found (0 points)`);
      }
    }
    
    // Check CELTA (only if selected)
    if (selectedQualifications.includes("celta")) {
      const hasCELTA = teacher.certifications?.some(cert => 
        cert.toLowerCase().includes('celta')
      ) || teacher.education?.some(edu => 
        edu?.degree?.toLowerCase().includes('celta')
      );
      if (hasCELTA) {
        score += pointsPerQualification;
        breakdown.qualifications.score += pointsPerQualification;
        matchedCount++;
        breakdown.qualifications.details.push(`CELTA: ✓ Found (+${pointsPerQualification.toFixed(2)} points)`);
      } else {
        breakdown.qualifications.details.push(`CELTA: ✗ Required but not found (0 points)`);
      }
    }
    
    // Check TESOL (only if selected)
    if (selectedQualifications.includes("tesol")) {
      const hasTESOL = teacher.certifications?.some(cert => 
        cert.toLowerCase().includes('tesol')
      ) || teacher.education?.some(edu => 
        edu?.degree?.toLowerCase().includes('tesol')
      );
      if (hasTESOL) {
        score += pointsPerQualification;
        breakdown.qualifications.score += pointsPerQualification;
        matchedCount++;
        breakdown.qualifications.details.push(`TESOL: ✓ Found (+${pointsPerQualification.toFixed(2)} points)`);
      } else {
        breakdown.qualifications.details.push(`TESOL: ✗ Required but not found (0 points)`);
      }
    }
    
    // Check DELTA (only if selected)
    if (selectedQualifications.includes("delta")) {
      const hasDELTA = teacher.certifications?.some(cert => 
        cert.toLowerCase().includes('delta')
      ) || teacher.education?.some(edu => 
        edu?.degree?.toLowerCase().includes('delta')
      );
      if (hasDELTA) {
        score += pointsPerQualification;
        breakdown.qualifications.score += pointsPerQualification;
        matchedCount++;
        breakdown.qualifications.details.push(`DELTA: ✓ Found (+${pointsPerQualification.toFixed(2)} points)`);
      } else {
        breakdown.qualifications.details.push(`DELTA: ✗ Required but not found (0 points)`);
      }
    }
    
    breakdown.qualifications.details.push(`Summary: ${matchedCount}/${selectedQualifications.length} qualifications matched`);
  }

  // 2. Degree (15 points)
  maxScore += 15;
  breakdown.degree.maxScore = 15;
  if (jobRequirements.bachelorsDegree === true || jobRequirements.bachelorsDegree === "true") {
    const hasDegree = teacher.education?.some(edu => {
      if (!edu?.degree) return false;
      const degree = edu.degree.toLowerCase();
      return degree.includes("bachelor") || degree.includes("master") || degree.includes("phd") || degree.includes("degree");
    });
    if (hasDegree) {
      score += 15;
      breakdown.degree.score = 15;
      const degreeFound = teacher.education?.find(edu => {
        if (!edu?.degree) return false;
        const degree = edu.degree.toLowerCase();
        return degree.includes("bachelor") || degree.includes("master") || degree.includes("phd") || degree.includes("degree");
      });
      breakdown.degree.details.push(`✓ Degree found: "${degreeFound?.degree || 'Unknown'}" (+15 points)`);
    } else {
      breakdown.degree.details.push("✗ Bachelor's degree: Required but not found (0 points)");
    }
  } else {
    // No degree requirement - if teacher has a degree, they're overskilled, so score max
    const hasDegree = teacher.education?.some(edu => {
      if (!edu?.degree) return false;
      const degree = edu.degree.toLowerCase();
      return degree.includes("bachelor") || degree.includes("master") || degree.includes("phd") || degree.includes("degree");
    });
    if (hasDegree) {
      score += 15;
      breakdown.degree.score = 15;
      const degreeFound = teacher.education?.find(edu => {
        if (!edu?.degree) return false;
        const degree = edu.degree.toLowerCase();
        return degree.includes("bachelor") || degree.includes("master") || degree.includes("phd") || degree.includes("degree");
      });
      breakdown.degree.details.push(`No degree requirement, but teacher has: "${degreeFound?.degree || 'Unknown'}" (overskilled, +15 points)`);
    } else {
      breakdown.degree.details.push("No degree requirement (not scored)");
    }
  }

  // 3. Experience (20 points)
  maxScore += 20;
  breakdown.experience.maxScore = 20;
  if (jobRequirements.minimumTeachingExperience && 
      (jobRequirements.minimumTeachingExperience !== "" && 
       jobRequirements.minimumTeachingExperience !== null && 
       jobRequirements.minimumTeachingExperience !== undefined)) {
    const minExp = parseInt(jobRequirements.minimumTeachingExperience) || 0;
    breakdown.experience.details.push(`Job requires: ${minExp} years minimum`);
    
    // Check experienceYears first
    if (teacher.experienceYears !== null && teacher.experienceYears !== undefined) {
      breakdown.experience.details.push(`Teacher experienceYears field: ${teacher.experienceYears} years`);
      if (teacher.experienceYears >= minExp) {
        const excess = teacher.experienceYears - minExp;
        const expScore = Math.min(20, 15 + (excess * 2));
        score += expScore;
        breakdown.experience.score = expScore;
        breakdown.experience.details.push(`✓ Meets requirement (exceeds by ${excess} years)`);
        breakdown.experience.details.push(`Score calculation: 15 base + (${excess} × 2) = ${expScore} points`);
      } else {
        breakdown.experience.details.push(`✗ Insufficient: ${teacher.experienceYears} < ${minExp} (0 points)`);
      }
    } else if (teacher.teachingExperience) {
      // Fallback: check teachingExperience array
      breakdown.experience.details.push("experienceYears not set, checking teachingExperience array...");
      try {
        const teachingExp = Array.isArray(teacher.teachingExperience) 
          ? teacher.teachingExperience 
          : JSON.parse(teacher.teachingExperience || '[]');
        
        breakdown.experience.details.push(`Found ${teachingExp.length} teaching experience entries`);
        
        let totalYears = 0;
        teachingExp.forEach((exp, idx) => {
          if (exp.startDate && exp.endDate) {
            const start = new Date(exp.startDate);
            const end = exp.endDate.toLowerCase() === 'present' ? new Date() : new Date(exp.endDate);
            const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
            if (years > 0) {
              totalYears += years;
              breakdown.experience.details.push(`  Entry ${idx + 1}: ${exp.startDate} to ${exp.endDate} = ${years.toFixed(1)} years`);
            }
          }
        });
        
        breakdown.experience.details.push(`Total calculated experience: ${totalYears.toFixed(1)} years`);
        
        if (totalYears >= minExp) {
          const excess = totalYears - minExp;
          const expScore = Math.min(20, 15 + (excess * 2));
          score += expScore;
          breakdown.experience.score = expScore;
          breakdown.experience.details.push(`✓ Meets requirement (exceeds by ${excess.toFixed(1)} years)`);
          breakdown.experience.details.push(`Score calculation: 15 base + (${excess.toFixed(1)} × 2) = ${expScore} points`);
        } else {
          breakdown.experience.details.push(`✗ Insufficient: ${totalYears.toFixed(1)} < ${minExp} (0 points)`);
        }
      } catch (e) {
        breakdown.experience.details.push(`✗ Error parsing teachingExperience: ${e.message} (0 points)`);
      }
    } else {
      breakdown.experience.details.push("✗ No experience data found (0 points)");
    }
  } else {
    breakdown.experience.details.push("No minimum experience requirement (not scored)");
  }

  // 4. Age Groups (15 points)
  maxScore += 15;
  breakdown.ageGroups.maxScore = 15;
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
    
    breakdown.ageGroups.details.push(`Job age range: ${jobMinAge}-${jobMaxAge} years`);
    breakdown.ageGroups.details.push(`Teacher age groups (profile): ${teacherAgeGroups.join(', ') || 'None'}`);
    breakdown.ageGroups.details.push(`Teacher age groups (teaching experience): ${teachingExpAgeGroups.join(', ') || 'None'}`);
    
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
        breakdown.ageGroups.details.push(`Checking ${ageGroup}: range [${range[0]}, ${range[1]}] vs job [${jobMinAge}, ${jobMaxAge}]`);
        if (range[0] <= jobMaxAge && range[1] >= jobMinAge) {
          hasOverlap = true;
          breakdown.ageGroups.details.push(`  ✓ Overlap found: ${ageGroup} overlaps with job range`);
        } else {
          breakdown.ageGroups.details.push(`  ✗ No overlap`);
        }
      } else {
        breakdown.ageGroups.details.push(`  ⚠ Unknown age group format: "${ageGroup}"`);
      }
    });
    
    if (hasOverlap) {
      score += 15;
      breakdown.ageGroups.score = 15;
      breakdown.ageGroups.details.push(`✓ Age group match (+15 points)`);
    } else {
      breakdown.ageGroups.details.push(`✗ No overlap found (0 points)`);
    }
  } else {
    breakdown.ageGroups.details.push("No age group requirement (not scored)");
  }

  // 5. Location (5 points)
  maxScore += 5;
  breakdown.location.maxScore = 5;
  const willingToRelocate = teacher.willingToRelocate;
  const preferredLocations = teacher.preferredLocations || [];
  const jobCountry = job.country?.toLowerCase();
  const jobCity = job.city?.toLowerCase();
  
  breakdown.location.details.push(`Job location: ${job.city}, ${job.country}`);
  breakdown.location.details.push(`Teacher willing to relocate: ${willingToRelocate}`);
  breakdown.location.details.push(`Teacher preferred locations: ${preferredLocations.join(', ') || 'None'}`);
  
  if (willingToRelocate) {
    score += 5;
    breakdown.location.score = 5;
    breakdown.location.details.push(`✓ Willing to relocate (+5 points)`);
  } else if (preferredLocations.some(loc => 
    loc.toLowerCase().includes(jobCountry) ||
    loc.toLowerCase().includes(jobCity)
  )) {
    score += 5;
    breakdown.location.score = 5;
    const matchingLoc = preferredLocations.find(loc => 
      loc.toLowerCase().includes(jobCountry) || loc.toLowerCase().includes(jobCity)
    );
    breakdown.location.details.push(`✓ Preferred location matches: "${matchingLoc}" (+5 points)`);
  } else {
    breakdown.location.details.push(`✗ No location match (0 points)`);
  }

  // Calculate percentage
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  
  return {
    percentage,
    score,
    maxScore,
    breakdown
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Find the "ESL Teacher" job posting
    const job = await retryOperation(async () => {
      return await prisma.job.findFirst({
        where: {
          title: {
            contains: "ESL Teacher",
            mode: "insensitive"
          },
          status: "ACTIVE"
        },
        include: {
          school: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });
    });

    if (!job) {
      return res.status(404).json({ error: "ESL Teacher job not found" });
    }

    const school = job.school;
    const jobs = [job];

    // Find teacher
    const user = await retryOperation(async () => {
      return await prisma.user.findUnique({
        where: {
          email: "TeacherTest@Teachertest.com"
        },
        include: {
          teacher: true
        }
      });
    });

    if (!user || !user.teacher) {
      return res.status(404).json({ error: "Teacher not found with email: TeacherTest@Teachertest.com" });
    }

    const teacher = user.teacher;

    // Fetch full teacher data including teachingExperience
    const fullTeacher = await retryOperation(async () => {
      return await prisma.teacher.findUnique({
        where: { id: teacher.id },
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

    // Analyze each job
    const analyses = jobs.map(job => {
      // Debug: Log raw requirements from database
      console.log(`Job ${job.id} ("${job.title}") raw requirements:`, job.requirements);
      console.log(`Job ${job.id} requirements type:`, typeof job.requirements);
      console.log(`Job ${job.id} requirements is null?:`, job.requirements === null);
      console.log(`Job ${job.id} requirements is undefined?:`, job.requirements === undefined);
      
      const match = calculateMatchStrength(job, fullTeacher);
      
      let jobRequirements = {};
      try {
        if (job.requirements) {
          jobRequirements = typeof job.requirements === 'string' 
            ? JSON.parse(job.requirements) 
            : job.requirements;
        }
      } catch (e) {
        console.error(`Error parsing requirements for job ${job.id}:`, e);
      }
      
      console.log(`Job ${job.id} parsed requirements:`, JSON.stringify(jobRequirements));

      return {
        job: {
          id: job.id,
          title: job.title,
          city: job.city,
          country: job.country,
          studentAgeGroupMin: job.studentAgeGroupMin,
          studentAgeGroupMax: job.studentAgeGroupMax,
          requirements: jobRequirements,
        },
        teacher: {
          id: fullTeacher.id,
          name: `${fullTeacher.firstName} ${fullTeacher.lastName}`,
          email: user.email,
          experienceYears: fullTeacher.experienceYears,
          certifications: fullTeacher.certifications || [],
          ageGroups: fullTeacher.ageGroups || [],
          willingToRelocate: fullTeacher.willingToRelocate,
          preferredLocations: fullTeacher.preferredLocations || [],
          education: fullTeacher.education || [],
          teachingExperience: fullTeacher.teachingExperience || [],
        },
        match: {
          percentage: match.percentage,
          score: match.score,
          maxScore: match.maxScore,
          strength: match.percentage >= 80 ? "STRONG" : match.percentage >= 60 ? "MEDIUM" : match.percentage >= 40 ? "PARTIAL" : "BELOW_THRESHOLD",
          breakdown: match.breakdown,
        }
      };
    });

    return res.status(200).json({
      school: {
        id: school.id,
        name: school.name,
      },
      teacher: {
        id: fullTeacher.id,
        name: `${fullTeacher.firstName} ${fullTeacher.lastName}`,
        email: user.email,
      },
      analyses,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return res.status(500).json({
      error: "Failed to analyze matches",
      message: error.message,
    });
  } finally {
    // In serverless, Prisma client is reused
    // await prisma.$disconnect();
  }
}

