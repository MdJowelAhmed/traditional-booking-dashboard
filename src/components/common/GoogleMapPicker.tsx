import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    google?: any
  }
}

export type LngLat = [number, number] // [lng, lat]

interface GoogleMapPickerProps {
  value?: LngLat | null
  onChange: (coords: LngLat) => void
  height?: number
  className?: string
  defaultCenter?: LngLat
  zoom?: number
}

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (window.google?.maps) return Promise.resolve()

  const existing = document.querySelector<HTMLScriptElement>(
    'script[data-google-maps="true"]'
  )
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load Google Maps'))
      )
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}`
    script.async = true
    script.defer = true
    script.dataset.googleMaps = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })
}

export function GoogleMapPicker({
  value,
  onChange,
  height = 320,
  className,
  defaultCenter = [90.4125, 23.8103],
  zoom = 13,
}: GoogleMapPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any | null>(null)
  const markerRef = useRef<any | null>(null)

  useEffect(() => {
    const key = import.meta.env.VITE_API_MAP_SECRET_KEY
    if (!key || !String(key).trim()) return
    if (!containerRef.current) return

    let disposed = false

    loadGoogleMaps(String(key))
      .then(() => {
        if (disposed) return
        if (!containerRef.current) return
        const center = value
          ? { lng: value[0], lat: value[1] }
          : { lng: defaultCenter[0], lat: defaultCenter[1] }

        const map =
          mapRef.current ??
          new window.google!.maps.Map(containerRef.current, {
            center,
            zoom,
            fullscreenControl: false,
            mapTypeControl: false,
            streetViewControl: false,
          })

        mapRef.current = map
        map.setCenter(center)

        const marker =
          markerRef.current ??
          new window.google!.maps.Marker({
            map,
            position: center,
          })
        markerRef.current = marker
        marker.setPosition(center)

        window.google!.maps.event.clearListeners(map, 'click')
        map.addListener('click', (e: any) => {
          const lat = e.latLng?.lat()
          const lng = e.latLng?.lng()
          if (typeof lat !== 'number' || typeof lng !== 'number') return
          const coords: LngLat = [lng, lat]
          marker.setPosition({ lng, lat })
          onChange(coords)
        })
      })
      .catch(() => {
        // Ignore; UI can still work with manual input if needed.
      })

    return () => {
      disposed = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCenter, height, onChange, value, zoom])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height, width: '100%', borderRadius: 12, overflow: 'hidden' }}
    />
  )
}

