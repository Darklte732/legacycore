"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Textarea } from './textarea'
import { Checkbox } from './checkbox'
import { Calendar } from './calendar'
import { CalendarEvent } from '@/hooks/useCalendarEvents'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { AlertCircle, CalendarIcon, Clock, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from './alert'

interface CalendarEventFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Partial<CalendarEvent>) => Promise<void>
  event?: Partial<CalendarEvent>
  isEditing?: boolean
}

export function CalendarEventForm({
  isOpen,
  onClose,
  onSave,
  event,
  isEditing = false
}: CalendarEventFormProps) {
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [endTime, setEndTime] = useState('')
  const [isAllDay, setIsAllDay] = useState(event?.is_all_day || false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  const supabase = createClient()
  
  useEffect(() => {
    if (event?.start_time) {
      const startDateTime = new Date(event.start_time)
      setStartDate(startDateTime)
      if (!isAllDay) {
        setStartTime(format(startDateTime, 'HH:mm'))
      }
    } else {
      const now = new Date()
      setStartDate(now)
      if (!isAllDay) {
        setStartTime(format(now, 'HH:mm'))
      }
    }
    
    if (event?.end_time) {
      const endDateTime = new Date(event.end_time)
      setEndDate(endDateTime)
      if (!isAllDay) {
        setEndTime(format(endDateTime, 'HH:mm'))
      }
    } else {
      const now = new Date()
      now.setHours(now.getHours() + 1)
      setEndDate(now)
      if (!isAllDay) {
        setEndTime(format(now, 'HH:mm'))
      }
    }
    
    setIsAllDay(event?.is_all_day || false)
  }, [event, isAllDay])
  
  // Get user's organization ID
  useEffect(() => {
    const getUserOrganization = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', session.user.id)
          .single()
        
        if (data?.organization_id) {
          setOrganizationId(data.organization_id)
        }
      }
    }
    
    getUserOrganization()
  }, [])
  
  const validateForm = () => {
    const errors: Record<string, string> = {}
    let isValid = true
    
    if (!title?.trim()) {
      errors.title = 'Title is required'
      isValid = false
    }
    
    if (!startDate) {
      errors.startDate = 'Start date is required'
      isValid = false
    }
    
    if (!isAllDay && !startTime) {
      errors.startTime = 'Start time is required'
      isValid = false
    }
    
    if (!endDate) {
      errors.endDate = 'End date is required'
      isValid = false
    }
    
    if (!isAllDay && !endTime) {
      errors.endTime = 'End time is required'
      isValid = false
    }
    
    if (startDate && endDate) {
      let startDateTime: Date
      let endDateTime: Date
      
      if (isAllDay) {
        startDateTime = new Date(startDate)
        startDateTime.setHours(0, 0, 0, 0)
        
        endDateTime = new Date(endDate)
        endDateTime.setHours(23, 59, 59, 999)
        
        if (endDateTime < startDateTime) {
          errors.endDate = 'End date must be on or after start date'
          isValid = false
        }
      } else {
        if (startTime && endTime) {
          const [startHours, startMinutes] = startTime.split(':').map(Number)
          const [endHours, endMinutes] = endTime.split(':').map(Number)
          
          startDateTime = new Date(startDate)
          startDateTime.setHours(startHours, startMinutes, 0, 0)
          
          endDateTime = new Date(endDate)
          endDateTime.setHours(endHours, endMinutes, 0, 0)
          
          if (endDateTime < startDateTime) {
            errors.endTime = 'End time must be after start time'
            isValid = false
          }
        }
      }
    }
    
    setFormErrors(errors)
    return isValid
  }
  
  const handleSubmit = async () => {
    try {
      setError(null)
      
      if (!validateForm()) {
        return
      }
      
      setSaving(true)
      
      // Get current user ID
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) {
        setError('You must be logged in to create events')
        return
      }
      
      // Format start and end datetime
      let startDateTime: Date
      let endDateTime: Date
      
      if (isAllDay) {
        startDateTime = new Date(startDate!)
        startDateTime.setHours(0, 0, 0, 0)
        
        endDateTime = new Date(endDate!)
        endDateTime.setHours(23, 59, 59, 999)
      } else {
        const [startHours, startMinutes] = startTime.split(':').map(Number)
        const [endHours, endMinutes] = endTime.split(':').map(Number)
        
        startDateTime = new Date(startDate!)
        startDateTime.setHours(startHours, startMinutes, 0, 0)
        
        endDateTime = new Date(endDate!)
        endDateTime.setHours(endHours, endMinutes, 0, 0)
      }
      
      const eventData: Partial<CalendarEvent> = {
        ...event,
        title,
        description: description || null,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        is_all_day: isAllDay,
        organizer_id: session.user.id,
        organization_id: organizationId
      }
      
      await onSave(eventData)
      handleClose()
    } catch (err: any) {
      console.error('Error saving event:', err)
      setError(err.message || 'Failed to save event')
    } finally {
      setSaving(false)
    }
  }
  
  const handleClose = () => {
    setFormErrors({})
    setError(null)
    onClose()
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 rounded-lg">
        <DialogHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <CalendarIcon className="h-5 w-5 text-primary" />
            {isEditing ? 'Edit Event' : 'Add New Event'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-5 p-6 max-h-[calc(85vh-180px)] overflow-y-auto bg-white dark:bg-gray-900">
          {error && (
            <Alert variant="destructive" className="mb-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Title
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className={cn(
                "transition-all focus-visible:ring-primary border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 h-10 shadow-sm",
                formErrors.title && "border-red-500 focus-visible:ring-red-500"
              )}
            />
            {formErrors.title && (
              <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-900 dark:text-gray-100">Description</Label>
            <Textarea
              id="description"
              value={description || ''}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description (optional)"
              rows={3}
              className="resize-none focus-visible:ring-primary border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
            />
          </div>
          
          <div className="flex items-center space-x-2 py-2 px-3 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <Checkbox
              id="all-day"
              checked={isAllDay}
              onCheckedChange={(checked) => setIsAllDay(checked as boolean)}
              className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-gray-300 dark:border-gray-700"
            />
            <Label 
              htmlFor="all-day" 
              className="text-sm font-medium cursor-pointer hover:text-primary transition-colors text-gray-900 dark:text-gray-100"
            >
              All day event
            </Label>
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            <div className="grid gap-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Start Date
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal transition-all border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm h-10",
                      !startDate && "text-gray-500 dark:text-gray-400",
                      formErrors.startDate && "border-red-500 text-red-500 focus-visible:ring-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      if (date && (!endDate || date > endDate)) {
                        // If start date is after end date, update end date too
                        setEndDate(date);
                      }
                    }}
                    initialFocus
                    className="rounded-md border border-gray-200 dark:border-gray-700"
                  />
                </PopoverContent>
              </Popover>
              {formErrors.startDate && (
                <p className="text-xs text-red-500 mt-1">{formErrors.startDate}</p>
              )}
            </div>
            
            {!isAllDay && (
              <div className="grid gap-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Start Time
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={cn(
                      "pl-10 transition-all focus-visible:ring-primary border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm h-10",
                      formErrors.startTime && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                </div>
                {formErrors.startTime && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.startTime}</p>
                )}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            <div className="grid gap-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                End Date
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal transition-all border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm h-10",
                      !endDate && "text-gray-500 dark:text-gray-400",
                      formErrors.endDate && "border-red-500 text-red-500 focus-visible:ring-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="rounded-md border border-gray-200 dark:border-gray-700"
                    disabled={(date) => {
                      // Cannot select dates before start date
                      return startDate ? date < new Date(startDate) : false
                    }}
                  />
                </PopoverContent>
              </Popover>
              {formErrors.endDate && (
                <p className="text-xs text-red-500 mt-1">{formErrors.endDate}</p>
              )}
            </div>
            
            {!isAllDay && (
              <div className="grid gap-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  End Time
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={cn(
                      "pl-10 transition-all focus-visible:ring-primary border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm h-10", 
                      formErrors.endTime && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                </div>
                {formErrors.endTime && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.endTime}</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex gap-2 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            className="flex-1 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={saving} 
            className="flex-1 relative bg-primary hover:bg-primary/90 text-white font-medium shadow-sm"
          >
            {saving ? (
              <>
                <span className="opacity-0">Save Event</span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              </>
            ) : (
              isEditing ? 'Update Event' : 'Save Event'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 