import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
import { years, type ChartDataPoint } from './dashboardData'

interface EarningsSummaryChartProps {
    chartData: ChartDataPoint[]
    selectedYear: string
    onYearChange: (year: string) => void
}


/** 10 intervals (11 ticks: 0 … 10×step). Data should sit under the 10th tick; 9×step covers up to max. */
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
        const step = 100
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
        return (num / 1000).toFixed(0) + 'k'
    }
    return num.toString()
}

const CHART_GREEN = '#70B72B'

function formatTooltipExact(value: unknown): string {
    const n = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(n)) return ''
    return Math.round(n).toLocaleString('en-US')
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="relative rounded-md bg-[#364355] px-3 py-1.5 text-sm font-medium text-white shadow-lg">
                <p>{formatTooltipExact(payload[0].value)}</p>
                <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45 bg-[#364355]" />
            </div>
        )
    }
    return null
}

export function EarningsSummaryChart({ chartData, selectedYear, onYearChange }: EarningsSummaryChartProps) {
    const dataMax = Math.max(...chartData.map((d) => d.revenue), 0)
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
                        <CardTitle className="text-lg font-bold text-card-foreground">Sales Overview</CardTitle>
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
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="h-[350px] w-full sm:h-[480px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 12, right: 8, left: 4, bottom: 4 }}
                            >
                                <defs>
                                    <linearGradient id="salesAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={CHART_GREEN} stopOpacity={0.45} />
                                        <stop offset="55%" stopColor={CHART_GREEN} stopOpacity={0.12} />
                                        <stop offset="100%" stopColor={CHART_GREEN} stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
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
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: CHART_GREEN, strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke={CHART_GREEN}
                                    strokeWidth={2.5}
                                    fill="url(#salesAreaGradient)"
                                    dot={false}
                                    activeDot={{ r: 5, fill: CHART_GREEN, stroke: '#fff', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
