"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EVENT_ICONS: Record<string, string> = {
  BIRT: "Birth",
  DEAT: "Death",
  MARR: "Marriage",
  DIV: "Divorce",
  ADOP: "Adoption",
  BURI: "Burial",
};

function generateMockEvents(year: number) {
  const today = new Date();
  const individuals = [
    { name: "John Smith", id: "I001" },
    { name: "Mary Johnson", id: "I002" },
    { name: "Robert Brown", id: "I003" },
  ];

  const events = [];
  if (year === today.getFullYear()) {
    individuals.forEach((ind, i) => {
      const eventTypes = Object.keys(EVENT_ICONS);
      const type = eventTypes[i % eventTypes.length];
      if (i === 0) {
        events.push({ ...ind, type });
      }
    });
  }
  return events;
}

function CalendarGrid({
  year,
  month,
  onDayClick,
  selectedDate,
}: {
  year: number;
  month: Date;
  onDayClick: (date: Date) => void;
  selectedDate: Date | null;
}) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const events = generateMockEvents(year);

  return (
    <div
      role="grid"
      aria-label={`${format(month, "MMMM yyyy")} calendar`}
      className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden"
    >
      <div className="contents" role="row">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            role="columnheader"
            className="bg-muted p-2 text-center text-sm font-medium text-muted-foreground"
          >
            <abbr title={["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][DAY_LABELS.indexOf(label)]}>{label}</abbr>
          </div>
        ))}
      </div>
      <div className="contents">
        {days.map((day, idx) => {
          const dayEvents = events.filter(() => isSameDay(new Date(), day));
          const isCurrentMonth = day.getMonth() === month.getMonth();
          const isCurrentDay = isToday(day);
          const isSelected = selectedDate !== null && isSameDay(selectedDate, day);
          const dateLabel = format(day, "EEEE, MMMM d, yyyy");

          return (
            <div
              key={idx}
              role="gridcell"
              aria-label={dateLabel}
              aria-selected={isSelected}
              aria-current={isCurrentDay ? "date" : undefined}
              className={`
                min-h-[80px] p-1.5 text-left align-top bg-background
                hover:bg-muted/50 transition-colors
                ${!isCurrentMonth ? "text-muted-foreground/50" : ""}
              `}
            >
              <button
                type="button"
                onClick={() => onDayClick(day)}
                className={`
                  w-full text-left
                  text-sm font-medium inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full
                  ${isCurrentDay ? "bg-primary text-primary-foreground" : ""}
                `}
                aria-label={dateLabel}
              >
                {format(day, "d")}
              </button>
              {dayEvents.length > 0 && (
                <div className="mt-0.5 space-y-0.5" aria-live="polite" aria-atomic="false">
                  {dayEvents.slice(0, 2).map((e, i) => (
                    <div
                      key={i}
                      role="presentation"
                      className="text-[10px] truncate leading-tight px-0.5 rounded bg-muted text-foreground"
                    >
                      {EVENT_ICONS[e.type] ?? e.type} {e.name.split(" ")[0]}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-muted-foreground" aria-label={`${dayEvents.length - 2} more events`}>
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayDetail({
  date,
  year,
}: {
  date: Date | null;
  year: number;
}) {
  const events = date ? generateMockEvents(year).filter(() => isSameDay(new Date(), date)) : [];

  return (
    <Card className="h-fit" role="region" aria-label="Selected day details">
      <CardHeader>
        <CardTitle className="text-base">
          {date ? format(date, "MMMM d, yyyy") : "Select a day"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!date ? (
          <p className="text-sm text-muted-foreground">Click a day to see details.</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events on this day.</p>
        ) : (
          <ul className="space-y-2" aria-label="Events on selected day">
            {events.map((e, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium">{EVENT_ICONS[e.type] ?? e.type}</span>
                {" — "}
                <span>{e.name}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default function CalendarPage() {
  const [current, setCurrent] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const year = current.getFullYear();

  const prevMonth = () => setCurrent(subMonths(current, 1));
  const nextMonth = () => setCurrent(addMonths(current, 1));
  const goToday = () => {
    setCurrent(new Date());
    setSelectedDay(new Date());
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
        <p className="mt-2 text-muted-foreground">
          Events from your family tree on this day.
        </p>
      </div>

      <div className="flex gap-6" role="main">
        <div className="flex-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <h2 id="calendar-heading" className="text-lg font-semibold">
                {format(current, "MMMM yyyy")}
              </h2>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={goToday}>
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevMonth}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextMonth}
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CalendarGrid
                year={year}
                month={current}
                onDayClick={setSelectedDay}
                selectedDate={selectedDay}
              />
            </CardContent>
          </Card>
        </div>

        <div className="w-72 shrink-0">
          <DayDetail date={selectedDay} year={year} />
        </div>
      </div>
    </main>
  );
}
