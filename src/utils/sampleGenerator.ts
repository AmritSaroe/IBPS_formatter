import { DocumentTypeId } from '../types';

/**
 * Generates a realistic sample image as a File object for testing each document type.
 */
export async function generateSampleDocument(type: DocumentTypeId): Promise<File> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  switch (type) {
    case 'photo': {
      // 600 x 750 px source photo
      canvas.width = 600;
      canvas.height = 750;

      // Soft light background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 750);
      bgGrad.addColorStop(0, '#FFFFFF');
      bgGrad.addColorStop(1, '#F1F5F9');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 600, 750);

      // Shoulders / Suit
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.ellipse(300, 680, 240, 160, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shirt collar
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(270, 520);
      ctx.lineTo(300, 620);
      ctx.lineTo(330, 520);
      ctx.closePath();
      ctx.fill();

      // Neck
      ctx.fillStyle = '#ECC9A8';
      ctx.fillRect(265, 430, 70, 110);

      // Head / Face
      ctx.beginPath();
      ctx.ellipse(300, 340, 115, 145, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ECC9A8';
      ctx.fill();

      // Hair
      ctx.beginPath();
      ctx.ellipse(300, 240, 125, 80, 0, 0, Math.PI);
      ctx.fillStyle = '#262626';
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#262626';
      ctx.beginPath();
      ctx.ellipse(260, 335, 10, 6, 0, 0, Math.PI * 2);
      ctx.ellipse(340, 335, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyebrows
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#262626';
      ctx.beginPath();
      ctx.moveTo(245, 318);
      ctx.lineTo(275, 318);
      ctx.moveTo(325, 318);
      ctx.lineTo(355, 318);
      ctx.stroke();

      // Nose
      ctx.strokeStyle = '#D4A373';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(300, 330);
      ctx.lineTo(300, 370);
      ctx.lineTo(308, 375);
      ctx.stroke();

      // Smile
      ctx.strokeStyle = '#9D0208';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(300, 400, 25, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      break;
    }

    case 'signature': {
      // 500 x 250 px white paper
      canvas.width = 500;
      canvas.height = 250;

      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(0, 0, 500, 250);

      // Black ink signature
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(70, 140);
      ctx.bezierCurveTo(90, 80, 120, 70, 130, 135);
      ctx.bezierCurveTo(140, 170, 150, 170, 170, 120);
      ctx.bezierCurveTo(180, 100, 210, 160, 230, 130);
      ctx.bezierCurveTo(250, 110, 280, 150, 310, 125);
      ctx.bezierCurveTo(340, 110, 380, 165, 410, 135);
      ctx.stroke();

      // Underline stroke with dot
      ctx.beginPath();
      ctx.moveTo(90, 175);
      ctx.lineTo(410, 175);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(430, 175, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#0F172A';
      ctx.fill();

      break;
    }

    case 'thumb': {
      // 400 x 400 px
      canvas.width = 400;
      canvas.height = 400;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 400, 400);

      // Draw blue biometric thumb impression ridges
      ctx.strokeStyle = '#1D4ED8';
      ctx.lineWidth = 2.5;

      for (let r = 20; r < 140; r += 10) {
        ctx.beginPath();
        ctx.ellipse(200, 200, r * 0.75, r, 0.05, 0, Math.PI * 2);
        ctx.stroke();
      }

      break;
    }

    case 'declaration': {
      // 1000 x 500 px
      canvas.width = 1000;
      canvas.height = 500;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 1000, 500);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'italic 26px serif';
      ctx.fillText(
        '“I, Rahul Sharma, hereby declare that all the',
        70,
        140
      );
      ctx.fillText(
        'information submitted by me in the application form is',
        70,
        200
      );
      ctx.fillText(
        'correct, true and valid. I will submit the supporting',
        70,
        260
      );
      ctx.fillText('documents as and when required.”', 70, 320);

      // Signature below
      ctx.font = 'italic 22px cursive';
      ctx.fillText('Rahul Sharma', 680, 400);

      break;
    }

    case 'certificate': {
      // A4 ratio 800 x 1131 px
      canvas.width = 800;
      canvas.height = 1131;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 800, 1131);

      // Border
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, 740, 1071);

      ctx.strokeStyle = '#93C5FD';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, 720, 1051);

      // Header
      ctx.fillStyle = '#1E3A8A';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CENTRAL BOARD OF SECONDARY EDUCATION', 400, 120);

      ctx.fillStyle = '#475569';
      ctx.font = '18px sans-serif';
      ctx.fillText('SECONDARY SCHOOL EXAMINATION (CLASS X) 2024', 400, 160);
      ctx.fillText('MARKS STATEMENT & PASS CERTIFICATE', 400, 195);

      // Student info
      ctx.textAlign = 'left';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText('Candidate Name: RAHUL SHARMA', 80, 270);
      ctx.fillText('Roll No: 12485923', 80, 310);
      ctx.fillText('School: DELHI PUBLIC SCHOOL', 80, 350);

      // Table lines
      ctx.strokeRect(80, 400, 640, 380);
      ctx.beginPath();
      ctx.moveTo(80, 450);
      ctx.lineTo(720, 450);
      ctx.stroke();

      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('SUBJECT', 110, 435);
      ctx.fillText('MARKS', 360, 435);
      ctx.fillText('GRADE', 580, 435);

      const subjects = [
        ['ENGLISH COMMUNICATIVE', '92', 'A1'],
        ['MATHEMATICS STANDARD', '95', 'A1'],
        ['SCIENCE', '88', 'A2'],
        ['SOCIAL SCIENCE', '91', 'A1'],
        ['HINDI COURSE - A', '89', 'A2'],
      ];

      ctx.font = '16px sans-serif';
      subjects.forEach((sub, i) => {
        const y = 490 + i * 50;
        ctx.fillText(sub[0], 110, y);
        ctx.fillText(sub[1], 370, y);
        ctx.fillText(sub[2], 590, y);
      });

      // Result Stamp
      ctx.fillStyle = '#15803D';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('RESULT: PASSED', 80, 850);

      break;
    }
  }

  const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), 'image/jpeg', 0.92));
  if (!blob) throw new Error('Failed to generate sample blob');

  return new File([blob], `sample_${type}.jpg`, { type: 'image/jpeg' });
}
