import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { softwareList, type Software } from '../lib/software'

export function SoftwareCarousel() {
  const rawItems = softwareList
  
  // 2 yazılım varken sol-sağ simetrisi bozulmasın diye sanal olarak çoğaltıyoruz (Sonsuz X -> Y -> X -> Y)
  const items: Software[] =
    rawItems.length === 0
      ? []
      : rawItems.length === 1
      ? [rawItems[0], rawItems[0], rawItems[0]]
      : rawItems.length === 2
      ? [...rawItems, ...rawItems, ...rawItems]
      : rawItems

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchDeltaX = useRef<number>(0)
  const isDragging = useRef<boolean>(false)

  const count = items.length

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % count)
  }, [count])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + count) % count)
  }, [count])

  // 4.5 saniyede bir otomatik kayma (hover veya parmak değdiğinde durur)
  useEffect(() => {
    if (isPaused || count <= 1) return
    const timer = setInterval(nextSlide, 4500)
    return () => clearInterval(timer)
  }, [isPaused, nextSlide, count])

  // Dokunmatik / Mouse Swipe İşlemleri (Sayfa dikey kaymasını kilitlemez)
  const handleTouchStart = (clientX: number) => {
    setIsPaused(true)
    touchStartX.current = clientX
    touchDeltaX.current = 0
    isDragging.current = true
  }

  const handleTouchMove = (clientX: number) => {
    if (!isDragging.current || touchStartX.current === null) return
    touchDeltaX.current = clientX - touchStartX.current
  }

  const handleTouchEnd = () => {
    if (!isDragging.current) return
    isDragging.current = false
    setIsPaused(false)

    // 40 pikselden fazla sürüklendiyse slaytı değiştir
    if (touchDeltaX.current < -40) {
      nextSlide()
    } else if (touchDeltaX.current > 40) {
      prevSlide()
    }
    touchStartX.current = null
  }

  if (items.length === 0) return null

  return (
    <div
      className="carousel-container relative w-full select-none py-4 overflow-hidden touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleTouchMove(e.touches[0].clientX)}
      onTouchEnd={handleTouchEnd}
      onMouseDown={(e) => handleTouchStart(e.clientX)}
      onMouseMove={(e) => handleTouchMove(e.clientX)}
      onMouseUp={handleTouchEnd}
    >
      {/* 3D Kart Sahnesi */}
      <div className="relative mx-auto flex h-[320px] sm:h-[280px] w-full max-w-[850px] items-center justify-center">
        {items.map((item, idx) => {
          let offset = (idx - currentIndex + count) % count
          if (offset > count / 2) offset -= count

          const isCenter = offset === 0
          const isLeft = offset === -1
          const isRight = offset === 1
          const isVisible = Math.abs(offset) <= 1

          let transformStyle = 'translate3d(0, 0, -120px) scale(0.7) opacity-0 pointer-events-none'
          let zIndex = 1

          if (isCenter) {
            transformStyle = 'translate3d(0, 0, 0) scale(1) opacity-100 z-20 cursor-pointer shadow-xl shadow-emerald-950/5'
            zIndex = 20
          } else if (isLeft) {
            transformStyle = '-translate-x-[60%] sm:-translate-x-[75%] translate-y-2 scale-[0.88] opacity-45 z-10 cursor-pointer'
            zIndex = 10
          } else if (isRight) {
            transformStyle = 'translate-x-[60%] sm:translate-x-[75%] translate-y-2 scale-[0.88] opacity-45 z-10 cursor-pointer'
            zIndex = 10
          }

          if (!isVisible) return null

          return (
            <div
              key={`${item.slug}-${idx}`}
              onClick={() => {
                if (isLeft) prevSlide()
                else if (isRight) nextSlide()
                else if (isCenter && Math.abs(touchDeltaX.current) < 8) {
                  // Sadece bilinçli tıklandığında detay sayfasına yönlendirir
                  window.location.href = item.href
                }
              }}
              style={{ zIndex }}
              className={`absolute top-0 w-[88%] sm:w-[440px] rounded-2xl border bg-white p-5 sm:p-6 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${transformStyle} ${
                isCenter ? 'border-emerald-500/50 ring-2 ring-emerald-500/10' : 'border-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {item.status}
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-zinc-50 text-zinc-500 group-hover:text-emerald-600 transition">
                  <ArrowUpRight size={18} />
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 mb-1.5">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 line-clamp-2 leading-relaxed mb-4">
                {item.description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-100">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-zinc-50 border border-zinc-200/60 px-2 py-0.5 text-[11px] font-medium text-zinc-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Gezinme Okları & Noktalar */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Önceki yazılım"
          className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm hover:border-emerald-500 hover:text-emerald-600 transition active:scale-95 cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Gerçek ürün sayısı kadar gösterge noktası */}
        <div className="flex items-center gap-1.5">
          {rawItems.map((_, i) => {
            const activeRaw = currentIndex % rawItems.length
            return (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                aria-label={`Yazılım ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeRaw === i ? 'w-6 bg-emerald-600' : 'w-2 bg-zinc-200'
                }`}
              />
            )
          })}
        </div>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Sonraki yazılım"
          className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm hover:border-emerald-500 hover:text-emerald-600 transition active:scale-95 cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
      }
