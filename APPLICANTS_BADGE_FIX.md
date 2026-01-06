# Applicants Badge Click Functionality

## Overview

This document describes the implementation of the clickable applicants badge feature that allows school owners to quickly navigate to view applicants for their job postings.

## Problem Statement

The applicants count badge (showing "12 Applicants" with an eye icon) on job detail pages was not clickable, despite users naturally expecting it to be interactive. This created a poor UX where school owners couldn't easily access the list of applicants from the job detail view.

## Solution Implemented

### 1. Created JobDetail Component

Created a comprehensive job detail page (`/src/pages/jobs/JobDetail.tsx`) with the following features:

- **Clickable Applicants Badge for School Owners**
  - The badge is interactive only for the school that posted the job
  - Clicking navigates to the school dashboard with the applications tab pre-selected
  - Visual feedback with hover and click animations
  - Different styling for owners vs. non-owners

- **Security Considerations**
  - Only authenticated school users who own the job can click the badge
  - Non-owners see a static badge (no hover effects or click functionality)
  - Attempting to click as a non-owner shows an error toast

### 2. Enhanced School Dashboard Navigation

Updated the School Dashboard to handle query parameters:

```typescript
// Handle navigation from job detail page
const tabParam = searchParams.get("tab");
const jobParam = searchParams.get("job");

if (tabParam === "applications") {
  setActiveTab("applications");
  if (jobParam) {
    // Filter applications by job if provided
    setFilterStatus(jobParam);
  }
}
```

### 3. Created Reusable JobCard Component

Built a reusable `JobCard` component (`/src/components/jobs/JobCard.tsx`) that includes:

- Clickable applicants badge with consistent behavior
- Multiple display variants (default, compact, detailed)
- Action buttons for job management
- Proper event handling to prevent navigation conflicts

## Implementation Details

### Applicants Badge Rendering

For school owners:
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={handleViewApplicants}
  className="flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
>
  <Eye className="w-5 h-5" />
  <div className="text-center">
    <div className="text-2xl font-bold">{job._count.applications}</div>
    <div className="text-xs">Applicants</div>
  </div>
</motion.button>
```

For non-owners:
```tsx
<div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
  <Eye className="w-5 h-5 text-neutral-500" />
  <div className="text-center">
    <div className="text-2xl font-bold">{job._count.applications}</div>
    <div className="text-xs text-neutral-500">Applicants</div>
  </div>
</div>
```

### Navigation Logic

```typescript
const handleViewApplicants = () => {
  if (!user || user.userType !== "SCHOOL") {
    toast.error("Only schools can view applicants");
    return;
  }

  // Navigate to the school dashboard with the applications tab selected
  navigate(`/schools/dashboard?tab=applications&job=${id}`);
};
```

## User Experience Flow

1. **School Owner Views Their Job**
   - Sees an interactive applicants badge with hover effects
   - Badge has primary color styling indicating it's clickable
   - Hover shows scale animation
   - Click shows tap animation and navigates to applications

2. **Non-Owner Views Job**
   - Sees a static badge with neutral colors
   - No hover effects or cursor pointer
   - Clicking does nothing (badge is not interactive)

3. **Navigation to Applications**
   - School dashboard opens with "Applications" tab active
   - Applications are pre-filtered to show only the selected job
   - School can view all applicants and manage their status

## Visual Indicators

- **Interactive Badge (Owners)**
  - Primary color background (blue)
  - Hover: Scale up slightly + darker background
  - Click: Scale down animation
  - Cursor: Pointer

- **Static Badge (Non-Owners)**
  - Neutral color background (gray)
  - No hover effects
  - Cursor: Default

## Additional Features

1. **Alternative Access Methods**
   - "View All Applicants" button in job actions
   - Applications count in job listings is also clickable
   - Direct navigation from school dashboard job list

2. **Mobile Optimization**
   - Touch-friendly tap targets (minimum 44x44px)
   - Appropriate touch feedback
   - Works seamlessly on all screen sizes

3. **Accessibility**
   - Proper ARIA labels
   - Keyboard navigation support
   - Screen reader friendly

## Testing Checklist

- [ ] Badge is clickable only for job owners
- [ ] Click navigates to correct dashboard tab
- [ ] Applications are filtered by job when navigating
- [ ] Non-owners cannot interact with badge
- [ ] Visual feedback works on hover and click
- [ ] Mobile touch interactions work correctly
- [ ] Error messages appear for unauthorized attempts

## Future Enhancements

1. **Quick Preview**: Show applicant preview on hover
2. **Badge Variations**: Different colors for application status
3. **Real-time Updates**: Live applicant count updates
4. **Notifications**: Red dot for new applications
5. **Bulk Actions**: Select multiple applicants from badge menu