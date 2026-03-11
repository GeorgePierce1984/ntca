import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        password: true,
        userType: true,
        stripeCustomerId: true,
        emailVerified: true,
        resetToken: true,
        resetTokenExpiry: true,
        deletionScheduledAt: true,
        createdAt: true,
        updatedAt: true,
        school: true,
        teacher: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            phone: true,
            phoneCountryCode: true,
            streetAddress: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
            qualification: true,
            experienceYears: true,
            experience: true,
            bio: true,
            resumeUrl: true,
            portfolioUrl: true,
            photoUrl: true,
            verified: true,
            rating: true,
            teachingLicense: true,
            certifications: true,
            subjects: true,
            ageGroups: true,
            teachingStyle: true,
            nativeLanguage: true,
            languageSkills: true,
            currentLocation: true,
            willingToRelocate: true,
            preferredLocations: true,
            visaStatus: true,
            workAuthorization: true,
            availability: true,
            startDate: true,
            education: true,
            specializations: true,
            previousSchools: true,
            references: true,
            achievements: true,
            publications: true,
            dateOfBirth: true,
            nationality: true,
            gender: true,
            maritalStatus: true,
            profileComplete: true,
            profileViews: true,
            lastActive: true,
            searchable: true,
            salaryExpectation: true,
            jobTypePreference: true,
            workEnvironmentPreference: true,
            technicalSkills: true,
            softSkills: true,
            languageTestScores: true,
            createdAt: true,
            updatedAt: true,
          }
        },
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({
      valid: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Token validation error:', error);
    
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