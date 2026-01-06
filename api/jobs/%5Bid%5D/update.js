import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Middleware to verify JWT token
function verifyToken(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new Error("No token provided");

  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  if (req.method !== "PUT" && req.method !== "PATCH") {
    res.setHeader("Allow", ["PUT", "PATCH"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const decoded = verifyToken(req);
    const { id: jobId } = req.query;

    // Only schools can update jobs
    if (decoded.userType !== "SCHOOL") {
      return res
        .status(403)
        .json({ error: "Only schools can update job postings" });
    }

    // Get school profile
    const school = await prisma.school.findUnique({
      where: { userId: decoded.userId },
    });

    if (!school) {
      return res.status(404).json({ error: "School profile not found" });
    }

    // Get the existing job to verify ownership
    const existingJob = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!existingJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (existingJob.schoolId !== school.id) {
      return res
        .status(403)
        .json({ error: "You can only update your own job postings" });
    }

    // Extract update data from request body
    const {
      title,
      subjectsTaught,
      studentAgeGroupMin,
      studentAgeGroupMax,
      startDate,
      contractLength,
      description,
      city,
      country,
      salary,
      type,
      deadline,
      teachingHoursPerWeek,
      qualification,
      experience,
      language,
      visaRequired,
      teachingLicenseRequired,
      kazakhLanguageRequired,
      localCertificationRequired,
      benefits,
      requirements,
      status,
      useSchoolProfile,
      schoolDescription,
      useSchoolBenefits,
    } = req.body;

    // Build update data object
    const updateData = {};

    // Only include fields that are provided
    if (title !== undefined) updateData.title = title;
    if (subjectsTaught !== undefined) updateData.subjectsTaught = subjectsTaught || null;
    if (studentAgeGroupMin !== undefined) {
      const min = studentAgeGroupMin !== null && studentAgeGroupMin !== "" ? parseInt(studentAgeGroupMin) : null;
      updateData.studentAgeGroupMin = min !== null && !isNaN(min) && min >= 0 ? min : null;
    }
    if (studentAgeGroupMax !== undefined) {
      const max = studentAgeGroupMax !== null && studentAgeGroupMax !== "" ? parseInt(studentAgeGroupMax) : null;
      updateData.studentAgeGroupMax = max !== null && !isNaN(max) && max >= 0 ? max : null;
    }
    if (startDate !== undefined) {
      if (startDate && startDate !== "") {
        const startDateObj = new Date(startDate);
        updateData.startDate = !isNaN(startDateObj.getTime()) ? startDateObj : null;
      } else {
        updateData.startDate = null;
      }
    }
    if (contractLength !== undefined) updateData.contractLength = contractLength || null;
    if (description !== undefined) updateData.description = description;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (salary !== undefined) updateData.salary = salary;
    if (type !== undefined) updateData.type = type.toUpperCase();
    if (deadline !== undefined) updateData.deadline = new Date(deadline);
    if (teachingHoursPerWeek !== undefined) updateData.teachingHoursPerWeek = teachingHoursPerWeek || null;
    if (qualification !== undefined) updateData.qualification = qualification;
    if (experience !== undefined) updateData.experience = experience;
    if (language !== undefined) updateData.language = language;
    if (visaRequired !== undefined) updateData.visaRequired = visaRequired;
    if (teachingLicenseRequired !== undefined)
      updateData.teachingLicenseRequired = teachingLicenseRequired;
    if (kazakhLanguageRequired !== undefined)
      updateData.kazakhLanguageRequired = kazakhLanguageRequired;
    if (localCertificationRequired !== undefined)
      updateData.localCertificationRequired = localCertificationRequired;
    if (benefits !== undefined) updateData.benefits = benefits;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (useSchoolProfile !== undefined)
      updateData.useSchoolProfile = useSchoolProfile;
    if (schoolDescription !== undefined)
      updateData.schoolDescription = schoolDescription;
    if (useSchoolBenefits !== undefined)
      updateData.useSchoolBenefits = useSchoolBenefits;

    // Handle status separately with validation
    if (status !== undefined) {
      const validStatuses = ["DRAFT", "ACTIVE", "PAUSED", "CLOSED"];
      if (!validStatuses.includes(status.toUpperCase())) {
        return res.status(400).json({
          error: "Invalid status. Must be DRAFT, ACTIVE, PAUSED, or CLOSED",
        });
      }
      updateData.status = status.toUpperCase();
    }

    // Update the job
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        school: true,
        _count: {
          select: { applications: true },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: decoded.userId,
        action: "JOB_UPDATED",
        details: {
          jobId: jobId,
          title: updatedJob.title,
          changes: Object.keys(updateData),
        },
        ipAddress:
          req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
      },
    });

    return res.status(200).json({
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Job update error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }

    return res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    await prisma.$disconnect();
  }
}
