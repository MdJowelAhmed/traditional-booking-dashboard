import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Minus, Plus } from 'lucide-react'
import { FormInput } from '@/components/common/Form/FormInput'
import { FormTextarea } from '@/components/common/Form/FormTextarea'
import { FormSelect } from '@/components/common/Form/FormSelect'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from '@/utils/toast'
import { MAX_IMAGE_SIZE } from '@/utils/constants'
import { formatFileSize } from '@/utils/formatters'
import { MultiImageUploader } from '@/components/common/MultiImageUploader'
import { GoogleMapPicker, type LngLat } from '@/components/common/GoogleMapPicker'
import {
  useCreateMyHostListingMutation,
  useGetAllMyHostListQuery,
  useUpdateMyHostListingMutation,
} from '@/redux/api/hostMyListingApi'
import { useGetCategoriesQuery } from '@/redux/api/categoryApi'

const PRICE_UNITS = [
  { value: 'per_month', label: 'Per Month' },
  { value: 'per_week', label: 'Per Week' },
  { value: 'per_day', label: 'Per Day' },
  { value: 'per_hour', label: 'Per Hour' },
]

const hostFormSchema = z
  .object({
    name: z.string().min(1, 'Property name is required'),
    categoryId: z.string().min(1, 'Category is required'),
    size: z.coerce.number().positive('Enter a valid size'),
    price: z.coerce.number().positive('Enter a valid price'),
    priceUnit: z.string().min(1, 'Price unit is required'),
    address: z.string().min(1, 'Address is required'),
    facilities: z
      .array(z.object({ value: z.string().min(1, 'Required') }))
      .min(1, 'Add at least one facility'),
    description: z.string().min(1, 'Description is required'),
  })

type HostFormValues = z.infer<typeof hostFormSchema>

