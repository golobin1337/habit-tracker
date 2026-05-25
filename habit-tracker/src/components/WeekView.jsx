import { motion } from 'framer-motion'
import { DAY_NAMES_SHORT, isToday, isFuture } from '../utils/dateUtils'

export function WeekView({ weekStats }) {
  const max = Math.max(...weekStats.map((d) => d.completion), 0.01)

  return (
    <div className="glass rounded-2xl p-5">
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-4"
        style={{ color: 'var(--ct3)' }}
      >
        Esta Semana
      </h3>

      <div className="flex items-end gap-2">
        {weekStats.map(({ date, completion }, i) => {
          const today = isToday(date)
          const future = isFuture(date)
          const heightPct = future ? 0 : Math.max((completion / max) * 100, completion > 0 ? 8 : 4)

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex items-end justify-center" style={{ height: 64 }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
                  className="w-full rounded-md relative"
                  style={{
                    background: future
                      ? 'var(--cfill3)'
                      : completion === 0
                      ? 'var(--cfill2)'
                      : 'linear-gradient(180deg, #8b5cf6, #6d28d9)',
                    boxShadow:
                      !future && completion > 0
                        ? '0 0 12px rgba(139,92,246,0.4)'
                        : undefined,
                    minHeight: 4,
                  }}
                >
                  {today && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
                  )}
                </motion.div>
              </div>

              <span
                className="text-xs font-medium"
                style={{ color: today ? '#a78bfa' : 'var(--ct4)' }}
              >
                {DAY_NAMES_SHORT[i]}
              </span>

              {!future && (
                <span className="text-xs" style={{ color: 'var(--ct5)' }}>
                  {Math.round(completion * 100)}%
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div
        className="mt-4 pt-4"
        style={{ borderTop: '1px solid var(--cline)' }}
      >
        <div className="flex justify-between text-xs" style={{ color: 'var(--ct4)' }}>
          <span>
            Melhor dia:{' '}
            <span style={{ color: 'var(--ct2)' }}>
              {Math.round(Math.max(...weekStats.map((d) => d.completion)) * 100)}%
            </span>
          </span>
          <span>
            Média:{' '}
            <span style={{ color: 'var(--ct2)' }}>
              {Math.round(
                (weekStats.reduce((s, d) => s + (isFuture(d.date) ? 0 : d.completion), 0) /
                  (weekStats.filter((d) => !isFuture(d.date)).length || 1)) *
                  100
              )}%
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
