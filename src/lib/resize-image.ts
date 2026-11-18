// Côté navigateur uniquement : recadre une image en carré (centre) et la réduit
// à `size` pixels, en JPEG. Une photo de téléphone de 5 Mo devient ~20 Ko.
export async function imageFileToAvatar(file: File, size = 256) {
  // imageOrientation : respecte l'orientation EXIF des photos prises au téléphone
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  const side = Math.min(bitmap.width, bitmap.height);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  ctx.fillStyle = "#ffffff"; // fond blanc pour les PNG transparents
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size,
  );
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}
