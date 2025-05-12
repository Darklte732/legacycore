"use client"

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { CalendarEvent } from '@/components/ui/calendar-event-form'

const LOCAL_STORAGE_KEY = 'calendar_events'

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedEvents = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents)
        // Convert string dates back to Date objects
        const eventsWithDateObjects = parsedEvents.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }))
        setEvents(eventsWithDateObjects)
      } catch (error) {
        console.error('Failed to parse calendar events:', error)
      }
    }
    setIsLoading(false)
  }, [])

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events))
    }
  }, [events, isLoading])

  const addEvent = (event: CalendarEvent) => {
    const newEvent = {
      ...event,
      id: uuidv4()
    }
    setEvents(prevEvents => [...prevEvents, newEvent])
    return newEvent
  }

  const updateEvent = (updatedEvent: CalendarEvent) => {
    if (!updatedEvent.id) return

    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    )
  }

  const deleteEvent = (eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
  }

  return {
    events,
    isLoading,
    addEvent,
    updateEvent,
    deleteEvent
  }
} 