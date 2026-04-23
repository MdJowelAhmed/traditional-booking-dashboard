import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utils/cn'
import type {
  MyListingDailySchedule,
  MyListingHourlySchedule,
} from '@/types/myListing'
import {
  DAILY_DAY_OPTIONS,
  HOURLY_DURATION_OPTIONS,
  HOURLY_DAY_KEYS,
} from '@/types/myListing'

function buildHourlyTimeSlots(): string[] {
  const slots: string[] = []
  for (let h = 9; h <= 18; h++) {
    const ampm = h < 12 ? 'am' : 'pm'
    const hour12 = h % 12 === 0 ? 12 : h % 12
    slots.push(`${String(hour12).padStart(2, '0')}:00 ${ampm}`)
  }
  return slots
}

const TIME_SLOTS = buildHourlyTimeSlots()

const SHORT_DAY_LABELS: Record<(typeof HOURLY_DAY_KEYS)[number], string> = {
  all: 'All',
  sun: 'Sun',
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
}

interface SetTimeModalProps {
  open: boolean
  onClose: () => void
  mode: 'daily' | 'hourly'
  initialDaily?: MyListingDailySchedule
  initialHourly?: MyListingHourlySchedule
  onConfirm: (payload: {
    daily?: MyListingDailySchedule
    hourly?: MyListingHourlySchedule
  }) => void
}

export function SetTimeModal({
  open,
  onClose,
  mode,
  initialDaily,
  initialHourly,
  onConfirm,
}: SetTimeModalProps) {
  const [dailySelected, setDailySelected] = useState<string[]>(
    initialDaily?.selectedDays ?? []
  )
  const [duration, setDuration] = useState(
    initialHourly?.duration ?? HOURLY_DURATION_OPTIONS[0]
  )
  const [dayKeys, setDayKeys] = useState<string[]>(
    initialHourly?.selectedDayKeys ?? ['all']
  )
  const [slots, setSlots] = useState<string[]>(
    initialHourly?.timeSlots ?? []
  )

  useEffect(() => {
    if (!open) return
    if (mode === 'daily') {
      setDailySelected(initialDaily?.selectedDays ?? [])
    } else {
      setDuration(initialHourly?.duration ?? HOURLY_DURATION_OPTIONS[0])
      setDayKeys(
        initialHourly?.selectedDayKeys?.length
          ? initialHourly.selectedDayKeys
          : ['all']
      )
      setSlots(initialHourly?.timeSlots ?? [])
    }
  }, [open, mode, initialDaily, initialHourly])

  const toggleDailyDay = (key: string) => {
    if (key === 'all') {
      setDailySelected((prev) =>
        prev.includes('all') ? [] : DAILY_DAY_OPTIONS.map((d) => d.key)
      )
      return
    }
    setDailySelected((prev) => {
      const withoutAll = prev.filter((k) => k !== 'all')
      const next = withoutAll.includes(key)
        ? withoutAll.filter((k) => k !== key)
        : [...withoutAll, key]
      const allOthers = DAILY_DAY_OPTIONS.filter((d) => d.key !== 'all').map(
        (d) => d.key
      )
      if (allOthers.every((k) => next.includes(k))) {
        return [...next, 'all']
      }
      return next
    })
  }

  const toggleHourlyDayKey = (key: string) => {
    if (key === 'all') {
      setDayKeys((prev) => (prev.includes('all') ? [] : ['all']))
      return
    }
    setDayKeys((prev) => {
      const base = prev.filter((k) => k !== 'all')
      const next = base.includes(key)
        ? base.filter((k) => k !== key)
        : [...base, key]
      return next
    })
  }

  const toggleSlot = (slot: string) => {
    setSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    )
  }

  const handleConfirm = () => {
    if (mode === 'daily') {
      onConfirm({
        daily: { selectedDays: dailySelected },
      })
    } else {
      onConfirm({
        hourly: {
          duration,
          selectedDayKeys: dayKeys.length ? dayKeys : ['all'],
          timeSlots: slots,
        },
      })
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()} >
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col gap-4 sm:max-w-xl bg-white">
        <DialogHeader>
          <DialogTitle>Set time</DialogTitle>
        </DialogHeader>

        {mode === 'daily' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Select Service Type</Label>
              <Select value="daily" disabled>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily basis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm font-medium text-orange-600 mb-2">
                Day selection
              </p>
              <div className="space-y-2 rounded-md border bg-card p-3">
                {DAILY_DAY_OPTIONS.map((d) => (
                  <label
                    key={d.key}
                    className="flex items-center justify-between gap-3 rounded-sm px-2 py-2 hover:bg-muted/50 cursor-pointer"
                  >
                    <span className="text-sm">{d.label}</span>
                    <Checkbox
                      checked={dailySelected.includes(d.key)}
                      onCheckedChange={() => toggleDailyDay(d.key)}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === 'hourly' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Select Service Type</Label>
              <Select value="hourly" disabled>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly basis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Service Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURLY_DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Days</Label>
              <div className="flex flex-wrap gap-2">
                {HOURLY_DAY_KEYS.map((key) => {
                  const active =
                    key === 'all'
                      ? dayKeys.includes('all')
                      : dayKeys.includes('all') || dayKeys.includes(key)
                  return (
                    <Button
                      key={key}
                      type="button"
                      size="sm"
                      variant={active ? 'default' : 'outline'}
                      className={cn(
                        active &&
                          'bg-[#0C5822] hover:bg-[#0C5822]/90 text-white border-[#0C5822]'
                      )}
                      onClick={() => toggleHourlyDayKey(key)}
                    >
                      {SHORT_DAY_LABELS[key]}
                    </Button>
                  )
                })}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Time slots</Label>
              <div className="max-h-48 overflow-y-auto rounded-md border bg-card divide-y">
                {TIME_SLOTS.map((slot) => (
                  <label
                    key={slot}
                    className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-muted/40 cursor-pointer"
                  >
                    <span className="text-sm">{slot}</span>
                    <Checkbox
                      checked={slots.includes(slot)}
                      onCheckedChange={() => toggleSlot(slot)}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex !flex-row justify-center sm:justify-center">
          <Button
            type="button"
            className="min-w-[140px] rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-white"
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
