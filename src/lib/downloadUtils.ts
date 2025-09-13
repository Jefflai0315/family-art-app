/**
 * Download utility functions for images and videos
 */

export interface DownloadOptions {
  filename?: string;
  fallbackToNewTab?: boolean;
}

/**
 * Add logo overlay to an image
 */
export async function addLogoOverlay(
  imageUrl: string,
  logoUrl: string = "/Bazgym_logo_clear.png"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // Set canvas size to match the image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Load and draw the logo
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";

      logoImg.onload = () => {
        // Calculate logo size (20% of image width, maintaining aspect ratio)
        const logoSize = Math.min(img.width * 0.2, img.height * 0.2);
        const logoAspectRatio = logoImg.width / logoImg.height;
        const logoWidth = logoSize;
        const logoHeight = logoSize / logoAspectRatio;

        // Position logo in bottom right corner with some padding
        const padding = Math.min(img.width, img.height) * 0.02; // 2% padding
        const logoX = img.width - logoWidth - padding;
        const logoY = img.height - logoHeight - padding;

        // Draw logo with white background circle for better visibility
        const logoRadius = Math.max(logoWidth, logoHeight) / 2 + padding / 2;
        const logoCenterX = logoX + logoWidth / 2;
        const logoCenterY = logoY + logoHeight / 2;

        // Draw white background circle
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.beginPath();
        ctx.arc(logoCenterX, logoCenterY, logoRadius, 0, 2 * Math.PI);
        ctx.fill();

        // Draw the logo
        ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);

        // Convert to data URL
        const dataUrl = canvas.toDataURL("image/png", 1.0);
        resolve(dataUrl);
      };

      logoImg.onerror = () => {
        // If logo fails to load, just return the original image
        console.warn("Logo failed to load, returning original image");
        resolve(imageUrl);
      };

      logoImg.src = logoUrl;
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = imageUrl;
  });
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
 * Auto-download an image with enhanced mobile compatibility
 */
export async function autoDownloadImage(
  imageUrl: string,
  baseFilename: string = "image"
): Promise<void> {
  const extension = getImageExtension(imageUrl);
  const filename = `${baseFilename}.${extension}`;

  try {
    // Detect device type and browser
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isSafari =
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    if (isMobile) {
      // Mobile-specific download handling
      try {
        if (isIOS && isSafari) {
          // iOS Safari: Use a more compatible approach
          const link = document.createElement("a");
          link.href = imageUrl;
          link.download = filename;
          link.target = "_blank";
          link.rel = "noopener noreferrer";

          // Add to DOM temporarily
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (isAndroid) {
          // Android: Try standard download first
          await downloadMedia(imageUrl, { filename, fallbackToNewTab: true });
        } else {
          // Other mobile browsers
          await downloadMedia(imageUrl, { filename, fallbackToNewTab: true });
        }
      } catch (error) {
        console.warn(
          "Mobile download failed, trying alternative method:",
          error
        );

        // Alternative method for mobile: create a temporary link with download attribute
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = filename;
          link.style.display = "none";

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
        } catch (fallbackError) {
          console.warn(
            "Fallback download failed, opening in new tab:",
            fallbackError
          );
          // Final fallback: open in new tab
          window.open(imageUrl, "_blank");
        }
      }
    } else {
      // Desktop: use standard download
      await downloadMedia(imageUrl, { filename, fallbackToNewTab: false });
    }
  } catch (error) {
    console.error("Auto-download failed:", error);
    // Final fallback: open in new tab
    window.open(imageUrl, "_blank");
  }
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
