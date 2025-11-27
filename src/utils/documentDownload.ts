export async function downloadDocument(url: string, filename: string) {
  try {
    // Fetch the document
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }

    // Get the blob
    const blob = await response.blob();

    // Create a temporary URL for the blob
    const blobUrl = window.URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    return true;
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
}

export function getFileNameFromUrl(url: string): string {
  try {
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    // Remove any query parameters
    return filename.split('?')[0];
  } catch {
    return 'document';
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function getFileInfo(url: string): Promise<{ size: number; type: string }> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const size = parseInt(response.headers.get('content-length') || '0');
    const type = response.headers.get('content-type') || 'application/octet-stream';

    return { size, type };
  } catch (error) {
    console.error('Error getting file info:', error);
    return { size: 0, type: 'unknown' };
  }
}
