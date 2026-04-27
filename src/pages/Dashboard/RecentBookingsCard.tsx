import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { imageUrl } from '@/components/common/imageUrl'
import type { RecentBookingItem as ApiBooking } from '@/redux/api/overviewApi'

function formatDateRange(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  return `${format(s, 'd MMM, yyyy')} - ${format(e, 'd MMM, yyyy')}`
}

function BookingRow({ item, index }: { item: RecentBookingItem; index: number }) {
  const isConfirmed = item.status === 'confirmed'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.05 * index }}
      className="flex gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm"
    >
      <img
        src={item.avatarUrl}
        alt=""
        className="h-14 w-14 shrink-0 rounded-lg object-cover"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-800">{item.customerName}</p>
        <p className="truncate text-sm text-muted-foreground">{item.serviceType}</p>
        <p className="mt-1 text-xs text-muted-foreground">{formatDateRange(item.startDate, item.endDate)}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-between gap-2">
        <span className="font-semibold text-primary">{formatCurrency(item.amount)}</span>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium',
            isConfirmed
              ? 'bg-primary/15 text-primary'
              : 'bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400'
          )}
        >
          {isConfirmed ? 'Confirmed' : 'Pending'}
        </span>
      </div>
    </motion.div>
  )
}

type RecentBookingItem = {
  id: string
  customerName: string
  serviceType: string
  startDate: string
  endDate: string
  amount: number
  status: 'pending' | 'confirmed'
  avatarUrl: string
}

function mapBooking(b: ApiBooking): RecentBookingItem {
  const bookingStatus = (b.bookingStatus || '').toUpperCase()
  const isConfirmed = bookingStatus === 'CONFIRMED'
  return {
    id: b._id,
    customerName: b.user?.name ?? '—',
    serviceType: b.property?.category ?? b.property?.name ?? '—',
    startDate: b.startDate,
    endDate: b.endDate,
    amount: b.payment?.amount ?? 0,
    status: isConfirmed ? 'confirmed' : 'pending',
    avatarUrl: imageUrl(b.user?.image),
  }
}

export function RecentBookingsCard({
  items,
  isLoading,
}: {
  items: ApiBooking[]
  isLoading?: boolean
}) {
  const mapped = items.map(mapBooking)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.35 }}
      className="h-full"
    >
      <Card className="flex h-full flex-col border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-bold text-card-foreground">Recent Bookings</CardTitle>
          <Link
            to="/booking-management"
            className="rounded-md p-1.5 text-primary transition-opacity hover:opacity-80"
            title="View all bookings"
            aria-label="Open booking management"
          >
            <ExternalLink className="h-5 w-5" strokeWidth={2} />
          </Link>
        </CardHeader>
        <CardContent className="flex-1 pt-0">
          <div
            className="max-h-[min(480px,calc(100vh-16rem))] space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#70B72B_#E5E7EB] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#E5E7EB] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#70B72B]"
          >
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : mapped.length ? (
              mapped.map((item, index) => (
                <BookingRow key={item.id} item={item} index={index} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent bookings.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
