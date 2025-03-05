import fs from 'fs-extra';
import path from 'path';

/**
 * Ensures that a directory exists, creating it if necessary
 */
export const ensureDirectoryExists = (dirPath: string): void => {
  fs.ensureDirSync(dirPath);
};

/**
 * Gets the uploads directory path
 */
export const getUploadsDir = (): string => {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  ensureDirectoryExists(uploadsDir);
  return uploadsDir;
};

/**
 * Deletes a file if it exists
 */
export const deleteFileIfExists = (filePath: string): boolean => {
  if (fs.existsSync(filePath)) {
    fs.removeSync(filePath);
    return true;
  }
  return false;
};

/**
 * Extracts the filename from a file URL
 */
export const getFilenameFromUrl = (fileUrl: string): string => {
  return path.basename(fileUrl);
};

/**
 * Deletes a file from the uploads directory using its URL
 */
export const deleteUploadedFile = (fileUrl: string): boolean => {
  if (!fileUrl) return false;
  
  // Extract the filename from the URL
  const filename = getFilenameFromUrl(fileUrl);
  
  // Get the full path to the file
  const filePath = path.join(getUploadsDir(), filename);
  
  // Delete the file
  return deleteFileIfExists(filePath);
}; 