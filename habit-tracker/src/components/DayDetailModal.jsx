import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Clock, AlertTriangle, Bell } from 'lucide-react'
import { MONTH_NAMES, DAY_NAMES_SHORT, toKey } from '../utils/dateUtils'

const DAY_NAMES_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

function formatTime(time) {
  return time ? ` às ${time}` : ''
}

export function DayDetailModal({ date, habits, isCompleted, isHabitActiveOnDate, reminders, onClose }) {
  if (!date) return null

  const key = toKey(date)
  const dayName = DAY_NAMES_FULL[date.getDay()]
  const monthName = MONTH_NAMES[date.getMonth()]
  const label = `${dayName}, ${date.getDate()} de ${monthName}`

  const activeHabits = habits.filter((h) => {
    const start = h.start_date ?? h.created_at?.slice(0, 10) ?? ''
    return start <= key && isHabitActiveOnDate(h, date)
  })
  const doneHabits = activeHabits.filter((h) => isCompleted(h.id, date))
  const missedHabits = activeHabits.filter((h) => !isCompleted(h.id, date))

  const urgentReminders = reminders.filter((r) => r.urgent)
  const normalReminders = reminders.filter((r) => !r.urgent)
  const sortedReminders = [...urgentReminders, ...normalReminders]

  const totalHabits = doneHabits.length + missedHabits.length
  const pct = totalHabits > 0 ? Math.round((doneHabits.length / totalHabits) * 100) : 0

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
          className="w-full max-w-lg glass rounded-3xl p-5 max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--ct4)' }}>
                Resumo do dia
              </p>
              <h2 className="text-lg font-bold" style={{ color: 'var(--ct1)' }}>
                {label}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              style={{ color: 'var(--ct4)' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Progress bar */}
          {totalHabits > 0 && (
            <div className="mb-5">
              <div className="flex justify-between mb-1.5">
                <span className="text-xs" style={{ color: 'var(--ct4)' }}>
                  {doneHabits.length}/{totalHabits} hábitos
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: pct >= 75 ? '#22c55e' : pct >= 40 ? '#8b5cf6' : '#f97316' }}
                >
                  {pct}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--cfill2)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: pct >= 75 ? '#22c55e' : pct >= 40 ? '#8b5cf6' : '#f97316',
                  }}
                />
              </div>
            </div>
          )}

          {/* Hábitos concluídos */}
          {doneHabits.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#22c55e' }}>
                <Check size={11} /> Concluídos ({doneHabits.length})
              </p>
              <div className="space-y-1.5">
                {doneHabits.map((h) => (
                  <div key={h.id} className="flex items-center gap-2.5 rounded-xl px-3 py-2" style={{ background: '#22c55e12' }}>
                    <span className="text-base">{h.icon}</span>
                    <span className="text-sm font-medium" style={{ color: '#22c55e' }}>{h.name}</span>
                    <Check size={13} className="ml-auto" style={{ color: '#22c55e' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hábitos não feitos */}
          {missedHabits.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ct4)' }}>
                Não realizados ({missedHabits.length})
              </p>
              <div className="space-y-1.5">
                {missedHabits.map((h) => (
                  <div key={h.id} className="flex items-center gap-2.5 rounded-xl px-3 py-2" style={{ background: 'var(--cfill2)' }}>
                    <span className="text-base" style={{ opacity: 0.4 }}>{h.icon}</span>
                    <span className="text-sm" style={{ color: 'var(--ct4)' }}>{h.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lembretes */}
          {sortedReminders.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: 'var(--ct3)' }}>
                <Bell size={11} /> Lembretes ({sortedReminders.length})
              </p>
              <div className="space-y-1.5">
                {sortedReminders.map((r) => {
                  const color = r.urgent ? '#ef4444' : '#f59e0b'
                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2"
                      style={{
                        background: r.done ? 'var(--cfill2)' : `${color}12`,
                        border: `1px solid ${r.done ? 'transparent' : `${color}25`}`,
                        opacity: r.done ? 0.6 : 1,
                      }}
                    >
                      <span className="text-base">{r.urgent ? '🚨' : '🔔'}</span>
                      <div className="flex-1 min-w-0">
                        <span
                          className="text-sm font-medium"
                          style={{
                            color: r.done ? 'var(--ct4)' : 'var(--ct1)',
                            textDecoration: r.done ? 'line-through' : 'none',
                          }}
                        >
                          {r.title}
                        </span>
                        {r.time && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock size={10} style={{ color: 'var(--ct5)' }} />
                            <span className="text-xs" style={{ color: 'var(--ct5)' }}>{r.time}</span>
                          </div>
                        )}
                      </div>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: r.done ? '#22c55e20' : `${color}15` }}>
                        {r.done
                          ? <Check size={12} style={{ color: '#22c55e' }} />
                          : r.urgent
                            ? <AlertTriangle size={12} style={{ color }} />
                            : <Clock size={12} style={{ color }} />
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {totalHabits === 0 && sortedReminders.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm" style={{ color: 'var(--ct4)' }}>Nenhum registro para este dia</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
