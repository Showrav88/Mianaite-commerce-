import type { AdminProduct } from './admin-store'

export function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export function isFacebookVideoUrl(url: string): boolean {
  return Boolean(url) && (url.includes('facebook.com') || url.includes('fb.watch'))
}

export function facebookVideoEmbedSrc(url: string): string {
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`
}

export function productYoutubeId(p: AdminProduct): string | null {
  return extractYouTubeId(p.youtubeUrl ?? p.videoUrl ?? '')
}

export function productFacebookPageUrl(p: AdminProduct): string | null {
  const url = p.facebookVideoUrl ?? ''
  return isFacebookVideoUrl(url) ? url : null
}

export function productFacebookEmbedSrc(p: AdminProduct): string | null {
  const url = p.facebookVideoUrl ?? ''
  return isFacebookVideoUrl(url) ? facebookVideoEmbedSrc(url) : null
}
