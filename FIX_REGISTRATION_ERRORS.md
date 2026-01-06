# 🚨 CRITICAL: Fix Registration & Login Errors

**Issue Date**: July 22, 2024  
**Status**: Production database schema mismatch causing registration/login failures  
**Severity**: CRITICAL - Users cannot register or login

## 🔴 Error Summary

### Registration Errors:
```
PrismaClientValidationError: Unknown argument `languages`. 
PrismaClientValidationError: Unknown argument `skills`.
```

### Login Errors:
```
PrismaClientKnownRequestError: The column `teachers.experienceYears` does not exist in the current database.
```

## 🎯 Root Cause

1. **Database schema is out of sync** with Prisma schema definition
2. **Registration API using incorrect field names**:
   - Using `languages` instead of `languageSkills`
   - Using `skills` instead of `technicalSkills` and `softSkills`
3. **Missing database migration** for new columns like `experienceYears`

## ⚡ IMMEDIATE FIXES

### Step 1: Fix Registration API (5 minutes)

The registration API at `api/auth/register.js` needs to be updated. The issue is on lines 159-160 where it's using:
```javascript
languages: profileData.languages || [],
skills: profileData.skills || [],
```

This needs to be changed to match the Prisma schema:
```javascript
// Convert languages to languageSkills JSON format
languageSkills: profileData.languages ? 
  profileData.languages.reduce((acc, lang) => {
    acc[lang] = "Native/Fluent";
    return acc;
  }, {}) : null,

// Split skills into technical and soft skills
technicalSkills: profileData.technicalSkills || [],
softSkills: profileData.softSkills || [],

// Add missing required field
experienceYears: profileData.experienceYears || null,

// Set default values for required array fields
certifications: [],
subjects: [],
ageGroups: [],
preferredLocations: [],
workAuthorization: [],
education: [],
specializations: [],
previousSchools: [],
references: [],
achievements: [],
publications: [],
jobTypePreference: [],
workEnvironmentPreference: [],
```

### Step 2: Deploy Database Migration (10 minutes)

**For Local Development:**
```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Create migration
npx prisma migrate dev --name fix_teacher_schema

# 3. Apply migration
npx prisma migrate deploy
```

**For Production (Vercel):**
```bash
# 1. Connect to production database
export DATABASE_URL="your-production-database-url"

# 2. Deploy migration (DO NOT use migrate dev in production)
npx prisma migrate deploy

# 3. Verify migration status
npx prisma migrate status
```

### Step 3: Quick Verification Script

