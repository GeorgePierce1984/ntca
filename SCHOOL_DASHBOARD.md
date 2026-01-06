# School Dashboard Implementation

This document provides a comprehensive overview of the school dashboard implementation for the NTCA platform, including job posting, application management, and all related features.

## 🎯 Overview

The school dashboard provides a complete job management system that aligns with the frontend pricing tiers and enables schools to:

- Post and manage job listings
- Review and manage applications
- Track hiring metrics and analytics
- Manage application statuses and communicate with applicants

## 🏗️ Architecture

### Frontend Components

**Main Dashboard**: `/src/pages/schools/SchoolDashboard.tsx`
- Overview tab with key metrics and recent activity
- Job postings management with full CRUD operations
- Application review and status management
- Comprehensive job posting form

**Alternative Dashboard**: `/src/pages/schools/DashboardPage.tsx`
- Legacy implementation with mock data (for reference)

### Backend APIs

#### Job Management APIs

**`/api/jobs` (GET, POST)**
- GET: Retrieve all jobs for authenticated school
- POST: Create new job posting

**`/api/jobs/[id]` (GET, PUT, DELETE)**
- GET: Retrieve specific job with applications
- PUT: Update job details or status
- DELETE: Remove job posting

#### Application Management APIs

**`/api/applications` (GET, POST)**
- GET: Retrieve all applications for school's jobs
- POST: Teachers apply for jobs

**`/api/applications/[id]/status` (PATCH)**
- Update application status and add notes

### Database Schema

**Jobs Table**:
```prisma
model Job {
  id          String        @id @default(cuid())
  schoolId    String
  title       String
  description String
  location    String
  salary      String
  type        EmploymentType
  status      JobStatus     @default(ACTIVE)
  deadline    DateTime
  
  // Requirements
  qualification String
  experience    String
  language      String
  visaRequired  Boolean @default(false)
  
  // Kazakhstan-specific requirements
  teachingLicenseRequired Boolean @default(false)
  kazakhLanguageRequired  Boolean @default(false)
  localCertificationRequired Boolean @default(false)
  
  // Additional fields
  benefits     String?
  requirements String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  school       School        @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  applications Application[]
}
```

**Applications Table**:
```prisma
model Application {
  id        String            @id @default(cuid())
  jobId     String
  teacherId String
  status    ApplicationStatus @default(APPLIED)
  
  // Application details
  coverLetter   String?
  resumeUrl     String?
  portfolioUrl  String?
  
  // Interview details
  interviewDate DateTime?
  interviewNotes String?
  
  // Rating and feedback
  rating        Float?
  feedback      String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  job     Job     @relation(fields: [jobId], references: [id], onDelete: Cascade)
  teacher Teacher @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  notes   ApplicationNote[]
  
  @@unique([jobId, teacherId]) // Prevent duplicate applications
}
```

## 🎨 Dashboard Features

### 1. Overview Tab

**Key Metrics Cards**:
- Total job postings with active/inactive breakdown
- Total applications with new application count
- School rating display
- Profile view statistics

**Recent Activity**:
- Recent job postings with status indicators
- Recent applications with quick status view
- Quick navigation to detailed views

### 2. Job Postings Tab

**Job Management**:
- Search and filter functionality (by status, keywords)
- Comprehensive job listing with key details
- Quick actions: Edit, Pause/Resume, Delete
- Application count and posting date display

**Job Details Display**:
- Job title and status badge
- Location, salary, and employment type
- Deadline and posting date
- Truncated description with full details on demand
- Application statistics

### 3. Applications Tab

**Application Management**:
- Search and filter by status or applicant name
- Detailed applicant profiles with qualifications
- Quick status updates via dropdown
- Contact information and verification status
- Skills and language proficiency display

**Application Details**:
- Teacher profile with photo placeholder
- Contact information (email, phone, location)
- Qualifications and experience
- Languages and skills
- Cover letter display
- Application status history

### 4. Post Job Tab

**Comprehensive Job Form**:
- Basic information (title, location, description)
- Employment details (salary, type, deadline)
- Requirements section with specific fields
- Kazakhstan-specific requirements checkboxes
- Benefits and additional requirements
- Form validation and error handling

**Form Fields**:
- Job Title (required)
- Job Description (required, textarea)
- Location (required)
- Salary Range (required)
- Employment Type (Full-time, Part-time, Contract)
- Application Deadline (required, date picker)
- Required Qualification (required)
- Experience Required (required)
- Language Requirements
- Visa/Work permit requirements
- Teaching license requirements
- Kazakh language knowledge
- Local certification requirements
- Benefits & Perks (optional, textarea)
- Additional Requirements (optional, textarea)

## 🔧 Technical Implementation

### State Management

