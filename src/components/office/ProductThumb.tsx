import { Package, Lock } from 'lucide-react'
import { OFFICE_IMAGES_LOCKED, resolveProductImage } from '@/lib/media-lock'
import { cn } from '@/lib/utils'

type Props = {
  src?: string | null
  alt?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-9 h-9',
  lg: 'w-12 h-12',
}

export function ProductThumb({ src, alt = '', className, size = 'md' }: Props) {
  const resolved = resolveProductImage(src)
  const box = cn(sizeMap[size], 'rounded-lg shrink-0 flex items-center justify-center bg-slate-100 border border-slate-200', className)

  if (OFFICE_IMAGES_LOCKED || !resolved) {
    return (
      <div className={box} title={OFFICE_IMAGES_LOCKED ? 'Images locked (office mode)' : undefined}>
        <Package className="w-4 h-4 text-slate-400" />
        {OFFICE_IMAGES_LOCKED && size !== 'sm' && (
          <Lock className="w-2.5 h-2.5 text-slate-300 absolute -bottom-0.5 -right-0.5 hidden" />
        )}
      </div>
    )
  }

  return <img src={resolved} alt={alt} className={cn(box, 'object-cover')} />
}
