import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormInput } from '@/components/common/Form/FormInput'
import { FormTextarea } from '@/components/common/Form/FormTextarea'
import { FormSelect } from '@/components/common/Form/FormSelect'
import { ImageUploader } from '@/components/common/ImageUploader'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { addMyListing, updateMyListing } from '@/redux/slices/myListingSlice'
import { toast } from '@/utils/toast'
import type { MyListing } from '@/types/myListing'
import { MAX_IMAGE_SIZE } from '@/utils/constants'
import { formatFileSize } from '@/utils/formatters'

const PROPERTY_TYPES = [
  { value: 'garage', label: 'Garage' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'office', label: 'Office' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'other', label: 'Other' },
]

const PRICE_UNITS = [
  { value: 'per_month', label: 'Per Month' },
  { value: 'per_week', label: 'Per Week' },
  { value: 'per_day', label: 'Per Day' },
  { value: 'per_hour', label: 'Per Hour' },
]

const BED_BATH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0')
  return { value: n, label: n }
})

export function isHostResidentialPropertyType(propertyType: string): boolean {
  return ['house', 'villa', 'apartment'].includes(propertyType)
}

const hostFormSchema = z
  .object({
    propertyType: z.string().min(1, 'Property type is required'),
    title: z.string().min(1, 'Title is required'),
    sizeSqft: z.string().optional(),
    bedrooms: z.string().optional(),
    bathrooms: z.string().optional(),
    price: z.coerce.number().positive('Enter a valid price'),
    priceUnit: z.string().min(1, 'Price unit is required'),
    location: z.string().min(1, 'Location is required'),
    address: z.string().min(1, 'Address is required'),
    facilities: z.string().min(1, 'Facilities are required'),
    description: z.string().min(1, 'Description is required'),
  })
  .superRefine((data, ctx) => {
    if (isHostResidentialPropertyType(data.propertyType)) {
      if (!data.bedrooms?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Number of beds is required',
          path: ['bedrooms'],
        })
      }
      if (!data.bathrooms?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Bathroom count is required',
          path: ['bathrooms'],
        })
      }
    } else if (!data.sizeSqft?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Size is required',
        path: ['sizeSqft'],
      })
    }
  })

type HostFormValues = z.infer<typeof hostFormSchema>

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

function scheduleFromExisting(existing: MyListing | undefined) {
  if (existing?.scheduleBasis === 'hourly' && existing.hourlySchedule) {
    return {
      scheduleBasis: 'hourly' as const,
      dailySchedule: undefined,
      hourlySchedule: existing.hourlySchedule,
    }
  }
  if (existing?.dailySchedule) {
    return {
      scheduleBasis: 'daily' as const,
      dailySchedule: existing.dailySchedule,
      hourlySchedule: undefined,
    }
  }
  return {
    scheduleBasis: 'daily' as const,
    dailySchedule: { selectedDays: ['all'] },
    hourlySchedule: undefined,
  }
}

