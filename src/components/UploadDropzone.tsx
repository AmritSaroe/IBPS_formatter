import React, { useRef, useState } from 'react';
import { UploadCloud, Camera, Sparkles, AlertCircle } from 'lucide-react';
import { DocumentSpecification } from '../types';

interface UploadDropzoneProps {
  spec: DocumentSpecification;
  onFileSelected: (file: File) => void;
  onOpenCamera: () => void;
  onLoadSample: () => void;
  hasExistingFile?: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  spec,
  onFileSelected,
  onOpenCamera,
  onLoadSample,
  hasExistingFile = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragError(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSelect(files[0]);
    }
  };

  const validateAndSelect = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (spec.outputFormat === 'pdf') {
      if (!isImage && !isPdf) {
        setDragError('Please select a photo or PDF file.');
        return;
      }
    } else {
      if (!isImage) {
        setDragError('Please choose an image file (JPG, PNG).');
        return;
      }
    }

    setDragError(null);
    onFileSelected(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      {/* Dropzone Container */}
      <div
        id="file-dropzone-container"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
          isDragging
            ? 'bg-[#D3E3FD]/30 dark:bg-[#004A77]/20 border-2 border-dashed border-[#0B57D0] dark:border-[#A8C7FA] scale-[1.01]'
            : 'bg-white dark:bg-[#1E1F20] border border-[#E0E2EC]/80 dark:border-[#282A2C] shadow-xs hover:shadow-md hover:border-[#0B57D0]/40 dark:hover:border-[#A8C7FA]/40'
        }`}
      >
        <input
          ref={fileInputRef}
          id="file-upload-input"
          type="file"
          accept={spec.outputFormat === 'pdf' ? 'image/*,application/pdf' : 'image/*'}
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Upload Icon */}
        <div className="w-16 h-16 rounded-3xl bg-[#EEF2F6] dark:bg-[#282A2C] text-[#0B57D0] dark:text-[#A8C7FA] flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105">
          <UploadCloud className="w-8 h-8 stroke-[1.8]" />
        </div>

        {/* Clean Header */}
        <div className="space-y-1 max-w-md">
          <h3 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {hasExistingFile ? `Replace ${spec.title}` : `Upload ${spec.title}`}
          </h3>
          <p className="text-xs sm:text-sm text-[#444746] dark:text-[#8E918F]">
            Drag and drop here, or tap to choose from your device
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-[#0B57D0] hover:bg-[#0842A0] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] text-white dark:text-[#041E49] shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Choose File</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCamera();
            }}
            className="px-5 py-3 rounded-full text-xs sm:text-sm font-semibold bg-[#EEF2F6] dark:bg-[#282A2C] hover:bg-[#E0E2EC] dark:hover:bg-[#33353A] text-[#1F1F1F] dark:text-[#E3E3E3] transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <Camera className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA]" />
            <span>Camera</span>
          </button>
        </div>

        {/* Sample */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLoadSample();
          }}
          className="mt-4 text-xs text-[#747775] dark:text-[#8E918F] hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#0B57D0] dark:text-[#A8C7FA]" />
          <span>Try with a sample image</span>
        </button>

        {dragError && (
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#FFEDEA] dark:bg-[#3E1A1A] text-[#BA1A1A] dark:text-[#FFB4AB]">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{dragError}</span>
          </div>
        )}
      </div>

      {/* Tonal Specification Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#444746] dark:text-[#8E918F]">
        <span className="px-3 py-1 rounded-full bg-[#EEF2F6] dark:bg-[#1E1F20] font-medium">
          {spec.targetWidth} × {spec.targetHeight} px
        </span>
        <span className="px-3 py-1 rounded-full bg-[#EEF2F6] dark:bg-[#1E1F20] font-medium">
          {spec.minSizeKb}–{spec.maxSizeKb} KB
        </span>
        <span className="px-3 py-1 rounded-full bg-[#EEF2F6] dark:bg-[#1E1F20] font-medium uppercase">
          {spec.outputFormat}
        </span>
      </div>
    </div>
  );
};
