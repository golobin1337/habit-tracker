import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { toKey, today } from '../utils/dateUtils'

const MEDALS = ['🥇', '🥈', '🥉']

export function MonthHabitRanking({ habits, year, month, isCompleted }) {
  const stats = useMemo(() => {
    const todayKey = today()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    return habits
      .map((habit) => {
        let completed = 0
        let validDays = 0
        const startDate = habit.start_date ?? habit.created_at?.slice(0, 10) ?? ''
        const ft = habit.frequency_type || 'daily'
        const fc = habit.frequency_count || 1

        const specificDays = habit.frequency_days ?? []

        for (let d = 1; d <= daysInMonth; d++) {
          const date = new Date(year, month, d)
          const key = toKey(date)
          if (key > todayKey) break
          if (startDate <= key) {
            const scheduled = ft !== 'specific' || specificDays.includes(date.getDay())
            if (scheduled) {
              validDays++
              if (isCompleted(habit.id, date)) completed++
            }
          }
        }

        const fullWeeks = Math.floor(validDays / 7)
        const remainingDays = validDays % 7
        const possible = (ft === 'daily' || ft === 'specific') ? validDays
          : ft === 'weekly' ? fullWeeks * fc + Math.min(remainingDays, fc)
          : fc

        return { habit, completed, possible, rate: possible > 0 ? completed / possible : 0 }
      })
      .sort((a, b) => b.rate - a.rate)
  }, [habits, year, month, isCompleted])

  if (stats.length === 0) return null

  const best = stats[0]?.rate ?? 0

  return (
    <div className="glass rounded-2xl p-5 mt-4">
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-4"
        style={{ color: 'var(--ct3)' }}
      >
        Ranking do Mês
      </h3>

      <div className="space-y-3">
        {stats.map(({ habit, completed, possible, rate }, i) => {
          const isTop = i < 3 && rate > 0
          const isLast = i === stats.length - 1 && stats.length > 1

          // Bar color: green for top, purple mid, red for stragglers
          const barColor =
            rate >= 0.75 ? '#22c55e'
            : rate >= 0.4 ? habit.color
            : rate > 0 ? '#f97316'
            : '#ef4444'

          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3"
            >
              {/* Rank */}
              <div className="w-7 text-center flex-shrink-0">
                {isTop && rate > 0
                  ? <span className="text-base">{MEDALS[i]}</span>
                  : <span className="text-xs font-bold" style={{ color: 'var(--ct5)' }}>#{i + 1}</span>
                }
              </div>

              {/* Icon */}
              <span
                className="text-lg flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${habit.color}18` }}
              >
                {habit.icon}
              </span>

              {/* Bar + name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-sm font-medium truncate"
                    style={{ color: isLast && rate === 0 ? 'var(--ct4)' : 'var(--ct1)' }}
                  >
                    {habit.name}
                  </span>
                  <span
                    className="text-xs ml-2 flex-shrink-0 font-semibold"
                    style={{ color: barColor }}
                  >
                    {completed}/{possible}
                  </span>
                </div>

                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'var(--cfill2)' }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rate * 100}%` }}
                    transition={{ duration: 0.7, delay: i * 0.04, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background: barColor,
                      boxShadow: rate > 0 ? `0 0 6px ${barColor}60` : undefined,
                    }}
                  />
                </div>
              </div>

              {/* % */}
              <div
                className="text-xs font-bold w-10 text-right flex-shrink-0"
                style={{ color: barColor }}
              >
                {Math.round(rate * 100)}%
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div
        className="mt-4 pt-3 flex gap-4 text-xs flex-wrap"
        style={{ borderTop: '1px solid var(--cline)', color: 'var(--ct5)' }}
      >
        {[
          { color: '#22c55e', label: '≥ 75% — Ótimo' },
          { color: '#8b5cf6', label: '40–74% — Regular' },
          { color: '#f97316', label: '< 40% — Fraco' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
