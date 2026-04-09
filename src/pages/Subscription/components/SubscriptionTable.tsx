import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { formatCurrency, formatDate } from '@/utils/formatters'
import type { SubscriptionRow, SubscriptionStatus } from '../subscriptionData'
import { SubscriptionRowActions } from './SubscriptionRowActions'

function StatusPill({ status }: { status: SubscriptionStatus }) {
  const active = status === 'active'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium',
        active
          ? 'bg-[#E7F6D5] border-[#6BBF2D] text-[#2E6A0D]'
          : 'bg-red-50 border-red-300 text-red-800'
      )}
    >
      {active ? 'Active' : 'Expired'}
    </span>
  )
}

interface SubscriptionTableProps {
  rows: SubscriptionRow[]
  onEdit: (row: SubscriptionRow) => void
  onDelete: (row: SubscriptionRow) => void
}

export function SubscriptionTable({ rows, onEdit, onDelete }: SubscriptionTableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-primary text-white">
            <th className="px-6 py-4 text-left text-sm font-bold">S.No</th>
            <th className="px-6 py-4 text-left text-sm font-bold">package</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Date</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Price</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
            <th className="px-6 py-4 text-right text-sm font-bold w-[200px]" aria-label="Row actions" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                No subscriptions yet. Buy a package to get started.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-700">{row.displaySerial}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">{row.packageName}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {formatDate(row.purchasedAt, 'dd MMM, yyyy')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-slate-800">
                    {formatCurrency(row.price, row.currency)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusPill status={row.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    <SubscriptionRowActions row={row} onEdit={onEdit} onDelete={onDelete} />
                  </div>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
