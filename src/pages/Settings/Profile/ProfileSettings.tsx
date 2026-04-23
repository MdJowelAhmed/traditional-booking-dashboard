import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { FormInput, FormTextarea } from '@/components/common'
import { toast } from '@/utils/toast'
import { motion } from 'framer-motion'
import {
  useGetMyBusinessProfileQuery,
  useUpdateMyBusinessProfileMutation,
} from '@/redux/api/authApi'

function resolveApiMediaUrl(path: string | undefined | null): string | undefined {
  if (!path?.trim()) return undefined
  const trimmed = path.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''
  return base ? `${base}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}` : trimmed
}

function getErrorMessage(err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'data' in err &&
    err.data &&
    typeof err.data === 'object' &&
    'message' in err.data &&
    typeof (err.data as { message: unknown }).message === 'string'
  ) {
    return (err.data as { message: string }).message
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong. Please try again.'
}

const businessProfileSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  location: z.string().min(1, 'Location is required'),
  cityState: z.string().min(1, 'City / state is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  description: z.string().min(1, 'Description is required'),
  phoneNumber: z.string().min(8, 'Enter a valid phone number'),
  officeAddress: z.string().min(1, 'Office address is required'),
  email: z.string().email('Enter a valid business email'),
  website: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim() === '' || /^https?:\/\/.+/i.test(val.trim()),
      { message: 'Enter a valid URL (https://...)' }
    ),
})

type BusinessProfileFormData = z.infer<typeof businessProfileSchema>

export default function ProfileSettings() {
  const { data, isLoading, isError, refetch, isFetching } = useGetMyBusinessProfileQuery()
  const [updateMyBusinessProfile, { isLoading: isSaving }] = useUpdateMyBusinessProfileMutation()

  const business = data?.data
  const owner = business?.ownerId

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BusinessProfileFormData>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      name: '',
      location: '',
      cityState: '',
      zipCode: '',
      description: '',
      phoneNumber: '',
      officeAddress: '',
      email: '',
      website: '',
    },
  })

  useEffect(() => {
    if (!business) return
    reset({
      name: business.name ?? '',
      location: business.location ?? '',
      cityState: business.cityState ?? '',
      zipCode: business.zipCode ?? '',
      description: business.description ?? '',
      phoneNumber: business.phoneNumber ?? '',
      officeAddress: business.officeAddress ?? '',
      email: business.email ?? '',
      website: business.website ?? '',
    })
  }, [business, reset])

  const onSubmit = async (form: BusinessProfileFormData) => {
    const websiteTrimmed = form.website?.trim() ?? ''
    try {
      await updateMyBusinessProfile({
        name: form.name.trim(),
        location: form.location.trim(),
        cityState: form.cityState.trim(),
        zipCode: form.zipCode.trim(),
        description: form.description.trim(),
        phoneNumber: form.phoneNumber.trim(),
        officeAddress: form.officeAddress.trim(),
        email: form.email.trim(),
        website: websiteTrimmed,
      }).unwrap()

      toast({
        title: 'Profile updated',
        description: 'Your business profile has been saved.',
      })
    } catch (err) {
      toast({
        title: 'Update failed',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    }
  }

  const handleCancel = () => {
    if (!business) return
    reset({
      name: business.name ?? '',
      location: business.location ?? '',
      cityState: business.cityState ?? '',
      zipCode: business.zipCode ?? '',
      description: business.description ?? '',
      phoneNumber: business.phoneNumber ?? '',
      officeAddress: business.officeAddress ?? '',
      email: business.email ?? '',
      website: business.website ?? '',
    })
  }

  const ownerImageUrl = resolveApiMediaUrl(owner?.image)
  const businessImageUrl = resolveApiMediaUrl(business?.image)
  const ownerInitials = (owner?.name ?? '?')
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (isLoading || (isFetching && !business)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 max-w-4xl mx-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle>Business profile</CardTitle>
            <CardDescription>Loading…</CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    )
  }

  if (isError || !business) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 max-w-4xl mx-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle>Business profile</CardTitle>
            <CardDescription>Could not load your business profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <Card>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center pt-8">
                <Avatar className="h-32 w-32 shrink-0">
                  <AvatarImage src={ownerImageUrl} alt={owner?.name ?? 'Owner'} />
                  <AvatarFallback>{ownerInitials}</AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Name: </span>
                    <span className="font-medium">{owner?.name ?? '—'}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email: </span>
                    <span className="font-medium">{owner?.email ?? '—'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* <Separator />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                {businessImageUrl ? (
                  <img
                    src={businessImageUrl}
                    alt={business.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">Business image</h3>
                <p className="text-sm text-muted-foreground">
                  Shown as returned by the server. Image uploads use a separate flow.
                </p>
              </div>
            </div> */}

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold">Business details</h3>
              <FormInput
                label="Business name"
                placeholder="Your business name"
                error={errors.name?.message}
                required
                {...register('name')}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="Business email"
                  type="email"
                  placeholder="contact@example.com"
                  error={errors.email?.message}
                  required
                  {...register('email')}
                  disabled
                />
                <FormInput
                  label="Website"
                  type="url"
                  placeholder="https://"
                  error={errors.website?.message}
                  {...register('website')}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="Location"
                  placeholder="Area or district"
                  error={errors.location?.message}
                  required
                  {...register('location')}
                />
                <FormInput
                  label="City / state"
                  placeholder="City, country code"
                  error={errors.cityState?.message}
                  required
                  {...register('cityState')}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="ZIP code"
                  placeholder="ZIP"
                  error={errors.zipCode?.message}
                  required
                  {...register('zipCode')}
                />
                <FormInput
                  label="Phone"
                  placeholder="+880..."
                  error={errors.phoneNumber?.message}
                  required
                  {...register('phoneNumber')}
                />
              </div>
              <FormInput
                label="Office address"
                placeholder="Full office address"
                error={errors.officeAddress?.message}
                required
                {...register('officeAddress')}
              />
              <FormTextarea
                label="Description"
                placeholder="Describe your business"
                error={errors.description?.message}
                required
                rows={4}
                {...register('description')}
              />
            
              
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