```typescript
interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  deadline: string;
  qualification: string;
  experience: string;
  language: string;
  visaRequired: boolean;
  teachingLicenseRequired: boolean;
  kazakhLanguageRequired: boolean;
  localCertificationRequired: boolean;
  benefits?: string;
  requirements?: string;
  createdAt: string;
  applications: Application[];
  _count: { applications: number };
}

interface Application {
  id: string;
  status: 'APPLIED' | 'REVIEWING' | 'INTERVIEW' | 'DECLINED' | 'HIRED';
  coverLetter?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  interviewDate?: string;
  rating?: number;
  createdAt: string;
  teacher: TeacherProfile;
  job: { id: string; title: string };
}
```

### API Integration

**Authentication**: All API calls include JWT token in Authorization header
**Error Handling**: Comprehensive error handling with user-friendly messages
**Loading States**: Loading indicators for all async operations
**Real-time Updates**: Automatic data refresh after mutations

### UI/UX Features

**Responsive Design**: Fully responsive layout for desktop and mobile
**Dark Mode Support**: Complete dark mode implementation
**Animations**: Smooth transitions using Framer Motion
**Accessibility**: Proper ARIA labels and keyboard navigation
**Status Indicators**: Color-coded status badges throughout
**Search & Filtering**: Real-time search and status filtering
**Modals**: Modal dialogs for detailed views and forms

## 🚀 Key Functionality

### Job Posting Workflow

1. **Create Job**: Use "Post Job" tab or "Post New Job" button
2. **Fill Details**: Complete comprehensive job form
3. **Publish**: Job becomes active and visible to teachers
4. **Manage**: Edit, pause, resume, or delete jobs as needed

### Application Management Workflow

1. **Receive Applications**: Teachers apply through public job listings
2. **Review**: View applicant profiles and qualifications
3. **Update Status**: Progress applications through workflow:
   - Applied → Reviewing → Interview → Hired/Declined
4. **Communicate**: Add notes and track interview scheduling

### Status Management

**Job Statuses**:
- **ACTIVE**: Visible to teachers, accepting applications
- **PAUSED**: Not visible, temporarily suspended
- **CLOSED**: Completed hiring, no longer accepting applications

**Application Statuses**:
- **APPLIED**: Initial application received
- **REVIEWING**: Under school review
- **INTERVIEW**: Scheduled for interview
- **HIRED**: Successfully hired
- **DECLINED**: Application rejected

## 🔐 Security & Permissions

**Authentication**: JWT-based authentication required for all operations
**Authorization**: Schools can only access their own jobs and applications
**Data Validation**: Comprehensive server-side validation
**SQL Injection Protection**: Prisma ORM with parameterized queries
**XSS Protection**: Input sanitization and output encoding

## 📊 Analytics & Metrics

**Job Performance**:
- Application count per job
- Time to hire metrics
- Popular job types and locations

**School Metrics**:
- Total jobs posted
- Active vs. closed jobs
- Application conversion rates
- Response time tracking

## 🎯 Alignment with Pricing Tiers

**Basic Plan ($49/month)**:
- 5 job postings per month
- Standard listings
- Basic analytics
- Email support

**Standard Plan ($119/month)**:
- 25 job postings per month
- Premium listings with highlighting
- Advanced analytics
- Priority support
- Featured school badge

**Premium Plan ($299/month)**:
- Unlimited job postings
- AI-powered teacher matching
- Custom branding
- Dedicated account manager
- API access

## 🛠️ Development Guidelines

### Code Organization
- Feature-based file structure
- Shared components in `/components/ui`
- Type definitions co-located with components
- API routes follow RESTful conventions

### Testing Approach
- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for critical user flows
- Manual testing for UI/UX validation

### Performance Optimization
- Lazy loading for heavy components
- Pagination for large datasets
- Optimistic updates for better UX
- Caching strategies for static data

## 🔧 Troubleshooting

### Common Issues

**Jobs not loading**:
- Check JWT token validity
- Verify school profile exists
- Check API endpoint availability

**Applications not updating**:
- Ensure proper authorization
- Check application ownership
- Verify status transition validity

**Form submission failures**:
- Validate required fields
- Check date format for deadline
- Verify authentication token

### Debugging Tools

**Health Check**: `/api/health` endpoint for system status
**Browser Console**: Check for JavaScript errors
**Network Tab**: Monitor API request/response cycles
**Vercel Logs**: Server-side error logging

## 📈 Future Enhancements

### Planned Features
- Real-time notifications for new applications
- Advanced search and filtering options
- Bulk application management
- Integration with video interview platforms
- Automated email templates
- Advanced analytics dashboard
- Export functionality for reports
- Integration with HR systems

### Technical Improvements
- Implement caching layer
- Add offline support
- Optimize bundle size
- Implement PWA features
- Add comprehensive test coverage
- Performance monitoring
- Error tracking and reporting

## 📞 Support

For technical issues or feature requests:
1. Check the troubleshooting section
2. Review API documentation
3. Check environment variables
4. Verify database connectivity
5. Contact development team with specific error details

---

*This documentation covers the complete school dashboard implementation as of the latest deployment. For updates or modifications, refer to the latest codebase and API documentation.*