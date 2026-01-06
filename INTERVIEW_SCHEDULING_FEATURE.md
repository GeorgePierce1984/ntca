# Interview Scheduling Feature

## Overview

This document describes the implementation of the comprehensive interview scheduling system for the NTCA platform, which provides schools with a professional way to schedule interviews with job applicants.

## Problem Statement

Previously, clicking "Schedule Interview" would only update the applicant's status to "interview" without providing any actual scheduling functionality. This led to:
- No way to set specific dates and times
- No communication with applicants about interview details
- Manual coordination required outside the platform
- Poor user experience for both schools and applicants

## Solution Implemented

### 1. Interview Schedule Modal Component

Created a dedicated `InterviewScheduleModal` component with the following features:

#### Core Functionality
- **Date & Time Selection**: Calendar date picker with time selection
- **Duration Options**: 30 minutes to 2 hours
- **Interview Types**: 
  - Video Call (with meeting link generation)
  - In-Person (with location field)
  - Phone Call (displays applicant's phone number)

#### Smart Features
- **Validation**: Prevents scheduling in the past
- **Meeting Link Generator**: Auto-generates secure meeting links
- **Notification Options**: 
  - Email notification to applicant
  - Calendar invite to both parties
- **Interview Notes**: Add agenda or questions for the interview

### 2. Integration Points

#### From Applicant List
- "Schedule Interview" button opens the modal
- "Move to Interview" button for applicants in review stage

#### From Applicant Detail Modal
- Integrated scheduling button in the action bar
- Shows interview details once scheduled

#### From Recent Applicants (Overview)
- Quick action to schedule from the dashboard

### 3. User Experience Flow

1. **Initiate Scheduling**
   - Click "Schedule Interview" from any applicant view
   - Modal opens with applicant info pre-filled

2. **Configure Interview**
   - Select date (must be future date)
   - Choose time and duration
   - Pick interview type (video/in-person/phone)
   - Add location or meeting link as needed
   - Optional: Add notes or agenda

3. **Confirmation**
   - Review interview summary
   - Choose notification preferences
   - Click "Schedule Interview"

4. **Post-Scheduling**
   - Applicant status updates to "interview"
   - Interview details saved with application
   - Notifications sent (if enabled)
   - Success message displayed

## Technical Implementation

### Data Structure

```typescript
interface InterviewData {
  applicantId: string;
  date: string;
  time: string;
  duration: string;
  type: "in-person" | "video" | "phone";
  location?: string;
  meetingLink?: string;
  notes?: string;
  sendCalendarInvite: boolean;
  sendEmailNotification: boolean;
}
```

### Component Architecture

```
InterviewScheduleModal
├── Form Validation
├── Dynamic Field Rendering
├── Meeting Link Generation
├── Summary Preview
└── Notification Settings
```

### State Management

- Modal visibility controlled by parent component
- Form state managed internally
- Interview data passed to parent via callback
- Applicant status updated after successful scheduling

## Features in Detail

### 1. Smart Validation
- Date must be in the future
- Required fields based on interview type
- Real-time error display

### 2. Meeting Link Generation
- One-click generation of unique meeting links
- Format: `https://meet.ntca.app/interview/{unique-id}`
- Secure and trackable

### 3. Conditional Fields
- **Video**: Meeting link field with generator
- **In-Person**: Location field (required)
- **Phone**: Display applicant's phone number

### 4. Interview Summary
- Visual preview of scheduled interview
- Shows formatted date, time, duration
- Displays interview type and location/link

### 5. Notification System
- Email notifications with interview details
- Calendar invites (.ics files)
- Customizable notification preferences

## UI/UX Considerations

### Visual Design
- Modal overlay with smooth animations
- Clear form sections with icons
- Color-coded interview types
- Success states with checkmarks

### Accessibility
- Keyboard navigation support
- ARIA labels for screen readers
- Focus management in modal
- Clear error messages

### Mobile Responsiveness
- Full-width modal on mobile
- Touch-friendly date/time inputs
- Scrollable content area
- Sticky footer with actions

## Future Enhancements

1. **Calendar Integration**
   - Sync with Google Calendar
   - Outlook calendar support
   - Show interviewer availability

2. **Rescheduling**
   - Easy rescheduling interface
   - Applicant-initiated reschedule requests
   - Automatic conflict detection

3. **Interview Templates**
   - Save common interview formats
   - Question bank integration
   - Evaluation form templates

4. **Video Platform Integration**
   - Direct Zoom/Teams integration
   - Built-in video calling
   - Recording capabilities

5. **Automated Reminders**
   - SMS reminders
   - Email reminders (24hr, 1hr before)
   - Push notifications

6. **Multi-Interviewer Support**
   - Panel interview scheduling
   - Multiple interviewer calendars
   - Collaborative notes

## Testing Checklist

- [ ] Schedule interview with all three types
- [ ] Validate past date prevention
- [ ] Test meeting link generation
- [ ] Verify notification sending
- [ ] Check mobile responsiveness
- [ ] Test modal close/cancel behavior
- [ ] Verify status updates correctly
- [ ] Test with missing applicant data
- [ ] Check form validation messages
- [ ] Test keyboard navigation

## API Endpoints (Future)

```
POST /api/interviews/schedule
GET /api/interviews/:id
PUT /api/interviews/:id/reschedule
DELETE /api/interviews/:id/cancel
POST /api/interviews/:id/reminder
```

## Migration Notes

- Existing interviews without details remain unchanged
- New interviews will have full scheduling data
- Backward compatible implementation