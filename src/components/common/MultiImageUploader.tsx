import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { Image as ImageIcon, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/utils/constants'
import { formatFileSize } from '@/utils/formatters'
import { imageUrl } from '@/components/common/imageUrl'

type UploadValue = string | File

interface MultiImageUploaderProps {
  value?: UploadValue[]
  onChange: (next: UploadValue[]) => void
  className?: string
  maxSize?: number
  acceptedTypes?: string[]
  error?: string
  emptyTitle?: string
  emptyDescription?: React.ReactNode
}

function isFile(x: UploadValue): x is File {
  return typeof x !== 'string'
}

export function MultiImageUploader({
  value = [],
  onChange,
  className,
  maxSize = MAX_IMAGE_SIZE,
  acceptedTypes = ACCEPTED_IMAGE_TYPES,
  error,
  emptyTitle,
  emptyDescription,
}: MultiImageUploaderProps) {
  const [uploadError, setUploadError] = useState<string | null>(null)

  const previews = useMemo(() => {
    const fileUrls: string[] = []
    const urls = value.map((v) => {
      if (typeof v === 'string') return imageUrl(v)
      const u = URL.createObjectURL(v)
      fileUrls.push(u)
      return u
    })
    return { urls, fileUrls }
  }, [value])

  useEffect(() => {
    return () => {
      previews.fileUrls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [previews.fileUrls])

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setUploadError(null)
      if (fileRejections.length > 0) {
        const firstError = fileRejections[0].errors[0]
        setUploadError(firstError.message)
        return
      }
      if (acceptedFiles.length > 0) {
        onChange([...value, ...acceptedFiles])
      }
    },
    [onChange, value]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: true,
  })

  const removeAt = (idx: number) => {
    const next = value.filter((_, i) => i !== idx)
    onChange(next)
  }

  const displayError = error || uploadError

  return (
    <div className={cn('space-y-2', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer',
          'hover:border-primary/50 hover:bg-primary/5',
          isDragActive && 'border-primary bg-primary/10',
          displayError && 'border-destructive',
          value.length ? 'p-3' : 'p-8'
        )}
      >
        <input {...getInputProps()} />

        {value.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {previews.urls.map((src, idx) => (
              <div
                key={`${src}-${idx}`}
                className="relative overflow-hidden rounded-lg bg-muted aspect-[4/3]"
              >
                <img src={src} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeAt(idx)
                  }}
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex items-center justify-center rounded-lg border border-dashed bg-white aspect-[4/3]">
              <div className="flex flex-col items-center gap-2 text-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {isDragActive ? 'Drop here' : 'Add more'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className={cn(
                'p-4 rounded-full transition-colors',
                isDragActive ? 'bg-primary/20' : 'bg-muted'
              )}
            >
              {isDragActive ? (
                <Upload className="h-8 w-8 text-primary" />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {isDragActive ? 'Drop images here' : emptyTitle ?? 'Drag & drop or click to upload'}
              </p>
              {emptyDescription ? (
                <div className="text-sm mt-1">{emptyDescription}</div>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Supported: JPG, PNG, WebP (max {formatFileSize(maxSize)})
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {displayError && <p className="text-sm text-destructive">{displayError}</p>}
    </div>
  )
}

