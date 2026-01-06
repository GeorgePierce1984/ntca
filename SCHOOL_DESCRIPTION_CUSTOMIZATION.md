# School Description Customization Feature

## Overview

This feature allows schools to choose between using their default profile description or providing a custom description for individual job postings. This gives schools flexibility in how they present themselves for different positions.

## Problem Statement

Schools may want to tailor their description based on the specific job posting:
- A school hiring for a STEM position might emphasize their science facilities
- For language teachers, they might highlight their international environment
- Special programs or partnerships relevant to specific positions can be featured

## Solution Implemented

### 1. UI Enhancement

Added a checkbox and conditional text area in the job posting form:

```tsx
<label className="flex items-center gap-3 cursor-pointer">
  <input
    type="checkbox"
    checked={jobForm.useSchoolProfile}
    onChange={(e) => setJobForm({
      ...jobForm,
      useSchoolProfile: e.target.checked,
    })}
  />
  <span className="text-sm">Use school profile information</span>
</label>

{!jobForm.useSchoolProfile && (
  <textarea
    placeholder="Provide a custom description about your school for this specific position..."
  />
)}
```

### 2. Database Schema Update

Added two new fields to the Job model:

```prisma
model Job {
  // ... existing fields ...
  
  // School description preference
  useSchoolProfile  Boolean @default(true)
  schoolDescription String?
}
```

### 3. Data Flow

#### When Creating/Editing a Job:
1. Checkbox is checked by default (use school profile)
2. If unchecked, a text area appears for custom description
3. On save, both preference and custom description are stored

#### When Displaying a Job:
1. If `useSchoolProfile` is false and `schoolDescription` exists, show custom description
2. Otherwise, show the school's profile description
3. Visual indicator when custom description is used

## User Experience

### For Schools:

1. **Default Behavior**
   - Checkbox is pre-checked
   - No additional input required
   - School's profile description is used

2. **Custom Description**
   - Uncheck "Use school profile information"
   - Text area appears with smooth animation
   - Enter position-specific school description
   - Helper text explains this overrides profile description

3. **Visual Feedback**
   - When custom description is used, job detail page shows:
     - The custom description
     - Italic note: "* Custom description for this position"

### For Teachers:

- See relevant school information for each position
- Custom descriptions help understand position-specific benefits
- Clear indication when viewing tailored content

## Technical Implementation

### Frontend Components

1. **Job Form** (`SchoolDashboard.tsx`)
   - Added `useSchoolProfile` and `schoolDescription` to `JobFormData`
   - Conditional rendering with motion animation
   - Form state management

2. **Job Detail** (`JobDetail.tsx`)
   - Logic to display appropriate description
   - Visual indicator for custom descriptions

### Backend APIs

1. **Job Creation** (`/api/jobs/index.js`)
   - Accepts and stores description preference
   - Handles null values appropriately

2. **Job Update** (`/api/jobs/[id]/update.js`)
   - Updates description fields
   - Maintains data consistency

## Benefits

1. **Flexibility**: Schools can customize messaging per position
2. **Efficiency**: Default option uses existing profile data
3. **Relevance**: Position-specific information for candidates
4. **Consistency**: Option to maintain standard description

## Use Cases

### Example 1: International Baccalaureate Teacher
```
Custom Description: "Our IB program, established in 2010, has consistently 
achieved above-world average scores. We offer comprehensive PD support for 
IB certification and a collaborative teaching environment with weekly 
planning sessions."
```

### Example 2: Early Years Teacher
```
Custom Description: "Our Early Years campus features purpose-built facilities 
including sensory rooms, outdoor learning spaces, and a 1:8 teacher-student 
ratio. We follow the Reggio Emilia approach with strong parental involvement."
```

### Example 3: STEM Coordinator
```
Custom Description: "Leading our new STEM initiative, you'll have access to 
our maker space, robotics lab, and partnerships with local tech companies. 
Budget allocated for program development and equipment."
```

## Future Enhancements

1. **Templates**: Save common descriptions for reuse
2. **Variables**: Insert dynamic content (e.g., {{schoolName}}, {{location}})
3. **Preview**: Show how description appears before publishing
4. **Analytics**: Track which descriptions get more applications
5. **A/B Testing**: Test different descriptions for similar positions

## Migration Considerations

For existing jobs:
- Set `useSchoolProfile = true` by default
- No data loss or changes to existing postings
- Backward compatible implementation