import imageCompression from "browser-image-compression";
import heic2any from "heic2any";

function isHeic(file: File) {
  return /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

async function toJpegIfHeic(file: File) {
  if (!isHeic(file)) {
    return file;
  }

  try {
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    return new File([blob], file.name.replace(/\.hei[cf]$/i, ".jpg"), { type: "image/jpeg" });
  } catch {
    throw new Error("HEIC 이미지를 변환하지 못했습니다. JPG나 PNG로 다시 시도해주세요.");
  }
}

export async function compressImage(file: File) {
  const source = await toJpegIfHeic(file);

  return imageCompression(source, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1280,
    initialQuality: 0.75,
    useWebWorker: true,
  });
}
