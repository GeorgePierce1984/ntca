# Save as Draft Functionality Implementation

## Overview

This document describes the implementation of the "Save as Draft" functionality for job postings in the School Dashboard, which allows schools to save incomplete job postings and return to them later.

## Problem Statement

The "Save as Draft" button was present in the UI but was non-functional. When clicked, it didn't provide any visual feedback or actually save the job as a draft, leading to poor user experience and potential loss of work.

## Solution Implemented

### 1. Database Schema Update

Added `DRAFT` to the JobStatus enum in Prisma schema:

```prisma
enum JobStatus {
  DRAFT
  ACTIVE
  PAUSED
  CLOSED
}
```

### 2. Frontend Implementation

#### Updated Form Submission Handler

Modified the `handleJobSubmit` function to accept an `isDraft` parameter:

```typescript
const handleJobSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
  e.preventDefault();
  setSubmitting(true);

  const jobData = {
    ...jobForm,
    status: isDraft ? "DRAFT" : "ACTIVE",
  };

  // API call with appropriate status
};
```

#### Added Draft Button Functionality

```tsx
<Button
  type="button"
  variant="secondary"
  size="lg"
  disabled={submitting}
  onClick={(e) => {
    e.preventDefault();
    handleJobSubmit(e, true);
  }}
>
  Save as Draft
</Button>
```

#### Visual Status Indicators

Added draft status color to `getStatusColor` function:

```typescript
case "DRAFT":
case "draft":
  return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
```

### 3. Backend API Updates

#### Job Creation Endpoint

Updated `/api/jobs/index.js` to accept and handle draft status:

```javascript
const job = await prisma.job.create({
  data: {
    // ... other fields
    status: status || "ACTIVE", // Defaults to ACTIVE if not specified
  },
});
```

#### Job Update Endpoint

Modified `/api/jobs/[id]/update.js` to include DRAFT in valid statuses:

```javascript
const validStatuses = ["DRAFT", "ACTIVE", "PAUSED", "CLOSED"];
```

### 4. User Experience Flow

1. **Creating a Draft**
   - User fills out partial job information
   - Clicks "Save as Draft" button
   - Job is saved with DRAFT status
   - Success toast: "Job saved as draft! 📝"
   - User is redirected to jobs list

2. **Editing a Draft**
   - Draft jobs appear in the jobs list with gray "draft" badge
   - User can click edit to continue working on the draft
   - Can either save as draft again or publish

3. **Publishing a Draft**
   - User completes the job information
   - Clicks "Publish Job Posting"
   - Job status changes from DRAFT to ACTIVE
   - Job becomes visible to teachers

## Benefits

1. **Work Preservation**: Schools can save incomplete job postings without losing progress
2. **Flexibility**: Allows schools to gather all required information before publishing
3. **Review Process**: Enables internal review before making jobs public
4. **Reduced Errors**: Prevents premature publication of incomplete job postings

## Technical Details

### API Request Format

Save as Draft:
```json
{
  "title": "English Teacher",
  "description": "Partial description...",
  "status": "DRAFT",
  // Other fields can be incomplete
}
```

### Database Considerations

- Draft jobs are stored with the same structure as active jobs
- Only the status field differentiates them
- Draft jobs are not visible in public job listings
- Schools can have multiple draft jobs

### Validation Rules

- Draft jobs have relaxed validation (only basic fields required)
- Active jobs require all mandatory fields
- Status transitions: DRAFT → ACTIVE → PAUSED → CLOSED

## UI/UX Considerations

1. **Visual Differentiation**
   - Draft jobs show gray badge
   - Different icon in job list
   - Clear indication of draft status

2. **Action Availability**
   - Draft jobs cannot be paused (only published jobs can)
   - Applications not accepted for draft jobs
   - Edit button always available

3. **Feedback Messages**
   - Clear success messages for draft saves
   - Different icons for draft vs. publish actions
   - Informative error messages if save fails

## Future Enhancements

1. **Auto-save**: Periodically save form progress automatically
2. **Draft Templates**: Save common job posting templates
3. **Draft Expiry**: Automatically delete old drafts after X days
4. **Bulk Actions**: Publish multiple drafts at once
5. **Version History**: Track changes between draft saves
6. **Collaboration**: Allow multiple users to work on drafts

## Testing Checklist

- [ ] Save incomplete job as draft
- [ ] Edit existing draft
- [ ] Publish draft to active job
- [ ] View draft in jobs list
- [ ] Verify draft not visible to teachers
- [ ] Check draft status badge display
- [ ] Test validation for draft vs. active
- [ ] Verify success/error messages