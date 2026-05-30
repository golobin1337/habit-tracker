import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Clock, AlertTriangle, Bell, CalendarPlus, FileText } from 'lucide-react'
import { MONTH_NAMES, toKey } from '../utils/dateUtils'

const DAY_NAMES_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

function HabitRow({ h, done, isLater, onToggle, date, note, onNoteChange }) {
  const [noteText, setNoteText] = useState(note ?? '')
  useEffect(() => { setNoteText(note ?? '') }, [note])

  const handleNoteBlur = () => {
    if (noteText !== (note ?? '')) onNoteChange?.(noteText)
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: done ? '#22c55e12' : 'var(--cfill2)',
        border: `1px solid ${done ? '#22c55e30' : 'transparent'}`,
        opacity: isLater ? 0.65 : 1,
      }}
    >
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onToggle?.(h.id, date)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
      >
        <span className="text-base flex-shrink-0" style={{ opacity: done ? 1 : 0.4 }}>
          {h.icon}
        </span>
        <div className="flex-1 min-w-0">
          <span
            className="text-sm font-medium block truncate"
            style={{ color: done ? '#22c55e' : isLater ? 'var(--ct4)' : 'var(--ct2)' }}
          >
            {h.name}
          </span>
          {isLater && (
            <span className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--ct5)' }}>
              <CalendarPlus size={10} /> criado depois
            </span>
          )}
        </div>
        <motion.div
          animate={{ background: done ? '#22c55e' : 'var(--cfill3)', scale: done ? 1 : 0.85 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        >
          <AnimatePresence mode="wait">
            {done && (
              <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
                <Check size={12} style={{ color: 'white' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.button>

      {/* Nota */}
      <div className="flex items-center gap-2 px-3 pb-2.5">
        <FileText size={11} className="flex-shrink-0" style={{ color: 'var(--ct5)' }} />
        <input
          type="text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onBlur={handleNoteBlur}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          placeholder="Nota (opcional)..."
          className="flex-1 text-xs outline-none bg-transparent"
          style={{ color: noteText ? 'var(--ct2)' : 'var(--ct5)' }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )
}

export function DayDetailModal({ date, habits, isCompleted, isHabitActiveOnDate, onToggle, getNote, setNote, reminders, onClose }) {
  if (!date) return null

  const key = toKey(date)
  const dayName = DAY_NAMES_FULL[date.getDay()]
  const monthName = MONTH_NAMES[date.getMonth()]
  const label = `${dayName}, ${date.getDate()} de ${monthName}`

  // Hábitos que existiam naquele dia e estavam agendados
  const existingHabits = habits.filter((h) => {
    const start = h.start_date ?? h.created_at?.slice(0, 10) ?? ''
    return start <= key && isHabitActiveOnDate(h, date)
  })

  // Hábitos criados APÓS o dia, mas agendados para esse dia da semana
  const laterHabits = habits.filter((h) => {
    const start = h.start_date ?? h.created_at?.slice(0, 10) ?? ''
    return start > key && isHabitActiveOnDate(h, date)
  })

  const doneCount = existingHabits.filter((h) => isCompleted(h.id, date)).length
  const total = existingHabits.length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0
  const pctColor = pct >= 75 ? '#22c55e' : pct >= 40 ? '#8b5cf6' : '#f97316'

  const urgentReminders = reminders.filter((r) => r.urgent)
  const normalReminders = reminders.filter((r) => !r.urgent)
  const sortedReminders = [...urgentReminders, ...normalReminders]

  const hasAnything = existingHabits.length > 0 || laterHabits.length > 0 || sortedReminders.length > 0

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

          {/* Progress bar — só conta hábitos que existiam */}
          {total > 0 && (
            <div className="mb-5">
              <div className="flex justify-between mb-1.5">
                <span className="text-xs" style={{ color: 'var(--ct4)' }}>
                  {doneCount}/{total} hábitos
                </span>
                <span className="text-xs font-bold" style={{ color: pctColor }}>
                  {pct}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--cfill2)' }}>
                <motion.div
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: pctColor }}
                />
              </div>
            </div>
          )}

          {/* Hábitos que existiam naquele dia */}
          {existingHabits.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ct3)' }}>
                Hábitos
              </p>
              <div className="space-y-1.5">
                {existingHabits.map((h) => (
                  <HabitRow
                    key={h.id}
                    h={h}
                    done={isCompleted(h.id, date)}
                    isLater={false}
                    onToggle={onToggle}
                    date={date}
                    note={getNote?.(h.id, date)}
                    onNoteChange={(text) => setNote?.(h.id, date, text)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Hábitos criados depois */}
          {laterHabits.length > 0 && (
            <div className="mb-4">
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                style={{ color: 'var(--ct5)' }}
              >
                <CalendarPlus size={11} />
                Criados depois deste dia
              </p>
              <div className="space-y-1.5">
                {laterHabits.map((h) => (
                  <HabitRow
                    key={h.id}
                    h={h}
                    done={isCompleted(h.id, date)}
                    isLater={true}
                    onToggle={onToggle}
                    date={date}
                    note={getNote?.(h.id, date)}
                    onNoteChange={(text) => setNote?.(h.id, date, text)}
                  />
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
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: r.done ? '#22c55e20' : `${color}15` }}
                      >
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

          {!hasAnything && (
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
