import type { SellerFeedbackItem } from '@/redux/api/reviewRatingApi'

export type ReviewStatus = 'pending' | 'responded'

export interface ReviewItem {
  id: string
  guestName: string
  guestAvatarUrl?: string
  roomName: string
  rating: 1 | 2 | 3 | 4 | 5
  date: string // e.g. 20 Mar, 2026
  comment: string
  response?: string
  status: ReviewStatus
}

function resolveApiMediaUrl(path: string | undefined | null): string | undefined {
  if (!path?.trim()) return undefined
  const trimmed = path.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''
  return base ? `${base}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}` : trimmed
}

function formatReviewDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function mapSellerFeedbackToReviewItem(item: SellerFeedbackItem): ReviewItem {
  const r = Math.round(Number(item.rating))
  const rating = (Math.min(5, Math.max(1, r)) || 1) as ReviewItem['rating']
  return {
    id: item._id,
    guestName: item.userName ?? 'User',
    guestAvatarUrl: resolveApiMediaUrl(item.userImage),
    roomName: item.productName ?? '—',
    rating,
    date: formatReviewDate(item.createdAt),
    comment: item.comment ?? '',
    response: item.reply?.trim() ? item.reply : undefined,
    status: item.isResponded ? 'responded' : 'pending',
  }
}

export const mockReviews: ReviewItem[] = [
  {
    id: 'rvw-1001',
    guestName: 'Zabia Ferdousi',
    roomName: 'Deluxe Room',
    rating: 5,
    date: '20 Mar, 2026',
    comment:
      'Absolutely stunning property! The host was very responsive and helpful. The villa exceeded our expectations with its beautiful ocean views and modern amenities. Would definitely recommend to anyone looking for a luxurious beach getaway.',
    status: 'pending',
  },
  {
    id: 'rvw-1002',
    guestName: 'Zabia Ferdousi',
    roomName: 'Standard Room',
    rating: 5,
    date: '20 Mar, 2026',
    comment:
      'Absolutely stunning property! The host was very responsive and helpful. The villa exceeded our expectations with its beautiful ocean views and modern amenities. Would definitely recommend to anyone looking for a luxurious beach getaway.',
    response:
      "Thank you for your feedback! We’ve adjusted the heating system to ensure it warms up faster. Hope to host you again!",
    status: 'responded',
  },
  {
    id: 'rvw-1003',
    guestName: 'James Brown',
    roomName: 'Family Suite',
    rating: 4,
    date: '15 Mar, 2026',
    comment:
      'Great location and very clean. Check-in was smooth. A bit of noise at night but overall a nice stay.',
    status: 'pending',
  },
  {
    id: 'rvw-1004',
    guestName: 'Emily Davis',
    roomName: 'Ocean View',
    rating: 3,
    date: '10 Mar, 2026',
    comment:
      'Good place, friendly staff. The Wi-Fi was slow in the evenings.',
    status: 'pending',
  },
  {
    id: 'rvw-1005',
    guestName: 'Michael Smith',
    roomName: 'Deluxe Room',
    rating: 5,
    date: '05 Mar, 2026',
    comment:
      'Perfect stay! Everything was exactly as described.',
    status: 'pending',
  },
]

