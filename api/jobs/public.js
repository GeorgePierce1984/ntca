import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const {
      page = 1,
      limit = 20,
      search,
      country, // Can be array
      city,
      job_type, // Can be array
      salary_min,
      salary_max,
      show_undisclosed,
      contract_length, // Can be array
      experience, // Can be array
      qualification, // Can be array
      teaching_context, // Can be array
      visa_requirement,
      school_type, // Can be array
      student_age, // Can be array
      start_date,
      deadline, // deadline filter
      sort = "latest",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get start of today (midnight) for deadline comparison
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Build search filters - always start with base conditions
    const where = {
      status: "ACTIVE",
      deadline: {
        gte: startOfToday,
      },
    };

    // Text search in title and description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
      ];
    }

    // Country filter (multi-select)
    const countries = Array.isArray(country) ? country : country ? [country] : [];
    if (countries.length > 0) {
      where.country = {
        in: countries.map(c => c.trim()),
        mode: "insensitive",
      };
    }

    // City filter
    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    // Job Type filter (multi-select) - Full-time, Part-time, Contract
    const jobTypes = Array.isArray(job_type) ? job_type : job_type ? [job_type] : [];
    if (jobTypes.length > 0) {
      where.type = {
        in: jobTypes.map(t => {
          const normalized = t.toUpperCase().replace("-", "_");
          // Map to database values
          if (normalized === "FULL_TIME" || normalized === "FULLTIME") return "FULL_TIME";
          if (normalized === "PART_TIME" || normalized === "PARTTIME") return "PART_TIME";
          if (normalized === "CONTRACT") return "CONTRACT";
          return normalized;
        }),
      };
    }

    // Online Experience filter - checks requirements JSON for onlineExperience
    if (req.query.online_experience === "true") {
      // This will be handled by filtering results after fetching
      // We'll add a condition to check requirements JSON
    }

    // Salary range filter - Note: Salary is stored as string, filtering will be done post-query
    // We'll filter results after fetching since salary format may vary

    // Contract Length filter (multi-select)
    const contractLengths = Array.isArray(contract_length) ? contract_length : contract_length ? [contract_length] : [];
    if (contractLengths.length > 0) {
      const contractConditions = contractLengths.map(cl => {
        if (cl === "< 6 months") {
          return {
            OR: [
              { contractLength: { contains: "1 month", mode: "insensitive" } },
              { contractLength: { contains: "2 month", mode: "insensitive" } },
              { contractLength: { contains: "3 month", mode: "insensitive" } },
              { contractLength: { contains: "4 month", mode: "insensitive" } },
              { contractLength: { contains: "5 month", mode: "insensitive" } },
            ],
          };
        } else if (cl === "6–9 months") {
          return {
            OR: [
              { contractLength: { contains: "6 month", mode: "insensitive" } },
              { contractLength: { contains: "7 month", mode: "insensitive" } },
              { contractLength: { contains: "8 month", mode: "insensitive" } },
              { contractLength: { contains: "9 month", mode: "insensitive" } },
            ],
          };
        } else if (cl === "9-12 months") {
          return {
            OR: [
              { contractLength: { contains: "9 month", mode: "insensitive" } },
              { contractLength: { contains: "10 month", mode: "insensitive" } },
              { contractLength: { contains: "11 month", mode: "insensitive" } },
              { contractLength: { contains: "12 month", mode: "insensitive" } },
            ],
          };
        } else if (cl === "Greater than 12 months") {
          // This will be handled in post-filtering to calculate total months correctly
          // For now, include all contracts that might be > 12 months (have "year" in them or are > 12 months)
          return {
            OR: [
              { contractLength: { contains: "year", mode: "insensitive" } },
              { contractLength: { contains: "13 month", mode: "insensitive" } },
              { contractLength: { contains: "14 month", mode: "insensitive" } },
              { contractLength: { contains: "15 month", mode: "insensitive" } },
              { contractLength: { contains: "16 month", mode: "insensitive" } },
              { contractLength: { contains: "17 month", mode: "insensitive" } },
              { contractLength: { contains: "18 month", mode: "insensitive" } },
              { contractLength: { contains: "19 month", mode: "insensitive" } },
              { contractLength: { contains: "20 month", mode: "insensitive" } },
              { contractLength: { contains: "21 month", mode: "insensitive" } },
              { contractLength: { contains: "22 month", mode: "insensitive" } },
              { contractLength: { contains: "23 month", mode: "insensitive" } },
              { contractLength: { contains: "24 month", mode: "insensitive" } },
            ],
          };
        }
        return { contractLength: { contains: cl, mode: "insensitive" } };
      });
      
      if (!where.AND) {
        where.AND = [];
      }
      // For contract length, we want OR within the group
      where.AND.push({ OR: contractConditions });
    }

    // Experience Level filter
    const experiences = Array.isArray(experience) ? experience : experience ? [experience] : [];
    if (experiences.length > 0) {
      // This would need to parse requirements JSON to check experience
      // For now, we'll add a placeholder
    }

    // Qualifications filter (multi-select)
    const qualifications = Array.isArray(qualification) ? qualification : qualification ? [qualification] : [];
    if (qualifications.length > 0) {
      // This would need to parse requirements JSON
      // Placeholder for now
    }

    // Teaching Context filter - handled in post-filtering section below

    // Visa Requirement filter - handled in post-filtering since it's in requirements JSON
    // This will be checked in the post-filtering section below

    // School Type filter
    const schoolTypes = Array.isArray(school_type) ? school_type : school_type ? [school_type] : [];
    if (schoolTypes.length > 0) {
      where.school = {
        ...(where.school || {}),
        schoolType: {
          in: schoolTypes.map(st => {
            // Map to database values
            const typeMap = {
              "Language centre": "Language Centre",
              "International school": "International School",
              "Private school": "Private School",
              "University": "University",
              "Public school": "Public School",
            };
            return typeMap[st] || st;
          }),
          mode: "insensitive",
        },
      };
    }

    // Student Age Group filter
    const studentAges = Array.isArray(student_age) ? student_age : student_age ? [student_age] : [];
    if (studentAges.length > 0) {
      // This would need to check studentAgeGroupMin/Max fields
      // Placeholder for now
    }

    // Start Date filter
    if (start_date) {
      const now = new Date();
      if (start_date === "immediate") {
        // Jobs starting immediately or soon
        where.startDate = {
          lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // Within 30 days
        };
      } else if (start_date === "1-3_months") {
        where.startDate = {
          gte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          lte: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        };
      } else if (start_date === "greater_than_3_months") {
        // Greater than 3 months (> 90 days)
        where.startDate = {
          gte: new Date(now.getTime() + 91 * 24 * 60 * 60 * 1000), // More than 90 days
        };
      }
    }

    // Application Deadline filter
    if (deadline) {
      const now = new Date();
      if (deadline === "closing_soon") {
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        where.deadline = {
          lte: sevenDaysFromNow,
          gte: now,
        };
      } else if (deadline === "8-30_days") {
        const eightDaysFromNow = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        where.deadline = {
          gte: eightDaysFromNow,
          lte: thirtyDaysFromNow,
        };
      } else if (deadline === "rolling") {
        // Over 30 days - deadlines more than 30 days away
        where.deadline = {
          gte: new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000), // More than 30 days
        };
      }
    }

    // Sort options
    let orderBy = { createdAt: "desc" }; // default: latest

    switch (sort) {
      case "salary_high":
        orderBy = { salary: "desc" };
        break;
      case "salary_low":
        orderBy = { salary: "asc" };
        break;
      case "deadline":
        orderBy = { deadline: "asc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Check if we need post-filtering (salary, online experience, qualifications, experience, teaching context, contract length > 12 months, visa requirement, or student age groups)
    // Only when salary values are non-default or online_experience is explicitly set or qualifications/experience/teaching context are selected
    const experienceMin = req.query.experience_min ? parseInt(req.query.experience_min) : 0;
    const teachingContexts = Array.isArray(teaching_context) ? teaching_context : teaching_context ? [teaching_context] : [];
    // contractLengths and studentAges already declared above, reuse them
    const hasGreaterThan12Months = contractLengths.includes("Greater than 12 months");
    const needsPostFiltering = (salary_min && parseInt(salary_min) > 0) || 
                               (salary_max && parseInt(salary_max) < 10000) || 
                               req.query.online_experience === "true" ||
                               (qualifications && qualifications.length > 0) ||
                               experienceMin > 0 ||
                               (teachingContexts && teachingContexts.length > 0) ||
                               hasGreaterThan12Months ||
                               (visa_requirement && visa_requirement !== "") ||
                               (studentAges && studentAges.length > 0);

    // Fetch jobs - if we need post-filtering, fetch more than needed
    const fetchLimit = needsPostFiltering ? parseInt(limit) * 3 : parseInt(limit);

    console.log('API: Fetching jobs with where clause:', JSON.stringify(where, null, 2));
    console.log('API: Skip:', needsPostFiltering ? 0 : skip, 'Take:', fetchLimit, 'NeedsPostFiltering:', needsPostFiltering);

    let [jobs, totalJobs] = await Promise.all([
      prisma.job.findMany({
        where,
        skip: needsPostFiltering ? 0 : skip,
        take: fetchLimit,
        orderBy,
        include: {
          school: {
            select: {
              id: true,
              name: true,
              city: true,
              country: true,
              logoUrl: true,
              verified: true,
              description: true,
              schoolType: true, // Added for school type filter
            },
          },
          _count: {
            select: { applications: true },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    console.log('API: Found', jobs.length, 'jobs before post-filtering, total:', totalJobs);
    console.log('API: Teaching contexts filter:', JSON.stringify(teachingContexts), 'length:', teachingContexts?.length);
    console.log('API: Needs post-filtering:', needsPostFiltering);

    if (needsPostFiltering) {
      jobs = jobs.filter(job => {
        // Salary filter
        if ((salary_min && parseInt(salary_min) > 0) || (salary_max && parseInt(salary_max) < 10000)) {
          // Extract numeric value from salary string (e.g., "$2,800 - $3,500/month" -> use first number)
          const salaryMatch = job.salary?.match(/\$?([\d,]+)/);
          if (salaryMatch) {
            const salaryValue = parseInt(salaryMatch[1].replace(/,/g, ''));
            if (salary_min && parseInt(salary_min) > 0 && salaryValue < parseInt(salary_min)) return false;
            if (salary_max && parseInt(salary_max) < 10000) {
              const maxValue = parseInt(salary_max);
              if (salaryValue > maxValue) return false;
            }
          } else {
            // If no salary found and we have salary filters, exclude
            if (salary_min && parseInt(salary_min) > 0) return false;
            if (salary_max && parseInt(salary_max) < 10000) return false;
          }
        }

        // Online experience filter
        if (req.query.online_experience === "true") {
          try {
            if (job.requirements) {
              const requirements = JSON.parse(job.requirements);
              if (!requirements.onlineExperience) return false;
            } else {
              return false;
            }
          } catch (e) {
            return false;
          }
        }

        // Qualifications filter
        if (qualifications && qualifications.length > 0) {
          try {
            if (job.requirements) {
              const requirements = JSON.parse(job.requirements);
              
              // Map frontend filter values to database field names
              const qualificationMap = {
                "Degree required": "bachelorsDegree",
                "TEFL": "tefl",
                "TESOL": "tesol",
                "CELTA": "celta",
                "DELTA": "delta", // If DELTA exists in requirements
              };
              
              // Check if at least one selected qualification matches
              const hasMatchingQualification = qualifications.some(qual => {
                const dbField = qualificationMap[qual];
                if (!dbField) return false;
                return requirements[dbField] === true;
              });
              
              if (!hasMatchingQualification) return false;
            } else {
              // If no requirements JSON, exclude jobs that require qualifications
              return false;
            }
          } catch (e) {
            // If parsing fails, exclude the job
            return false;
          }
        }

        // Minimum Teaching Experience filter
        if (experienceMin > 0) {
          try {
            if (job.requirements) {
              const requirements = JSON.parse(job.requirements);
              const jobMinExperience = requirements.minimumTeachingExperience;
              
              if (jobMinExperience) {
                // Extract numeric value from string (e.g., "3+ years" -> 3, "1-2 years" -> 1)
                const experienceMatch = jobMinExperience.toString().match(/(\d+)/);
                if (experienceMatch) {
                  const jobExperienceYears = parseInt(experienceMatch[1]);
                  // Job must require at least the minimum experience we're filtering for
                  if (jobExperienceYears < experienceMin) return false;
                } else {
                  // If we can't parse the experience, exclude it if filter is set
                  return false;
                }
              } else {
                // If no minimum experience specified, exclude if filter requires experience
                return false;
              }
            } else {
              // If no requirements JSON, exclude jobs when experience filter is set
              return false;
            }
          } catch (e) {
            // If parsing fails, exclude the job
            return false;
          }
        }

        // Teaching Context filter
        if (teachingContexts && teachingContexts.length > 0) {
          let hasClassroom = false;
          let hasOnline = false;
          
          try {
            if (job.requirements) {
              const requirements = JSON.parse(job.requirements);
              // Check if fields exist and are true
              hasClassroom = requirements.classroomExperience === true;
              hasOnline = requirements.onlineExperience === true;
            }
            // If no requirements JSON or fields don't exist, both default to false
          } catch (e) {
            // If parsing fails, treat as no experience
            hasClassroom = false;
            hasOnline = false;
          }
          
          // If both are false or missing, treat as no experience specified
          const hasNoExperience = !hasClassroom && !hasOnline;
          const hasBoth = hasClassroom && hasOnline;
          
          // Check if job matches any selected filter
          const matchesFilter = teachingContexts.some(context => {
            if (context === "Classroom") {
              // Classroom only: has classroom AND NOT online
              return hasClassroom && !hasOnline;
            } else if (context === "Online") {
              // Online only: has online AND NOT classroom
              return hasOnline && !hasClassroom;
            } else if (context === "Both") {
              // Both: has classroom AND online, OR has no experience specified
              return hasBoth || hasNoExperience;
            }
            return false;
          });
          
          if (!matchesFilter) {
            console.log('Teaching context filter excluded job:', job.id, 'hasClassroom:', hasClassroom, 'hasOnline:', hasOnline, 'selected:', teachingContexts);
            return false;
          }
        }

        // Contract Length filter - "Greater than 12 months" (post-filtering for accurate calculation)
        if (hasGreaterThan12Months) {
          if (!job.contractLength || job.contractLength === "N/A") {
            return false;
          }
          
          // Parse contract length to calculate total months
          let totalMonths = 0;
          
          // Extract years (e.g., "1 year" or "2 years")
          const yearMatch = job.contractLength.match(/(\d+)\s+year/i);
          if (yearMatch) {
            totalMonths += parseInt(yearMatch[1]) * 12;
          }
          
          // Extract months (e.g., "1 month" or "3 months")
          const monthMatch = job.contractLength.match(/(\d+)\s+month/i);
          if (monthMatch) {
            totalMonths += parseInt(monthMatch[1]);
          }
          
          // If total months is not > 12, exclude this job
          if (totalMonths <= 12) {
            console.log('Contract length filter excluded job:', job.id, 'contractLength:', job.contractLength, 'totalMonths:', totalMonths);
            return false;
          }
        }

        // Visa Requirement filter
        if (visa_requirement && visa_requirement !== "") {
          try {
            if (job.requirements) {
              const requirements = JSON.parse(job.requirements);
              const jobVisaSupport = requirements.visaSupport;
              
              // Check if job's visa support matches the filter
              if (jobVisaSupport !== visa_requirement) {
                return false;
              }
            } else {
              // If no requirements JSON, exclude if filter is set
              return false;
            }
          } catch (e) {
            // If parsing fails, exclude the job
            return false;
          }
        }

        // Student Age Group filter
        if (studentAges && studentAges.length > 0) {
          // Map age group strings to min/max ranges
          const ageGroupMap = {
            "0-5": { min: 0, max: 5 },
            "6-11": { min: 6, max: 11 },
            "12-14": { min: 12, max: 14 },
            "15-18": { min: 15, max: 18 },
            "19-30": { min: 19, max: 30 },
            "30+": { min: 30, max: null }, // 30+ means 30 or older
          };
          
          // Check if job's age range overlaps with any selected age group
          const jobMinAge = job.studentAgeGroupMin ?? 0;
          const jobMaxAge = job.studentAgeGroupMax ?? 30; // Default to 30 if not set
          
          const matchesAgeGroup = studentAges.some(ageGroup => {
            const range = ageGroupMap[ageGroup];
            if (!range) return false;
            
            // For "30+", check if job max is >= 30
            if (ageGroup === "30+") {
              return jobMaxAge >= 30;
            }
            
            // Check for overlap: job range overlaps with filter range if:
            // jobMin <= range.max AND jobMax >= range.min
            return jobMinAge <= range.max && jobMaxAge >= range.min;
          });
          
          if (!matchesAgeGroup) {
            return false;
          }
        }

        return true;
      });

      // Recalculate total after filtering
      totalJobs = jobs.length;
      console.log('API: After post-filtering, found', jobs.length, 'jobs (totalJobs:', totalJobs, ')');
      
      // Apply pagination after filtering
      jobs = jobs.slice(skip, skip + parseInt(limit));
      console.log('API: After pagination (skip:', skip, 'limit:', parseInt(limit), '), returning', jobs.length, 'jobs');
    }

    const totalPages = Math.ceil(totalJobs / parseInt(limit));

    return res.status(200).json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalJobs,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Public jobs API error:", error);

    return res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
