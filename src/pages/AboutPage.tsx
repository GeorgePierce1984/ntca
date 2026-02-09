import React from "react";
import { PageTemplate } from "@/components/PageTemplate";
import { CheckCircle2, Globe2, HeartHandshake, Sparkles } from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <PageTemplate
      title="About NexTeach Central Asia"
      subtitle="A teacher-first platform built specifically for Central Asia — connecting great teachers with great schools."
      showComingSoon={false}
    >
      <div className="section">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Mission */}
            <div className="card p-8">
              <h2 className="heading-2 mb-3">Mission</h2>
              <p className="text-neutral-700 dark:text-neutral-300 text-lg leading-relaxed">
                Connecting great teachers with great schools across Central Asia and beyond.
              </p>
              <p className="text-neutral-600 dark:text-neutral-400 mt-4 leading-relaxed">
                Central Asia is our deliberate focus: understanding local market needs means better matching,
                more relevant roles, and a recruitment experience built for the region — not a generic global job board.
              </p>
            </div>

            {/* Why we built it */}
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <h2 className="heading-2">Why we built it</h2>
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                International teaching is fragmented. Schools struggle to hire confidently. Teachers struggle to find
                trusted roles without noise, посредники, and uncertainty.
              </p>
              <p className="text-neutral-600 dark:text-neutral-400 mt-4 leading-relaxed">
                NTCA fixes that by bringing schools and teachers into one trusted, Central Asia–specific network — with
                direct hiring, clearer expectations, and matching that reflects what schools in this region actually need.
              </p>
            </div>

            {/* What makes NTCA different */}
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-4">
                <HeartHandshake className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <h2 className="heading-2">What makes NTCA different</h2>
              </div>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-primary-600 dark:text-primary-400" />
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">Teacher-first platform</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Designed around teacher trust, clarity, and real opportunities.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-primary-600 dark:text-primary-400" />
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">No recruitment agency fees</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Schools can hire without the heavy overhead.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-primary-600 dark:text-primary-400" />
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">Direct school hiring</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Talk to candidates directly and move faster.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-primary-600 dark:text-primary-400" />
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">International focus</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Built for international teachers and internationally minded schools.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-primary-600 dark:text-primary-400" />
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">Early founding community</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      We’re building with schools and teachers — not at them.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-primary-600 dark:text-primary-400" />
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">Central Asia–specific by design</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Region-aware recruitment that stays targeted to your market needs.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Where we operate */}
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-3">
                <Globe2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <h2 className="heading-2">Where we operate</h2>
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                UK-based platform working with schools across Central Asia, the Middle East and international markets.
              </p>
            </div>

            {/* Closing line */}
            <div className="card p-8 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60">
              <p className="text-xl font-semibold text-neutral-900 dark:text-white leading-relaxed">
                We are building the world’s most trusted international teacher network.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};
