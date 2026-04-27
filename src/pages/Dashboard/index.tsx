import { useState, useMemo } from 'react'
import { formatCurrency, formatCompactNumber } from '@/utils/formatters'
import { StatCard } from './StatCard'
import { EarningsSummaryChart } from './EarningsSummaryChart'
import { RecentBookingsCard } from './RecentBookingsCard'
import {
  Calendar,
  CreditCard,
  ListOrdered,
  Settings,
  CircleDollarSign,
} from 'lucide-react'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'
import {
  useGetHostOverviewStatsQuery,
  useGetHostRecentBookingsQuery,
  useGetHostSalesOverviewQuery,
  useGetServiceOverviewStatsQuery,
  useGetServiceRecentBookingsQuery,
  useGetServiceSalesOverviewQuery,
} from '@/redux/api/overviewApi'

export default function Dashboard() {
  const { user } = useAppSelector((state) => state.auth)
  const isHost = user?.role === UserRole.HOST
  const isService = user?.role === UserRole.SERVICE

  const currentYear = String(new Date().getFullYear())
  const years = useMemo(() => {
    const y = Number(currentYear)
    return Array.from({ length: 6 }, (_, i) => String(y - i))
  }, [currentYear])
  const [selectedYear, setSelectedYear] = useState(currentYear)

  const { data: hostStats } = useGetHostOverviewStatsQuery(undefined, {
    skip: !isHost,
  })
  const { data: serviceStats } = useGetServiceOverviewStatsQuery(undefined, {
    skip: !isService,
  })
  const { data: hostSales } = useGetHostSalesOverviewQuery(
    { year: selectedYear },
    { skip: !isHost }
  )
  const { data: serviceSales } = useGetServiceSalesOverviewQuery(
    { year: selectedYear },
    { skip: !isService }
  )
  const { data: hostRecent, isLoading: hostRecentLoading } =
    useGetHostRecentBookingsQuery(undefined, { skip: !isHost })
  const { data: serviceRecent, isLoading: serviceRecentLoading } =
    useGetServiceRecentBookingsQuery(undefined, { skip: !isService })

  const chartData = useMemo(() => {
    const src = isHost ? hostSales?.data : isService ? serviceSales?.data : []
    return (src ?? []).map((r) => ({
      month: r.month,
      revenue: r.totalRevenue,
      users: 0,
      orders: r.totalBookings,
    }))
  }, [hostSales?.data, isHost, isService, serviceSales?.data])

  const stats = useMemo(() => {
    if (isHost) {
      const d = hostStats?.data
      if (!d) return []
      return [
        {
          title: 'Active Listings',
          value: formatCompactNumber(d.activeListings.value),
          change: d.activeListings.change,
          icon: Settings,
          description: 'vs last month',
        },
        {
          title: 'Upcoming Bookings',
          value: formatCompactNumber(d.upcomingBookings.value),
          change: d.upcomingBookings.change,
          icon: Calendar,
          description: 'vs last month',
        },
        {
          title: 'Total Orders',
          value: formatCompactNumber(d.totalOrders.value),
          change: d.totalOrders.change,
          icon: ListOrdered,
          description: 'vs last month',
        },
        {
          title: 'Total Sales',
          value: formatCurrency(d.totalSales.value),
          change: d.totalSales.change,
          icon: CircleDollarSign,
          description: 'vs last month',
        },
      ]
    }

    if (isService) {
      const d = serviceStats?.data
      if (!d) return []
      return [
        {
          title: 'Active Services',
          value: formatCompactNumber(d.activeServices.value),
          change: d.activeServices.change,
          icon: Settings,
          description: 'vs last month',
        },
        {
          title: 'Upcoming Bookings',
          value: formatCompactNumber(d.upcomingBookings.value),
          change: d.upcomingBookings.change,
          icon: Calendar,
          description: 'vs last month',
        },
        {
          title: 'Total Orders',
          value: formatCompactNumber(d.totalOrders.value),
          change: d.totalOrders.change,
          icon: ListOrdered,
          description: 'vs last month',
        },
        {
          title: 'Total Sales',
          value: formatCurrency(d.totalSales.value),
          change: d.totalSales.change,
          icon: CreditCard,
          description: 'vs last month',
        },
      ]
    }

    return []
  }, [hostStats?.data, isHost, isService, serviceStats?.data])

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div
        className={`grid gap-4 md:grid-cols-2 ${isHost ? 'lg:grid-cols-4' : 'lg:grid-cols-4'}`}
      >
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
     
            <div className="col-span-12 lg:col-span-8">
              <EarningsSummaryChart
                chartData={chartData}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                years={years}
              />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <RecentBookingsCard
                items={(isHost ? hostRecent?.data.data : serviceRecent?.data.data) ?? []}
                isLoading={isHost ? hostRecentLoading : serviceRecentLoading}
              />
            </div>
        
       
      </div>

      {/* <div>
        <RecentActivityCard />
      </div> */}
    </div>
  )
}
