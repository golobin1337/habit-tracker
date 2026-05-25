import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Calendar, LayoutGrid, Moon, Sun, History, Bell, LogOut, Loader2 } from 'lucide-react'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useHabits } from './hooks/useHabits'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'
import { useReminders } from './hooks/useReminders'
import { HabitCard } from './components/HabitCard'
import { AddHabitModal } from './components/AddHabitModal'
import { AddReminderModal } from './components/AddReminderModal'
import { ReminderBanner } from './components/ReminderBanner'
import { AuthScreen } from './components/AuthScreen'
import { WeekView } from './components/WeekView'
import { MonthHeatmap } from './components/MonthHeatmap'
import { DayReminderList } from './components/DayReminderList'
import { MonthHabitRanking } from './components/MonthHabitRanking'
import { DayDetailModal } from './components/DayDetailModal'
import { StatsBar } from './components/StatsBar'
import { getWeekDays, isFuture, DAY_NAMES_SHORT, formatDate, toKey } from './utils/dateUtils'

const TABS = [
  { id: 'today', label: 'Hoje', icon: Moon },
  { id: 'yesterday', label: 'Ontem', icon: History },
  { id: 'week', label: 'Semana', icon: LayoutGrid },
  { id: 'month', label: 'Mês', icon: Calendar },
]

