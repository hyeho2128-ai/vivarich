"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { Member } from "@/lib/types";

type NamePickerDialogProps = {
  members: Member[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export function NamePickerDialog({
  members,
  currentId,
  onSelect,
  onClose,
}: NamePickerDialogProps) {
  useEffect(() => {
    const handleKeydown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [onClose]);

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="dialog-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="name-picker-title"
        onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
      >
        <div className="dialog-heading">
          <div>
            <p className="dialog-kicker">본인 확인</p>
            <h2 id="name-picker-title">내 이름을 선택해 주세요</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>
        <p className="dialog-description">
          이 기기에 저장되고, 인증 등록과 글쓰기, 마감 알림에 사용돼요.
        </p>
        <div className="name-picker-grid">
          {members.map((member) => (
            <button
              className={`name-picker-item ${member.id === currentId ? "active" : ""}`}
              key={member.id}
              onClick={() => {
                onSelect(member.id);
                onClose();
              }}
            >
              <span className="member-avatar" style={{ background: member.color }}>
                {member.initials}
              </span>
              <strong>{member.name}</strong>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
