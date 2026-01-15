const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Calculate match strength between job and teacher (same as API)
function calculateMatchStrength(job, teacher) {
  let score = 0;
  let maxScore = 0;
  
  // Parse job requirements
  let jobRequirements = {};
  try {
    if (job.requirements) {
      jobRequirements = JSON.parse(job.requirements);
    }
  } catch (e) {
    console.error("Error parsing job requirements:", e);
  }

  const breakdown = {
    qualifications: { score: 0, maxScore: 0, details: [] },
    degree: { score: 0, maxScore: 0, details: [] },
    experience: { score: 0, maxScore: 0, details: [] },
    ageGroups: { score: 0, maxScore: 0, details: [] },
    location: { score: 0, maxScore: 0, details: [] },
  };

  // 1. Qualifications (20 points)
  maxScore += 20;
  breakdown.qualifications.maxScore = 20;
  
  if (jobRequirements.tefl) {
    const hasTEFL = teacher.certifications?.some(cert => 
      cert.toLowerCase().includes('tefl')
    ) || teacher.education?.some(edu => 
      edu?.degree?.toLowerCase().includes('tefl')
    );
    if (hasTEFL) {
      score += 5;
      breakdown.qualifications.score += 5;
      breakdown.qualifications.details.push("TEFL: +5 points");
    } else {
      breakdown.qualifications.details.push("TEFL: Required but not found (0 points)");
    }
  }
  
  if (jobRequirements.celta) {
    const hasCELTA = teacher.certifications?.some(cert => 
      cert.toLowerCase().includes('celta')
    ) || teacher.education?.some(edu => 
      edu?.degree?.toLowerCase().includes('celta')
    );
    if (hasCELTA) {
      score += 5;
      breakdown.qualifications.score += 5;
      breakdown.qualifications.details.push("CELTA: +5 points");
    } else {
      breakdown.qualifications.details.push("CELTA: Required but not found (0 points)");
    }
  }
  
  if (jobRequirements.tesol) {
    const hasTESOL = teacher.certifications?.some(cert => 
      cert.toLowerCase().includes('tesol')
    ) || teacher.education?.some(edu => 
      edu?.degree?.toLowerCase().includes('tesol')
    );
    if (hasTESOL) {
      score += 5;
      breakdown.qualifications.score += 5;
      breakdown.qualifications.details.push("TESOL: +5 points");
    } else {
      breakdown.qualifications.details.push("TESOL: Required but not found (0 points)");
    }
  }
  
  if (jobRequirements.delta) {
    const hasDELTA = teacher.certifications?.some(cert => 
      cert.toLowerCase().includes('delta')
    ) || teacher.education?.some(edu => 
      edu?.degree?.toLowerCase().includes('delta')
    );
    if (hasDELTA) {
      score += 5;
      breakdown.qualifications.score += 5;
      breakdown.qualifications.details.push("DELTA: +5 points");
    } else {
      breakdown.qualifications.details.push("DELTA: Required but not found (0 points)");
    }
  }

  // 2. Degree (15 points)
  maxScore += 15;
  breakdown.degree.maxScore = 15;
  if (jobRequirements.bachelorsDegree) {
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
      breakdown.degree.details.push(`Degree found: ${degreeFound?.degree || 'Unknown'} (+15 points)`);
    } else {
      breakdown.degree.details.push("Bachelor's degree: Required but not found (0 points)");
    }
  } else {
    breakdown.degree.details.push("No degree requirement");
  }

  // 3. Experience (20 points)
  maxScore += 20;
  breakdown.experience.maxScore = 20;
  if (jobRequirements.minimumTeachingExperience) {
    const minExp = parseInt(jobRequirements.minimumTeachingExperience) || 0;
    breakdown.experience.details.push(`Job requires: ${minExp} years minimum`);
    
    // Check experienceYears first
    if (teacher.experienceYears && teacher.experienceYears >= minExp) {
      const excess = teacher.experienceYears - minExp;
      const expScore = Math.min(20, 15 + (excess * 2));
      score += expScore;
      breakdown.experience.score = expScore;
      breakdown.experience.details.push(`Teacher has: ${teacher.experienceYears} years (exceeds by ${excess} years)`);
      breakdown.experience.details.push(`Score: 15 base + (${excess} × 2) = ${expScore} points`);
    } else if (teacher.teachingExperience) {
      // Fallback: check teachingExperience array
      try {
        const teachingExp = Array.isArray(teacher.teachingExperience) 
          ? teacher.teachingExperience 
          : JSON.parse(teacher.teachingExperience || '[]');
        
        let totalYears = 0;
        teachingExp.forEach(exp => {
          if (exp.startDate && exp.endDate) {
            const start = new Date(exp.startDate);
            const end = exp.endDate.toLowerCase() === 'present' ? new Date() : new Date(exp.endDate);
            const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
            if (years > 0) totalYears += years;
          }
        });
        
        breakdown.experience.details.push(`Calculated from teachingExperience: ${totalYears.toFixed(1)} years`);
        
        if (totalYears >= minExp) {
          const excess = totalYears - minExp;
          const expScore = Math.min(20, 15 + (excess * 2));
          score += expScore;
          breakdown.experience.score = expScore;
          breakdown.experience.details.push(`Score: 15 base + (${excess.toFixed(1)} × 2) = ${expScore} points`);
        } else {
          breakdown.experience.details.push(`Insufficient experience: ${totalYears.toFixed(1)} < ${minExp} (0 points)`);
        }
      } catch (e) {
        breakdown.experience.details.push(`Error parsing teachingExperience: ${e.message}`);
      }
    } else {
      breakdown.experience.details.push(`No experience data found (0 points)`);
    }
  } else {
    breakdown.experience.details.push("No minimum experience requirement");
  }

  // 4. Age Groups (15 points)
  maxScore += 15;
  breakdown.ageGroups.maxScore = 15;
  if (job.studentAgeGroupMin !== null && job.studentAgeGroupMax !== null) {
    const teacherAgeGroups = teacher.ageGroups || [];
    const jobMinAge = job.studentAgeGroupMin;
    const jobMaxAge = job.studentAgeGroupMax;
    
    breakdown.ageGroups.details.push(`Job age range: ${jobMinAge}-${jobMaxAge} years`);
    breakdown.ageGroups.details.push(`Teacher age groups: ${teacherAgeGroups.join(', ') || 'None'}`);
    
    const ageGroupRanges = {
      "0-5": [0, 5],
      "6-11": [6, 11],
      "12-14": [12, 14],
      "15-18": [15, 18],
      "19-30": [19, 30],
      "30+": [30, 100]
    };
    
    let hasOverlap = false;
    teacherAgeGroups.forEach(ageGroup => {
      const range = ageGroupRanges[ageGroup];
      if (range) {
        if (range[0] <= jobMaxAge && range[1] >= jobMinAge) {
          hasOverlap = true;
          breakdown.ageGroups.details.push(`Overlap found: ${ageGroup} (${range[0]}-${range[1]}) overlaps with job range`);
        }
      }
    });
    
    if (hasOverlap) {
      score += 15;
      breakdown.ageGroups.score = 15;
      breakdown.ageGroups.details.push("+15 points");
    } else {
      breakdown.ageGroups.details.push("No overlap found (0 points)");
    }
  } else {
    breakdown.ageGroups.details.push("No age group requirement");
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
  
  if (willingToRelocate || 
      preferredLocations.some(loc => 
        loc.toLowerCase().includes(jobCountry) ||
        loc.toLowerCase().includes(jobCity)
      )) {
    score += 5;
    breakdown.location.score = 5;
    if (willingToRelocate) {
      breakdown.location.details.push("+5 points (willing to relocate)");
    } else {
      breakdown.location.details.push(`+5 points (preferred location matches: ${preferredLocations.find(loc => 
        loc.toLowerCase().includes(jobCountry) || loc.toLowerCase().includes(jobCity)
      )})`);
    }
  } else {
    breakdown.location.details.push("No location match (0 points)");
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

async function main() {
  try {
    // Find Forest School 2.0
    const school = await prisma.school.findFirst({
      where: {
        name: {
          contains: "Forest School",
          mode: "insensitive"
        }
      },
      include: {
        jobs: {
          where: {
            status: "ACTIVE"
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });

    if (!school) {
      console.log("Forest School 2.0 not found");
      return;
    }

    console.log(`\n=== Found School: ${school.name} ===`);
    console.log(`Active Jobs: ${school.jobs.length}\n`);

    // Find teacher
    const user = await prisma.user.findUnique({
      where: {
        email: "TeacherTest@Teachertest.com"
      },
      include: {
        teacher: true
      }
    });

    if (!user || !user.teacher) {
      console.log("Teacher not found with email: TeacherTest@Teachertest.com");
      return;
    }

    const teacher = user.teacher;
    console.log(`\n=== Teacher Profile ===`);
    console.log(`Name: ${teacher.firstName} ${teacher.lastName}`);
    console.log(`Email: ${user.email}`);
    console.log(`Experience Years: ${teacher.experienceYears || 'Not set'}`);
    console.log(`Certifications: ${(teacher.certifications || []).join(', ') || 'None'}`);
    console.log(`Age Groups: ${(teacher.ageGroups || []).join(', ') || 'None'}`);
    console.log(`Willing to Relocate: ${teacher.willingToRelocate}`);
    console.log(`Preferred Locations: ${(teacher.preferredLocations || []).join(', ') || 'None'}`);
    console.log(`Education: ${JSON.stringify(teacher.education || [], null, 2)}`);
    console.log(`Teaching Experience: ${JSON.stringify(teacher.teachingExperience || [], null, 2)}`);

    // Analyze each job
    for (const job of school.jobs) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`\nJOB: ${job.title}`);
      console.log(`ID: ${job.id}`);
      console.log(`Location: ${job.city}, ${job.country}`);
      console.log(`Age Range: ${job.studentAgeGroupMin || 'N/A'}-${job.studentAgeGroupMax || 'N/A'}`);
      
      let jobRequirements = {};
      try {
        if (job.requirements) {
          jobRequirements = JSON.parse(job.requirements);
          console.log(`\nJob Requirements:`);
          console.log(`  TEFL: ${jobRequirements.tefl || false}`);
          console.log(`  CELTA: ${jobRequirements.celta || false}`);
          console.log(`  TESOL: ${jobRequirements.tesol || false}`);
          console.log(`  DELTA: ${jobRequirements.delta || false}`);
          console.log(`  Bachelor's Degree: ${jobRequirements.bachelorsDegree || false}`);
          console.log(`  Minimum Experience: ${jobRequirements.minimumTeachingExperience || 'Not specified'} years`);
        }
      } catch (e) {
        console.log(`Error parsing requirements: ${e.message}`);
      }

      const match = calculateMatchStrength(job, teacher);
      
      console.log(`\n--- MATCHING BREAKDOWN ---`);
      console.log(`\n1. QUALIFICATIONS (${match.breakdown.qualifications.score}/${match.breakdown.qualifications.maxScore} points):`);
      match.breakdown.qualifications.details.forEach(d => console.log(`   ${d}`));
      
      console.log(`\n2. DEGREE (${match.breakdown.degree.score}/${match.breakdown.degree.maxScore} points):`);
      match.breakdown.degree.details.forEach(d => console.log(`   ${d}`));
      
      console.log(`\n3. EXPERIENCE (${match.breakdown.experience.score}/${match.breakdown.experience.maxScore} points):`);
      match.breakdown.experience.details.forEach(d => console.log(`   ${d}`));
      
      console.log(`\n4. AGE GROUPS (${match.breakdown.ageGroups.score}/${match.breakdown.ageGroups.maxScore} points):`);
      match.breakdown.ageGroups.details.forEach(d => console.log(`   ${d}`));
      
      console.log(`\n5. LOCATION (${match.breakdown.location.score}/${match.breakdown.location.maxScore} points):`);
      match.breakdown.location.details.forEach(d => console.log(`   ${d}`));
      
      console.log(`\n--- FINAL SCORE ---`);
      console.log(`Total Score: ${match.score}/${match.maxScore} points`);
      console.log(`Match Percentage: ${match.percentage}%`);
      
      if (match.percentage >= 80) {
        console.log(`Match Strength: STRONG (80-100%)`);
      } else if (match.percentage >= 60) {
        console.log(`Match Strength: MEDIUM (60-79%)`);
      } else if (match.percentage >= 40) {
        console.log(`Match Strength: PARTIAL (40-59%)`);
      } else {
        console.log(`Match Strength: BELOW THRESHOLD (<40%)`);
      }
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);

