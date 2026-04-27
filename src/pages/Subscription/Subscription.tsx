
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/common/Pagination'
import { useUrlNumber } from '@/hooks/useUrlState'
import { toast } from '@/utils/toast'
import { formatCurrency } from '@/utils/formatters'
import {
  useGetSubscriptionPackagesQuery,
  useMySubscriptionsPackagesQuery,
  usePurchasePackageMutation,
} from '@/redux/api/packageApi'

export default function Subscription() {
  const [page, setPage] = useUrlNumber('page', 1)
  const [limit, setLimit] = useUrlNumber('limit', 10)

  const { data, isLoading } = useGetSubscriptionPackagesQuery({ page, limit })
  const { data: mySubData } = useMySubscriptionsPackagesQuery()
  const [purchasePackage] = usePurchasePackageMutation()
  const [redirectingId, setRedirectingId] = useState<string | null>(null)

  const packages = data?.data ?? []
  const totalItems = data?.meta?.total ?? packages.length
  const totalPages = data?.meta?.totalPage ?? 1
  const runningPackageId = mySubData?.data?.subscription?.package?._id ?? null

  const handleGetStarted = async (packageId: string) => {
    if (redirectingId) return
    setRedirectingId(packageId)
    try {
      const res = await purchasePackage({ packageId }).unwrap()
      const url = res?.data?.url
      if (!url) {
        toast({ variant: 'destructive', title: 'Checkout URL not found' })
        setRedirectingId(null)
        return
      }
      window.location.href = url
    } catch {
      toast({ variant: 'destructive', title: 'Could not start checkout' })
      setRedirectingId(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="rounded-2xl border-0 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2d2d2d] md:text-3xl">
              Subscription
            </h1>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              Choose a package and continue to Stripe checkout.
            </p>
          </div>
        </div>

        <div className="p-6 pt-0">
          {isLoading ? (
            <p className="py-10 text-center text-muted-foreground">Loading packages…</p>
          ) : packages.length ? (
            <div className="grid gap-4 items-stretch sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => (
                <div
                  key={pkg._id}
                  className="flex h-full flex-col rounded-2xl border border-sky-100/80 p-5 shadow-sm bg-gradient-to-b from-sky-50 via-white to-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">
                        {pkg.paymentType}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xl font-bold text-slate-900">{pkg.title}</p>
                        {runningPackageId === pkg._id && (
                          <span className="rounded-full bg-[#0C5822] px-2.5 py-1 text-[11px] font-semibold text-white">
                            Running Package
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="rounded-full bg-[#6BBF2D] px-3 py-1 text-xs font-semibold text-white">
                      {pkg.duration}
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                      {pkg.description}
                    </p>

                    <div className="mt-5">
                      <p className="text-3xl font-bold text-slate-900 tabular-nums">
                        {formatCurrency(pkg.price, 'USD')}
                      </p>
                      <p className="text-sm text-muted-foreground">{pkg.paymentType}</p>
                    </div>

                    <ul className="mt-6 flex max-h-44 flex-col gap-2 overflow-y-auto pr-1 text-sm text-slate-700 [scrollbar-width:thin] [scrollbar-color:#70B72B_#E5E7EB] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#E5E7EB] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#70B72B]">
                      {pkg.features?.map((f, i) => (
                        <li key={`${pkg._id}-f-${i}`} className="flex items-start gap-2">
                          <span className="mt-0.5 h-2 w-2 rounded-full bg-[#6BBF2D]" />
                          <span>
                            {f.name ?? f.description}
                            {f.isUnlimited
                              ? ' (Unlimited)'
                              : typeof f.limit === 'number'
                                ? ` (Limit: ${f.limit})`
                                : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    type="button"
                    className="mt-auto w-full rounded-xl bg-[#6BBF2D] hover:bg-[#5aad26] text-white mt-10"
                    disabled={redirectingId !== null || runningPackageId === pkg._id}
                    onClick={() => handleGetStarted(pkg._id)}
                  >
                    {runningPackageId === pkg._id
                      ? 'Current Plan'
                      : redirectingId === pkg._id
                        ? 'Redirecting…'
                        : 'Get Started'}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-muted-foreground">No packages found.</p>
          )}

          <div className="mt-6 border-t border-gray-100 pt-4">
            <Pagination
              currentPage={Math.min(page, totalPages)}
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
        </div>
      </div>
    </motion.div>
  )
}
