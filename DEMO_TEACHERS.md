# Demo Teacher Accounts (Seeding + Removal)

## Why this exists
To bootstrap the marketplace (schools need teachers visible; teachers need schools/jobs), we seed **demo teacher profiles** into the database.

These demo profiles are:
- Realistic enough to test search, filters, matching, and UI
- **Easily identifiable** so they can be removed later

## How demo teachers are identified
We tag them by **email prefix** (no schema migration needed):
- `demo.teacher.0001@example.com`
- `demo.teacher.0002@example.com`

You can change prefix/domain via script args.

## Seed demo teachers (create 200)

1. Ensure your shell has access to the correct DB:

```bash
export DATABASE_URL="postgresql://..."
```

2. Run the seeder:

```bash
node scripts/seed-demo-teachers.mjs --count=200 --start=1 --prefix=demo.teacher --domain=example.com
```

Notes:
- The script sets `user.emailVerified=true` and `teacher.searchable=true` so profiles appear in Browse Teachers.
- Password is `null` — these are not meant to be logged into.
- Teachers have populated fields that the matching algorithm uses: certifications, education, experienceYears, ageGroups, preferredLocations, willingToRelocate, availability.

## Seed *realistic* dummy teachers (create 30–50)

This variant creates fewer, higher-quality profiles with:
- **UK-heavy** mix
- **TEFL newbies**, **5+ year experienced**, **IELTS**, **Kindergarten**, **Business English**
- **Short bios**, **availability**, **currentLocation**, and **profile photos** (`photoUrl` as a stock-style URL)

1. Ensure your shell has access to the correct DB:

```bash
export DATABASE_URL="postgresql://..."
```

2. Run the realistic seeder:

```bash
node scripts/seed-realistic-teachers.mjs --count=40 --start=1 --prefix=seed.teacher --domain=example.com
```

Notes:
- These are **tagged by email prefix** (`seed.teacher.0001@example.com`) so they’re easy to bulk-delete later.
- The email is generally **not displayed publicly** in the teacher browsing UI; if you ever expose teacher emails in UI, keep domains non-sensitive.

## Delete demo teachers (bulk removal)

Dry run:

```bash
node scripts/delete-demo-teachers.mjs --prefix=demo.teacher --confirm=NO --dryRun=true
```

Actual delete:

```bash
node scripts/delete-demo-teachers.mjs --prefix=demo.teacher --confirm=YES
```

Delete the realistic seeded teachers (same deleter, different prefix):

```bash
node scripts/delete-demo-teachers.mjs --prefix=seed.teacher --confirm=YES
```

This deletes:
- Users (cascade deletes Teacher profile)
- Activity logs for those users

## Customizing demographics
Seeder defaults:
- **Nationality**: predominantly US/UK/Canada/Australia
- **Location**: set to Kazakhstan (to match local jobs) + preferredLocations include major KZ cities
- **Qualifications**: mixes TEFL/TESOL/CELTA, degree in education/english/tesol
- **Experience**: varied experienceYears (0–14)
- **Age groups**: Kids/Teens/Adults mixes

If you want a different distribution (e.g., more “Senior Level”, more IELTS/Cambridge), tell me and I’ll tune the pools.