export default function CreateEditHostListingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [images, setImages] = useState<Array<string | File>>([])
  const [coords, setCoords] = useState<LngLat | null>(null)

  const { data: listData } = useGetAllMyHostListQuery({ page: 1, limit: 200 })
  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetCategoriesQuery({ type: 'category' })
  const existing = useMemo(() => {
    if (!id) return undefined
    return listData?.data?.find((x) => x._id === id)
  }, [id, listData?.data])
  const isEdit = Boolean(id)

  const [createListing, { isLoading: isCreating }] =
    useCreateMyHostListingMutation()
  const [updateListing, { isLoading: isUpdating }] =
    useUpdateMyHostListingMutation()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<HostFormValues>({
    resolver: zodResolver(hostFormSchema),
    defaultValues: {
      name: '',
      categoryId: '',
      size: 0,
      price: 0,
      priceUnit: 'per_month',
      address: '',
      facilities: [{ value: '' }],
      description: '',
    },
  })

  const facilitiesArray = useFieldArray({
    control,
    name: 'facilities',
  })

  const priceUnit = watch('priceUnit')
  const categoryId = watch('categoryId')
  const facilities = watch('facilities')

  const categoryOptions = useMemo(() => {
    const items = categoryData?.data ?? []
    return items
      .filter((x) => x.type === 'category')
      .map((x) => ({ value: x._id, label: x.name }))
  }, [categoryData?.data])

  useEffect(() => {
    if (existing) {
      setImages(existing.images ?? [])
      const c = existing.location?.coordinates
      setCoords(c?.length === 2 ? [c[0], c[1]] : null)
      reset({
        name: existing.name ?? '',
        categoryId: existing.categoryId ?? '',
        size: existing.size ?? 0,
        price: existing.price ?? 0,
        priceUnit: existing.priceUnit ?? 'per_month',
        address: existing.address ?? '',
        facilities:
          (existing.facilities ?? []).length > 0
            ? (existing.facilities ?? []).map((v) => ({ value: v }))
            : [{ value: '' }],
        description: existing.description ?? '',
      })
    } else {
      setImages([])
      setCoords(null)
      reset({
        name: '',
        categoryId: '',
        size: 0,
        price: 0,
        priceUnit: 'per_month',
        address: '',
        facilities: [{ value: '' }],
        description: '',
      })
    }
  }, [existing, reset, id])

  useEffect(() => {
    if (id && !existing && listData?.data) {
      toast({ title: 'Listing not found', variant: 'destructive' })
      navigate('/my-host-listing')
    }
  }, [existing, id, listData?.data, navigate])

  const onSubmit = async (data: HostFormValues) => {
    if (!images.length) {
      toast({
        variant: 'destructive',
        title: 'Please upload at least one property photo',
      })
      return
    }
    if (!coords) {
      toast({
        variant: 'destructive',
        title: 'Please select a location on the map',
      })
      return
    }

    const payload = {
      name: data.name.trim(),
      categoryId: data.categoryId.trim(),
      size: data.size,
      price: data.price,
      priceUnit: data.priceUnit,
      location: { type: 'Point' as const, coordinates: coords },
      address: data.address.trim(),
      facilities: data.facilities.map((x) => x.value.trim()).filter(Boolean),
      description: data.description.trim(),
    }

    const fd = new FormData()
    fd.append('data', JSON.stringify(payload))
    images.forEach((img) => {
      if (typeof img !== 'string') fd.append('images', img)
    })

    try {
      if (id) {
        await updateListing({ id, body: fd }).unwrap()
        toast({ title: 'Listing updated', variant: 'success' })
      } else {
        await createListing(fd).unwrap()
        toast({ title: 'Listing created', variant: 'success' })
      }
      navigate('/my-host-listing')
    } catch {
      toast({ title: 'Could not save listing', variant: 'destructive' })
    }
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
          <MultiImageUploader
            value={images}
            onChange={setImages}
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
            className="max-w-3xl"
          />
        </div>

        <div className="rounded-xl border border-border/60 bg-[#F7F7F7] p-5 sm:p-6 space-y-5">
          <h2 className="text-sm font-semibold text-[#2d2d2d]">
            Basic Information
          </h2>

          <div className="[&_button]:bg-[#EBEBEB] space-y-5">
            <FormInput
              label="Property Name"
              placeholder="e.g., Modern Apartment in Mohakhali"
              required
              {...register('name')}
              error={errors.name?.message}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                label="Category"
                name="categoryId"
                value={categoryId || ''}
                options={categoryOptions}
                onChange={(v) => setValue('categoryId', v, { shouldValidate: true })}
                placeholder={isCategoryLoading ? 'Loading…' : 'Select category'}
                required
                disabled={isCategoryLoading}
                error={errors.categoryId?.message}
              />
              <FormInput
                label="Size"
                type="number"
                step="1"
                placeholder="e.g., 1200"
                required
                {...register('size')}
                error={errors.size?.message}
              />
            </div>

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

            <div className="space-y-2">
              <Label className="text-sm font-medium">Pick Location on Map</Label>
              <GoogleMapPicker
                value={coords}
                onChange={setCoords}
                className="border border-border/60"
                height={320}
              />
              <p className="text-xs text-muted-foreground">
                Selected coordinates:{' '}
                <span className="font-medium text-foreground">
                  {coords
                    ? `[${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}]`
                    : '—'}
                </span>
              </p>
            </div>

            <FormInput
              label="Address"
              placeholder="e.g., 123 Main street, New York"
              required
              {...register('address')}
              error={errors.address?.message}
            />

            <div className="space-y-2">
              <Label className={errors.facilities ? 'text-destructive' : undefined}>
                Facilities
                <span className="text-destructive ml-1">*</span>
              </Label>

              <div className="grid gap-4 sm:grid-cols-2">
                {(facilities ?? []).map((_, idx) => {
                  const canRemove = (facilities?.length ?? 0) > 1
                  return (
                    <div key={idx} className="flex items-end gap-2">
                      <div className="flex-1">
                        <FormInput
                          placeholder="e.g., WiFi"
                          {...register(`facilities.${idx}.value`)}
                          error={
                            errors.facilities?.[idx]?.value?.message as
                              | string
                              | undefined
                          }
                        />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0"
                        onClick={() => facilitiesArray.append({ value: '' })}
                        aria-label="Add facility"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>

                      {canRemove && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 shrink-0"
                          onClick={() => facilitiesArray.remove(idx)}
                          aria-label="Remove facility"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>

              {typeof errors.facilities?.message === 'string' && (
                <p className="text-xs text-destructive">{errors.facilities.message}</p>
              )}
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
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            className="w-full max-w-md rounded-xl bg-[#76B52F] py-6 text-base font-semibold text-white hover:bg-[#659928]"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
