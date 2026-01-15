import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Helper function to retry database operations with exponential backoff
async function retryOperation(operation, maxRetries = 3, initialDelay = 500) {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // For cold starts, add a small delay before first attempt
      if (attempt === 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      return await operation();
    } catch (error) {
      const isConnectionError = 
        error.message?.includes("Engine was empty") ||
        error.message?.includes("Engine is not yet connected") ||
        error.message?.includes("connection") ||
        error.message?.includes("Response from the Engine was empty") ||
        error.code === "P1001" || // Can't reach database server
        error.code === "P1017" || // Server closed the connection
        error.code === "P1008" || // Timed out
        error.code === "GenericFailure" || // Generic engine error
        error.name === "PrismaClientUnknownRequestError";

      if (isConnectionError && attempt < maxRetries) {
        console.log(`Connection error on attempt ${attempt}, retrying in ${delay}ms...`);
        // Disconnect to reset connection state
        await prisma.$disconnect().catch(() => {});
        // Wait before retrying - longer for "Engine is not yet connected"
        if (error.message?.includes("Engine is not yet connected")) {
          await new Promise(resolve => setTimeout(resolve, 1500 + (attempt * 500))); // Longer delay for engine startup
        } else {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay = Math.min(delay * 1.5, 2000); // Cap at 2 seconds to avoid excessive timeouts
        }
        continue;
      }
      throw error;
    }
  }
}

// Middleware to verify JWT token
function verifyToken(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw new Error('No token provided');
  
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  try {
    const decoded = verifyToken(req);

    if (req.method === 'GET') {
      // Get applications based on user type
      let applications;
      
      if (decoded.userType === 'SCHOOL') {
        // Schools see applications for their jobs
        const school = await retryOperation(async () => {
          return await prisma.school.findUnique({
            where: { userId: decoded.userId }
          });
        });
        
        if (!school) {
          return res.status(404).json({ error: 'School profile not found' });
        }

        applications = await retryOperation(async () => {
          return await prisma.application.findMany({
            where: {
              job: {
                schoolId: school.id
              }
            },
            include: {
              job: true,
              teacher: true,
              notes: {
                orderBy: { createdAt: 'desc' }
              }
            },
            orderBy: { createdAt: 'desc' }
          });
        });
      } else {
        // Teachers see their own applications
        const teacher = await retryOperation(async () => {
          return await prisma.teacher.findUnique({
            where: { userId: decoded.userId }
          });
        });
        
        if (!teacher) {
          return res.status(404).json({ error: 'Teacher profile not found' });
        }

        applications = await retryOperation(async () => {
          return await prisma.application.findMany({
            where: { teacherId: teacher.id },
            include: {
              job: {
                include: {
                  school: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          });
        });
      }

      return res.status(200).json({ applications });

    } else if (req.method === 'POST') {
      // Teachers can apply for jobs
      if (decoded.userType !== 'TEACHER') {
        return res.status(403).json({ error: 'Only teachers can apply for jobs' });
      }

      const teacher = await retryOperation(async () => {
        return await prisma.teacher.findUnique({
          where: { userId: decoded.userId }
        });
      });
      
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher profile not found' });
      }

      const { jobId, coverLetter, resumeUrl, portfolioUrl } = req.body;

      // Validate required fields
      if (!jobId) {
        return res.status(400).json({ error: 'Job ID is required' });
      }

      // Check if job exists and is active
      const job = await retryOperation(async () => {
        return await prisma.job.findUnique({
          where: { id: jobId },
          include: { school: true }
        });
      });

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      if (job.status !== 'ACTIVE') {
        return res.status(400).json({ error: 'Job is not active' });
      }

      // Check if already applied
      const existingApplication = await retryOperation(async () => {
        return await prisma.application.findUnique({
          where: {
            jobId_teacherId: {
              jobId,
              teacherId: teacher.id
            }
          }
        });
      });

      if (existingApplication) {
        return res.status(400).json({ error: 'You have already applied for this job' });
      }

      const application = await retryOperation(async () => {
        return await prisma.application.create({
          data: {
            jobId,
            teacherId: teacher.id,
            coverLetter,
            resumeUrl,
            portfolioUrl,
          },
          include: {
            job: {
              include: {
                school: true
              }
            },
            teacher: true
          }
        });
      });

      // Log activity with retry logic
      await retryOperation(async () => {
        return await prisma.activityLog.create({
          data: {
            userId: decoded.userId,
            action: 'APPLICATION_SUBMITTED',
            details: { 
              applicationId: application.id, 
              jobId, 
              jobTitle: job.title,
              schoolName: job.school.name 
            },
            ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
          }
        });
      });

      return res.status(201).json({ 
        message: 'Application submitted successfully',
        application 
      });

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

  } catch (error) {
    console.error('Applications API error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    // Handle specific error types
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Handle Prisma connection errors
    const isPrismaConnectionError = 
      error.message?.includes("Engine was empty") ||
      error.message?.includes("connection") ||
      error.code === "P1001" ||
      error.code === "P1017" ||
      error.code === "P1008" ||
      error.name === "PrismaClientUnknownRequestError";

    if (isPrismaConnectionError) {
      console.error("Prisma connection error - attempting to reconnect...");
      try {
        await prisma.$disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await prisma.$connect();
      } catch (reconnectError) {
        console.error("Failed to reconnect:", reconnectError);
      }
      
      return res.status(503).json({
        error: "Database connection error",
        message: "Unable to connect to database. Please try again in a moment.",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        retry: true,
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      errorType: error.name || 'UnknownError',
    });
  } finally {
    await prisma.$disconnect();
  }
} 