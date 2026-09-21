import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, AlertCircle, BookOpen } from 'lucide-react';
import { OFFICIAL_DOCUMENTS, OFFICIAL_SCANNER_GUIDELINES } from '../data/guidelines';
import { DocumentTypeId } from '../types';

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidelinesModal: React.FC<GuidelinesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<DocumentTypeId | 'scanner'>('photo');

  if (!isOpen) return null;

  const currentSpec = activeTab !== 'scanner' ? OFFICIAL_DOCUMENTS[activeTab] : null;

  const tabs: { id: DocumentTypeId | 'scanner'; label: string }[] = [
    { id: 'photo', label: 'Photo' },
    { id: 'signature', label: 'Signature' },
    { id: 'thumb', label: 'Thumb' },
    { id: 'declaration', label: 'Declaration' },
    { id: 'certificate', label: 'Certificate' },
    { id: 'scanner', label: 'Scanner' },
  ];

  return (
    <div
      id="guidelines-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="guidelines-dialog"
        className="w-full max-w-3xl max-h-[85vh] rounded-3xl bg-white dark:bg-[#1E1F20] border border-[#E0E2EC]/80 dark:border-[#282A2C] shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#E0E2EC]/60 dark:border-[#282A2C] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] dark:bg-[#004A77] text-[#041E49] dark:text-[#C2E7FF] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                Annexure III Guidelines
              </h3>
              <p className="text-xs text-[#747775] dark:text-[#8E918F]">
                Official scanning & upload requirements
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

        {/* M3 Segmented Tabs */}
        <div className="px-5 py-2.5 border-b border-[#E0E2EC]/60 dark:border-[#282A2C] bg-[#F8FAFD] dark:bg-[#131314]">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#041E49] font-semibold'
                      : 'text-[#444746] dark:text-[#C4C7C5] hover:bg-[#EEF2F6] dark:hover:bg-[#282A2C]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-[#1F1F1F] dark:text-[#E3E3E3] text-xs sm:text-sm">
          {activeTab === 'scanner' ? (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                Official Scanner Digitization Specs
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {OFFICIAL_SCANNER_GUIDELINES.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#F8FAFD] dark:bg-[#131314] border border-[#E0E2EC]/70 dark:border-[#282A2C] space-y-1"
                  >
                    <span className="text-xs font-semibold text-[#0B57D0] dark:text-[#A8C7FA]">
                      {item.title}
                    </span>
                    <div className="text-sm font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                      {item.value}
                    </div>
                    <p className="text-xs text-[#747775] dark:text-[#8E918F] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : currentSpec ? (
            <div className="space-y-5">
              {/* Metric chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#EEF2F6] dark:bg-[#131314]">
                  <span className="block text-[10px] uppercase font-bold text-[#747775]">
                    Dimensions
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                    {currentSpec.targetWidth} × {currentSpec.targetHeight} px
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#EEF2F6] dark:bg-[#131314]">
                  <span className="block text-[10px] uppercase font-bold text-[#747775]">
                    File Size
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#146C2E] dark:text-[#6DD58C]">
                    {currentSpec.minSizeKb} KB – {currentSpec.maxSizeKb} KB
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#EEF2F6] dark:bg-[#131314]">
                  <span className="block text-[10px] uppercase font-bold text-[#747775]">
                    Format
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] uppercase">
                    {currentSpec.outputFormat}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#EEF2F6] dark:bg-[#131314]">
                  <span className="block text-[10px] uppercase font-bold text-[#747775]">
                    Physical
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                    {currentSpec.physicalSize || 'Standard'}
                  </span>
                </div>
              </div>

              {/* Do's & Don'ts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#C4EED0]/30 dark:bg-[#0F5223]/20 border border-[#C4EED0] dark:border-[#0F5223] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#072711] dark:text-[#C4EED0]">
                    <CheckCircle2 className="w-4 h-4 text-[#146C2E] dark:text-[#6DD58C]" />
                    <span>Do's:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#072711] dark:text-[#C4EED0]/90">
                    {currentSpec.dos.map((d, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFEDEA]/50 dark:bg-[#3E1A1A]/30 border border-[#FFEDEA] dark:border-[#3E1A1A] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#BA1A1A] dark:text-[#FFB4AB]">
                    <XCircle className="w-4 h-4 text-[#BA1A1A] dark:text-[#FFB4AB]" />
                    <span>Don'ts:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#BA1A1A] dark:text-[#FFB4AB]/90">
                    {currentSpec.donts.map((d, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Notes */}
              <div className="p-4 rounded-2xl bg-[#F8FAFD] dark:bg-[#131314] border border-[#E0E2EC]/70 dark:border-[#282A2C] space-y-1.5">
                <h4 className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA]" />
                  <span>Important Clauses:</span>
                </h4>
                <ul className="text-xs text-[#444746] dark:text-[#8E918F] space-y-1 list-disc list-inside">
                  {currentSpec.importantNotes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F8FAFD] dark:bg-[#131314] border-t border-[#E0E2EC]/60 dark:border-[#282A2C] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#041E49] hover:opacity-90 transition cursor-pointer"
          >
            Close Guidelines
          </button>
        </div>
      </div>
    </div>
  );
};
