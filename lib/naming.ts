import path from "path";

export function buildFileName(params: {
  prefix: string;
  aiName: string;
  suffix: string;
  separator: string;
  originalExtension: string;
}): string {
  const { prefix, aiName, suffix, separator, originalExtension } = params;

  const parts: string[] = [];
  if (prefix.trim()) parts.push(prefix.trim());
  parts.push(aiName.trim());
  if (suffix.trim()) parts.push(suffix.trim());

  const baseName = parts.join(separator);
  const ext = originalExtension.startsWith(".")
    ? originalExtension
    : `.${originalExtension}`;

  return `${baseName}${ext.toLowerCase()}`;
}

export function sanitizeForFilename(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getExtension(fileName: string): string {
  return path.extname(fileName).toLowerCase();
}
