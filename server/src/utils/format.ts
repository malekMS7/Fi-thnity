/** Date du jour au format AAAA-MM-JJ (heure locale). */
export function todayISO(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const isPast = (date: string, time: string) =>
  new Date(`${date}T${time}:00`) < new Date()