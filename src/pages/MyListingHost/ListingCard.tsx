import { Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatters'
import { imageUrl } from '@/components/common/imageUrl'
import type { PropertyApiDoc } from '@/redux/api/hostMyListingApi'

interface ListingCardProps {
  listing: PropertyApiDoc
  onDelete: (listing: PropertyApiDoc) => void
  onView: (listing: PropertyApiDoc) => void
}

export function ListingCard({ listing, onDelete, onView }: ListingCardProps) {
  const navigate = useNavigate()
  const firstImage = listing.images?.[0]
  const statusText = listing.isActive ? 'Active' : 'Inactive'

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <img
          src={imageUrl(firstImage)}
          alt={listing.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#22C55E] px-2.5 py-1 text-xs font-semibold text-white">
          <Star className="h-3.5 w-3.5 fill-white text-white" />
          5.0
        </div>
        <div
          className={cn(
            'absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium text-white',
            listing.isActive ? 'bg-black/55' : 'bg-black/45'
          )}
        >
          {statusText}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-[#2d2d2d] line-clamp-2">
            {listing.name}
          </h3>
          <span className="shrink-0 text-base font-bold text-[#0C5822]">
            {formatCurrency(listing.price)}
          </span>
        </div>
        <div className="mt-auto flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-full border-2 border-[#0C5822]/30 bg-white text-[#0C5822] hover:bg-[#EEF7F0]"
            onClick={() => onView(listing)}
          >
            View
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-full border-2 border-[#22C55E] bg-white text-[#0C5822] hover:bg-[#CEF8DA]"
            onClick={() => navigate(`/my-host-listing/${listing._id}/edit`)}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-full border-2 border-destructive/50 text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(listing)}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
