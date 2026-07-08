"use client";

import { toJpeg } from "html-to-image";
import type { ResumeData } from "@/lib/schema";
import { generateResumePDF } from "./ResumePDF";

/**
 * PDF generation logic that captures the DOM and interfaces with the document structure generator.
 */
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

  return generateResumePDF(imgData);
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
