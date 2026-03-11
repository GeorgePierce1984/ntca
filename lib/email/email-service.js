import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
// IMPORTANT: Resend's test domain (onboarding@resend.dev) can ONLY send to the account owner's email
// To send to all users, you MUST verify a custom domain in Resend and update EMAIL_FROM_ADDRESS
const EMAIL_CONFIG = {
  from: {
    name: (process.env.EMAIL_FROM_NAME || 'NTCA Platform').trim(),
    email: (process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev').trim() // ⚠️ Test domain - only sends to account owner!
  },
  replyTo: (process.env.EMAIL_REPLY_TO || 'onboarding@resend.dev').trim(),
  defaultDomain: (process.env.NEXT_PUBLIC_APP_URL || 'https://www.nt-ca.com').trim()
};

// Email templates
export const emailTemplates = {
  // Newsletter subscription welcome
  newsletterWelcome: {
    subject: "Welcome to NTCA — Thanks for subscribing!",
    html: () => `
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

          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for subscribing to NTCA updates.
          </p>

          <p style="color: #4b5563; line-height: 1.6;">
            We'll send you new teaching opportunities, platform updates, and helpful resources from time to time.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${EMAIL_CONFIG.defaultDomain}/jobs"
               style="display: inline-block; background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Browse Jobs
            </a>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              If you have any questions, reply to this email or contact
              <a href="mailto:${EMAIL_CONFIG.replyTo}" style="color: #2563eb;">${EMAIL_CONFIG.replyTo}</a>.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
              © ${new Date().getFullYear()} National Teaching Certification Authority. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

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

  // Teacher profile tips email
  teacherProfileTips: {
    subject: "NTCA profile tips — get discovered faster",
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
            <h1 style="color: #2563eb; margin: 0;">Profile Tips</h1>
          </div>

          <p style="color: #4b5563; line-height: 1.6;">
            Hi ${data.firstName || "there"},
          </p>

          <p style="color: #4b5563; line-height: 1.6;">
            A strong profile helps schools find you faster. Here are a few quick wins:
          </p>

          <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <ul style="color: #4b5563; line-height: 1.8; padding-left: 18px;">
              <li><strong>Add a clear headline/bio</strong> focused on your teaching context (kids, IELTS, business, etc.).</li>
              <li><strong>Upload your CV</strong> and key certifications (CELTA/TESOL, degree, etc.).</li>
              <li><strong>Specify locations & availability</strong> so schools can shortlist you quickly.</li>
              <li><strong>Keep it searchable</strong>: include keywords like “IELTS”, “Cambridge”, “Young learners”.</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${EMAIL_CONFIG.defaultDomain}/teachers/dashboard"
               style="display: inline-block; background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Update My Profile
            </a>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
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

  // School onboarding: how to post a job
  schoolHowToPostJob: {
    subject: "How to post your first job on NTCA",
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
            <h1 style="color: #2563eb; margin: 0;">Post a Job</h1>
          </div>

          <p style="color: #4b5563; line-height: 1.6;">
            Welcome${data.schoolName ? `, ${data.schoolName}` : ""}! Here’s how to post your first job in a couple of minutes:
          </p>

          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0;">
            <ol style="color: #4b5563; line-height: 1.8; padding-left: 18px;">
              <li>Go to your school dashboard</li>
              <li>Click <strong>Post New Job</strong></li>
              <li>Add the job title, location, salary and requirements</li>
              <li>Publish — we’ll start matching teachers automatically</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${EMAIL_CONFIG.defaultDomain}/schools/dashboard"
               style="display: inline-block; background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Go to Dashboard
            </a>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
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

          <p style="color: #4b5563; line-height: 1.6;">
            Please review your dashboard to see this applicant and take the next step.
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
            <p style="color: #4b5563; margin: 5px 0;"><strong>Experience:</strong> ${typeof data.teacherExperience === 'number' ? `${data.teacherExperience} years` : data.teacherExperience}</p>
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
            <a href="${EMAIL_CONFIG.defaultDomain}/schools/dashboard?tab=applicants"
               style="display: inline-block; background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Review in Dashboard
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
            ${
              (data.action || "").toLowerCase() === "activated"
                ? "Payment received — your account is now activated."
                : `Your NTCA subscription has been ${data.action}.`
            }
          </p>

          <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">New Plan Details:</h3>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Plan:</strong> ${data.planName}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Monthly Job Posts:</strong> ${data.jobLimit}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Price:</strong> ${data.price}${data.billingInterval ? `/${data.billingInterval}` : ""}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Next Billing Date:</strong> ${data.nextBillingDate}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${EMAIL_CONFIG.defaultDomain}/schools/dashboard"
               style="display: inline-block; background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Go to Dashboard
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

  // Email verification template
  emailVerification: {
    subject: 'Verify Your Email - NTCA Platform',
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
            <h1 style="color: #2563eb; margin: 0;">Verify Your Email</h1>
          </div>

          <p style="color: #4b5563; line-height: 1.6;">
            Hi there,
          </p>

          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for signing up for NTCA. Please use the verification code below to verify your email address:
          </p>

          <div style="background: #eff6ff; border: 2px solid #2563eb; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <p style="color: #1e40af; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">Your Verification Code:</p>
            <div style="font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${data.code}
            </div>
          </div>

          <div style="background: #fef3c7; border: 1px solid #fde68a; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>⏰ This code will expire in 15 minutes</strong>
            </p>
          </div>

          <p style="color: #4b5563; line-height: 1.6;">
            Enter this code in the verification page to complete your registration. If you didn't create an account, please ignore this email.
          </p>

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

    // Log before sending
    console.log('Attempting to send email:', {
      to: toEmail,
      from: `${EMAIL_CONFIG.from.name} <${EMAIL_CONFIG.from.email}>`,
      replyTo: EMAIL_CONFIG.replyTo,
      template: templateName,
      hasApiKey: !!process.env.RESEND_API_KEY,
    });

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

    // Enhanced logging for debugging delivery issues
    console.log('Email sent via Resend:', {
      to: toEmail,
      template: templateName,
      messageId: result.id,
      from: EMAIL_CONFIG.from.email,
      timestamp: new Date().toISOString(),
    });

    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Email send error:', error);
    console.error('Email send error details:', {
      to: toEmail,
      template: templateName,
      from: EMAIL_CONFIG.from.email,
      errorMessage: error.message,
      errorCode: error.code,
      errorStatus: error.status,
      timestamp: new Date().toISOString(),
    });

    // Log email failure
    await logEmailActivity(toEmail, templateName, 'failed', { 
      error: error.message,
      errorCode: error.code,
      errorStatus: error.status,
    });

    return { 
      success: false, 
      error: error.message,
      errorCode: error.code,
      errorStatus: error.status,
    };
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

async function getSchoolApplicantAlertConfig(school, jobId) {
  let user = null;
  const applicantCount = await prisma.application.count({
    where: { jobId },
  });

  try {
    user = school?.userId
      ? await prisma.user.findUnique({
          where: { id: school.userId },
          select: {
            email: true,
            emailSchoolApplicantAlerts: true,
          },
        })
      : null;
  } catch (error) {
    if (error.code === "P2022" || error.message?.includes("does not exist")) {
      user = school?.userId
        ? await prisma.user.findUnique({
            where: { id: school.userId },
            select: {
              email: true,
            },
          })
        : null;
    } else {
      throw error;
    }
  }

  return {
    applicantCount,
    enabled: user?.emailSchoolApplicantAlerts ?? true,
    toEmail: school.contactEmail || school.user?.email || user?.email || school.email,
  };
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

  async sendTeacherProfileTips(teacher) {
    return await sendEmail("teacherProfileTips", teacher.user?.email || teacher.email, {
      firstName: teacher.firstName,
      lastName: teacher.lastName,
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

  async sendSchoolHowToPostJob(school) {
    return await sendEmail("schoolHowToPostJob", school.user?.email || school.email, {
      schoolName: school.name,
    });
  },

  // Notify school of new application
  async notifySchoolOfApplication(school, job, teacher, application) {
    const { applicantCount, enabled, toEmail } =
      await getSchoolApplicantAlertConfig(school, job.id);

    if (!enabled) {
      return { success: false, skipped: true, reason: "school_opted_out" };
    }

    if (applicantCount > 5) {
      return { success: false, skipped: true, reason: "applicant_limit_reached" };
    }

    if (!toEmail) {
      console.warn("No school email found for applicant alert", {
        schoolId: school?.id,
        jobId: job?.id,
      });
      return { success: false, skipped: true, reason: "missing_recipient" };
    }

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

  // Send email verification code
  async sendVerificationEmail(email, code) {
    return await sendEmail('emailVerification', email, {
      code: code
    });
  },

  // Newsletter subscription welcome
  async sendNewsletterWelcome(email) {
    return await sendEmail("newsletterWelcome", email, {});
  },

  // Send subscription change notification
  async sendSubscriptionChanged(school, action, planDetails) {
    return await sendEmail('subscriptionChanged', school.user?.email || school.email, {
      schoolName: school.name,
      action: action, // 'upgraded', 'downgraded', 'renewed', 'cancelled'
      planName: planDetails.name,
      jobLimit: planDetails.jobLimit,
      price: planDetails.price,
      nextBillingDate: planDetails.nextBillingDate,
      billingInterval: planDetails.billingInterval,
    });
  },

  // Notify school of guest application
  async notifySchoolOfGuestApplication(school, job, guestInfo, application) {
    const { applicantCount, enabled, toEmail } =
      await getSchoolApplicantAlertConfig(school, job.id);

    if (!enabled) {
      return { success: false, skipped: true, reason: "school_opted_out" };
    }

    if (applicantCount > 5) {
      return { success: false, skipped: true, reason: "applicant_limit_reached" };
    }

    if (!toEmail) {
      console.warn("No school email found for guest applicant alert", {
        schoolId: school?.id,
        jobId: job?.id,
      });
      return { success: false, skipped: true, reason: "missing_recipient" };
    }

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
