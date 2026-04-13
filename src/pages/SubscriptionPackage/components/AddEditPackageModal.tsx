import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper, FormInput, FormSelect } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/utils/toast'
import type { AdminSubscriptionPackage } from '../subscriptionPackageData'

const PACKAGE_TYPE_OPTIONS = [
  { value: 'host', label: 'Host' },
  { value: 'business', label: 'Business' },
] as const

const schema = z
  .object({
    packageType: z.enum(['host', 'business'], { required_error: 'Select a package type' }),
    name: z.string().min(1, 'Package name is required'),
    price: z.coerce.number().positive('Price must be greater than 0'),
    billingLabel: z.string().min(1, 'Billing label is required'),
    mostPopular: z.boolean(),
    // Property (host)
    p0Label: z.string(),
    p1Label: z.string(),
    p2Label: z.string(),
    p0On: z.boolean(),
    p1On: z.boolean(),
    p2On: z.boolean(),
    // Service (business)
    s0Label: z.string(),
    s1Label: z.string(),
    s2Label: z.string(),
    s0On: z.boolean(),
    s1On: z.boolean(),
    s2On: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.packageType === 'host') {
      ;(['p0Label', 'p1Label', 'p2Label'] as const).forEach((key, i) => {
        if (!data[key].trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: `Feature ${i + 1} text is required`,
          })
        }
      })
    } else {
      ;(['s0Label', 's1Label', 's2Label'] as const).forEach((key, i) => {
        if (!data[key].trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: `Feature ${i + 1} text is required`,
          })
        }
      })
    }
  })

type FormValues = z.infer<typeof schema>

export type SaveSubscriptionPackageInput = {
  id?: string
  name: string
  price: number
  billingLabel: string
  mostPopular: boolean
  packageType: 'host' | 'business'
  propertyFeatureLabels: [string, string, string]
  propertyFeatures: [boolean, boolean, boolean]
  serviceFeatureLabels: [string, string, string]
  serviceFeatures: [boolean, boolean, boolean]
}

interface AddEditPackageModalProps {
  open: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  pkg: AdminSubscriptionPackage | null
  onSave: (payload: SaveSubscriptionPackageInput) => void
  /** When creating, pre-fill package type from the list tab (Host / Business) */
  defaultTypeForCreate?: 'host' | 'business'
}

const defaults: FormValues = {
  packageType: 'host',
  name: '',
  price: 37,
  billingLabel: 'Per Year',
  mostPopular: false,
  p0Label: '1-3 properties',
  p1Label: '4-6 properties',
  p2Label: '7 plus properties',
  p0On: true,
  p1On: false,
  p2On: false,
  s0Label: '1-3 services',
  s1Label: '4-6 services',
  s2Label: '7 plus services',
  s0On: true,
  s1On: false,
  s2On: false,
}

