import { readdir, readFile } from "fs/promises";
import path from "path";
import { FileData } from "../types";

/**
 * Recursively walk a directory, yielding file paths with specified extensions
 */
export async function* walkDirectory(
  dir: string,
  extensions: string[] = [".md"]
): AsyncGenerator<string> {
  for (const dirent of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* walkDirectory(full, extensions);
    } else if (
      dirent.isFile() &&
      extensions.some((ext) => full.endsWith(ext))
    ) {
      yield full;
    }
  }
}

/**
 * Read and prepare file data
 */
export const readFileData = async (
  filePath: string,
  targetDir: string
): Promise<FileData> => {
  const relPath = path.relative(targetDir, filePath);
  const content = await readFile(filePath, "utf8");

  return {
    filePath,
    relPath,
    content,
  };
};
