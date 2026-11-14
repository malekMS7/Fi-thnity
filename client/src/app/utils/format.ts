export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export const formatPrice = (price: number) => `${price} DT`

/** Date du jour au format AAAA-MM-JJ (heure locale). */
export function todayISO(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const isPast = (date: string, time: string) => new Date(`${date}T${time}:00`) < new Date()
