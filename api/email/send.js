import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';

const resend = new Resend(process.env.RESEND_API_KEY);
const prisma = new PrismaClient();

// Email templates
const emailTemplates = {
  welcomeTeacher: {
    subject: 'Welcome to NTCA - Your Teaching Journey Starts Here!',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to NTCA, ${data.firstName}!</h1>
        <p>Thank you for joining the National Teaching Certification Authority platform.</p>
        <p>Your profile is now live and schools across Kazakhstan can discover your qualifications.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Next Steps:</h3>
          <ul>
            <li>Complete your profile to increase visibility</li>
            <li>Upload your CV and certifications</li>
            <li>Browse available teaching positions</li>
            <li>Set up job alerts for your preferences</li>
          </ul>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/teachers/dashboard"
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Complete Your Profile
        </a>
        <p style="margin-top: 30px; color: #6b7280;">
          Best regards,<br>
          The NTCA Team
        </p>
      </div>
    `
  },

  welcomeSchool: {
    subject: 'Welcome to NTCA - Start Hiring Qualified Teachers',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to NTCA, ${data.schoolName}!</h1>
        <p>Thank you for joining our platform to connect with qualified English teachers.</p>
        <p>Your ${data.planName} subscription is now active and you can start posting jobs immediately.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Your Plan Includes:</h3>
          <ul>
            <li>${data.jobLimit} job postings per month</li>
            <li>Access to verified CELTA/TESOL teachers</li>
            <li>Advanced applicant filtering tools</li>
            <li>Priority support</li>
          </ul>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/schools/dashboard"
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Post Your First Job
        </a>
        <p style="margin-top: 30px; color: #6b7280;">
          Best regards,<br>
          The NTCA Team
        </p>
      </div>
    `
  },

  applicationReceived: {
    subject: 'New Application Received - {jobTitle}',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">New Application Received</h1>
        <p>Great news! You've received a new application for your job posting.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Job Details:</h3>
          <p><strong>Position:</strong> ${data.jobTitle}</p>
          <p><strong>Location:</strong> ${data.jobLocation}</p>
          <p><strong>Applicant:</strong> ${data.teacherName}</p>
          <p><strong>Qualifications:</strong> ${data.teacherQualification}</p>
          <p><strong>Experience:</strong> ${data.teacherExperience}</p>
        </div>
        ${data.coverLetter ? `
          <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Cover Letter:</h4>
            <p style="font-style: italic;">"${data.coverLetter.substring(0, 200)}..."</p>
          </div>
        ` : ''}
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/schools/dashboard?tab=applications"
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Review Application
        </a>
        <p style="margin-top: 30px; color: #6b7280;">
          Best regards,<br>
          The NTCA Team
        </p>
      </div>
    `
  },

  applicationStatusUpdate: {
    subject: 'Application Status Update - {jobTitle}',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Application Status Update</h1>
        <p>Hi ${data.teacherName},</p>
        <p>Your application status has been updated for the position at ${data.schoolName}.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Application Details:</h3>
          <p><strong>Position:</strong> ${data.jobTitle}</p>
          <p><strong>School:</strong> ${data.schoolName}</p>
          <p><strong>Status:</strong> <span style="color: ${getStatusColor(data.status)}; font-weight: bold;">${data.status}</span></p>
          ${data.note ? `<p><strong>Note:</strong> ${data.note}</p>` : ''}
        </div>
        ${data.status === 'INTERVIEW' ? `
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1e40af;">🎉 Congratulations!</h4>
            <p>You've been selected for an interview. The school will contact you shortly with details.</p>
          </div>
        ` : ''}
        ${data.status === 'HIRED' ? `
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #166534;">🎉 Congratulations!</h4>
            <p>You've been hired! Welcome to your new teaching position.</p>
          </div>
        ` : ''}
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/teachers/dashboard?tab=applications"
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Application
        </a>
        <p style="margin-top: 30px; color: #6b7280;">
          Best regards,<br>
          The NTCA Team
        </p>
      </div>
    `
  },

  passwordReset: {
    subject: 'Reset Your NTCA Password',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Reset Your Password</h1>
        <p>Hi ${data.name},</p>
        <p>You requested to reset your password for your NTCA account.</p>
        <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${data.token}"
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Reset Password
        </a>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p style="margin-top: 30px; color: #6b7280;">
          Best regards,<br>
          The NTCA Team
        </p>
      </div>
    `
  },

  jobAlert: {
    subject: 'New Job Alert - {location}',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">New Job Opportunity</h1>
        <p>Hi ${data.teacherName},</p>
        <p>A new teaching position matching your preferences has been posted!</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${data.jobTitle}</h3>
          <p><strong>School:</strong> ${data.schoolName}</p>
          <p><strong>Location:</strong> ${data.location}</p>
          <p><strong>Salary:</strong> ${data.salary}</p>
          <p><strong>Type:</strong> ${data.jobType}</p>
          <p><strong>Deadline:</strong> ${new Date(data.deadline).toLocaleDateString()}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/teachers/jobs/${data.jobId}"
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Job & Apply
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">
          You're receiving this because you have job alerts enabled.
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/teachers/dashboard?tab=alerts">Manage your alerts</a>
        </p>
      </div>
    `
  }
};

