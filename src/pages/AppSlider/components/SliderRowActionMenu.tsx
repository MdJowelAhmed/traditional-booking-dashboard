import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AppSliderItem } from '../sliderData'
import { isAppSliderOwner } from '../sliderOwnership'

interface SliderRowActionMenuProps {
  slider: AppSliderItem
  isSuperAdmin: boolean
  /** Logged-in user email (host/business). Used to allow edit/delete only on own sliders. */
  currentUserEmail?: string | null
  onEdit: (slider: AppSliderItem) => void
  onDelete: (slider: AppSliderItem) => void
}

export function SliderRowActionMenu({
  slider,
  isSuperAdmin,
  currentUserEmail,
  onEdit,
  onDelete,
}: SliderRowActionMenuProps) {
  if (isSuperAdmin) {
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

  if (!isAppSliderOwner(slider, currentUserEmail)) {
    return (
      <span
        className="text-xs text-muted-foreground"
        title="You can only edit or delete sliders you created"
      >
        —
      </span>
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
