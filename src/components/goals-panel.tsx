"use client";

import { useState } from "react";
import { Check, Plus, Target, Trash2 } from "lucide-react";
import type { Goal, Member } from "@/lib/types";

type GoalsPanelProps = {
  members: Member[];
  goals: Goal[];
  myMemberId: string | null;
  onSave: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onRequireName: () => void;
};

export function GoalsPanel({
  members,
  goals,
  myMemberId,
  onSave,
  onDelete,
  onRequireName,
}: GoalsPanelProps) {
  const [draft, setDraft] = useState("");

  const orderedMembers = [...members].sort((a, b) =>
    a.id === myMemberId ? -1 : b.id === myMemberId ? 1 : 0,
  );

  const toggleGoal = (goal: Goal) => {
    onSave({ ...goal, done: !goal.done });
  };

  const addGoal = (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    const title = draft.trim();
    if (!title || !myMemberId) return;
    onSave({
      id: crypto.randomUUID(),
      memberId: myMemberId,
      title,
      done: false,
      createdAt: new Date().toISOString(),
    });
    setDraft("");
  };

  return (
    <section className="panel goals-panel">
      <div className="panel-heading">
        <div className="panel-title-group">
          <span className="panel-icon panel-icon-gold">
            <Target size={20} />
          </span>
          <div>
            <p>함께 이루는 목표</p>
            <h2>목표 달성률</h2>
          </div>
        </div>
      </div>

      <div className="goal-member-list">
        {orderedMembers.map((member) => {
          const memberGoals = goals
            .filter((goal) => goal.memberId === member.id)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
          const total = memberGoals.length;
          const done = memberGoals.filter((goal) => goal.done).length;
          const rate = total ? Math.round((done / total) * 100) : 0;
          const isMine = member.id === myMemberId;

          return (
            <div
              className={`goal-member-card ${isMine ? "is-mine" : ""}`}
              key={member.id}
            >
              <div className="goal-member-head">
                <span className="member-avatar" style={{ background: member.color }}>
                  {member.initials}
                </span>
                <div className="goal-member-name">
                  <strong>
                    {member.name}
                    {isMine && <em className="mine-tag">나</em>}
                  </strong>
                  <span>
                    {total ? `${done}/${total} 달성` : "아직 목표가 없어요"}
                  </span>
                </div>
                <div className={`goal-rate ${total ? "" : "empty"}`}>
                  {total ? `${rate}%` : "—"}
                </div>
              </div>

              {total > 0 && (
                <div className="goal-progress">
                  <i style={{ width: `${rate}%` }} />
                </div>
              )}

              {total > 0 && (
                <ul className="goal-list">
                  {memberGoals.map((goal) => (
                    <li
                      className={`goal-item ${goal.done ? "done" : ""}`}
                      key={goal.id}
                    >
                      <button
                        className="goal-check"
                        onClick={() => (isMine ? toggleGoal(goal) : undefined)}
                        disabled={!isMine}
                        aria-label={goal.done ? "달성 취소" : "달성 표시"}
                      >
                        {goal.done && <Check size={14} />}
                      </button>
                      <span>{goal.title}</span>
                      {isMine && (
                        <button
                          className="goal-delete"
                          onClick={() => onDelete(goal.id)}
                          aria-label="목표 삭제"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {isMine ? (
                <form className="goal-add" onSubmit={addGoal}>
                  <input
                    value={draft}
                    onChange={(inputEvent) => setDraft(inputEvent.target.value)}
                    placeholder="이루고 싶은 목표를 적어 보세요"
                    aria-label="새 목표"
                    maxLength={60}
                  />
                  <button type="submit" disabled={!draft.trim()}>
                    <Plus size={16} />
                    추가
                  </button>
                </form>
              ) : null}
            </div>
          );
        })}
      </div>

      {!myMemberId && (
        <button className="goal-require-name" onClick={onRequireName}>
          내 이름을 선택하면 목표를 적고 달성률을 체크할 수 있어요
        </button>
      )}
    </section>
  );
}
