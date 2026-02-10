import { prisma } from "../_utils/prisma.js";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Security: require an admin token header (set as Vercel env var ADMIN_DELETE_TOKEN)
  const adminToken = req.headers["x-admin-token"];
  if (!process.env.ADMIN_DELETE_TOKEN) {
    return res.status(500).json({
      error: "Server misconfigured: ADMIN_DELETE_TOKEN is not set",
    });
  }
  if (!adminToken || adminToken !== process.env.ADMIN_DELETE_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    schoolEmail,
    teacherEmailPrefix = "demo.teacher",
    teacherEmailDomain, // optional, e.g. "example.com"
    count = 10,
    confirm,
    dryRun = false,
  } = req.body || {};

  if (!schoolEmail || typeof schoolEmail !== "string") {
    return res.status(400).json({ error: "schoolEmail is required" });
  }

  const normalizedSchoolEmail = normalizeEmail(schoolEmail);
  const requiredConfirm = `DEMO_APPLY:${normalizedSchoolEmail}`;
  if (confirm !== requiredConfirm) {
    return res.status(400).json({
      error: `Confirmation required. Send { schoolEmail: "${normalizedSchoolEmail}", confirm: "${requiredConfirm}" }`,
    });
  }

  const demoResumeUrl = "https://www.nt-ca.com/demo-resume.txt";

  try {
    // Find the school user by email (case-insensitive, trimmed)
    const matchedIds = await prisma.$queryRaw`
      SELECT "id"
      FROM "users"
      WHERE TRIM(LOWER("email")) = TRIM(LOWER(${normalizedSchoolEmail}))
      LIMIT 1
    `;
    const schoolUserId = Array.isArray(matchedIds) ? matchedIds?.[0]?.id : null;
    if (!schoolUserId) {
      return res.status(404).json({ error: "School user not found for that email" });
    }

    const schoolUser = await prisma.user.findUnique({
      where: { id: schoolUserId },
      select: {
        id: true,
        email: true,
        userType: true,
        school: { select: { id: true, name: true } },
      },
    });

    if (!schoolUser || schoolUser.userType !== "SCHOOL" || !schoolUser.school) {
      return res.status(400).json({
        error: "Provided email is not a School account with a school profile",
      });
    }

    const jobs = await prisma.job.findMany({
      where: { schoolId: schoolUser.school.id },
      select: { id: true, title: true, status: true, deadline: true },
      orderBy: { createdAt: "desc" },
    });

    if (!jobs.length) {
      return res.status(200).json({
        success: true,
        message: "No jobs found for this school.",
        school: { email: schoolUser.email, name: schoolUser.school.name },
        jobsFound: 0,
        teachersFound: 0,
        createdApplications: 0,
        skippedExisting: 0,
      });
    }

    const take = Math.max(1, Math.min(50, parseInt(String(count), 10) || 10));
    const prefix = String(teacherEmailPrefix || "demo.teacher").trim().toLowerCase().replace(/\.+$/, "");
    const domain = teacherEmailDomain ? String(teacherEmailDomain).trim().toLowerCase() : null;

    const teachers = await prisma.user.findMany({
      where: {
        userType: "TEACHER",
        email: {
          startsWith: `${prefix}.`,
          ...(domain ? { endsWith: `@${domain}` } : {}),
        },
        teacher: { isNot: null },
      },
      select: {
        id: true,
        email: true,
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            resumeUrl: true,
            portfolioUrl: true,
          },
        },
      },
      orderBy: { email: "asc" },
      take,
    });

    if (!teachers.length) {
      return res.status(200).json({
        success: true,
        message: "No demo teachers found matching the requested prefix/domain.",
        school: { email: schoolUser.email, name: schoolUser.school.name },
        jobsFound: jobs.length,
        teachersFound: 0,
        createdApplications: 0,
        skippedExisting: 0,
      });
    }

    const jobIds = jobs.map((j) => j.id);
    const teacherIds = teachers.map((t) => t.teacher?.id).filter(Boolean);

    const existing = await prisma.application.findMany({
      where: {
        jobId: { in: jobIds },
        teacherId: { in: teacherIds },
      },
      select: { jobId: true, teacherId: true },
    });

    const existingKey = new Set(existing.map((a) => `${a.jobId}:${a.teacherId}`));

    const toCreate = [];
    for (const job of jobs) {
      for (const t of teachers) {
        const teacher = t.teacher;
        if (!teacher?.id) continue;

        const key = `${job.id}:${teacher.id}`;
        if (existingKey.has(key)) continue;

        toCreate.push({
          jobId: job.id,
          teacherId: teacher.id,
          status: "APPLIED",
          coverLetter:
            "Demo application (seeded) — interested in this role. Please contact to arrange an interview.",
          resumeUrl: teacher.resumeUrl || demoResumeUrl,
          portfolioUrl: teacher.portfolioUrl || null,
        });
      }
    }

    if (dryRun === true) {
      return res.status(200).json({
        success: true,
        dryRun: true,
        message: `Dry run: would create ${toCreate.length} applications`,
        school: { email: schoolUser.email, name: schoolUser.school.name },
        jobsFound: jobs.length,
        teachersFound: teachers.length,
        wouldCreateApplications: toCreate.length,
        skippedExisting: existing.length,
        demoResumeUrl,
      });
    }

    if (!toCreate.length) {
      return res.status(200).json({
        success: true,
        message: "No new applications to create (all already exist).",
        school: { email: schoolUser.email, name: schoolUser.school.name },
        jobsFound: jobs.length,
        teachersFound: teachers.length,
        createdApplications: 0,
        skippedExisting: existing.length,
      });
    }

    await prisma.application.createMany({
      data: toCreate,
    });

    return res.status(200).json({
      success: true,
      message: `Created ${toCreate.length} demo applications.`,
      school: { email: schoolUser.email, name: schoolUser.school.name },
      jobsFound: jobs.length,
      teachersFound: teachers.length,
      createdApplications: toCreate.length,
      skippedExisting: existing.length,
      demoResumeUrl,
    });
  } catch (error) {
    console.error("❌ Error creating demo applications:", error);
    return res.status(500).json({
      error: "Failed to create demo applications",
      message: error.message,
    });
  }
}


