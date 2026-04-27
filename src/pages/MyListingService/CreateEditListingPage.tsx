import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FormInput } from '@/components/common/Form/FormInput'
import { FormTextarea } from '@/components/common/Form/FormTextarea'
import { FormSelect } from '@/components/common/Form/FormSelect'
import { toast } from '@/utils/toast'
import type {
  MyListingDailySchedule,
  MyListingHourlySchedule,
  MyListingScheduleBasis,
} from '@/types/myListing'
import { SetTimeModal } from './SetTimeModal'
import { cn } from '@/utils/cn'
import { MultiImageUploader } from '@/components/common/MultiImageUploader'
import {
  useCreateMyServiceListingMutation,
  useGetAllMyServiceListQuery,
  useUpdateMyServiceListingMutation,
} from '@/redux/api/serviceMyListingApi'

const SCHEDULE_NONE = '__none__'

const listingSchema = z
  .object({
    name: z.string().min(1, 'Service name is required'),
    price: z.coerce.number().positive('Enter a valid price'),
    discount: z.coerce.number().min(0, 'Must be 0 or more'),
    description: z.string().min(1, 'Description is required'),
    scheduleBasis: z.enum(['daily', 'hourly']).optional(),
  })
  .refine((d) => d.scheduleBasis !== undefined, {
    path: ['scheduleBasis'],
    message: 'Select a schedule type',
  })

type ListingFormValues = z.infer<typeof listingSchema>

const SCHEDULE_OPTIONS = [
  { value: 'daily', label: 'Daily basis' },
  { value: 'hourly', label: 'Hourly basis' },
]

function toApiDayKey(key: string): string | null {
  const k = key.toLowerCase()
  if (k === 'all') return null
  if (k === 'sun' || k === 'sunday') return 'SUNDAY'
  if (k === 'mon' || k === 'monday') return 'MONDAY'
  if (k === 'tue' || k === 'tuesday') return 'TUESDAY'
  if (k === 'wed' || k === 'wednesday') return 'WEDNESDAY'
  if (k === 'thu' || k === 'thursday') return 'THURSDAY'
  if (k === 'fri' || k === 'friday') return 'FRIDAY'
  if (k === 'sat' || k === 'saturday') return 'SATURDAY'
  return null
}

function summarizeSchedule(
  basis: MyListingScheduleBasis,
  daily?: MyListingDailySchedule,
  hourly?: MyListingHourlySchedule
): string {
  if (basis === 'daily' && daily?.selectedDays?.length) {
    const labels = daily.selectedDays.join(', ')
    return `Daily · ${labels}`
  }
  if (basis === 'hourly' && hourly?.timeSlots?.length) {
    return `Hourly · ${hourly.duration} · ${hourly.timeSlots.length} time slot(s)`
  }
  if (basis === 'daily') return 'Daily · tap calendar to set days'
  return 'Hourly · tap calendar to set slots'
}

