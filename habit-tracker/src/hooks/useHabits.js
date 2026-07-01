import { useState, useCallback, useMemo, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { today, toKey } from '../utils/dateUtils'

const COLORS = [
  { name: 'Violeta', value: '#8b5cf6' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Ciano', value: '#06b6d4' },
  { name: 'Verde', value: '#22c55e' },
  { name: 'Amarelo', value: '#eab308' },
  { name: 'Laranja', value: '#f97316' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Vermelho', value: '#ef4444' },
]

export const PRESET_COLORS = COLORS

const ICONS = [
  // Saúde & corpo
  '🧘', '🏃', '💪', '🚴', '🏋️', '🧗', '🤸', '🏊',
  // Mente & estudo
  '📚', '🧠', '✍️', '🎯', '📝', '💡', '🔬', '🎓',
  // Alimentação & sono
  '🍎', '💧', '😴', '🥗', '☕', '🍵', '🥦', '🫁',
  // Dinheiro & trabalho
  '💰', '💵', '💳', '📈', '💼', '🏦', '🪙', '📊',
  // Tecnologia & computador
  '💻', '🖥️', '⌨️', '🖱️', '📱', '🖨️', '💾', '🔌',
  // Mensagens & comunicação
  '💬', '📩', '📧', '📞', '☎️', '📡', '🗣️', '📣',
  // Criatividade & lazer
  '🎨', '🎵', '🎮', '📷', '🎭', '🎸', '🎬', '🖌️',
  // Lifestyle
  '🌱', '🌿', '🙏', '❤️', '⭐', '🔥', '🌅', '🫂',
  // Casa & ambiente
  '🏠', '🛋️', '🧹', '🧺', '🪴', '🛁', '🪟', '🔑',
  // Bandeiras
  '🇧🇷', '🇺🇸', '🇬🇧', '🇪🇸', '🇫🇷', '🇩🇪', '🇯🇵', '🇨🇳',
  '🇮🇹', '🇵🇹', '🇦🇷', '🇨🇦', '🇦🇺', '🇰🇷', '🇷🇺', '🇲🇽',
]
export const PRESET_ICONS = ICONS

export function useHabits(userId) {
  const [habits, setHabits] = useState([])
  const [archivedHabits, setArchivedHabits] = useState([])
  // Set de "habitId:YYYY-MM-DD" para lookup O(1)
  const [completedSet, setCompletedSet] = useState(new Set())
  // Map de "habitId:YYYY-MM-DD" → note text
  const [notesMap, setNotesMap] = useState(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }

    async function load() {
      setLoading(true)
      const [{ data: habitsData }, logsResult] = await Promise.all([
        supabase.from('habits').select('*').order('position', { ascending: true }).order('created_at', { ascending: true }),
        supabase.from('habit_logs').select('habit_id, date, note'),
      ])

      // Se a coluna note ainda não existe no banco, faz fallback sem ela
      let logs = logsResult.data
      if (logsResult.error) {
        const { data: fallback } = await supabase.from('habit_logs').select('habit_id, date')
        logs = fallback
      }

      setHabits((habitsData ?? []).filter((h) => !h.archived))
      setArchivedHabits((habitsData ?? []).filter((h) => !!h.archived))
      const safeLog = logs ?? []
      setCompletedSet(new Set(safeLog.map((l) => `${l.habit_id}:${l.date}`)))
      const map = new Map()
      safeLog.forEach((l) => { if (l.note) map.set(`${l.habit_id}:${l.date}`, l.note) })
      setNotesMap(map)
      setLoading(false)
    }

    load()
  }, [userId])

  const addHabit = useCallback(async (habit) => {
    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        name: habit.name,
        icon: habit.icon || '🎯',
        color: habit.color || '#8b5cf6',
        start_date: today(),
        position: habits.length,
        frequency_type: habit.frequency_type || 'daily',
        frequency_count: habit.frequency_count || 1,
        frequency_days: habit.frequency_days ?? null,
      })
      .select()
      .single()
    if (!error && data) setHabits((prev) => [...prev, data])
  }, [userId, habits.length])

  const reorderHabits = useCallback(async (newOrder) => {
    setHabits(newOrder)
    await Promise.all(
      newOrder.map((habit, i) =>
        supabase.from('habits').update({ position: i }).eq('id', habit.id)
      )
    )
  }, [])

  const editHabit = useCallback(async (id, updates) => {
    const { error } = await supabase.from('habits').update(updates).eq('id', id)
    if (!error) setHabits((prev) => prev.map((h) => h.id === id ? { ...h, ...updates } : h))
  }, [])

  const deleteHabit = useCallback(async (id) => {
    const { error } = await supabase.from('habits').delete().eq('id', id)
    if (!error) setHabits((prev) => prev.filter((h) => h.id !== id))
  }, [])

  const archiveHabit = useCallback(async (id) => {
    const habit = habits.find((h) => h.id === id)
    if (!habit) return
    const { error } = await supabase.from('habits').update({ archived: true }).eq('id', id)
    if (!error) {
      setHabits((prev) => prev.filter((h) => h.id !== id))
      setArchivedHabits((prev) => [...prev, { ...habit, archived: true }])
    }
  }, [habits])

  const unarchiveHabit = useCallback(async (id) => {
    const habit = archivedHabits.find((h) => h.id === id)
    if (!habit) return
    const { error } = await supabase.from('habits').update({ archived: false }).eq('id', id)
    if (!error) {
      setArchivedHabits((prev) => prev.filter((h) => h.id !== id))
      setHabits((prev) =>
        [...prev, { ...habit, archived: false }].sort((a, b) => a.position - b.position)
      )
    }
  }, [archivedHabits])

  const toggleHabit = useCallback(async (habitId, date) => {
    const key = toKey(date)
    const setKey = `${habitId}:${key}`
    const wasCompleted = completedSet.has(setKey)

    setCompletedSet((prev) => {
      const next = new Set(prev)
      wasCompleted ? next.delete(setKey) : next.add(setKey)
      return next
    })

    if (wasCompleted) {
      setNotesMap((prev) => { const next = new Map(prev); next.delete(setKey); return next })
      await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('date', key)
    } else {
      await supabase.from('habit_logs').insert({ habit_id: habitId, user_id: userId, date: key })
    }
  }, [completedSet, userId])

  const setNote = useCallback(async (habitId, date, text) => {
    const key = toKey(date)
    const mapKey = `${habitId}:${key}`
    setNotesMap((prev) => {
      const next = new Map(prev)
      text.trim() ? next.set(mapKey, text.trim()) : next.delete(mapKey)
      return next
    })
    await supabase.from('habit_logs')
      .update({ note: text.trim() || null })
      .eq('habit_id', habitId)
      .eq('date', key)
  }, [])

  const getNote = useCallback((habitId, date) =>
    notesMap.get(`${habitId}:${toKey(date)}`) ?? '',
  [notesMap])

  const isCompleted = useCallback((habitId, date) =>
    completedSet.has(`${habitId}:${toKey(date)}`),
  [completedSet])

  const getDayCompletion = useCallback((date) => {
    const key = toKey(date)
    const relevant = habits.filter((h) => {
      const start = h.start_date ?? h.created_at ?? ''
      if (start > key) return false
      if ((h.frequency_type ?? 'daily') === 'specific') {
        const days = h.frequency_days
        if (days && days.length > 0) return days.includes(date.getDay())
      }
      return true
    })
    if (relevant.length === 0) return 0
    const done = relevant.filter((h) => completedSet.has(`${h.id}:${key}`)).length
    return done / relevant.length
  }, [habits, completedSet])

  const getStreak = useCallback((habitId) => {
    const habit = habits.find((h) => h.id === habitId)
    if (!habit) return 0

    const ft = habit.frequency_type ?? 'daily'
    const scheduledDays = ft === 'specific' ? (habit.frequency_days ?? []) : null

    const isScheduled = (date) => {
      if (scheduledDays === null) return true
      if (scheduledDays.length === 0) return true
      return scheduledDays.includes(date.getDay())
    }

    let streak = 0
    const d = new Date()

    while (true) {
      const key = toKey(d)

      if (!isScheduled(d)) {
        d.setDate(d.getDate() - 1)
        continue
      }

      const done = completedSet.has(`${habitId}:${key}`)

      if (!done) {
        // grace: if today is not yet done, skip and look at yesterday
        if (key === today() && streak === 0) {
          d.setDate(d.getDate() - 1)
          continue
        }
        break
      }

      streak++
      d.setDate(d.getDate() - 1)
    }

    return streak
  }, [completedSet, habits])

  const getTotalStreak = useCallback(() => {
    let streak = 0
    const d = new Date()
    while (true) {
      const key = toKey(d)
      const completion = getDayCompletion(new Date(key))
      if (completion < 1 && habits.length > 0) {
        if (key === today() && streak === 0) { d.setDate(d.getDate() - 1); continue }
        break
      }
      if (habits.length === 0) break
      streak++
      d.setDate(d.getDate() - 1)
    }
    return streak
  }, [getDayCompletion, habits])

  const getWeekStats = useCallback((weekDays) =>
    weekDays.map((date) => ({ date, completion: getDayCompletion(date) })),
  [getDayCompletion])

  const getMonthStats = useCallback((year, month) => {
    const stats = {}
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      stats[toKey(date)] = getDayCompletion(date)
    }
    return stats
  }, [getDayCompletion])

  const completionToday = useMemo(() => getDayCompletion(new Date()), [getDayCompletion])

  const isHabitActiveOnDate = useCallback((habit, date) => {
    if ((habit.frequency_type ?? 'daily') !== 'specific') return true
    const days = habit.frequency_days
    if (!days || days.length === 0) return true // coluna ausente → mostra sempre
    return days.includes(date.getDay())
  }, [])

  // Returns Array(7) of {scheduled, done} indexed by JS weekday (0=Sun…6=Sat)
  // Returns null if habit has < 28 days of history or no weekday has >= 4 samples
  const getHabitWeekdayStats = useCallback((habitId) => {
    const habit = habits.find((h) => h.id === habitId)
    if (!habit) return null
    const startStr = habit.start_date ?? habit.created_at?.slice(0, 10)
    if (!startStr) return null
    const start = new Date(startStr)
    const todayDate = new Date()
    const todayKey = toKey(todayDate)
    if (Math.floor((todayDate - start) / 86400000) < 14) return null
    const byWeekday = Array(7).fill(null).map(() => ({ scheduled: 0, done: 0 }))
    const d = new Date(start)
    while (toKey(d) <= todayKey) {
      if (isHabitActiveOnDate(habit, d)) {
        const wd = d.getDay()
        byWeekday[wd].scheduled++
        if (completedSet.has(`${habitId}:${toKey(d)}`)) byWeekday[wd].done++
      }
      d.setDate(d.getDate() + 1)
    }
    if (!byWeekday.some((s) => s.scheduled >= 2)) return null
    return byWeekday
  }, [habits, completedSet, isHabitActiveOnDate])

  // Accumulated weekday stats across all habits; null if insufficient history
  const globalWeekdayStats = useMemo(() => {
    if (habits.length === 0) return null
    const todayDate = new Date()
    const todayKey = toKey(todayDate)
    const byWeekday = Array(7).fill(null).map(() => ({ scheduled: 0, done: 0 }))
    let hasEnough = false
    habits.forEach((habit) => {
      const startStr = habit.start_date ?? habit.created_at?.slice(0, 10)
      if (!startStr) return
      const start = new Date(startStr)
      if (Math.floor((todayDate - start) / 86400000) >= 14) hasEnough = true
      const d = new Date(start)
      while (toKey(d) <= todayKey) {
        if (isHabitActiveOnDate(habit, d)) {
          const wd = d.getDay()
          byWeekday[wd].scheduled++
          if (completedSet.has(`${habit.id}:${toKey(d)}`)) byWeekday[wd].done++
        }
        d.setDate(d.getDate() + 1)
      }
    })
    if (!hasEnough) return null
    if (!byWeekday.some((s) => s.scheduled >= 2)) return null
    return byWeekday
  }, [habits, completedSet, isHabitActiveOnDate])

  // Returns { progress: 0-1, completed: bool, count: number, goal: number, label: string|null }
  const getHabitProgress = useCallback((habit, weekDays) => {
    const ft = habit.frequency_type || 'daily'
    const fc = habit.frequency_count || 1

    if (ft === 'daily') {
      const done = isCompleted(habit.id, new Date())
      return { progress: done ? 1 : 0, completed: done, count: done ? 1 : 0, goal: 1, label: null }
    }

    if (ft === 'specific') {
      const days = habit.frequency_days ?? []
      const scheduled = weekDays.filter((d) => days.includes(d.getDay()))
      const count = scheduled.filter((d) => isCompleted(habit.id, d)).length
      const goal = scheduled.length
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
      const label = days
        .slice()
        .sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))
        .map((d) => dayNames[d])
        .join('·')
      return {
        progress: goal > 0 ? Math.min(1, count / goal) : 0,
        completed: goal > 0 && count >= goal,
        count, goal, label,
      }
    }

    if (ft === 'weekly') {
      const count = weekDays.filter((d) => isCompleted(habit.id, d)).length
      return {
        progress: Math.min(1, count / fc),
        completed: count >= fc,
        count, goal: fc,
        label: `${count}/${fc} sem.`,
      }
    }

    // monthly
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    let count = 0
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d)
      if (toKey(date) > today()) break
      if (isCompleted(habit.id, date)) count++
    }
    return {
      progress: Math.min(1, count / fc),
      completed: count >= fc,
      count, goal: fc,
      label: `${count}/${fc} mês`,
    }
  }, [isCompleted])

  return {
    habits, loading,
    addHabit, editHabit, deleteHabit, toggleHabit, reorderHabits,
    isCompleted, getDayCompletion, getStreak, getTotalStreak,
    getWeekStats, getMonthStats, completionToday,
    getHabitProgress, isHabitActiveOnDate,
    setNote, getNote,
    getHabitWeekdayStats, globalWeekdayStats,
    archivedHabits, archiveHabit, unarchiveHabit,
  }
}
