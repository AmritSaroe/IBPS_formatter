import React, { useState } from 'react';
import { X, Copy, Check, AlertTriangle, FileSignature, Edit3, ArrowRight } from 'lucide-react';

interface DeclarationHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDeclarationPreset?: () => void;
}

export const DeclarationHelperModal: React.FC<DeclarationHelperModalProps> = ({
  isOpen,
  onClose,
  onSelectDeclarationPreset,
}) => {
  const [candidateName, setCandidateName] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const resolvedName = candidateName.trim() || '[Your Full Name]';
  const declarationStatement = `“I, ${resolvedName}, hereby declare that all the information submitted by me in the application form is correct, true and valid. I will submit the supporting documents as and when required.”`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(declarationStatement);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      id="declaration-helper-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="declaration-helper-dialog"
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1E1F20] border border-[#E0E2EC]/80 dark:border-[#282A2C] p-6 sm:p-7 shadow-xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E0E2EC]/50 dark:border-[#282A2C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] dark:bg-[#004A77] text-[#041E49] dark:text-[#C2E7FF] flex items-center justify-center">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                Hand-written Declaration
              </h3>
              <p className="text-xs text-[#747775] dark:text-[#8E918F]">
                Annexure III Mandatory Statement
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#747775] hover:bg-[#EEF2F6] dark:hover:bg-[#282A2C] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Candidate Name Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#444746] dark:text-[#C4C7C5] flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-[#0B57D0] dark:text-[#A8C7FA]" />
            Your Full Name (preview in statement):
          </label>
          <input
            id="candidate-name-input"
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-[#E0E2EC] dark:border-[#282A2C] bg-[#F8FAFD] dark:bg-[#131314] text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] focus:outline-none focus:ring-2 focus:ring-[#0B57D0]"
          />
        </div>

        {/* Declaration Card */}
        <div className="space-y-2">
          <div className="p-4 rounded-2xl bg-[#EEF2F6] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] relative">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#0B57D0] dark:text-[#A8C7FA] block mb-1">
              Text to write on paper:
            </span>
            <p className="text-xs sm:text-sm leading-relaxed font-serif italic selection:bg-[#D3E3FD]">
              {declarationStatement}
            </p>
          </div>

          <button
            id="copy-declaration-text-btn"
            type="button"
            onClick={handleCopy}
            className="w-full py-2.5 px-4 rounded-full text-xs font-medium border border-[#E0E2EC] dark:border-[#282A2C] hover:bg-[#EEF2F6] dark:hover:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#146C2E] dark:text-[#6DD58C]" />
                <span className="text-[#146C2E] dark:text-[#6DD58C] font-semibold">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#747775]" />
                <span>Copy Statement Text</span>
              </>
            )}
          </button>
        </div>

        {/* Essential Rules */}
        <div className="p-3.5 rounded-2xl bg-[#FFEDEA] dark:bg-[#3E1A1A] text-[#BA1A1A] dark:text-[#FFB4AB] space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Important Notification Rules:</span>
          </div>
          <ul className="text-[11px] sm:text-xs space-y-1 list-disc list-inside opacity-90 pl-1">
            <li><strong>DO NOT WRITE IN CAPITAL LETTERS</strong> (causes rejection).</li>
            <li>Must be in your <strong>own handwriting</strong> and in <strong>English only</strong>.</li>
            <li>Use clean white paper with a <strong>black ink pen</strong>.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-medium text-[#747775] hover:bg-[#EEF2F6] dark:hover:bg-[#282A2C] cursor-pointer"
          >
            Close
          </button>

          {onSelectDeclarationPreset && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectDeclarationPreset();
              }}
              className="py-2.5 px-5 rounded-full text-xs font-medium bg-[#0B57D0] hover:bg-[#0842A0] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] text-white dark:text-[#041E49] flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <span>Resize Declaration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
