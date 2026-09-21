export type DocumentTypeId = 'photo' | 'signature' | 'thumb' | 'declaration' | 'certificate';

export interface DocumentSpecification {
  id: DocumentTypeId;
  title: string;
  subtitle: string;
  description: string;
  outputFormat: 'jpg' | 'pdf';
  targetWidth: number; // in pixels
  targetHeight: number; // in pixels
  aspectRatio: number; // width / height
  physicalSize?: string;
  dpi?: number;
  minSizeKb: number;
  maxSizeKb: number;
  idealSizeKb: number;
  inkRequirement?: string;
  backgroundRequirement?: string;
  importantNotes: string[];
  dos: string[];
  donts: string[];
}

export interface ProcessingOptions {
  zoom: number; // 0.5 to 3
  rotation: number; // 0, 90, 180, 270
  offsetX: number;
  offsetY: number;
  brightness: number; // -50 to +50
  contrast: number; // -50 to +50
  enhanceInk: boolean; // Cleans paper to pure white and sharpens ink (great for signature & thumb)
  targetKb?: number; // custom override within allowed range
}

export interface ConvertedResult {
  docTypeId: DocumentTypeId;
  blob: Blob;
  dataUrl: string;
  fileName: string;
  fileSizeBytes: number;
  fileSizeKb: number;
  width: number;
  height: number;
  format: 'jpg' | 'pdf';
  isValid: boolean;
  validationMessages: {
    type: 'success' | 'warning' | 'error';
    text: string;
  }[];
}

export interface BatchItem {
  id: DocumentTypeId;
  file: File | null;
  result: ConvertedResult | null;
  status: 'empty' | 'uploaded' | 'processing' | 'ready' | 'error';
  error?: string;
}
