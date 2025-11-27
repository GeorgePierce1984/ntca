import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Tab {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface MobileTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  className?: string;
}

export function MobileTabs({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}: MobileTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftIndicator(scrollLeft > 0);
      setShowRightIndicator(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, []);

  useEffect(() => {
    // Auto-scroll to active tab on mount or tab change
    const activeTabElement = document.getElementById(`tab-${activeTab}`);
    if (activeTabElement && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const tabLeft = activeTabElement.offsetLeft;
      const tabWidth = activeTabElement.offsetWidth;
      const containerWidth = container.clientWidth;
      const scrollLeft = container.scrollLeft;

      // Check if tab is not fully visible
      if (tabLeft < scrollLeft || tabLeft + tabWidth > scrollLeft + containerWidth) {
        activeTabElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeTab]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Left scroll indicator */}
      <motion.button
        className="absolute left-0 top-0 bottom-0 z-20 px-2 bg-gradient-to-r from-white via-white dark:from-neutral-900 dark:via-neutral-900 to-transparent flex items-center md:hidden"
        onClick={() => scroll("left")}
        initial={{ opacity: 0 }}
        animate={{ opacity: showLeftIndicator ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: showLeftIndicator ? "auto" : "none" }}
      >
        <ChevronLeft className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
      </motion.button>

      {/* Right scroll indicator */}
      <motion.button
        className="absolute right-0 top-0 bottom-0 z-20 px-2 bg-gradient-to-l from-white via-white dark:from-neutral-900 dark:via-neutral-900 to-transparent flex items-center md:hidden"
        onClick={() => scroll("right")}
        initial={{ opacity: 0 }}
        animate={{ opacity: showRightIndicator ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: showRightIndicator ? "auto" : "none" }}
      >
        <ChevronRight className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
      </motion.button>

      {/* Tab container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-6 md:px-0 -mx-6 md:mx-0 py-2"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              onClick={() => onTabChange(tab.key)}
              className={`
                flex items-center gap-3 px-5 py-4 rounded-xl font-semibold text-sm
                whitespace-nowrap flex-shrink-0 transition-all duration-300 ease-out
                shadow-sm border border-transparent min-h-[3.5rem]
                ${
                  isActive
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 scale-105 border-primary-300"
                    : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:shadow-md border-neutral-200 dark:border-neutral-700"
                }
              `}
              style={{ scrollSnapAlign: "start" }}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`
                    ml-1 px-2.5 py-1 text-xs font-bold rounded-full
                    ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400"
                    }
                  `}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom hint for mobile */}
      <div className="md:hidden text-center mt-2">
        <motion.p
          className="text-xs text-neutral-500"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {showRightIndicator && (
            <span className="inline-flex items-center gap-1">
              <span>Swipe to see more</span>
              <svg
                className="w-3 h-3 animate-bounce-horizontal"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </span>
          )}
        </motion.p>
      </div>
    </div>
  );
}
