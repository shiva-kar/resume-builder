"use client";

import { jsPDF } from "jspdf";

/**
 * Handles the PDF document structure, taking a raw image and slicing it into A4 pages.
 */
export const generateResumePDF = async (imgData: string): Promise<Blob> => {
  // Initialize an A4 portrait PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
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
  pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfHeight);
  remainingHeight -= pdfHeight;

  // Render subsequent pages, using a 1mm tolerance to prevent rounding errors from generating blank pages
  while (remainingHeight > 1) {
    pdf.addPage();
    position -= pdfHeight;
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfHeight);
    remainingHeight -= pdfHeight;
  }

  return pdf.output('blob');
};
