export type AppSliderStatus = 'ongoing' | 'pending' | 'rejected'

export interface AppSliderItem {
  id: string
  /** Displayed in the S.No column, e.g. #1001 */
  displaySerial: string
  imageUrl: string
  createdAt: string
  /** Email of the host/business user who submitted the slider */
  userEmail: string
  name: string
  buttonLabel: string
  status: AppSliderStatus
}

export const mockAppSliders: AppSliderItem[] = [
  {
    id: '1',
    displaySerial: '#1001',
    imageUrl: 'https://picsum.photos/seed/slider1/320/120',
    createdAt: '2026-04-16T12:00:00.000Z',
    userEmail: 'host@example.com',
    name: 'Discount',
    buttonLabel: 'Explore Now',
    status: 'ongoing',
  },
  {
    id: '2',
    displaySerial: '#1002',
    imageUrl: 'https://picsum.photos/seed/slider2/320/120',
    createdAt: '2026-04-10T09:00:00.000Z',
    userEmail: 'business.owner@example.com',
    name: 'Summer Stay',
    buttonLabel: 'Book Today',
    status: 'pending',
  },
  {
    id: '3',
    displaySerial: '#1003',
    imageUrl: 'https://picsum.photos/seed/slider3/320/120',
    createdAt: '2026-04-08T09:00:00.000Z',
    userEmail: 'rentals@example.com',
    name: 'Weekend Deal',
    buttonLabel: 'See offer',
    status: 'rejected',
  },
]
