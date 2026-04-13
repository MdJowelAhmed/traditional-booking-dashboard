import type { AppSliderItem } from './sliderData'

/** Host/business may edit/delete only sliders they created (same email as session). */
export function isAppSliderOwner(slider: AppSliderItem, sessionEmail: string | undefined | null): boolean {
  const a = sessionEmail?.trim().toLowerCase() ?? ''
  const b = slider.userEmail?.trim().toLowerCase() ?? ''
  return a.length > 0 && a === b
}
