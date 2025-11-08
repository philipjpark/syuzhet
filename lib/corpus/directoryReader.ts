/**
 * Directory Reader Utility
 * 
 * Uses the File System Access API to read files from a user-selected directory.
 * Falls back to manual file selection if the API is not available.
 */

export interface DirectoryFile {
  name: string;
  file: File;
}

/**
 * Reads all supported files from a directory handle
 * @param directoryHandle The directory handle from the File System Access API
 * @param supportedTypes File types to include (MIME types or extensions)
 * @returns Array of files found in the directory
 */
export async function readDirectoryFiles(
  directoryHandle: FileSystemDirectoryHandle,
  supportedTypes: string[] = ['application/pdf', 'text/plain', 'text/markdown', '.pdf', '.txt', '.md']
): Promise<File[]> {
  const files: File[] = [];

  async function traverseDirectory(dirHandle: FileSystemDirectoryHandle, path = '') {
    for await (const [name, handle] of dirHandle.entries()) {
      const currentPath = path ? `${path}/${name}` : name;

      if (handle.kind === 'directory') {
        // Recursively traverse subdirectories
        await traverseDirectory(handle, currentPath);
      } else if (handle.kind === 'file') {
        // Check if file type is supported
        const file = await handle.getFile();
        const isSupported = supportedTypes.some(type => {
          if (type.startsWith('.')) {
            return name.toLowerCase().endsWith(type.toLowerCase());
          }
          return file.type === type || file.type.startsWith(type.split('/')[0] + '/');
        });

        if (isSupported) {
          files.push(file);
        }
      }
    }
  }

  await traverseDirectory(directoryHandle);
  return files;
}

/**
 * Opens a directory picker using the File System Access API
 * @returns Directory handle or null if cancelled/not supported
 */
export async function selectDirectory(): Promise<FileSystemDirectoryHandle | null> {
  // Check if File System Access API is supported
  if (!('showDirectoryPicker' in window)) {
    return null;
  }

  try {
    const directoryHandle = await (window as any).showDirectoryPicker({
      mode: 'read',
    });
    return directoryHandle;
  } catch (error: any) {
    // User cancelled or error occurred
    if (error.name === 'AbortError' || error.name === 'NotAllowedError') {
      return null;
    }
    throw error;
  }
}

