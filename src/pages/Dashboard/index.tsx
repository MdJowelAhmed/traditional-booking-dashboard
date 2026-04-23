import { useState, useMemo } from 'react'
import { formatCurrency, formatCompactNumber } from '@/utils/formatters'
import { StatCard } from './StatCard'
import { EarningsSummaryChart } from './EarningsSummaryChart'
import { RecentBookingsCard } from './RecentBookingsCard'
import {
  yearlyData,
  superAdminPlatformYearlyData,
  superAdminDashboardStats,
  defaultChartYear,
} from './dashboardData'
import {
  Calendar,
  CreditCard,
  ListOrdered,
  Settings,
  CircleDollarSign,
  Users,
  Home,
  Building2,
} from 'lucide-react'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'

export default function Dashboard() {
  const { user } = useAppSelector((state) => state.auth)
  const isHost = user?.role === UserRole.HOST

  const [selectedYear, setSelectedYear] = useState(defaultChartYear)

  const chartData = useMemo(() => yearlyData[selectedYear], [selectedYear])


  const stats = useMemo(() => {
    if (isHost) {
      const s = superAdminDashboardStats
      return [
        {
          title: 'Total Users',
          value: formatCompactNumber(s.totalUsers),
          change: s.changeUsers,
          icon: Users,
          description: 'vs last month',
        },
        {
          title: 'Total Host',
          value: formatCompactNumber(s.totalHosts),
          change: s.changeHosts,
          icon: Home,
          description: 'vs last month',
        },
        {
          title: 'Total Business',
          value: formatCompactNumber(s.totalBusinesses),
          change: s.changeBusinesses,
          icon: Building2,
          description: 'vs last month',
        },
        {
          title: 'Total Revenue',
          value: formatCurrency(s.totalRevenue),
          change: s.changeRevenue,
          icon: CircleDollarSign,
          description: 'vs last month',
        },
      ]
    }

    const shared = isHost
      ? [
          {
            title: 'Active Listings',
            value: formatCompactNumber(24),
            change: 6.3,
            icon: Settings,
            description: 'vs last month',
          },
          {
            title: 'Upcoming Bookings',
            value: formatCompactNumber(18),
            change: 4.1,
            icon: Calendar,
            description: 'vs last month',
          },
        ]
      : [
          {
            title: 'Active Listings',
            value: formatCompactNumber(12543),
            change: 12.5,
            icon: Settings,
            description: 'vs last month',
          },
          {
            title: 'Upcoming Bookings',
            value: formatCompactNumber(3420),
            change: 8.2,
            icon: Calendar,
            description: 'vs last month',
          },
        ]

    if (isHost) {
      return [
        ...shared,
        {
          title: 'Total Revenue',
          value: formatCurrency(98500),
          change: 5.2,
          icon: CircleDollarSign,
          description: 'vs last month',
        },
      ]
    }

    return [
      ...shared,
      {
        title: 'Total Orders',
        value: '156',
        change: 3.1,
        icon: ListOrdered,
        description: 'vs last month',
      },
      {
        title: 'Total Sales',
        value: formatCurrency(845320),
        change: -2.4,
        icon: CreditCard,
        description: 'vs last month',
      },
    ]
  }, [isHost])

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

      {/* Chart: full width for super admin (platform metrics); host/business keep sales + bookings */}
      <div className="grid gap-6 lg:grid-cols-12">
     
            <div className="col-span-12 lg:col-span-8">
              <EarningsSummaryChart
                chartData={chartData}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
              />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <RecentBookingsCard />
            </div>
        
       
      </div>

      {/* <div>
        <RecentActivityCard />
      </div> */}
    </div>
  )
}
