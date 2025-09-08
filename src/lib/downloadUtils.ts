/**
 * Download utility functions for images and videos
 */

export interface DownloadOptions {
  filename?: string;
  fallbackToNewTab?: boolean;
}

/**
 * Download an image or video from a URL
 */
export async function downloadMedia(
  url: string,
  options: DownloadOptions = {}
): Promise<void> {
  const { filename = "download", fallbackToNewTab = true } = options;

  try {
    // If it's a data URL, download directly
    if (url.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // For external URLs, fetch as blob and download
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch media: ${response.status} ${response.statusText}`
      );
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Error downloading media:", error);

    if (fallbackToNewTab) {
      // Fallback: try to open in new tab
      window.open(url, "_blank");
    } else {
      throw error;
    }
  }
}

/**
 * Download an image with proper filename
 */
export async function downloadImage(
  imageUrl: string,
  baseFilename: string = "image"
): Promise<void> {
  const extension = getImageExtension(imageUrl);
  const filename = `${baseFilename}.${extension}`;

  await downloadMedia(imageUrl, { filename });
}

/**
 * Download a video with proper filename
 */
export async function downloadVideo(
  videoUrl: string,
  baseFilename: string = "video"
): Promise<void> {
  const extension = getVideoExtension(videoUrl);
  const filename = `${baseFilename}.${extension}`;

  await downloadMedia(videoUrl, { filename });
}

/**
 * Get file extension from URL
 */
function getImageExtension(url: string): string {
  if (url.includes("data:image/")) {
    const match = url.match(/data:image\/([^;]+)/);
    return match ? match[1] : "png";
  }

  const pathname = new URL(url).pathname;
  const extension = pathname.split(".").pop()?.toLowerCase();

  // Common image extensions
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  return imageExtensions.includes(extension || "") ? extension! : "png";
}

/**
 * Get video file extension from URL
 */
function getVideoExtension(url: string): string {
  if (url.includes("data:video/")) {
    const match = url.match(/data:video\/([^;]+)/);
    return match ? match[1] : "mp4";
  }

  const pathname = new URL(url).pathname;
  const extension = pathname.split(".").pop()?.toLowerCase();

  // Common video extensions
  const videoExtensions = ["mp4", "webm", "mov", "avi", "mkv"];
  return videoExtensions.includes(extension || "") ? extension! : "mp4";
}
