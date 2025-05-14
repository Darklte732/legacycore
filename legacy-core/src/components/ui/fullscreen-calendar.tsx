"use client"

import * as React from "react"
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
} from "date-fns"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  SearchIcon,
  Clock,
  Calendar as CalendarIcon,
  X as XIcon,
  Info,
  User
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useMediaQuery } from "@/hooks/use-media-query"
import { CalendarEvent, FormattedEvent, CalendarData } from "@/hooks/useCalendarEvents"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Input } from "./input"
import { Skeleton } from "./skeleton"

interface FullScreenCalendarProps {
  data: CalendarData[]
  onEventClick?: (event: CalendarEvent) => void
  onAddEvent?: () => void
  isLoading?: boolean
}

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
]

const EVENT_COLORS = [
  "bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-800/60",
  "bg-green-100 border-green-300 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-800/60",
  "bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/40 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-800/60",
  "bg-yellow-100 border-yellow-300 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:border-yellow-700 dark:text-yellow-300 dark:hover:bg-yellow-800/60",
  "bg-pink-100 border-pink-300 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/40 dark:border-pink-700 dark:text-pink-300 dark:hover:bg-pink-800/60",
  "bg-indigo-100 border-indigo-300 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-800/60",
  "bg-red-100 border-red-300 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-800/60",
]

