"use client";

import { useState } from "react";
import {
  CalendarRange,
  Check,
  Copy,
  ExternalLink,
  Link2,
  Moon,
  Pencil,
  Plus,
  Sparkles,
  Sun,
  UsersRound,
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
  initialDate?: string;
  initialKind?: CertificationKind;
  initialSpecialTitle?: string;
  onSavePost: (post: CafePost) => void;
};

type LinkDialogState = {
  member: Member;
  post?: CafePost;
};

const CAFE_PREFIX = "[재학사2기_VIVA RICH]";
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

function getMonthEnd(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return toDateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function getWeekNumber(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return Math.ceil(date.getDate() / 7);
}

function formatMonthDay(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function normalizedKind(post: CafePost): CertificationKind {
  return post.kind ?? "daily";
}

export function CafeCheckPanel({
  members,
  posts,
  initialDate,
  initialKind = "daily",
  initialSpecialTitle = "해요마요",
  onSavePost,
}: CafeCheckPanelProps) {
  const today = toDateKey(new Date());
  const [date, setDate] = useState(initialDate ?? today);
  const [kind, setKind] = useState<CertificationKind>(initialKind);
  const [slot, setSlot] = useState<CheckSlot>(
    new Date().getHours() < 14 ? "morning" : "evening",
  );
  const [specialTitle, setSpecialTitle] = useState(initialSpecialTitle);
  const [dialog, setDialog] = useState<LinkDialogState | null>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const effectiveDate =
    kind === "weekly" ? getWeekEnd(date) : kind === "monthly" ? getMonthEnd(date) : date;
  const activeTitle =
    kind === "daily"
      ? `${slot === "morning" ? "아침" : "저녁"} 매일 인증`
      : kind === "weekly"
        ? `${getWeekNumber(effectiveDate)}주차 주간 정산`
        : kind === "monthly"
          ? `${new Date(`${effectiveDate}T00:00:00`).getMonth() + 1}월 월말 정산`
          : specialTitle.trim() || "특별 인증";
  const cafePostTitle =
    kind === "daily"
      ? `${CAFE_PREFIX} ${formatMonthDay(effectiveDate)} ${
          slot === "morning" ? "아침인증" : "저녁인증"
        }`
      : kind === "weekly"
        ? `${CAFE_PREFIX} ${formatMonthDay(effectiveDate)} ${getWeekNumber(effectiveDate)}주차 주간정산`
        : kind === "monthly"
          ? `${CAFE_PREFIX} ${
              new Date(`${effectiveDate}T00:00:00`).getMonth() + 1
            }월 월말정산`
          : `${CAFE_PREFIX} ${formatMonthDay(effectiveDate)} ${
              specialTitle.trim() || "특별인증"
            }`;

  const activePosts = posts.filter(
    (post) =>
      normalizedKind(post) === kind &&
      post.date === effectiveDate &&
      (kind !== "daily" || (post.slot ?? "morning") === slot) &&
      (kind !== "special" ||
        (post.certificationTitle?.trim() || "특별 인증") === activeTitle),
  );
  const registeredCount = new Set(activePosts.map((post) => post.memberId)).size;

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

  const copyCafePostTitle = async () => {
    await navigator.clipboard.writeText(cafePostTitle);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="panel cafe-panel">
      <div className="panel-heading">
        <div className="panel-title-group">
          <span className="panel-icon panel-icon-gold">
            <UsersRound size={20} />
          </span>
          <div>
            <p>인증 링크</p>
            <h2>{activeTitle}</h2>
          </div>
        </div>
        <div className="count-badge">
          {registeredCount}
          <span> / {members.length}명</span>
        </div>
      </div>

      <div className="certification-type-tabs" role="tablist" aria-label="인증 종류">
        {certificationTypes.map((type) => (
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

      <div className={`check-controls ${kind === "daily" ? "" : "single-control"}`}>
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
        {kind === "daily" && (
          <div className="slot-toggle" aria-label="확인 시간대">
            <button
              className={slot === "morning" ? "active" : ""}
              onClick={() => setSlot("morning")}
            >
              <Sun size={16} />
              아침
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
          {kind === "weekly" && `${formatShortDate(effectiveDate)} 마감`}
          {kind === "monthly" && `${formatShortDate(effectiveDate)} 마감`}
          {kind === "special" && `${formatShortDate(effectiveDate)} 특별 인증`}
        </div>
      )}

      <div className="copy-prefix-card">
        <div>
          <span>카페 인증글 제목</span>
          <strong>{cafePostTitle}</strong>
        </div>
        <button onClick={copyCafePostTitle}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "복사됨" : "복사"}
        </button>
      </div>

      <div className="member-check-list">
        {members.map((member) => {
          const post = activePosts.find((item) => item.memberId === member.id);
          return (
            <div className={`member-check-row ${post ? "has-post" : ""}`} key={member.id}>
              <div className="member-identity">
                <span className="member-avatar" style={{ background: member.color }}>
                  {member.initials}
                </span>
                <div>
                  <strong>{member.name}</strong>
                  <span>{post ? "인증 링크를 올렸어요" : `${activeTitle} 링크를 올려 주세요`}</span>
                </div>
              </div>

              {post ? (
                <div className="post-actions">
                  <button
                    className="link-button"
                    onClick={() => openDialog(member, post)}
                    aria-label={`${member.name} 인증 링크 수정`}
                  >
                    <Pencil size={15} />
                  </button>
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
                    올림
                  </span>
                </div>
              ) : (
                <button className="register-link-button" onClick={() => openDialog(member)}>
                  <Plus size={15} />
                  링크 올리기
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="panel-helper">
        인증 종류를 선택하고 각자 이름에서 카페 글 링크를 올려 주세요.
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
              <div className="dialog-actions align-right">
                <button className="button button-ghost" type="button" onClick={closeDialog}>
                  취소
                </button>
                <button className="button button-primary" type="submit">
                  {dialog.post ? "수정하기" : "링크 올리기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
