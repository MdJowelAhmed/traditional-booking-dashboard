import { useEffect, useState } from 'react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { ReviewItem } from '../reviewsData'

interface RespondToReviewModalProps {
  open: boolean
  onClose: () => void
  review: ReviewItem | null
  onSubmit: (payload: { reviewId: string; response: string }) => void | Promise<void>
  /** When true, disables actions (e.g. RTK mutation in flight) */
  isSubmitting?: boolean
}

export function RespondToReviewModal({
  open,
  onClose,
  review,
  onSubmit,
  isSubmitting = false,
}: RespondToReviewModalProps) {
  const [value, setValue] = useState('')

  useEffect(() => {
    if (open) {
      setValue(review?.response ?? '')
    }
  }, [open, review])

  if (!review) return null

  const busy = isSubmitting

  const handleSend = async () => {
    const response = value.trim()
    if (!response || busy) return
    try {
      await Promise.resolve(onSubmit({ reviewId: review.id, response }))
      onClose()
    } catch {
      // Parent shows toast; keep modal open for retry
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Respond to Review"
      description={`${review.guestName} • ${review.roomName}`}
      size="lg"
      className="max-w-2xl bg-white"
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-800 mb-1">
            Guest review
          </p>
          <p className="text-sm text-slate-700">{review.comment}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-800">Your response</p>
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Write your response..."
            className="min-h-[120px]"
          />
          <p className="text-xs text-muted-foreground">
            Keep it helpful and professional.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleSend()}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={!value.trim() || busy}
            isLoading={busy}
          >
            Send Response
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}

