import { Router } from 'express'
import { requireAuth, requireRole, type AuthenticatedRequest } from '../middleware/auth.js'
import { register, login } from '../services/auth.service.js'
import { listRides, getRide, createRide, listMyRides } from '../services/rides.service.js'
import { createBooking, listMyBookings, cancelBooking } from '../services/bookings.service.js'
import type { RideFilters } from '../types/index.js'

const router = Router()

// Auth
router.post('/auth/register', async (req, res) => {
  try {
    const result = await register(req.body)
    res.json(result)
  } catch (e) {
    res.status(400).json({ error: (e as Error).message })
  }
})

router.post('/auth/login', async (req, res) => {
  try {
    const result = await login(req.body.email, req.body.password)
    res.json(result)
  } catch (e) {
    res.status(401).json({ error: (e as Error).message })
  }
})

// Rides (publics)
router.get('/rides', async (req, res) => {
  try {
    const f: RideFilters = {}
    if (req.query.depart) f.depart = String(req.query.depart)
    if (req.query.arrivee) f.arrivee = String(req.query.arrivee)
    if (req.query.date) f.date = String(req.query.date)
    if (req.query.prixMax) f.prixMax = Number(req.query.prixMax)
    if (req.query.placesMin) f.placesMin = Number(req.query.placesMin)
    if (req.query.matin) f.matin = req.query.matin === 'true'
    res.json(await listRides(f))
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// Rides (connecté)
router.get('/rides/mine', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    res.json(await listMyRides(req.user!.id))
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

router.post('/rides', requireAuth, requireRole('DRIVER'), async (req: AuthenticatedRequest, res) => {
  try {
    res.json(await createRide(req.body, { id: req.user!.id }))
  } catch (e) {
    res.status(400).json({ error: (e as Error).message })
  }
})

router.get('/rides/:id', async (req, res) => {
  const id = req.params.id
  if (typeof id !== 'string') return res.status(400).json({ error: 'Identifiant manquant.' })
  try {
    const ride = await getRide(id)
    if (!ride) return res.status(404).json({ error: 'Trajet introuvable.' })
    res.json(ride)
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// Bookings
router.post('/bookings', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    res.status(201).json(await createBooking(req.body.rideId, { id: req.user!.id }, req.body.seats))
  } catch (e) {
    res.status(400).json({ error: (e as Error).message })
  }
})

router.get('/bookings/mine', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    res.json(await listMyBookings(req.user!.id))
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

router.delete('/bookings/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const id = req.params.id
  if (typeof id !== 'string') return res.status(400).json({ error: 'Identifiant manquant.' })
  try {
    await cancelBooking(id, req.user!.id)
    res.status(204).end()
  } catch (e) {
    res.status(400).json({ error: (e as Error).message })
  }
})

export default router