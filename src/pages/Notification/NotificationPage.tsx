import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { NotificationListItem } from '@/components/common/NotificationListItem'
import { Pagination } from '@/components/common/Pagination'
import { useUrlNumber } from '@/hooks/useUrlState'
import { MOCK_NOTIFICATIONS } from '@/mocks/notificationData'

export default function NotificationPage() {
  const [page, setPage] = useUrlNumber('page', 1)
  const [limit, setLimit] = useUrlNumber('limit', 5)

  const totalItems = MOCK_NOTIFICATIONS.length
  const totalPages = Math.max(1, Math.ceil(totalItems / limit))

  const pageItems = useMemo(() => {
    const start = (page - 1) * limit
    return MOCK_NOTIFICATIONS.slice(start, start + limit)
  }, [page, limit])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 bg-white rounded-2xl p-6"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2d2d2d] md:text-3xl">
          Notification
        </h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Manage Your booking using Calendar
        </p>
      </div>

      <div className="space-y-4">
        {pageItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * index }}
          >
            <NotificationListItem item={item} />
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-100 bg-white px-2 shadow-sm">
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
    </motion.div>
  )
}
