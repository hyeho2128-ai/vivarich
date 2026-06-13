"use client";

import { useState } from "react";
import {
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Link2,
  Moon,
  Pencil,
  Plus,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { formatShortDate, toDateKey } from "@/lib/date";
import type {
  CafePost,
  CertificationKind,
  CheckSlot,
  Member,
} from "@/lib/types";

type CafeCheckPanelProps = {
  members: Member[];
  posts: CafePost[];
  myMemberId: string | null;
  initialDate?: string;
  initialKind?: CertificationKind;
  initialSlot?: CheckSlot;
  initialSpecialTitle?: string;
  onSavePost: (post: CafePost) => void;
  onDeletePost: (id: string) => void;
  onRequireName: () => void;
};

type LinkDialogState = {
  member: Member;
  post?: CafePost;
};

const certificationTypes: {
  value: CertificationKind;
  label: string;
}[] = [
  { value: "daily", label: "매일 인증" },
  { value: "weekly", label: "주간 정산" },
  { value: "monthly", label: "월말 정산" },
  { value: "special", label: "특별 인증" },
];

function normalizeUrl(value: string) {
  const trimmed = value.trim().replace(/\s+/g, "");
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function getWeekEnd(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + ((7 - date.getDay()) % 7));
  return toDateKey(date);
}

function firstSundayOf(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1);
  return new Date(year, monthIndex, 1 + ((7 - first.getDay()) % 7));
}

// 월말 정산 마감: 다음 달 첫째 주 일요일 (선택한 날짜 이후의 가장 가까운 마감일)
function getMonthlyDeadline(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  const thisMonthDeadline = firstSundayOf(date.getFullYear(), date.getMonth());
  return toDateKey(
    date <= thisMonthDeadline
      ? thisMonthDeadline
      : firstSundayOf(date.getFullYear(), date.getMonth() + 1),
  );
}

// 마감일(첫째 주 일요일)이 정산하는 달 = 마감일 직전 달
function settledMonth(deadlineKey: string) {
  const date = new Date(`${deadlineKey}T00:00:00`);
  return new Date(date.getFullYear(), date.getMonth(), 0).getMonth() + 1;
}

function getWeekNumber(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return Math.ceil(date.getDate() / 7);
}

function normalizedKind(post: CafePost): CertificationKind {
  return post.kind ?? "daily";
}

