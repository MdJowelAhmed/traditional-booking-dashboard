import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useResetPasswordMutation,
  PASSWORD_RESET_VERIFY_TOKEN_KEY,
} from '@/redux/api/authApi'

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

function errorMessageFromApi(err: unknown): string {
  if (err && typeof err === 'object' && 'status' in err) {
    const e = err as { status?: number; data?: unknown }
    const data = e.data as { message?: string; error?: string } | undefined
    if (data?.message && typeof data.message === 'string') return data.message
    if (data?.error && typeof data.error === 'string') return data.error
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong. Please try again.'
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [missingToken, setMissingToken] = useState(false)

  useEffect(() => {
    try {
      const t = localStorage.getItem(PASSWORD_RESET_VERIFY_TOKEN_KEY)
      setMissingToken(!t?.trim())
    } catch {
      setMissingToken(true)
    }
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const password = watch('password', '')

  const passwordRequirements = [{ label: 'At least 8 characters', met: password.length >= 8 }]

  const onSubmit = async (data: ResetPasswordFormData) => {
    setSubmitError('')

    let token: string | null = null
    try {
      token = localStorage.getItem(PASSWORD_RESET_VERIFY_TOKEN_KEY)
    } catch {
      token = null
    }

    if (!token?.trim()) {
      setSubmitError('Your reset link expired or is missing. Request a new code from forgot password.')
      setMissingToken(true)
      return
    }

    try {
      const res = await resetPassword({
        newPassword: data.password,
        confirmPassword: data.confirmPassword,
      }).unwrap()

      if (!res.success) {
        setSubmitError(res.message?.trim() ? res.message : 'Could not reset password.')
        return
      }

      try {
        localStorage.removeItem(PASSWORD_RESET_VERIFY_TOKEN_KEY)
      } catch {
        /* ignore */
      }
      setIsSuccess(true)
    } catch (err) {
      setSubmitError(errorMessageFromApi(err))
    }
  }

  return (
    <div className="space-y-6">
      {/* Mobile Logo */}
      <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xl">D</span>
        </div>
        <span className="font-display font-bold text-2xl">Dashboard</span>
      </div>

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <Link
              to="/auth/verify-email"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Set new password</h1>
              <p className="text-muted-foreground">
                Your new password must be different from previous passwords.
              </p>
            </div>

            {missingToken && (
              <p className="text-sm text-destructive">
                No verification token found.{' '}
                <Link to="/auth/forgot-password" className="underline font-medium">
                  Start over
                </Link>
              </p>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {submitError && (
                <p className="text-sm text-destructive text-center">{submitError}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    className={cn('pl-10 pr-10', errors.password && 'border-destructive')}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Password Requirements</p>
                <div className="grid grid-cols-2 gap-1">
                  {passwordRequirements.map((req) => (
                    <div
                      key={req.label}
                      className={cn(
                        'flex items-center gap-1.5 text-xs',
                        req.met ? 'text-success' : 'text-muted-foreground'
                      )}
                    >
                      <div
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          req.met ? 'bg-success' : 'bg-muted-foreground'
                        )}
                      />
                      {req.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    className={cn('pl-10 pr-10', errors.confirmPassword && 'border-destructive')}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                disabled={missingToken}
              >
                {!isLoading && (
                  <>
                    Reset Password
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Password reset successful</h1>
              <p className="text-muted-foreground">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
            </div>

            <Button onClick={() => navigate('/auth/login')} className="w-full" size="lg">
              Back to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

