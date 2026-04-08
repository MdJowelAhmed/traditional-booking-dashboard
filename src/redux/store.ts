import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import productReducer from './slices/productSlice'
import categoryReducer from './slices/categorySlice'
import uiReducer from './slices/uiSlice'
import bookingReducer from './slices/bookingSlice'
import calendarReducer from './slices/calendarSlice'
import transactionReducer from './slices/transactionSlice'
import faqReducer from './slices/faqSlice'
import myListingReducer from './slices/myListingSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    products: productReducer,
    categories: categoryReducer,
    ui: uiReducer,
    bookings: bookingReducer,
    calendar: calendarReducer,
    transactions: transactionReducer,
    faqs: faqReducer,
    myListings: myListingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