// Helper function to get status color
function getStatusColor(status) {
  switch (status) {
    case 'APPLIED': return '#3b82f6';
    case 'REVIEWING': return '#8b5cf6';
    case 'INTERVIEW': return '#f59e0b';
    case 'HIRED': return '#10b981';
    case 'DECLINED': return '#ef4444';
    default: return '#6b7280';
  }
}

// Main email sending function
export async function sendEmail(templateName, toEmail, data = {}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return { success: false, error: 'Email service not configured' };
    }

    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const subject = template.subject.replace(/\{(\w+)\}/g, (match, key) => data[key] || match);
    const html = template.html(data);

    const result = await resend.emails.send({
      from: 'NTCA Platform <noreply@ntca.vercel.app>',
      to: toEmail,
      subject: subject,
      html: html,
    });

    // Log email activity
    await logEmailActivity(toEmail, templateName, 'sent', { messageId: result.id });

    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Email send error:', error);

    // Log email failure
    await logEmailActivity(toEmail, templateName, 'failed', { error: error.message });

    return { success: false, error: error.message };
  }
}

// Log email activity for analytics and debugging
async function logEmailActivity(email, template, status, details = {}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: 'system',
        action: `EMAIL_${status.toUpperCase()}`,
        details: {
          email,
          template,
          status,
          ...details,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error logging email activity:', error);
  }
}

// API endpoint handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { template, email, data } = req.body;

    if (!template || !email) {
      return res.status(400).json({ error: 'Template and email are required' });
    }

    // Verify API key for internal use
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await sendEmail(template, email, data);

    if (result.success) {
      return res.status(200).json({
        message: 'Email sent successfully',
        messageId: result.messageId
      });
    } else {
      return res.status(500).json({
        error: 'Failed to send email',
        details: result.error
      });
    }

  } catch (error) {
    console.error('Email API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Helper functions for common email scenarios
export const emailHelpers = {
  // Send welcome email to new teacher
  async sendTeacherWelcome(teacher) {
    return await sendEmail('welcomeTeacher', teacher.user.email, {
      firstName: teacher.firstName,
      lastName: teacher.lastName
    });
  },

  // Send welcome email to new school
  async sendSchoolWelcome(school, planDetails) {
    return await sendEmail('welcomeSchool', school.user.email, {
      schoolName: school.name,
      planName: planDetails.name,
      jobLimit: planDetails.jobLimit
    });
  },

  // Notify school of new application
  async notifySchoolOfApplication(school, job, teacher, application) {
    return await sendEmail('applicationReceived', school.contactEmail || school.user.email, {
      jobTitle: job.title,
      jobLocation: job.location,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      teacherQualification: teacher.qualification,
      teacherExperience: teacher.experience,
      coverLetter: application.coverLetter
    });
  },

  // Notify teacher of status update
  async notifyTeacherOfStatusUpdate(teacher, job, school, newStatus, note = null) {
    return await sendEmail('applicationStatusUpdate', teacher.user.email, {
      teacherName: teacher.firstName,
      jobTitle: job.title,
      schoolName: school.name,
      status: newStatus,
      note: note
    });
  },

  // Send job alert to teacher
  async sendJobAlert(teacher, job, school) {
    return await sendEmail('jobAlert', teacher.user.email, {
      teacherName: teacher.firstName,
      jobTitle: job.title,
      schoolName: school.name,
      location: job.location,
      salary: job.salary,
      jobType: job.type,
      deadline: job.deadline,
      jobId: job.id
    });
  },

  // Send password reset email
  async sendPasswordReset(user, resetToken) {
    return await sendEmail('passwordReset', user.email, {
      name: user.userType === 'TEACHER' ? user.teacher?.firstName : user.school?.contactName,
      token: resetToken
    });
  }
};
