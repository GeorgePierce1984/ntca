import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = "top",
  className,
}) => {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children || (
            <button
              type="button"
              className={cn(
                "inline-flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                className
              )}
              aria-label="More information"
            >
              <Info className="w-4 h-4" />
            </button>
          )}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={5}
            className={cn(
              "z-50 rounded-lg bg-primary-600 dark:bg-primary-500 px-3 py-2 text-sm text-white shadow-lg",
              "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              "max-w-xs"
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-primary-600 dark:fill-primary-500" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

interface InfoIconProps {
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export const InfoIcon: React.FC<InfoIconProps> = ({
  content,
  side = "top",
  className,
}) => {
  return (
    <Tooltip content={content} side={side} className={className}>
      <Info className="w-4 h-4 text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors cursor-help" />
    </Tooltip>
  );
};

