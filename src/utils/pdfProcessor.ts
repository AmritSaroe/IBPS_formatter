import { jsPDF } from 'jspdf';
import { DocumentSpecification, ConvertedResult } from '../types';
import { loadImage } from './imageProcessor';

/**
 * Converts a student certificate image (e.g. 10th marksheet, UDID, category certificate)
 * into a standardized A4 PDF strictly under 500 KB.
 */
export async function processCertificateToPdf(
  fileOrImage: File | HTMLImageElement,
  spec: DocumentSpecification
): Promise<ConvertedResult> {
  let imgElement: HTMLImageElement;

  if (fileOrImage instanceof HTMLImageElement) {
    imgElement = fileOrImage;
  } else {
    imgElement = await loadImage(fileOrImage);
  }

  const origWidth = imgElement.naturalWidth || imgElement.width;
  const origHeight = imgElement.naturalHeight || imgElement.height;

  // A4 dimensions in mm
  const a4WidthMm = 210;
  const a4HeightMm = 297;
  const isLandscape = origWidth > origHeight;

  // Calculate target pixel dimensions for 150-200 DPI on A4 (sharp yet compact)
  // Max dimension ~ 1600px keeps PDF under 500 KB while remaining crisp to read
  const maxDim = 1600;
  let targetW = origWidth;
  let targetH = origHeight;

  if (origWidth > maxDim || origHeight > maxDim) {
    if (origWidth > origHeight) {
      targetW = maxDim;
      targetH = Math.round((origHeight * maxDim) / origWidth);
    } else {
      targetH = maxDim;
      targetW = Math.round((origWidth * maxDim) / origHeight);
    }
  }

  // Draw scaled image to offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetW, targetH);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(imgElement, 0, 0, targetW, targetH);

  // Binary search compression quality to produce a PDF under 500 KB (target ~ 250 - 400 KB)
  let bestPdfBlob: Blob | null = null;
  let low = 0.5;
  let high = 0.92;
  const maxBytes = 500 * 1024;

  for (let step = 0; step < 5; step++) {
    const q = (low + high) / 2;
    const imgJpegDataUrl = canvas.toDataURL('image/jpeg', q);

    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = isLandscape ? a4HeightMm : a4WidthMm;
    const pageHeight = isLandscape ? a4WidthMm : a4HeightMm;

    // Fit image inside A4 with 5mm margin
    const margin = 5;
    const availWidth = pageWidth - margin * 2;
    const availHeight = pageHeight - margin * 2;

    const imgAspect = targetW / targetH;
    const availAspect = availWidth / availHeight;

    let renderW = availWidth;
    let renderH = availHeight;

    if (imgAspect > availAspect) {
      renderW = availWidth;
      renderH = availWidth / imgAspect;
    } else {
      renderH = availHeight;
      renderW = availHeight * imgAspect;
    }

    const posX = margin + (availWidth - renderW) / 2;
    const posY = margin + (availHeight - renderH) / 2;

    pdf.addImage(imgJpegDataUrl, 'JPEG', posX, posY, renderW, renderH, undefined, 'FAST');
    const pdfBlob = pdf.output('blob');

    if (pdfBlob.size <= maxBytes) {
      bestPdfBlob = pdfBlob;
      low = q; // try higher quality
    } else {
      high = q; // too large, compress more
    }
  }

  if (!bestPdfBlob) {
    // Fallback at lower quality
    const imgJpegDataUrl = canvas.toDataURL('image/jpeg', 0.5);
    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    pdf.addImage(imgJpegDataUrl, 'JPEG', 5, 5, a4WidthMm - 10, a4HeightMm - 10, undefined, 'FAST');
    bestPdfBlob = pdf.output('blob');
  }

  const finalSizeKb = Number((bestPdfBlob.size / 1024).toFixed(1));
  const dataUrl = URL.createObjectURL(bestPdfBlob);

  const validationMessages: ConvertedResult['validationMessages'] = [
    {
      type: 'success',
      text: 'Format: PDF (.pdf) format'
    },
    {
      type: 'success',
      text: 'Page Size: A4 Standard (210mm × 297mm)'
    },
    {
      type: finalSizeKb <= 500 ? 'success' : 'error',
      text: `File Size: ${finalSizeKb} KB (${finalSizeKb <= 500 ? 'Within limit ≤ 500 KB' : 'Exceeds 500 KB limit'})`
    }
  ];

  return {
    docTypeId: 'certificate',
    blob: bestPdfBlob,
    dataUrl,
    fileName: `certificate_a4_${Math.round(finalSizeKb)}kb.pdf`,
    fileSizeBytes: bestPdfBlob.size,
    fileSizeKb: finalSizeKb,
    width: Math.round(a4WidthMm * 3.7795),
    height: Math.round(a4HeightMm * 3.7795),
    format: 'pdf',
    isValid: finalSizeKb <= 500,
    validationMessages
  };
}
