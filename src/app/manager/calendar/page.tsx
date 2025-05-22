"use client"

import { FullScreenCalendar } from "@/components/ui/fullscreen-calendar"
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { CalendarClock, PlusIcon, AlertTriangle } from "lucide-react"
import { CalendarEventForm } from "@/components/ui/calendar-event-form"
import { useCalendarEvents, CalendarEvent } from "@/hooks/useCalendarEvents"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ManagerCalendarPage() {
  const [mounted, setMounted] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Partial<CalendarEvent> | undefined>(undefined)
  const [isEditing, setIsEditing] = useState(false)
  
  const {
    loading,
    error,
    formatEventsForCalendar,
    addEvent,
    updateEvent,
    deleteEvent
  } = useCalendarEvents()
  
  // Handle saving an event (either add or update)
  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      if (isEditing && eventData.id) {
        await updateEvent(eventData.id, eventData)
      } else {
        await addEvent(eventData as Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>)
      }
    } catch (err) {
      console.error('Error saving event:', err)
    }
  }
  
  // Open form to add a new event
  const handleAddEvent = () => {
    setSelectedEvent(undefined)
    setIsEditing(false)
    setIsFormOpen(true)
  }
  
  // Open form to edit an existing event
  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsEditing(true)
    setIsFormOpen(true)
  }
  
  // Handle hydration mismatch with date objects
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <div className="bg-muted/30 p-3 rounded-full mb-3">
            <CalendarClock className="h-6 w-6 text-muted-foreground animate-pulse" />
          </div>
          <h3 className="text-lg font-medium">Loading Calendar</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Please wait while the calendar loads...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Manager Schedule & Calendar</h1>
          <p className="text-muted-foreground">Manage your appointments, meetings, and team events</p>
        </div>
      </div>
      
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            {error}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="w-full" style={{ height: "calc(100vh - 180px)" }}>
          <FullScreenCalendar 
            data={formatEventsForCalendar()} 
            onEventClick={handleEditEvent}
            onAddEvent={handleAddEvent}
            isLoading={loading}
          />
        </div>
      )}
      
      <CalendarEventForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveEvent}
        event={selectedEvent}
        isEditing={isEditing}
      />
    </div>
  )
} 