import jsPDF from 'jspdf';

interface CertificateData {
  userName: string;
  testTitle: string;
  subjectName: string;
  percentage: number;
  completedAt: string;
  certificateId: string;
}

export const generateCertificatePDF = (data: CertificateData): jsPDF => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Rich gradient background simulation with multiple layers
  // Base dark background
  doc.setFillColor(10, 15, 30);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Gradient overlay from purple to blue
  for (let i = 0; i < 50; i++) {
    const r = Math.floor(99 + (139 - 99) * (i / 50));
    const g = Math.floor(102 + (92 - 102) * (i / 50));
    const b = Math.floor(241 + (246 - 241) * (i / 50));
    doc.setFillColor(r, g, b);
    doc.circle(pageWidth * 0.8, pageHeight * 0.3, 80 - i, 'F');
  }

  // Secondary gradient orb
  for (let i = 0; i < 40; i++) {
    doc.setFillColor(59 + i, 130 - i, 246 - i * 2);
    doc.circle(pageWidth * 0.15, pageHeight * 0.75, 60 - i, 'F');
  }

  // Decorative pattern - top corner geometric shapes
  doc.setFillColor(139, 92, 246);
  for (let i = 0; i < 8; i++) {
    doc.circle(20 + i * 15, 25, 3, 'F');
    doc.circle(pageWidth - 20 - i * 15, 25, 3, 'F');
  }

  // Outer decorative border with gradient effect
  const borderColors = [
    [139, 92, 246],   // Purple
    [99, 102, 241],   // Indigo
    [59, 130, 246],   // Blue
  ];
  
  for (let i = 0; i < 3; i++) {
    doc.setDrawColor(borderColors[i][0], borderColors[i][1], borderColors[i][2]);
    doc.setLineWidth(2 - i * 0.5);
    doc.roundedRect(8 + i * 4, 8 + i * 4, pageWidth - 16 - i * 8, pageHeight - 16 - i * 8, 5, 5);
  }

  // Corner flourishes
  const cornerSize = 25;
  const cornerOffset = 12;
  
  // Gradient corners
  doc.setFillColor(139, 92, 246);
  
  // Top left corner decoration
  doc.triangle(cornerOffset, cornerOffset, cornerOffset + cornerSize, cornerOffset, cornerOffset, cornerOffset + cornerSize, 'F');
  doc.setFillColor(99, 102, 241);
  doc.triangle(cornerOffset + 5, cornerOffset + 5, cornerOffset + cornerSize - 5, cornerOffset + 5, cornerOffset + 5, cornerOffset + cornerSize - 5, 'F');
  
  // Top right corner decoration
  doc.setFillColor(139, 92, 246);
  doc.triangle(pageWidth - cornerOffset, cornerOffset, pageWidth - cornerOffset - cornerSize, cornerOffset, pageWidth - cornerOffset, cornerOffset + cornerSize, 'F');
  doc.setFillColor(99, 102, 241);
  doc.triangle(pageWidth - cornerOffset - 5, cornerOffset + 5, pageWidth - cornerOffset - cornerSize + 5, cornerOffset + 5, pageWidth - cornerOffset - 5, cornerOffset + cornerSize - 5, 'F');
  
  // Bottom left corner decoration
  doc.setFillColor(139, 92, 246);
  doc.triangle(cornerOffset, pageHeight - cornerOffset, cornerOffset + cornerSize, pageHeight - cornerOffset, cornerOffset, pageHeight - cornerOffset - cornerSize, 'F');
  doc.setFillColor(99, 102, 241);
  doc.triangle(cornerOffset + 5, pageHeight - cornerOffset - 5, cornerOffset + cornerSize - 5, pageHeight - cornerOffset - 5, cornerOffset + 5, pageHeight - cornerOffset - cornerSize + 5, 'F');
  
  // Bottom right corner decoration
  doc.setFillColor(139, 92, 246);
  doc.triangle(pageWidth - cornerOffset, pageHeight - cornerOffset, pageWidth - cornerOffset - cornerSize, pageHeight - cornerOffset, pageWidth - cornerOffset, pageHeight - cornerOffset - cornerSize, 'F');
  doc.setFillColor(99, 102, 241);
  doc.triangle(pageWidth - cornerOffset - 5, pageHeight - cornerOffset - 5, pageWidth - cornerOffset - cornerSize + 5, pageHeight - cornerOffset - 5, pageWidth - cornerOffset - 5, pageHeight - cornerOffset - cornerSize + 5, 'F');

  // Diamond decorations on sides
  const drawDiamond = (x: number, y: number, size: number) => {
    doc.setFillColor(139, 92, 246);
    const points = [
      { x: x, y: y - size },
      { x: x + size, y: y },
      { x: x, y: y + size },
      { x: x - size, y: y },
    ];
    doc.triangle(points[0].x, points[0].y, points[1].x, points[1].y, points[3].x, points[3].y, 'F');
    doc.triangle(points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y, 'F');
  };

  drawDiamond(pageWidth / 2, 18, 4);
  drawDiamond(pageWidth / 2, pageHeight - 18, 4);

  // Logo/Brand area with glow effect
  doc.setFillColor(139, 92, 246);
  doc.circle(pageWidth / 2, 40, 15, 'F');
  doc.setFillColor(99, 102, 241);
  doc.circle(pageWidth / 2, 40, 12, 'F');
  doc.setFillColor(59, 130, 246);
  doc.circle(pageWidth / 2, 40, 9, 'F');
  
  // Brand name in circle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('T', pageWidth / 2, 44, { align: 'center' });

  // TESTLIX brand text
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(139, 92, 246);
  doc.text('TESTLIX', pageWidth / 2, 62, { align: 'center' });

  // Decorative line under brand
  doc.setDrawColor(139, 92, 246);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 30, 66, pageWidth / 2 + 30, 66);
  doc.setDrawColor(99, 102, 241);
  doc.line(pageWidth / 2 - 20, 68, pageWidth / 2 + 20, 68);

  // Main certificate title with shadow effect
  doc.setFontSize(38);
  doc.setFont('helvetica', 'bold');
  
  // Shadow layer
  doc.setTextColor(60, 60, 80);
  doc.text('СЕРТИФИКАТ', pageWidth / 2 + 1, 86, { align: 'center' });
  
  // Main text
  doc.setTextColor(139, 92, 246);
  doc.text('СЕРТИФИКАТ', pageWidth / 2, 85, { align: 'center' });

  // Subtitle with elegant styling
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Настоящий сертификат подтверждает, что', pageWidth / 2, 98, { align: 'center' });

  // User name with decorative underline
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(data.userName, pageWidth / 2, 116, { align: 'center' });

  // Elegant underline with gradient effect
  const nameWidth = doc.getTextWidth(data.userName);
  const underlineStart = (pageWidth - nameWidth) / 2 - 10;
  const underlineEnd = (pageWidth + nameWidth) / 2 + 10;
  
  doc.setDrawColor(139, 92, 246);
  doc.setLineWidth(1);
  doc.line(underlineStart, 120, underlineEnd, 120);
  
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.3);
  doc.line(underlineStart + 20, 122, underlineEnd - 20, 122);

  // Small decorative elements around name
  doc.setFillColor(139, 92, 246);
  doc.circle(underlineStart - 5, 120, 2, 'F');
  doc.circle(underlineEnd + 5, 120, 2, 'F');

  // Achievement text
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('успешно прошёл(а) тест', pageWidth / 2, 132, { align: 'center' });

  // Test title with decorative quotes
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(99, 102, 241);
  
  const testTitleText = `« ${data.testTitle} »`;
  doc.text(testTitleText, pageWidth / 2, 145, { align: 'center' });

  // Subject with styled badge
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 220);
  doc.text(`по предмету: ${data.subjectName}`, pageWidth / 2, 158, { align: 'center' });

  // Result with colored badge based on score
  const percentage = Math.round(data.percentage);
  let resultColor: number[];
  let grade: string;
  
  if (percentage >= 90) {
    resultColor = [34, 197, 94];
    grade = 'Отлично';
  } else if (percentage >= 80) {
    resultColor = [59, 130, 246];
    grade = 'Хорошо';
  } else if (percentage >= 70) {
    resultColor = [234, 179, 8];
    grade = 'Удовлетворительно';
  } else {
    resultColor = [249, 115, 22];
    grade = 'Зачтено';
  }

  // Result badge border
  doc.setDrawColor(resultColor[0], resultColor[1], resultColor[2]);
  doc.setLineWidth(1.5);
  doc.roundedRect(pageWidth / 2 - 45, 165, 90, 18, 4, 4);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(resultColor[0], resultColor[1], resultColor[2]);
  doc.text(`Результат: ${percentage}%`, pageWidth / 2, 177, { align: 'center' });

  // Grade text
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`Оценка: ${grade}`, pageWidth / 2, 192, { align: 'center' });

  // Footer section with elegant styling
  const footerY = pageHeight - 28;
  
  // Decorative line above footer
  doc.setDrawColor(60, 60, 80);
  doc.setLineWidth(0.3);
  doc.line(30, footerY - 10, pageWidth - 30, footerY - 10);

  // Date
  const formattedDate = new Date(data.completedAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Дата: ${formattedDate}`, 35, footerY);

  // Certificate ID
  const certId = data.certificateId.slice(0, 8).toUpperCase();
  doc.text(`ID: ${certId}`, pageWidth - 35, footerY, { align: 'right' });

  // Website
  doc.setTextColor(139, 92, 246);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('testlix.app', pageWidth / 2, footerY, { align: 'center' });

  // Decorative stars/sparkles in corners
  doc.setFillColor(139, 92, 246);
  doc.circle(45, 45, 1.5, 'F');
  doc.circle(pageWidth - 45, 45, 1.5, 'F');
  doc.circle(50, pageHeight - 45, 1.5, 'F');
  doc.circle(pageWidth - 50, pageHeight - 45, 1.5, 'F');
  
  doc.setFillColor(99, 102, 241);
  doc.circle(60, 50, 1, 'F');
  doc.circle(pageWidth - 60, 50, 1, 'F');
  doc.circle(55, pageHeight - 50, 1, 'F');
  doc.circle(pageWidth - 55, pageHeight - 50, 1, 'F');

  return doc;
};

export const downloadCertificate = (data: CertificateData): void => {
  const doc = generateCertificatePDF(data);
  doc.save(`certificate-${data.certificateId.slice(0, 8)}.pdf`);
};
