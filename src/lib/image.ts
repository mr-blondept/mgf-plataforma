export async function compressProfileImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const maxDimension = 640;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Não foi possível processar a imagem.");
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const type = file.type === "image/png" ? "image/png" : "image/webp";
  const quality = type === "image/png" ? undefined : 0.82;

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });

  if (!blob) {
    throw new Error("Não foi possível comprimir a imagem.");
  }

  const extension = type === "image/png" ? "png" : "webp";
  const compressedFile = new File([blob], `avatar.${extension}`, {
    type,
    lastModified: Date.now(),
  });

  return compressedFile.size < file.size ? compressedFile : file;
}
