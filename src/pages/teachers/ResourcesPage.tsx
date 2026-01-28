import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Link as LinkIcon,
  Gamepad2,
  GraduationCap,
  BookOpen,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { PageTemplate } from "@/components/PageTemplate";
import { resourceCategories, hubSections, TEACHING_GAMES_COUNT } from "./resources/resourcesData";

type HubCard = {
  key: string;
  title: string;
  description: string;
  countLabel: string;
  icon: any;
  to: string;
};

function countLinksForTitles(titles: string[]) {
  const allowed = new Set(titles);
  return resourceCategories
    .filter((c) => allowed.has(c.title))
    .reduce((sum, c) => sum + (c.resources?.length || 0), 0);
}

export const ResourcesPage: React.FC = () => {
  const navigate = useNavigate();

  const counts = useMemo(() => {
    return {
      resourceLinks: countLinksForTitles(hubSections.resourceLinks),
      examPrep: countLinksForTitles(hubSections.examPrep),
      kidsPhonics: countLinksForTitles(hubSections.kidsPhonics),
      aiTools: countLinksForTitles(hubSections.aiTools),
      games: TEACHING_GAMES_COUNT,
    };
  }, []);

  const cards: HubCard[] = useMemo(
    () => [
      {
        key: "resource-links",
        title: "Resource Links",
        description: "Curated websites for lessons, worksheets, and tools.",
        countLabel: `${counts.resourceLinks} links`,
        icon: LinkIcon,
        to: "/resources/links",
      },
      {
        key: "games",
        title: "Teaching Aid Games",
        description: "Classroom games you can open + save as PDF.",
        countLabel: `${counts.games} games`,
        icon: Gamepad2,
        to: "/resources/games",
      },
      {
        key: "exam-prep",
        title: "Exam Prep",
        description: "IELTS / SAT resources and lesson support.",
        countLabel: `${counts.examPrep} links`,
        icon: GraduationCap,
        to: "/resources/exam-prep",
      },
      {
        key: "kids-phonics",
        title: "Kids / Phonics",
        description: "Young learner activities and phonics practice.",
        countLabel: `${counts.kidsPhonics} links`,
        icon: BookOpen,
        to: "/resources/kids-phonics",
      },
      {
        key: "ai-tools",
        title: "AI Tools",
        description: "AI helpers for planning lessons and activities.",
        countLabel: `${counts.aiTools} links`,
        icon: Sparkles,
        to: "/resources/ai-tools",
      },
    ],
    [counts]
  );

  return (
    <PageTemplate
      title="Resources"
      subtitle="Pick a section to explore"
      showComingSoon={false}
      topPaddingClassName="pt-[55px]"
      headerSectionClassName="pt-10 pb-6 md:pt-12 md:pb-8 bg-gradient-to-br from-primary-50 to-white dark:from-neutral-900 dark:to-neutral-950"
      minHeightClassName="min-h-0"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.key}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(card.to)}
                className="text-left bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/40 dark:hover:bg-primary-900/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-neutral-900 dark:text-white">
                        {card.title}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {card.description}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-neutral-300 dark:text-neutral-600" />
                </div>

                <div className="mt-4 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200">
                  {card.countLabel}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </PageTemplate>
  );
};


