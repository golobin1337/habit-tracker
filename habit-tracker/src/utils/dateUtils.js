export const today = () => {
  const d = new Date()
  return toKey(d)
}

export const toKey = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const getWeekDays = (referenceDate = new Date()) => {
  const d = new Date(referenceDate)
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((day + 6) % 7))

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return date
  })
}

export const getMonthDays = (year, month) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []

  const startPad = (firstDay.getDay() + 6) % 7
  for (let i = 0; i < startPad; i++) {
    const d = new Date(year, month, 1 - startPad + i)
    days.push({ date: d, currentMonth: false })
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), currentMonth: true })
  }

  const endPad = 7 - (days.length % 7)
  if (endPad < 7) {
    for (let i = 1; i <= endPad; i++) {
      days.push({ date: new Date(year, month + 1, i), currentMonth: false })
    }
  }

  return days
}

export const DAY_NAMES_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export const formatDate = (date) => {
  const d = new Date(date)
  return `${d.getDate()} de ${MONTH_NAMES[d.getMonth()]}`
}

export const isSameDay = (a, b) => toKey(a) === toKey(b)
export const isToday = (date) => toKey(date) === today()
export const isFuture = (date) => toKey(date) > today()
export const isPast = (date) => toKey(date) < today()
