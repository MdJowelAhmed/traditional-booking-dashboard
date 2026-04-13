export type MyListingScheduleBasis = 'daily' | 'hourly'

export interface MyListingDailySchedule {
  selectedDays: string[]
}

export interface MyListingHourlySchedule {
  duration: string
  selectedDayKeys: string[]
  timeSlots: string[]
}

export interface MyListing {
  id: string
  title: string
  price: number
  discountPrice: number
  description: string
  imageUrl: string
  rating: number
  status: 'active' | 'inactive'
  scheduleBasis: MyListingScheduleBasis
  dailySchedule?: MyListingDailySchedule
  hourlySchedule?: MyListingHourlySchedule
  /** Host “property” form (optional; business listings omit these) */
  propertyType?: string
  sizeSqft?: string
  /** House / Villa / Apartment */
  bedrooms?: string
  bathrooms?: string
  priceUnit?: string
  location?: string
  address?: string
  facilities?: string
}

export const HOURLY_DAY_KEYS = [
  'all',
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
] as const

export const DAILY_DAY_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'sunday', label: 'Sunday' },
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
] as const

export const HOURLY_DURATION_OPTIONS = ['1 hour', '2 hours', '3 hours', '4 hours']
