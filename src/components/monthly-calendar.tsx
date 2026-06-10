"use client";

import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react";
import { formatMonth, getCalendarDays } from "@/lib/date";
import type { CalendarEvent, CertificationCalendarItem } from "@/lib/types";

type MonthlyCalendarProps = {
  month: Date;
  events: CalendarEvent[];
  certificationItems: CertificationCalendarItem[];
  showCertifications: boolean;
  onMonthChange: (date: Date) => void;
  onToggleCertifications: () => void;
  onSelectDate: (date: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectCertification: (item: CertificationCalendarItem) => void;
};

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

export function MonthlyCalendar({
  month,
  events,
  certificationItems,
  showCertifications,
  onMonthChange,
  onToggleCertifications,
  onSelectDate,
  onSelectEvent,
  onSelectCertification,
}: MonthlyCalendarProps) {
  const days = getCalendarDays(month);

  const moveMonth = (amount: number) => {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + amount, 1));
  };

  return (
    <section className="panel calendar-panel">
      <div className="panel-heading calendar-toolbar">
        <div className="panel-title-group">
          <span className="panel-icon">
            <CalendarPlus size={20} />
          </span>
          <div>
            <p>월별 일정</p>
            <h2>{formatMonth(month)}</h2>
          </div>
        </div>
        <div className="month-actions">
          <button
            className={`cert-filter-button ${showCertifications ? "active" : ""}`}
            onClick={onToggleCertifications}
            aria-pressed={showCertifications}
          >
            {showCertifications ? <Eye size={16} /> : <EyeOff size={16} />}
            인증 {showCertifications ? "표시 중" : "숨김"}
          </button>
          <button className="today-button" onClick={() => onMonthChange(new Date())}>
            오늘
          </button>
          <button className="icon-button" onClick={() => moveMonth(-1)} aria-label="이전 달">
            <ChevronLeft size={19} />
          </button>
          <button className="icon-button" onClick={() => moveMonth(1)} aria-label="다음 달">
            <ChevronRight size={19} />
          </button>
        </div>
      </div>
      <div className="calendar-scroll">
        <div className="calendar-grid">
          {weekdays.map((weekday, index) => (
            <div className={`weekday ${index === 0 ? "sunday" : ""}`} key={weekday}>
              {weekday}
            </div>
          ))}
          {days.map((day) => {
            const dayEvents = events.filter((event) => event.date === day.key);
            const dayCertifications = showCertifications
              ? certificationItems.filter((item) => item.date === day.key)
              : [];
            return (
              <div
                className={`calendar-day ${day.isCurrentMonth ? "" : "muted-day"} ${
                  day.isToday ? "today" : ""
                }`}
                key={day.key}
              >
                <button className="date-button" onClick={() => onSelectDate(day.key)}>
                  <span>{day.date.getDate()}</span>
                  <Plus size={14} />
                </button>
                <div className="day-events">
                  {dayEvents.map((event) => (
                    <button
                      className={`event-chip event-${event.category}`}
                      key={event.id}
                      onClick={() => onSelectEvent(event)}
                      title={event.title}
                    >
                      {event.time && <span>{event.time}</span>}
                      {event.title}
                    </button>
                  ))}
                  {dayCertifications.map((item) => (
                    <button
                      className={`certification-chip cert-${item.kind}`}
                      key={item.id}
                      onClick={() => onSelectCertification(item)}
                      title={`${item.title} ${item.completedCount ?? 0}/${item.totalCount ?? 0}`}
                    >
                      <span>{item.title}</span>
                      {typeof item.completedCount === "number" && (
                        <strong>
                          {item.completedCount}/{item.totalCount}
                        </strong>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="calendar-swipe-hint">달력을 좌우로 밀어 전체 날짜를 확인하세요.</p>
    </section>
  );
}
