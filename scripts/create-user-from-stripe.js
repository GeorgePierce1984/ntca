import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

async function createUserFromStripeSession(sessionId) {
  try {
    console.log('Fetching Stripe session:', sessionId);

    // Fetch the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    console.log('Session found:', {
      id: session.id,
      customer_email: session.customer_email,
      payment_status: session.payment_status,
      status: session.status,
    });

    // Check if metadata exists
    if (!session.metadata || !session.metadata.formData) {
      console.error('No form data in session metadata');
      console.log('Available metadata:', session.metadata);
      return;
    }

    // Parse form data
    const formData = JSON.parse(session.metadata.formData);
    const userType = session.metadata.userType || 'school';
    const email = formData.email || session.customer_email;

    if (!email) {
      throw new Error('No email found in session or form data');
    }

    console.log('Processing user:', email, 'Type:', userType);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { school: true }
    });

    if (existingUser) {
      console.log('User already exists:', existingUser.id);

      // Update subscription ID if needed
      if (existingUser.userType === 'SCHOOL' && existingUser.school) {
        await prisma.school.update({
          where: { id: existingUser.school.id },
          data: {
            subscriptionId: session.subscription || session.id,
            verified: true
          }
        });
        console.log('Updated existing school subscription');
      }

      return existingUser;
    }

    // Hash password
    const hashedPassword = formData.password
      ? await bcrypt.hash(formData.password, 12)
      : await bcrypt.hash(Math.random().toString(36).slice(-8), 12); // Generate random password if not provided

    // Create user and profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          userType: userType.toUpperCase(),
        }
      });

      console.log('Created user:', user.id);

      // Create school profile
      if (userType.toLowerCase() === 'school') {
        const school = await tx.school.create({
          data: {
            userId: user.id,
            name: formData.name || 'Unknown School',
            contactName: formData.contactName || '',
            contactEmail: formData.contactEmail || null,
            telephone: formData.telephone || '',
            phoneCountryCode: formData.phoneCountryCode || '+1',
            streetAddress: formData.streetAddress || '',
            city: formData.city || '',
            state: formData.state || null,
            postalCode: formData.postalCode || '',
            country: formData.country || '',
            schoolType: formData.schoolType || 'private',
            estimateJobs: formData.estimateJobs || '1-5',
            website: formData.website || null,
            description: formData.description || null,
            established: formData.established ? new Date(formData.established) : null,
            studentCount: formData.studentCount ? parseInt(formData.studentCount) : null,
            subscriptionId: session.subscription || session.id,
            verified: true,
          }
        });

        console.log('Created school profile:', school.id);
      }

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: 'USER_CREATED_MANUALLY',
          details: {
            sessionId: session.id,
            userType,
            email,
            planName: session.metadata.planName,
            billingType: session.metadata.billingType,
            createdBy: 'manual_script'
          },
        }
      });

      return user;
    });

    console.log('Successfully created user:', result.id);
    console.log('User can now login with email:', email);

    return result;

  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Main function to handle command line arguments
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node create-user-from-stripe.js <stripe-session-id>');
    console.log('Example: node create-user-from-stripe.js cs_test_a1b2c3d4e5f6...');
    process.exit(1);
  }

  const sessionId = args[0];

  try {
    await createUserFromStripeSession(sessionId);
    console.log('✅ User creation completed successfully');
  } catch (error) {
    console.error('❌ Failed to create user:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
