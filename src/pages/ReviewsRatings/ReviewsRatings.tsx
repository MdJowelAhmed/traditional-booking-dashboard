import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/common/Pagination'
import { cn } from '@/utils/cn'
import { useUrlNumber } from '@/hooks/useUrlState'
import { mapSellerFeedbackToReviewItem, type ReviewItem } from './reviewsData'
import { RespondToReviewModal } from './components/RespondToReviewModal'
import {
  useGetReviewAverageDataQuery,
  useGetReviewAllDataQuery,
  useReplyReviewMutation,
} from '@/redux/api/reviewRatingApi'
import { toast } from '@/utils/toast'

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

function StarsRow({ value, size = 24 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < value
        return (
          <Star
            key={i}
            className={cn('shrink-0', filled ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200')}
            style={{ width: size, height: size }}
          />
        )
      })}
    </div>
  )
}

function StarsFilledRtl({ value, size = 20 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center justify-end gap-4 w-[86px]">
      {Array.from({ length: value }).map((_, i) => (
        <Star
          key={i}
          className="shrink-0 text-yellow-400 fill-yellow-400"
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  )
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return (first + last).toUpperCase()
}

const EMPTY_BREAKDOWN = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } as const

export default function ReviewsRatings() {
  const [page, setPage] = useUrlNumber('page', 1)
  const [limit, setLimit] = useUrlNumber('limit', 10)

  const [selected, setSelected] = useState<ReviewItem | null>(null)
  const [isRespondOpen, setIsRespondOpen] = useState(false)

  const {
    data: statsRes,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useGetReviewAverageDataQuery()

  const {
    data: listRes,
    isLoading: listLoading,
    isFetching: listFetching,
    isError: listError,
    refetch: refetchList,
  } = useGetReviewAllDataQuery({ page, limit })

  const [replyReview, { isLoading: isReplying }] = useReplyReviewMutation()

  const stats = statsRes?.data
  const reviews = useMemo(
    () => (listRes?.data ?? []).map(mapSellerFeedbackToReviewItem),
    [listRes]
  )
  const meta = listRes?.meta

  const totalItems = meta?.total ?? 0
  const totalPages = Math.max(1, meta?.totalPage ?? 1)
  const safePage = Math.min(page, totalPages)

  const breakdown = stats?.ratingBreakdown ?? { ...EMPTY_BREAKDOWN }
  const percentages = stats?.ratingPercentages ?? { ...EMPTY_BREAKDOWN }
  const avg = stats?.averageRating ?? 0
  const totalReviewCount = stats?.totalReviews ?? 0

  const handleRespond = (review: ReviewItem) => {
    setSelected(review)
    setIsRespondOpen(true)
  }

  const handleSubmitResponse = async (payload: { reviewId: string; response: string }) => {
    try {
      await replyReview({
        id: payload.reviewId,
        reply: payload.response,
      }).unwrap()
      toast({
        title: 'Reply sent',
        description: 'Your response has been saved.',
        variant: 'success',
      })
    } catch (err) {
      toast({
        title: 'Could not send reply',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
      throw err
    }
  }

  const summaryLoading = statsLoading
  const listBlocking = listLoading && !listRes

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 bg-white p-8 rounded-2xl"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2d2d2d] md:text-3xl">
          Reviews &amp; Ratings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Manage guest feedback and respond to reviews
        </p>
      </div>

      {/* Summary */}
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-6">
          {statsError ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-destructive">Could not load rating summary.</p>
              <Button type="button" variant="outline" size="sm" onClick={() => refetchStats()}>
                Retry
              </Button>
            </div>
          ) : summaryLoading ? (
            <p className="text-sm text-muted-foreground">Loading summary…</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="flex items-start gap-5 flex-col">
                <div className="h-[96px] w-[96px] rounded-full bg-primary text-white flex items-center justify-center">
                  <span className="text-3xl font-bold">{avg.toFixed(1)}</span>
                </div>
                <div>
                  <StarsRow value={Math.round(avg)} size={32} />
                  <p className="mt-2 font-bold text-slate-700">
                    ({totalReviewCount} reviews)
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-3">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const key = String(stars) as keyof typeof breakdown
                  const count = breakdown[key] ?? 0
                  const pct = percentages[key] ?? 0
                  return (
                    <div key={stars} className="flex items-center gap-6">
                      <div className="flex items-center gap-6 w-[160px] justify-end">
                        <StarsFilledRtl value={stars} size={30} />
                        <span className="text-slate-600 whitespace-nowrap inline-flex flex-row-reverse items-center gap-2">
                          <span className="font-bold">{stars}</span>
                          <span>stars</span>
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="w-[48px] text-right text-slate-600 font-bold">{count}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews list */}
      {listError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-destructive">Could not load reviews.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => refetchList()}>
            Retry
          </Button>
        </div>
      ) : listBlocking ? (
        <p className="text-sm text-muted-foreground">Loading reviews…</p>
      ) : (
        <div className={cn('space-y-6', listFetching && 'opacity-80')}>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No reviews yet.</p>
          ) : (
            reviews.map((r, index) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="rounded-xl border border-slate-100 bg-white shadow-sm"
              >
                <div className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
                        {r.guestAvatarUrl ? (
                          <img
                            src={r.guestAvatarUrl}
                            alt={r.guestName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-slate-700">
                            {getInitials(r.guestName)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-900">{r.guestName}</p>
                        <p className="text-xs text-muted-foreground">{r.roomName}</p>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-4 md:flex-col md:items-end md:justify-start">
                      <StarsRow value={r.rating} size={18} />
                      <p className="text-xs text-muted-foreground">{r.date}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-700 leading-relaxed">{r.comment}</p>

                  <div className="mt-5">
                    {r.response ? (
                      <div className="rounded-lg bg-[#E7F6D5] p-4 border border-[#D3F1B0]">
                        <p className="text-xs font-semibold text-[#2E6A0D] mb-2">
                          Respond to Review
                        </p>
                        <p className="text-sm text-[#2E6A0D]">{r.response}</p>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleRespond(r)}
                        className="border-slate-300 text-slate-700"
                      >
                        Respond To Review
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      <div className="border-t border-slate-100 pt-2">
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={limit}
          onPageChange={setPage}
          onItemsPerPageChange={(n) => {
            setLimit(n)
            setPage(1)
          }}
        />
      </div>

      <RespondToReviewModal
        open={isRespondOpen}
        onClose={() => {
          setIsRespondOpen(false)
          setSelected(null)
        }}
        review={selected}
        onSubmit={handleSubmitResponse}
        isSubmitting={isReplying}
      />
    </motion.div>
  )
}
