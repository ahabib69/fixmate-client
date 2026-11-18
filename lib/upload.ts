export async function uploadImage(file: File): Promise<string> {
  const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!key)
    throw new Error(
      "Image uploads aren’t configured. Add NEXT_PUBLIC_IMGBB_API_KEY to the client environment.",
    );
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Choose a JPG, PNG, or WebP image.");
  if (file.size > 5 * 1024 * 1024)
    throw new Error("Choose an image smaller than 5 MB.");
  const body = new FormData();
  body.append("image", file);
  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`,
    { method: "POST", body },
  );
  const result = await response.json();
  if (!response.ok || !result.success || !result.data?.url)
    throw new Error("Image upload failed. Please try again.");
  return result.data.url;
}
