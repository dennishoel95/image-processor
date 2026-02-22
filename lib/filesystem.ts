import fs from "fs/promises";
import path from "path";

const IMAGE_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif",
]);

export async function validateDirectory(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export async function ensureDirectory(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function scanForImages(dirPath: string): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries
    .filter((entry) => {
      if (!entry.isFile()) return false;
      const ext = path.extname(entry.name).toLowerCase();
      return IMAGE_EXTENSIONS.has(ext);
    })
    .map((entry) => entry.name)
    .sort();
}

export async function readImageAsBase64(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath);
  return buffer.toString("base64");
}

export async function getImageMediaType(
  filePath: string
): Promise<"image/jpeg" | "image/png" | "image/gif" | "image/webp"> {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, "image/jpeg" | "image/png" | "image/gif" | "image/webp"> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  return map[ext] || "image/jpeg";
}

export async function copyFileWithNewName(
  sourcePath: string,
  destDir: string,
  newFileName: string
): Promise<string> {
  await ensureDirectory(destDir);
  const destPath = path.join(destDir, newFileName);
  await fs.copyFile(sourcePath, destPath);
  return destPath;
}

export async function writeMetadataFile(
  destDir: string,
  baseFileName: string,
  metadata: {
    fileName: string;
    title: string;
    altText: string;
    metaDescription: string;
    keywords: string[];
    locationName: string;
    city: string;
    stateProvince: string;
    country: string;
  }
): Promise<string> {
  const mdFileName = baseFileName + ".md";
  const mdPath = path.join(destDir, mdFileName);
  const dateCreated = new Date().toISOString().split("T")[0];

  // Build location string from available fields
  const locationParts = [
    metadata.locationName,
    metadata.city,
    metadata.stateProvince,
    metadata.country,
  ].filter(Boolean);
  const locationString = locationParts.join(", ") || "—";

  const content = `# ${metadata.fileName}

## Title
${metadata.title || "—"}

## Alt Text
${metadata.altText || "—"}

## Description
${metadata.metaDescription || "—"}

## Keywords
${metadata.keywords.length > 0 ? metadata.keywords.join(", ") : "—"}

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
- **Location Name:** ${metadata.locationName || "—"}
- **City:** ${metadata.city || "—"}
- **State/Province:** ${metadata.stateProvince || "—"}
- **Country:** ${metadata.country || "—"}
`;

  await fs.writeFile(mdPath, content, "utf-8");
  return mdPath;
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function getUniqueFileName(
  destDir: string,
  fileName: string
): Promise<string> {
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);

  let candidate = fileName;
  let counter = 2;

  while (await fileExists(path.join(destDir, candidate))) {
    candidate = `${base}-${counter}${ext}`;
    counter++;
  }

  return candidate;
}
