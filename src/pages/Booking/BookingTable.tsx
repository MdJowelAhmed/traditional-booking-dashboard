import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowDownNarrowWide, Eye } from 'lucide-react'
import { useUrlNumber, useUrlString } from '@/hooks/useUrlState'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setFilters, setLimit, setPage } from '@/redux/slices/bookingSlice'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Booking } from '@/types'
import { cn } from '@/utils/cn'

const PAYMENT_STATUS_OPTIONS: Array<{ value: Booking['paymentStatus'] | 'all'; label: string }> = [
  { value: 'all', label: 'All Status' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Refunded', label: 'Refunded' },
]

interface BookingTableProps {
  // onAddBooking: () => void;
  onViewDetails: (booking: Booking) => void
  onUpdateStatus: (booking: Booking) => void
}

export function BookingTable({ onViewDetails, onUpdateStatus }: BookingTableProps) {
  const dispatch = useAppDispatch()

  // URL state management
  const [searchQuery, setSearchQuery] = useUrlString('search', '')
  const [paymentStatusFilter, setPaymentStatusFilter] = useUrlString('paymentStatus', 'all')
  const [currentPage, setCurrentPage] = useUrlNumber('page', 1)
  const [itemsPerPage, setItemsPerPage] = useUrlNumber('limit', 10)

  // Redux state
  const { filteredList, pagination } = useAppSelector((state) => state.bookings)

  // Sync URL state with Redux filters
  useEffect(() => {
    dispatch(
      setFilters({
        search: searchQuery,
        paymentStatus: paymentStatusFilter as any,
      })
    )
  }, [searchQuery, paymentStatusFilter, dispatch])

  // Sync URL pagination with Redux
  useEffect(() => {
    dispatch(setPage(currentPage))
  }, [currentPage, dispatch])

  useEffect(() => {
    dispatch(setLimit(itemsPerPage))
  }, [itemsPerPage, dispatch])

  // Pagination
  const totalPages = pagination.totalPages
  const paginatedData = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit
    return filteredList.slice(startIndex, startIndex + pagination.limit)
  }, [filteredList, pagination.page, pagination.limit])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit)
  }

  const getTime = (b: Booking) => {
    if (b.createdAt) {
      const d = new Date(b.createdAt)
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      }
    }
    return '09:00 PM'
  }

  const getServiceName = (b: Booking) => b.carName ?? b.carModel

  const getStatusPill = (status: Booking['paymentStatus']) => {
    const base =
      'inline-flex items-center px-3 py-2 w-[90px] justify-center text-center rounded-sm text-xs font-medium'
    const styles =
      status === 'Paid'
        ? 'bg-green-100 text-green-800'
        : status === 'Pending'
        ? 'bg-orange-100 text-orange-800'
        : 'bg-indigo-100 text-indigo-800'
    return <span className={cn(base, styles)}>{status}</span>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <CardTitle className="text-xl font-bold text-slate-800">
            Booking Management
          </CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={(v) => {
                setSearchQuery(v)
                setCurrentPage(1)
              }}
              placeholder="Search by name / id / service"
              className="w-[300px]"
            />

            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-48 bg-secondary hover:bg-secondary text-white border-secondary">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="bg-primary text-slate-800">
                  <th className="px-6 py-4 text-left text-sm font-bold">B.ID</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Service Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((booking, index) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {booking.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{booking.startDate}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{getTime(booking)}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{booking.clientName}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{booking.clientEmail ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{booking.clientPhone ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{getServiceName(booking)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">{booking.payment}</td>
                      <td className="px-6 py-4">{getStatusPill(booking.paymentStatus)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDetails(booking)}
                            className="border-none"
                          >
                            <Eye className="h-5 w-5 mr-2" />
                       
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateStatus(booking)}
                            className="border-none"
                          >
                            <ArrowDownNarrowWide className="h-5 w-5 mr-2" />
                           
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-100">
            <Pagination
              currentPage={pagination.page}
              totalPages={totalPages}
              totalItems={filteredList.length}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
