import { PrismaClient } from "@prisma/client";

/**
 * Bulk-delete demo teacher accounts created by seed-demo-teachers.mjs.
 *
 * Identification:
 * - Email starts with: <prefix>.  (default: demo.teacher.)
 *
 * Usage:
 *   node scripts/delete-demo-teachers.mjs --confirm=YES
 *   node scripts/delete-demo-teachers.mjs --prefix=demo.teacher --domain=example.com --confirm=YES
 *   node scripts/delete-demo-teachers.mjs --dryRun=true
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

const PREFIX_BASE = (arg("prefix", "demo.teacher") || "demo.teacher").replace(/\.+$/, "");
const DOMAIN = (arg("domain", "example.com") || "example.com").trim();
const PREFIX = `${PREFIX_BASE}.`.toLowerCase();
const CONFIRM = (arg("confirm", "") || "").toUpperCase();
const DRY_RUN = (arg("dryRun", "false") || "false").toLowerCase() === "true";

async function main() {
  console.log(`Deleting demo teachers where email startsWith: ${PREFIX} (domain hint: ${DOMAIN}) dryRun=${DRY_RUN}`);

  const users = await prisma.user.findMany({
    where: {
      email: {
        startsWith: PREFIX,
        mode: "insensitive",
      },
    },
    select: { id: true, email: true, userType: true },
  });

  console.log(`Found ${users.length} users to delete.`);
  if (users.length > 0) {
    console.log(`Example: ${users.slice(0, 5).map((u) => u.email).join(", ")}`);
  }

  if (DRY_RUN) return;
  if (CONFIRM !== "YES") {
    console.log("Refusing to delete without --confirm=YES");
    return;
  }

  const ids = users.map((u) => u.id);

  await prisma.$transaction(async (tx) => {
    await tx.activityLog.deleteMany({ where: { userId: { in: ids } } });
    await tx.user.deleteMany({ where: { id: { in: ids } } });
  });

  console.log("Deleted demo users + their activity logs. (Teacher rows should cascade via User → Teacher relation)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


