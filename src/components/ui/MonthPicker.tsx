import React, { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonthPickerProps {
  value: string; // YYYY-MM or YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const MonthPicker: React.FC<MonthPickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [showExactDate, setShowExactDate] = useState(false);

  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length >= 2) {
        setCurrentYear(parseInt(parts[0], 10));
        setCurrentMonth(parseInt(parts[1], 10) - 1);
      }
      if (parts.length === 3 && parts[2] !== 'Present') {
        setShowExactDate(true);
      } else if (!isOpen) {
        setShowExactDate(false);
      }
    }
  }, [value, isOpen]);

  const handleMonthSelect = (monthIndex: number) => {
    const mm = (monthIndex + 1).toString().padStart(2, '0');
    onChange(`${currentYear}-${mm}`);
    setIsOpen(false);
  };

  const handleDaySelect = (day: number) => {
    const mm = (currentMonth + 1).toString().padStart(2, '0');
    const dd = day.toString().padStart(2, '0');
    onChange(`${currentYear}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const handleThisMonth = () => {
    const now = new Date();
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    if (showExactDate) {
      const dd = now.getDate().toString().padStart(2, '0');
      onChange(`${now.getFullYear()}-${mm}-${dd}`);
    } else {
      onChange(`${now.getFullYear()}-${mm}`);
    }
    setIsOpen(false);
  };

  const handlePrev = () => {
    if (showExactDate) {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(y => y - 1);
      } else {
        setCurrentMonth(m => m - 1);
      }
    } else {
      setCurrentYear(y => y - 1);
    }
  };

  const handleNext = () => {
    if (showExactDate) {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(y => y + 1);
      } else {
        setCurrentMonth(m => m + 1);
      }
    } else {
      setCurrentYear(y => y + 1);
    }
  };

  // Format display value
  let displayValue = '';
  if (value) {
    const parts = value.split('-');
    if (parts.length >= 2) {
      const y = parts[0];
      const mIndex = parseInt(parts[1], 10) - 1;
      if (mIndex >= 0 && mIndex < 12) {
        if (parts.length === 3 && parts[2] !== 'Present') {
          const d = parseInt(parts[2], 10);
          displayValue = `${MONTHS[mIndex]} ${d}, ${y}`;
        } else {
          displayValue = `${MONTHS[mIndex]} ${y}`;
        }
      }
    }
  }

  const selectedMonthIndex = value && value.startsWith(`${currentYear}-`)
    ? parseInt(value.split('-')[1], 10) - 1
    : -1;

  const selectedDay = value && value.startsWith(`${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-`)
    ? parseInt(value.split('-')[2], 10)
    : -1;

  // Calendar calculations
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyCells = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
            !displayValue && "text-muted-foreground",
            className
          )}
        >
          {displayValue || placeholder}
          <Calendar className="h-4 w-4 opacity-50" />
        </button>
      </Popover.Trigger>
      
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-64 rounded-md border border-border bg-background p-3 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          align="start"
          sideOffset={4}
        >
          {/* Header (Year / Month Selector) */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrev}
              className="p-1 hover:bg-muted rounded-md transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 font-semibold text-sm">
              {showExactDate && (
                <span>{MONTHS[currentMonth]}</span>
              )}
              <input
                type="number"
                value={currentYear}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setCurrentYear(val);
                }}
                className="w-14 text-center bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary rounded px-0 py-0"
              />
            </div>
            <button
              onClick={handleNext}
              className="p-1 hover:bg-muted rounded-md transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          {showExactDate ? (
            <div className="mb-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(day => (
                  <div key={day} className="text-center text-[10px] font-semibold text-muted-foreground uppercase">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {emptyCells.map(cell => (
                  <div key={`empty-${cell}`} className="h-7 w-7" />
                ))}
                {daysArray.map(day => {
                  const isSelected = day === selectedDay;
                  const isToday = currentYear === new Date().getFullYear() && currentMonth === new Date().getMonth() && day === new Date().getDate();
                  return (
                    <button
                      key={day}
                      onClick={() => handleDaySelect(day)}
                      className={cn(
                        "h-7 w-7 text-xs rounded-md transition-colors flex items-center justify-center",
                        isSelected 
                          ? "bg-primary text-primary-foreground font-medium shadow-sm hover:bg-primary/90" 
                          : isToday 
                            ? "bg-primary/20 text-primary font-bold hover:bg-primary/30"
                            : "hover:bg-muted text-foreground"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {MONTHS.map((month, index) => {
                const isSelected = index === selectedMonthIndex;
                return (
                  <button
                    key={month}
                    onClick={() => handleMonthSelect(index)}
                    className={cn(
                      "px-2 py-1.5 text-sm rounded-md transition-colors",
                      isSelected 
                        ? "bg-primary text-primary-foreground font-medium shadow-sm hover:bg-primary/90" 
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    {month}
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <label className="flex items-center gap-2 cursor-pointer self-start">
              <input
                type="checkbox"
                checked={showExactDate}
                onChange={(e) => setShowExactDate(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary/20 bg-background/50 cursor-pointer"
              />
              <span className="text-xs text-muted-foreground">Select exact date</span>
            </label>
            <div className="flex items-center justify-between w-full">
              <button
                onClick={handleClear}
                className="text-xs text-muted-foreground hover:text-foreground font-medium px-2 py-1 rounded-md hover:bg-muted transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleThisMonth}
                className="text-xs text-primary hover:text-primary/80 font-medium px-2 py-1 rounded-md hover:bg-primary/10 transition-colors"
              >
                {showExactDate ? 'Today' : 'This month'}
              </button>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
