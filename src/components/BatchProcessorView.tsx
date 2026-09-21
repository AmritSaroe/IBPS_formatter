import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Download,
  CheckCircle2,
  FileCheck,
  Archive,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { OFFICIAL_DOCUMENTS } from '../data/guidelines';
import { DocumentTypeId, ConvertedResult } from '../types';

interface BatchProcessorViewProps {
  completedDocs: Record<DocumentTypeId, ConvertedResult | null>;
  onSelectDoc: (id: DocumentTypeId) => void;
  onOpenGuidelines: () => void;
  onOpenDeclaration: () => void;
}

export const BatchProcessorView: React.FC<BatchProcessorViewProps> = ({
  completedDocs,
  onSelectDoc,
  onOpenGuidelines,
  onOpenDeclaration,
}) => {
  const [isZipping, setIsZipping] = useState(false);

  const docIds: DocumentTypeId[] = ['photo', 'signature', 'thumb', 'declaration', 'certificate'];
  const readyCount = docIds.filter((id) => completedDocs[id] !== null).length;

  const handleDownloadAllZip = async () => {
    if (readyCount === 0) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder('Annexure_III_Exam_Documents');

      for (let i = 0; i < docIds.length; i++) {
        const id = docIds[i];
        const res = completedDocs[id];
        if (res) {
          const spec = OFFICIAL_DOCUMENTS[id];
          const prefix = `0${i + 1}_${spec.title.replace(/[^a-zA-Z0-9]/g, '_')}`;
          const ext = res.format === 'pdf' ? '.pdf' : '.jpg';
          const fileName = `${prefix}_${res.width}x${res.height}_${Math.round(res.fileSizeKb)}kb${ext}`;
          folder?.file(fileName, res.blob);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Exam_Documents_Package_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create zip package:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadSingle = (res: ConvertedResult) => {
    const url = URL.createObjectURL(res.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = res.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="batch-processor-container" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Minimal M3 Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#F0F4F9] dark:bg-[#1E1F20] border border-[#E0E2EC]/70 dark:border-[#282A2C] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D3E3FD] dark:bg-[#004A77] text-[#041E49] dark:text-[#C2E7FF]">
            <Layers className="w-3.5 h-3.5" />
            <span>Complete Exam Package</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {readyCount} of 5 Documents Ready
          </h2>
          {/* Progress Bar */}
          <div className="w-full max-w-xs h-2 bg-[#E0E2EC] dark:bg-[#282A2C] rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-[#0B57D0] dark:bg-[#A8C7FA] transition-all duration-300 rounded-full"
              style={{ width: `${(readyCount / 5) * 100}%` }}
            />
          </div>
        </div>

        <button
          id="download-all-zip-btn"
          type="button"
          disabled={readyCount === 0 || isZipping}
          onClick={handleDownloadAllZip}
          className="w-full md:w-auto py-3.5 px-6 rounded-full text-xs sm:text-sm font-semibold bg-[#0B57D0] hover:bg-[#0842A0] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] text-white dark:text-[#041E49] shadow-sm disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Archive className="w-4 h-4" />
          <span>{isZipping ? 'Packaging...' : `Download All as ZIP (${readyCount})`}</span>
        </button>
      </div>

      {/* Clean Document Cards */}
      <div className="space-y-3">
        {docIds.map((id, index) => {
          const spec = OFFICIAL_DOCUMENTS[id];
          const res = completedDocs[id];
          const isReady = !!res;

          return (
            <div
              key={id}
              id={`batch-card-${id}`}
              className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1E1F20] border border-[#E0E2EC]/70 dark:border-[#282A2C] flex items-center justify-between gap-4 transition-all hover:shadow-xs"
            >
              {/* Left Identity */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-semibold shrink-0 ${
                    isReady
                      ? 'bg-[#C4EED0] text-[#072711] dark:bg-[#0F5223] dark:text-[#C4EED0]'
                      : 'bg-[#EEF2F6] text-[#444746] dark:bg-[#282A2C] dark:text-[#C4C7C5]'
                  }`}
                >
                  0{index + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
                      {spec.title}
                    </h3>
                    {isReady && (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#C4EED0] dark:bg-[#0F5223] text-[#072711] dark:text-[#C4EED0]">
                        Ready
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#747775] dark:text-[#8E918F] truncate">
                    {isReady ? `${res.fileSizeKb} KB · ${res.width}×${res.height} px` : `${spec.minSizeKb}–${spec.maxSizeKb} KB · ${spec.outputFormat.toUpperCase()}`}
                  </p>
                </div>
              </div>

              {/* Right Action Controls */}
              <div className="flex items-center gap-2 shrink-0">
                {isReady && (
                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(res)}
                    className="p-2.5 rounded-full bg-[#EEF2F6] dark:bg-[#282A2C] hover:bg-[#E0E2EC] dark:hover:bg-[#33353A] text-[#1F1F1F] dark:text-[#E3E3E3] transition cursor-pointer"
                    title="Download file"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onSelectDoc(id)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition cursor-pointer inline-flex items-center gap-1.5 ${
                    isReady
                      ? 'bg-[#EEF2F6] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] hover:bg-[#E0E2EC]'
                      : 'bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#041E49] hover:opacity-90'
                  }`}
                >
                  <span>{isReady ? 'Edit' : 'Upload'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
