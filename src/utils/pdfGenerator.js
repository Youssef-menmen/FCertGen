import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { jsPDF }  from "jspdf";
import JSZip      from "jszip";

const REF_H = 562;

function hexToRgb01(hex) {
  return {
    r: parseInt(hex.slice(1,3), 16) / 255,
    g: parseInt(hex.slice(3,5), 16) / 255,
    b: parseInt(hex.slice(5,7), 16) / 255,
  };
}
function hexToRgb255(hex) {
  return {
    r: parseInt(hex.slice(1,3), 16),
    g: parseInt(hex.slice(3,5), 16),
    b: parseInt(hex.slice(5,7), 16),
  };
}

/* ── Téléchargement fiable (méthode A — ✅ Chrome + Edge individuel) ── */
function saveBlob(blob, filename) {
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.style.display = "none";
  link.href           = url;
  link.download       = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/* ── Génère un Blob PDF pour un étudiant ── */
async function generatePdfBlob(student, templateData, namePosition, fontSize, nameColor, nameOpacity) {
  const fullName = `${student.prenom} ${student.nom}`;

  if (templateData?.type === "pdf") {
    const pdfDoc = await PDFDocument.load(templateData.pdfBytes.slice(0));
    const page   = pdfDoc.getPage(0);
    const { width: W, height: H } = page.getSize();
    const font       = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const scaledSize = Math.round((fontSize / REF_H) * H);
    const xPos       = namePosition ? (namePosition.xPct / 100) * W : W / 2;
    const yBottom    = namePosition ? H - (namePosition.yPct / 100) * H : H / 2;
    const tw         = font.widthOfTextAtSize(fullName, scaledSize);
    const { r, g, b } = hexToRgb01(nameColor);
    page.drawText(fullName, {
      x: xPos - tw / 2, y: yBottom,
      size: scaledSize, font,
      color: rgb(r, g, b), opacity: nameOpacity,
    });
    const bytes = await pdfDoc.save();
    return new Blob([bytes], { type: "application/pdf" });
  }

  if (templateData?.type === "image") {
    const { hiResDataURL, dataURL, width: W, height: H } = templateData;
    const doc = new jsPDF({
      orientation: W >= H ? "landscape" : "portrait",
      unit: "px", format: [W, H], hotfixes: ["px_scaling"],
    });
    doc.addImage(hiResDataURL || dataURL, "PNG", 0, 0, W, H);
    const sf = Math.round((fontSize / REF_H) * H);
    const nx = namePosition ? (namePosition.xPct / 100) * W : W / 2;
    const ny = namePosition ? (namePosition.yPct / 100) * H : H / 2;
    const { r, g, b } = hexToRgb255(nameColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(sf);
    doc.setTextColor(r, g, b);
    doc.text(fullName, nx, ny, { align: "center" });
    return new Blob([doc.output("arraybuffer")], { type: "application/pdf" });
  }

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297, H = 210;
  doc.setFillColor(250, 247, 240); doc.rect(0, 0, W, H, "F");
  doc.setDrawColor(201, 168, 76); doc.setLineWidth(2); doc.rect(6, 6, W - 12, H - 12);
  doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(44, 31, 14);
  doc.text("CERTIFICAT DE RÉUSSITE", W / 2, 45, { align: "center" });
  doc.setFont("helvetica", "italic"); doc.setFontSize(13); doc.setTextColor(139, 96, 64);
  doc.text("est décerné à", W / 2, 68, { align: "center" });
  const nx = namePosition ? (namePosition.xPct / 100) * W : W / 2;
  const ny = namePosition ? (namePosition.yPct / 100) * H : H / 2 + 5;
  doc.setFont("helvetica", "bold"); doc.setFontSize(fontSize); doc.setTextColor(0, 0, 0);
  doc.text(fullName, nx, ny, { align: "center" });
  return new Blob([doc.output("arraybuffer")], { type: "application/pdf" });
}

/* ════════════════════════════════════════════
   generateOnePDF — PDF individuel
════════════════════════════════════════════ */
export async function generateOnePDF(
  student, templateData, autoDownload = false,
  namePosition = null, fontSize = 22,
  nameColor = "#000000", nameOpacity = 1
) {
  const blob = await generatePdfBlob(
    student, templateData, namePosition, fontSize, nameColor, nameOpacity
  );
  if (autoDownload) {
    saveBlob(blob, sanitize(student));
    recordExportAsync("INDIVIDUAL", [student], templateData);
  }
  return blob;
}

/* ════════════════════════════════════════════
   generateAllPDFs — ZIP (Chrome / Firefox / Safari)
════════════════════════════════════════════ */
export async function generateAllPDFs(
  students, templateData,
  namePosition = null, fontSize = 22,
  nameColor = "#000000", nameOpacity = 1
) {
  const zip = new JSZip();

  for (const student of students) {
    const blob        = await generatePdfBlob(
      student, templateData, namePosition, fontSize, nameColor, nameOpacity
    );
    const arrayBuffer = await blob.arrayBuffer();
    zip.file(sanitize(student), arrayBuffer);
  }

  const zipBlob = await zip.generateAsync({
    type:               "blob",
    compression:        "DEFLATE",
    compressionOptions: { level: 3 },
  });

  saveBlob(zipBlob, "certificats.zip");
  recordExportAsync("ZIP", students, templateData);
  return students.length;
}

/* ── Helpers ── */
function sanitize(student) {
  if (student.email?.trim())
    return student.email.trim().replace(/[^a-zA-Z0-9@._-]/g, "_") + ".pdf";
  return `${student.prenom}_${student.nom}.pdf`
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_.-]/g, "");
}

async function recordExportAsync(exportType, students, templateData) {
  try {
    const { recordExport } = await import("./auth.js");
    await recordExport({
      batchId:          `${exportType.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      certificateCount: students.length,
      templateName:     templateData?.fileName || (templateData?.type ? `template.${templateData.type}` : "Sans template"),
      templateType:     templateData?.type || "none",
      exportType,
      /* Noms pour ExportHistory */
      studentNames: students.map(s => `${s.prenom} ${s.nom}`),
      /* Données complètes pour GeneratedCertificates (traçabilité) */
      students: students.map(s => ({
        nom:    s.nom    || "",
        prenom: s.prenom || "",
        email:  s.email  || "",
      })),
    });
  } catch (e) {
    console.warn("recordExport:", e.message);
  }
}