export default function CreateEditListingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [images, setImages] = useState<Array<string | File>>([])

  const { data: listData } = useGetAllMyServiceListQuery({ page: 1, limit: 200 })
  const existing = useMemo(() => {
    if (!id) return undefined
    return listData?.data?.find((x) => x._id === id)
  }, [id, listData?.data])
  const isEdit = Boolean(id)

  const [createService, { isLoading: isCreating }] =
    useCreateMyServiceListingMutation()
  const [updateService, { isLoading: isUpdating }] =
    useUpdateMyServiceListingMutation()
  const [dailySchedule, setDailySchedule] = useState<
    MyListingDailySchedule | undefined
  >(undefined)
  const [hourlySchedule, setHourlySchedule] = useState<
    MyListingHourlySchedule | undefined
  >(undefined)
  const [timeModalOpen, setTimeModalOpen] = useState(false)
  const [timeModalMode, setTimeModalMode] = useState<'daily' | 'hourly'>(
    'daily'
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      name: existing?.name ?? '',
      price: existing?.price ?? 0,
      discount: existing?.discount ?? 0,
      description: existing?.description ?? '',
      scheduleBasis:
        existing?.scheduleType === 'HOURLY'
          ? 'hourly'
          : existing?.scheduleType === 'DAILY'
            ? 'daily'
            : undefined,
    },
  })

  const scheduleBasis = watch('scheduleBasis')
  const scheduleSelectValue = scheduleBasis ?? SCHEDULE_NONE

  useEffect(() => {
    if (!existing) return
    setImages(existing.images ?? [])
    setValue('name', existing.name)
    setValue('price', existing.price)
    setValue('discount', existing.discount ?? 0)
    setValue('description', existing.description)
    const basis =
      existing.scheduleType === 'HOURLY'
        ? 'hourly'
        : existing.scheduleType === 'DAILY'
          ? 'daily'
          : undefined
    setValue('scheduleBasis', basis)
    if (basis === 'daily') {
      const selectedDays = (existing.schedules ?? [])
        .map((s) => (s.day ? s.day.toLowerCase() : ''))
        .filter(Boolean)
      setDailySchedule({ selectedDays })
    }
  }, [existing, setValue])

  useEffect(() => {
    if (id && !existing && listData?.data) {
      toast({ title: 'Listing not found', variant: 'destructive' })
      navigate('/my-service-listing')
    }
  }, [existing, id, listData?.data, navigate])

  const openScheduleModal = (mode: 'daily' | 'hourly') => {
    setTimeModalMode(mode)
    setTimeModalOpen(true)
  }

  const onScheduleTypeChange = (value: string) => {
    if (value === SCHEDULE_NONE) {
      setValue('scheduleBasis', undefined, { shouldValidate: true })
      setDailySchedule(undefined)
      setHourlySchedule(undefined)
      return
    }
    if (value !== 'daily' && value !== 'hourly') return
    setValue('scheduleBasis', value, { shouldValidate: true })
    if (value === 'daily') {
      setHourlySchedule(undefined)
    } else {
      setDailySchedule(undefined)
    }
    openScheduleModal(value)
  }

  const onSubmit = async (data: ListingFormValues) => {
    const basis = data.scheduleBasis
    if (!basis) return

    if (basis === 'daily') {
      if (!dailySchedule?.selectedDays?.length) {
        toast({
          title: 'Please confirm your day selection in the schedule window.',
          variant: 'destructive',
        })
        openScheduleModal('daily')
        return
      }
    } else if (basis === 'hourly') {
      if (!hourlySchedule?.timeSlots?.length) {
        toast({
          title: 'Select at least one time slot for hourly availability.',
          variant: 'destructive',
        })
        openScheduleModal('hourly')
        return
      }
    }

    if (!images.length) {
      toast({ title: 'Please upload at least one image', variant: 'destructive' })
      return
    }

    const existingImagePaths = images.filter(
      (x): x is string => typeof x === 'string' && x.trim().length > 0
    )

    const scheduleType = basis.toUpperCase()
    const schedules =
      basis === 'daily'
        ? (dailySchedule?.selectedDays ?? [])
            .map((d) => toApiDayKey(d))
            .filter(Boolean)
            .map((day) => ({ day }))
        : (hourlySchedule?.selectedDayKeys ?? [])
            .map((d) => toApiDayKey(d))
            .filter(Boolean)
            .map((day) => ({
              day,
              timeSlots: hourlySchedule?.timeSlots ?? [],
            }))

    const payload: Record<string, unknown> = {
      name: data.name.trim(),
      price: data.price,
      discount: data.discount,
      description: data.description.trim(),
      scheduleType,
      schedules,
      // for hourly (optional, server may ignore)
      duration: basis === 'hourly' ? hourlySchedule?.duration : undefined,
    }

    // Important: on create, don't send `images: []` in JSON; some backends treat it
    // as the source of truth and overwrite uploaded files. On edit, send existing
    // image paths to preserve them when user doesn't upload new ones.
    if (id && existingImagePaths.length) {
      payload.images = existingImagePaths
    }

    const fd = new FormData()
    fd.append('data', JSON.stringify(payload))
    images.forEach((img) => {
      if (typeof img !== 'string') fd.append('images', img, img.name)
    })

    try {
      if (id) {
        await updateService({ id, body: fd }).unwrap()
        toast({ title: 'Service updated', variant: 'success' })
      } else {
        await createService(fd).unwrap()
        toast({ title: 'Service created', variant: 'success' })
      }
      navigate('/my-service-listing')
    } catch {
      toast({ title: 'Could not save service', variant: 'destructive' })
    }
  }

  return (
    <div className="mx-auto  space-y-8 bg-white p-8 rounded-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#2d2d2d] md:text-3xl">
          {isEdit ? 'Edit Listing' : 'Create New Listing'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          {isEdit
            ? 'Update your listing details and availability.'
            : 'Add a new service to your portfolio.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <Label className="text-base font-medium">Service Photos</Label>
          <div className="mt-2">
            <MultiImageUploader value={images} onChange={setImages} className="max-w-3xl" />
          </div>
        </div>

        <div className="rounded-xl p-6 space-y-5 border border-border/60 bg-[#F7F7F7]">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="Service Name"
              placeholder="e.g. Shoe Shining"
              required
              {...register('name')}
              error={errors.name?.message}
            />
            <FormInput
              label="Price"
              type="number"
              step="0.01"
              placeholder="$120.00"
              required
              {...register('price')}
              error={errors.price?.message}
            />
            <FormInput
              label="Discount"
              type="number"
              step="0.01"
              placeholder="10"
              required
              {...register('discount')}
              error={errors.discount?.message}
            />

            <div className="space-y-1.5">
              <FormSelect
                label="Select Schedule"
                name="scheduleBasis"
                value={scheduleSelectValue}
                options={[
                  { value: SCHEDULE_NONE, label: 'Select schedule type' },
                  ...SCHEDULE_OPTIONS,
                ]}
                onChange={onScheduleTypeChange}
                placeholder="Daily basis or Hourly basis"
                required
                error={errors.scheduleBasis?.message}
              />
              {scheduleBasis && (
                <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-[#22C55E] hover:text-[#16A34A] hover:bg-[#CEF8DA]"
                    aria-label="Edit schedule"
                    onClick={() => openScheduleModal(scheduleBasis)}
                  >
                    <Calendar className="h-5 w-5" />
                  </Button>
                  <p
                    className={cn(
                      'text-sm flex-1',
                      hourlySchedule?.timeSlots?.length ||
                        dailySchedule?.selectedDays?.length
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {summarizeSchedule(
                      scheduleBasis,
                      dailySchedule,
                      hourlySchedule
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          <FormTextarea
            label="Description"
            placeholder="Describe the service"
            rows={5}
            required
            {...register('description')}
            error={errors.description?.message}
          />
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            className="min-w-[200px] rounded-full bg-[#22C55E] px-10 py-6 text-base text-white hover:bg-[#16A34A]"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      <SetTimeModal
        open={timeModalOpen}
        onClose={() => setTimeModalOpen(false)}
        mode={timeModalMode}
        initialDaily={dailySchedule}
        initialHourly={hourlySchedule}
        onConfirm={({ daily, hourly }) => {
          if (daily) setDailySchedule(daily)
          if (hourly) setHourlySchedule(hourly)
        }}
      />
    </div>
  )
}

