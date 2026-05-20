/**
 * Cloudinary free-tier unsigned upload helper.
 *
 * Setup (one-time):
 *  1. Sign up at https://cloudinary.com (free — 25 GB storage, 25 GB/month bandwidth)
 *  2. In your Cloudinary dashboard → Settings → Upload → Upload presets
 *     → "Add upload preset" → set Signing Mode = "Unsigned" → save.
 *  3. Create a .env file in the project root with:
 *       VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *       VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name
 *  4. Restart the dev server — images will now upload to Cloudinary.
 *
 * Without these env vars the helper returns null and the app falls back to
 * local base64 (FileReader). Everything still works, just images are stored
 * in localStorage instead of the cloud.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined

export const cloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET)

export async function uploadToCloudinary(file: File): Promise<string | null> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) return null
  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', UPLOAD_PRESET)
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body,
    })
    if (!res.ok) return null
    const data = await res.json() as { secure_url?: string }
    return data.secure_url ?? null
  } catch {
    return null
  }
}

/** Transform a Cloudinary URL: resize + auto-quality. Pass-through for non-Cloudinary URLs. */
export function cloudinaryTransform(url: string, width = 800): string {
  if (!url.includes('res.cloudinary.com')) return url
  return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`)
}
