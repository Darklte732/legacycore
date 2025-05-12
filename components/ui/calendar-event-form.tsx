"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Textarea } from "./textarea"

interface EventFormProps {
  open: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  event?: CalendarEvent
  isEditing?: boolean
}

export interface CalendarEvent {
  id?: string
  title: string
  description?: string
  start: Date
  end: Date
}

export function CalendarEventForm({
  open,
  onClose,
  onSave,
  event,
  isEditing = false,
}: EventFormProps) {
  const [title, setTitle] = useState(event?.title || "")
  const [description, setDescription] = useState(event?.description || "")
  const [startDate, setStartDate] = useState(
    event?.start
      ? new Date(event.start).toISOString().substring(0, 16)
      : new Date().toISOString().substring(0, 16)
  )
  const [endDate, setEndDate] = useState(
    event?.end
      ? new Date(event.end).toISOString().substring(0, 16)
      : new Date(Date.now() + 3600000).toISOString().substring(0, 16)
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newEvent: CalendarEvent = {
      ...(event?.id ? { id: event.id } : {}),
      title,
      description,
      start: new Date(startDate),
      end: new Date(endDate),
    }
    
    onSave(newEvent)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Event" : "Add New Event"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="grid w-full gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid w-full gap-1.5">
            <Label htmlFor="start">Start</Label>
            <Input
              id="start"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          
          <div className="grid w-full gap-1.5">
            <Label htmlFor="end">End</Label>
            <Input
              id="end"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 