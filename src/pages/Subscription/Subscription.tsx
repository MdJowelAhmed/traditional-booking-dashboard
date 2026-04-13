import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useUrlNumber } from '@/hooks/useUrlState'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'
import {
  mockSubscriptions,
  tierToDisplayName,
  defaultEndsAtFromPurchase,
  type PackageTier,
  type SubscriptionRow,
  type SubscriptionAccountType,
} from './subscriptionData'
import { SubscriptionTable } from './components/SubscriptionTable'
import { BuyPackageModal } from './components/BuyPackageModal'
import { toast } from '@/utils/toast'

function nextDisplaySerial(rows: SubscriptionRow[]): string {
  const nums = rows
    .map((r) => parseInt(r.displaySerial.replace(/^#/, ''), 10))
    .filter(Number.isFinite)
  const next = (nums.length ? Math.max(...nums) : 1000) + 1
  return `#${next}`
}

function roleToAccountType(role: string): SubscriptionAccountType {
  if (role === UserRole.BUSINESS) return 'business'
  return 'host'
}

function displayNameFromUser(user: {
  firstName?: string
  lastName?: string
  email?: string
}): string {
  const a = user.firstName?.trim() ?? ''
  const b = user.lastName?.trim() ?? ''
  if (a || b) return `${a} ${b}`.trim()
  return user.email?.split('@')[0] ?? 'User'
}

export default function Subscription() {
  const { user } = useAppSelector((s) => s.auth)
  const role = user?.role ?? ''
  const isSuperAdmin = role === UserRole.SUPER_ADMIN
  const isSubscriber = role === UserRole.HOST || role === UserRole.BUSINESS

  const [page, setPage] = useUrlNumber('page', 1)
  const [limit, setLimit] = useUrlNumber('limit', 10)

  const [rows, setRows] = useState<SubscriptionRow[]>(mockSubscriptions)
  const [buyOpen, setBuyOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<SubscriptionRow | null>(null)

  const subscriberRows = useMemo(() => {
    if (!isSubscriber || !user?.email) return []
    const acct = roleToAccountType(role)
    return rows.filter(
      (r) =>
        r.userEmail.toLowerCase() === user.email!.toLowerCase() && r.accountType === acct
    )
  }, [rows, isSubscriber, user?.email, role])

  const tableRows = isSuperAdmin ? rows : subscriberRows

  const totalItems = tableRows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / limit))

  const pageItems = useMemo(() => {
    const start = (page - 1) * limit
    return tableRows.slice(start, start + limit)
  }, [tableRows, page, limit])

  const handleSelectPackage = (tier: PackageTier) => {
    if (!user?.email) {
      toast({ variant: 'destructive', title: 'You must be signed in to subscribe' })
      return
    }
    const purchasedAt = new Date().toISOString()
    const endsAt = defaultEndsAtFromPurchase(purchasedAt)
    setRows((prev) => {
      const displaySerial = nextDisplaySerial(prev)
      return [
        {
          id: crypto.randomUUID(),
          displaySerial,
          packageName: tierToDisplayName(tier),
          purchasedAt,
          endsAt,
          price: tier.price,
          currency: 'USD',
          status: 'active',
          userName: displayNameFromUser(user),
          userEmail: user.email.trim(),
          accountType: roleToAccountType(role),
        },
        ...prev,
      ]
    })
    setBuyOpen(false)
    toast({ variant: 'success', title: 'Package purchased' })
  }

  const confirmCancelSubscription = () => {
    if (!cancelTarget) return
    setRows((prev) =>
      prev.map((r) =>
        r.id === cancelTarget.id ? { ...r, status: 'expired' as const } : r
      )
    )
    toast({ variant: 'success', title: 'Subscription cancelled' })
    setCancelTarget(null)
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
              {isSuperAdmin
                ? 'Review and update all subscriber records'
                : 'Manage your subscription plan and payment methods'}
            </p>
          </div>
          {isSubscriber && (
            <Button
              type="button"
              onClick={() => setBuyOpen(true)}
              className="shrink-0 gap-2 rounded-md bg-primary text-white hover:bg-[#5aad26]"
            >
              <Plus className="h-5 w-5" />
              Buy New Package
            </Button>
          )}
        </div>

        <CardContent className="p-0">
          {isSuperAdmin ? (
            <SubscriptionTable
              mode="admin"
              rows={pageItems}
            />
          ) : (
            <SubscriptionTable
              mode="subscriber"
              rows={pageItems}
              onCancel={setCancelTarget}
            />
          )}
          <div className="border-t border-gray-100 px-6 py-4">
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
        </CardContent>
      </div>

      {isSubscriber && (
        <BuyPackageModal
          open={buyOpen}
          onClose={() => setBuyOpen(false)}
          onSelectPackage={handleSelectPackage}
        />
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancelSubscription}
        title="Cancel subscription?"
        description={
          cancelTarget
            ? `Cancel “${cancelTarget.packageName}”? Your access will end after the current period (shown as expired in this demo).`
            : ''
        }
        confirmText="Cancel subscription"
      />
    </motion.div>
  )
}
