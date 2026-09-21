import React from 'react';
import { X, CheckCircle2, UploadCloud, Download, Smartphone, ShieldCheck, ArrowRight } from 'lucide-react';

interface SimpleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPhoto: () => void;
}

export const SimpleGuideModal: React.FC<SimpleGuideModalProps> = ({
  isOpen,
  onClose,
  onStartPhoto,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="simple-guide-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="simple-guide-dialog"
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1E1F20] border border-[#E0E2EC]/80 dark:border-[#282A2C] p-6 sm:p-7 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E0E2EC]/60 dark:border-[#282A2C]">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D3E3FD] dark:bg-[#004A77] text-[#041E49] dark:text-[#C2E7FF] mb-2">
              Beginner Friendly
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
              How to Use DocSpec (in 3 Simple Steps)
            </h3>
            <p className="text-xs text-[#444746] dark:text-[#8E918F] mt-1">
              You do not need any computer skills. Everything is done for you automatically!
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#747775] hover:bg-[#EEF2F6] dark:hover:bg-[#282A2C] transition cursor-pointer shrink-0"
            aria-label="Close guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Visual Steps */}
        <div className="space-y-3.5 text-xs sm:text-sm">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-[#F8FAFD] dark:bg-[#131314] border border-[#E0E2EC]/70 dark:border-[#282A2C] flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#041E49] flex items-center justify-center font-bold shrink-0">
              1
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                Pick the document you need
              </h4>
              <p className="text-xs text-[#444746] dark:text-[#8E918F] leading-relaxed">
                Choose <strong>Passport Photo</strong>, <strong>Signature</strong>, <strong>Left Thumb</strong>, or <strong>Declaration</strong> from the top bar.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-[#F8FAFD] dark:bg-[#131314] border border-[#E0E2EC]/70 dark:border-[#282A2C] flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#041E49] flex items-center justify-center font-bold shrink-0">
              2
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                Upload or take a photo
              </h4>
              <p className="text-xs text-[#444746] dark:text-[#8E918F] leading-relaxed">
                Tap <strong>Choose File</strong> to pick any picture from your phone/computer, or tap <strong>Camera</strong> to snap one right now.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-[#F8FAFD] dark:bg-[#131314] border border-[#E0E2EC]/70 dark:border-[#282A2C] flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-[#146C2E] text-white dark:bg-[#6DD58C] dark:text-[#041E49] flex items-center justify-center font-bold shrink-0">
              3
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                Download your ready file!
              </h4>
              <p className="text-xs text-[#444746] dark:text-[#8E918F] leading-relaxed">
                Our system instantly crops it, sets the exact pixel dimensions, and makes the file size under the official limit. Just tap <strong>Download</strong> and upload it on your exam form!
              </p>
            </div>
          </div>
        </div>

        {/* Reassurance Banner */}
        <div className="p-3.5 rounded-2xl bg-[#C4EED0]/40 dark:bg-[#0F5223]/20 border border-[#C4EED0] dark:border-[#0F5223] flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#146C2E] dark:text-[#6DD58C] shrink-0" />
          <p className="text-xs text-[#072711] dark:text-[#C4EED0]">
            <strong>100% Private & Safe:</strong> Your photos never leave your device. All resizing happens right inside your phone or computer browser.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartPhoto();
            }}
            className="w-full py-3 px-6 rounded-full text-xs sm:text-sm font-semibold bg-[#0B57D0] hover:bg-[#0842A0] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] text-white dark:text-[#041E49] flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
          >
            <span>Got it, let's start!</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
