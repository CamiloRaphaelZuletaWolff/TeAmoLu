import { supabase } from "./supabase";
export const imageUrl = (path) =>
  path
    ? supabase?.storage.from("momentos").getPublicUrl(path).data.publicUrl
    : null;
export async function uploadImage(file, progress) {
  const { default: imageCompression } = await import(
    "browser-image-compression"
  );
  if (!file.type.startsWith("image/"))
    throw new Error("Elige un archivo de imagen.");
  if (file.size > 25 * 1024 * 1024)
    throw new Error("Elige una foto de menos de 25 MB.");
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: 1600,
    maxSizeMB: 0.35,
    fileType: "image/webp",
    useWebWorker: true,
    onProgress: (n) => progress(Math.round(n * 0.8)),
  });
  const path = `${crypto.randomUUID()}.webp`;
  progress(85);
  const { error } = await supabase.storage
    .from("momentos")
    .upload(path, compressed, { contentType: "image/webp" });
  if (error) throw error;
  progress(100);
  return path;
}
export async function removeImage(path) {
  if (!path) return;
  const { error } = await supabase.storage.from("momentos").remove([path]);
  if (error) throw error;
}
