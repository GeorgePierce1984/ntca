import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  Video,
  Phone,
  Building,
  Send,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface TimeSlot {
  date: string;
  time: string;
  timezone: string;
}

interface InterviewInviteData {
  applicationId: string;
  duration: number;
  locationType: "video" | "phone" | "onsite";
  location: string;
  message?: string;
  timeSlots: TimeSlot[];
}

interface InterviewInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: {
    id: string;
    name: string;
    email: string;
    currentLocation?: string;
    timezone?: string;
  };
  school: {
    name: string;
    city?: string;
    country?: string;
    timezone?: string;
  };
  jobTitle: string;
  onSend: (data: InterviewInviteData) => Promise<void>;
}

export const InterviewInviteModal: React.FC<InterviewInviteModalProps> = ({
  isOpen,
  onClose,
  applicant,
  school,
  jobTitle,
  onSend,
}) => {
  const [duration, setDuration] = useState<number>(30);
  const [locationType, setLocationType] = useState<"video" | "phone" | "onsite">("video");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { date: "", time: "", timezone: school.timezone || "UTC" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get timezone options
  const getTimezoneOptions = () => {
    return [
      { value: "UTC", label: "UTC" },
      { value: "America/New_York", label: "Eastern Time (ET)" },
      { value: "America/Chicago", label: "Central Time (CT)" },
      { value: "America/Denver", label: "Mountain Time (MT)" },
      { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
      { value: "Europe/London", label: "London (GMT)" },
      { value: "Europe/Paris", label: "Paris (CET)" },
      { value: "Asia/Dubai", label: "Dubai (GST)" },
      { value: "Asia/Almaty", label: "Almaty (ALMT)" },
      { value: "Asia/Tashkent", label: "Tashkent (UZT)" },
      { value: "Asia/Shanghai", label: "Shanghai (CST)" },
      { value: "Asia/Tokyo", label: "Tokyo (JST)" },
    ];
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string) => {
    const updated = [...timeSlots];
    updated[index] = { ...updated[index], [field]: value };
    setTimeSlots(updated);
  };

  const addTimeSlot = () => {
    if (timeSlots.length < 5) {
      setTimeSlots([
        ...timeSlots,
        { date: "", time: "", timezone: school.timezone || "UTC" },
      ]);
    }
  };

  const removeTimeSlot = (index: number) => {
    // Don't allow removing the first slot (index 0)
    if (index === 0 || timeSlots.length <= 1) {
      return;
    }
    const updated = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(updated);
  };

  const formatTimeInTimezone = (date: string, time: string, timezone: string) => {
    if (!date || !time) return "";
    try {
      const dateTime = new Date(`${date}T${time}`);
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return formatter.format(dateTime);
    } catch {
      return time;
    }
  };

  const validateForm = () => {
    if (!location) {
      if (locationType === "video") {
        toast.error("Please provide a video link");
        return false;
      } else if (locationType === "phone") {
        toast.error("Please provide a phone number");
        return false;
      } else if (locationType === "onsite") {
        toast.error("Please provide an address");
        return false;
      }
    }

    // First slot (index 0) is always mandatory
    if (!timeSlots[0].date || !timeSlots[0].time) {
      toast.error("Please provide at least one time slot (Option 1 is required)");
      return false;
    }

    // If additional slots are added, they must be completed
    for (let i = 1; i < timeSlots.length; i++) {
      const slot = timeSlots[i];
      // If any field is filled, all fields must be filled
      if (slot.date || slot.time) {
        if (!slot.date || !slot.time) {
          toast.error(`Please complete Option ${i + 1} or remove it`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSend({
        applicationId: applicant.id,
        duration,
        locationType,
        location,
        message: message.trim() || undefined,
        timeSlots: timeSlots.filter((slot) => slot.date && slot.time),
      });
      // Don't show toast here - let the parent component handle it
      onClose();
      // Reset form
      setDuration(30);
      setLocationType("video");
      setLocation("");
      setMessage("");
      setTimeSlots([
        { date: "", time: "", timezone: school.timezone || "UTC" },
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send interview invite");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-neutral-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Invite to Interview</h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {applicant.name} - {jobTitle}
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Duration *
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="input"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                  </select>
                </div>

                {/* Location Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Interview Type *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setLocationType("video");
                        setLocation("");
                      }}
                      className={`p-4 border-2 rounded-lg transition-colors ${
                        locationType === "video"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-neutral-200 dark:border-neutral-700"
                      }`}
                    >
                      <Video className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLocationType("phone");
                        setLocation("");
                      }}
                      className={`p-4 border-2 rounded-lg transition-colors ${
                        locationType === "phone"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-neutral-200 dark:border-neutral-700"
                      }`}
                    >
                      <Phone className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Phone</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLocationType("onsite");
                        setLocation("");
                      }}
                      className={`p-4 border-2 rounded-lg transition-colors ${
                        locationType === "onsite"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-neutral-200 dark:border-neutral-700"
                      }`}
                    >
                      <Building className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Onsite</span>
                    </button>
                  </div>
                </div>

                {/* Location Field */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {locationType === "video"
                      ? "Video Link *"
                      : locationType === "phone"
                      ? "Phone Number *"
                      : "Address *"}
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={
                      locationType === "video"
                        ? "e.g., https://zoom.us/j/123456789"
                        : locationType === "phone"
                        ? "e.g., +1 (555) 123-4567"
                        : "e.g., 123 Main St, City, Country"
                    }
                    className="input"
                    required
                  />
                </div>

                {/* Time Slots */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium">
                      Suggested Time Slots
                    </label>
                    <button
                      type="button"
                      onClick={addTimeSlot}
                      disabled={timeSlots.length >= 5}
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        timeSlots.length >= 5
                          ? "bg-neutral-100 dark:bg-neutral-700 text-neutral-400 cursor-not-allowed"
                          : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      Add Option
                    </button>
                  </div>
                  <div className="space-y-4">
                    {timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium">
                            Option {index + 1}
                            {index === 0 && (
                              <span className="ml-2 text-xs text-red-500">* Required</span>
                            )}
                            {index > 0 && (
                              <span className="ml-2 text-xs text-neutral-500">
                                {slot.date || slot.time ? "* Required" : "Optional"}
                              </span>
                            )}
                          </span>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(index)}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                              title="Remove this time slot"
                            >
                              <Trash2 className="w-4 h-4 text-neutral-400 group-hover:text-red-500" />
                            </button>
                          )}
                        </div>
                        <div className="grid md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              value={slot.date}
                              onChange={(e) =>
                                updateTimeSlot(index, "date", e.target.value)
                              }
                              min={new Date().toISOString().split("T")[0]}
                              className="input text-sm"
                              required={index === 0 || slot.date !== "" || slot.time !== ""}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                              Time
                            </label>
                            <input
                              type="time"
                              value={slot.time}
                              onChange={(e) =>
                                updateTimeSlot(index, "time", e.target.value)
                              }
                              className="input text-sm"
                              required={index === 0 || slot.date !== "" || slot.time !== ""}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                              Timezone
                            </label>
                            <select
                              value={slot.timezone}
                              onChange={(e) =>
                                updateTimeSlot(index, "timezone", e.target.value)
                              }
                              className="input text-sm"
                            >
                              {getTimezoneOptions().map((tz) => (
                                <option key={tz.value} value={tz.value}>
                                  {tz.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {slot.date && slot.time && (
                          <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400">
                              <div>
                                <strong>School timezone ({school.timezone || "UTC"}):</strong>{" "}
                                {formatTimeInTimezone(slot.date, slot.time, slot.timezone)}
                              </div>
                              {applicant.timezone && applicant.timezone !== slot.timezone && (
                                <div className="mt-1">
                                  <strong>Teacher timezone ({applicant.timezone}):</strong>{" "}
                                  {formatTimeInTimezone(slot.date, slot.time, applicant.timezone)}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional Message */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Optional Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Add any additional information about the interview..."
                    className="input"
                  />
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="p-6 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="gradient"
                  leftIcon={<Send className="w-4 h-4" />}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Invite"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

