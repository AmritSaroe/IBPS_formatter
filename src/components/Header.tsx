import React, { useState } from 'react';
import { Sun, Moon, Download, BookOpen, FileText, CheckCircle2, FileSignature, HelpCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenGuidelines: () => void;
  onOpenDeclaration: () => void;
  onOpenEasyGuide?: () => void;
  batchReadyCount?: number;
  onOpenBatch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenGuidelines,
  onOpenDeclaration,
  onOpenEasyGuide,
  batchReadyCount = 0,
  onOpenBatch,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 w-full transition-colors duration-200 bg-[#F8FAFD]/90 dark:bg-[#131314]/90 backdrop-blur-md border-b border-[#E0E2EC]/70 dark:border-[#282A2C]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#041E49] flex items-center justify-center font-bold text-base sm:text-lg shadow-sm shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" y1="13" x2="15" y2="13" />
              <line x1="9" y1="17" x2="13" y2="17" />
            </svg>
          </div>
          <div className="shrink-0 flex items-center gap-1.5">
            <span className="text-base sm:text-lg font-semibold tracking-tight text-[#1F1F1F] dark:text-[#E3E3E3] whitespace-nowrap">
              DocSpec
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#D3E3FD] dark:bg-[#004A77] text-[#041E49] dark:text-[#C2E7FF] whitespace-nowrap">
              Annexure III
            </span>
          </div>
        </div>

        {/* M3 Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Easy Guide for beginners */}
          {onOpenEasyGuide && (
            <button
              id="easy-guide-btn"
              onClick={onOpenEasyGuide}
              type="button"
              className="w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-full flex items-center justify-center gap-1.5 text-xs font-medium bg-[#D3E3FD] dark:bg-[#004A77] text-[#041E49] dark:text-[#C2E7FF] hover:opacity-90 transition-colors cursor-pointer"
              title="Guide"
              aria-label="How to use guide"
            >
              <HelpCircle className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA]" />
              <span className="hidden sm:inline">Guide</span>
            </button>
          )}

          {/* Guidelines button */}
          <button
            id="official-guidelines-btn"
            onClick={onOpenGuidelines}
            type="button"
            className="w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-full flex items-center justify-center gap-1.5 text-xs font-medium text-[#444746] dark:text-[#C4C7C5] hover:bg-[#E9EEF6] dark:hover:bg-[#1E1F20] transition-colors cursor-pointer"
            title="Official Guidelines"
            aria-label="Official Guidelines"
          >
            <BookOpen className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA]" />
            <span className="hidden sm:inline">Guidelines</span>
          </button>

          {/* Declaration Text Helper - hidden on mobile, accessible on tab */}
          <button
            id="declaration-helper-btn"
            onClick={onOpenDeclaration}
            type="button"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#444746] dark:text-[#C4C7C5] hover:bg-[#E9EEF6] dark:hover:bg-[#1E1F20] transition-colors cursor-pointer"
            title="Hand-written Declaration Text"
          >
            <FileSignature className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA]" />
            <span>Declaration</span>
          </button>

          {/* Batch package trigger (if any ready) */}
          {batchReadyCount > 0 && onOpenBatch && (
            <button
              id="batch-view-btn"
              onClick={onOpenBatch}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium bg-[#C4EED0] dark:bg-[#0F5223] text-[#072711] dark:text-[#C4EED0] hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
              title="View all completed documents"
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{batchReadyCount}/5<span className="hidden xs:inline"> Ready</span></span>
            </button>
          )}

          {/* PWA Install Button (Chromium / Desktop) */}
          {isInstallable && !isInstalled && (
            <button
              id="pwa-install-header-btn"
              onClick={install}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#0B57D0] hover:bg-[#0842A0] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] text-white dark:text-[#041E49] shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Install</span>
            </button>
          )}

          {/* PWA iOS Guide Button */}
          {isIOS && !isInstalled && (
            <button
              id="pwa-ios-header-btn"
              onClick={() => setShowIOSGuide(true)}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-[#E9EEF6] dark:bg-[#1E1F20] text-[#1F1F1F] dark:text-[#E3E3E3] hover:bg-[#DDE3EA] dark:hover:bg-[#2A2B2E] transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#0B57D0] dark:text-[#A8C7FA]" />
              <span>Install</span>
            </button>
          )}

          {/* Dark/Light Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleDarkMode}
            type="button"
            aria-label="Toggle theme"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#444746] dark:text-[#C4C7C5] hover:bg-[#E9EEF6] dark:hover:bg-[#1E1F20] transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4 text-[#FFD700]" /> : <Moon className="w-4 h-4 text-[#444746]" />}
          </button>
        </div>
      </div>

      {/* iOS Install Guide Modal */}
      {showIOSGuide && (
        <div
          id="ios-install-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[#F8FAFD] dark:bg-[#1E1F20] p-6 shadow-2xl border border-[#E0E2EC] dark:border-[#282A2C]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#D3E3FD] dark:bg-[#004A77] text-[#041E49] dark:text-[#C2E7FF] flex items-center justify-center mx-auto mb-4">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-center text-[#1F1F1F] dark:text-[#E3E3E3]">
              Install DocSpec on iPhone / iPad
            </h3>
            <p className="mt-2 text-xs text-[#444746] dark:text-[#8E918F] text-center">
              Install to home screen for offline, distraction-free native mobile use:
            </p>
            <ol className="mt-4 space-y-2.5 text-xs text-[#1F1F1F] dark:text-[#E3E3E3] bg-[#EEF2F6] dark:bg-[#131314] p-4 rounded-2xl">
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#0B57D0] dark:text-[#A8C7FA] shrink-0">1.</span>
                <span>Tap the <strong>Share</strong> icon (box with upward arrow) in Safari.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#0B57D0] dark:text-[#A8C7FA] shrink-0">2.</span>
                <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#0B57D0] dark:text-[#A8C7FA] shrink-0">3.</span>
                <span>Tap <strong>Add</strong> to use DocSpec like a native app.</span>
              </li>
            </ol>
            <button
              id="ios-guide-close-btn"
              onClick={() => setShowIOSGuide(false)}
              type="button"
              className="mt-5 w-full rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#041E49] py-3 text-xs font-semibold hover:opacity-90 transition cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
