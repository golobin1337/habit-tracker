import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingDown, TrendingUp } from 'lucide-react'

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const DAY_NAMES_FULL = [
  'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
  'quinta-feira', 'sexta-feira', 'sábado',
]

export function HabitDetailModal({ habit, weekdayStats, onClose }) {
  if (!habit) return null

  // Only include weekdays with enough samples
  const scheduledDays = weekdayStats
    ? weekdayStats.map((s, i) => ({
        ...s,
        day: i,
        rate: s.scheduled >= 4 ? s.done / s.scheduled : null,
      }))
    : []

  const activeDays = scheduledDays.filter((s) => s.rate !== null)
  const maxRate = Math.max(...activeDays.map((s) => s.rate), 0.01)

  const weakestDay = activeDays.length > 0
    ? activeDays.reduce((min, d) => (d.rate < min.rate ? d : min))
    : null

  const strongestDay = activeDays.length > 0
    ? activeDays.reduce((max, d) => (d.rate > max.rate ? d : max))
    : null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-6"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="w-full max-w-lg glass rounded-3xl p-5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${habit.color}18`, border: `1px solid ${habit.color}25` }}
              >
                {habit.icon}
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--ct1)' }}>
                  {habit.name}
                </h2>
                <p className="text-xs" style={{ color: 'var(--ct4)' }}>
                  Desempenho histórico por dia da semana
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              style={{ color: 'var(--ct4)' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* No data */}
          {!weekdayStats ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm" style={{ color: 'var(--ct4)' }}>
                Dados insuficientes — continue por pelo menos 4 semanas para ver padrões
              </p>
            </div>
          ) : (
            <>
              {/* Bar chart */}
              <div className="flex items-end gap-2 mb-5">
                {weekdayStats.map((s, i) => {
                  const sd = scheduledDays[i]
                  const isActive = sd.rate !== null
                  const rate = sd.rate ?? 0
                  const isWeakest = isActive && weakestDay?.day === i
                  const heightPct = isActive
                    ? Math.max((rate / maxRate) * 100, rate > 0 ? 8 : 4)
                    : 0
                  const barColor = isWeakest ? '#ef4444'
                    : rate >= 0.75 ? '#22c55e'
                    : rate >= 0.4 ? habit.color
                    : '#f97316'

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center" style={{ height: 64 }}>
                        {isActive ? (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPct}%` }}
                            transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
                            className="w-full rounded-md"
                            style={{
                              background: barColor,
                              boxShadow: rate > 0 ? `0 0 8px ${barColor}60` : undefined,
                              minHeight: 4,
                            }}
                          />
                        ) : (
                          <div className="w-full rounded-md" style={{ height: 4, background: 'var(--cfill3)' }} />
                        )}
                      </div>
                      <span
                        className="text-xs font-medium"
                        style={{ color: isWeakest ? '#ef4444' : isActive ? 'var(--ct3)' : 'var(--ct5)' }}
                      >
                        {DAY_NAMES[i]}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: isWeakest ? '#ef4444' : 'var(--ct5)' }}
                      >
                        {isActive ? `${Math.round(rate * 100)}%` : '—'}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Insights */}
              <div className="space-y-2">
                {weakestDay && weakestDay.rate < 0.6 && (
                  <div
                    className="rounded-xl px-3.5 py-3 flex items-start gap-2.5"
                    style={{ background: '#ef444412', border: '1px solid #ef444425' }}
                  >
                    <TrendingDown size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
                    <p className="text-sm" style={{ color: 'var(--ct2)' }}>
                      Você costuma falhar na{' '}
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>
                        {DAY_NAMES_FULL[weakestDay.day]}
                      </span>{' '}
                      <span style={{ color: 'var(--ct4)' }}>
                        ({Math.round(weakestDay.rate * 100)}% de conclusão)
                      </span>
                    </p>
                  </div>
                )}

                {strongestDay && strongestDay.rate >= 0.8 && (
                  <div
                    className="rounded-xl px-3.5 py-3 flex items-start gap-2.5"
                    style={{ background: '#22c55e12', border: '1px solid #22c55e25' }}
                  >
                    <TrendingUp size={14} style={{ color: '#22c55e', flexShrink: 0, marginTop: 1 }} />
                    <p className="text-sm" style={{ color: 'var(--ct2)' }}>
                      Seu melhor dia é{' '}
                      <span style={{ color: '#22c55e', fontWeight: 600 }}>
                        {DAY_NAMES_FULL[strongestDay.day]}
                      </span>{' '}
                      <span style={{ color: 'var(--ct4)' }}>
                        ({Math.round(strongestDay.rate * 100)}% de conclusão)
                      </span>
                    </p>
                  </div>
                )}

                {weakestDay && weakestDay.rate >= 0.6 && strongestDay && strongestDay.rate < 0.8 && (
                  <div
                    className="rounded-xl px-3.5 py-3 flex items-center gap-2.5"
                    style={{ background: 'var(--cfill2)' }}
                  >
                    <span className="text-base">📈</span>
                    <p className="text-sm" style={{ color: 'var(--ct3)' }}>
                      Bom desempenho geral — sem padrão de falha claro
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
