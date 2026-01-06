// Test script to verify database connection
// This can be run as a Vercel serverless function to check which database is being used

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    // Get the DATABASE_URL (first few chars only for security)
    const dbUrl = process.env.DATABASE_URL || 'NOT SET';
    const dbUrlPreview = dbUrl.substring(0, 50) + '...';
    
    // Check which database we're connected to
    const result = await prisma.$queryRaw`
      SELECT current_database() as database_name, 
             inet_server_addr() as server_address,
             version() as version
    `;
    
    // Get recent schools count
    const recentSchools = await prisma.school.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });
    
    // Get total schools
    const totalSchools = await prisma.school.count();
    
    return res.status(200).json({
      status: 'connected',
      databaseUrl: dbUrlPreview,
      databaseInfo: result[0],
      recentSchools24h: recentSchools,
      totalSchools: totalSchools,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: error.message,
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET'
    });
  } finally {
    await prisma.$disconnect();
  }
}

