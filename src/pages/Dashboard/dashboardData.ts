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

/** Super admin dashboard: monthly counts by account type (no sales). */
export type SuperAdminPlatformChartPoint = {
    month: string
    users: number
    hosts: number
    businesses: number
}

const superAdminUsersByPastYear: Record<string, readonly number[]> = {
    '2025': [820, 880, 910, 940, 980, 1020, 1050, 1080, 1120, 1150, 1180, 1210],
    '2024': [520, 560, 590, 620, 650, 690, 720, 760, 790, 820, 800, 820],
    '2023': [320, 350, 380, 400, 430, 460, 490, 510, 530, 550, 570, 520],
    '2022': [180, 200, 220, 240, 260, 280, 300, 310, 320, 330, 340, 320],
    '2021': [90, 100, 110, 120, 130, 140, 145, 150, 155, 160, 165, 170],
}

const superAdminHostsByPastYear: Record<string, readonly number[]> = {
    '2025': [120, 128, 132, 136, 140, 145, 148, 152, 156, 160, 164, 168],
    '2024': [78, 82, 85, 88, 92, 95, 98, 102, 105, 108, 110, 112],
    '2023': [48, 52, 54, 56, 58, 62, 64, 66, 68, 70, 72, 74],
    '2022': [28, 30, 32, 34, 36, 38, 39, 40, 41, 42, 43, 44],
    '2021': [12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
}

const superAdminBusinessesByPastYear: Record<string, readonly number[]> = {
    '2025': [210, 218, 225, 232, 240, 248, 255, 262, 270, 278, 285, 292],
    '2024': [140, 146, 152, 158, 164, 170, 176, 182, 188, 194, 198, 202],
    '2023': [85, 90, 94, 98, 102, 106, 110, 114, 118, 122, 126, 130],
    '2022': [48, 52, 55, 58, 61, 64, 66, 68, 70, 72, 74, 76],
    '2021': [22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44],
}

const superAdminUsersPresentYear: readonly number[] = [
    1240, 1285, 1610, 1340, 1875, 1405, 1630, 1460, 1990, 1520, 1745, 1570,
]

const superAdminHostsPresentYear: readonly number[] = [
    172, 336, 210, 554, 178, 832, 196, 1000, 204, 208, 212, 216,
]

const superAdminBusinessesPresentYear: readonly number[] = [
    298, 605, 312, 620, 328, 635, 342, 650, 358, 665, 372, 680,
]

function buildSuperAdminYearRows(
    users: readonly number[],
    hosts: readonly number[],
    businesses: readonly number[]
): SuperAdminPlatformChartPoint[] {
    return MONTHS.map((month, i) => ({
        month,
        users: users[i] ?? 0,
        hosts: hosts[i] ?? 0,
        businesses: businesses[i] ?? 0,
    }))
}

const superAdminUsersByYear: Record<string, readonly number[]> = {
    ...superAdminUsersByPastYear,
    [PRESENT_YEAR]: superAdminUsersPresentYear,
}

const superAdminHostsByYear: Record<string, readonly number[]> = {
    ...superAdminHostsByPastYear,
    [PRESENT_YEAR]: superAdminHostsPresentYear,
}

const superAdminBusinessesByYear: Record<string, readonly number[]> = {
    ...superAdminBusinessesByPastYear,
    [PRESENT_YEAR]: superAdminBusinessesPresentYear,
}

export const superAdminPlatformYearlyData: Record<string, SuperAdminPlatformChartPoint[]> =
    Object.fromEntries(
        years.map((year) => [
            year,
            buildSuperAdminYearRows(
                superAdminUsersByYear[year] ?? superAdminUsersPresentYear,
                superAdminHostsByYear[year] ?? superAdminHostsPresentYear,
                superAdminBusinessesByYear[year] ?? superAdminBusinessesPresentYear
            ),
        ])
    ) as Record<string, SuperAdminPlatformChartPoint[]>

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
    {
        id: 'rb-7',
        customerName: 'John Doe',
        serviceType: 'AC Repair',
        startDate: '2026-04-08',
        endDate: '2026-04-09',
        amount: 275,
        status: 'confirmed',
        avatarUrl: 'https://i.pravatar.cc/96?img=12',
    },
    {
        id: 'rb-6',
        customerName: 'Jane Smith',
        serviceType: 'Deep Cleaning',
        startDate: '2026-04-15',
        endDate: '2026-04-18',
        amount: 890,
        status: 'confirmed',
        avatarUrl: 'https://i.pravatar.cc/96?img=5',
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

