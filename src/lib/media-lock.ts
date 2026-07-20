/** Office demo: external product images disabled (bandwidth / cost). */
export const OFFICE_IMAGES_LOCKED = true

export function resolveProductImage(url?: string | null): string {
  if (OFFICE_IMAGES_LOCKED) return ''
  return url?.trim() ?? ''
}

export function stripProductImages<T extends { image?: string; images?: string[] }>(p: T): T {
  if (!OFFICE_IMAGES_LOCKED) return p
  return { ...p, image: '', images: undefined }
}