export default function CreateEditHostListingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.myListings.items)
  const existing = id ? items.find((x) => x.id === id) : undefined
  const isEdit = Boolean(existing)

  const [imageFile, setImageFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HostFormValues>({
    resolver: zodResolver(hostFormSchema),
    defaultValues: {
      propertyType: 'garage',
      title: '',
      sizeSqft: '',
      bedrooms: '01',
      bathrooms: '01',
      price: 0,
      priceUnit: 'per_month',
      location: '',
      address: '',
      facilities: '',
      description: '',
    },
  })

  const propertyType = watch('propertyType')
  const priceUnit = watch('priceUnit')
  const bedrooms = watch('bedrooms')
  const bathrooms = watch('bathrooms')
  const isResidential = isHostResidentialPropertyType(propertyType || '')

  useEffect(() => {
    setImageFile(null)
    if (existing) {
      reset({
        propertyType: existing.propertyType || 'garage',
        title: existing.title,
        sizeSqft: existing.sizeSqft ?? '',
        bedrooms: existing.bedrooms ?? '01',
        bathrooms: existing.bathrooms ?? '01',
        price: existing.price,
        priceUnit: existing.priceUnit || 'per_month',
        location: existing.location ?? '',
        address: existing.address ?? '',
        facilities: existing.facilities ?? '',
        description: existing.description,
      })
    } else {
      reset({
        propertyType: 'garage',
        title: '',
        sizeSqft: '',
        bedrooms: '01',
        bathrooms: '01',
        price: 0,
        priceUnit: 'per_month',
        location: '',
        address: '',
        facilities: '',
        description: '',
      })
    }
  }, [existing, reset, id])

  useEffect(() => {
    if (isEdit && id && !existing) {
      toast({ title: 'Listing not found', variant: 'destructive' })
      navigate('/my-listing')
    }
  }, [isEdit, id, existing, navigate])

  const titlePlaceholder = isResidential ? 'Apartment' : 'Garage'

  const onSubmit = async (data: HostFormValues) => {
    const existingUrl = existing?.imageUrl
    if (!imageFile && !existingUrl) {
      toast({
        variant: 'destructive',
        title: 'Please upload a property photo',
      })
      return
    }

    let imageUrl = existingUrl ?? DEFAULT_PLACEHOLDER_IMAGE
    if (imageFile) {
      try {
        imageUrl = await fileToDataUrl(imageFile)
      } catch {
        toast({ title: 'Could not read image file', variant: 'destructive' })
        return
      }
    }

    const { scheduleBasis, dailySchedule, hourlySchedule } =
      scheduleFromExisting(existing)

    const residential = isHostResidentialPropertyType(data.propertyType)

    const payload: MyListing = {
      id: existing?.id ?? '',
      title: data.title.trim(),
      price: data.price,
      discountPrice: existing?.discountPrice ?? 0,
      description: data.description.trim(),
      imageUrl,
      rating: existing?.rating ?? 5,
      status: existing?.status ?? 'active',
      scheduleBasis,
      dailySchedule,
      hourlySchedule,
      propertyType: data.propertyType,
      priceUnit: data.priceUnit,
      location: data.location.trim(),
      address: data.address.trim(),
      facilities: data.facilities.trim(),
      sizeSqft: residential ? undefined : data.sizeSqft?.trim(),
      bedrooms: residential ? data.bedrooms?.trim() : undefined,
      bathrooms: residential ? data.bathrooms?.trim() : undefined,
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
    <div className="mx-auto space-y-8 rounded-2xl bg-white p-8 shadow-sm border border-border/40">
      <div>
        <h1 className="text-2xl font-bold text-[#2d2d2d] md:text-3xl">
          {isEdit ? 'Edit Listing' : 'Create New Listing'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          {isEdit
            ? 'Update your listing details.'
            : 'Add a new property to your portfolio.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-2">
          <Label className="text-base font-medium text-[#2d2d2d]">
            Property Photos
          </Label>
          <ImageUploader
            value={imageFile ?? existing?.imageUrl ?? null}
            onChange={setImageFile}
            maxSize={MAX_IMAGE_SIZE}
            emptyTitle="Upload Photos"
            emptyDescription={
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-blue-600">Browse</span>
                <span className="mt-1 block text-xs">
                  JPG, PNG, WebP (max {formatFileSize(MAX_IMAGE_SIZE)})
                </span>
              </p>
            }
            className="max-w-lg"
          />
        </div>

        <div className="rounded-xl border border-border/60 bg-[#F7F7F7] p-5 sm:p-6 space-y-5">
          <h2 className="text-sm font-semibold text-[#2d2d2d]">
            Basic Information
          </h2>

          <div className="[&_button]:bg-[#EBEBEB] space-y-5">
            <FormSelect
              label="Property Type"
              name="propertyType"
              value={propertyType || 'garage'}
              options={PROPERTY_TYPES}
              onChange={(v) =>
                setValue('propertyType', v, { shouldValidate: true })
              }
              placeholder="Select type"
              required
              error={errors.propertyType?.message}
            />

            <FormInput
              label="Title"
              placeholder={titlePlaceholder}
              required
              {...register('title')}
              error={errors.title?.message}
            />

            {isResidential ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  label="Number Of Bed"
                  name="bedrooms"
                  value={bedrooms || '01'}
                  options={BED_BATH_OPTIONS}
                  onChange={(v) =>
                    setValue('bedrooms', v, { shouldValidate: true })
                  }
                  required
                  error={errors.bedrooms?.message}
                />
                <FormSelect
                  label="Bathroom"
                  name="bathrooms"
                  value={bathrooms || '01'}
                  options={BED_BATH_OPTIONS}
                  onChange={(v) =>
                    setValue('bathrooms', v, { shouldValidate: true })
                  }
                  required
                  error={errors.bathrooms?.message}
                />
              </div>
            ) : (
              <FormInput
                label="Size (Sqft)"
                placeholder="e.g., 360 sqft"
                required
                {...register('sizeSqft')}
                error={errors.sizeSqft?.message}
              />
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Price"
                type="number"
                step="0.01"
                placeholder="$1500.00"
                required
                {...register('price')}
                error={errors.price?.message}
              />
              <FormSelect
                label="Price Unit"
                name="priceUnit"
                value={priceUnit || 'per_month'}
                options={PRICE_UNITS}
                onChange={(v) =>
                  setValue('priceUnit', v, { shouldValidate: true })
                }
                required
                error={errors.priceUnit?.message}
              />
            </div>

            <FormInput
              label="Location"
              placeholder="e.g., Downtown, City Center"
              required
              {...register('location')}
              error={errors.location?.message}
            />

            <FormInput
              label="Address"
              placeholder="e.g., 123 Main street, New York"
              required
              {...register('address')}
              error={errors.address?.message}
            />

            <FormInput
              label="Facilities (Comma Separated)"
              placeholder="e.g., Wifi, Parking, Air Conditioning, Pet Friendly"
              required
              {...register('facilities')}
              error={errors.facilities?.message}
            />

            <FormTextarea
              label="Description"
              placeholder="e.g., Wifi, Parking, Air Conditioning, Pet Friendly"
              rows={5}
              required
              {...register('description')}
              error={errors.description?.message}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            className="w-full max-w-md rounded-xl bg-[#76B52F] py-6 text-base font-semibold text-white hover:bg-[#659928]"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
