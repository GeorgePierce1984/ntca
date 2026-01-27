import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  Video,
  Phone,
  Building,
  CheckCircle,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface TimeSlot {
  date: string;
  time: string;
  timezone: string;
}

interface InterviewRequest {
  id: string;
  duration: number;
  locationType: "video" | "phone" | "onsite";
  location: string;
  message?: string;
  timeSlots: TimeSlot[];
  status: "pending" | "accepted" | "alternative_suggested";
  selectedSlot?: number;
  alternativeSlot?: TimeSlot;
}

interface InterviewInviteResponseProps {
  isOpen: boolean;
  onClose: () => void;
  interviewRequest: InterviewRequest | null;
  applicationId: string;
  jobTitle: string;
  schoolName: string;
  teacherTimezone?: string;
  onAccept: (slotIndex: number) => Promise<void>;
  onSuggestAlternative: (alternativeSlot: TimeSlot) => Promise<void>;
}

export const InterviewInviteResponse: React.FC<InterviewInviteResponseProps> = ({
  isOpen,
  onClose,
  interviewRequest,
  applicationId,
  jobTitle,
  schoolName,
  teacherTimezone,
  onAccept,
  onSuggestAlternative,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showAlternativeForm, setShowAlternativeForm] = useState(false);
  const [alternativeSlot, setAlternativeSlot] = useState<TimeSlot>({
    date: "",
    time: "",
    timezone: teacherTimezone || "UTC",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!interviewRequest) return null;

  const safeInterviewRequest = useMemo(() => {
    try {
      const ir: any = { ...interviewRequest };

      // Normalize timeSlots (can arrive as JSON string depending on API/ORM)
      if (typeof ir.timeSlots === "string") {
        try {
          ir.timeSlots = JSON.parse(ir.timeSlots);
        } catch {
          ir.timeSlots = [];
        }
      }
      if (!Array.isArray(ir.timeSlots)) ir.timeSlots = [];
      ir.timeSlots = ir.timeSlots.filter((s: any) => s && typeof s === "object" && s.date && s.time);

      // Normalize alternativeSlot (can arrive as JSON string)
      if (typeof ir.alternativeSlot === "string") {
        try {
          ir.alternativeSlot = JSON.parse(ir.alternativeSlot);
        } catch {
          delete ir.alternativeSlot;
        }
      }
      if (ir.alternativeSlot && (!ir.alternativeSlot.date || !ir.alternativeSlot.time)) {
        delete ir.alternativeSlot;
      }

      // Validate selectedSlot (null/out-of-range should be treated as unset)
      if (ir.selectedSlot === null || ir.selectedSlot === undefined) {
        delete ir.selectedSlot;
      } else if (typeof ir.selectedSlot !== "number" || !Number.isFinite(ir.selectedSlot)) {
        delete ir.selectedSlot;
      } else if (ir.selectedSlot < 0 || ir.selectedSlot >= ir.timeSlots.length) {
        delete ir.selectedSlot;
      }

      return ir as InterviewRequest;
    } catch (e) {
      console.error("Error normalizing interviewRequest:", e);
      return interviewRequest;
    }
  }, [interviewRequest]);

  const formatTimeInTimezone = (date: string, time: string, timezone: string) => {
    if (!date || !time) return "";
    try {
      const dateTime = new Date(`${date}T${time}`);
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return formatter.format(dateTime);
    } catch {
      return `${date} ${time}`;
    }
  };

  const handleAcceptSlot = async (slotIndex: number) => {
    setIsSubmitting(true);
    try {
      await onAccept(slotIndex);
      toast.success("Interview slot accepted!");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to accept slot");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestAlternative = async () => {
    if (!alternativeSlot.date || !alternativeSlot.time) {
      toast.error("Please provide date and time for alternative slot");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSuggestAlternative(alternativeSlot);
      toast.success("Alternative time slot suggested!");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to suggest alternative");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLocationIcon = () => {
    switch (safeInterviewRequest.locationType) {
      case "video":
        return <Video className="w-5 h-5" />;
      case "phone":
        return <Phone className="w-5 h-5" />;
      case "onsite":
        return <Building className="w-5 h-5" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && interviewRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-neutral-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Interview Invitation</h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {schoolName} - {jobTitle}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Interview Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {getLocationIcon()}
                    <div>
                      <p className="font-medium">
                        {safeInterviewRequest.locationType === "video"
                          ? "Video Interview"
                          : safeInterviewRequest.locationType === "phone"
                          ? "Phone Interview"
                          : "Onsite Interview"}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Duration: {safeInterviewRequest.duration} minutes
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Location/Contact:</p>
                    <p className="text-sm">{safeInterviewRequest.location}</p>
                  </div>

                  {safeInterviewRequest.message && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 mt-0.5" />
                        <p className="text-sm">{safeInterviewRequest.message}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Time Slots */}
                {safeInterviewRequest.status === "pending" && (
                  <div>
                    <h3 className="font-medium mb-4">Select a Time Slot</h3>
                    <div className="space-y-3">
                      {safeInterviewRequest.timeSlots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedSlot(index)}
                          disabled={isSubmitting}
                          className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                            selectedSlot === index
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                          } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Option {index + 1}</p>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                {formatTimeInTimezone(slot.date, slot.time, slot.timezone)}
                              </p>
                              {teacherTimezone && teacherTimezone !== slot.timezone && (
                                <p className="text-xs text-neutral-500 mt-1">
                                  Your time: {formatTimeInTimezone(slot.date, slot.time, teacherTimezone)}
                                </p>
                              )}
                            </div>
                            {selectedSlot === index && (
                              <CheckCircle className="w-5 h-5 text-blue-500" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accepted Status */}
                {safeInterviewRequest.status === "accepted" && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-300">
                          Interview Accepted
                        </p>
                        {(() => {
                          // Preferred: accepted via original slot selection
                          if (typeof safeInterviewRequest.selectedSlot === "number") {
                            const slot = safeInterviewRequest.timeSlots[safeInterviewRequest.selectedSlot];
                            if (slot?.date && slot?.time) {
                              return (
                                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                  {formatTimeInTimezone(slot.date, slot.time, slot.timezone)}
                                </p>
                              );
                            }
                          }
                          // Accepted via alternative slot (school accepted teacher's proposal)
                          if (safeInterviewRequest.alternativeSlot?.date && safeInterviewRequest.alternativeSlot?.time) {
                            const alt = safeInterviewRequest.alternativeSlot;
                            return (
                              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                {formatTimeInTimezone(alt.date, alt.time, alt.timezone)}
                              </p>
                            );
                          }
                          return (
                            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                              Time confirmed (details unavailable)
                            </p>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Alternative Suggested Status */}
                {safeInterviewRequest.status === "alternative_suggested" && safeInterviewRequest.alternativeSlot && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-900 dark:text-amber-300">
                          Alternative Time Suggested
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                          {formatTimeInTimezone(
                            safeInterviewRequest.alternativeSlot.date,
                            safeInterviewRequest.alternativeSlot.time,
                            safeInterviewRequest.alternativeSlot.timezone
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggest Alternative Form */}
                {showAlternativeForm && interviewRequest.status === "pending" && (
                  <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <h3 className="font-medium mb-3">Suggest Alternative Time</h3>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={alternativeSlot.date}
                          onChange={(e) =>
                            setAlternativeSlot({ ...alternativeSlot, date: e.target.value })
                          }
                          min={new Date().toISOString().split("T")[0]}
                          className="input text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                          Time
                        </label>
                        <input
                          type="time"
                          value={alternativeSlot.time}
                          onChange={(e) =>
                            setAlternativeSlot({ ...alternativeSlot, time: e.target.value })
                          }
                          className="input text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                          Timezone
                        </label>
                        <select
                          value={alternativeSlot.timezone}
                          onChange={(e) =>
                            setAlternativeSlot({ ...alternativeSlot, timezone: e.target.value })
                          }
                          className="input text-sm"
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="Europe/London">London (GMT)</option>
                          <option value="Europe/Paris">Paris (CET)</option>
                          <option value="Asia/Dubai">Dubai (GST)</option>
                          <option value="Asia/Almaty">Almaty (ALMT)</option>
                          <option value="Asia/Tashkent">Tashkent (UZT)</option>
                          <option value="Asia/Shanghai">Shanghai (CST)</option>
                          <option value="Asia/Tokyo">Tokyo (JST)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            {safeInterviewRequest.status === "pending" && (
              <div className="p-6 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowAlternativeForm(!showAlternativeForm);
                      if (showAlternativeForm) {
                        setAlternativeSlot({ date: "", time: "", timezone: teacherTimezone || "UTC" });
                      }
                    }}
                  >
                    {showAlternativeForm ? "Cancel" : "Suggest Alternative"}
                  </Button>
                  <div className="flex gap-3">
                    <Button type="button" variant="ghost" onClick={onClose}>
                      Close
                    </Button>
                    {selectedSlot !== null && !showAlternativeForm && (
                      <Button
                        onClick={() => handleAcceptSlot(selectedSlot)}
                        variant="gradient"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Accepting..." : "Accept"}
                      </Button>
                    )}
                    {showAlternativeForm && (
                      <Button
                        onClick={handleSuggestAlternative}
                        variant="gradient"
                        disabled={isSubmitting || !alternativeSlot.date || !alternativeSlot.time}
                      >
                        {isSubmitting ? "Sending..." : "Send Alternative"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {safeInterviewRequest.status !== "pending" && (
              <div className="p-6 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex justify-end">
                  <Button type="button" variant="ghost" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

