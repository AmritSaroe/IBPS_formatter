import React from 'react';
import { Camera, PenTool, Fingerprint, FileSignature, Award, Archive, Check } from 'lucide-react';
import { DocumentTypeId } from '../types';

export type ViewMode = DocumentTypeId | 'batch';

interface DocumentPresetSelectorProps {
  selectedId: ViewMode;
  onSelect: (id: ViewMode) => void;
  completedDocs: Record<DocumentTypeId, boolean>;
}

export const DocumentPresetSelector: React.FC<DocumentPresetSelectorProps> = ({
  selectedId,
  onSelect,
  completedDocs,
}) => {
  const completedCount = Object.values(completedDocs).filter(Boolean).length;

  const items: {
    id: ViewMode;
    step: string;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'photo',
      step: '1',
      label: 'Photo',
      icon: <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />,
    },
    {
      id: 'signature',
      step: '2',
      label: 'Signature',
      icon: <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />,
    },
    {
      id: 'thumb',
      step: '3',
      label: 'Thumb',
      icon: <Fingerprint className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />,
    },
    {
      id: 'declaration',
      step: '4',
      label: 'Declaration',
      icon: <FileSignature className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />,
    },
    {
      id: 'certificate',
      step: '5',
      label: 'Certificate',
      icon: <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />,
    },
    {
      id: 'batch',
      step: 'All',
      label: 'ZIP Pack',
      icon: <Archive className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />,
    },
  ];

  return (
    <div id="document-preset-selector" className="w-full space-y-2">
      {/* Friendly Progress Bar & Step Tracker (No technical jargon) */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
            Required Documents
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
              completedCount === 5
                ? 'bg-[#C4EED0] dark:bg-[#0F5223] text-[#072711] dark:text-[#C4EED0]'
                : 'bg-[#D3E3FD] dark:bg-[#004A77] text-[#041E49] dark:text-[#C2E7FF]'
            }`}
          >
            {completedCount} of 5 Completed {completedCount === 5 ? '🎉' : ''}
          </span>
        </div>

        <span className="text-[11px] text-[#747775] dark:text-[#8E918F] hidden xs:inline">
          Tap any item to resize
        </span>
      </div>

      {/* Progress visual bar */}
      <div className="w-full h-1 bg-[#E0E2EC]/70 dark:bg-[#282A2C] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0B57D0] dark:bg-[#A8C7FA] transition-all duration-300 rounded-full"
          style={{ width: `${Math.max(4, (completedCount / 5) * 100)}%` }}
        />
      </div>

      {/* 
        NO HORIZONTAL SCROLL:
        - Mobile: 3 columns x 2 rows grid (100% visible on any smartphone screen)
        - Tablet / Desktop: 6 columns single row
      */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 pt-1">
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          const isCompleted = item.id !== 'batch' && completedDocs[item.id as DocumentTypeId];
          const isBatchReady = item.id === 'batch' && completedCount > 0;

          return (
            <button
              key={item.id}
              id={`preset-tab-${item.id}`}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none border min-h-[46px] ${
                isSelected
                  ? 'bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#041E49] border-[#0B57D0] dark:border-[#A8C7FA] shadow-xs font-semibold'
                  : isCompleted
                  ? 'bg-[#F0FDF4] dark:bg-[#0F5223]/25 border-[#86EFAC] dark:border-[#146C2E] text-[#1F1F1F] dark:text-[#E3E3E3] hover:bg-[#DCFCE7] dark:hover:bg-[#0F5223]/40'
                  : isBatchReady
                  ? 'bg-[#EEF2F6] dark:bg-[#1E1F20] border-[#0B57D0]/40 dark:border-[#A8C7FA]/40 text-[#0B57D0] dark:text-[#A8C7FA] hover:bg-[#D3E3FD]/40'
                  : 'bg-white dark:bg-[#1E1F20] border-[#E0E2EC]/70 dark:border-[#282A2C] text-[#444746] dark:text-[#C4C7C5] hover:bg-[#EEF2F6] dark:hover:bg-[#282A2C]'
              }`}
            >
              {/* Completed checkmark badge in top-right on mobile */}
              {isCompleted && (
                <span
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shadow-2xs ${
                    isSelected
                      ? 'bg-white text-[#0B57D0] dark:bg-[#041E49] dark:text-[#A8C7FA]'
                      : 'bg-[#146C2E] text-white dark:bg-[#6DD58C] dark:text-[#072711]'
                  }`}
                  title="Document ready"
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}

              {/* Icon & Step Number */}
              <span
                className={`flex items-center gap-1 ${
                  isSelected
                    ? 'text-white dark:text-[#041E49]'
                    : isCompleted
                    ? 'text-[#146C2E] dark:text-[#6DD58C]'
                    : 'text-[#747775] dark:text-[#8E918F]'
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-semibold opacity-75">
                  {item.step}.
                </span>
              </span>

              {/* Label */}
              <span className="truncate max-w-[85px] sm:max-w-none text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
