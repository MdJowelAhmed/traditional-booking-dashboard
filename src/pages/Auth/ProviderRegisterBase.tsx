import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper } from '@/components/common/ModalWrapper'
import { FormInput } from '@/components/common/Form/FormInput'
import { FormTextarea } from '@/components/common/Form/FormTextarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

export type ProviderType = 'business' | 'host'

const schema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  location: z.string().min(1, 'Location is required'),
  cityState: z.string().min(1, 'City/State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  about: z.string().min(1, 'About is required'),
  phone: z.string().min(1, 'Phone number is required'),
  officeAddress: z.string().min(1, 'Office address is required'),
  email: z.string().email('Enter a valid email'),
  website: z.string().min(1, 'Website is required'),
})

type FormValues = z.infer<typeof schema>

function DocumentDrop({
  value,
  onChange,
  error,
}: {
  value: File | null
  onChange: (f: File | null) => void
  error?: string
}) {
  const fileLabel = value ? `${value.name} (${Math.round(value.size / 1024)} KB)` : null

  return (
    <div className="space-y-2">
      <p className={cn('text-sm font-medium text-slate-800', error && 'text-destructive')}>
        Business Registration/ Personal Documents <span className="text-destructive">*</span>
      </p>
      <label
        className={cn(
          'block rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors',
          'border-slate-200 hover:border-primary/60 hover:bg-primary/5',
          error && 'border-destructive'
        )}
      >
        <input
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        <div className="text-sm text-muted-foreground">
          <div className="font-medium">Upload Documents</div>
          <div className="text-blue-600 font-medium mt-1">Browse</div>
          {fileLabel && (
            <div className="mt-3 text-xs text-slate-700 break-all">{fileLabel}</div>
          )}
        </div>
      </label>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function ProviderRegisterBase({
  providerType,
}: {
  providerType: ProviderType
}) {
  const [docFile, setDocFile] = useState<File | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)

  const title = useMemo(
    () => (providerType === 'host' ? 'Register as Property host' : 'Register as Business provider'),
    [providerType]
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: '',
      location: '',
      cityState: '',
      zipCode: '',
      about: '',
      phone: '',
      officeAddress: '',
      email: '',
      website: '',
    },
  })

  useEffect(() => {
    // Ensure clean state when switching between pages.
    reset()
    setDocFile(null)
    setSuccessOpen(false)
  }, [providerType, reset])

  const onSubmit = async (data: FormValues) => {
    if (!docFile) return
    // Demo-only: no API call. Mimic async submit.
    await new Promise((r) => setTimeout(r, 250))
    console.log('✅ Provider submit', { providerType, ...data, document: docFile.name })
    setSuccessOpen(true)
    reset()
    setDocFile(null)
  }

  const docError = !docFile ? 'Please upload a document' : undefined

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2">
        {/* <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
          TB
        </div> */}
        {/* <p className="text-sm text-muted-foreground">Traditional Booking Owner</p> */}
        <h1 className="text-primary font-medium">{title}</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">Business Details</h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 space-y-6"
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Business Name"
                required
                placeholder="Premium Shoe Care"
                {...register('businessName')}
                error={errors.businessName?.message}
              />

              <FormInput
                label="Location"
                required
                placeholder="123 Street road"
                {...register('location')}
                error={errors.location?.message}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="City/ State"
                required
                placeholder="Wales"
                {...register('cityState')}
                error={errors.cityState?.message}
              />
              <FormInput
                label="Zip Code"
                required
                placeholder="1234"
                {...register('zipCode')}
                error={errors.zipCode?.message}
              />
            </div>
          </div>


          <div className="space-y-4">
            {/* <h3 className="text-sm font-semibold text-slate-900">Contact</h3> */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Phone number"
                required
                placeholder="123456789"
                {...register('phone')}
                error={errors.phone?.message}
              />
              <FormInput
                label="Office address"
                required
                placeholder="Wales, UK"
                {...register('officeAddress')}
                error={errors.officeAddress?.message}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Email"
                type="email"
                required
                placeholder="example@email.com"
                {...register('email')}
                error={errors.email?.message}
              />
              <FormInput
                label="Website"
                required
                placeholder="website.com"
                {...register('website')}
                error={errors.website?.message}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DocumentDrop value={docFile} onChange={setDocFile} error={docError} />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">About</h3>
              {/* <p className="text-xs text-muted-foreground">Short description about your company</p> */}
              <FormTextarea
                required
                placeholder="Type here"
                rows={5}
                {...register('about')}
                error={errors.about?.message}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || !docFile}
              className="w-full sm:w-[160px] bg-[#76B52F] hover:bg-[#659928] text-white"
            >
              {isSubmitting ? 'Submitting…' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>

      <ModalWrapper
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Submitted"
        size="sm"
        className="bg-white"
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-slate-700">
            You are successfully submitted. Please wait for admin approval. When approved you will receive an email.
          </p>
          <div className="flex justify-end">
            <Button
              type="button"
              className="bg-[#6BBF2D] hover:bg-[#5aad26] text-white"
              onClick={() => setSuccessOpen(false)}
            >
              OK
            </Button>
          </div>
        </div>
      </ModalWrapper>
    </div>
  )
}