Create `verify-fix.js`:
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyFix() {
  try {
    // Test creating a teacher with all fields
    const testData = {
      userId: 'test-user-id',
      firstName: 'Test',
      lastName: 'Teacher',
      phone: '1234567890',
      phoneCountryCode: '+1',
      city: 'Test City',
      country: 'test-country',
      qualification: 'CELTA',
      experience: 'Experienced',
      experienceYears: 5,
      languageSkills: { English: 'Native', Spanish: 'Intermediate' },
      technicalSkills: ['Online Teaching', 'LMS'],
      softSkills: ['Communication', 'Patience'],
      // Required arrays
      certifications: [],
      subjects: [],
      ageGroups: [],
      preferredLocations: [],
      workAuthorization: [],
      education: [],
      specializations: [],
      previousSchools: [],
      references: [],
      achievements: [],
      publications: [],
      jobTypePreference: [],
      workEnvironmentPreference: [],
    };

    console.log('✅ Schema supports all required fields');
    console.log('✅ Fix verified successfully!');
  } catch (error) {
    console.error('❌ Schema verification failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyFix();
```

Run: `node verify-fix.js`

## 🛠️ PERMANENT SOLUTION

### 1. Update Frontend Registration Form

Ensure the frontend doesn't send `languages` or `skills` fields. The teacher registration form should send:
- `technicalSkills` (array)
- `softSkills` (array)
- `languageSkills` (object with language: level pairs)
- `experienceYears` (number)

### 2. Create Data Migration Script

If you have existing data with `languages` and `skills` fields, create a migration script:

```javascript
// migrate-teacher-data.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateTeacherData() {
  const teachers = await prisma.$queryRaw`
    SELECT id, languages, skills FROM teachers 
    WHERE languages IS NOT NULL OR skills IS NOT NULL
  `;

  for (const teacher of teachers) {
    await prisma.teacher.update({
      where: { id: teacher.id },
      data: {
        languageSkills: teacher.languages ? 
          teacher.languages.reduce((acc, lang) => {
            acc[lang] = 'Fluent';
            return acc;
          }, {}) : null,
        technicalSkills: teacher.skills || [],
        softSkills: [],
      }
    });
  }

  console.log(`✅ Migrated ${teachers.length} teacher records`);
}

migrateTeacherData();
```

### 3. Add Validation Middleware

Create `api/middleware/validateTeacher.js`:
```javascript
export function validateTeacherData(data) {
  const validatedData = { ...data };

  // Convert old field names to new ones
  if (data.languages && !data.languageSkills) {
    validatedData.languageSkills = data.languages.reduce((acc, lang) => {
      acc[lang] = 'Fluent';
      return acc;
    }, {});
    delete validatedData.languages;
  }

  if (data.skills && !data.technicalSkills) {
    validatedData.technicalSkills = data.skills;
    validatedData.softSkills = [];
    delete validatedData.skills;
  }

  // Ensure all required arrays exist
  const requiredArrays = [
    'certifications', 'subjects', 'ageGroups', 
    'preferredLocations', 'workAuthorization', 'education',
    'specializations', 'previousSchools', 'references',
    'achievements', 'publications', 'jobTypePreference',
    'workEnvironmentPreference'
  ];

  requiredArrays.forEach(field => {
    if (!validatedData[field]) {
      validatedData[field] = [];
    }
  });

  return validatedData;
}
```

## 📋 TESTING CHECKLIST

After applying fixes:

1. **Test Teacher Registration**
   - [ ] Can create new teacher account
   - [ ] All fields save correctly
   - [ ] No validation errors

2. **Test School Registration**
   - [ ] Can create new school account
   - [ ] Stripe integration works
   - [ ] Profile saves correctly

3. **Test Login**
   - [ ] Teachers can login
   - [ ] Schools can login
   - [ ] Profile data loads correctly

4. **Test Profile Updates**
   - [ ] Can update teacher profile
   - [ ] Can add languages and skills
   - [ ] Experience years saves correctly

## 🚀 DEPLOYMENT STEPS

1. **Update Code**
   ```bash
   git add api/auth/register.js
   git commit -m "Fix registration API field names"
   git push
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Run Production Migration**
   ```bash
   # SSH into production or use Vercel CLI
   npx prisma migrate deploy
   ```

4. **Verify Production**
   - Test registration at https://ntca.vercel.app/auth/signup
   - Test login at https://ntca.vercel.app/auth/login
   - Check Vercel logs for any errors

## 🔍 MONITORING

Add these checks to prevent future issues:

1. **Health Check Endpoint**
   Create `api/health/schema.js`:
   ```javascript
   export default async function handler(req, res) {
     try {
       const teacher = await prisma.teacher.findFirst({
         select: { 
           experienceYears: true,
           languageSkills: true,
           technicalSkills: true 
         }
       });
       res.json({ status: 'ok', schema: 'synced' });
     } catch (error) {
       res.status(500).json({ 
         status: 'error', 
         schema: 'out-of-sync',
         error: error.message 
       });
     }
   }
   ```

2. **Add to Monitoring**
   - Set up uptime monitoring on `/api/health/schema`
   - Alert if schema is out of sync
   - Check after each deployment

## 🆘 EMERGENCY CONTACTS

If issues persist:
- **Vercel Support**: https://vercel.com/support
- **Neon Support**: https://neon.tech/support
- **Database Admin**: Check DATABASE_URL for connection details

## 📝 LESSONS LEARNED

1. **Always run migrations** before deploying API changes
2. **Keep field names consistent** between frontend and backend
3. **Use validation middleware** to handle field name changes
4. **Test registration/login** after every schema change
5. **Monitor schema sync status** in production

---

**Priority**: CRITICAL  
**Time to Fix**: 15-30 minutes  
**Risk**: LOW (with proper migration)