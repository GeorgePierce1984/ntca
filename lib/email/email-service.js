import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const EMAIL_CONFIG = {
  from: {
    name: 'NTCA Platform',
    email: 'onboarding@resend.dev' // Using Resend's test domain until custom domain is verified
  },
  replyTo: 'onboarding@resend.dev', // Using test domain for now
  defaultDomain: process.env.NEXT_PUBLIC_APP_URL || 'https://ntca.vercel.app'
};

// Email templates
export const emailTemplates = {
  // Teacher signup welcome email
  teacherWelcome: {
    subject: 'Welcome to NTCA - Your Teaching Journey Starts Here!',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Welcome to NTCA</h1>
          </div>

          <h2 style="color: #1f2937; font-size: 24px;">Hello ${data.firstName}!</h2>

          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for joining the National Teaching Certification Authority platform. Your profile is now live and schools across Kazakhstan can discover your qualifications.
          </p>

          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Next Steps:</h3>
            <ul style="color: #4b5563; line-height: 1.8;">
              <li>Complete your profile to increase visibility</li>
              <li>Upload your CV and certifications</li>
              <li>Browse available teaching positions</li>
              <li>Set up job alerts for your preferences</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${EMAIL_CONFIG.defaultDomain}/teachers/dashboard"
               style="display: inline-block; background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Complete Your Profile
            </a>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              If you have any questions, feel free to reach out to our support team at
              <a href="mailto:support@ntca.com" style="color: #2563eb;">support@ntca.com</a>
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
              © ${new Date().getFullYear()} National Teaching Certification Authority. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  // School signup welcome email
  schoolWelcome: {
    subject: 'Welcome to NTCA - Start Hiring Qualified Teachers',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Welcome to NTCA</h1>
          </div>

          <h2 style="color: #1f2937; font-size: 24px;">Welcome, ${data.schoolName}!</h2>

          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for joining our platform to connect with qualified English teachers.
            ${data.planName ? `Your ${data.planName} subscription is now active and you can start posting jobs immediately.` : 'You can now start exploring our platform.'}
          </p>

          ${data.planName ? `
          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Your Plan Includes:</h3>
            <ul style="color: #4b5563; line-height: 1.8;">
              <li>${data.jobLimit || 'Unlimited'} job postings per month</li>
              <li>Access to verified CELTA/TESOL teachers</li>
              <li>Advanced applicant filtering tools</li>
              <li>Priority support</li>
            </ul>
          </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${EMAIL_CONFIG.defaultDomain}/schools/dashboard"
               style="display: inline-block; background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              ${data.planName ? 'Post Your First Job' : 'Complete Your Profile'}
            </a>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              If you have any questions, feel free to reach out to our support team at
              <a href="mailto:support@ntca.com" style="color: #2563eb;">support@ntca.com</a>
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
              © ${new Date().getFullYear()} National Teaching Certification Authority. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  // New application notification for schools
  applicationReceived: {
    subject: 'New Application for {jobTitle}',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">New Application Received</h1>
          </div>

          <p style="color: #4b5563; line-height: 1.6;">
            Great news! You've received a new application for your job posting.
          </p>

          <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Job Details:</h3>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Position:</strong> ${data.jobTitle}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Location:</strong> ${data.jobLocation}</p>
          </div>

          <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Applicant Information:</h3>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Name:</strong> ${data.teacherName}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Qualification:</strong> ${data.teacherQualification}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Experience:</strong> ${data.teacherExperience} years</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Location:</strong> ${data.teacherLocation}</p>
          </div>

          ${data.coverLetter ? `
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Cover Letter Preview:</h3>
            <p style="color: #4b5563; font-style: italic; line-height: 1.6;">
              "${data.coverLetter.substring(0, 200)}${data.coverLetter.length > 200 ? '...' : ''}"
            </p>
          </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${EMAIL_CONFIG.defaultDomain}/schools/dashboard?tab=applications"
               style="display: inline-block; background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Review Application
            </a>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px;">
              © ${new Date().getFullYear()} National Teaching Certification Authority. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  // Application status update for teachers
  applicationStatusUpdate: {
    subject: 'Application Update: {jobTitle} at {schoolName}',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Application Status Update</h1>
          </div>

          <p style="color: #4b5563; line-height: 1.6;">
            Hi ${data.teacherName},
          </p>

          <p style="color: #4b5563; line-height: 1.6;">
            Your application status has been updated for the position at ${data.schoolName}.
          </p>

          <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Application Details:</h3>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Position:</strong> ${data.jobTitle}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>School:</strong> ${data.schoolName}</p>
            <p style="color: #4b5563; margin: 5px 0;">
              <strong>Status:</strong>
              <span style="color: ${getStatusColor(data.status)}; font-weight: bold;">
                ${formatStatus(data.status)}
              </span>
            </p>
            ${data.note ? `<p style="color: #4b5563; margin: 10px 0;"><strong>Message from school:</strong><br>${data.note}</p>` : ''}
          </div>

          ${data.status === 'INTERVIEW' ? `
          <div style="background: #dbeafe; border: 1px solid #93c5fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">🎉 Congratulations!</h3>
            <p style="color: #1e40af;">
              You've been selected for an interview. The school will contact you shortly with details.
            </p>
          </div>
          ` : ''}

          ${data.status === 'HIRED' ? `
          <div style="background: #dcfce7; border: 1px solid #86efac; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #166534; margin-top: 0;">🎉 Congratulations!</h3>
            <p style="color: #166534;">
              You've been hired! Welcome to your new teaching position at ${data.schoolName}.
            </p>
          </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${EMAIL_CONFIG.defaultDomain}/teachers/dashboard?tab=applications"
               style="display: inline-block; background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              View Application
            </a>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px;">
              © ${new Date().getFullYear()} National Teaching Certification Authority. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  // Password reset email
  passwordReset: {
    subject: 'Reset Your NTCA Password',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Password Reset Request</h1>
          </div>

          <p style="color: #4b5563; line-height: 1.6;">
            Hi ${data.name},
          </p>

          <p style="color: #4b5563; line-height: 1.6;">
            You requested to reset your password for your NTCA account. Click the button below to create a new password.
          </p>

          <div style="background: #fef3c7; border: 1px solid #fde68a; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>⏰ This link will expire in 1 hour</strong>
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${EMAIL_CONFIG.defaultDomain}/reset-password?token=${data.token}"
               style="display: inline-block; background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Reset Password
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </p>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px;">
              © ${new Date().getFullYear()} National Teaching Certification Authority. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  // Subscription change notification
  subscriptionChanged: {
    subject: 'Your NTCA Subscription Has Been Updated',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Subscription Updated</h1>
          </div>

          <p style="color: #4b5563; line-height: 1.6;">
            Hi ${data.schoolName},
          </p>

          <p style="color: #4b5563; line-height: 1.6;">
            Your NTCA subscription has been ${data.action}. Here's a summary of your new plan:
          </p>

          <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">New Plan Details:</h3>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Plan:</strong> ${data.planName}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Monthly Job Posts:</strong> ${data.jobLimit}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Price:</strong> ${data.price}/month</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Next Billing Date:</strong> ${data.nextBillingDate}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${EMAIL_CONFIG.defaultDomain}/schools/dashboard?tab=subscription"
               style="display: inline-block; background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              View Subscription
            </a>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              If you have any questions about your subscription, please contact our support team at
              <a href="mailto:support@ntca.com" style="color: #2563eb;">support@ntca.com</a>
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
              © ${new Date().getFullYear()} National Teaching Certification Authority. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  // Job alert for teachers
  jobAlert: {
    subject: 'New Teaching Opportunity in {location}',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">New Job Alert</h1>
          </div>

          <p style="color: #4b5563; line-height: 1.6;">
            Hi ${data.teacherName},
          </p>

          <p style="color: #4b5563; line-height: 1.6;">
            A new teaching position matching your preferences has been posted!
          </p>

          <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">${data.jobTitle}</h3>
            <p style="color: #4b5563; margin: 5px 0;"><strong>School:</strong> ${data.schoolName}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Location:</strong> ${data.location}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Salary:</strong> ${data.salary}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Type:</strong> ${data.jobType}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Deadline:</strong> ${new Date(data.deadline).toLocaleDateString()}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${EMAIL_CONFIG.defaultDomain}/jobs/${data.jobId}"
               style="display: inline-block; background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              View Job & Apply
            </a>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              You're receiving this because you have job alerts enabled for ${data.location}.
              <a href="${EMAIL_CONFIG.defaultDomain}/teachers/dashboard?tab=alerts" style="color: #2563eb;">Manage your alerts</a>
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
              © ${new Date().getFullYear()} National Teaching Certification Authority. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  // Test email template
  testEmail: {
    subject: 'Test Email from NTCA Platform',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Email System Test</h1>
          </div>

          <p style="color: #4b5563; line-height: 1.6;">
            Hi ${data.name || 'there'},
          </p>

          <p style="color: #4b5563; line-height: 1.6;">
            This is a test email from the NTCA platform to verify that the email system is working correctly.
          </p>

          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Test Details:</h3>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Timestamp:</strong> ${data.timestamp}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Environment:</strong> ${process.env.NODE_ENV || 'production'}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Message:</strong> ${data.message || 'Email system is operational'}</p>
          </div>

          <div style="background: #dcfce7; border: 1px solid #86efac; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #166534; margin: 0; font-weight: bold;">✅ Email system is working!</p>
          </div>

          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
            If you received this email, it means the NTCA email system is configured correctly and working as expected.
          </p>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px;">
              This is an automated test email. Please do not reply.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 10px;">
              © ${new Date().getFullYear()} National Teaching Certification Authority. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

// Helper function to get status color
function getStatusColor(status) {
  const colors = {
    'APPLIED': '#3b82f6',
    'REVIEWING': '#8b5cf6',
    'INTERVIEW': '#f59e0b',
    'HIRED': '#10b981',
    'DECLINED': '#ef4444'
  };
  return colors[status] || '#6b7280';
}

// Helper function to format status
function formatStatus(status) {
  const formatted = {
    'APPLIED': 'Applied',
    'REVIEWING': 'Under Review',
    'INTERVIEW': 'Interview Scheduled',
    'HIRED': 'Hired',
    'DECLINED': 'Not Selected'
  };
  return formatted[status] || status;
}

// Main email sending function
export async function sendEmail(templateName, toEmail, data = {}) {
  try {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key') {
      console.warn('RESEND_API_KEY not configured, email not sent');
      return { success: false, error: 'Email service not configured' };
    }

    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    // Replace placeholders in subject
    const subject = template.subject.replace(/\{(\w+)\}/g, (match, key) => data[key] || match);
    const html = template.html(data);

    // Send email via Resend
    const result = await resend.emails.send({
      from: `${EMAIL_CONFIG.from.name} <${EMAIL_CONFIG.from.email}>`,
      to: toEmail,
      replyTo: EMAIL_CONFIG.replyTo,
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

// Helper functions for common email scenarios
export const emailHelpers = {
  // Send welcome email to new teacher
  async sendTeacherWelcome(teacher) {
    return await sendEmail('teacherWelcome', teacher.user?.email || teacher.email, {
      firstName: teacher.firstName,
      lastName: teacher.lastName
    });
  },

  // Send welcome email to new school
  async sendSchoolWelcome(school, planDetails = {}) {
    return await sendEmail('schoolWelcome', school.user?.email || school.email, {
      schoolName: school.name,
      planName: planDetails.name || 'Free Trial',
      jobLimit: planDetails.jobLimit || 3
    });
  },

  // Notify school of new application
  async notifySchoolOfApplication(school, job, teacher, application) {
    const toEmail = school.contactEmail || school.user?.email || school.email;
    return await sendEmail('applicationReceived', toEmail, {
      jobTitle: job.title,
      jobLocation: job.location,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      teacherQualification: teacher.qualification,
      teacherExperience: teacher.experienceYears || teacher.experience,
      teacherLocation: `${teacher.city}, ${teacher.country}`,
      coverLetter: application.coverLetter
    });
  },

  // Notify teacher of status update
  async notifyTeacherOfStatusUpdate(teacher, job, school, newStatus, note = null) {
    return await sendEmail('applicationStatusUpdate', teacher.user?.email || teacher.email, {
      teacherName: teacher.firstName,
      jobTitle: job.title,
      schoolName: school.name,
      status: newStatus,
      note: note
    });
  },

  // Send job alert to teacher
  async sendJobAlert(teacher, job, school) {
    return await sendEmail('jobAlert', teacher.user?.email || teacher.email, {
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
    const name = user.userType === 'TEACHER'
      ? user.teacher?.firstName
      : user.school?.contactName || 'User';

    return await sendEmail('passwordReset', user.email, {
      name: name,
      token: resetToken
    });
  },

  // Send subscription change notification
  async sendSubscriptionChanged(school, action, planDetails) {
    return await sendEmail('subscriptionChanged', school.user?.email || school.email, {
      schoolName: school.name,
      action: action, // 'upgraded', 'downgraded', 'renewed', 'cancelled'
      planName: planDetails.name,
      jobLimit: planDetails.jobLimit,
      price: planDetails.price,
      nextBillingDate: planDetails.nextBillingDate
    });
  },

  // Notify school of guest application
  async notifySchoolOfGuestApplication(school, job, guestInfo, application) {
    const toEmail = school.contactEmail || school.user?.email || school.email;
    return await sendEmail('applicationReceived', toEmail, {
      jobTitle: job.title,
      jobLocation: job.location,
      teacherName: `${guestInfo.firstName} ${guestInfo.lastName}`,
      teacherQualification: 'Guest Applicant',
      teacherExperience: 'Not specified',
      teacherLocation: guestInfo.city && guestInfo.country ? `${guestInfo.city}, ${guestInfo.country}` : 'Not specified',
      coverLetter: application.coverLetter
    });
  },

  // Send confirmation email to guest applicant
  async sendGuestApplicationConfirmation(guestInfo, job, application) {
    // Create a simple confirmation email for guest applicants
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Application Received</h1>
          </div>

          <p style="color: #4b5563; line-height: 1.6;">
            Hi ${guestInfo.firstName},
          </p>

          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for your application! We've successfully received your application for the position of <strong>${job.title}</strong>.
          </p>

          <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Application Details:</h3>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Position:</strong> ${job.title}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>School:</strong> ${job.school.name}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Location:</strong> ${job.location}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Application ID:</strong> ${application.id}</p>
          </div>

          <div style="background: #dbeafe; border: 1px solid #93c5fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">What happens next?</h3>
            <p style="color: #1e40af;">
              The school will review your application and contact you directly at ${guestInfo.email} if they're interested in proceeding with your application.
            </p>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              If you have any questions, feel free to reach out to our support team at
              <a href="mailto:support@ntca.com" style="color: #2563eb;">support@ntca.com</a>
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
              © ${new Date().getFullYear()} National Teaching Certification Authority. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const result = await resend.emails.send({
        from: `${EMAIL_CONFIG.from.name} <${EMAIL_CONFIG.from.email}>`,
        to: guestInfo.email,
        replyTo: EMAIL_CONFIG.replyTo,
        subject: `Application Confirmation: ${job.title}`,
        html: confirmationHtml,
      });

      await logEmailActivity(guestInfo.email, 'guestApplicationConfirmation', 'sent', { messageId: result.id });
      return { success: true, messageId: result.id };
    } catch (error) {
      console.error('Guest confirmation email error:', error);
      await logEmailActivity(guestInfo.email, 'guestApplicationConfirmation', 'failed', { error: error.message });
      return { success: false, error: error.message };
    }
  }
};

// Export default for API routes
export default {
  sendEmail,
  emailHelpers,
  emailTemplates
};
