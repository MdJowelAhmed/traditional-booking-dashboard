import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { imageUrl } from '@/components/common/imageUrl'
import type { PropertyApiDoc } from '@/redux/api/hostMyListingApi'

interface PropertyDetailsModalProps {
  open: boolean
  onClose: () => void
  listing: PropertyApiDoc | null
}

function formatPriceUnit(unit: string | undefined) {
  if (!unit) return ''
  return unit.replace(/_/g, ' ')
}

export function PropertyDetailsModal({
  open,
  onClose,
  listing,
}: PropertyDetailsModalProps) {
  const imgs = listing?.images ?? []
  const coords = listing?.location?.coordinates

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <DialogTitle className="text-xl text-[#2d2d2d]">
                {listing?.name ?? 'Property details'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {listing?._id ? `ID: ${listing._id}` : ''}
              </p>
            </div>
            {listing && (
              <Badge
                className={
                  listing.isActive
                    ? 'bg-[#22C55E] text-white'
                    : 'bg-muted text-foreground'
                }
              >
                {listing.isActive ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {listing && (
          <div className="space-y-6">
            {/* Images */}
            {imgs.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {imgs.slice(0, 4).map((p) => (
                  <div
                    key={p}
                    className="aspect-[4/3] overflow-hidden rounded-xl bg-muted border"
                  >
                    <img
                      src={imageUrl(p)}
                      alt={listing.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Key info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-[#F7F7F7] p-4">
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="mt-1 font-medium text-[#2d2d2d]">
                  {listing.category ?? '—'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Category ID: {listing.categoryId}
                </p>
              </div>

              <div className="rounded-xl border bg-[#F7F7F7] p-4">
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="mt-1 font-medium text-[#2d2d2d]">
                  {listing.price} ({formatPriceUnit(listing.priceUnit)})
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Size: {listing.size}
                </p>
              </div>

              <div className="rounded-xl border bg-[#F7F7F7] p-4 sm:col-span-2">
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="mt-1 font-medium text-[#2d2d2d]">
                  {listing.address}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-xl border bg-white p-4">
              <p className="text-sm font-semibold text-[#2d2d2d]">Location</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Type: {listing.location?.type ?? '—'}
              </p>
              <p className="mt-1 text-sm">
                Coordinates:{' '}
                <span className="font-medium">
                  {coords?.length === 2
                    ? `[${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}]`
                    : '—'}
                </span>
              </p>
            </div>

            {/* Facilities */}
            <div className="rounded-xl border bg-white p-4">
              <p className="text-sm font-semibold text-[#2d2d2d]">Facilities</p>
              {listing.facilities?.length ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {listing.facilities.map((f) => (
                    <div
                      key={f}
                      className="rounded-lg border bg-[#F7F7F7] px-3 py-2 text-sm"
                    >
                      {f}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">—</p>
              )}
            </div>

            {/* Description */}
            <div className="rounded-xl border bg-white p-4">
              <p className="text-sm font-semibold text-[#2d2d2d]">Description</p>
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

