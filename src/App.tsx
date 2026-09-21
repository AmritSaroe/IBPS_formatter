/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DocumentTypeId, ProcessingOptions, ConvertedResult } from './types';
import { OFFICIAL_DOCUMENTS } from './data/guidelines';
import { loadImage, processImageDocument } from './utils/imageProcessor';
import { processCertificateToPdf } from './utils/pdfProcessor';
import { generateSampleDocument } from './utils/sampleGenerator';

import { Header } from './components/Header';
import { OfflineIndicator } from './components/OfflineIndicator';
import { DocumentPresetSelector, ViewMode } from './components/DocumentPresetSelector';
import { UploadDropzone } from './components/UploadDropzone';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { ImageEditorPreview } from './components/ImageEditorPreview';
import { DeclarationHelperModal } from './components/DeclarationHelperModal';
import { GuidelinesModal } from './components/GuidelinesModal';
import { BatchProcessorView } from './components/BatchProcessorView';
import { SimpleGuideModal } from './components/SimpleGuideModal';
import { FileSignature, HelpCircle, ShieldCheck } from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('docspec_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('docspec_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('docspec_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Active view
  const [activeTab, setActiveTab] = useState<ViewMode>('photo');

  // Modals
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [isDeclarationOpen, setIsDeclarationOpen] = useState(false);
  const [isEasyGuideOpen, setIsEasyGuideOpen] = useState(false);

  // Hidden file input for "Replace file" quick action
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Document states
  const [files, setFiles] = useState<Record<DocumentTypeId, File | null>>({
    photo: null,
    signature: null,
    thumb: null,
    declaration: null,
    certificate: null,
  });

  const [sourceImages, setSourceImages] = useState<Record<DocumentTypeId, HTMLImageElement | null>>({
    photo: null,
    signature: null,
    thumb: null,
    declaration: null,
    certificate: null,
  });

  const [results, setResults] = useState<Record<DocumentTypeId, ConvertedResult | null>>({
    photo: null,
    signature: null,
    thumb: null,
    declaration: null,
    certificate: null,
  });

  const [options, setOptions] = useState<Record<DocumentTypeId, ProcessingOptions>>({
    photo: { zoom: 1, rotation: 0, offsetX: 0, offsetY: 0, brightness: 0, contrast: 0, enhanceInk: false },
    signature: { zoom: 1, rotation: 0, offsetX: 0, offsetY: 0, brightness: 0, contrast: 0, enhanceInk: true },
    thumb: { zoom: 1, rotation: 0, offsetX: 0, offsetY: 0, brightness: 0, contrast: 0, enhanceInk: true },
    declaration: { zoom: 1, rotation: 0, offsetX: 0, offsetY: 0, brightness: 0, contrast: 0, enhanceInk: false },
    certificate: { zoom: 1, rotation: 0, offsetX: 0, offsetY: 0, brightness: 0, contrast: 0, enhanceInk: false },
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Ready count for badge
  const completedDocsMap: Record<DocumentTypeId, boolean> = {
    photo: !!results.photo,
    signature: !!results.signature,
    thumb: !!results.thumb,
    declaration: !!results.declaration,
    certificate: !!results.certificate,
  };
  const batchReadyCount = Object.values(completedDocsMap).filter(Boolean).length;

  // Next document mapping for guided 1-by-1 flow
  const nextTabMap: Record<DocumentTypeId, { id: ViewMode; label: string }> = {
    photo: { id: 'signature', label: 'Signature' },
    signature: { id: 'thumb', label: 'Left Thumb' },
    thumb: { id: 'declaration', label: 'Declaration' },
    declaration: { id: 'certificate', label: 'Certificate' },
    certificate: { id: 'batch', label: 'All in 1 ZIP' },
  };

  // Convert current document
  const triggerConversion = useCallback(
    async (type: DocumentTypeId, imgOrFile: HTMLImageElement | File, currentOptions: ProcessingOptions) => {
      setIsProcessing(true);
      try {
        const spec = OFFICIAL_DOCUMENTS[type];
        let res: ConvertedResult;

        if (spec.outputFormat === 'pdf') {
          res = await processCertificateToPdf(imgOrFile, spec);
        } else {
          let htmlImg: HTMLImageElement;
          if (imgOrFile instanceof HTMLImageElement) {
            htmlImg = imgOrFile;
          } else {
            htmlImg = await loadImage(imgOrFile);
          }
          res = await processImageDocument(htmlImg, spec, currentOptions);
        }

        setResults((prev) => ({ ...prev, [type]: res }));
      } catch (err) {
        console.error('Document conversion failed:', err);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // Handle file chosen from upload or camera
  const handleFileSelected = async (file: File, type: DocumentTypeId) => {
    setFiles((prev) => ({ ...prev, [type]: file }));

    try {
      if (type === 'certificate') {
        if (file.type === 'application/pdf') {
          const spec = OFFICIAL_DOCUMENTS.certificate;
          const kb = Number((file.size / 1024).toFixed(1));
          const res: ConvertedResult = {
            docTypeId: 'certificate',
            blob: file,
            dataUrl: URL.createObjectURL(file),
            fileName: file.name,
            fileSizeBytes: file.size,
            fileSizeKb: kb,
            width: spec.targetWidth,
            height: spec.targetHeight,
            format: 'pdf',
            isValid: kb <= 500,
            validationMessages: [
              { type: 'success', text: 'Format: Official PDF Document' },
              { type: 'success', text: 'Page Layout: A4 Standard' },
              {
                type: kb <= 500 ? 'success' : 'error',
                text: `File Size: ${kb} KB (${kb <= 500 ? 'Accepted: ≤ 500 KB' : 'Exceeds 500 KB limit'})`
              }
            ]
          };
          setResults((prev) => ({ ...prev, certificate: res }));
          return;
        }
      }

      const img = await loadImage(file);
      setSourceImages((prev) => ({ ...prev, [type]: img }));
      await triggerConversion(type, img, options[type]);
    } catch (err) {
      console.error('Failed to load file:', err);
    }
  };

  // Handle options changes (live conversion)
  const handleOptionsChange = (newOpts: ProcessingOptions) => {
    if (activeTab === 'batch') return;
    const type = activeTab as DocumentTypeId;
    setOptions((prev) => ({ ...prev, [type]: newOpts }));

    const img = sourceImages[type];
    if (img) {
      triggerConversion(type, img, newOpts);
    }
  };

  // Load sample document
  const handleLoadSample = async (type: DocumentTypeId) => {
    try {
      const sampleFile = await generateSampleDocument(type);
      await handleFileSelected(sampleFile, type);
    } catch (err) {
      console.error('Failed to load sample:', err);
    }
  };

  // Close / clear active document and return to upload dropzone
  const handleCloseDocument = (type: DocumentTypeId) => {
    setFiles((prev) => ({ ...prev, [type]: null }));
    setSourceImages((prev) => ({ ...prev, [type]: null }));
    setResults((prev) => ({ ...prev, [type]: null }));
  };

  // Download active document
  const handleDownloadActive = () => {
    if (activeTab === 'batch') return;
    const res = results[activeTab as DocumentTypeId];
    if (!res) return;

    const link = document.createElement('a');
    link.href = res.dataUrl;
    link.download = res.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Current active specification (if single doc)
  const activeSpec = activeTab !== 'batch' ? OFFICIAL_DOCUMENTS[activeTab] : null;
  const currentResult = activeTab !== 'batch' ? results[activeTab] : null;
  const currentSource = activeTab !== 'batch' ? sourceImages[activeTab] : null;
  const currentOpts = activeTab !== 'batch' ? options[activeTab] : options.photo;

  return (
    <div className={`${darkMode ? 'dark ' : ''}min-h-screen flex flex-col bg-[#F8FAFD] dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3] transition-colors duration-200`}>
      {/* M3 Expressive Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenGuidelines={() => setIsGuidelinesOpen(true)}
        onOpenDeclaration={() => setIsDeclarationOpen(true)}
        onOpenEasyGuide={() => setIsEasyGuideOpen(true)}
        batchReadyCount={batchReadyCount}
        onOpenBatch={() => setActiveTab('batch')}
      />

      {/* Main Friendly Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Material 3 Segmented Pill Rail with Step 1 indicators */}
        <DocumentPresetSelector
          selectedId={activeTab}
          onSelect={(id) => setActiveTab(id)}
          completedDocs={completedDocsMap}
        />

        {/* View Routing: Batch vs Single Document Studio */}
        {activeTab === 'batch' ? (
          <div className="animate-in fade-in duration-200">
            <BatchProcessorView
              completedDocs={results}
              onSelectDoc={(id) => setActiveTab(id)}
              onOpenGuidelines={() => setIsGuidelinesOpen(true)}
              onOpenDeclaration={() => setIsDeclarationOpen(true)}
            />
          </div>
        ) : activeSpec ? (
          <div className="animate-in fade-in duration-200 space-y-4">
            {/* If result exists, show the Focused Image Editor Stage */}
            {currentResult ? (
              <>
                <ImageEditorPreview
                  spec={activeSpec}
                  sourceImage={currentSource}
                  result={currentResult}
                  options={currentOpts}
                  onOptionsChange={handleOptionsChange}
                  isProcessing={isProcessing}
                  onReconvert={() => {
                    if (currentSource) triggerConversion(activeSpec.id, currentSource, currentOpts);
                  }}
                  onDownload={handleDownloadActive}
                  onReplaceFile={() => replaceFileInputRef.current?.click()}
                  onClose={() => handleCloseDocument(activeSpec.id)}
                  onNextDocument={() => setActiveTab(nextTabMap[activeSpec.id].id)}
                  nextDocumentTitle={nextTabMap[activeSpec.id].label}
                />

                {/* Hidden input for replacing the file */}
                <input
                  ref={replaceFileInputRef}
                  type="file"
                  accept={activeSpec.outputFormat === 'pdf' ? 'image/*,application/pdf' : 'image/*'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelected(file, activeSpec.id);
                  }}
                  className="hidden"
                />
              </>
            ) : (
              /* Minimalist Dropzone State */
              <div className="space-y-4">
                <UploadDropzone
                  spec={activeSpec}
                  hasExistingFile={false}
                  onFileSelected={(file) => handleFileSelected(file, activeSpec.id)}
                  onOpenCamera={() => setIsCameraOpen(true)}
                  onLoadSample={() => handleLoadSample(activeSpec.id)}
                />

                {/* Contextual helper for handwritten declaration */}
                {activeSpec.id === 'declaration' && (
                  <div className="max-w-2xl mx-auto flex items-center justify-center pt-1">
                    <button
                      type="button"
                      onClick={() => setIsDeclarationOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:bg-[#D3E3FD]/40 dark:hover:bg-[#004A77]/30 transition cursor-pointer"
                    >
                      <FileSignature className="w-3.5 h-3.5" />
                      <span>View declaration text to copy</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </main>

      {/* Modals */}
      {activeSpec && (
        <CameraCaptureModal
          spec={activeSpec}
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onCapture={(file) => handleFileSelected(file, activeSpec.id)}
        />
      )}

      <GuidelinesModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
      />

      <DeclarationHelperModal
        isOpen={isDeclarationOpen}
        onClose={() => setIsDeclarationOpen(false)}
        onSelectDeclarationPreset={() => setActiveTab('declaration')}
      />

      <SimpleGuideModal
        isOpen={isEasyGuideOpen}
        onClose={() => setIsEasyGuideOpen(false)}
        onStartPhoto={() => setActiveTab('photo')}
      />

      {/* Offline Status Pill */}
      <OfflineIndicator />
    </div>
  );
}
