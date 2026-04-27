import { useState } from 'react'
import { BookingTable } from './BookingTable'
// import { AddBookingModal } from './components/AddBookingModal'
import { BookingDetailsModal } from './components/BookingDetailsModal'
import { StatusUpdateModal } from './components/StatusUpdateModal'
import type { BookingRow } from './BookingTable'

const BookingManagement = () => {
  // const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null)

  // const handleAddBooking = () => {
  //   setIsAddModalOpen(true)
  // }

  const handleViewDetails = (booking: BookingRow) => {
    setSelectedBooking(booking)
    setIsDetailsModalOpen(true)
  }

  const handleOpenStatusUpdate = (booking: BookingRow) => {
    setSelectedBooking(booking)
    setIsStatusModalOpen(true)
  }

  return (
    <div className="space-y-6 bg-white  rounded-2xl">




      {/* Bookings Table */}
      <BookingTable onViewDetails={handleViewDetails} onUpdateStatus={handleOpenStatusUpdate} />

      {/* Add Booking Modal */}
      {/* <AddBookingModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      /> */}

      {/* Booking Details Modal */}
      <BookingDetailsModal
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedBooking(null)
        }}
        booking={selectedBooking}
      />

      <StatusUpdateModal
        open={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false)
          setSelectedBooking(null)
        }}
        booking={selectedBooking}
      />
    </div>
  )
}

export default BookingManagement