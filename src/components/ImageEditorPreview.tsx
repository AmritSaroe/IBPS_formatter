import React, { useState, useRef } from 'react';
import {
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Eye,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  FileCheck,
  UploadCloud,
  Sliders,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight as ArrowRightIcon,
  Crosshair,
  Move,
  User,
  ScanLine
} from 'lucide-react';
import { DocumentSpecification, ProcessingOptions, ConvertedResult } from '../types';

interface ImageEditorPreviewProps {
  spec: DocumentSpecification;
  sourceImage: HTMLImageElement | null;
  result: ConvertedResult | null;
  options: ProcessingOptions;
  onOptionsChange: (options: ProcessingOptions) => void;
  isProcessing: boolean;
  onReconvert?: () => void;
  onDownload: () => void;
  onReplaceFile?: () => void;
  onClose?: () => void;
  onNextDocument?: () => void;
  nextDocumentTitle?: string;
}

export const ImageEditorPreview: React.FC<ImageEditorPreviewProps> = ({
  spec,
  sourceImage,
  result,
  options,
  onOptionsChange,
  isProcessing,
  onDownload,
  onReplaceFile,
  onClose,
  onNextDocument,
  nextDocumentTitle,
}) => {
  const [showCompare, setShowCompare] = useState(false);
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [showGuide, setShowGuide] = useState(spec.id === 'photo');

  // Dragging / panning state
  const imgRef = useRef<HTMLImageElement | null>(null);
  const isDraggingRef = useRef(false);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const gestureStartRef = useRef<{
    distance: number;
    angle: number;
    zoom: number;
    rotation: number;
  } | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; startOffsetX: number; startOffsetY: number }>({
    x: 0,
    y: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  });
  const [dragDelta, setDragDelta] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Dynamic step based on target dimensions (approx 8% of target height)
  const getNudgeStep = () => {
    return Math.max(8, Math.round(spec.targetHeight * 0.08));
  };

  const handleNudge = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = getNudgeStep();
    let newX = options.offsetX;
    let newY = options.offsetY;

    switch (direction) {
      case 'up':
        // Moves image up (revealing lower section)
        newY -= step;
        break;
      case 'down':
        // Moves image down (revealing top section / head & face)
        newY += step;
        break;
      case 'left':
        newX -= step;
        break;
      case 'right':
        newX += step;
        break;
    }

    onOptionsChange({ ...options, offsetX: newX, offsetY: newY });
  };

  const handleCenterPosition = () => {
    onOptionsChange({ ...options, offsetX: 0, offsetY: 0 });
  };

  // Dedicated helper for passport photos: pulls face into center when head is high in the picture
  const handleFocusFace = () => {
    const faceOffsetY = Math.round(spec.targetHeight * 0.22);
    onOptionsChange({ ...options, offsetX: 0, offsetY: faceOffsetY });
  };

  const handleZoom = (delta: number) => {
    const newZoom = Math.min(Math.max(0.5, options.zoom + delta), 2.5);
    onOptionsChange({ ...options, zoom: Number(newZoom.toFixed(2)) });
  };

  const handleRotate = () => {
    const newRot = (options.rotation + 90) % 360;
    onOptionsChange({ ...options, rotation: newRot });
  };

  const handleResetAll = () => {
    onOptionsChange({
      zoom: 1,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      brightness: 0,
      contrast: 0,
      enhanceInk: spec.id === 'signature' || spec.id === 'thumb',
    });
  };

  // Pointer drag events for direct touch/mouse pan
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (spec.outputFormat === 'pdf' || !sourceImage) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 2) {
      const [first, second] = Array.from(activePointersRef.current.values());
      gestureStartRef.current = {
        distance: Math.hypot(second.x - first.x, second.y - first.y),
        angle: Math.atan2(second.y - first.y, second.x - first.x),
        zoom: options.zoom,
        rotation: options.rotation,
      };
      isDraggingRef.current = false;
      setIsDragging(false);
      setDragDelta({ x: 0, y: 0 });
      return;
    }

    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startOffsetX: options.offsetX,
      startOffsetY: options.offsetY,
    };
    setIsDragging(true);
    setDragDelta({ x: 0, y: 0 });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (activePointersRef.current.size === 2 && gestureStartRef.current) {
      const [first, second] = Array.from(activePointersRef.current.values());
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      const angle = Math.atan2(second.y - first.y, second.x - first.x);
      const zoom = Math.min(2.5, Math.max(0.5, gestureStartRef.current.zoom * (distance / gestureStartRef.current.distance)));
      let angleDelta = ((angle - gestureStartRef.current.angle) * 180) / Math.PI;
      if (angleDelta > 180) angleDelta -= 360;
      if (angleDelta < -180) angleDelta += 360;
      const rotation = ((gestureStartRef.current.rotation + angleDelta) % 360 + 360) % 360;
      onOptionsChange({ ...options, zoom: Number(zoom.toFixed(2)), rotation: Math.round(rotation) });
      return;
    }

    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setDragDelta({ x: dx, y: dy });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) gestureStartRef.current = null;
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    const rect = imgRef.current?.getBoundingClientRect();
    const scale = rect && rect.height > 0 ? spec.targetHeight / rect.height : 1;

    const finalOffsetX = Math.round(dragStartRef.current.startOffsetX + (e.clientX - dragStartRef.current.x) * scale);
    const finalOffsetY = Math.round(dragStartRef.current.startOffsetY + (e.clientY - dragStartRef.current.y) * scale);

    setDragDelta({ x: 0, y: 0 });
    onOptionsChange({ ...options, offsetX: finalOffsetX, offsetY: finalOffsetY });
  };

  const handlePointerCancel = () => {
    activePointersRef.current.clear();
    gestureStartRef.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);
    setDragDelta({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (spec.outputFormat === 'pdf' || !sourceImage) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const zoom = Math.min(2.5, Math.max(0.5, options.zoom + delta));
    onOptionsChange({ ...options, zoom: Number(zoom.toFixed(2)) });
  };

  const handleShare = async () => {
    if (!result) return;
    try {
      if (navigator.share && navigator.canShare) {
        const file = new File([result.blob], result.fileName, { type: result.blob.type });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: spec.title,
            text: `${spec.title} (${result.fileSizeKb} KB)`,
            files: [file],
          });
          return;
        }
      }
      onDownload();
    } catch (err) {
      console.log('Share canceled or not supported');
    }
  };

  return (
    <div
      id="image-editor-preview-card"
      className="w-full max-w-4xl mx-auto bg-white dark:bg-[#1E1F20] rounded-3xl border border-[#E0E2EC]/70 dark:border-[#282A2C] shadow-xs overflow-hidden"
    >
      {/* Header Bar */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E0E2EC]/60 dark:border-[#282A2C] flex items-center justify-between gap-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 min-w-0">
          <h2 className="text-sm sm:text-base font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
            {spec.title}
          </h2>
          {result && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-[#C4EED0] dark:bg-[#0F5223] text-[#072711] dark:text-[#C4EED0] whitespace-nowrap w-fit shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{result.fileSizeKb} KB · {result.width}×{result.height} px</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {onReplaceFile && (
            <button
              type="button"
              onClick={onReplaceFile}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium text-[#444746] dark:text-[#C4C7C5] hover:bg-[#EEF2F6] dark:hover:bg-[#282A2C] transition cursor-pointer"
              title="Replace file"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Replace</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              id="close-editor-btn"
              onClick={onClose}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium text-[#747775] dark:text-[#8E918F] hover:bg-[#FFEDEA] dark:hover:bg-[#3E1A1A] hover:text-[#BA1A1A] dark:hover:text-[#FFB4AB] transition cursor-pointer"
              title="Close editing and remove file"
              aria-label="Close editing"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Preview Stage */}
      <div className="p-4 sm:p-6 flex flex-col items-center justify-center bg-[#F8FAFD] dark:bg-[#131314] select-none">
        {/* Viewport Frame with Drag-to-Pan support */}
        <div className="w-full flex justify-center">
        <div
          id="preview-stage-container"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onWheel={handleWheel}
          className={`relative w-full max-w-[320px] max-h-[340px] rounded-2xl overflow-hidden shadow-sm bg-white border border-[#E0E2EC]/70 dark:border-[#282A2C] flex items-center justify-center touch-none ${
            spec.outputFormat !== 'pdf' && sourceImage ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
          style={{ aspectRatio: `${spec.targetWidth} / ${spec.targetHeight}` }}
          title={spec.outputFormat !== 'pdf' ? 'Drag with finger or mouse to reposition image' : ''}
        >
          {result && result.format === 'pdf' ? (
            <div className="p-6 sm:p-8 text-center space-y-3 bg-white text-[#1F1F1F] w-64 h-80 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-[#FFEDEA] text-[#BA1A1A] flex items-center justify-center">
                <FileCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">PDF Ready</h4>
                <p className="text-xs text-[#747775] mt-0.5 truncate max-w-[200px]">
                  {result.fileName}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C4EED0] text-[#072711]">
                {result.fileSizeKb} KB (≤ 500 KB)
              </span>
            </div>
          ) : result ? (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <img
                ref={imgRef}
                src={showCompare && sourceImage ? sourceImage.src : result.dataUrl}
                alt={spec.title}
                style={{
                  transform: isDragging
                    ? `translate3d(${dragDelta.x}px, ${dragDelta.y}px, 0)`
                    : 'translate3d(0, 0, 0)',
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                }}
                className="w-full h-full object-contain pointer-events-none select-none"
              />

              {/* Passport Photo Alignment Guide (Annexure III Standard: 70-80% Face Area) */}
              {spec.id === 'photo' && showGuide && !showCompare && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4"
                >
                  <div className="w-[66%] h-[78%] rounded-[50%] border-2 border-dashed border-[#0B57D0]/70 dark:border-[#A8C7FA]/70 flex flex-col justify-between items-center py-3">
                    <div className="w-full border-t border-dotted border-[#0B57D0]/60 dark:border-[#A8C7FA]/60 mt-8 relative">
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[9px] font-bold tracking-wider px-1 bg-white/90 dark:bg-black/80 text-[#0B57D0] dark:text-[#A8C7FA] rounded">
                        EYE LEVEL
                      </span>
                    </div>
                    <div className="w-[45%] border-t border-dashed border-[#0B57D0]/60 dark:border-[#A8C7FA]/60 mb-2 relative">
                      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-bold tracking-wider px-1 bg-white/90 dark:bg-black/80 text-[#0B57D0] dark:text-[#A8C7FA] rounded">
                        CHIN
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-48 h-56 flex items-center justify-center text-xs text-[#747775]">
              Processing...
            </div>
          )}

          {/* Processing loader */}
          {isProcessing && (
            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center pointer-events-none">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1F1F1F] text-white text-xs font-medium shadow-md">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Calibrating...</span>
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Gesture instructions */}
        {spec.outputFormat !== 'pdf' && sourceImage && (
          <div className="mt-3 w-full max-w-md rounded-2xl bg-[#D3E3FD]/60 dark:bg-[#004A77]/35 px-3.5 py-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#041E49] dark:text-[#C2E7FF]">
              <Move className="w-3.5 h-3.5" />
              <span>Edit directly on the picture</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-[#3C4858] dark:text-[#C2E7FF]/80">
              One finger: move · Two fingers: pinch to zoom and twist to rotate · Mouse wheel: zoom
            </p>
          </div>
        )}

        {/* DIRECTIONAL CONTROLS & POSITION D-PAD (Left, Right, Up, Down) */}
        {spec.outputFormat !== 'pdf' && sourceImage && (
          <div className="mt-3 w-full max-w-sm flex flex-col items-center gap-2">
            <div className="w-full flex items-center gap-2 text-left">
              <span className="w-6 h-6 rounded-full bg-[#D3E3FD] dark:bg-[#004A77] text-[#041E49] dark:text-[#C2E7FF] text-xs font-bold flex items-center justify-center">1</span>
              <div>
                <p className="text-sm font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">Position your document</p>
                <p className="text-[11px] text-[#747775] dark:text-[#8E918F]">Drag the image or use the arrows to center it.</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-2xl bg-white dark:bg-[#1E1F20] border border-[#E0E2EC]/80 dark:border-[#282A2C] shadow-2xs">
              {/* Left */}
              <button
                type="button"
                id="nudge-left-btn"
                onClick={() => handleNudge('left')}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-[#1F1F1F] dark:text-[#E3E3E3] hover:bg-[#EEF2F6] dark:hover:bg-[#282A2C] active:scale-95 transition cursor-pointer"
                title="Move Left"
                aria-label="Move Left"
              >
                <ArrowLeft className="w-5 h-5 text-[#0B57D0] dark:text-[#A8C7FA]" />
              </button>

              {/* Vertical Stack: Up / Center / Down */}
              <div className="flex flex-col items-center gap-1">
                {/* Up */}
                <button
                  type="button"
                  id="nudge-up-btn"
                  onClick={() => handleNudge('up')}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-[#1F1F1F] dark:text-[#E3E3E3] hover:bg-[#EEF2F6] dark:hover:bg-[#282A2C] active:scale-95 transition cursor-pointer"
                  title="Move Up"
                  aria-label="Move Up"
                >
                  <ArrowUp className="w-5 h-5 text-[#0B57D0] dark:text-[#A8C7FA]" />
                </button>

                {/* Center / Reset Position */}
                <button
                  type="button"
                  id="nudge-center-btn"
                  onClick={handleCenterPosition}
                  className="px-2 py-1 rounded-lg text-[11px] font-medium text-[#747775] dark:text-[#8E918F] hover:bg-[#EEF2F6] dark:hover:bg-[#282A2C] flex items-center gap-1 transition cursor-pointer"
                  title="Reset to Center"
                  aria-label="Center image"
                >
                  <Crosshair className="w-3.5 h-3.5 text-[#0B57D0] dark:text-[#A8C7FA]" />
                  <span>Center</span>
                </button>

                {/* Down (Brings head/face into frame) */}
                <button
                  type="button"
                  id="nudge-down-btn"
                  onClick={() => handleNudge('down')}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-[#1F1F1F] dark:text-[#E3E3E3] hover:bg-[#EEF2F6] dark:hover:bg-[#282A2C] active:scale-95 transition cursor-pointer"
                  title="Move Down (reveals face/head)"
                  aria-label="Move Down"
                >
                  <ArrowDown className="w-5 h-5 text-[#0B57D0] dark:text-[#A8C7FA]" />
                </button>
              </div>

              {/* Right */}
              <button
                type="button"
                id="nudge-right-btn"
                onClick={() => handleNudge('right')}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-[#1F1F1F] dark:text-[#E3E3E3] hover:bg-[#EEF2F6] dark:hover:bg-[#282A2C] active:scale-95 transition cursor-pointer"
                title="Move Right"
                aria-label="Move Right"
              >
                <ArrowRightIcon className="w-5 h-5 text-[#0B57D0] dark:text-[#A8C7FA]" />
              </button>
            </div>

            {/* Quick Presets & Guides */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {/* Focus Face shortcut for photos */}
              {spec.id === 'photo' && (
                <button
                  type="button"
                  id="quick-focus-face-btn"
                  onClick={handleFocusFace}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#D3E3FD] dark:bg-[#004A77] text-[#041E49] dark:text-[#C2E7FF] hover:opacity-90 active:scale-95 transition cursor-pointer"
                  title="Center head and face inside frame"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Align Face / Head</span>
                </button>
              )}

              {/* Face Guide toggle for photos */}
              {spec.id === 'photo' && (
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer border ${
                    showGuide
                      ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] border-[#0B57D0]/40 dark:border-[#A8C7FA]/40'
                      : 'bg-white dark:bg-[#1E1F20] text-[#747775] dark:text-[#8E918F] border-[#E0E2EC] dark:border-[#282A2C]'
                  }`}
                  title="Toggle Annexure III Face Guide oval"
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  <span>{showGuide ? 'Hide Guide' : 'Show Guide'}</span>
                </button>
              )}

              {/* Hold to compare original */}
              <button
                type="button"
                onMouseDown={() => setShowCompare(true)}
                onMouseUp={() => setShowCompare(false)}
                onTouchStart={() => setShowCompare(true)}
                onTouchEnd={() => setShowCompare(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#444746] dark:text-[#C4C7C5] bg-white dark:bg-[#1E1F20] border border-[#E0E2EC]/60 dark:border-[#282A2C] shadow-2xs hover:bg-[#EEF2F6] dark:hover:bg-[#282A2C] select-none cursor-pointer"
                title="Hold down to preview original uploaded file"
              >
                <Eye className="w-3.5 h-3.5 text-[#0B57D0] dark:text-[#A8C7FA]" />
                <span>Original</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Panel */}
      <div className="p-4 sm:p-6 border-t border-[#E0E2EC]/60 dark:border-[#282A2C] space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
          <button
            id="download-doc-btn"
            type="button"
            onClick={onDownload}
            disabled={!result || isProcessing}
            className="w-full sm:flex-1 py-3 sm:py-3.5 px-6 rounded-full text-sm font-semibold text-white dark:text-[#041E49] bg-[#0B57D0] hover:bg-[#0842A0] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>

          {onNextDocument && (
            <button
              type="button"
              onClick={onNextDocument}
              className="w-full sm:w-auto py-3 sm:py-3.5 px-5 rounded-full text-sm font-medium bg-[#EEF2F6] dark:bg-[#282A2C] hover:bg-[#E0E2EC] dark:hover:bg-[#33353A] text-[#1F1F1F] dark:text-[#E3E3E3] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: {nextDocumentTitle || 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="share-doc-btn"
              type="button"
              onClick={handleShare}
              disabled={!result}
              className="p-3 sm:p-3.5 rounded-full text-[#1F1F1F] dark:text-[#E3E3E3] bg-[#EEF2F6] dark:bg-[#282A2C] hover:bg-[#E0E2EC] dark:hover:bg-[#33353A] transition flex items-center justify-center cursor-pointer flex-1 sm:flex-initial"
              title="Share document"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Advanced Adjustment Tools Collapsible */}
        <div className="pt-2 border-t border-[#E0E2EC]/50 dark:border-[#282A2C]">
          <button
            type="button"
            onClick={() => setShowAdvancedTools(!showAdvancedTools)}
            className="w-full flex items-center justify-between py-1.5 text-xs font-medium text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#0B57D0] dark:text-[#A8C7FA]" />
              <span>Fine-tune image settings</span>
            </span>
            {showAdvancedTools ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvancedTools && (
            <div className="mt-3 p-4 rounded-2xl bg-[#F8FAFD] dark:bg-[#131314] border border-[#E0E2EC]/70 dark:border-[#282A2C] space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D3E3FD] dark:bg-[#004A77] text-[#041E49] dark:text-[#C2E7FF] text-xs font-bold flex items-center justify-center">2</span>
                <div>
                  <p className="text-sm font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">Improve appearance</p>
                  <p className="text-[11px] text-[#747775] dark:text-[#8E918F]">Use only the adjustments your document needs.</p>
                </div>
              </div>

              {/* Enhance ink toggle */}
              {(spec.id === 'signature' || spec.id === 'thumb' || spec.id === 'declaration') && (
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#1E1F20] border border-[#E0E2EC]/60 dark:border-[#282A2C]">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                    <Sparkles className="w-3.5 h-3.5 text-[#0B57D0] dark:text-[#A8C7FA]" />
                    <span>Enhance ink &amp; whiten paper</span>
                  </div>
                  <button
                    id="enhance-ink-toggle"
                    type="button"
                    onClick={() => onOptionsChange({ ...options, enhanceInk: !options.enhanceInk })}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      options.enhanceInk ? 'bg-[#0B57D0] dark:bg-[#A8C7FA]' : 'bg-[#C4C7C5] dark:bg-[#444746]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                        options.enhanceInk
                          ? 'translate-x-5 bg-white dark:bg-[#041E49]'
                          : 'translate-x-0 bg-white'
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Precise Position Sliders (X & Y) */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#1E1F20] border border-[#E0E2EC]/60 dark:border-[#282A2C] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">Fine position</span>
                    <p className="text-[11px] text-[#747775] dark:text-[#8E918F]">Precise horizontal and vertical movement</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCenterPosition}
                    className="text-[11px] text-[#0B57D0] dark:text-[#A8C7FA] hover:underline cursor-pointer"
                  >
                    Reset position
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#747775] dark:text-[#8E918F]">
                      <span>Horizontal (Left / Right)</span>
                      <span className="font-mono">{options.offsetX > 0 ? `+${options.offsetX}` : options.offsetX} px</span>
                    </div>
                    <input
                      type="range"
                      min={-Math.round(spec.targetWidth * 0.8)}
                      max={Math.round(spec.targetWidth * 0.8)}
                      step="2"
                      value={options.offsetX}
                      onChange={(e) => onOptionsChange({ ...options, offsetX: parseInt(e.target.value) })}
                      className="w-full accent-[#0B57D0] dark:accent-[#A8C7FA] h-1.5 bg-[#E0E2EC] dark:bg-[#282A2C] rounded-full cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#747775] dark:text-[#8E918F]">
                      <span>Vertical (Up / Down)</span>
                      <span className="font-mono">{options.offsetY > 0 ? `+${options.offsetY}` : options.offsetY} px</span>
                    </div>
                    <input
                      type="range"
                      min={-Math.round(spec.targetHeight * 0.8)}
                      max={Math.round(spec.targetHeight * 0.8)}
                      step="2"
                      value={options.offsetY}
                      onChange={(e) => onOptionsChange({ ...options, offsetY: parseInt(e.target.value) })}
                      className="w-full accent-[#0B57D0] dark:accent-[#A8C7FA] h-1.5 bg-[#E0E2EC] dark:bg-[#282A2C] rounded-full cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Rotate & Zoom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between"><span className="text-xs font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">Scale</span><span className="text-[11px] text-[#747775] dark:text-[#8E918F]">{Math.round(options.zoom * 100)}%</span></div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleZoom(-0.1)}
                      className="p-1.5 rounded-full bg-white dark:bg-[#1E1F20] text-[#444746] dark:text-[#C4C7C5] border border-[#E0E2EC] dark:border-[#282A2C] cursor-pointer"
                      title="Zoom out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.05"
                      value={options.zoom}
                      onChange={(e) => onOptionsChange({ ...options, zoom: parseFloat(e.target.value) })}
                      className="w-full accent-[#0B57D0] dark:accent-[#A8C7FA] h-2 bg-[#E0E2EC] dark:bg-[#282A2C] rounded-full cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => handleZoom(0.1)}
                      className="p-1.5 rounded-full bg-white dark:bg-[#1E1F20] text-[#444746] dark:text-[#C4C7C5] border border-[#E0E2EC] dark:border-[#282A2C] cursor-pointer"
                      title="Zoom in"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">Rotation</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRotate}
                      className="flex-1 py-1.5 px-3 rounded-full text-xs font-medium bg-white dark:bg-[#1E1F20] border border-[#E0E2EC] dark:border-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] hover:bg-[#EEF2F6] dark:hover:bg-[#282A2C] transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-[#0B57D0] dark:text-[#A8C7FA]" />
                      <span>Rotate 90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetAll}
                      className="py-1.5 px-3 rounded-full text-xs font-medium text-[#747775] dark:text-[#8E918F] hover:bg-[#EEF2F6] dark:hover:bg-[#282A2C] transition cursor-pointer"
                    >
                      Reset All
                    </button>
                  </div>
                </div>
              </div>

              {/* Brightness / Contrast */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#747775] dark:text-[#8E918F]"><span>Brightness</span><span>{options.brightness > 0 ? '+' : ''}{options.brightness}</span></div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    step="2"
                    value={options.brightness}
                    onChange={(e) => onOptionsChange({ ...options, brightness: parseInt(e.target.value) })}
                    className="w-full accent-[#0B57D0] dark:accent-[#A8C7FA] h-1.5 bg-[#E0E2EC] dark:bg-[#282A2C] rounded-full cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#747775] dark:text-[#8E918F]"><span>Contrast</span><span>{options.contrast > 0 ? '+' : ''}{options.contrast}</span></div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    step="2"
                    value={options.contrast}
                    onChange={(e) => onOptionsChange({ ...options, contrast: parseInt(e.target.value) })}
                    className="w-full accent-[#0B57D0] dark:accent-[#A8C7FA] h-1.5 bg-[#E0E2EC] dark:bg-[#282A2C] rounded-full cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
