import React, { useState } from 'react';

interface CalendarProps {
  className?: string;
  selected?: Date;
  onSelect?: (date: Date) => void;
}

export function Calendar({ className, selected, onSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());
  const [selectedDate, setSelectedDate] = useState(selected);

  // Helper to get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get days in current month
  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  
  // Get first day of month
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  // Generate days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Previous month padding
  const prevMonthPadding = Array.from({ length: firstDayOfMonth }, (_, i) => null);
  
  // Combined days with padding
  const allDays = [...prevMonthPadding, ...days];
  
  // Format month name
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  
  // Handle day selection
  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    onSelect?.(newDate);
  };
  
  // Navigate to previous month
  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className={`inline-block p-3 bg-white rounded-lg shadow ${className || ''}`}>
      <div className="flex items-center justify-between mb-2">
        <button 
          onClick={goToPrevMonth}
          className="p-1 text-gray-600 hover:text-black"
        >
          &lt;
        </button>
        <div className="font-bold">
          {monthName} {currentMonth.getFullYear()}
        </div>
        <button 
          onClick={goToNextMonth}
          className="p-1 text-gray-600 hover:text-black"
        >
          &gt;
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {allDays.map((day, index) => (
          <div 
            key={index} 
            className={`
              w-8 h-8 text-sm flex items-center justify-center rounded-full
              ${day === null ? 'invisible' : 'cursor-pointer hover:bg-gray-100'}
              ${selectedDate && day && 
                selectedDate.getDate() === day && 
                selectedDate.getMonth() === currentMonth.getMonth() && 
                selectedDate.getFullYear() === currentMonth.getFullYear() 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : ''}
            `}
            onClick={() => day !== null && handleDateSelect(day)}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar; 