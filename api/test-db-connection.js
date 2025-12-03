// Test endpoint to verify database connection
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get database connection info (first 50 chars only for security)
    const dbUrl = process.env.DATABASE_URL || 'NOT SET';
    const dbUrlPreview = dbUrl.length > 50 ? dbUrl.substring(0, 50) + '...' : dbUrl;
    
    // Test database connection
    const dbInfo = await prisma.$queryRaw`
      SELECT current_database() as database_name,
             version() as version
    `;
    
    // Get recent schools
    const recentSchools = await prisma.school.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            createdAt: true
          }
        }
      }
    });
    
    // Get total counts
    const totalSchools = await prisma.school.count();
    const totalUsers = await prisma.user.count();
    
    // Check for schools created in last 24 hours
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    const recentCount = await prisma.school.count({
      where: {
        createdAt: {
          gte: yesterday
        }
      }
    });
    
    return res.status(200).json({
      status: 'connected',
      databaseUrl: dbUrlPreview,
      databaseInfo: dbInfo[0],
      totals: {
        schools: totalSchools,
        users: totalUsers,
        recent24h: recentCount
      },
      recentSchools: recentSchools.map(s => ({
        id: s.id,
        name: s.name,
        email: s.user?.email,
        createdAt: s.createdAt,
        userCreatedAt: s.user?.createdAt
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection test error:', error);
    return res.status(500).json({
      status: 'error',
      error: error.message,
      databaseUrl: process.env.DATABASE_URL ? 'SET (but connection failed)' : 'NOT SET',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}

