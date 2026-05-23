import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getMonthDays, toKey, isToday, MONTH_NAMES, DAY_NAMES_SHORT } from '../utils/dateUtils'

const intensityColor = (value) => {
  if (value === 0) return 'var(--cfill2)'
  if (value < 0.25) return 'rgba(139,92,246,0.2)'
  if (value < 0.5) return 'rgba(139,92,246,0.4)'
  if (value < 0.75) return 'rgba(139,92,246,0.65)'
  return 'rgba(139,92,246,0.9)'
}

export function MonthHeatmap({ year, month, stats, onPrev, onNext }) {
  const days = getMonthDays(year, month)

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--ct3)' }}
        >
          {MONTH_NAMES[month]} {year}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={onPrev}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={onNext}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES_SHORT.map((d) => (
          <div
            key={d}
            className="text-center text-xs py-1"
            style={{ color: 'var(--ct5)' }}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, currentMonth }, i) => {
          const key = toKey(date)
          const value = currentMonth ? (stats[key] ?? 0) : 0
          const today = isToday(date)

          return (
            <motion.div
              key={key + i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: currentMonth ? 1 : 0.2, scale: 1 }}
              transition={{ delay: i * 0.008 }}
              className="aspect-square rounded-md flex items-center justify-center relative"
              style={{
                backgroundColor: currentMonth
                  ? intensityColor(value)
                  : 'var(--cfill3)',
                boxShadow: today
                  ? '0 0 0 2px rgba(139,92,246,0.8)'
                  : value >= 0.75 && currentMonth
                  ? '0 0 8px rgba(139,92,246,0.4)'
                  : undefined,
              }}
              title={`${date.getDate()}/${month + 1}: ${Math.round(value * 100)}%`}
            >
              <span
                className="text-xs leading-none"
                style={{
                  color: today ? '#a78bfa' : 'var(--ct4)',
                  fontWeight: today ? 700 : 400,
                }}
              >
                {currentMonth ? date.getDate() : ''}
              </span>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs" style={{ color: 'var(--ct5)' }}>
          Menos
        </span>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <div
            key={v}
            className="w-3.5 h-3.5 rounded-sm"
            style={{ backgroundColor: intensityColor(v) }}
          />
        ))}
        <span className="text-xs" style={{ color: 'var(--ct5)' }}>
          Mais
        </span>
      </div>
    </div>
  )
}
