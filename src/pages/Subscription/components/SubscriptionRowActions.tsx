import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SubscriptionRow } from '../subscriptionData'

interface SubscriptionRowActionsProps {
  row: SubscriptionRow
  onCancel: (row: SubscriptionRow) => void
}

/** Host / Business: cancel subscription only (no edit). */
export function SubscriptionRowActions({ row, onCancel }: SubscriptionRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-none text-destructive hover:bg-destructive/10"
        onClick={() => onCancel(row)}
      >
        <XCircle className="h-4 w-4 mr-1.5" />
        Cancel
      </Button>
    </div>
  )
}
