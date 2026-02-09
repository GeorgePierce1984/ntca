import { prisma } from "./_utils/prisma.js";

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toISODate(d) {
  try {
    return new Date(d).toISOString();
  } catch {
    return undefined;
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).send("Method Not Allowed");
  }

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://www.nt-ca.com").replace(/\/$/, "");

  try {
    // Cache for a short time at the edge
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    res.setHeader("Content-Type", "application/xml; charset=utf-8");

    const staticUrls = [
      "/",
      "/jobs",
      "/pricing",
      "/faqs",
      "/contact",
      "/about",
      "/login",
      "/signup",
      "/forgot-password",
      "/terms",
      "/privacy",
      "/cookies",
      "/teachers/resources",
      "/teachers/resources/links",
      "/teachers/resources/games",
      "/teachers/resources/exam-prep",
      "/teachers/resources/kids-phonics",
      "/teachers/resources/ai-tools",
      "/sitemap",
    ];

    // Include active jobs as individual URLs
    const jobs = await prisma.job.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, updatedAt: true, createdAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000, // safety cap
    });

    const urlEntries = [];

    for (const path of staticUrls) {
      urlEntries.push({
        loc: `${baseUrl}${path}`,
        lastmod: undefined,
        changefreq: path === "/" ? "daily" : "weekly",
        priority: path === "/" ? "1.0" : "0.7",
      });
    }

    for (const j of jobs) {
      urlEntries.push({
        loc: `${baseUrl}/jobs/${j.id}`,
        lastmod: toISODate(j.updatedAt || j.createdAt),
        changefreq: "daily",
        priority: "0.8",
      });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urlEntries
        .map((u) => {
          const lastmod = u.lastmod ? `<lastmod>${xmlEscape(u.lastmod)}</lastmod>` : "";
          return (
            `  <url>\n` +
            `    <loc>${xmlEscape(u.loc)}</loc>\n` +
            `    ${lastmod}\n` +
            `    <changefreq>${xmlEscape(u.changefreq)}</changefreq>\n` +
            `    <priority>${xmlEscape(u.priority)}</priority>\n` +
            `  </url>`
          );
        })
        .join("\n") +
      `\n</urlset>\n`;

    return res.status(200).send(xml);
  } catch (e) {
    console.error("sitemap.xml error:", e);
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    return res
      .status(500)
      .send(`<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>`);
  }
}


