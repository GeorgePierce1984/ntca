/**
 * Vercel Edge Middleware
 * Detects social media crawlers and serves static HTML for /resources
 */

export const config = {
  matcher: ['/resources'],
};

export default async function middleware(request) {
  const url = new URL(request.url);
  
  // Only process /resources path
  if (url.pathname !== '/resources') {
    return;
  }

  const userAgent = request.headers.get('user-agent') || '';

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

  // If it's a crawler, serve the static HTML
  if (isCrawler) {
    // Read the static HTML file from the file system
    // In Vercel Edge, we need to fetch it from the origin
    const origin = request.headers.get('x-forwarded-host') || url.host;
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const staticHtmlUrl = `${protocol}://${origin}/resources.html`;
    
    try {
      const response = await fetch(staticHtmlUrl);
      if (response.ok) {
        const html = await response.text();
        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        });
      }
    } catch (error) {
      console.error('Error fetching static HTML:', error);
    }
  }

  // For regular users, return undefined to let the request pass through
  return undefined;
}

