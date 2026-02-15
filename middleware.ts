/**
 * Vercel Edge Middleware
 * Detects social media crawlers and serves static HTML for /resources
 */

export const config = {
  matcher: '/resources',
};

export default async function middleware(request: Request) {
  const url = new URL(request.url);
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

  // If it's a crawler, fetch and serve the static HTML file
  if (isCrawler) {
    const origin = request.headers.get('x-forwarded-host') || url.host;
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const staticHtmlUrl = `${protocol}://${origin}/resources.html`;
    
    try {
      const response = await fetch(staticHtmlUrl);
      if (response.ok) {
        let html = await response.text();
        // Remove the meta refresh tag for crawlers
        html = html.replace(/<meta http-equiv="refresh"[^>]*>/i, '');
        
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

  // For regular users, continue to the React app (don't return anything to pass through)
  return new Response(null, { status: 200 });
}

