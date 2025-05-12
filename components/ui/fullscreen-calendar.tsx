import React, { useState } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO string
  start: string; // HH:MM format
  end: string; // HH:MM format
  description?: string;
  color?: string;
}

interface FullscreenCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  className?: string;
}

export function FullscreenCalendar({
  events = [],
  onEventClick,
  onDateClick,
  className,
}: FullscreenCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');

  // Navigate to previous month/week/day
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  // Navigate to next month/week/day
  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  // Helper to get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get calendar days for current month view
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    // Get days from previous month for padding
    const prevMonthDays = [];
    if (firstDayOfMonth > 0) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevMonthYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
      
      for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        prevMonthDays.push({
          date: new Date(prevMonthYear, prevMonth, day),
          isCurrentMonth: false,
        });
      }
    }
    
    // Get days from current month
    const currentMonthDays = [];
    for (let day = 1; day <= daysInMonth; day++) {
      currentMonthDays.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }
    
    // Get days from next month for padding
    const nextMonthDays = [];
    const totalDaysDisplayed = prevMonthDays.length + currentMonthDays.length;
    const daysToAdd = 42 - totalDaysDisplayed; // 42 = 6 rows of 7 days
    
    if (daysToAdd > 0) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextMonthYear = month === 11 ? year + 1 : year;
      
      for (let day = 1; day <= daysToAdd; day++) {
        nextMonthDays.push({
          date: new Date(nextMonthYear, nextMonth, day),
          isCurrentMonth: false,
        });
      }
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // Filter events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date.startsWith(dateString));
  };

  // Render month view
  const renderMonthView = () => {
    const calendarDays = getCalendarDays();
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, index) => {
          const dateEvents = getEventsForDate(day.date);
          const isToday = 
            day.date.getDate() === new Date().getDate() &&
            day.date.getMonth() === new Date().getMonth() &&
            day.date.getFullYear() === new Date().getFullYear();
          
          return (
            <div 
              key={index}
              className={`min-h-24 p-1 border border-gray-200 ${
                day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => onDateClick?.(day.date)}
            >
              <div className="p-1 text-right">{day.date.getDate()}</div>
              <div className="space-y-1">
                {dateEvents.slice(0, 3).map(event => (
                  <div 
                    key={event.id}
                    className={`text-xs p-1 rounded truncate cursor-pointer ${
                      event.color ? `bg-${event.color}-100 text-${event.color}-800` : 'bg-blue-100 text-blue-800'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    {event.start} - {event.title}
                  </div>
                ))}
                {dateEvents.length > 3 && (
                  <div className="text-xs text-gray-500 p-1">
                    +{dateEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow ${className || ''}`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button 
              className="p-2 rounded-md hover:bg-gray-100"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </button>
            <button 
              className="p-2 rounded-md hover:bg-gray-100"
              onClick={navigatePrevious}
            >
              &lt;
            </button>
            <button 
              className="p-2 rounded-md hover:bg-gray-100"
              onClick={navigateNext}
            >
              &gt;
            </button>
          </div>
          
          <h2 className="text-xl font-bold">
            {currentDate.toLocaleString('default', { 
              month: 'long', 
              year: 'numeric',
              ...(currentView === 'day' && { day: 'numeric' })
            })}
          </h2>
          
          <div className="flex space-x-1">
            <button 
              className={`px-3 py-1 rounded-md ${currentView === 'month' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
              onClick={() => setCurrentView('month')}
            >
              Month
            </button>
            <button 
              className={`px-3 py-1 rounded-md ${currentView === 'week' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
              onClick={() => setCurrentView('week')}
            >
              Week
            </button>
            <button 
              className={`px-3 py-1 rounded-md ${currentView === 'day' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
              onClick={() => setCurrentView('day')}
            >
              Day
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-2">
        {currentView === 'month' && renderMonthView()}
        {currentView === 'week' && <div className="p-4 text-center">Week view not implemented in this demo</div>}
        {currentView === 'day' && <div className="p-4 text-center">Day view not implemented in this demo</div>}
      </div>
    </div>
  );
}

export default FullscreenCalendar; 