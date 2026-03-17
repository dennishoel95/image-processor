import JSZip from "jszip";
import type { ImageItem } from "./types";
import { buildFileName } from "./naming";

function generateMetadataMarkdown(
  fileName: string,
  analysis: NonNullable<ImageItem["analysis"]>,
  meta: { copyright: string; creator: string; rightsUrl: string }
): string {
  const location = [analysis.locationName, analysis.city, analysis.stateProvince, analysis.country]
    .filter(Boolean)
    .join(", ");

  return `# ${fileName}

## Title
${analysis.title || "—"}

## Alt Text
${analysis.altText || "—"}

## Description
${analysis.metaDescription || "—"}

## Keywords
${analysis.keywords.length > 0 ? analysis.keywords.join(", ") : "—"}

## Copyright
${meta.copyright || "—"}

## Creator
${meta.creator || "—"}

## Date Created
${new Date().toISOString().split("T")[0]}

## Web Statement of Rights
${meta.rightsUrl || "—"}

## Location
${location || "—"}
${analysis.locationName || analysis.city || analysis.stateProvince || analysis.country ? `
### Location Details
${analysis.locationName ? `- **Location Name:** ${analysis.locationName}` : ""}
${analysis.city ? `- **City:** ${analysis.city}` : ""}
${analysis.stateProvince ? `- **State/Province:** ${analysis.stateProvince}` : ""}
${analysis.country ? `- **Country:** ${analysis.country}` : ""}
`.trim() : ""}
`;
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
  settings: { prefix: string; suffix: string; separator: string; copyright: string; creator: string; rightsUrl: string }
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
  settings: { prefix: string; suffix: string; separator: string; copyright: string; creator: string; rightsUrl: string }
): void {
  const headers = [
    "filename", "title", "alt_text", "description", "keywords",
    "copyright", "creator", "rights_url", "date_created",
    "location_name", "city", "state_province", "country",
  ];

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
