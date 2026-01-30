import { PrismaClient } from "@prisma/client";

/**
 * Seed demo teacher accounts for marketplace bootstrapping.
 *
 * Tags:
 * - Email prefix: demo.teacher.<NNNN>@example.com (configurable)
 *
 * Usage:
 *   node scripts/seed-demo-teachers.mjs
 *   node scripts/seed-demo-teachers.mjs --count=200
 *   node scripts/seed-demo-teachers.mjs --count=50 --start=201
 *   node scripts/seed-demo-teachers.mjs --prefix=demo.teacher --domain=example.com
 *
 * Requires:
 *   DATABASE_URL env var (point it at your desired DB)
 */

const prisma = new PrismaClient();

function arg(name, fallback = undefined) {
  const match = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (!match) return fallback;
  return match.split("=").slice(1).join("=");
}

const COUNT = Math.max(1, parseInt(arg("count", "200"), 10) || 200);
const START = Math.max(1, parseInt(arg("start", "1"), 10) || 1);
const PREFIX = (arg("prefix", "demo.teacher") || "demo.teacher").replace(/\.+$/, "");
const DOMAIN = (arg("domain", "example.com") || "example.com").trim();
const DRY_RUN = (arg("dryRun", "false") || "false").toLowerCase() === "true";

const NATIONALITIES = [
  { label: "United States", weight: 0.32 },
  { label: "United Kingdom", weight: 0.28 },
  { label: "Canada", weight: 0.20 },
  { label: "Australia", weight: 0.20 },
];

const FIRST_NAMES = [
  "Alex", "Sam", "Jamie", "Taylor", "Jordan", "Morgan", "Casey", "Riley",
  "Avery", "Cameron", "Chris", "Pat", "Drew", "Quinn", "Skyler", "Hayden",
  "Emma", "Olivia", "Sophia", "Isabella", "Mia", "Amelia", "Charlotte", "Ava",
  "Noah", "Liam", "Mason", "Ethan", "Lucas", "Logan", "James", "Benjamin",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
];

const CERT_POOLS = [
  ["TEFL"],
  ["TESOL"],
  ["CELTA"],
  ["TEFL", "TESOL"],
  ["TEFL", "CELTA"],
  ["TESOL", "CELTA"],
  ["TEFL", "TESOL", "CELTA"],
];

const DEGREE_POOLS = [
  { degree: "Bachelor of Arts", field: "English" },
  { degree: "Bachelor of Education", field: "Education" },
  { degree: "Bachelor of Science", field: "Linguistics" },
  { degree: "Master of Arts", field: "TESOL" },
  { degree: "Master of Education", field: "Education" },
];

const AGE_GROUP_POOLS = [
  ["Kids (5-12)", "Teens (13-17)"],
  ["Teens (13-17)", "Adults (18+)"],
  ["Kids (5-12)"],
  ["Adults (18+)"],
  ["Kids (5-12)", "Adults (18+)"],
];

const SUBJECT_POOLS = [
  ["English"],
  ["English", "IELTS"],
  ["English", "Cambridge"],
  ["English", "Business English"],
  ["English", "Phonics"],
  ["English", "SAT"],
];

const KZ_CITIES = ["Almaty", "Astana", "Shymkent", "Karaganda", "Aktobe"];

