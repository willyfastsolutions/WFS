/**
 * Client-side image compression utility using HTML5 Canvas.
 * Resizes images to max 1024x1024 and exports at 0.75 JPEG quality,
 * reducing 4-12 MB tablet photos down to ~60-120 KB without visible loss of clarity.
 * Prevents HTTP 413 Payload Too Large and socket timeouts on mobile connections.
 */
export async function compressImage(
  source: File | string,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    let srcUrl = "";
    if (typeof source === "string") {
      srcUrl = source;
    } else {
      srcUrl = URL.createObjectURL(source);
    }

    const img = new Image();
    img.onload = () => {
      if (typeof source !== "string") {
        URL.revokeObjectURL(srcUrl);
      }

      let width = img.width;
      let height = img.height;

      // Maintain aspect ratio within bounding box
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(typeof source === "string" ? source : srcUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedDataUrl);
    };

    img.onerror = (err) => {
      if (typeof source !== "string") {
        URL.revokeObjectURL(srcUrl);
      }
      reject(new Error("Failed to load image for compression"));
    };

    img.src = srcUrl;
  });
}
