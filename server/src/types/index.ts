export type Role = 'DRIVER' | 'PASSENGER'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: Role
}

export interface Ride {
  id: string
  driverId: string
  driverName: string
  driverRating: number | null
  driverReviews: number
  from: string
  to: string
  date: string // AAAA-MM-JJ
  time: string // HH:MM
  seats: number
  seatsLeft: number
  price: number // en dinars
  meetingPoint: string
  options: string[]
}

export type BookingStatus = 'CONFIRMED' | 'CANCELLED'

export interface Booking {
  id: string
  rideId: string
  passengerId: string
  seats: number
  status: BookingStatus
  createdAt: string
}

export interface BookingWithRide extends Booking {
  ride: Ride
}

export interface Review {
  id: string
  driverId: string
  authorName: string
  rating: number
  comment: string
}

export interface RideFilters {
  depart?: string
  arrivee?: string
  date?: string
  prixMax?: number
  placesMin?: number
  matin?: boolean
}

export interface NewRideInput {
  from: string
  to: string
  date: string
  time: string
  seats: number
  price: number
  meetingPoint: string
  options: string[]
}