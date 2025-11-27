import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  Building,
  Send,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface InterviewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  jobTitle: string;
  onSchedule: (interviewData: InterviewData) => void;
}

export interface InterviewData {
  applicantId: string;
  date: string;
  time: string;
  duration: string;
  type: "in-person" | "video" | "phone";
  location?: string;
  meetingLink?: string;
  notes?: string;
  sendCalendarInvite: boolean;
  sendEmailNotification: boolean;
}

export const InterviewScheduleModal: React.FC<InterviewScheduleModalProps> = ({
  isOpen,
  onClose,
  applicant,
  jobTitle,
  onSchedule,
}) => {
  const [formData, setFormData] = useState<InterviewData>({
    applicantId: applicant.id,
    date: "",
    time: "",
    duration: "60",
    type: "video",
    location: "",
    meetingLink: "",
    notes: "",
    sendCalendarInvite: true,
    sendEmailNotification: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = "Please select a date";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = "Date must be in the future";
      }
    }

    if (!formData.time) {
      newErrors.time = "Please select a time";
    }

    if (!formData.duration) {
      newErrors.duration = "Please select duration";
    }

    if (formData.type === "in-person" && !formData.location) {
      newErrors.location = "Please provide a location for in-person interview";
    }

    if (formData.type === "video" && !formData.meetingLink) {
      newErrors.meetingLink = "Please provide a meeting link for video interview";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSchedule(formData);
      toast.success("Interview scheduled successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to schedule interview. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateMeetingLink = () => {
    // In a real app, this would call an API to create a meeting
    const meetingId = Math.random().toString(36).substring(7);
    setFormData({
      ...formData,
      meetingLink: `https://meet.ntca.app/interview/${meetingId}`,
    });
    toast.success("Meeting link generated!");
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
            className="bg-white dark:bg-neutral-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Schedule Interview</h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    with {applicant.name} for {jobTitle}
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
                {/* Date and Time */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Interview Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className={`input ${errors.date ? "border-red-500" : ""}`}
                    />
                    {errors.date && (
                      <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Time *
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      className={`input ${errors.time ? "border-red-500" : ""}`}
                    />
                    {errors.time && (
                      <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                    )}
                  </div>
                </div>

                {/* Duration and Type */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Duration *
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      className="input"
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Interview Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as InterviewData["type"],
                        })
                      }
                      className="input"
                    >
                      <option value="video">Video Call</option>
                      <option value="in-person">In-Person</option>
                      <option value="phone">Phone Call</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Fields */}
                {formData.type === "in-person" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="e.g., Main Campus, Room 301"
                      className={`input ${errors.location ? "border-red-500" : ""}`}
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                    )}
                  </div>
                )}

                {formData.type === "video" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Video className="w-4 h-4 inline mr-2" />
                      Meeting Link *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.meetingLink}
                        onChange={(e) =>
                          setFormData({ ...formData, meetingLink: e.target.value })
                        }
                        placeholder="e.g., https://zoom.us/j/123456789"
                        className={`input flex-1 ${errors.meetingLink ? "border-red-500" : ""}`}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={generateMeetingLink}
                      >
                        Generate Link
                      </Button>
                    </div>
                    {errors.meetingLink && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.meetingLink}
                      </p>
                    )}
                  </div>
                )}

                {formData.type === "phone" && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                          Phone Interview
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                          You will call the candidate at: {applicant.phone || "No phone number provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Interview Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Interview Notes / Agenda
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={4}
                    placeholder="Add any notes, questions, or topics to cover during the interview..."
                    className="input"
                  />
                </div>

                {/* Notification Options */}
                <div className="space-y-3">
                  <h3 className="font-medium">Notification Settings</h3>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sendEmailNotification}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sendEmailNotification: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm">
                      Send email notification to {applicant.name}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sendCalendarInvite}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sendCalendarInvite: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm">
                      Send calendar invite to both parties
                    </span>
                  </label>
                </div>

                {/* Summary */}
                {formData.date && formData.time && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-300">
                          Interview Summary
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                          {new Date(formData.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}{" "}
                          at {formData.time} ({formData.duration} minutes)
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-400">
                          Type: {formData.type === "in-person" ? "In-Person" : formData.type === "video" ? "Video Call" : "Phone Call"}
                          {formData.location && ` at ${formData.location}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Footer */}
            <div className="p-6 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <AlertCircle className="w-4 h-4" />
                  <span>The applicant will be notified about this interview</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    variant="gradient"
                    leftIcon={<Send className="w-4 h-4" />}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Scheduling..." : "Schedule Interview"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
