import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Shield, CreditCard, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { PageTemplate } from "@/components/PageTemplate";

type FAQItem = {
  q: string;
  a: React.ReactNode;
  icon?: React.ReactNode;
};

export const FAQsPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const faqs: FAQItem[] = [
    {
      q: "What is NTCA and who is it for?",
      a: (
        <div className="space-y-2">
          <p>
            NTCA is a platform connecting <strong>teachers</strong> with <strong>schools</strong> hiring for teaching roles.
          </p>
          <p>
            Teachers can browse jobs, apply, and manage applications. Schools can post jobs, review applicants, and communicate with teachers.
          </p>
        </div>
      ),
      icon: <HelpCircle className="w-5 h-5" />,
    },
    {
      q: "How does pricing work?",
      a: (
        <div className="space-y-2">
          <p>
            Pricing depends on your account type (teacher vs school) and the plan you choose. For the latest plan details and features,
            please see the Pricing page.
          </p>
          <p>
            <Link to="/pricing" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
              View Pricing
            </Link>
          </p>
        </div>
      ),
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      q: "Do you guarantee a job or a hire?",
      a: (
        <div className="space-y-2">
          <p>
            No. NTCA is a marketplace and workflow platform — we help with discovery, applications, and communication, but we cannot guarantee hiring outcomes.
          </p>
          <p>
            Hiring decisions are made by schools, and application outcomes depend on role requirements and candidate fit.
          </p>
        </div>
      ),
      icon: <Shield className="w-5 h-5" />,
    },
    {
      q: "How do applications work?",
      a: (
        <div className="space-y-2">
          <p>
            Teachers can apply directly from a job posting. Your application is submitted to the school and will appear in your dashboard under “My Applications”.
          </p>
          <p>
            Schools can review, update application stages, add notes, and invite you to interview.
          </p>
        </div>
      ),
    },
    {
      q: "Can I apply more than once for the same job?",
      a: (
        <p>
          No — once you’ve applied to a job, the platform prevents duplicate applications for the same role. You can track status updates in your dashboard.
        </p>
      ),
    },
    {
      q: "What documents do I need (CV/Resume, cover letter, etc.)?",
      a: (
        <div className="space-y-2">
          <p>
            Typically, schools expect a CV/Resume and relevant qualifications. Some roles may also request additional documentation.
          </p>
          <p>
            Your cover letter can be tailored per application. We recommend keeping it concise and role-specific.
          </p>
        </div>
      ),
    },
    {
      q: "Do you provide visa sponsorship or immigration support?",
      a: (
        <div className="space-y-2">
          <p>
            NTCA does <strong>not</strong> provide visa sponsorship or legal immigration advice. Visa eligibility and work authorization depend on the country,
            the role, and your personal circumstances.
          </p>
          <p>
            Always confirm requirements with the <strong>relevant government / immigration authority</strong> for the destination country and, where applicable,
            your home country.
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            We may display information provided by schools (e.g., “visa support available”), but this is not a guarantee of eligibility or approval.
          </p>
        </div>
      ),
      icon: <Globe className="w-5 h-5" />,
    },
    {
      q: "How do interviews work on NTCA?",
      a: (
        <div className="space-y-2">
          <p>
            Schools can invite teachers to interview, propose time slots, and specify the interview type (video/phone/onsite).
          </p>
          <p>
            Teachers can accept one of the proposed slots or suggest an alternative time. Once confirmed, interview details appear on your application.
          </p>
        </div>
      ),
    },
    {
      q: "How do messages work?",
      a: (
        <div className="space-y-2">
          <p>
            Teachers and schools can message each other inside the platform. If a school contacts you about a job, it will appear in your message center.
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            For safety, keep communication professional and do not share sensitive personal information unless you trust the recipient.
          </p>
        </div>
      ),
    },
    {
      q: "What if I need help or want to report a problem?",
      a: (
        <div className="space-y-2">
          <p>
            If you need support, please reach out via the Contact page and include screenshots if possible.
          </p>
          <p>
            <Link to="/contact" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
              Contact Support
            </Link>
          </p>
        </div>
      ),
    },
  ];

  return (
    <PageTemplate
      title="FAQs"
      subtitle="Quick answers to common questions"
      showComingSoon={false}
      topPaddingClassName="pt-20"
    >
      <div className="section">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="card p-6 md:p-8">
              <div className="space-y-3">
                {faqs.map((item, idx) => {
                  const isOpen = idx === openIndex;
                  return (
                    <div
                      key={item.q}
                      className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors"
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 flex items-center justify-center">
                            {item.icon || <HelpCircle className="w-5 h-5" />}
                          </div>
                          <div className="font-semibold text-neutral-900 dark:text-white">
                            {item.q}
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-neutral-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                          >
                            <div className="px-5 pb-5 pt-0 text-neutral-700 dark:text-neutral-200">
                              <div className="text-sm leading-relaxed">{item.a}</div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-4 text-center">
              Note: Information on this page is general guidance and is not legal advice.
            </p>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};


