import { useEffect, useState } from 'react'
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
import { ImageUploader } from '@/components/common/ImageUploader'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { addMyListing, updateMyListing } from '@/redux/slices/myListingSlice'
import { toast } from '@/utils/toast'
import type {
  MyListing,
  MyListingDailySchedule,
  MyListingHourlySchedule,
  MyListingScheduleBasis,
} from '@/types/myListing'
import { SetTimeModal } from './SetTimeModal'
import { cn } from '@/utils/cn'

const SCHEDULE_NONE = '__none__'

const listingSchema = z
  .object({
    title: z.string().min(1, 'Service name is required'),
    price: z.coerce.number().positive('Enter a valid price'),
    discountPrice: z.coerce.number().min(0, 'Must be 0 or more'),
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

const DEFAULT_PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80'

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
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
  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.myListings.items)
  const existing = id ? items.find((x) => x.id === id) : undefined
  const isEdit = Boolean(existing)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [dailySchedule, setDailySchedule] = useState<
    MyListingDailySchedule | undefined
  >(existing?.dailySchedule)
  const [hourlySchedule, setHourlySchedule] = useState<
    MyListingHourlySchedule | undefined
  >(existing?.hourlySchedule)
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
      title: existing?.title ?? '',
      price: existing?.price ?? 0,
      discountPrice: existing?.discountPrice ?? 0,
      description: existing?.description ?? '',
      scheduleBasis: existing?.scheduleBasis,
    },
  })

  const scheduleBasis = watch('scheduleBasis')
  const scheduleSelectValue = scheduleBasis ?? SCHEDULE_NONE

  useEffect(() => {
    if (!existing) return
    setValue('title', existing.title)
    setValue('price', existing.price)
    setValue('discountPrice', existing.discountPrice)
    setValue('description', existing.description)
    setValue('scheduleBasis', existing.scheduleBasis)
    setDailySchedule(existing.dailySchedule)
    setHourlySchedule(existing.hourlySchedule)
  }, [existing, setValue])

  useEffect(() => {
    if (isEdit && id && !existing) {
      toast({ title: 'Listing not found', variant: 'destructive' })
      navigate('/my-listing')
    }
  }, [isEdit, id, existing, navigate])

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

    let imageUrl = existing?.imageUrl ?? DEFAULT_PLACEHOLDER_IMAGE
    if (imageFile) {
      try {
        imageUrl = await fileToDataUrl(imageFile)
      } catch {
        toast({ title: 'Could not read image file', variant: 'destructive' })
        return
      }
    }

    const payload: MyListing = {
      id: existing?.id ?? '',
      title: data.title.trim(),
      price: data.price,
      discountPrice: data.discountPrice,
      description: data.description.trim(),
      imageUrl,
      rating: existing?.rating ?? 5,
      status: existing?.status ?? 'active',
      scheduleBasis: basis,
      dailySchedule: basis === 'daily' ? dailySchedule : undefined,
      hourlySchedule: basis === 'hourly' ? hourlySchedule : undefined,
    }

    if (isEdit && existing) {
      dispatch(updateMyListing({ ...payload, id: existing.id }))
      toast({ title: 'Listing updated', variant: 'success' })
    } else {
      dispatch(addMyListing({ ...payload, id: '' }))
      toast({ title: 'Listing created', variant: 'success' })
    }
    navigate('/my-listing')
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
            : 'Add a new property to your portfolio.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <Label className="text-base font-medium">Property Photos</Label>
          <div className="mt-2 w-80">
            <ImageUploader
              value={imageFile ?? existing?.imageUrl ?? null}
              onChange={setImageFile}
            />
          </div>
        </div>

        <div className="rounded-xl p-6 space-y-5 border border-border/60 bg-[#F7F7F7]">


          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="Service Name"
              placeholder="e.g. Shoe Shining"
              required
              {...register('title')}
              error={errors.title?.message}
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
              label="Discount Price"
              type="number"
              step="0.01"
              placeholder="$80.00"
              required
              {...register('discountPrice')}
              error={errors.discountPrice?.message}
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
            placeholder="e.g., Wifi, Parking, Air Conditioning, Pet Friendly"
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
          >
            Save Changes
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
