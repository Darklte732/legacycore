import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO, formatDistanceToNow, isSameDay } from 'date-fns'

export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  organizer_id: string
  created_at: string
  updated_at: string
  organization_id: string | null
  is_all_day: boolean
  metadata?: Record<string, any>
  attendees?: Record<string, any>[]
}

export interface FormattedEvent {
  id: string
  name: string
  time: string
  datetime: string
  description?: string
  end_time?: string
  organizer_id?: string
  is_all_day?: boolean
}

export interface CalendarData {
  day: Date
  events: FormattedEvent[]
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  
  const fetchEvents = async () => {
    try {
      setLoading(true)
      
      // Get the current user's ID
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) {
        setEvents([])
        return
      }
      
      // Get events where the user is the organizer
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('organizer_id', session.user.id)
        .order('start_time', { ascending: true })
      
      if (error) {
        throw error
      }
      
      setEvents(data || [])
    } catch (err: any) {
      console.error('Error fetching calendar events:', err)
      setError(err.message || 'Failed to load calendar events')
    } finally {
      setLoading(false)
    }
  }
  
  const addEvent = async (event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(event)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      setEvents(prev => [...prev, data])
      return data
    } catch (err: any) {
      console.error('Error adding calendar event:', err)
      setError(err.message || 'Failed to add calendar event')
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      setEvents(prev => prev.map(event => event.id === id ? data : event))
      return data
    } catch (err: any) {
      console.error('Error updating calendar event:', err)
      setError(err.message || 'Failed to update calendar event')
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  const deleteEvent = async (id: string) => {
    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      setEvents(prev => prev.filter(event => event.id !== id))
    } catch (err: any) {
      console.error('Error deleting calendar event:', err)
      setError(err.message || 'Failed to delete calendar event')
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  // Format events for calendar display
  const formatEventsForCalendar = (): CalendarData[] => {
    const eventsByDay = new Map<string, FormattedEvent[]>()
    
    events.forEach(event => {
      const startDate = parseISO(event.start_time)
      const endDate = parseISO(event.end_time)
      const dateKey = format(startDate, 'yyyy-MM-dd')
      
      // Format the time display based on whether it's an all-day event
      let timeDisplay = event.is_all_day 
        ? 'All day' 
        : format(startDate, 'h:mm a')
      
      // If end time is on the same day, add it to the display
      if (!event.is_all_day && isSameDay(startDate, endDate)) {
        timeDisplay += ` - ${format(endDate, 'h:mm a')}`
      }
      
      const formattedEvent: FormattedEvent = {
        id: event.id,
        name: event.title,
        time: timeDisplay,
        datetime: event.start_time,
        description: event.description || undefined,
        end_time: event.end_time,
        organizer_id: event.organizer_id,
        is_all_day: event.is_all_day
      }
      
      if (!eventsByDay.has(dateKey)) {
        eventsByDay.set(dateKey, [])
      }
      
      eventsByDay.get(dateKey)?.push(formattedEvent)
    })
    
    // Convert map to array of CalendarData objects
    return Array.from(eventsByDay.entries()).map(([dateStr, dayEvents]) => ({
      day: parseISO(dateStr),
      events: dayEvents.sort((a, b) => {
        // Sort all-day events first, then by start time
        if (a.is_all_day && !b.is_all_day) return -1
        if (!a.is_all_day && b.is_all_day) return 1
        return new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      })
    }))
  }
  
  // Check if event is upcoming within the next hour
  const isUpcomingEvent = (eventTime: string): boolean => {
    const eventDate = parseISO(eventTime)
    const now = new Date()
    const diffMs = eventDate.getTime() - now.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    
    // Return true if the event is in the future but within an hour
    return diffHours > 0 && diffHours <= 1
  }
  
  // Format time distance in a friendly way
  const formatTimeDistance = (time: string): string => {
    try {
      return formatDistanceToNow(parseISO(time), { addSuffix: true })
    } catch (e) {
      return 'unknown time'
    }
  }
  
  useEffect(() => {
    fetchEvents()
    
    // Set up polling for events every minute
    const interval = setInterval(() => {
      fetchEvents()
    }, 60000) // 1 minute in ms
    
    return () => clearInterval(interval)
  }, [])
  
  return {
    events,
    loading,
    error,
    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    formatEventsForCalendar,
    isUpcomingEvent,
    formatTimeDistance
  }
} 