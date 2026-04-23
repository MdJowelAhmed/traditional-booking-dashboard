import { Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { useGetPlatformSettingsQuery } from '@/redux/api/settingsApi'

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

export default function PrivacySettings() {
  const { data, isLoading, isError, isSuccess, error } =
    useGetPlatformSettingsQuery('privacyPolicy')

  const previewHtml =
    isSuccess && data?.data != null && typeof data.data === 'string' ? data.data : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Privacy Policy</CardTitle>
              <CardDescription>View the platform Privacy Policy</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && !data ? (
            <p className="text-sm text-muted-foreground py-12 text-center">Loading…</p>
          ) : isError ? (
            <p className="text-sm text-destructive py-6">{getErrorMessage(error)}</p>
          ) : (
            <div className="border rounded-xl p-6 min-h-[500px] bg-muted/20">
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
