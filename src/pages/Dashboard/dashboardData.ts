const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

export type ChartDataPoint = {
    month: string
    /** Sales Overview: `revenue` is exact; axis labels may abbreviate (e.g. 5k), tooltip shows full amount. */
    revenue: number
    users: number
    orders: number
}

export const PRESENT_YEAR = String(new Date().getFullYear())

export const salesRevenuePresentYear: readonly number[] = [
    3200, 12800, 3100, 8500, 15200, 9500, 4000, 11500, 5300, 16800, 4900, 8100,
]

const salesRevenueByPastYear: Record<string, readonly number[]> = {
    '2025': [3200, 8800, 4100, 5500, 7200, 9500, 4000, 7500, 5300, 6800, 4900, 5100],
    '2024': [2800, 4200, 3900, 5000, 6100, 8200, 3800, 6500, 4800, 5900, 4400, 4600],
    '2023': [2400, 3600, 3400, 4200, 5200, 6800, 3200, 5400, 4100, 5000, 3800, 4000],
    '2022': [2000, 3000, 2800, 3500, 4300, 5600, 2700, 4500, 3500, 4200, 3200, 3400],
    '2021': [1600, 2400, 2200, 2800, 3400, 4400, 2200, 3600, 2900, 3400, 2600, 2800],
}

export const salesRevenueByYear: Record<string, readonly number[]> = {
    ...salesRevenueByPastYear,
    [PRESENT_YEAR]: salesRevenuePresentYear,
}


export const defaultChartYear = PRESENT_YEAR

function buildYearlyChartRows(revenues: readonly number[]): ChartDataPoint[] {
    return MONTHS.map((month, i) => ({
        month,
        revenue: revenues[i] ?? 0,
        users: 0,
        orders: 0,
    }))
}

export const yearlyData: Record<string, ChartDataPoint[]> = Object.fromEntries(
    Object.entries(salesRevenueByYear).map(([year, rev]) => [year, buildYearlyChartRows(rev)])
) as Record<string, ChartDataPoint[]>

export const years = Object.keys(salesRevenueByYear).sort((a, b) => Number(b) - Number(a))

export type RecentBookingItem = {
    id: string
    customerName: string
    serviceType: string
    startDate: string
    endDate: string
    amount: number
    status: 'pending' | 'confirmed'
    avatarUrl: string
}

export const recentBookingsDashboard: RecentBookingItem[] = [
    {
        id: 'rb-1',
        customerName: 'Mohammad Shakil',
        serviceType: 'Shoe Shine',
        startDate: '2026-03-17',
        endDate: '2026-03-20',
        amount: 120,
        status: 'pending',
        avatarUrl: 'https://i.pravatar.cc/96?img=12',
    },
    {
        id: 'rb-2',
        customerName: 'Sarah Chen',
        serviceType: 'Cleaning',
        startDate: '2026-03-10',
        endDate: '2026-03-12',
        amount: 1200,
        status: 'confirmed',
        avatarUrl: 'https://i.pravatar.cc/96?img=5',
    },
    {
        id: 'rb-3',
        customerName: 'James Wilson',
        serviceType: 'Plumbing',
        startDate: '2026-04-02',
        endDate: '2026-04-04',
        amount: 450,
        status: 'confirmed',
        avatarUrl: 'https://i.pravatar.cc/96?img=33',
    },
    {
        id: 'rb-4',
        customerName: 'Emily Rodriguez',
        serviceType: 'Deep Cleaning',
        startDate: '2026-04-15',
        endDate: '2026-04-18',
        amount: 890,
        status: 'pending',
        avatarUrl: 'https://i.pravatar.cc/96?img=45',
    },
    {
        id: 'rb-5',
        customerName: 'David Okonkwo',
        serviceType: 'AC Repair',
        startDate: '2026-04-08',
        endDate: '2026-04-09',
        amount: 275,
        status: 'confirmed',
        avatarUrl: 'https://i.pravatar.cc/96?img=60',
    },
    {
        id: 'rb-6',
        customerName: 'Priya Patel',
        serviceType: 'Electrical',
        startDate: '2026-05-01',
        endDate: '2026-05-03',
        amount: 620,
        status: 'pending',
        avatarUrl: 'https://i.pravatar.cc/96?img=47',
    },
]

export const carBookingsData = [
    {
        id: 'Ik-20248',
        startDate: '21 Aug 2026',
        endDate: '26 Aug 2026',
        clientName: 'Alice Jhonson',
        carModel: 'Toyota Corolla',
        licensePlate: 'TX1234',
        plan: '2 Days',
        payment: '€350',
        paymentStatus: 'Paid',
        status: 'Completed',
    },
    {
        id: 'Ik-20249',
        startDate: '21 Aug 2026',
        endDate: '26 Aug 2026',
        clientName: 'Alice Jhonson',
        carModel: 'Toyota Corolla',
        licensePlate: 'TX1234',
        plan: '2 Days',
        payment: '$500',
        paymentStatus: 'Pending',
        status: 'Upcoming',
    },
    {
        id: 'Ik-20250',
        startDate: '21 Aug 2026',
        endDate: '26 Aug 2026',
        clientName: 'Alice Jhonson',
        carModel: 'Toyota Corolla',
        licensePlate: 'TX1234',
        plan: '2 Days',
        payment: '$500',
        paymentStatus: 'Pending',
        status: 'Running',
    },
    {
        id: 'Ik-20251',
        startDate: '21 Aug 2026',
        endDate: '26 Aug 2026',
        clientName: 'Alice Jhonson',
        carModel: 'Toyota Corolla',
        licensePlate: 'TX1234',
        plan: '2 Days',
        payment: '$500',
        paymentStatus: 'Paid',
        status: 'Completed',
    },
    {
        id: 'Ik-20252',
        startDate: '21 Aug 2026',
        endDate: '26 Aug 2026',
        clientName: 'Alice Jhonson',
        carModel: 'Toyota Corolla',
        licensePlate: 'TX1234',
        plan: '2 Days',
        payment: '$500',
        paymentStatus: 'Pending',
        status: 'Upcoming',
    },
]

export const recentActivityData = [
    { id: 1, action: 'New user registered', user: 'John Doe', time: '2 min ago' },
    { id: 2, action: 'Product updated', user: 'Jane Smith', time: '15 min ago' },
    { id: 3, action: 'Order completed', user: 'Mike Johnson', time: '1 hour ago' },
    { id: 4, action: 'Category created', user: 'Sarah Williams', time: '2 hours ago' },
    { id: 5, action: 'User blocked', user: 'Admin', time: '3 hours ago' },
]

