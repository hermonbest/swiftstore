// Mock image upload service for development
// This simulates what would happen with a real service like UploadThing

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
}

export class MockUploadService {
  static async uploadFiles(files: File[]): Promise<UploadedFile[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return files.map(file => ({
      url: `https://placehold.co/600x400?text=${encodeURIComponent(file.name)}`,
      name: file.name,
      size: file.size,
    }));
  }

  static async deleteFiles(urls: string[]): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Mock deletion of files: ${urls.join(', ')}`);
  }
}

export const uploadService = new MockUploadService();