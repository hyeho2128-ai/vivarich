"use client";

import { useState } from "react";
import {
  Megaphone,
  MessageCircle,
  PenLine,
  Pin,
  Trash2,
  X,
} from "lucide-react";
import type { BoardCategory, BoardPost, Member } from "@/lib/types";

type BoardPanelProps = {
  members: Member[];
  boardPosts: BoardPost[];
  myMemberId: string | null;
  onSave: (post: BoardPost) => void;
  onDelete: (id: string) => void;
  onRequireName: () => void;
};

type BoardFilter = "all" | BoardCategory;

const filters: { value: BoardFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "notice", label: "공지" },
  { value: "free", label: "자유" },
];

function formatPostDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const sameYear = date.getFullYear() === now.getFullYear();
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
  return `${sameYear ? "" : `${date.getFullYear()}년 `}${date.getMonth() + 1}월 ${date.getDate()}일 ${time}`;
}

export function BoardPanel({
  members,
  boardPosts,
  myMemberId,
  onSave,
  onDelete,
  onRequireName,
}: BoardPanelProps) {
  const [filter, setFilter] = useState<BoardFilter>("all");
  const [editing, setEditing] = useState<BoardPost | null>(null);
  const [showWrite, setShowWrite] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [category, setCategory] = useState<BoardCategory>("free");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const memberById = new Map(members.map((member) => [member.id, member]));
  const sorted = [...boardPosts].sort((a, b) => {
    if (a.category !== b.category) return a.category === "notice" ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
  const visible =
    filter === "all" ? sorted : sorted.filter((post) => post.category === filter);

  const openWrite = (post?: BoardPost) => {
    if (!myMemberId) {
      onRequireName();
      return;
    }
    setEditing(post ?? null);
    setCategory(post?.category ?? "free");
    setTitle(post?.title ?? "");
    setContent(post?.content ?? "");
    setError("");
    setShowWrite(true);
  };

  const closeWrite = () => {
    setShowWrite(false);
    setEditing(null);
  };

  const submit = (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    if (!myMemberId) return;
    if (!title.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    if (!content.trim()) {
      setError("내용을 입력해 주세요.");
      return;
    }
    onSave({
      id: editing?.id ?? crypto.randomUUID(),
      category,
      title: title.trim(),
      content: content.trim(),
      authorId: editing?.authorId ?? myMemberId,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
      updatedAt: editing ? new Date().toISOString() : undefined,
    });
    closeWrite();
  };

  return (
    <section className="panel board-panel">
      <div className="panel-heading">
        <div className="panel-title-group">
          <span className="panel-icon">
            <MessageCircle size={20} />
          </span>
          <div>
            <p>게시판</p>
            <h2>공지 · 자유</h2>
          </div>
        </div>
        <button className="button button-primary write-button" onClick={() => openWrite()}>
          <PenLine size={16} />
          글쓰기
        </button>
      </div>

      <div className="board-filter-tabs" role="tablist" aria-label="게시판 분류">
        {filters.map((item) => (
          <button
            className={filter === item.value ? "active" : ""}
            key={item.value}
            role="tab"
            aria-selected={filter === item.value}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="board-empty">
          아직 글이 없어요. 첫 글을 남겨 보세요!
        </div>
      ) : (
        <ul className="board-list">
          {visible.map((post) => {
            const author = memberById.get(post.authorId);
            const isMine = post.authorId === myMemberId;
            const isExpanded = expandedId === post.id;
            return (
              <li className={`board-item ${post.category}`} key={post.id}>
                <button
                  className="board-item-main"
                  onClick={() => setExpandedId(isExpanded ? null : post.id)}
                  aria-expanded={isExpanded}
                >
                  <div className="board-item-top">
                    {post.category === "notice" ? (
                      <span className="board-badge badge-notice">
                        <Pin size={12} />
                        공지
                      </span>
                    ) : (
                      <span className="board-badge badge-free">자유</span>
                    )}
                    <strong>{post.title}</strong>
                  </div>
                  <div className="board-item-meta">
                    <span
                      className="member-avatar avatar-sm"
                      style={{ background: author?.color ?? "#8b95a1" }}
                    >
                      {author?.initials ?? "?"}
                    </span>
                    <span>{author?.name ?? "알 수 없음"}</span>
                    <span className="meta-dot">·</span>
                    <span>{formatPostDate(post.createdAt)}</span>
                    {post.updatedAt && <span className="meta-edited">수정됨</span>}
                  </div>
                </button>
                {isExpanded && (
                  <div className="board-item-body">
                    <p>{post.content}</p>
                    {isMine && (
                      <div className="board-item-actions">
                        <button className="button button-ghost" onClick={() => openWrite(post)}>
                          <PenLine size={15} />
                          수정
                        </button>
                        <button
                          className="button button-danger"
                          onClick={() => {
                            if (window.confirm("이 글을 삭제할까요?")) onDelete(post.id);
                          }}
                        >
                          <Trash2 size={15} />
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {showWrite && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={closeWrite}>
          <div
            className="dialog-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="board-dialog-title"
            onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
          >
            <div className="dialog-heading">
              <div>
                <p className="dialog-kicker">게시판</p>
                <h2 id="board-dialog-title">{editing ? "글 수정" : "새 글 쓰기"}</h2>
              </div>
              <button className="icon-button" onClick={closeWrite} aria-label="닫기">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submit}>
              <div className="board-category-toggle" role="radiogroup" aria-label="글 분류">
                <button
                  className={category === "free" ? "active" : ""}
                  type="button"
                  role="radio"
                  aria-checked={category === "free"}
                  onClick={() => setCategory("free")}
                >
                  <MessageCircle size={15} />
                  자유
                </button>
                <button
                  className={category === "notice" ? "active" : ""}
                  type="button"
                  role="radio"
                  aria-checked={category === "notice"}
                  onClick={() => setCategory("notice")}
                >
                  <Megaphone size={15} />
                  공지
                </button>
              </div>
              <label>
                제목
                <input
                  autoFocus
                  value={title}
                  onChange={(inputEvent) => {
                    setTitle(inputEvent.target.value);
                    setError("");
                  }}
                  placeholder="제목을 입력해 주세요"
                  maxLength={80}
                />
              </label>
              <label>
                내용
                <textarea
                  value={content}
                  onChange={(inputEvent) => {
                    setContent(inputEvent.target.value);
                    setError("");
                  }}
                  placeholder="내용을 입력해 주세요"
                  rows={6}
                />
              </label>
              {error && <p className="form-error">{error}</p>}
              <div className="dialog-actions align-right">
                <button className="button button-ghost" type="button" onClick={closeWrite}>
                  취소
                </button>
                <button className="button button-primary" type="submit">
                  {editing ? "수정하기" : "올리기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