export function FullScreenCalendar({ 
  data, 
  onEventClick,
  onAddEvent,
  isLoading = false
}: FullScreenCalendarProps) {
  const today = startOfToday()
  const [selectedDay, setSelectedDay] = React.useState(today)
  const [currentMonth, setCurrentMonth] = React.useState(
    format(today, "MMM-yyyy"),
  )
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filteredData, setFilteredData] = React.useState<CalendarData[]>(data)
  const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null)
  const [showEmptyState, setShowEmptyState] = React.useState(true)
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date())
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  })

  React.useEffect(() => {
    setFilteredData(data);
  }, [data]);

  React.useEffect(() => {
    // Filter events based on search query
    if (searchQuery.trim() === "") {
      setFilteredData(data)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = data.map(dateItem => {
        // Keep the date, but filter the events
        const filteredEvents = dateItem.events.filter(event => 
          event.name.toLowerCase().includes(query) || 
          (event.description && event.description.toLowerCase().includes(query))
        )
        
        // Only keep dates that have matching events
        return {
          ...dateItem,
          events: filteredEvents
        }
      }).filter(dateItem => dateItem.events.length > 0)
      
      setFilteredData(filtered)
    }
  }, [searchQuery, data])

  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function goToToday() {
    setCurrentMonth(format(today, "MMM-yyyy"))
    setSelectedDay(today)
  }

  const handleEventClick = (event: FormattedEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEventClick && event) {
      // Find the full event data with all properties
      const fullEvent: any = {
        id: event.id,
        title: event.name,
        description: event.description,
        start_time: event.datetime,
        end_time: event.end_time,
        organizer_id: event.organizer_id,
        is_all_day: event.is_all_day,
      }
      
      onEventClick(fullEvent as CalendarEvent)
    }
  }

  const getEventColorClass = (eventId: string | number) => {
    // Generate a consistent color based on event ID
    const numericId = typeof eventId === 'string' 
      ? eventId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : Number(eventId)
    
    return EVENT_COLORS[numericId % EVENT_COLORS.length]
  }

  const handleAddEvent = (day: Date) => {
    setSelectedDay(day);
    if (onAddEvent) {
      onAddEvent();
    }
  }

  return (
    <div className="flex flex-1 flex-col rounded-lg border shadow-md bg-white dark:bg-gray-950 overflow-hidden h-full">
      {/* Calendar Header */}
      <div className="flex flex-col space-y-4 p-4 md:p-5 bg-gradient-to-r from-purple-100/90 to-indigo-100/90 dark:from-purple-950 dark:to-indigo-950 border-b border-purple-200 dark:border-purple-800/60 md:flex-row md:items-center md:justify-between md:space-y-0 lg:flex-none">
        <div className="flex flex-auto">
          <div className="flex items-center gap-4">
            <div className="hidden w-20 flex-col items-center justify-center rounded-lg border-2 border-purple-300 dark:border-purple-700 shadow-md bg-white dark:bg-gray-800 p-0.5 md:flex">
              <h1 className="p-1 text-xs font-semibold uppercase text-purple-700 dark:text-purple-300">
                {format(today, "MMM")}
              </h1>
              <div className="flex w-full items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 p-0.5 text-lg font-bold text-white">
                <span>{format(today, "d")}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-purple-800 dark:text-purple-200">
                {format(firstDayCurrentMonth, "MMMM, yyyy")}
              </h2>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                {format(firstDayCurrentMonth, "MMM d, yyyy")} -{" "}
                {format(endOfMonth(firstDayCurrentMonth), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <div className="relative w-full md:w-auto">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 dark:text-purple-400" />
            <Input
              placeholder="Search events"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 md:w-[220px] border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 shadow-sm rounded-md"
            />
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-700 dark:hover:text-purple-300"
                onClick={() => setSearchQuery("")}
              >
                <XIcon size={14} />
              </button>
            )}
          </div>

          <Separator orientation="vertical" className="hidden h-6 lg:block" />

          <div className="inline-flex w-full -space-x-px rounded-lg shadow-sm shadow-purple-200/50 dark:shadow-purple-950/20 md:w-auto rtl:space-x-reverse">
            <Button
              onClick={previousMonth}
              className="rounded-l-lg border-purple-200 dark:border-purple-800 shadow-sm first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 hover:bg-purple-50 dark:hover:bg-purple-900/30"
              variant="outline"
              size="icon"
              aria-label="Navigate to previous month"
            >
              <ChevronLeftIcon size={16} strokeWidth={2} className="text-purple-700 dark:text-purple-300" />
            </Button>
            <Button
              onClick={goToToday}
              className="w-full border-purple-200 dark:border-purple-800 shadow-sm focus-visible:z-10 md:w-auto hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium"
              variant="outline"
            >
              Today
            </Button>
            <Button
              onClick={nextMonth}
              className="rounded-r-lg border-purple-200 dark:border-purple-800 shadow-sm first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 hover:bg-purple-50 dark:hover:bg-purple-900/30"
              variant="outline"
              size="icon"
              aria-label="Navigate to next month"
            >
              <ChevronRightIcon size={16} strokeWidth={2} className="text-purple-700 dark:text-purple-300" />
            </Button>
          </div>

          <Separator orientation="vertical" className="hidden h-6 md:block" />
          <Separator
            orientation="horizontal"
            className="block w-full md:hidden"
          />

          <Button
            onClick={() => {
              if (onAddEvent) {
                onAddEvent()
              }
            }}
            variant="default"
            className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-0 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
          >
            <PlusCircleIcon size={16} className="mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-4 md:px-6 md:py-5 overflow-auto">
        <div className="grid grid-cols-7 gap-px rounded-t-lg bg-purple-200 dark:bg-purple-900/50 text-center text-sm font-medium leading-6 text-purple-900 dark:text-purple-200 shadow-sm overflow-hidden sticky top-0 z-10">
          <div className="bg-purple-100 dark:bg-purple-900/60 py-3 font-bold border-b-2 border-purple-300 dark:border-purple-700">
            Sun
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/60 py-3 font-bold border-b-2 border-purple-300 dark:border-purple-700">
            Mon
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/60 py-3 font-bold border-b-2 border-purple-300 dark:border-purple-700">
            Tue
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/60 py-3 font-bold border-b-2 border-purple-300 dark:border-purple-700">
            Wed
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/60 py-3 font-bold border-b-2 border-purple-300 dark:border-purple-700">
            Thu
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/60 py-3 font-bold border-b-2 border-purple-300 dark:border-purple-700">
            Fri
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/60 py-3 font-bold border-b-2 border-purple-300 dark:border-purple-700">
            Sat
          </div>
        </div>
        
        <div className="isolate grid grid-cols-7 gap-px rounded-b-lg overflow-hidden bg-purple-200 dark:bg-purple-900/50 text-sm shadow-md">
          {days.map((day, dayIdx) => {
            const dateKey = format(day, "yyyy-MM-dd")
            const dayEvents = filteredData.find(
              (d) => format(d.day, "yyyy-MM-dd") === dateKey
            )?.events || []
            
            const totalEvents = dayEvents.length
            const displayedEvents = isDesktop ? 3 : 2
            const hiddenEvents = Math.max(0, totalEvents - displayedEvents)
            
            return (
              <div
                key={day.toString()}
                className={cn(
                  "relative min-h-[120px] md:min-h-[150px] lg:min-h-[170px] bg-white dark:bg-gray-900 p-2.5 transition-colors border border-purple-100 dark:border-transparent",
                  isEqual(day, selectedDay) && "bg-purple-50 dark:bg-purple-900/20 shadow-[inset_0_0_0_2px_theme(colors.purple.400)]",
                  !isEqual(day, selectedDay) && isToday(day) && "bg-indigo-50 dark:bg-indigo-900/20 shadow-[inset_0_0_0_1.5px_theme(colors.indigo.400)] dark:shadow-[inset_0_0_0_1.5px_theme(colors.indigo.600),_0_0_15px_theme(colors.indigo.700)]",
                  !isSameMonth(day, firstDayCurrentMonth) && "bg-gray-50/80 dark:bg-gray-950/70",
                  dayIdx === 0 && colStartClasses[getDay(day)],
                  "cursor-pointer flex flex-col hover:bg-purple-50/70 dark:hover:bg-purple-900/20"
                )}
                onMouseEnter={() => setHoveredDate(day)}
                onMouseLeave={() => setHoveredDate(null)}
                onClick={() => handleAddEvent(day)}
              >
                <time
                  dateTime={format(day, "yyyy-MM-dd")}
                  className={cn(
                    "ml-auto flex h-7 w-7 items-center justify-center rounded-full font-semibold transition-all",
                    isEqual(day, selectedDay) && "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md",
                    !isEqual(day, selectedDay) && isToday(day) && "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md ring-2 ring-indigo-400/30 dark:ring-indigo-300/20",
                    !isEqual(day, selectedDay) && isSameMonth(day, firstDayCurrentMonth) && !isToday(day) && "text-gray-900 dark:text-gray-100",
                    !isEqual(day, selectedDay) && !isSameMonth(day, firstDayCurrentMonth) && !isToday(day) && "text-gray-400 dark:text-gray-500",
                    isEqual(day, hoveredDate) && !isEqual(day, selectedDay) && !isToday(day) && "bg-purple-100 dark:bg-purple-800/20 text-purple-700 dark:text-purple-300",
                    "mb-1.5"
                  )}
                >
                  {format(day, "d")}
                </time>
                
                <div className="flex-1 overflow-y-auto space-y-1.5 w-full text-left scrollbar-hide">
                  {dayEvents.slice(0, displayedEvents).map((event) => (
                    <TooltipProvider key={event.id} delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "px-2.5 py-1.5 text-xs rounded-md border shadow-sm hover:shadow-md truncate w-full transition-all",
                              getEventColorClass(event.id),
                              "cursor-pointer"
                            )}
                            onClick={(e) => handleEventClick(event, e)}
                          >
                            <div className="font-semibold truncate">{event.name}</div>
                            <div className="flex items-center text-[10px] opacity-80 mt-0.5">
                              <Clock className="h-2.5 w-2.5 mr-1 inline-block" /> {event.time}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="p-4 space-y-2 max-w-xs rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-800">
                          <div className="font-semibold text-gray-900 dark:text-white">{event.name}</div>
                          <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                            <Clock className="h-3 w-3 mr-1" /> {event.time}
                          </div>
                          {event.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">{event.description}</p>
                          )}
                          {event.organizer_id && (
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <User className="h-3 w-3 mr-1" /> Organizer ID: {event.organizer_id.substring(0, 8)}...
                            </div>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
                
                {hiddenEvents > 0 && (
                  <div className="mt-1.5">
                    <Badge variant="secondary" className="text-[9px] h-5 px-1.5 rounded-full shadow-sm bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 font-medium">
                      +{hiddenEvents} more
                    </Badge>
                  </div>
                )}
                
                {isEqual(day, hoveredDate) && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute bottom-1.5 right-1.5 h-6 w-6 rounded-full opacity-90 hover:opacity-100 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 border border-purple-300/50 dark:border-purple-700/50 shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddEvent(day)
                    }}
                  >
                    <PlusCircleIcon size={14} className="text-purple-700 dark:text-purple-300" />
                  </Button>
                )}

                {(isEqual(day, selectedDay) || isToday(day)) && !isEqual(day, hoveredDate) && (
                  <div className="absolute right-1 bottom-1 w-2 h-2 rounded-full bg-purple-400 dark:bg-purple-500"></div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Empty State */}
      {data.length === 0 && !isLoading && showEmptyState && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent backdrop-blur-none pointer-events-none">
          <div className="text-center p-6 bg-white/95 dark:bg-gray-900/95 rounded-lg shadow-lg border border-purple-100 dark:border-purple-900 max-w-md relative pointer-events-auto">
            <button 
              onClick={() => setShowEmptyState(false)}
              className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
              aria-label="Close"
            >
              <XIcon className="h-4 w-4" />
            </button>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/50 mb-4">
              <CalendarIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Events Yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your calendar is empty. Add your first event to get started.
            </p>
            <Button
              onClick={() => {
                setShowEmptyState(false);
                if (onAddEvent) {
                  onAddEvent()
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
            >
              <PlusCircleIcon className="h-4 w-4 mr-2" />
              Add Your First Event
            </Button>
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <div className="space-y-6 w-72 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-purple-100 dark:border-purple-900">
            <div className="space-y-3">
              <Skeleton className="h-5 w-40 mx-auto" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 