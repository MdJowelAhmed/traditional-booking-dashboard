import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useUrlNumber } from '@/hooks/useUrlState'
import {
  mockSubscriptions,
  tierToDisplayName,
  type PackageTier,
  type SubscriptionRow,
} from './subscriptionData'
import { SubscriptionTable } from './components/SubscriptionTable'
import { BuyPackageModal } from './components/BuyPackageModal'
import { EditSubscriptionModal } from './components/EditSubscriptionModal'

function nextDisplaySerial(rows: SubscriptionRow[]): string {
  const nums = rows
    .map((r) => parseInt(r.displaySerial.replace(/^#/, ''), 10))
    .filter(Number.isFinite)
  const next = (nums.length ? Math.max(...nums) : 1000) + 1
  return `#${next}`
}

export default function Subscription() {
  const [page, setPage] = useUrlNumber('page', 1)
  const [limit, setLimit] = useUrlNumber('limit', 10)

  const [rows, setRows] = useState<SubscriptionRow[]>(mockSubscriptions)
  const [buyOpen, setBuyOpen] = useState(false)
  const [editing, setEditing] = useState<SubscriptionRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SubscriptionRow | null>(null)

  const totalItems = rows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / limit))

  const pageItems = useMemo(() => {
    const start = (page - 1) * limit
    return rows.slice(start, start + limit)
  }, [rows, page, limit])

  const handleSelectPackage = (tier: PackageTier) => {
    setRows((prev) => {
      const displaySerial = nextDisplaySerial(prev)
      return [
        {
          id: crypto.randomUUID(),
          displaySerial,
          packageName: tierToDisplayName(tier),
          purchasedAt: new Date().toISOString(),
          price: tier.price,
          currency: 'USD',
          status: 'active',
        },
        ...prev,
      ]
    })
  }

  const handleSaveEdit = (
    id: string,
    data: {
      packageName: string
      purchasedAt: string
      price: number
      status: SubscriptionRow['status']
    }
  ) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              packageName: data.packageName,
              purchasedAt: data.purchasedAt,
              price: data.price,
              status: data.status,
            }
          : r
      )
    )
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id))
    setDeleteTarget(null)
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
              Manage your subscription plan and payment methods
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setBuyOpen(true)}
            className="shrink-0 gap-2 rounded-md bg-primary text-white hover:bg-[#5aad26]"
          >
            <Plus className="h-5 w-5" />
            Buy New Package
          </Button>
        </div>

        <CardContent className="p-0">
          <SubscriptionTable
            rows={pageItems}
            onEdit={setEditing}
            onDelete={setDeleteTarget}
          />
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

      <BuyPackageModal
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
        onSelectPackage={handleSelectPackage}
      />

      <EditSubscriptionModal
        open={!!editing}
        onClose={() => setEditing(null)}
        subscription={editing}
        onSave={handleSaveEdit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete subscription"
        description={
          deleteTarget
            ? `Remove “${deleteTarget.packageName}” from your subscriptions? This cannot be undone.`
            : ''
        }
        confirmText="Delete"
      />
    </motion.div>
  )
}
