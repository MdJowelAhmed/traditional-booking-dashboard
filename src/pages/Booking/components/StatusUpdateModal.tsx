import { useState } from 'react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { toast } from '@/utils/toast'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'
import type { BookingRow } from '../BookingTable'
import {
  useBookingCancelHostMutation,
  useBookingCompletedHostMutation,
  useServiceBookingCancelServiceMutation,
  useServiceBookingCompletedServiceMutation,
} from '@/redux/api/myBookingApi'

interface StatusUpdateModalProps {
  open: boolean
  onClose: () => void
  booking: BookingRow | null
}

export function StatusUpdateModal({ open, onClose, booking }: StatusUpdateModalProps) {
  const { user } = useAppSelector((s) => s.auth)
  const isHost = user?.role === UserRole.HOST
  const isService = user?.role === UserRole.SERVICE
  const [action, setAction] = useState<'complete' | 'cancel'>('complete')
  const [cancelHost, { isLoading: hostCancelling }] =
    useBookingCancelHostMutation()
  const [completeHost, { isLoading: hostCompleting }] =
    useBookingCompletedHostMutation()
  const [cancelService, { isLoading: serviceCancelling }] =
    useServiceBookingCancelServiceMutation()
  const [completeService, { isLoading: serviceCompleting }] =
    useServiceBookingCompletedServiceMutation()

  if (!booking) return null

  const isBusy =
    hostCancelling || hostCompleting || serviceCancelling || serviceCompleting

  const handleConfirm = async () => {
    try {
      if (isHost) {
        if (action === 'cancel') await cancelHost(booking.id).unwrap()
        else await completeHost(booking.id).unwrap()
      } else if (isService) {
        if (action === 'cancel') await cancelService(booking.id).unwrap()
        else await completeService(booking.id).unwrap()
      }
      toast({ title: 'Status updated', variant: 'success' })
      onClose()
    } catch {
      toast({ title: 'Could not update status', variant: 'destructive' })
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Update Booking Status"
      description={`Booking ID: ${booking.id}`}
      size="sm"
      className="bg-white"
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-800">Choose action</p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={action === 'complete' ? 'default' : 'outline'}
              className={
                action === 'complete'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : ''
              }
              onClick={() => setAction('complete')}
              disabled={isBusy}
            >
              Complete
            </Button>
            <Button
              type="button"
              variant={action === 'cancel' ? 'default' : 'outline'}
              className={
                action === 'cancel'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : ''
              }
              onClick={() => setAction('cancel')}
              disabled={isBusy}
            >
              Cancel
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="bg-primary hover:bg-primary/90 text-white"
            disabled={isBusy}
          >
            {isBusy ? 'Updating…' : 'Confirm'}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}

