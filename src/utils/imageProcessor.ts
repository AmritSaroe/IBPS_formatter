import { DocumentSpecification, ProcessingOptions, ConvertedResult } from '../types';

/**
 * Loads an image from a File or Data URL into an HTMLImageElement
 */
export function loadImage(src: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e));

    if (typeof src === 'string') {
      img.src = src;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(src);
    }
  });
}

/**
 * Pads a JPEG binary buffer safely with valid standard JPEG COM (comment) markers
 * so that the file size meets strict minimum KB requirements (e.g., 10 KB for signature, 20 KB for photo)
 * without corrupting the image structure.
 */
export async function padJpegToTargetSize(blob: Blob, targetSizeBytes: number): Promise<Blob> {
  if (blob.size >= targetSizeBytes) {
    return blob;
  }

  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Verify JPEG SOI marker (0xFF, 0xD8)
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return blob;
  }

  const neededPadding = targetSizeBytes - blob.size;
  if (neededPadding <= 0) return blob;

  // Each JPEG COM segment can hold up to 65533 bytes (marker is 2 bytes 0xFF, 0xFE, length is 2 bytes)
  const segments: Uint8Array[] = [];
  let remaining = neededPadding;

  while (remaining > 0) {
    const segmentPayload = Math.min(remaining - 4, 65530);
    if (segmentPayload <= 0) {
      // Small remaining chunk
      const length = remaining;
      const seg = new Uint8Array(length);
      seg[0] = 0xff;
      seg[1] = 0xfe; // COM marker
      seg[2] = (length - 2) >> 8;
      seg[3] = (length - 2) & 0xff;
      for (let i = 4; i < length; i++) seg[i] = 0x20; // Space filler
      segments.push(seg);
      break;
    } else {
      const length = segmentPayload + 2; // length field includes itself (2 bytes)
      const seg = new Uint8Array(length + 2); // +2 for 0xFF 0xFE
      seg[0] = 0xff;
      seg[1] = 0xfe;
      seg[2] = length >> 8;
      seg[3] = length & 0xff;
      for (let i = 4; i < seg.length; i++) seg[i] = 0x20;
      segments.push(seg);
      remaining -= seg.length;
    }
  }

  // Insert comment segments right after SOI marker (offset 2)
  const totalLength = bytes.length + segments.reduce((sum, s) => sum + s.length, 0);
  const result = new Uint8Array(totalLength);

  // Copy SOI (0xFF 0xD8)
  result[0] = bytes[0];
  result[1] = bytes[1];

  let writePos = 2;
  for (const seg of segments) {
    result.set(seg, writePos);
    writePos += seg.length;
  }

  // Copy remaining original JPEG data
  result.set(bytes.subarray(2), writePos);

  return new Blob([result], { type: 'image/jpeg' });
}

/**
 * Applies brightness, contrast, and optional ink enhancement to imageData in-place
 */
function applyImageAdjustments(
  imageData: ImageData,
  options: { brightness: number; contrast: number; enhanceInk: boolean }
) {
  const { brightness, contrast, enhanceInk } = options;
  const data = imageData.data;
  const len = data.length;

  // Contrast factor (-50 to +50)
  const factor = (259 * (contrast * 2 + 255)) / (255 * (259 - contrast * 2));
  const b = brightness * 1.8;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let bl = data[i + 2];

    // 1. Apply brightness & contrast
    if (contrast !== 0 || brightness !== 0) {
      r = Math.min(255, Math.max(0, factor * (r - 128) + 128 + b));
      g = Math.min(255, Math.max(0, factor * (g - 128) + 128 + b));
      bl = Math.min(255, Math.max(0, factor * (bl - 128) + 128 + b));
    }

    // 2. Ink enhancement (for signatures & thumb impressions on paper)
    if (enhanceInk) {
      // Calculate grayscale brightness
      const lum = 0.299 * r + 0.587 * g + 0.114 * bl;

      // Paper background whitening threshold
      if (lum > 175) {
        // Smoothly clamp lighter paper pixels to pure white
        const blend = (lum - 175) / (255 - 175);
        r = Math.min(255, r + (255 - r) * blend);
        g = Math.min(255, g + (255 - g) * blend);
        bl = Math.min(255, bl + (255 - bl) * blend);
      } else if (lum < 140) {
        // Deepen and sharpen dark ink lines
        const darkFactor = 0.75;
        r = r * darkFactor;
        g = g * darkFactor;
        bl = bl * darkFactor;
      }
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = bl;
  }
}

/**
 * Converts and resizes an image exactly according to official exam specs
 */
