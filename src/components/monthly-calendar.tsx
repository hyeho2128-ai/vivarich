"use client";

import { useState } from "react";
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  Plus,
} from "lucide-react";
import { formatMonth, getCalendarDays, toDateKey } from "@/lib/date";
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
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const days = getCalendarDays(month);

  const moveMonth = (amount: number) => {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + amount, 1));
  };

  const today = toDateKey(new Date());
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const listDays = Array.from({ length: lastDay }, (_, index) => {
    const date = new Date(month.getFullYear(), month.getMonth(), index + 1);
    const key = toDateKey(date);
    const dayEvents = events.filter((event) => event.date === key);
    const dayCertifications = showCertifications
      ? certificationItems.filter((item) => item.date === key)
      : [];
    return { date, key, dayEvents, dayCertifications };
  }).filter((day) => day.dayEvents.length > 0 || day.dayCertifications.length > 0);

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
          <div className="view-toggle" role="tablist" aria-label="보기 방식">
            <button
              className={view === "calendar" ? "active" : ""}
              role="tab"
              aria-selected={view === "calendar"}
              onClick={() => setView("calendar")}
            >
              <LayoutGrid size={15} />
              달력
            </button>
            <button
              className={view === "list" ? "active" : ""}
              role="tab"
              aria-selected={view === "list"}
              onClick={() => setView("list")}
            >
              <List size={15} />
              리스트
            </button>
          </div>
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
      {view === "calendar" ? (
        <>
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
        </>
      ) : (
        <div className="schedule-list">
          {listDays.length === 0 ? (
            <p className="schedule-list-empty">이번 달 등록된 일정이 없어요.</p>
          ) : (
            listDays.map((day) => (
              <div
                className={`schedule-list-day ${day.key === today ? "today" : ""}`}
                key={day.key}
              >
                <div className="schedule-list-date">
                  <strong>{day.date.getDate()}</strong>
                  <span>{weekdays[day.date.getDay()]}</span>
                </div>
                <div className="schedule-list-items">
                  {day.dayEvents.map((event) => (
                    <button
                      className={`schedule-list-item event-${event.category}`}
                      key={event.id}
                      onClick={() => onSelectEvent(event)}
                    >
                      <span>{event.title}</span>
                      {event.time && <em>{event.time}</em>}
                    </button>
                  ))}
                  {day.dayCertifications.map((item) => (
                    <button
                      className={`schedule-list-item cert-${item.kind}`}
                      key={item.id}
                      onClick={() => onSelectCertification(item)}
                    >
                      <span>{item.title}</span>
                      {typeof item.completedCount === "number" && (
                        <em>
                          {item.completedCount}/{item.totalCount}
                        </em>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
