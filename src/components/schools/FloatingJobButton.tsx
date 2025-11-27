import React from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface FloatingJobButtonProps {
  onClick: () => void;
  show?: boolean;
}

export function FloatingJobButton({ onClick, show = true }: FloatingJobButtonProps) {
  if (!show) return null;

  return (
    <motion.div
      className="fixed bottom-8 right-8 z-40"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.button
        onClick={onClick}
        className="group relative w-16 h-16 rounded-full bg-primary-500 hover:bg-primary-600 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Plus className="w-8 h-8 text-white" />

        {/* Tooltip */}
        <motion.div
          className="absolute right-full mr-3 px-3 py-2 bg-neutral-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          initial={{ x: 10, opacity: 0 }}
          whileHover={{ x: 0, opacity: 1 }}
        >
          Post New Job
          <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-neutral-900 rotate-45"></div>
        </motion.div>
      </motion.button>

      {/* Pulse animation for attention */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary-500"
        animate={{
          scale: [1, 1.3, 1.3],
          opacity: [0.5, 0, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      />
    </motion.div>
  );
}
