# Job Application System Implementation

This document describes the comprehensive job application system implementation for the NTCA platform.

## Overview

The job application system enables:
- Teachers to apply for jobs with CV upload
- Schools to manage job postings and review applications
- Application status tracking and communication
- Integration with the existing authentication and database systems

## Key Features Implemented

### 1. Job Posting Management

#### API Endpoints

- **POST /api/jobs** - Create new job posting (schools only)
- **GET /api/jobs** - Get jobs (filtered by user type)
- **PATCH /api/jobs/[id]/status** - Update job status (ACTIVE, PAUSED, CLOSED)
- **GET /api/jobs/public** - Public endpoint for browsing jobs

#### Job Status Management
Jobs can have three statuses:
- `ACTIVE` - Accepting applications
- `PAUSED` - Temporarily not accepting applications
- `CLOSED` - No longer accepting applications

### 2. Application System

#### API Endpoints

- **POST /api/applications/create** - Submit job application with CV upload
- **GET /api/jobs/[id]/applications** - Get all applications for a job (schools only)
- **PATCH /api/applications/[id]/status** - Update application status
- **GET /api/teachers/applications** - Get teacher's applications

#### Application Statuses
- `APPLIED` - Initial status when submitted
- `REVIEWING` - School is reviewing the application
- `INTERVIEW` - Applicant selected for interview
- `DECLINED` - Application not selected
- `HIRED` - Applicant hired for the position

### 3. CV Upload System

#### Implementation Details

- Uses Formidable for multipart form handling
- Cloudinary integration for secure file storage
- Supports PDF, DOC, and DOCX formats
- Maximum file size: 10MB
- Files stored in organized folders by teacher ID

#### Required Environment Variables
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Frontend Components

#### For Teachers
- **JobApplicationForm** - Form component with CV upload
- **MyApplications** - View and track all applications

#### For Schools
- **ApplicationsList** - Review and manage applications
- Ability to update application status
- Add notes to applications
- View applicant details and documents

### 5. Email Notifications

The system sends automatic email notifications:
- To schools when new applications are received
- To teachers when job status changes to CLOSED

## Database Schema

### Application Model
```prisma
model Application {
  id            String            @id @default(cuid())
  jobId         String
  teacherId     String
  status        ApplicationStatus @default(APPLIED)
  coverLetter   String?
  resumeUrl     String?
  portfolioUrl  String?
  interviewDate DateTime?
  interviewNotes String?
  rating        Float?
  feedback      String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  job     Job     @relation(fields: [jobId], references: [id], onDelete: Cascade)
  teacher Teacher @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  notes   ApplicationNote[]
  
  @@unique([jobId, teacherId]) // Prevent duplicate applications
}
```

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: 
   - Only schools can create/manage jobs
   - Only teachers can apply for jobs
   - Schools can only view applications for their own jobs
3. **File Upload Security**:
   - File type validation (PDF, DOC, DOCX only)
   - File size limits (10MB)
   - Secure storage on Cloudinary

## Usage Examples

### Teacher Applying for a Job

```javascript
const formData = new FormData();
formData.append('jobId', 'job123');
formData.append('coverLetter', 'I am interested in this position...');
formData.append('cv', fileInput.files[0]);

const response = await fetch('/api/applications/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### School Updating Application Status

```javascript
const response = await fetch('/api/applications/app123/status', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    status: 'INTERVIEW',
    note: 'Great candidate, scheduling interview for next week',
    interviewDate: '2024-01-15T10:00:00Z'
  })
});
```

## Pricing Update

The Basic plan annual price has been updated from $499 to $519 to match the Stripe configuration.

## Troubleshooting

### Jobs Not Appearing
If newly created jobs aren't appearing:
1. Ensure the job status is set to `ACTIVE`
2. Check that the deadline hasn't passed
3. Verify the job was created successfully in the database

### File Upload Issues
1. Check Cloudinary credentials are correctly configured
2. Ensure file size is under 10MB
3. Verify file format is PDF, DOC, or DOCX

## Future Enhancements

1. **AI Matching**: Implement AI-powered candidate matching for Premium schools
2. **Bulk Actions**: Allow schools to update multiple applications at once
3. **Advanced Filters**: More sophisticated filtering options for applications
4. **Video Introductions**: Allow teachers to upload video introductions
5. **Interview Scheduling**: Integrated calendar for interview scheduling