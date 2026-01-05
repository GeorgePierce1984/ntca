import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { school: true }
    });

    if (!user || user.userType !== 'SCHOOL') {
      return res.status(403).json({ error: 'School access required' });
    }

    if (req.method === 'GET') {
      // Get specific job with applications
      const job = await prisma.job.findFirst({
        where: {
          id,
          schoolId: user.school.id
        },
        include: {
          applications: {
            include: {
              teacher: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                  city: true,
                  country: true,
                  qualification: true,
                  experience: true,
                  bio: true,
                  verified: true,
                  rating: true,
                  languages: true,
                  skills: true,
                  resumeUrl: true,
                  photoUrl: true
                }
              },
              notes: {
                orderBy: { createdAt: 'desc' }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      return res.status(200).json({ job });
    }

    if (req.method === 'PUT') {
      // Update job
      const {
        title,
        description,
        location,
        salary,
        type,
        deadline,
        qualification,
        experience,
        language,
        visaRequired,
        teachingLicenseRequired,
        kazakhLanguageRequired,
        localCertificationRequired,
        benefits,
        requirements,
        status
      } = req.body;

      const job = await prisma.job.findFirst({
        where: {
          id,
          schoolId: user.school.id
        }
      });

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      const updatedJob = await prisma.job.update({
        where: { id },
        data: {
          title,
          description,
          location,
          salary,
          type,
          deadline: deadline ? new Date(deadline) : undefined,
          qualification,
          experience,
          language,
          visaRequired,
          teachingLicenseRequired,
          kazakhLanguageRequired,
          localCertificationRequired,
          benefits,
          requirements,
          status
        }
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'JOB_UPDATED',
          details: `Updated job: ${updatedJob.title}`
        }
      });

      return res.status(200).json({ 
        job: updatedJob, 
        message: 'Job updated successfully' 
      });
    }

    if (req.method === 'DELETE') {
      // Delete job
      const job = await prisma.job.findFirst({
        where: {
          id,
          schoolId: user.school.id
        }
      });

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      await prisma.job.delete({
        where: { id }
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'JOB_DELETED',
          details: `Deleted job: ${job.title}`
        }
      });

      return res.status(200).json({ message: 'Job deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: 'Method Not Allowed' });

  } catch (error) {
    console.error('Job management error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
} 