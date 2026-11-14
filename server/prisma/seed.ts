import { prisma } from '../src/prisma.js'
import { hash } from 'bcrypt'

async function main() {
  const pwd = await hash('demo1234', 10)

  const users = await Promise.all([
    prisma.user.upsert({ where: { email: 'walid@demo.tn' }, update: {}, create: { name: 'Walid B.', email: 'walid@demo.tn', role: 'DRIVER', password: pwd } }),
    prisma.user.upsert({ where: { email: 'ines@demo.tn' }, update: {}, create: { name: 'Ines M.', email: 'ines@demo.tn', role: 'DRIVER', password: pwd } }),
    prisma.user.upsert({ where: { email: 'karim@demo.tn' }, update: {}, create: { name: 'Karim T.', email: 'karim@demo.tn', role: 'DRIVER', password: pwd } }),
    prisma.user.upsert({ where: { email: 'yosra@demo.tn' }, update: {}, create: { name: 'Yosra A.', email: 'yosra@demo.tn', role: 'DRIVER', password: pwd } }),
    prisma.user.upsert({ where: { email: 'sarra@demo.tn' }, update: {}, create: { name: 'Sarra K.', email: 'sarra@demo.tn', role: 'PASSENGER', password: pwd } }),
  ])

  const [walid, ines, karim, yosra] = users

  const inDays = (n: number) => {
    const d = new Date()
    d.setDate(d.getDate() + n)
    const pad = (x: number) => String(x).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }

  const rides = [
    { driverId: walid.id, from: 'Sfax', to: 'Tunis', date: inDays(2), time: '07:30', seats: 4, price: 18, meetingPoint: 'Gare routière de Sfax', options: ['Petit bagage', 'Non-fumeur'] },
    { driverId: ines.id, from: 'Sfax', to: 'Tunis', date: inDays(2), time: '08:15', seats: 3, price: 20, meetingPoint: 'Campus universitaire de Sfax', options: ['Non-fumeur'] },
    { driverId: karim.id, from: 'Sfax', to: 'Tunis', date: inDays(2), time: '14:00', seats: 3, price: 17, meetingPoint: 'Station Sfax Centre', options: ['Musique', 'Petit bagage'] },
    { driverId: yosra.id, from: 'Sfax', to: 'Tunis', date: inDays(2), time: '17:30', seats: 4, price: 18, meetingPoint: 'Gare routière de Sfax', options: ['Non-fumeur'] },
    { driverId: ines.id, from: 'Sousse', to: 'Monastir', date: inDays(1), time: '08:00', seats: 3, price: 4, meetingPoint: 'Place Farhat Hached', options: ['Non-fumeur'] },
    { driverId: karim.id, from: 'Tunis', to: 'Sousse', date: inDays(3), time: '10:00', seats: 4, price: 12, meetingPoint: 'Station Bab Saadoun', options: ['Petit bagage'] },
    { driverId: walid.id, from: 'Tunis', to: 'Sfax', date: inDays(3), time: '10:00', seats: 4, price: 18, meetingPoint: 'Station Bab Saadoun', options: ['Non-fumeur'] },
    { driverId: yosra.id, from: 'Tunis', to: 'Bizerte', date: inDays(4), time: '16:30', seats: 3, price: 7, meetingPoint: 'Place de la République', options: ['Musique'] },
    { driverId: karim.id, from: 'Nabeul', to: 'Tunis', date: inDays(1), time: '07:00', seats: 2, price: 8, meetingPoint: 'Gare de Nabeul', options: ['Petit bagage', 'Non-fumeur'] },
  ]

  for (const r of rides) {
    await prisma.ride.create({ data: r })
  }

  const reviews = [
    { driverId: walid.id, authorName: 'Sarra', rating: 5, comment: 'Ponctuel et sympa, voiture propre.' },
    { driverId: walid.id, authorName: 'Amine', rating: 5, comment: 'Trajet très agréable, je recommande.' },
    { driverId: walid.id, authorName: 'Mariem', rating: 4, comment: "Départ à l'heure, conduite prudente." },
    { driverId: ines.id, authorName: 'Houssem', rating: 5, comment: 'Très organisée, communication claire.' },
    { driverId: ines.id, authorName: 'Rim', rating: 4, comment: 'Bien passé, merci !' },
    { driverId: karim.id, authorName: 'Oussama', rating: 5, comment: 'Parfait, prix honnête.' },
    { driverId: yosra.id, authorName: 'Nour', rating: 5, comment: 'Conductrice sérieuse et agréable.' },
    { driverId: yosra.id, authorName: 'Firas', rating: 4, comment: 'Trajet confortable.' },
  ]

  for (const r of reviews) {
    await prisma.review.create({ data: r })
  }

  console.log('Seed terminé.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })