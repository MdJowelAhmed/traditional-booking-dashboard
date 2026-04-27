import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowDownNarrowWide, Eye } from 'lucide-react'
import { useUrlNumber, useUrlString } from '@/hooks/useUrlState'
import { useAppSelector } from '@/redux/hooks'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utils/cn'
import { UserRole } from '@/types/roles'
import {
  useGetMyBookingsHostQuery,
  useGetServiceBookingsServiceQuery,
  type HostBookingApiDoc,
  type ServiceBookingApiDoc,
} from '@/redux/api/myBookingApi'

type PaymentStatusUi = 'Paid' | 'Pending' | 'Refunded'

export type BookingRow = {
  id: string
  createdAt?: string
  dateText: string
  timeText: string
  userName: string
  userEmail: string
  userPhone?: string
  serviceName: string
  amountText: string
  paymentStatus: PaymentStatusUi
  bookingStatus: string
  raw: HostBookingApiDoc | ServiceBookingApiDoc
}

const PAYMENT_STATUS_OPTIONS: Array<{ value: PaymentStatusUi | 'all'; label: string }> = [
  { value: 'all', label: 'All Status' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Refunded', label: 'Refunded' },
]

interface BookingTableProps {
  // onAddBooking: () => void;
  onViewDetails: (booking: BookingRow) => void
  onUpdateStatus: (booking: BookingRow) => void
}

export function BookingTable({ onViewDetails, onUpdateStatus }: BookingTableProps) {
  const { user } = useAppSelector((s) => s.auth)
  const isHost = user?.role === UserRole.HOST
  const isService = user?.role === UserRole.SERVICE

  // URL state management
  const [searchQuery, setSearchQuery] = useUrlString('search', '')
  const [paymentStatusFilter, setPaymentStatusFilter] = useUrlString('paymentStatus', 'all')
  const [currentPage, setCurrentPage] = useUrlNumber('page', 1)
  const [itemsPerPage, setItemsPerPage] = useUrlNumber('limit', 10)

  // Fetch bookings based on role
  const { data: hostData, isLoading: hostLoading } = useGetMyBookingsHostQuery(
    { page: currentPage, limit: itemsPerPage },
    { skip: !isHost }
  )
  const { data: serviceData, isLoading: serviceLoading } =
    useGetServiceBookingsServiceQuery(
      { page: currentPage, limit: itemsPerPage },
      { skip: !isService }
    )

  const isLoading = hostLoading || serviceLoading

  const rows = useMemo<BookingRow[]>(() => {
    const list: Array<HostBookingApiDoc | ServiceBookingApiDoc> = isHost
      ? hostData?.data ?? []
      : isService
        ? serviceData?.data ?? []
        : []

    return list.map((b) => {
      const createdAt = (b as any).createdAt as string | undefined
      const created = createdAt ? new Date(createdAt) : null
      const timeText =
        created && !Number.isNaN(created.getTime())
          ? created.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
          : '—'

      const dateText = (() => {
        const d =
          'startDate' in b
            ? new Date(b.startDate)
            : new Date((b as ServiceBookingApiDoc).scheduledSlot?.date)
        return !Number.isNaN(d.getTime()) ? d.toLocaleDateString() : '—'
      })()

      const paymentStatusRaw = (b as any).payment?.status as string | undefined
      const paymentStatus: PaymentStatusUi =
        paymentStatusRaw === 'PAID'
          ? 'Paid'
          : paymentStatusRaw === 'REFUNDED'
            ? 'Refunded'
            : 'Pending'

      const amount = (b as any).payment?.amount
      const currency = (b as any).payment?.currency
      const amountText =
        typeof amount === 'number'
          ? `${amount} ${String(currency ?? '').toUpperCase()}`.trim()
          : '—'

      const serviceName =
        'property' in b
          ? `${b.property.address}`
          : `${(b as ServiceBookingApiDoc).service?.name ?? '—'}`

      return {
        id: b._id,
        createdAt,
        dateText,
        timeText,
        userName: b.user?.name ?? '—',
        userEmail: b.user?.email ?? '—',
        userPhone: '—',
        serviceName,
        amountText,
        paymentStatus,
        bookingStatus: (b as any).bookingStatus ?? '—',
        raw: b,
      }
    })
  }, [hostData?.data, isHost, isService, serviceData?.data])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const pay = paymentStatusFilter as PaymentStatusUi | 'all'
    return rows.filter((r) => {
      const qOk =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        r.userEmail.toLowerCase().includes(q) ||
        r.serviceName.toLowerCase().includes(q)
      const pOk = pay === 'all' ? true : r.paymentStatus === pay
      return qOk && pOk
    })
  }, [paymentStatusFilter, rows, searchQuery])

  const totalItems = (isHost ? hostData?.meta?.total : serviceData?.meta?.total) ?? filtered.length
  const totalPages =
    (isHost ? hostData?.meta?.totalPage : serviceData?.meta?.totalPage) ?? 1

  // Server pagination already applied; just show filtered
  const paginatedData = filtered

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit)
  }

  const getStatusPill = (status: PaymentStatusUi) => {
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
                <tr className="bg-primary text-white">
                  <th className="px-6 py-4 text-left text-sm font-bold">B.ID</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Start Date</th>
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
                      {isLoading ? 'Loading…' : 'No bookings found'}
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
                        {booking.id.substring(0, 2)}...{booking.id.substring(booking.id.length - 6)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{booking.dateText}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{booking.timeText}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{booking.userName}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{booking.userEmail}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{booking.userPhone ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{booking.serviceName}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">{booking.amountText}</td>
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
              currentPage={Math.min(currentPage, totalPages)}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
