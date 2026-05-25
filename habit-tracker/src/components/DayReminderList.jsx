import { motion } from 'framer-motion'
import { Check, Clock, AlertTriangle, Bell } from 'lucide-react'
import { MONTH_NAMES } from '../utils/dateUtils'

function formatTime(time) {
  return time ? ` às ${time}` : ''
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${d} de ${MONTH_NAMES[m - 1]}`
}

export function DayReminderList({ reminders }) {
  if (!reminders || reminders.length === 0) return null

  const urgent = reminders.filter((r) => r.urgent)
  const normal = reminders.filter((r) => !r.urgent)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 mt-4"
    >
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5"
        style={{ color: 'var(--ct3)' }}
      >
        <Bell size={11} />
        Lembretes do Dia
      </h3>

      <div className="space-y-2">
        {[...urgent, ...normal].map((r, i) => {
          const color = r.urgent ? '#ef4444' : '#f59e0b'
          const icon = r.urgent ? '🚨' : '🔔'

          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-xl p-3"
              style={{
                background: r.done ? 'var(--cfill2)' : `${color}10`,
                border: `1px solid ${r.done ? 'transparent' : `${color}25`}`,
                opacity: r.done ? 0.6 : 1,
              }}
            >
              <span className="text-base flex-shrink-0">{icon}</span>

              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{
                    color: r.done ? 'var(--ct4)' : 'var(--ct1)',
                    textDecoration: r.done ? 'line-through' : 'none',
                  }}
                >
                  {r.title}
                </p>
                {r.time && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={10} style={{ color: 'var(--ct5)' }} />
                    <span className="text-xs" style={{ color: 'var(--ct5)' }}>
                      {formatDate(r.date)}{formatTime(r.time)}
                    </span>
                  </div>
                )}
              </div>

              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: r.done ? '#22c55e20' : `${color}15`,
                }}
              >
                {r.done
                  ? <Check size={12} style={{ color: '#22c55e' }} />
                  : r.urgent
                    ? <AlertTriangle size={12} style={{ color }} />
                    : <Clock size={12} style={{ color }} />
                }
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
