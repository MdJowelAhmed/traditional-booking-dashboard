import { Check, Edit, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AppSliderItem } from '../sliderData'

interface SliderRowActionMenuProps {
  slider: AppSliderItem
  isSuperAdmin: boolean
  onEdit: (slider: AppSliderItem) => void
  onDelete: (slider: AppSliderItem) => void
  onApprove: (slider: AppSliderItem) => void
  onReject: (slider: AppSliderItem) => void
}

export function SliderRowActionMenu({
  slider,
  isSuperAdmin,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}: SliderRowActionMenuProps) {
  if (isSuperAdmin) {
    if (slider.status !== 'pending') {
      return <span className="text-xs text-muted-foreground">—</span>
    }
    return (
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-none text-[#0C5822] hover:bg-[#E7F6D5]"
          onClick={() => onApprove(slider)}
        >
          <Check className="h-4 w-4 mr-1.5" />
          Accept
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-none text-destructive hover:bg-destructive/10"
          onClick={() => onReject(slider)}
        >
          <X className="h-4 w-4 mr-1.5" />
          Reject
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className=" text-[#0C5822] border-none"
        onClick={() => onEdit(slider)}
      >
        <Edit className="h-4 w-4 mr-1.5" />
        Edit
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-none text-destructive hover:bg-destructive/10"
        onClick={() => onDelete(slider)}
      >
        <Trash2 className="h-4 w-4 mr-1.5" />
        Delete
      </Button>
    </div>
  )
}
