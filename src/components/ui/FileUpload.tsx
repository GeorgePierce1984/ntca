import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, Check, AlertCircle, Loader } from 'lucide-react';
import { Button } from './Button';

interface FileUploadProps {
  type: 'resume' | 'photo' | 'portfolio' | 'certificate' | 'logo';
  currentUrl?: string;
  onUploadSuccess: (url: string) => void;
  onUploadError?: (error: string) => void;
  maxSize?: number; // in MB
  accept?: string;
  className?: string;
  label?: string;
  description?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  type,
  currentUrl,
  onUploadSuccess,
  onUploadError,
  maxSize = 10,
  accept,
  className = '',
  label,
  description
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default accept types based on file type
  const getAcceptTypes = () => {
    if (accept) return accept;

    switch (type) {
      case 'photo':
      case 'logo':
        return 'image/jpeg,image/png,image/webp';
      case 'resume':
      case 'portfolio':
        return 'application/pdf,.doc,.docx';
      case 'certificate':
        return 'application/pdf,image/jpeg,image/png';
      default:
        return '*/*';
    }
  };

  // Get file type icon
  const getFileIcon = () => {
    switch (type) {
      case 'photo':
      case 'logo':
        return <Image className="w-8 h-8" />;
      default:
        return <FileText className="w-8 h-8" />;
    }
  };

  // Get display label
  const getLabel = () => {
    if (label) return label;

    switch (type) {
      case 'resume':
        return 'Upload Resume/CV';
      case 'photo':
        return 'Upload Profile Photo';
      case 'portfolio':
        return 'Upload Portfolio';
      case 'certificate':
        return 'Upload Certificate';
      case 'logo':
        return 'Upload School Logo';
      default:
        return 'Upload File';
    }
  };

  // Get description
  const getDescription = () => {
    if (description) return description;

    switch (type) {
      case 'resume':
        return 'PDF, DOC, or DOCX files up to 10MB';
      case 'photo':
      case 'logo':
        return 'JPG, PNG, or WebP images up to 10MB';
      case 'portfolio':
        return 'PDF or DOC files showcasing your work';
      case 'certificate':
        return 'PDF or image files of your certifications';
      default:
        return `Files up to ${maxSize}MB`;
    }
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    const acceptTypes = getAcceptTypes().split(',');
    const isValidType = acceptTypes.some(acceptType => {
      if (acceptType.startsWith('.')) {
        return file.name.toLowerCase().endsWith(acceptType.toLowerCase());
      }
      return file.type === acceptType.trim();
    });

    if (!isValidType) {
      return 'Invalid file type';
    }

    return null;
  };

  // Upload file
  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      onUploadError?.(validationError);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      onUploadSuccess(data.fileUrl);
      setUploadProgress(100);

      // Reset progress after success animation
      setTimeout(() => setUploadProgress(0), 2000);
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    uploadFile(file);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Open file picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Remove current file
  const removeFile = () => {
    onUploadSuccess('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {getLabel()}
        </label>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          {getDescription()}
        </p>
      </div>

      {/* Current file display */}
      {currentUrl && !uploading && (
        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-green-600 dark:text-green-400">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                File uploaded successfully
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {type === 'photo' || type === 'logo' ? 'Image ready' : 'Document ready'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(currentUrl, '_blank')}
              className="text-green-700 hover:text-green-800 dark:text-green-300 dark:hover:text-green-200"
            >
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Upload area */}
      {!currentUrl && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg transition-colors cursor-pointer
            ${dragOver
              ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
              : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-400 dark:hover:border-primary-500'
            }
            ${uploading ? 'pointer-events-none' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFilePicker}
        >
          <div className="relative p-8 text-center">
            {uploading ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Loader className="w-8 h-8 animate-spin text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Uploading...
                  </p>
                  {uploadProgress > 0 && (
                    <div className="mt-2 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center text-neutral-400">
                  {dragOver ? (
                    <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                      <Upload className="w-8 h-8 text-primary-600" />
                    </div>
                  ) : (
                    getFileIcon()
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {dragOver ? 'Drop file here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {getDescription()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptTypes()}
            onChange={handleInputChange}
            className="hidden"
            disabled={uploading}
          />
        </div>
      )}

      {/* Replace file button for existing files */}
      {currentUrl && !uploading && (
        <Button
          variant="ghost"
          size="sm"
          onClick={openFilePicker}
          className="w-full"
          leftIcon={<Upload className="w-4 h-4" />}
        >
          Replace File
        </Button>
      )}

      {/* Hidden file input for replace */}
      {currentUrl && (
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptTypes()}
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading}
        />
      )}
    </div>
  );
};

export default FileUpload;