export function CafeCheckPanel({
  members,
  posts,
  myMemberId,
  initialDate,
  initialKind = "daily",
  initialSlot,
  initialSpecialTitle = "해요마요",
  onSavePost,
  onDeletePost,
  onRequireName,
}: CafeCheckPanelProps) {
  const today = toDateKey(new Date());
  const [date, setDate] = useState(initialDate ?? today);
  const [kind, setKind] = useState<CertificationKind>(initialKind);
  const [slot, setSlot] = useState<CheckSlot>(
    initialSlot ?? (new Date().getHours() < 14 ? "morning" : "evening"),
  );
  const [specialTitle, setSpecialTitle] = useState(initialSpecialTitle);
  const [dialog, setDialog] = useState<LinkDialogState | null>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const effectiveDate =
    kind === "weekly"
      ? getWeekEnd(date)
      : kind === "monthly"
        ? getMonthlyDeadline(date)
        : date;
  const activeTitle =
    kind === "daily"
      ? `${slot === "morning" ? "오전" : "저녁"} 매일 인증`
      : kind === "weekly"
        ? `${getWeekNumber(effectiveDate)}주차 주간 정산`
        : kind === "monthly"
          ? `${settledMonth(effectiveDate)}월 월말 정산`
          : specialTitle.trim() || "특별 인증";

  const activePosts = posts.filter(
    (post) =>
      normalizedKind(post) === kind &&
      post.date === effectiveDate &&
      (kind !== "daily" || (post.slot ?? "morning") === slot) &&
      (kind !== "special" ||
        (post.certificationTitle?.trim() || "특별 인증") === activeTitle),
  );
  const registeredCount = new Set(activePosts.map((post) => post.memberId)).size;
  // 매일 인증 버튼에 항상 그날(선택 시간대) 진행 현황을 보여 준다
  const dailyCount = new Set(
    posts
      .filter(
        (post) =>
          normalizedKind(post) === "daily" &&
          post.date === date &&
          (post.slot ?? "morning") === slot,
      )
      .map((post) => post.memberId),
  ).size;

  // 인증 종류에 맞춰 날짜를 좌우로 이동 (매일/특별=하루, 주간=일주일, 월말=한 달)
  const shiftDate = (direction: 1 | -1) => {
    const next = new Date(`${date}T00:00:00`);
    if (kind === "weekly") {
      next.setDate(next.getDate() + direction * 7);
    } else if (kind === "monthly") {
      next.setMonth(next.getMonth() + direction);
    } else {
      next.setDate(next.getDate() + direction);
    }
    setDate(toDateKey(next));
  };

  const openDialog = (member: Member, post?: CafePost) => {
    setDialog({ member, post });
    setUrl(post?.url ?? "");
    setError("");
  };

  const closeDialog = () => {
    setDialog(null);
    setUrl("");
    setError("");
  };

  const saveLink = (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    if (!dialog) return;

    // 링크를 모두 비우면 기존 인증을 지우고 그냥 닫는다
    if (!url.trim()) {
      if (dialog.post) onDeletePost(dialog.post.id);
      closeDialog();
      return;
    }

    const normalizedUrl = normalizeUrl(url);
    try {
      const parsedUrl = new URL(normalizedUrl);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error();
    } catch {
      setError("올바른 인증글 링크를 입력해 주세요.");
      return;
    }

    onSavePost({
      id: dialog.post?.id ?? crypto.randomUUID(),
      memberId: dialog.member.id,
      title: `${dialog.member.name} ${activeTitle}`,
      url: normalizedUrl,
      date: effectiveDate,
      slot: kind === "daily" ? slot : undefined,
      kind,
      certificationTitle: kind === "special" ? activeTitle : undefined,
      createdAt: dialog.post?.createdAt ?? new Date().toISOString(),
    });
    closeDialog();
  };

  return (
    <section className="panel cafe-panel">
      <div className="certification-type-tabs" role="tablist" aria-label="인증 종류">
        <button
          className={`cert-tab-daily ${kind === "daily" ? "active" : ""}`}
          role="tab"
          aria-selected={kind === "daily"}
          onClick={() => setKind("daily")}
        >
          <span className="cert-tab-daily-label">
            매일 인증
            <span className="cert-tab-freq">매일</span>
          </span>
          <span className="cert-tab-count">
            {dailyCount}
            <em>/{members.length}</em>
          </span>
        </button>
        <div className="cert-tab-others">
          {certificationTypes.slice(1).map((type) => (
            <button
              className={kind === type.value ? "active" : ""}
              key={type.value}
              role="tab"
              aria-selected={kind === type.value}
              onClick={() => setKind(type.value)}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`check-controls ${kind === "daily" ? "" : "single-control"}`}>
        <div className="cert-date-nav">
          <button
            type="button"
            className="date-nav-button"
            onClick={() => shiftDate(-1)}
            aria-label="이전 날짜"
          >
            <ChevronLeft size={18} />
          </button>
          <label className="cert-date-control">
            <CalendarRange size={16} />
            <input
              className="date-input"
              type="date"
              value={date}
              onChange={(inputEvent) => setDate(inputEvent.target.value)}
              aria-label="확인 날짜"
            />
          </label>
          <button
            type="button"
            className="date-nav-button"
            onClick={() => shiftDate(1)}
            aria-label="다음 날짜"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        {kind === "daily" && (
          <div className="slot-toggle" aria-label="확인 시간대">
            <button
              className={slot === "morning" ? "active" : ""}
              onClick={() => setSlot("morning")}
            >
              <Sun size={16} />
              오전
            </button>
            <button
              className={slot === "evening" ? "active" : ""}
              onClick={() => setSlot("evening")}
            >
              <Moon size={16} />
              저녁
            </button>
          </div>
        )}
      </div>

      {kind === "special" && (
        <label className="special-title-control">
          <Sparkles size={17} />
          <input
            value={specialTitle}
            onChange={(inputEvent) => setSpecialTitle(inputEvent.target.value)}
            placeholder="예: 해요마요"
            aria-label="특별 인증 제목"
          />
        </label>
      )}

      {kind !== "daily" && (
        <div className="period-summary">
          <span>
            {kind === "weekly" && `${formatShortDate(effectiveDate)} 마감`}
            {kind === "monthly" && `${formatShortDate(effectiveDate)} 마감`}
            {kind === "special" && `${formatShortDate(effectiveDate)} 특별 인증`}
          </span>
          <strong>
            {registeredCount}/{members.length}명
          </strong>
        </div>
      )}

      <div className="member-check-list">
        {[...members]
          .sort((a, b) =>
            a.id === myMemberId ? -1 : b.id === myMemberId ? 1 : 0,
          )
          .map((member) => {
          const post = activePosts.find((item) => item.memberId === member.id);
          const isMine = member.id === myMemberId;
          return (
            <div
              className={`member-check-row ${post ? "has-post" : ""} ${isMine ? "is-mine" : ""}`}
              key={member.id}
            >
              <div className="member-identity">
                <span className="member-avatar" style={{ background: member.color }}>
                  {member.initials}
                </span>
                <div>
                  <strong>
                    {member.name}
                    {isMine && <em className="mine-tag">나</em>}
                  </strong>
                  <span>
                    {post
                      ? "인증을 올렸어요"
                      : isMine
                        ? `${activeTitle}을 올려 주세요`
                        : "아직 올리지 않았어요"}
                  </span>
                </div>
              </div>

              {post ? (
                <div className="post-actions">
                  {isMine && (
                    <button
                      className="link-button"
                      onClick={() => openDialog(member, post)}
                      aria-label={`${member.name} 인증 링크 수정`}
                    >
                      <Pencil size={15} />
                    </button>
                  )}
                  <a
                    className="link-button"
                    href={post.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${member.name} 인증글 열기`}
                  >
                    <ExternalLink size={16} />
                  </a>
                  <span className="uploaded-badge">
                    <Check size={15} />
                    완료
                  </span>
                </div>
              ) : isMine ? (
                <button className="register-link-button" onClick={() => openDialog(member)}>
                  <Plus size={15} />
                  인증하기
                </button>
              ) : myMemberId ? (
                <span className="waiting-badge">대기</span>
              ) : (
                <button className="register-link-button" onClick={onRequireName}>
                  <Plus size={15} />
                  인증하기
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="panel-helper">
        내 이름은 상단에서 선택할 수 있어요. 인증 등록과 수정은 본인 이름에서만 가능해요.
      </div>

      {dialog && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={closeDialog}>
          <div
            className="dialog-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="link-dialog-title"
            onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
          >
            <div className="dialog-heading">
              <div>
                <p className="dialog-kicker">
                  {formatShortDate(effectiveDate)} · {activeTitle}
                </p>
                <h2 id="link-dialog-title">
                  {dialog.member.name} 인증 링크 {dialog.post ? "수정" : "올리기"}
                </h2>
              </div>
              <button className="icon-button" onClick={closeDialog} aria-label="닫기">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveLink}>
              <label>
                네이버 카페 인증글 링크
                <div className="url-input-wrap">
                  <Link2 size={18} />
                  <input
                    autoFocus
                    type="url"
                    inputMode="url"
                    value={url}
                    onChange={(inputEvent) => {
                      setUrl(inputEvent.target.value);
                      setError("");
                    }}
                    placeholder="https://cafe.naver.com/..."
                  />
                </div>
              </label>
              {error && <p className="form-error">{error}</p>}
              {dialog.post && (
                <p className="dialog-hint">링크를 모두 지우고 저장하면 인증이 취소돼요.</p>
              )}
              <div className="dialog-actions align-right">
                <button className="button button-ghost" type="button" onClick={closeDialog}>
                  취소
                </button>
                <button className="button button-primary" type="submit">
                  {dialog.post
                    ? url.trim()
                      ? "수정하기"
                      : "인증 취소"
                    : "링크 올리기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
