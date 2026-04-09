import type { ReactNode } from 'react'
import { ModalWrapper } from '@/components/common'
import type { Booking } from '@/types'
import { cn } from '@/utils/cn'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/utils/formatters'

interface BookingDetailsModalProps {
  open: boolean
  onClose: () => void
  booking: Booking | null
}

export function BookingDetailsModal({
  open,
  onClose,
  booking,
}: BookingDetailsModalProps) {
  if (!booking) return null

  const paymentPillClass =
    booking.paymentStatus === 'Paid'
      ? 'text-green-600'
      : booking.paymentStatus === 'Refunded'
        ? 'text-orange-600'
        : 'text-amber-600'

  function InfoRow({
    label,
    value,
    valueClassName,
  }: {
    label: string
    value: ReactNode
    valueClassName?: string
  }) {
    return (
      <div className="flex items-center justify-between gap-6 py-3 text-sm">
        <p className="text-muted-foreground">{label}</p>
        <p className={cn('font-medium text-foreground text-right', valueClassName)}>{value}</p>
      </div>
    )
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="User Service Booking Details"
      size="xl"
      className="bg-white"
    >
      <div className="space-y-6">
        {/* Header (avatar + name + email) */}
        <div className="flex flex-col items-center text-center pt-2">
          <Avatar className="h-20 w-20 ring-4 ring-muted">
            <AvatarImage src={undefined} alt={booking.clientName} />
            <AvatarFallback className="bg-muted text-foreground font-semibold">
              {getInitials(booking.clientName)}
            </AvatarFallback>
          </Avatar>
          <p className="mt-3 text-base font-semibold text-foreground">{booking.clientName}</p>
          <p className="text-xs text-muted-foreground">{booking.clientEmail || 'N/A'}</p>
        </div>

        {/* Info blocks */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-muted/40 px-5 py-4">
            <p className="text-sm font-semibold text-foreground">Basic Information</p>
            <div className="mt-3 divide-y divide-border">
              <InfoRow label="User ID" value={`#${booking.id}`} />
              <InfoRow label="Full Name" value={booking.clientName} />
              <InfoRow label="Email" value={booking.clientEmail || 'N/A'} />
              <InfoRow label="Phone" value={booking.clientPhone || 'N/A'} />
            </div>
          </div>

          <div className="rounded-2xl bg-muted/40 px-5 py-4">
            <p className="text-sm font-semibold text-foreground">Booking Details</p>
            <div className="mt-3 divide-y divide-border">
              <InfoRow label="Booking ID" value={`#${booking.id}`} />
              <InfoRow label="Price" value={booking.payment} />
              <InfoRow label="Selected Service" value={booking.plan} />
              <InfoRow label="Booking Date" value={booking.startDate} />
              <InfoRow label="Booking Time" value="09:00 AM" valueClassName="text-muted-foreground" />
              <InfoRow
                label="Payment Status"
                value={booking.paymentStatus}
                valueClassName={cn('font-semibold', paymentPillClass)}
              />
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