export default function App() {
  const [tab, setTab] = useState('today')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [reminderModalOpen, setReminderModalOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState(null)
  const [monthOffset, setMonthOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState(null)
  const { theme, toggle, isDark } = useTheme()
  const { user, signIn, signUp, signOut, loading: authLoading } = useAuth()

  const {
    addReminder, editReminder, dismissReminder, deleteReminder,
    todayReminders, upcomingReminders, overdueReminders, activeReminders, getRemindersForDate,
  } = useReminders(user?.id)

  const {
    habits,
    loading: habitsLoading,
    addHabit,
    editHabit,
    deleteHabit,
    toggleHabit,
    reorderHabits,
    isCompleted,
    getStreak,
    getTotalStreak,
    getWeekStats,
    getMonthStats,
    completionToday,
    getHabitProgress,
  } = useHabits(user?.id)

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const weekDays = getWeekDays(today)
  const weekStats = getWeekStats(weekDays)

  const monthDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
  const monthYear = monthDate.getFullYear()
  const monthMonth = monthDate.getMonth()
  const monthStats = getMonthStats(monthYear, monthMonth)

  const completedToday = habits.filter((h) => isCompleted(h.id, today)).length

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIndex = habits.findIndex((h) => h.id === active.id)
    const newIndex = habits.findIndex((h) => h.id === over.id)
    reorderHabits(arrayMove(habits, oldIndex, newIndex))
  }

  const getWeekDataForHabit = (habitId) =>
    weekDays.map((date, i) => ({
      done: isCompleted(habitId, date),
      future: isFuture(date),
      label: `${DAY_NAMES_SHORT[i]}: ${isCompleted(habitId, date) ? 'Feito' : 'Pendente'}`,
    }))

  // Auth loading
  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cbg-grad)' }}>
      <Loader2 size={32} className="animate-spin" style={{ color: '#8b5cf6' }} />
    </div>
  )

  // Not logged in
  if (!user) return <AuthScreen onSignIn={signIn} onSignUp={signUp} />

  return (
    <div
      className="min-h-screen transition-all duration-300"
      style={{ background: 'var(--cbg-grad)' }}
    >
      <div className="max-w-lg mx-auto px-4 py-8 pb-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{ color: 'var(--ct1)' }}
              >
                Habits
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">{formatDate(today)}</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={toggle}
                className="relative w-10 h-10 rounded-xl glass glass-hover flex items-center justify-center overflow-hidden"
                title={isDark ? 'Modo claro' : 'Modo escuro'}
              >
                <AnimatePresence mode="wait">
                  {isDark ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun size={16} style={{ color: '#fbbf24' }} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon size={16} style={{ color: '#8b5cf6' }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Reminders */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setReminderModalOpen(true)}
                className="relative w-10 h-10 rounded-xl glass glass-hover flex items-center justify-center"
                title="Novo lembrete"
              >
                <Bell size={16} style={{ color: '#f59e0b' }} />
                {activeReminders.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center"
                    style={{ background: overdueReminders.length > 0 ? '#ef4444' : '#f59e0b', fontSize: 9, fontWeight: 700 }}
                  >
                    {activeReminders.length}
                  </motion.span>
                )}
              </motion.button>

              {/* Logout */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={signOut}
                className="w-10 h-10 rounded-xl glass glass-hover flex items-center justify-center"
                title="Sair"
              >
                <LogOut size={15} style={{ color: 'var(--ct4)' }} />
              </motion.button>

              {/* Add habit */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
                }}
              >
                <Plus size={16} />
                Novo
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mb-6">
          <StatsBar
            completionToday={completionToday}
            totalStreak={getTotalStreak()}
            totalHabits={habits.length}
            completedToday={completedToday}
          />
        </div>

        {/* Tabs */}
        <div className="glass rounded-2xl p-1 flex gap-1 mb-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all relative"
              style={{ color: tab === id ? 'var(--ct1)' : 'var(--ct4)' }}
            >
              {tab === id && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'rgba(139,92,246,0.2)',
                    border: '1px solid rgba(139,92,246,0.35)',
                  }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
              <Icon size={15} className="relative z-10" />
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {tab === 'today' && (
            <motion.div
              key="today"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              className="space-y-3"
            >
              <AnimatePresence>
                {(todayReminders.length > 0 || overdueReminders.length > 0 || upcomingReminders.length > 0) && (
                  <ReminderBanner
                    todayReminders={todayReminders}
                    overdueReminders={overdueReminders}
                    upcomingReminders={upcomingReminders}
                    onDismiss={dismissReminder}
                    onDelete={deleteReminder}
                    onEdit={(r) => { setEditingReminder(r); setReminderModalOpen(true) }}
                  />
                )}
              </AnimatePresence>

              {habits.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="text-5xl mb-4">🌱</div>
                  <p className="text-slate-400 font-medium">Nenhum hábito ainda</p>
                  <p className="text-slate-600 text-sm mt-1">
                    Clique em &ldquo;Novo&rdquo; para começar
                  </p>
                </motion.div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={habits.map((h) => h.id)} strategy={verticalListSortingStrategy}>
                    <AnimatePresence>
                      {habits.map((habit) => {
                        const prog = getHabitProgress(habit, weekDays)
                        return (
                          <HabitCard
                            key={habit.id}
                            habit={habit}
                            completed={prog.completed}
                            progress={prog.progress}
                            freqLabel={prog.label}
                            streak={getStreak(habit.id)}
                            onToggle={() => toggleHabit(habit.id, today)}
                            onDelete={() => deleteHabit(habit.id)}
                            onEdit={() => { setEditingHabit(habit); setModalOpen(true) }}
                            weekData={getWeekDataForHabit(habit.id)}
                          />
                        )
                      })}
                    </AnimatePresence>
                  </SortableContext>
                </DndContext>
              )}

              {habits.length > 0 && completedToday === habits.length && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-emerald-400 font-semibold">Todos os hábitos concluídos!</p>
                  <p className="text-slate-500 text-sm mt-1">Incrível, continue assim!</p>
                </motion.div>
              )}

              <DayReminderList reminders={getRemindersForDate(toKey(today))} onDelete={deleteReminder} />
            </motion.div>
          )}

          {tab === 'yesterday' && (
            <motion.div
              key="yesterday"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              className="space-y-3"
            >
              <div
                className="flex items-center gap-2 px-1 mb-1"
                style={{ color: 'var(--ct4)' }}
              >
                <History size={13} />
                <span className="text-xs">{formatDate(yesterday)}</span>
              </div>

              {habits.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="text-5xl mb-4">🌱</div>
                  <p className="text-slate-400 font-medium">Nenhum hábito ainda</p>
                </motion.div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={habits.map((h) => h.id)} strategy={verticalListSortingStrategy}>
                    <AnimatePresence>
                      {habits.map((habit) => (
                        <HabitCard
                          key={habit.id}
                          habit={habit}
                          completed={isCompleted(habit.id, yesterday)}
                          streak={getStreak(habit.id)}
                          onToggle={() => toggleHabit(habit.id, yesterday)}
                          onDelete={() => deleteHabit(habit.id)}
                          onEdit={() => { setEditingHabit(habit); setModalOpen(true) }}
                          weekData={getWeekDataForHabit(habit.id)}
                        />
                      ))}

                    </AnimatePresence>
                  </SortableContext>
                </DndContext>
              )}

              {(() => {
                const completedYesterday = habits.filter((h) =>
                  isCompleted(h.id, yesterday)
                ).length
                return habits.length > 0 && completedYesterday === habits.length ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="text-4xl mb-2">⭐</div>
                    <p className="text-emerald-400 font-semibold">Ontem foi perfeito!</p>
                    <p className="text-slate-500 text-sm mt-1">100% de conclusão</p>
                  </motion.div>
                ) : null
              })()}

              <DayReminderList reminders={getRemindersForDate(toKey(yesterday))} onDelete={deleteReminder} />
            </motion.div>
          )}

          {tab === 'week' && (
            <motion.div
              key="week"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              className="space-y-4"
            >
              <WeekView weekStats={weekStats} />

              <div className="glass rounded-2xl p-5">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider mb-4"
                  style={{ color: 'var(--ct3)' }}
                >
                  Por Hábito
                </h3>
                {habits.length === 0 ? (
                  <p className="text-slate-600 text-sm text-center py-4">
                    Nenhum hábito ainda
                  </p>
                ) : (
                  <div className="space-y-3">
                    {habits.map((habit) => {
                      const weekData = getWeekDataForHabit(habit.id)
                      const done = weekData.filter((d) => d.done).length
                      const total = weekData.length
                      const pct = total > 0 ? done / total : 0

                      return (
                        <div key={habit.id} className="flex items-center gap-3">
                          <span className="text-lg">{habit.icon}</span>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span
                                className="text-sm"
                                style={{ color: 'var(--ct2)' }}
                              >
                                {habit.name}
                              </span>
                              <span
                                className="text-xs"
                                style={{ color: 'var(--ct4)' }}
                              >
                                {done}/{total}
                              </span>
                            </div>
                            <div
                              className="h-1.5 rounded-full overflow-hidden"
                              style={{ background: 'var(--cfill2)' }}
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct * 100}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{
                                  background: habit.color,
                                  boxShadow: `0 0 8px ${habit.color}60`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {tab === 'month' && (
            <motion.div
              key="month"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
            >
              <MonthHeatmap
                year={monthYear}
                month={monthMonth}
                stats={monthStats}
                onPrev={() => setMonthOffset((o) => o - 1)}
                onNext={() => setMonthOffset((o) => o + 1)}
                onDayClick={setSelectedDay}
              />

              <div className="mt-4 glass rounded-2xl p-5">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider mb-4"
                  style={{ color: 'var(--ct3)' }}
                >
                  Resumo do Mês
                </h3>
                {(() => {
                  const values = Object.values(monthStats)
                  const avg =
                    values.length > 0
                      ? values.reduce((s, v) => s + v, 0) / values.length
                      : 0
                  const perfect = values.filter((v) => v >= 1).length
                  const zero = values.filter((v) => v === 0).length

                  return (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Média', value: `${Math.round(avg * 100)}%`, color: '#8b5cf6' },
                        { label: 'Dias perfeitos', value: perfect, color: '#22c55e' },
                        { label: 'Dias zerados', value: zero, color: '#ef4444' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="text-center">
                          <p className="text-xl font-bold" style={{ color }}>
                            {value}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--ct4)' }}>
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>

              <MonthHabitRanking
                habits={habits}
                year={monthYear}
                month={monthMonth}
                isCompleted={isCompleted}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AddHabitModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingHabit(null) }}
        onAdd={addHabit}
        onEdit={editHabit}
        editingHabit={editingHabit}
      />

      <AddReminderModal
        open={reminderModalOpen}
        onClose={() => { setReminderModalOpen(false); setEditingReminder(null) }}
        onAdd={addReminder}
        onEdit={editReminder}
        editingReminder={editingReminder}
      />

      {selectedDay && (
        <DayDetailModal
          date={selectedDay}
          habits={habits}
          isCompleted={isCompleted}
          reminders={getRemindersForDate(toKey(selectedDay))}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  )
}
