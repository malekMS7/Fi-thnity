import { prisma } from '../prisma.js'
import type { Booking, BookingStatus, BookingWithRide } from '../types/index.js'
import { isPast } from '../utils/format.js'
import { enrich } from './rides.service.js'

export async function createBooking(rideId: string, user: { id: string }, seats: number): Promise<Booking> {
  const stored = await prisma.ride.findUnique({ where: { id: rideId } })
  if (!stored) throw new Error('Trajet introuvable.')

  const ride = await enrich(stored, {
    driver: await prisma.user.findUnique({ where: { id: stored.driverId }, select: { name: true } }),
    reviews: await prisma.review.findMany({ where: { driverId: stored.driverId }, select: { rating: true } }),
    booked: await prisma.booking.count({ where: { rideId, status: 'CONFIRMED' } }),
  })

  if (ride.driverId === user.id) throw new Error('Tu ne peux pas réserver ton propre trajet.')
  if (isPast(ride.date, ride.time)) throw new Error('Ce trajet est déjà passé.')
  if (seats < 1 || seats > ride.seatsLeft) throw new Error(`Il ne reste que ${ride.seatsLeft} place(s).`)
  const already = await prisma.booking.findUnique({
    where: { rideId_passengerId: { rideId, passengerId: user.id } },
  })
  if (already && already.status === 'CONFIRMED') throw new Error('Tu as déjà réservé ce trajet.')

  // Une réservation annulée existe encore en base (contrainte unique rideId + passengerId) :
  // on la réactive au lieu d'en créer une seconde.
  const booking = already
    ? await prisma.booking.update({ where: { id: already.id }, data: { seats, status: 'CONFIRMED' } })
    : await prisma.booking.create({ data: { rideId, passengerId: user.id, seats, status: 'CONFIRMED' } })
  return {
    id: booking.id,
    rideId: booking.rideId,
    passengerId: booking.passengerId,
    seats: booking.seats,
    status: booking.status as BookingStatus,
    createdAt: booking.createdAt.toISOString(),
  }
}

export async function listMyBookings(userId: string): Promise<BookingWithRide[]> {
  const bookings = await prisma.booking.findMany({ where: { passengerId: userId } })
  const result: BookingWithRide[] = []
  for (const b of bookings) {
    const stored = await prisma.ride.findUnique({ where: { id: b.rideId } })
    if (!stored) continue
    const ride = await enrich(stored, {
      driver: await prisma.user.findUnique({ where: { id: stored.driverId }, select: { name: true } }),
      reviews: await prisma.review.findMany({ where: { driverId: stored.driverId }, select: { rating: true } }),
      booked: await prisma.booking.count({ where: { rideId: b.rideId, status: 'CONFIRMED' } }),
    })
    result.push({
      id: b.id,
      rideId: b.rideId,
      passengerId: b.passengerId,
      seats: b.seats,
      status: b.status as BookingStatus,
      createdAt: b.createdAt.toISOString(),
      ride,
    })
  }
  result.sort((a, b) => `${a.ride.date}${a.ride.time}`.localeCompare(`${b.ride.date}${b.ride.time}`))
  return result
}

export async function cancelBooking(bookingId: string, userId: string): Promise<void> {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, passengerId: userId },
  })
  if (!booking) throw new Error('Réservation introuvable.')
  await prisma.booking.update({ where: { id: booking.id }, data: { status: 'CANCELLED' } })
}