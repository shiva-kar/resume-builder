"use client";

import { toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";
import type { ResumeData } from "@/lib/schema";

export const exportToPDF = async (
  _data: ResumeData,
  sourceNode?: HTMLElement | null
): Promise<Blob> => {
  if (globalThis.window === undefined) {
    throw new TypeError("PDF export is only available in the browser");
  }

  if (!sourceNode) {
    throw new Error("Export DOM node not provided to html-to-image.");
  }

  // We use html-to-image because it natively wraps the DOM into an SVG <foreignObject>,
  // which guarantees 100% pixel-perfect text baseline metrics, line-heights, and custom font parsing.
  const imgData = await toJpeg(sourceNode, {
    quality: 0.98,
    pixelRatio: 3, // High scale for crisp text
    backgroundColor: '#ffffff',
    style: {
      transform: 'none',
      transformOrigin: 'top left',
      margin: '0'
    }
  });

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

  // Render subsequent pages
  while (remainingHeight > 0) {
    pdf.addPage();
    position -= pdfHeight;
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfHeight);
    remainingHeight -= pdfHeight;
  }

  return pdf.output('blob');
};

export const downloadPDF = (blob: Blob, filename = "resume.pdf"): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
