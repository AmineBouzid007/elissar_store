import { LogoMark } from "@/components/brand/logo"
import { cn } from "@/lib/utils"

/** Product photo, or a branded placeholder until the real photo is uploaded. */
export function ProductImage({
  src,
  alt,
  label,
  className,
  imgClassName,
  priority,
}: {
  src?: string
  alt: string
  label?: string
  className?: string
  imgClassName?: string
  priority?: boolean
}) {
  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" className={cn("size-full object-cover", imgClassName)} />
      ) : (
        <div className="grain relative flex size-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#e8effb] to-[#fbe9c1]">
          <LogoMark className="h-1/4 w-auto text-primary/50" />
          {label && <span className="label-mono max-w-[80%] text-center text-primary/60">{label}</span>}
        </div>
      )}
    </div>
  )
}
