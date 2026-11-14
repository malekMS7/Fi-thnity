import { prisma } from '../prisma.js'
import type { Ride, RideFilters, NewRideInput, Review, User } from '../types/index.js'
import { isPast, todayISO } from '../utils/format.js'

/** Complète un trajet stocké avec le conducteur, sa note et les places restantes. */
export async function enrich(
  ride: { id: string; driverId: string; from: string; to: string; date: string; time: string; seats: number; price: number; meetingPoint: string; options: string[] },
  db: { driver?: { name: string } | null; reviews: { rating: number }[]; booked: number },
): Promise<Ride> {
  const avg = db.reviews.length
    ? db.reviews.reduce((s, r) => s + r.rating, 0) / db.reviews.length
    : null
  return {
    ...ride,
    driverName: db.driver?.name ?? 'Conducteur',
    driverRating: avg === null ? null : Math.round(avg * 10) / 10,
    driverReviews: db.reviews.length,
    seatsLeft: ride.seats - db.booked,
  }
}

export async function listRides(f: RideFilters = {}): Promise<Ride[]> {
  const rides = await prisma.ride.findMany({ where: { date: { gte: todayISO() } } })
  const result: Ride[] = []
  for (const r of rides) {
    const [driver, reviews, booked] = await Promise.all([
      prisma.user.findUnique({ where: { id: r.driverId }, select: { name: true } }),
      prisma.review.findMany({ where: { driverId: r.driverId }, select: { rating: true } }),
      prisma.booking.count({ where: { rideId: r.id, status: 'CONFIRMED' } }),
    ])
    const enriched = await enrich(r, { driver, reviews, booked })
    if (isPast(enriched.date, enriched.time)) continue
    if (f.depart && !enriched.from.toLowerCase().includes(f.depart.toLowerCase())) continue
    if (f.arrivee && !enriched.to.toLowerCase().includes(f.arrivee.toLowerCase())) continue
    if (f.date && enriched.date !== f.date) continue
    if (f.prixMax !== undefined && enriched.price > f.prixMax) continue
    if (f.placesMin !== undefined && enriched.seatsLeft < f.placesMin) continue
    if (f.matin && enriched.time >= '12:00') continue
    result.push(enriched)
  }
  result.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  return result
}

export async function getRide(id: string): Promise<Ride | null> {
  const r = await prisma.ride.findUnique({ where: { id } })
  if (!r) return null
  const [driver, reviews, booked] = await Promise.all([
    prisma.user.findUnique({ where: { id: r.driverId }, select: { name: true } }),
    prisma.review.findMany({ where: { driverId: r.driverId }, select: { rating: true } }),
    prisma.booking.count({ where: { rideId: r.id, status: 'CONFIRMED' } }),
  ])
  return enrich(r, { driver, reviews, booked })
}

export async function getReviews(driverId: string): Promise<Review[]> {
  return prisma.review.findMany({ where: { driverId } })
}

export async function createRide(input: NewRideInput, driver: Pick<User, 'id'>): Promise<Ride> {
  const stored = await prisma.ride.create({
    data: {
      driverId: driver.id,
      from: input.from,
      to: input.to,
      date: input.date,
      time: input.time,
      seats: input.seats,
      price: input.price,
      meetingPoint: input.meetingPoint,
      options: input.options,
    },
  })
  const ride = await getRide(stored.id)
  if (!ride) throw new Error('Trajet introuvable après création.')
  return ride
}

export async function listMyRides(userId: string): Promise<Ride[]> {
  const rides = await prisma.ride.findMany({ where: { driverId: userId } })
  const result: Ride[] = []
  for (const r of rides) {
    const [driver, reviews, booked] = await Promise.all([
      prisma.user.findUnique({ where: { id: r.driverId }, select: { name: true } }),
      prisma.review.findMany({ where: { driverId: r.driverId }, select: { rating: true } }),
      prisma.booking.count({ where: { rideId: r.id, status: 'CONFIRMED' } }),
    ])
    result.push(await enrich(r, { driver, reviews, booked }))
  }
  result.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  return result
}