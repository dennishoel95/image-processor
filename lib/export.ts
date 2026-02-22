import JSZip from "jszip";
import type { ImageItem } from "./types";
import { buildFileName } from "./naming";

function generateMetadataMarkdown(
  fileName: string,
  analysis: NonNullable<ImageItem["analysis"]>
): string {
  const dateCreated = new Date().toISOString().split("T")[0];

  const locationParts = [
    analysis.locationName,
    analysis.city,
    analysis.stateProvince,
    analysis.country,
  ].filter(Boolean);
  const locationString = locationParts.join(", ") || "—";

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
<!-- Fill in: e.g. © ${new Date().getFullYear()} Your Company. All rights reserved. -->

## Creator
<!-- Fill in: e.g. Photography: Name | Edit: Design Team -->

## Date Created
${dateCreated}

## Web Statement of Rights
<!-- Fill in: e.g. https://example.com/image-licensing-terms -->

## Location
${locationString}

### Location Details
- **Location Name:** ${analysis.locationName || "—"}
- **City:** ${analysis.city || "—"}
- **State/Province:** ${analysis.stateProvince || "—"}
- **Country:** ${analysis.country || "—"}
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
  settings: { prefix: string; suffix: string; separator: string }
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
    const mdContent = generateMetadataMarkdown(uniqueName, image.analysis);
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
