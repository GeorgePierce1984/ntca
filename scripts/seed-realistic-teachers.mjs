import { PrismaClient } from "@prisma/client";

/**
 * Seed realistic dummy teacher profiles (30–50 recommended) for marketplace bootstrapping.
 *
 * Key goals:
 * - Realistic bios + experience + specialties (IELTS/KG/Business/TEFL-newbies/Experienced)
 * - UK-heavy mix, but includes a small spread of other nationals
 * - Includes stock-style profile photos via URL (pravatar)
 * - Easily removable later via email prefix
 *
 * Usage:
 *   node scripts/seed-realistic-teachers.mjs
 *   node scripts/seed-realistic-teachers.mjs --count=40
 *   node scripts/seed-realistic-teachers.mjs --count=50 --start=1 --prefix=seed.teacher --domain=example.com
 *   node scripts/seed-realistic-teachers.mjs --dryRun=true
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

const COUNT = Math.max(1, parseInt(arg("count", "40"), 10) || 40);
const START = Math.max(1, parseInt(arg("start", "1"), 10) || 1);
const PREFIX = (arg("prefix", "seed.teacher") || "seed.teacher").replace(/\.+$/, "");
const DOMAIN = (arg("domain", "example.com") || "example.com").trim();
const DRY_RUN = (arg("dryRun", "false") || "false").toLowerCase() === "true";

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick(items) {
  const r = Math.random();
  let acc = 0;
  for (const it of items) {
    acc += it.weight;
    if (r <= acc) return it.value;
  }
  return items[items.length - 1].value;
}

function pad4(n) {
  return String(n).padStart(4, "0");
}

function seedEmail(i) {
  return `${PREFIX}.${pad4(i)}@${DOMAIN}`.toLowerCase();
}

function pravatarUrl(i) {
  // pravatar has a finite set; keep it in a safe range and deterministic-ish
  const img = ((i - 1) % 70) + 1;
  return `https://i.pravatar.cc/300?img=${img}`;
}

const UK_CITIES = ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Bristol", "Edinburgh"];
const CA_CITIES = ["Toronto", "Vancouver", "Calgary", "Ottawa"];
const US_CITIES = ["New York", "Boston", "Chicago", "Seattle", "Austin"];
const AU_CITIES = ["Sydney", "Melbourne", "Brisbane", "Perth"];
const KZ_CITIES = ["Almaty", "Astana", "Shymkent"];

const NAMES_UK = [
  "Oliver", "George", "Harry", "Noah", "Jack", "Leo", "Charlie", "Freddie",
  "Amelia", "Olivia", "Isla", "Ava", "Mia", "Lily", "Emily", "Sophie",
];
const NAMES_GLOBAL = [
  "Alex", "Sam", "Jamie", "Taylor", "Jordan", "Casey", "Riley",
  "Emma", "Sophia", "Isabella", "Charlotte",
];
const LAST_NAMES = [
  "Smith", "Jones", "Taylor", "Brown", "Wilson", "Johnson", "Davies", "Evans",
  "Thomas", "Roberts", "Walker", "Wright", "Thompson", "Hall", "White",
];

const NATIONALITIES = [
  { value: "United Kingdom", weight: 0.62 },
  { value: "United States", weight: 0.14 },
  { value: "Canada", weight: 0.12 },
  { value: "Australia", weight: 0.12 },
];

const PERSONAS = [
  {
    key: "tefl_newbie",
    weight: 0.22,
    subjects: ["English", "Phonics"],
    specializations: ["TEFL (New Teacher)", "Young Learners"],
    ageGroups: ["Kids (5-12)", "Teens (13-17)"],
    certifications: ["TEFL"],
    experienceRange: [0, 1],
    qualificationPool: ["Level 5 TEFL Certificate", "TEFL Certificate"],
    bioPool: [
      "New TEFL-qualified teacher focused on building confidence through structured speaking practice and clear feedback.",
      "Early-career ESL teacher with high energy and a student-first approach. Strong on lesson planning and classroom routines.",
    ],
    teachingExperienceBuilder: (years) => ([
      {
        role: "Online ESL Tutor",
        organisation: "Independent (Online)",
        location: "Remote",
        from: "2025-01",
        to: "Present",
        highlights: [
          "1:1 speaking practice and pronunciation coaching",
          "Beginner-friendly grammar explanations",
        ],
      },
    ]),
  },
  {
    key: "experienced_5plus",
    weight: 0.28,
    subjects: ["English", "Cambridge"],
    specializations: ["ESL", "Curriculum Planning"],
    ageGroups: ["Kids (5-12)", "Teens (13-17)", "Adults (18+)"],
    certifications: ["CELTA", "TESOL"],
    experienceRange: [5, 11],
    qualificationPool: ["PGCE + CELTA", "CELTA + BA (English)", "TESOL + B.Ed"],
    bioPool: [
      "Experienced ESL teacher with a calm, structured style and a track record of measurable student progress.",
      "Student-centred teacher with 5+ years across mixed-ability classes, exam pathways, and conversation-focused programs.",
    ],
    teachingExperienceBuilder: (years) => ([
      {
        role: "ESL Teacher",
        organisation: "International Language Academy",
        location: "London, UK",
        from: `${Math.max(2016, 2026 - years)}-09`,
        to: "2021-06",
        highlights: [
          "Designed weekly schemes of work and assessment rubrics",
          "Led speaking clubs and teacher-led workshops",
        ],
      },
      {
        role: "English Teacher",
        organisation: "International School Program",
        location: "Almaty, Kazakhstan",
        from: "2021-08",
        to: "Present",
        highlights: [
          "Cambridge pathway support and academic writing",
          "Differentiation for mixed proficiency groups",
        ],
      },
    ]),
  },
  {
    key: "ielts_specialist",
    weight: 0.20,
    subjects: ["English", "IELTS", "Exam prep"],
    specializations: ["IELTS Specialist", "Academic Writing"],
    ageGroups: ["Teens (13-17)", "Adults (18+)"],
    certifications: ["CELTA"],
    experienceRange: [3, 12],
    qualificationPool: ["CELTA + MA (TESOL)", "CELTA + BA (Linguistics)"],
    bioPool: [
      "IELTS-focused teacher specialising in writing task strategy, speaking fluency, and band-boosting feedback.",
      "Exam prep specialist with strong results in IELTS speaking and writing. Clear frameworks, targeted drills, and confidence-building.",
    ],
    teachingExperienceBuilder: (years) => ([
      {
        role: "IELTS Instructor",
        organisation: "Exam Prep Centre",
        location: "Manchester, UK",
        from: `${Math.max(2014, 2026 - years)}-02`,
        to: "2020-12",
        highlights: [
          "Writing Task 1/2 structure + marking feedback",
          "Speaking mock tests and scoring rubrics",
        ],
      },
      {
        role: "Senior IELTS Teacher",
        organisation: "Private Language School",
        location: "Astana, Kazakhstan",
        from: "2021-02",
        to: "Present",
        highlights: [
          "Built intensive IELTS programmes and weekly diagnostics",
          "Teacher mentoring and materials development",
        ],
      },
    ]),
    languageTestScores: { IELTS: { overall: "8.0", date: "2023-10" } },
  },
  {
    key: "kindergarten",
    weight: 0.16,
    subjects: ["English", "Phonics", "Storytime"],
    specializations: ["Kindergarten", "Phonics & Literacy"],
    ageGroups: ["Kids (5-12)"],
    certifications: ["TEFL"],
    experienceRange: [2, 9],
    qualificationPool: ["TEFL + Early Years Training", "TEFL + BA (Education)"],
    bioPool: [
      "Warm, playful kindergarten teacher focused on routines, phonics, and confidence through songs, stories, and games.",
      "Early years ESL teacher with a strong phonics foundation and lots of hands-on classroom strategies for young learners.",
    ],
    teachingExperienceBuilder: (years) => ([
      {
        role: "Kindergarten English Teacher",
        organisation: "Early Years Centre",
        location: "Birmingham, UK",
        from: `${Math.max(2017, 2026 - years)}-09`,
        to: "2021-07",
        highlights: [
          "Phonics progression planning and parent updates",
          "Classroom routines, songs, and story-based lessons",
        ],
      },
      {
        role: "Kindergarten ESL Teacher",
        organisation: "International Kindergarten",
        location: "Almaty, Kazakhstan",
        from: "2021-09",
        to: "Present",
        highlights: [
          "Play-based ESL with measurable vocabulary targets",
          "Collaborated with homeroom teachers on weekly themes",
        ],
      },
    ]),
  },
  {
    key: "business_english",
    weight: 0.14,
    subjects: ["English", "Business English"],
    specializations: ["Business English", "Interview & Presentation Coaching"],
    ageGroups: ["Adults (18+)"],
    certifications: ["TESOL"],
    experienceRange: [2, 10],
    qualificationPool: ["TESOL + BA (Business)", "TESOL + BA (English)"],
    bioPool: [
      "Business English teacher specialising in meetings, presentations, email writing, and interview coaching for professionals.",
      "Practical Business English focused on real workplace tasks: negotiations, presentations, and confident speaking.",
    ],
    teachingExperienceBuilder: (years) => ([
      {
        role: "Business English Trainer",
        organisation: "Corporate Language Institute",
        location: "London, UK",
        from: `${Math.max(2016, 2026 - years)}-03`,
        to: "2022-01",
        highlights: [
          "Needs analysis and tailored role-play scenarios",
          "Presentation coaching and email-writing frameworks",
        ],
      },
      {
        role: "Senior Business English Teacher",
        organisation: "Private Training Centre",
        location: "Astana, Kazakhstan",
        from: "2022-02",
        to: "Present",
        highlights: [
          "Industry-specific curriculum: finance, tech, sales",
          "1:1 executive coaching and progress tracking",
        ],
      },
    ]),
  },
];

function buildIdentity(i) {
  // Skew names a bit UK-ish when nationality is UK; keeps it feeling coherent
  const nationality = weightedPick(NATIONALITIES);
  const firstName = nationality === "United Kingdom" ? pick([...NAMES_UK, ...NAMES_GLOBAL]) : pick(NAMES_GLOBAL);
  const lastName = pick(LAST_NAMES);
  return { firstName, lastName, nationality };
}

function pickLocation(nationality) {
  // Some are already in Kazakhstan (good for browsing local candidates), others in home countries but willing to relocate
  const inKazakhstan = Math.random() < 0.28;
  if (inKazakhstan) return { city: pick(KZ_CITIES), country: "Kazakhstan" };

  if (nationality === "United Kingdom") return { city: pick(UK_CITIES), country: "United Kingdom" };
  if (nationality === "United States") return { city: pick(US_CITIES), country: "United States" };
  if (nationality === "Canada") return { city: pick(CA_CITIES), country: "Canada" };
  return { city: pick(AU_CITIES), country: "Australia" };
}

function availabilityAndStart() {
  const availabilityChoices = ["Available now", "Within 30 days", "Within 3 months"];
  const availability = pick(availabilityChoices);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 90)); // within ~3 months
  return { availability, startDate };
}

function experienceLabel(years) {
  if (years <= 1) return "Entry Level";
  if (years <= 5) return "Junior Level";
  if (years <= 10) return "Mid Level";
  return "Senior Level";
}

function educationForPersona(personaKey, nationality) {
  const base = [
    {
      degree: "BA (Education)",
      institution: "University of Leeds",
      country: nationality,
      year: 2017,
    },
  ];

  if (personaKey === "ielts_specialist") {
    base.unshift({
      degree: "MA (TESOL)",
      institution: "University of Birmingham",
      country: nationality,
      year: 2020,
    });
  }

  if (personaKey === "business_english") {
    base[0] = {
      degree: "BA (Business)",
      institution: "University of Manchester",
      country: nationality,
      year: 2016,
    };
  }

  return base;
}

function buildTeacherProfile(i) {
  const persona = weightedPick(PERSONAS.map((p) => ({ value: p, weight: p.weight })));
  const { firstName, lastName, nationality } = buildIdentity(i);
  const loc = pickLocation(nationality);
  const { availability, startDate } = availabilityAndStart();

  const [minY, maxY] = persona.experienceRange;
  const experienceYears = Math.floor(minY + Math.random() * (maxY - minY + 1));

  const qualification = pick(persona.qualificationPool);
  const bio = pick(persona.bioPool);

  const preferredLocations = [
    "Kazakhstan",
    "Almaty",
    "Astana",
    "Uzbekistan",
    "Tashkent",
    "Kyrgyzstan",
    "Bishkek",
  ];

  const workAuthorization =
    loc.country === "Kazakhstan"
      ? ["Kazakhstan (Visa required)"]
      : ["Kazakhstan (Visa required)", "Uzbekistan (Visa required)"];

  const teachingExperience = persona.teachingExperienceBuilder(experienceYears);

  const teacher = {
    firstName,
    lastName,
    phone: `+44 7700 ${String(100000 + (i % 899999)).slice(0, 6)}`,
    phoneCountryCode: "+44",
    city: loc.city,
    country: loc.country,
    currentLocation: `${loc.city}, ${loc.country}`,

    qualification,
    experienceYears,
    experience: experienceLabel(experienceYears),
    bio,
    photoUrl: pravatarUrl(i),

    certifications: persona.certifications,
    subjects: persona.subjects,
    ageGroups: persona.ageGroups,
    specializations: persona.specializations,

    willingToRelocate: true,
    preferredLocations,
    workAuthorization,
    availability,
    startDate,

    education: educationForPersona(persona.key, nationality),
    teachingExperience,

    previousSchools: [],
    references: [],
    achievements: [],
    publications: [],

    nationality,

    profileComplete: true,
    searchable: true,
    verified: false,
    anonymiseProfile: false,
    downloadableProfilePDF: true,

    jobTypePreference: ["FULL_TIME", "CONTRACT"],
    workEnvironmentPreference: ["In-person", "Hybrid", "Online"],

    technicalSkills: [],
    softSkills: ["Classroom management", "Lesson planning", "Communication", "Feedback & assessment"],

    // Optional extras
    languageTestScores: persona.languageTestScores || null,
  };

  return {
    email: seedEmail(i),
    teacher,
  };
}

async function main() {
  console.log(`Seeding realistic teachers: count=${COUNT}, start=${START}, prefix=${PREFIX}, domain=${DOMAIN}, dryRun=${DRY_RUN}`);

  const end = START + COUNT - 1;
  const emails = Array.from({ length: COUNT }, (_, idx) => seedEmail(START + idx));
  const existing = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { email: true },
  });
  const existingSet = new Set(existing.map((u) => u.email.toLowerCase()));

  const toCreate = [];
  for (let i = START; i <= end; i++) {
    const email = seedEmail(i);
    if (!existingSet.has(email)) toCreate.push(i);
  }

  console.log(`Already exist: ${existing.length}. To create: ${toCreate.length}.`);
  if (DRY_RUN) {
    console.log("Dry run mode: no records created.");
    return;
  }

  const BATCH = 20;
  for (let b = 0; b < toCreate.length; b += BATCH) {
    const batch = toCreate.slice(b, b + BATCH);
    await prisma.$transaction(async (tx) => {
      for (const i of batch) {
        const profile = buildTeacherProfile(i);
        const user = await tx.user.create({
          data: {
            email: profile.email,
            userType: "TEACHER",
            emailVerified: true,
            password: null, // seeded accounts are not meant to be logged into
            teacher: { create: profile.teacher },
          },
          select: { id: true, email: true },
        });

        await tx.activityLog.create({
          data: {
            userId: user.id,
            action: "SEED_REALISTIC_TEACHER_CREATED",
            details: { email: user.email, seed: PREFIX },
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