export async function processImageDocument(
  sourceImage: HTMLImageElement,
  spec: DocumentSpecification,
  options: ProcessingOptions
): Promise<ConvertedResult> {
  const { targetWidth, targetHeight, minSizeKb, maxSizeKb, idealSizeKb } = spec;

  // Create primary off-screen canvas at exact target dimensions
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas 2D context is not supported');
  }

  // Clear with solid white background (as required by specifications)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  ctx.save();

  // Translate to center of canvas
  ctx.translate(targetWidth / 2 + options.offsetX, targetHeight / 2 + options.offsetY);

  // Rotation
  if (options.rotation !== 0) {
    ctx.rotate((options.rotation * Math.PI) / 180);
  }

  // Calculate cover scaling
  const imgWidth = sourceImage.naturalWidth || sourceImage.width;
  const imgHeight = sourceImage.naturalHeight || sourceImage.height;

  // Determine aspect ratio fit
  const scaleToFitWidth = targetWidth / imgWidth;
  const scaleToFitHeight = targetHeight / imgHeight;
  // Use cover strategy as base
  const baseScale = Math.max(scaleToFitWidth, scaleToFitHeight);
  const finalScale = baseScale * (options.zoom || 1);

  const drawW = imgWidth * finalScale;
  const drawH = imgHeight * finalScale;

  // Smooth rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(sourceImage, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  // Apply pixel adjustments (brightness, contrast, ink enhancement)
  if (options.brightness !== 0 || options.contrast !== 0 || options.enhanceInk) {
    const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    applyImageAdjustments(imgData, {
      brightness: options.brightness,
      contrast: options.contrast,
      enhanceInk: options.enhanceInk
    });
    ctx.putImageData(imgData, 0, 0);
  }

  // Compress to JPEG targeting within [minSizeKb, maxSizeKb]
  // Target sweet spot is idealSizeKb or midway between min and max
  const targetSweetSpotKb = options.targetKb || idealSizeKb || (minSizeKb + maxSizeKb) / 2;
  const minBytes = minSizeKb * 1024;
  const maxBytes = maxSizeKb * 1024;
  const targetSweetBytes = targetSweetSpotKb * 1024;

  let bestBlob: Blob | null = null;
  let bestQuality = 0.88;

  // Binary search quality between 0.40 and 0.98 to get as close to targetSweetBytes without exceeding maxBytes
  let low = 0.4;
  let high = 0.98;

  for (let step = 0; step < 7; step++) {
    const q = (low + high) / 2;
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), 'image/jpeg', q)
    );

    if (!blob) break;

    if (blob.size <= maxBytes) {
      bestBlob = blob;
      bestQuality = q;
      // If within target range, try higher quality if room allows
      if (blob.size < targetSweetBytes) {
        low = q;
      } else {
        high = q;
      }
    } else {
      // Over maximum size, reduce quality
      high = q;
    }
  }

  // If still not generated, take fallback
  if (!bestBlob) {
    bestBlob = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), 'image/jpeg', 0.65)
    );
  }

  if (!bestBlob) {
    throw new Error('Failed to generate image blob');
  }

  // Check if file size is below minSizeKb (very common for small 140x60 signatures or clean backgrounds)
  let finalBlob = bestBlob;
  if (finalBlob.size < minBytes) {
    // Pad safely to target sweet spot size
    finalBlob = await padJpegToTargetSize(finalBlob, Math.round((minBytes + targetSweetBytes) / 2));
  }

  // Prepare result & validation checks
  const finalSizeKb = Number((finalBlob.size / 1024).toFixed(1));
  const dataUrl = URL.createObjectURL(finalBlob);

  const validationMessages: ConvertedResult['validationMessages'] = [];
  let isValid = true;

  // Check dimensions
  validationMessages.push({
    type: 'success',
    text: `Dimensions: ${targetWidth} × ${targetHeight} px (Exact match for ${spec.title})`
  });

  // Check file size bounds
  if (finalSizeKb >= minSizeKb && finalSizeKb <= maxSizeKb) {
    validationMessages.push({
      type: 'success',
      text: `File Size: ${finalSizeKb} KB (Within allowed ${minSizeKb} KB – ${maxSizeKb} KB)`
    });
  } else if (finalSizeKb < minSizeKb) {
    validationMessages.push({
      type: 'warning',
      text: `File Size: ${finalSizeKb} KB is below ${minSizeKb} KB minimum required.`
    });
    isValid = false;
  } else {
    validationMessages.push({
      type: 'error',
      text: `File Size: ${finalSizeKb} KB exceeds ${maxSizeKb} KB maximum limit.`
    });
    isValid = false;
  }

  // Format check
  validationMessages.push({
    type: 'success',
    text: `Format: JPEG (.jpg) standard colour image`
  });

  const fileName = `${spec.id}_${targetWidth}x${targetHeight}_${Math.round(finalSizeKb)}kb.jpg`;

  return {
    docTypeId: spec.id,
    blob: finalBlob,
    dataUrl,
    fileName,
    fileSizeBytes: finalBlob.size,
    fileSizeKb: finalSizeKb,
    width: targetWidth,
    height: targetHeight,
    format: 'jpg',
    isValid,
    validationMessages
  };
}
