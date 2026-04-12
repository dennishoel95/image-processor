import JSZip from "jszip";
import type { ImageItem } from "./types";
import { buildFileName } from "./naming";

function generateMetadataMarkdown(
  fileName: string,
  analysis: NonNullable<ImageItem["analysis"]>,
  meta: { copyright: string; creator: string; rightsUrl: string; isPremiumUser: boolean }
): string {
  const location = [analysis.locationName, analysis.city, analysis.stateProvince, analysis.country]
    .filter(Boolean)
    .join(", ");

  const titleSection = meta.isPremiumUser
    ? `\n## Title\n${analysis.title || "—"}\n`
    : "";

  const premiumSections = meta.isPremiumUser
    ? `\n## Copyright\n${meta.copyright || "—"}\n\n## Creator\n${meta.creator || "—"}\n\n## Date Created\n${new Date().toISOString().split("T")[0]}\n\n## Web Statement of Rights\n${meta.rightsUrl || "—"}\n\n## Location\n${location || "—"}\n${analysis.locationName || analysis.city || analysis.stateProvince || analysis.country ? `\n### Location Details\n${analysis.locationName ? `- **Location Name:** ${analysis.locationName}` : ""}\n${analysis.city ? `- **City:** ${analysis.city}` : ""}\n${analysis.stateProvince ? `- **State/Province:** ${analysis.stateProvince}` : ""}\n${analysis.country ? `- **Country:** ${analysis.country}` : ""}`.trim() : ""}\n`
    : "";

  return `# ${fileName}
${titleSection}
## Alt Text
${analysis.altText || "—"}

## Description
${analysis.metaDescription || "—"}

## Keywords
${analysis.keywords.length > 0 ? analysis.keywords.join(", ") : "—"}
${premiumSections}`;
}

function base64DataUrlToBytes(dataUrl: string): Uint8Array {
  // Strip "data:image/png;base64," prefix
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function exportAsZip(
  images: ImageItem[],
  settings: { prefix: string; suffix: string; separator: string; copyright: string; creator: string; rightsUrl: string; isPremiumUser: boolean }
): Promise<void> {
  const zip = new JSZip();

  const usedNames = new Set<string>();

  for (const image of images) {
    if (!image.analysis) continue;

    const ext = "." + image.originalFileName.split(".").pop()?.toLowerCase();
    let fileName = buildFileName({
      prefix: settings.prefix,
      aiName: image.analysis.descriptiveName,
      suffix: settings.suffix,
      separator: settings.separator,
      originalExtension: ext,
    });

    // Handle duplicate names
    const baseWithoutExt = fileName.slice(0, fileName.lastIndexOf("."));
    const extOnly = fileName.slice(fileName.lastIndexOf("."));
    let uniqueName = fileName;
    let counter = 2;
    while (usedNames.has(uniqueName)) {
      uniqueName = `${baseWithoutExt}-${counter}${extOnly}`;
      counter++;
    }
    usedNames.add(uniqueName);

    // Add image file
    const imageBytes = base64DataUrlToBytes(image.fileData);
    zip.file(uniqueName, imageBytes);

    // Add metadata .md file
    const mdBaseName = uniqueName.slice(0, uniqueName.lastIndexOf("."));
    const mdContent = generateMetadataMarkdown(uniqueName, image.analysis, {
      copyright: settings.copyright,
      creator: settings.creator,
      rightsUrl: settings.rightsUrl,
      isPremiumUser: settings.isPremiumUser,
    });
    zip.file(`${mdBaseName}.md`, mdContent);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `image-export-${new Date().toISOString().split("T")[0]}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportAsCsv(
  images: ImageItem[],
  settings: { prefix: string; suffix: string; separator: string; copyright: string; creator: string; rightsUrl: string; isPremiumUser: boolean }
): void {
  const headers = settings.isPremiumUser
    ? [
        "filename", "title", "alt_text", "description", "keywords",
        "copyright", "creator", "rights_url", "date_created",
        "location_name", "city", "state_province", "country",
      ]
    : ["filename", "alt_text", "description", "keywords"];

  const usedNames = new Set<string>();
  const rows: string[][] = [];

  for (const image of images) {
    if (!image.analysis) continue;

    const ext = "." + image.originalFileName.split(".").pop()?.toLowerCase();
    let fileName = buildFileName({
      prefix: settings.prefix,
      aiName: image.analysis.descriptiveName,
      suffix: settings.suffix,
      separator: settings.separator,
      originalExtension: ext,
    });

    const baseWithoutExt = fileName.slice(0, fileName.lastIndexOf("."));
    const extOnly = fileName.slice(fileName.lastIndexOf("."));
    let uniqueName = fileName;
    let counter = 2;
    while (usedNames.has(uniqueName)) {
      uniqueName = `${baseWithoutExt}-${counter}${extOnly}`;
      counter++;
    }
    usedNames.add(uniqueName);

    const a = image.analysis;
    if (settings.isPremiumUser) {
      rows.push([
        uniqueName,
        a.title,
        a.altText,
        a.metaDescription,
        a.keywords.join(", "),
        settings.copyright,
        settings.creator,
        settings.rightsUrl,
        new Date().toISOString().split("T")[0],
        a.locationName,
        a.city,
        a.stateProvince,
        a.country,
      ]);
    } else {
      rows.push([
        uniqueName,
        a.altText,
        a.metaDescription,
        a.keywords.join(", "),
      ]);
    }
  }

  const csv = [headers.join(","), ...rows.map((r) => r.map(csvEscape).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `image-metadata-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
