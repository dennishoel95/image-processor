import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import os from "os";

export async function GET(request: NextRequest) {
  const dirPath = request.nextUrl.searchParams.get("path") || os.homedir();

  try {
    const stat = await fs.stat(dirPath);
    if (!stat.isDirectory()) {
      return NextResponse.json({ error: "Not a directory" }, { status: 400 });
    }

    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const folders = entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => ({
        name: entry.name,
        path: path.join(dirPath, entry.name),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const parent = path.dirname(dirPath);

    return NextResponse.json({
      current: dirPath,
      parent: parent !== dirPath ? parent : null,
      folders,
    });
  } catch {
    return NextResponse.json({ error: "Cannot read directory" }, { status: 404 });
  }
}