export function AddEditPackageModal({
  open,
  onClose,
  mode,
  pkg,
  onSave,
  defaultTypeForCreate = 'host',
}: AddEditPackageModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  })

  const packageType = watch('packageType')

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && pkg) {
      reset({
        packageType: pkg.packageType,
        name: pkg.name,
        price: pkg.price,
        billingLabel: pkg.billingLabel,
        mostPopular: pkg.mostPopular,
        p0Label: pkg.propertyFeatureLabels[0],
        p1Label: pkg.propertyFeatureLabels[1],
        p2Label: pkg.propertyFeatureLabels[2],
        p0On: pkg.propertyFeatures[0],
        p1On: pkg.propertyFeatures[1],
        p2On: pkg.propertyFeatures[2],
        s0Label: pkg.serviceFeatureLabels[0],
        s1Label: pkg.serviceFeatureLabels[1],
        s2Label: pkg.serviceFeatureLabels[2],
        s0On: pkg.serviceFeatures[0],
        s1On: pkg.serviceFeatures[1],
        s2On: pkg.serviceFeatures[2],
      })
    } else {
      reset({
        ...defaults,
        packageType: defaultTypeForCreate,
      })
    }
  }, [open, mode, pkg, reset, defaultTypeForCreate])

  const onSubmit = (data: FormValues) => {
    const propertyFeatureLabels: [string, string, string] =
      data.packageType === 'host'
        ? [data.p0Label.trim(), data.p1Label.trim(), data.p2Label.trim()]
        : pkg ? [...pkg.propertyFeatureLabels]
          : [defaults.p0Label, defaults.p1Label, defaults.p2Label]
    const propertyFeatures: [boolean, boolean, boolean] =
      data.packageType === 'host'
        ? [data.p0On, data.p1On, data.p2On]
        : pkg
          ? [...pkg.propertyFeatures]
          : [defaults.p0On, defaults.p1On, defaults.p2On]

    const serviceFeatureLabels: [string, string, string] =
      data.packageType === 'business'
        ? [data.s0Label.trim(), data.s1Label.trim(), data.s2Label.trim()]
        : pkg
          ? [...pkg.serviceFeatureLabels]
          : [defaults.s0Label, defaults.s1Label, defaults.s2Label]
    const serviceFeatures: [boolean, boolean, boolean] =
      data.packageType === 'business'
        ? [data.s0On, data.s1On, data.s2On]
        : pkg
          ? [...pkg.serviceFeatures]
          : [defaults.s0On, defaults.s1On, defaults.s2On]

    onSave({
      id: mode === 'edit' && pkg ? pkg.id : undefined,
      packageType: data.packageType,
      name: data.name.trim(),
      price: data.price,
      billingLabel: data.billingLabel.trim(),
      mostPopular: data.mostPopular,
      propertyFeatureLabels,
      propertyFeatures,
      serviceFeatureLabels,
      serviceFeatures,
    })
    toast({
      variant: 'success',
      title: mode === 'create' ? 'Package created' : 'Package updated',
    })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Create subscription package' : 'Edit subscription package'}
      size="lg"
      className="bg-white rounded-2xl"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin"
      >
        <FormSelect
          label="Package type"
          name="packageType"
          value={packageType}
          options={[...PACKAGE_TYPE_OPTIONS]}
          onChange={(v) =>
            setValue('packageType', v as 'host' | 'business', { shouldValidate: true })
          }
          placeholder="Select type"
          required
          error={errors.packageType?.message}
          helperText="Who will see this package in the app"
        />

        <FormInput label="Package name" required {...register('name')} error={errors.name?.message} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="Price (USD)"
            type="number"
            step="0.01"
            min={0}
            required
            {...register('price')}
            error={errors.price?.message}
          />
          <FormInput
            label="Billing label"
            placeholder="Per Year"
            required
            {...register('billingLabel')}
            error={errors.billingLabel?.message}
          />
        </div>

        <Controller
          name="mostPopular"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
              <div>
                <Label htmlFor="most-popular">Most popular</Label>
                <p className="text-xs text-muted-foreground">Show badge on this package</p>
              </div>
              <Switch id="most-popular" checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />

        <div className="pt-2">
          <p className="text-sm font-medium text-slate-800">
            {packageType === 'host' ? 'Property features (up to 3)' : 'Service features (up to 3)'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {packageType === 'host'
              ? 'Shown for host subscription packages'
              : 'Shown for business subscription packages'}
          </p>
        </div>

        {packageType === 'host' ? (
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
              <div className="flex-1">
                <FormInput
                  label="Feature 1"
                  {...register('p0Label')}
                  error={errors.p0Label?.message}
                />
              </div>
              <Controller
                name="p0On"
                control={control}
                render={({ field: f }) => (
                  <label className="flex items-center gap-2 text-sm pb-2 sm:pb-3 shrink-0 cursor-pointer">
                    <Checkbox
                      checked={f.value}
                      onCheckedChange={(v) => f.onChange(v === true)}
                    />
                    Included
                  </label>
                )}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
              <div className="flex-1">
                <FormInput
                  label="Feature 2"
                  {...register('p1Label')}
                  error={errors.p1Label?.message}
                />
              </div>
              <Controller
                name="p1On"
                control={control}
                render={({ field: f }) => (
                  <label className="flex items-center gap-2 text-sm pb-2 sm:pb-3 shrink-0 cursor-pointer">
                    <Checkbox
                      checked={f.value}
                      onCheckedChange={(v) => f.onChange(v === true)}
                    />
                    Included
                  </label>
                )}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
              <div className="flex-1">
                <FormInput
                  label="Feature 3"
                  {...register('p2Label')}
                  error={errors.p2Label?.message}
                />
              </div>
              <Controller
                name="p2On"
                control={control}
                render={({ field: f }) => (
                  <label className="flex items-center gap-2 text-sm pb-2 sm:pb-3 shrink-0 cursor-pointer">
                    <Checkbox
                      checked={f.value}
                      onCheckedChange={(v) => f.onChange(v === true)}
                    />
                    Included
                  </label>
                )}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
              <div className="flex-1">
                <FormInput
                  label="Feature 1"
                  {...register('s0Label')}
                  error={errors.s0Label?.message}
                />
              </div>
              <Controller
                name="s0On"
                control={control}
                render={({ field: f }) => (
                  <label className="flex items-center gap-2 text-sm pb-2 sm:pb-3 shrink-0 cursor-pointer">
                    <Checkbox
                      checked={f.value}
                      onCheckedChange={(v) => f.onChange(v === true)}
                    />
                    Included
                  </label>
                )}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
              <div className="flex-1">
                <FormInput
                  label="Feature 2"
                  {...register('s1Label')}
                  error={errors.s1Label?.message}
                />
              </div>
              <Controller
                name="s1On"
                control={control}
                render={({ field: f }) => (
                  <label className="flex items-center gap-2 text-sm pb-2 sm:pb-3 shrink-0 cursor-pointer">
                    <Checkbox
                      checked={f.value}
                      onCheckedChange={(v) => f.onChange(v === true)}
                    />
                    Included
                  </label>
                )}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
              <div className="flex-1">
                <FormInput
                  label="Feature 3"
                  {...register('s2Label')}
                  error={errors.s2Label?.message}
                />
              </div>
              <Controller
                name="s2On"
                control={control}
                render={({ field: f }) => (
                  <label className="flex items-center gap-2 text-sm pb-2 sm:pb-3 shrink-0 cursor-pointer">
                    <Checkbox
                      checked={f.value}
                      onCheckedChange={(v) => f.onChange(v === true)}
                    />
                    Included
                  </label>
                )}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#6BBF2D] hover:bg-[#5aad26] text-white">
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
