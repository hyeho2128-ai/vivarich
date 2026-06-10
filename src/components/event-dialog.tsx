"use client";

import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import type { CalendarEvent, EventCategory } from "@/lib/types";

type EventDialogProps = {
  date: string;
  event?: CalendarEvent;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (id: string) => void;
};

const categories: { value: EventCategory; label: string }[] = [
  { value: "queens", label: "퀸즈 일정" },
  { value: "economy", label: "경제 캘린더" },
  { value: "homework", label: "숙제 및 후기" },
  { value: "cafe", label: "카페 일정" },
];

export function EventDialog({
  date,
  event,
  onClose,
  onSave,
  onDelete,
}: EventDialogProps) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [category, setCategory] = useState<EventCategory>(event?.category ?? "queens");
  const [time, setTime] = useState(event?.time ?? "");

  useEffect(() => {
    const handleKeydown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [onClose]);

  const submit = (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: event?.id ?? crypto.randomUUID(),
      date,
      title: title.trim(),
      category,
      time: time || undefined,
    });
  };

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="dialog-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-dialog-title"
        onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">{date}</p>
            <h2 id="event-dialog-title">{event ? "일정 수정" : "새 일정"}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit}>
          <label>
            일정 이름
            <input
              autoFocus
              value={title}
              onChange={(inputEvent) => setTitle(inputEvent.target.value)}
              placeholder="예: 정기 줌 미팅"
            />
          </label>
          <div className="form-row">
            <label>
              분류
              <select
                value={category}
                onChange={(inputEvent) =>
                  setCategory(inputEvent.target.value as EventCategory)
                }
              >
                {categories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              시간
              <input
                type="time"
                value={time}
                onChange={(inputEvent) => setTime(inputEvent.target.value)}
              />
            </label>
          </div>
          <div className="dialog-actions">
            {event && onDelete ? (
              <button
                className="button button-danger"
                type="button"
                onClick={() => onDelete(event.id)}
              >
                <Trash2 size={16} />
                삭제
              </button>
            ) : (
              <span />
            )}
            <div className="action-group">
              <button className="button button-ghost" type="button" onClick={onClose}>
                취소
              </button>
              <button className="button button-primary" type="submit">
                저장
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
