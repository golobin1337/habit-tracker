import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { today } from '../utils/dateUtils'

export function useReminders(userId) {
  const [reminders, setReminders] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase.from('reminders').select('*').order('date').then(({ data }) => {
      setReminders(data ?? [])
    })
  }, [userId])

  const addReminder = useCallback(async (data) => {
    const { data: row, error } = await supabase
      .from('reminders')
      .insert({ user_id: userId, title: data.title, date: data.date, time: data.time || null, urgent: data.urgent ?? false, done: false })
      .select()
      .single()
    if (!error && row) setReminders((prev) => [...prev, row])
  }, [userId])

  const editReminder = useCallback(async (id, updates) => {
    const payload = { ...updates, time: updates.time || null }
    const { error } = await supabase.from('reminders').update(payload).eq('id', id)
    if (!error) setReminders((prev) => prev.map((r) => r.id === id ? { ...r, ...payload } : r))
  }, [])

  const dismissReminder = useCallback(async (id) => {
    const { error } = await supabase.from('reminders').update({ done: true }).eq('id', id)
    if (!error) setReminders((prev) => prev.map((r) => r.id === id ? { ...r, done: true } : r))
  }, [])

  const deleteReminder = useCallback(async (id) => {
    const { error } = await supabase.from('reminders').delete().eq('id', id)
    if (!error) setReminders((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const activeReminders  = reminders.filter((r) => !r.done && r.date >= today())
  const todayReminders   = reminders.filter((r) => !r.done && r.date === today())
  const upcomingReminders = reminders.filter((r) => !r.done && r.date > today())
  const overdueReminders  = reminders.filter((r) => !r.done && r.date < today())

  const getRemindersForDate = useCallback((dateKey) =>
    reminders.filter((r) => r.date === dateKey),
  [reminders])

  return {
    reminders, activeReminders, todayReminders, upcomingReminders, overdueReminders,
    addReminder, editReminder, dismissReminder, deleteReminder, getRemindersForDate,
  }
}