function weightedPick(items) {
  const r = Math.random();
  let acc = 0;
  for (const it of items) {
    acc += it.weight;
    if (r <= acc) return it.label;
  }
  return items[items.length - 1].label;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pad4(n) {
  return String(n).padStart(4, "0");
}

function demoEmail(i) {
  return `${PREFIX}.${pad4(i)}@${DOMAIN}`.toLowerCase();
}

function buildTeacherProfile(i) {
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const nationality = weightedPick(NATIONALITIES);

  const certs = pick(CERT_POOLS);
  const deg = pick(DEGREE_POOLS);
  const ageGroups = pick(AGE_GROUP_POOLS);
  const subjects = pick(SUBJECT_POOLS);
  const city = pick(KZ_CITIES);

  // 0–12+ years, skewed up a bit so we have plenty of “meets min experience”
  const experienceYears = Math.min(
    14,
    Math.max(0, Math.round((Math.random() ** 0.6) * 12)),
  );

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 75)); // within ~2.5 months

  const availabilityChoices = ["Available now", "Within 30 days", "Within 3 months"];
  const availability = availabilityChoices[Math.floor(Math.random() * availabilityChoices.length)];

  const education = [
    {
      degree: `${deg.degree} (${deg.field})`,
      institution: "Demo University",
      country: nationality,
      year: 2012 + (i % 10),
    },
  ];

  return {
    firstName,
    lastName,
    email: demoEmail(i),
    userType: "TEACHER",
    // teacher fields
    teacher: {
      firstName,
      lastName,
      phone: `+1-555-${String(1000 + (i % 9000)).padStart(4, "0")}`,
      phoneCountryCode: "+1",
      city,
      country: "Kazakhstan",
      qualification: "Teaching Certificate",
      experience: experienceYears <= 1 ? "Entry Level" : experienceYears <= 5 ? "Junior Level" : experienceYears <= 10 ? "Mid Level" : "Senior Level",
      experienceYears,
      bio:
        "Demo profile (seeded) — Experienced ESL teacher with a strong focus on student engagement, lesson planning, and outcomes.",
      nationality,
      certifications: certs,
      subjects,
      ageGroups,
      willingToRelocate: true,
      preferredLocations: ["Kazakhstan", "Almaty", "Astana"],
      workAuthorization: ["Kazakhstan (Visa required)"],
      availability,
      startDate,
      education,
      specializations: ["ESL"],
      previousSchools: [],
      references: [],
      achievements: [],
      publications: [],
      jobTypePreference: ["FULL_TIME", "CONTRACT"],
      workEnvironmentPreference: ["In-person", "Hybrid", "Online"],
      technicalSkills: [],
      softSkills: ["Classroom management", "Lesson planning", "Communication"],
      searchable: true,
      profileComplete: true,
      verified: false,
      anonymiseProfile: false,
      downloadableProfilePDF: true,
    },
  };
}

async function main() {
  console.log(
    `Seeding demo teachers: count=${COUNT}, start=${START}, prefix=${PREFIX}, domain=${DOMAIN}, dryRun=${DRY_RUN}`,
  );

  const end = START + COUNT - 1;
  const emails = Array.from({ length: COUNT }, (_, idx) => demoEmail(START + idx));
  const existing = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { email: true },
  });
  const existingSet = new Set(existing.map((u) => u.email.toLowerCase()));

  const toCreate = [];
  for (let i = START; i <= end; i++) {
    const email = demoEmail(i);
    if (!existingSet.has(email)) toCreate.push(i);
  }

  console.log(`Already exist: ${existing.length}. To create: ${toCreate.length}.`);
  if (DRY_RUN) {
    console.log("Dry run mode: no records created.");
    return;
  }

  const BATCH = 25;
  for (let b = 0; b < toCreate.length; b += BATCH) {
    const batch = toCreate.slice(b, b + BATCH);
    await prisma.$transaction(async (tx) => {
      for (const i of batch) {
        const profile = buildTeacherProfile(i);
        await tx.user.create({
          data: {
            email: profile.email,
            userType: "TEACHER",
            emailVerified: true,
            password: null, // demo accounts are not meant to be logged into
            teacher: {
              create: profile.teacher,
            },
          },
        });
        await tx.activityLog.create({
          data: {
            userId: "system",
            action: "DEMO_TEACHER_CREATED",
            details: { email: profile.email, seed: PREFIX },
          },
        });
      }
    });
    console.log(`Created batch ${b + 1}-${Math.min(b + BATCH, toCreate.length)} / ${toCreate.length}`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


