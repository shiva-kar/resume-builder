"use client";

import { jsPDF } from "jspdf";

import { PaperSize } from '@/lib/paperSizes';

/**
 * Handles the PDF document structure, taking a raw image and slicing it into pages.
 */
export const generateResumePDF = async (imgData: string, paperSize: PaperSize = 'A4', backgroundColor: string = '#ffffff'): Promise<Blob> => {
  // Initialize PDF with dynamic paper size
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: paperSize.toLowerCase()
  });

  // Calculate the aspect ratio dynamically directly from the image data rather than canvas width/height
  const imgElement = new window.Image();
  imgElement.src = imgData;
  await new Promise((resolve) => {
    imgElement.onload = resolve;
  });

  const imgWidth = imgElement.width;
  const imgHeight = imgElement.height;
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const ratio = pdfWidth / imgWidth;
  const totalPdfHeight = imgHeight * ratio;

  let position = 0;
  let remainingHeight = totalPdfHeight;

  // Render first page
  pdf.setFillColor(backgroundColor);
  pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
  pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfHeight);
  remainingHeight -= pdfHeight;

  // Render subsequent pages, using a 10mm tolerance to prevent rounding errors from generating blank pages
  while (remainingHeight > 10) {
    pdf.addPage();
    pdf.setFillColor(backgroundColor);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
    position -= pdfHeight;
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfHeight);
    remainingHeight -= pdfHeight;
  }

  return pdf.output('blob');
};
