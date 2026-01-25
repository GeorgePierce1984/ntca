import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const applicationSchema = z.object({
  coverLetter: z.string().optional(),
  cv: z
    .instanceof(FileList)
    .refine(
      (files) => files && files.length > 0,
      "CV/Resume is required",
    )
    .refine(
      (files) => files && files.length > 0 && files[0]?.size <= 10000000,
      "File size must be less than 10MB",
    )
    .refine(
      (files) =>
        files &&
        files.length > 0 &&
        [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(files[0]?.type || ""),
      "Only PDF, DOC, and DOCX files are allowed",
    ),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
  schoolName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function JobApplicationForm({
  jobId,
  jobTitle,
  schoolName,
  onSuccess,
  onCancel,
}: JobApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("jobId", jobId);

      if (data.coverLetter) {
        formData.append("coverLetter", data.coverLetter);
      }

      if (!data.cv || data.cv.length === 0) {
        throw new Error("CV/Resume is required");
      }
      formData.append("cv", data.cv[0]);

      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/applications/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit application");
      }

      toast.success("Application submitted successfully!");
      onSuccess?.();
    } catch (error) {
      console.error("Application submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit application",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setValue("cv", undefined);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-2">Apply for {jobTitle}</h3>
      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
        at {schoolName}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Cover Letter */}
        <div>
          <label
            htmlFor="coverLetter"
            className="block text-sm font-medium mb-2"
          >
            Cover Letter (Optional)
          </label>
          <textarea
            id="coverLetter"
            {...register("coverLetter")}
            rows={6}
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Tell us why you're interested in this position and what makes you a great fit..."
          />
          {errors.coverLetter && (
            <p className="text-red-500 text-sm mt-1">
              {errors.coverLetter.message}
            </p>
          )}
        </div>

        {/* CV Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Resume/CV <span className="text-red-500">*</span>
          </label>

          {uploadedFile ? (
            <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-neutral-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <input
                type="file"
                {...register("cv")}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
              <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-neutral-500">
                  PDF, DOC, or DOCX (max 10MB)
                </p>
              </div>
            </label>
          )}

          {errors.cv && (
            <p className="text-red-500 text-sm mt-1">{errors.cv.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
