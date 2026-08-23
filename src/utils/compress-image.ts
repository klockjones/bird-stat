import imageCompression from "browser-image-compression";

export async function compressImage(file: File) {
  return imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1280,
    initialQuality: 0.75,
    useWebWorker: true,
  });
}
