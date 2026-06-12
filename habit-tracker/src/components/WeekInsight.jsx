import { motion } from 'framer-motion'
import { TrendingDown } from 'lucide-react'

const DAY_NAMES_FULL = [
  'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
  'quinta-feira', 'sexta-feira', 'sábado',
]

export function WeekInsight({ globalWeekdayStats }) {
  if (!globalWeekdayStats) return null

  const scheduledDays = globalWeekdayStats
    .map((s, i) => ({
      ...s,
      day: i,
      rate: s.scheduled >= 2 ? s.done / s.scheduled : null,
    }))
    .filter((s) => s.rate !== null)

  if (scheduledDays.length === 0) return null

  const weakestDay = scheduledDays.reduce((min, d) => (d.rate < min.rate ? d : min))

  // Only show if the weakest day is meaningfully weaker (< 70%)
  if (weakestDay.rate >= 0.7) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl px-4 py-3.5 flex items-start gap-3"
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: '#ef444415' }}
      >
        <TrendingDown size={15} style={{ color: '#ef4444' }} />
      </div>
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-0.5"
          style={{ color: 'var(--ct4)' }}
        >
          Padrão detectado
        </p>
        <p className="text-sm" style={{ color: 'var(--ct2)' }}>
          Seu dia mais fraco é{' '}
          <span style={{ color: '#ef4444', fontWeight: 600 }}>
            {DAY_NAMES_FULL[weakestDay.day]}
          </span>{' '}
          <span style={{ color: 'var(--ct4)' }}>
            — {Math.round(weakestDay.rate * 100)}% de conclusão média
          </span>
        </p>
      </div>
    </motion.div>
  )
}
