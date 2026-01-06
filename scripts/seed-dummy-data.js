import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding dummy data...');

  try {
    // Create test school user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
    
    const schoolUser = await prisma.user.upsert({
      where: { email: 'chris@starsite.digital' },
      update: {},
      create: {
        email: 'chris@starsite.digital',
        password: hashedPassword,
        userType: 'SCHOOL',
      }
    });

    console.log('✅ Created/found school user:', schoolUser.email);

    // Create school profile
    const school = await prisma.school.upsert({
      where: { userId: schoolUser.id },
      update: {},
      create: {
        userId: schoolUser.id,
        name: 'Almaty International School',
        contactName: 'Chris Johnson',
        contactEmail: 'chris@starsite.digital',
        telephone: '+77123456789',
        phoneCountryCode: '+7',
        streetAddress: '123 Dostyk Avenue',
        city: 'Almaty',
        state: 'Almaty Region',
        postalCode: '050000',
        country: 'Kazakhstan',
        schoolType: 'private',
        estimateJobs: '6-15',
        website: 'https://ais.edu.kz',
        description: 'A leading international school in Almaty offering world-class education with Cambridge and IB curricula. We pride ourselves on academic excellence and holistic development.',
        established: new Date('2010-09-01'),
        studentCount: 450,
        verified: true,
        subscriptionId: 'sub_test_subscription'
      }
    });

    console.log('✅ Created/updated school profile:', school.name);

    // Create sample job postings
    const jobTitles = [
      {
        title: 'Mathematics Teacher (Grades 9-12)',
        description: 'We are seeking a passionate Mathematics teacher to join our Secondary School team. The ideal candidate will teach IGCSE and A-Level Mathematics, with experience in Cambridge curriculum preferred.',
        subject: 'Mathematics',
        level: 'Secondary',
        requirements: 'Bachelor\'s degree in Mathematics or related field, Teaching qualification (PGCE preferred), Minimum 3 years teaching experience, Cambridge curriculum experience preferred',
        benefits: 'Competitive salary package, Housing allowance, Medical insurance, Annual flight allowance, Professional development opportunities',
        salaryMin: 2500,
        salaryMax: 4000,
        location: 'Almaty, Kazakhstan',
        workType: 'Full-time',
        urgent: false
      },
      {
        title: 'English Language Arts Teacher (Primary)',
        description: 'Join our Primary School team as an English Language Arts teacher. You will be responsible for teaching English to students aged 6-11, focusing on reading, writing, speaking, and listening skills.',
        subject: 'English Language Arts',
        level: 'Primary',
        requirements: 'Bachelor\'s degree in English, Education, or related field, Teaching certification, Native or near-native English proficiency, Experience with phonics and early literacy',
        benefits: 'Excellent salary package, Free accommodation, Health insurance, Professional development budget, International school environment',
        salaryMin: 2200,
        salaryMax: 3500,
        location: 'Almaty, Kazakhstan',
        workType: 'Full-time',
        urgent: true
      },
      {
        title: 'Science Teacher (Chemistry/Biology)',
        description: 'We are looking for a qualified Science teacher to teach Chemistry and Biology to secondary students. IGCSE and A-Level experience is highly valued.',
        subject: 'Science',
        level: 'Secondary',
        requirements: 'Degree in Chemistry, Biology, or related science field, Teaching qualification, Laboratory safety certification, 2+ years teaching experience',
        benefits: 'Competitive remuneration, Furnished accommodation, Medical coverage, Annual leave, Continuing education support',
        salaryMin: 2800,
        salaryMax: 4200,
        location: 'Almaty, Kazakhstan',
        workType: 'Full-time',
        urgent: false
      },
      {
        title: 'PE/Sports Coach',
        description: 'Dynamic Physical Education teacher and sports coach needed for our growing athletics program. Experience with various sports and fitness programs required.',
        subject: 'Physical Education',
        level: 'All Levels',
        requirements: 'Degree in Sports Science, Kinesiology, or Education, Coaching certifications preferred, First Aid/CPR certification, Strong communication skills',
        benefits: 'Attractive salary, Sports facility access, Health benefits, Training opportunities, Team environment',
        salaryMin: 2000,
        salaryMax: 3200,
        location: 'Almaty, Kazakhstan',
        workType: 'Full-time',
        urgent: false
      },
      {
        title: 'French Language Teacher',
        description: 'Native or fluent French speaker needed to teach French as a foreign language to students aged 11-18. Experience with DELF preparation preferred.',
        subject: 'French',
        level: 'Secondary',
        requirements: 'Native French speaker or equivalent fluency, Teaching qualification, DELF/DALF certification preferred, Cross-cultural experience',
        benefits: 'Excellent compensation, Housing provided, Health insurance, Language learning opportunities, Cultural exchange programs',
        salaryMin: 2300,
        salaryMax: 3600,
        location: 'Almaty, Kazakhstan',
        workType: 'Full-time',
        urgent: true
      },
      {
        title: 'Computer Science/ICT Teacher',
        description: 'Technology-savvy educator needed to teach Computer Science and ICT to students. Programming experience and knowledge of current technologies essential.',
        subject: 'Computer Science',
        level: 'Secondary',
        requirements: 'Degree in Computer Science, ICT, or related field, Programming skills (Python, Java, JavaScript), Teaching experience, Knowledge of educational technology',
        benefits: 'Competitive package, Tech equipment provided, Professional development, Modern facilities, Innovation-focused environment',
        salaryMin: 3000,
        salaryMax: 4500,
        location: 'Almaty, Kazakhstan',
        workType: 'Full-time',
        urgent: false
      }
    ];

    for (const jobData of jobTitles) {
      const job = await prisma.job.create({
        data: {
          schoolId: school.id,
          title: jobData.title,
          description: jobData.description,
          location: jobData.location,
          salary: `$${jobData.salaryMin} - $${jobData.salaryMax} USD per month`,
          type: 'FULL_TIME',
          status: 'ACTIVE',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          qualification: jobData.requirements,
          experience: 'Mid Level',
          language: 'English',
          visaRequired: true,
          teachingLicenseRequired: true,
          kazakhLanguageRequired: false,
          localCertificationRequired: false,
          benefits: jobData.benefits,
          requirements: jobData.requirements
        }
      });

      console.log(`✅ Created job: ${job.title}`);
    }

    // Create sample teacher users and applications
    const teachers = [
      {
        email: 'sarah.johnson@example.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '+1234567890',
        city: 'Toronto',
        country: 'Canada',
        qualification: 'Master\'s Degree',
        experience: 'Senior Level',
        bio: 'Experienced mathematics teacher with 12 years in international schools. Specialized in IGCSE and A-Level mathematics.',
        nationality: 'Canadian'
      },
      {
        email: 'ahmed.hassan@example.com',
        firstName: 'Ahmed',
        lastName: 'Hassan',
        phone: '+201234567890',
        city: 'Cairo',
        country: 'Egypt',
        qualification: 'Bachelor\'s Degree',
        experience: 'Mid Level',
        bio: 'Passionate English teacher with Cambridge curriculum experience. Native Arabic speaker with excellent English skills.',
        nationality: 'Egyptian'
      },
      {
        email: 'marie.dubois@example.com',
        firstName: 'Marie',
        lastName: 'Dubois',
        phone: '+33123456789',
        city: 'Paris',
        country: 'France',
        qualification: 'Master\'s Degree',
        experience: 'Senior Level',
        bio: 'Native French teacher with 8 years of experience teaching French as a foreign language in international schools.',
        nationality: 'French'
      },
      {
        email: 'david.smith@example.com',
        firstName: 'David',
        lastName: 'Smith',
        phone: '+447123456789',
        city: 'London',
        country: 'United Kingdom',
        qualification: 'PhD',
        experience: 'Senior Level',
        bio: 'Science educator with PhD in Chemistry and 15 years teaching experience in prestigious international schools.',
        nationality: 'British'
      },
      {
        email: 'anna.kowalski@example.com',
        firstName: 'Anna',
        lastName: 'Kowalski',
        phone: '+48123456789',
        city: 'Warsaw',
        country: 'Poland',
        qualification: 'Bachelor\'s Degree',
        experience: 'Junior Level',
        bio: 'Energetic PE teacher with sports coaching certifications. Experienced in developing school athletics programs.',
        nationality: 'Polish'
      }
    ];

    const createdJobs = await prisma.job.findMany({
      where: { schoolId: school.id }
    });

    for (let i = 0; i < teachers.length; i++) {
      const teacherData = teachers[i];
      const hashedTeacherPassword = await bcrypt.hash('Teacher123!', 12);
      
      const teacherUser = await prisma.user.upsert({
        where: { email: teacherData.email },
        update: {},
        create: {
          email: teacherData.email,
          password: hashedTeacherPassword,
          userType: 'TEACHER',
        }
      });

      const teacher = await prisma.teacher.upsert({
        where: { userId: teacherUser.id },
        update: {},
        create: {
          userId: teacherUser.id,
          firstName: teacherData.firstName,
          lastName: teacherData.lastName,
          phone: teacherData.phone,
          phoneCountryCode: '+1',
          city: teacherData.city,
          country: teacherData.country,
          qualification: teacherData.qualification,
          experience: teacherData.experience,
          bio: teacherData.bio,
          nationality: teacherData.nationality,
          verified: true,
          languages: ['English'],
          skills: ['Classroom Management', 'Curriculum Development', 'Student Assessment'],
          visaStatus: 'Required',
          availability: 'Immediate'
        }
      });

      console.log(`✅ Created teacher: ${teacher.firstName} ${teacher.lastName}`);

      // Create applications for some jobs
      if (createdJobs.length > i) {
        const job = createdJobs[i];
        const application = await prisma.application.create({
          data: {
            jobId: job.id,
            teacherId: teacher.id,
            status: i % 4 === 0 ? 'APPLIED' : i % 4 === 1 ? 'REVIEWING' : i % 4 === 2 ? 'INTERVIEW' : 'SHORTLISTED',
            coverLetter: `Dear Hiring Manager,\n\nI am excited to apply for the ${job.title} position at ${school.name}. With my ${teacherData.experience} and passion for education, I believe I would be a valuable addition to your team.\n\nMy experience includes:\n- ${teacherData.qualification} in relevant field\n- International school experience\n- Strong classroom management skills\n- Commitment to student success\n\nI am particularly drawn to this opportunity because of your school's reputation for excellence and commitment to international education. I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to your academic program.\n\nThank you for your consideration.\n\nSincerely,\n${teacherData.firstName} ${teacherData.lastName}`,
            resumeUrl: `https://example.com/resumes/${teacherData.firstName.toLowerCase()}-${teacherData.lastName.toLowerCase()}.pdf`,
            portfolioUrl: `https://example.com/portfolios/${teacherData.firstName.toLowerCase()}-${teacherData.lastName.toLowerCase()}`
          }
        });

        console.log(`✅ Created application: ${teacher.firstName} ${teacher.lastName} → ${job.title}`);

        // Add some notes for applications in review/interview stages
        if (application.status === 'REVIEWING' || application.status === 'INTERVIEW' || application.status === 'SHORTLISTED') {
          await prisma.applicationNote.create({
            data: {
              applicationId: application.id,
              content: application.status === 'REVIEWING' 
                ? 'Strong qualifications. Need to review portfolio in detail.'
                : application.status === 'INTERVIEW'
                ? 'Great interview! Very enthusiastic and knowledgeable. Checking references.'
                : 'Top candidate! Excellent fit for our school culture and requirements.',
              authorType: 'school',
              authorName: 'Chris Johnson'
            }
          });
        }
      }
    }

    // Create activity logs
    await prisma.activityLog.createMany({
      data: [
        {
          userId: schoolUser.id,
          action: 'USER_REGISTERED',
          details: 'School account created and verified'
        },
        {
          userId: schoolUser.id,
          action: 'JOB_POSTED',
          details: 'Posted Mathematics Teacher position'
        },
        {
          userId: schoolUser.id,
          action: 'JOB_POSTED',
          details: 'Posted English Language Arts Teacher position'
        }
      ]
    });

    console.log('🎉 Dummy data seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Created school account: chris@starsite.digital (password: TestPassword123!)`);
    console.log(`- Created ${jobTitles.length} job postings`);
    console.log(`- Created ${teachers.length} teacher accounts`);
    console.log(`- Created ${teachers.length} job applications`);
    console.log('- Added application notes and activity logs');
    console.log('\n🔑 Login with chris@starsite.digital to test the school dashboard!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 