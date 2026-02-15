/**
 * API route to serve static HTML for /resources with correct OG tags
 * This is used by social media crawlers that don't execute JavaScript
 */

import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).send('Method Not Allowed');
  }

  const userAgent = req.headers['user-agent'] || '';
  
  // List of social media crawler user agents
  const crawlerPatterns = [
    'facebookexternalhit',
    'Facebot',
    'Twitterbot',
    'LinkedInBot',
    'WhatsApp',
    'TelegramBot',
    'Slackbot',
    'SkypeUriPreview',
    'Applebot',
    'Googlebot',
    'bingbot',
    'Slurp',
    'DuckDuckBot',
    'Baiduspider',
    'YandexBot',
    'Sogou',
    'Exabot',
    'ia_archiver',
  ];

  // Check if the request is from a social media crawler
  const isCrawler = crawlerPatterns.some(pattern =>
    userAgent.toLowerCase().includes(pattern.toLowerCase())
  );

  // Only serve static HTML for crawlers
  if (isCrawler) {
    try {
      // Read the static HTML file
      const htmlPath = join(process.cwd(), 'public', 'resources.html');
      const html = readFileSync(htmlPath, 'utf-8');

      // Set headers
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      
      return res.status(200).send(html);
    } catch (error) {
      console.error('Error serving resources.html:', error);
      // Fall through to return 404 for crawlers if file not found
    }
  }

  // For regular users, redirect to the React app
  res.writeHead(302, { Location: '/resources' });
  res.end();
}

