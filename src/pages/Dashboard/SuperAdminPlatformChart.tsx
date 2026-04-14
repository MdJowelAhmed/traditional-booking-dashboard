import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'
import { motion } from 'framer-motion'
import { years, type SuperAdminPlatformChartPoint } from './dashboardData'

interface SuperAdminPlatformChartProps {
    chartData: SuperAdminPlatformChartPoint[]
    selectedYear: string
    onYearChange: (year: string) => void
}

const Y_INTERVALS = 10

function niceStepSize(rough: number): number {
    if (rough <= 0) return 1
    const magnitude = Math.pow(10, Math.floor(Math.log10(rough)))
    const normalized = rough / magnitude
    let nice: number
    if (normalized <= 1) nice = 1
    else if (normalized <= 2) nice = 2
    else if (normalized <= 2.5) nice = 2.5
    else if (normalized <= 5) nice = 5
    else nice = 10
    return nice * magnitude
}

function generateTicks(dataMax: number): number[] {
    if (dataMax <= 0) {
        const step = 10
        return Array.from({ length: Y_INTERVALS + 1 }, (_, i) => i * step)
    }
    let step = niceStepSize(dataMax / 9)
    let guard = 0
    while (9 * step < dataMax && guard < 24) {
        step = niceStepSize(step * 1.05)
        guard += 1
    }
    const yTop = step * Y_INTERVALS
    return Array.from({ length: Y_INTERVALS + 1 }, (_, i) => (i / Y_INTERVALS) * yTop)
}

const strKFormatter = (num: number) => {
    if (num > 999) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
    }
    return num.toString()
}

const COLOR_USERS = '#3B82F6'
const COLOR_HOSTS = '#70B72B'
const COLOR_BUSINESSES = '#F59E0B'

function formatInt(value: unknown): string {
    const n = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(n)) return ''
    return Math.round(n).toLocaleString('en-US')
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const row = payload.reduce((acc: Record<string, number>, p: any) => {
        if (p.dataKey && typeof p.value === 'number') acc[p.dataKey] = p.value
        return acc
    }, {})
    return (
        <div className="relative rounded-md bg-[#364355] px-3 py-2 text-sm font-medium text-white shadow-lg">
            <p className="mb-1.5 text-xs font-semibold text-white/90">{label}</p>
            <div className="space-y-1 text-xs">
                <p>
                    <span className="text-white/70">Users: </span>
                    {formatInt(row.users)}
                </p>
                <p>
                    <span className="text-white/70">Hosts: </span>
                    {formatInt(row.hosts)}
                </p>
                <p>
                    <span className="text-white/70">Businesses: </span>
                    {formatInt(row.businesses)}
                </p>
            </div>
            <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45 bg-[#364355]" />
        </div>
    )
}

export function SuperAdminPlatformChart({
    chartData,
    selectedYear,
    onYearChange,
}: SuperAdminPlatformChartProps) {
    const dataMax = Math.max(
        ...chartData.flatMap((d) => [d.users, d.hosts, d.businesses]),
        0
    )
    const yTicks = generateTicks(dataMax)
    const yDomainMax = yTicks[yTicks.length - 1] ?? 1

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
        >
            <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-4">
                        <CardTitle className="text-lg font-bold text-card-foreground">
                            Platform overview
                        </CardTitle>
                        <Select value={selectedYear} onValueChange={onYearChange}>
                            <SelectTrigger className="h-9 w-[100px] shrink-0 border-border bg-background text-sm font-medium text-card-foreground">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Users, hosts, and businesses on the platform by month
                    </p>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="h-[350px] w-full sm:h-[480px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartData}
                                margin={{ top: 12, right: 8, left: 4, bottom: 8 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="4 4"
                                    vertical={false}
                                    horizontal
                                    stroke="#E5E7EB"
                                />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={8}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    tickFormatter={(value) => strKFormatter(value)}
                                    allowDataOverflow={false}
                                    domain={[0, yDomainMax]}
                                    ticks={yTicks}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    wrapperStyle={{ paddingBottom: 8 }}
                                    formatter={(value) => (
                                        <span className="text-xs font-medium text-card-foreground">
                                            {value}
                                        </span>
                                    )}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="users"
                                    name="Users"
                                    stroke={COLOR_USERS}
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="hosts"
                                    name="Hosts"
                                    stroke={COLOR_HOSTS}
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="businesses"
                                    name="Businesses"
                                    stroke={COLOR_BUSINESSES}
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
