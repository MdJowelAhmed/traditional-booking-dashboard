import { Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatters'
import type { MyListing } from '@/types/myListing'

interface ListingCardProps {
  listing: MyListing
  onDelete: (listing: MyListing) => void
}

export function ListingCard({ listing, onDelete }: ListingCardProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#22C55E] px-2.5 py-1 text-xs font-semibold text-white">
          <Star className="h-3.5 w-3.5 fill-white text-white" />
          {listing.rating.toFixed(1)}
        </div>
        <div
          className={cn(
            'absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium text-white',
            listing.status === 'active' ? 'bg-black/55' : 'bg-black/45'
          )}
        >
          {listing.status === 'active' ? 'Active' : 'Inactive'}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-[#2d2d2d] line-clamp-2">
            {listing.title}
          </h3>
          <span className="shrink-0 text-base font-bold text-[#0C5822]">
            {formatCurrency(listing.price)}
          </span>
        </div>
        <div className="mt-auto flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-full border-2 border-[#22C55E] bg-white text-[#0C5822] hover:bg-[#CEF8DA]"
            onClick={() => navigate(`/my-listing/${listing.id}/edit`)}
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
