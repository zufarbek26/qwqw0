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

  // Background gradient effect (simplified as solid color)
  doc.setFillColor(15, 23, 42); // Dark blue background
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative border
  doc.setDrawColor(139, 92, 246); // Purple border
  doc.setLineWidth(3);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Inner border
  doc.setDrawColor(99, 102, 241); // Indigo
  doc.setLineWidth(1);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Corner decorations
  const cornerSize = 20;
  doc.setFillColor(139, 92, 246);
  
  // Top left
  doc.triangle(10, 10, 10 + cornerSize, 10, 10, 10 + cornerSize, 'F');
  // Top right
  doc.triangle(pageWidth - 10, 10, pageWidth - 10 - cornerSize, 10, pageWidth - 10, 10 + cornerSize, 'F');
  // Bottom left
  doc.triangle(10, pageHeight - 10, 10 + cornerSize, pageHeight - 10, 10, pageHeight - 10 - cornerSize, 'F');
  // Bottom right
  doc.triangle(pageWidth - 10, pageHeight - 10, pageWidth - 10 - cornerSize, pageHeight - 10, pageWidth - 10, pageHeight - 10 - cornerSize, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('TESTLIX', pageWidth / 2, 35, { align: 'center' });

  // Certificate text
  doc.setFontSize(42);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(139, 92, 246); // Purple
  doc.text('СЕРТИФИКАТ', pageWidth / 2, 55, { align: 'center' });

  // Subtitle
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Gray
  doc.text('Настоящий сертификат подтверждает, что', pageWidth / 2, 70, { align: 'center' });

  // User name
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(data.userName, pageWidth / 2, 90, { align: 'center' });

  // Underline for name
  const nameWidth = doc.getTextWidth(data.userName);
  doc.setDrawColor(139, 92, 246);
  doc.setLineWidth(0.5);
  doc.line((pageWidth - nameWidth) / 2, 93, (pageWidth + nameWidth) / 2, 93);

  // Achievement text
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('успешно прошёл(а) тест', pageWidth / 2, 105, { align: 'center' });

  // Test title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(99, 102, 241); // Indigo
  doc.text(`"${data.testTitle}"`, pageWidth / 2, 120, { align: 'center' });

  // Subject
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`по предмету: ${data.subjectName}`, pageWidth / 2, 132, { align: 'center' });

  // Result
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const resultColor = data.percentage >= 90 ? [34, 197, 94] : data.percentage >= 70 ? [234, 179, 8] : [239, 68, 68];
  doc.setTextColor(resultColor[0], resultColor[1], resultColor[2]);
  doc.text(`Результат: ${Math.round(data.percentage)}%`, pageWidth / 2, 148, { align: 'center' });

  // Grade
  let grade = '';
  if (data.percentage >= 90) grade = 'Отлично';
  else if (data.percentage >= 80) grade = 'Хорошо';
  else if (data.percentage >= 70) grade = 'Удовлетворительно';
  else grade = 'Зачтено';

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`Оценка: ${grade}`, pageWidth / 2, 158, { align: 'center' });

  // Date
  const formattedDate = new Date(data.completedAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  doc.setFontSize(12);
  doc.setTextColor(148, 163, 184);
  doc.text(`Дата: ${formattedDate}`, 40, pageHeight - 30);

  // Certificate ID
  doc.text(`ID: ${data.certificateId.slice(0, 8).toUpperCase()}`, pageWidth - 40, pageHeight - 30, { align: 'right' });

  // Footer
  doc.setFontSize(10);
  doc.text('testlix.app', pageWidth / 2, pageHeight - 20, { align: 'center' });

  return doc;
};

export const downloadCertificate = (data: CertificateData): void => {
  const doc = generateCertificatePDF(data);
  doc.save(`certificate-${data.certificateId.slice(0, 8)}.pdf`);
};
