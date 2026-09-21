import { DocumentSpecification, DocumentTypeId } from '../types';

export const OFFICIAL_DOCUMENTS: Record<DocumentTypeId, DocumentSpecification> = {
  photo: {
    id: 'photo',
    title: 'Passport Photograph',
    subtitle: '4.5cm × 3.5cm (20–50 KB)',
    description: 'Recent passport style colour picture with light/white background.',
    outputFormat: 'jpg',
    targetWidth: 200,
    targetHeight: 230,
    aspectRatio: 200 / 230,
    physicalSize: '4.5cm × 3.5cm',
    minSizeKb: 20,
    maxSizeKb: 50,
    idealSizeKb: 38,
    backgroundRequirement: 'Light-coloured, preferably white background',
    importantNotes: [
      'Dimensions must be 200 × 230 pixels (preferred).',
      'File size strictly between 20 KB and 50 KB.',
      'Must be in color, taken against a light-coloured/white background.',
      'Look straight at the camera with a relaxed face.',
      'Caps, hats and dark sunglasses are strictly not acceptable.'
    ],
    dos: [
      'Ensure photo is captured against a light-coloured, preferably white background.',
      'Ensure adequate lighting with no harsh shadows or red-eye.',
      'Look straight at the camera/webcam with relaxed face.',
      'If wearing glasses, ensure clear visibility without flash reflections.'
    ],
    donts: [
      'Do not wear colored glasses, sunglasses or caps/hats.',
      'Do not upload small, blurry, or low-resolution pictures.',
      'No shadow on face, tilted angles, or distorted face/masks.',
      'Do not take photo in dark or improper background.'
    ]
  },
  signature: {
    id: 'signature',
    title: 'Candidate Signature',
    subtitle: '140 × 60 px (10–20 KB)',
    description: 'Sign on white paper with Black Ink pen. Do NOT sign in capital letters.',
    outputFormat: 'jpg',
    targetWidth: 140,
    targetHeight: 60,
    aspectRatio: 140 / 60,
    minSizeKb: 10,
    maxSizeKb: 20,
    idealSizeKb: 15,
    inkRequirement: 'Black Ink pen on white paper',
    importantNotes: [
      'Dimensions must be 140 × 60 pixels (preferred).',
      'File size strictly between 10 KB and 20 KB.',
      'Signature in CAPITAL LETTERS is strictly rejected.',
      'Must be signed by the applicant only (not by anyone else).'
    ],
    dos: [
      'Sign clearly on clean white paper using a black ink pen.',
      'Crop tight around the signature to remove unnecessary borders.',
      'Ensure signature matches the one you will make in exam hall/call letter.'
    ],
    donts: [
      'DO NOT sign in capital letters (ALL CAPS is rejected).',
      'Do not use pencil, light blue, or gel ink that bleeds.',
      'Avoid smudged, faint, or cut-off signatures.'
    ]
  },
  thumb: {
    id: 'thumb',
    title: 'Left Thumb Impression',
    subtitle: '3cm × 3cm / 240 × 240 px (20–50 KB)',
    description: 'Clear left thumb impression on white paper with black or blue ink.',
    outputFormat: 'jpg',
    targetWidth: 240,
    targetHeight: 240,
    aspectRatio: 1,
    physicalSize: '3 cm × 3 cm (200 DPI)',
    dpi: 200,
    minSizeKb: 20,
    maxSizeKb: 50,
    idealSizeKb: 35,
    inkRequirement: 'Black or Blue ink pad on white paper',
    importantNotes: [
      'Dimensions: 240 × 240 pixels in 200 DPI (3 cm × 3 cm).',
      'File size strictly between 20 KB and 50 KB.',
      'Must use Left Thumb (exceptions permitted if thumb missing, see rules).'
    ],
    dos: [
      'Put left thumb impression on clean white paper with clear ridge lines visible.',
      'Use good quality black or blue ink pad with moderate pressure.',
      'Keep background clean and crop to the impression bounds.'
    ],
    donts: [
      'Avoid excessively wet ink that creates an unreadable blob.',
      'Do not smudge or move thumb while imprinting.',
      'Avoid faint impressions where ridge lines are not discernible.'
    ]
  },
  declaration: {
    id: 'declaration',
    title: 'Hand-written Declaration',
    subtitle: '10cm × 5cm / 800 × 400 px (50–100 KB)',
    description: 'Written in candidate’s own handwriting in English only with black ink.',
    outputFormat: 'jpg',
    targetWidth: 800,
    targetHeight: 400,
    aspectRatio: 800 / 400,
    physicalSize: '10 cm × 5 cm (200 DPI)',
    dpi: 200,
    minSizeKb: 50,
    maxSizeKb: 100,
    idealSizeKb: 75,
    inkRequirement: 'Black ink pen on white paper',
    importantNotes: [
      'Dimensions: 800 × 400 pixels in 200 DPI (10 cm × 5 cm).',
      'File size strictly between 50 KB and 100 KB.',
      'Must be written in candidate’s own handwriting in English only.',
      'The text should strictly NOT BE IN CAPITAL LETTERS.'
    ],
    dos: [
      'Write on clean, unlined white paper with black ink pen.',
      'Follow the exact official statement text without alterations.',
      'Fill in your full official name inside the declaration.'
    ],
    donts: [
      'DO NOT write in ALL CAPITAL LETTERS.',
      'Do not get it written by another person (application will be disqualified).',
      'Do not write in Hindi or regional languages (English only required).'
    ]
  },
  certificate: {
    id: 'certificate',
    title: 'Certificate / 10th Marksheet',
    subtitle: 'A4 Page Size, PDF format (≤ 500 KB)',
    description: 'SSC/10th certificate, UDID, or category certificate in A4 PDF format.',
    outputFormat: 'pdf',
    targetWidth: 1240, // A4 at 150 DPI approx
    targetHeight: 1754,
    aspectRatio: 1240 / 1754,
    physicalSize: 'A4 standard sheet',
    minSizeKb: 20,
    maxSizeKb: 500,
    idealSizeKb: 300,
    importantNotes: [
      'Document MUST be in PDF format.',
      'Page size must strictly be A4.',
      'File size should NOT exceed 500 KB.',
      'Must be clear, properly oriented, and completely readable.'
    ],
    dos: [
      'Ensure the entire document border and all marks/text are visible.',
      'Ensure proper upright orientation (not rotated sideways).',
      'File format must be .pdf.'
    ],
    donts: [
      'Do not exceed 500 KB file size.',
      'Do not upload blurry scans where roll number or grades cannot be read.',
      'Do not upload JPG/PNG for certificate uploads (PDF only is accepted).'
    ]
  }
};

export const OFFICIAL_DECLARATION_TEXT = `“I, ________________ (Name of the candidate), hereby declare that all the information submitted by me in the application form is correct, true and valid. I will submit the supporting documents as and when required.”`;

export const OFFICIAL_SCANNER_GUIDELINES = [
  {
    title: 'Scanner DPI Setting',
    value: 'Minimum 200 DPI',
    description: 'Ensures clear legibility for thumb ridge lines, signatures, and certificates.'
  },
  {
    title: 'Colour Mode',
    value: 'True Colour (24-bit)',
    description: 'Required for photos and coloured certificate stamps.'
  },
  {
    title: 'Cropping',
    value: 'Edge-to-edge Cropping',
    description: 'Crop to the border of the photograph, signature, or impression before upload.'
  },
  {
    title: 'Output Format',
    value: 'JPG/JPEG for Photos & Signatures, PDF for Certificates',
    description: 'Strict format validation enforced by online exam portals.'
  }
];
