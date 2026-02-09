import React from "react";
import { Link } from "react-router-dom";
import { PageTemplate } from "@/components/PageTemplate";

type LinkItem = { label: string; href: string };

const sections: { title: string; links: LinkItem[] }[] = [
  {
    title: "Public pages",
    links: [
      { label: "Home", href: "/" },
      { label: "Jobs", href: "/jobs" },
      { label: "Pricing", href: "/pricing" },
      { label: "FAQs", href: "/faqs" },
      { label: "Contact", href: "/contact" },
      { label: "About", href: "/about" },
    ],
  },
  {
    title: "Teacher resources",
    links: [
      { label: "Resources hub", href: "/teachers/resources" },
      { label: "Resources: Links", href: "/teachers/resources/links" },
      { label: "Resources: Games", href: "/teachers/resources/games" },
      { label: "Resources: Exam prep", href: "/teachers/resources/exam-prep" },
      { label: "Resources: Kids phonics", href: "/teachers/resources/kids-phonics" },
      { label: "Resources: AI tools", href: "/teachers/resources/ai-tools" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", href: "/login" },
      { label: "Sign up", href: "/signup" },
      { label: "Forgot password", href: "/forgot-password" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
];

export const SitemapPage: React.FC = () => {
  return (
    <PageTemplate
      title="Sitemap"
      subtitle="Quick links to key pages on NTCA."
      topPaddingClassName="pt-10"
      headerSectionClassName="pb-4"
      minHeightClassName="min-h-[70vh]"
    >
      <div className="container-custom pb-16">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {sections.map((section) => (
            <div key={section.title} className="card p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      to={l.href}
                      className="text-primary-700 dark:text-primary-300 hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-8 text-sm text-neutral-600 dark:text-neutral-400">
          Looking for the XML sitemap? Use{" "}
          <a href="/sitemap.xml" className="text-primary-700 dark:text-primary-300 hover:underline">
            /sitemap.xml
          </a>
          .
        </div>
      </div>
    </PageTemplate>
  );
};

export default SitemapPage;


