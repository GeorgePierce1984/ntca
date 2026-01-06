import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  DollarSign,
  Calendar,
  Building,
  Eye,
  Edit3,
  Pause,
  Play,
  X,
  Users,
  Clock,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

interface Job {
  id: string;
  title: string;
  description: string;
  city: string;
  country: string;
  salary: string;
  type: string;
  status: string;
  deadline: string;
  createdAt: string;
  school: {
    id: string;
    name: string;
    verified?: boolean;
    logoUrl?: string;
  };
  _count: {
    applications: number;
  };
}

interface JobCardProps {
  job: Job;
  onEdit?: (job: Job) => void;
  onStatusChange?: (jobId: string, status: string) => void;
  onDelete?: (jobId: string) => void;
  variant?: "default" | "compact" | "detailed";
  showActions?: boolean;
}

export function JobCard({
  job,
  onEdit,
  onStatusChange,
  onDelete,
  variant = "default",
  showActions = false,
}: JobCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isOwner = user?.userType === "SCHOOL" && job.school.id === user.id;
  const isActive = job.status === "ACTIVE";
  const isPaused = job.status === "PAUSED";
  const isClosed = job.status === "CLOSED";

  const handleCardClick = () => {
    navigate(`/jobs/${job.id}`);
  };

  const handleApplicantsClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isOwner) {
      toast.error("Only the school that posted this job can view applicants");
      return;
    }

    // Navigate to school dashboard with applications tab and job filter
    navigate(`/schools/dashboard?tab=applications&job=${job.id}`);
  };

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStatusChange) {
      const newStatus = isActive ? "PAUSED" : "ACTIVE";
      onStatusChange(job.id, newStatus);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(job);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm("Are you sure you want to delete this job?")) {
      onDelete(job.id);
    }
  };

  const statusColors = {
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    PAUSED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    CLOSED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  const daysUntilDeadline = Math.ceil(
    (new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  if (variant === "compact") {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCardClick}
        className="bg-white dark:bg-neutral-800 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border border-neutral-200 dark:border-neutral-700"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
            <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {job.city}, {job.country}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {job.salary}
              </span>
            </div>
          </div>
          {isOwner && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleApplicantsClick}
              className="flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="font-semibold">{job._count.applications}</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={handleCardClick}
      className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold">{job.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[job.status as keyof typeof statusColors]}`}>
                {job.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <Building className="w-4 h-4" />
              <span>{job.school.name}</span>
              {job.school.verified && (
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>

          {/* Applicants Badge */}
          <motion.div
            whileHover={{ scale: isOwner ? 1.05 : 1 }}
            whileTap={{ scale: isOwner ? 0.95 : 1 }}
            onClick={isOwner ? handleApplicantsClick : undefined}
            className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl ${
              isOwner
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              <span className="text-2xl font-bold">{job._count.applications}</span>
            </div>
            <span className="text-xs">Applicants</span>
          </motion.div>
        </div>

        {/* Job Details */}
        <div className="space-y-3 mb-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.city}, {job.country}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {job.salary}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {job.type
                .split("_")
                .map(
                  (word) =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1).toLowerCase()
                )
                .join(" ")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : "Expired"}
            </span>
          </div>

          {variant === "detailed" && job.description && (
            <p className="text-neutral-600 dark:text-neutral-400 line-clamp-2">
              {job.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Posted {format(new Date(job.createdAt), "MMM d, yyyy")}
            </span>
            <span>
              Deadline: {format(new Date(job.deadline), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        {/* Actions */}
        {showActions && isOwner && (
          <div className="flex items-center gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEdit}
              leftIcon={<Edit3 className="w-4 h-4" />}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleStatusToggle}
              leftIcon={isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            >
              {isActive ? "Pause" : "Activate"}
            </Button>
            {isClosed && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                leftIcon={<X className="w-4 h-4" />}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Delete
              </Button>
            )}
            <div className="ml-auto">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleApplicantsClick}
                leftIcon={<Users className="w-4 h-4" />}
              >
                View Applicants
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
