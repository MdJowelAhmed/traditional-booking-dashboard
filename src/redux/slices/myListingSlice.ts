import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { MyListing } from '@/types/myListing'

const seedListings: MyListing[] = [
  {
    id: 'lst_1',
    title: 'Shoe Shining',
    price: 80,
    discountPrice: 80,
    description: 'Professional shoe shining and leather care at your location.',
    imageUrl:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
    rating: 5,
    status: 'active',
    scheduleBasis: 'hourly',
    hourlySchedule: {
      duration: '1 hour',
      selectedDayKeys: ['all'],
      timeSlots: ['09:00 am', '10:00 am', '11:00 am'],
    },
  },
  {
    id: 'lst_2',
    title: 'Interior Detailing',
    price: 120,
    discountPrice: 99,
    description: 'Deep interior cleaning, vacuum, and conditioning.',
    imageUrl:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    rating: 4.8,
    status: 'active',
    scheduleBasis: 'daily',
    dailySchedule: {
      selectedDays: ['monday', 'wednesday', 'friday'],
    },
  },
  {
    id: 'lst_3',
    title: 'Premium Wash',
    price: 45,
    discountPrice: 39,
    description: 'Exterior wash, wax, and tire shine.',
    imageUrl:
      'https://images.unsplash.com/photo-1520340356584-f9917ddec309?w=800&q=80',
    rating: 4.9,
    status: 'inactive',
    scheduleBasis: 'daily',
    dailySchedule: { selectedDays: ['all'] },
  },
]

interface MyListingState {
  items: MyListing[]
}

const initialState: MyListingState = {
  items: seedListings,
}

function generateId(): string {
  return `lst_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

const myListingSlice = createSlice({
  name: 'myListings',
  initialState,
  reducers: {
    addMyListing: (state, action: PayloadAction<MyListing>) => {
      const payload = action.payload
      state.items.push({
        ...payload,
        id: payload.id || generateId(),
      })
    },
    updateMyListing: (state, action: PayloadAction<MyListing>) => {
      const i = state.items.findIndex((x) => x.id === action.payload.id)
      if (i !== -1) {
        state.items[i] = action.payload
      }
    },
    removeMyListing: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((x) => x.id !== action.payload)
    },
  },
})

export const { addMyListing, updateMyListing, removeMyListing } =
  myListingSlice.actions

export default myListingSlice.reducer
