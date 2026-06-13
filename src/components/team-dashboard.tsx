"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, UserRound } from "lucide-react";
import { BoardPanel } from "./board-panel";
import { CafeCheckPanel } from "./cafe-check-panel";
import { CertReminder } from "./cert-reminder";
import { EventDialog } from "./event-dialog";
import { GoalsPanel } from "./goals-panel";
import { MonthlyCalendar } from "./monthly-calendar";
import { NamePickerDialog } from "./name-picker-dialog";
import { useMyMember } from "@/hooks/use-my-member";
import { useTeamData } from "@/hooks/use-team-data";
import { getCertificationCalendarItems } from "@/lib/certification-calendar";
import type {
  BoardPost,
  CalendarEvent,
  CafePost,
  CertificationKind,
  CheckSlot,
  Goal,
} from "@/lib/types";

type Tab = "check" | "calendar" | "board" | "goals";

export function TeamDashboard() {
  const { data, updateData } = useTeamData();
  const { myMemberId, setMyMemberId, isLoaded } = useMyMember();
  const [activeTab, setActiveTab] = useState<Tab>("check");
  const [showNamePicker, setShowNamePicker] = useState(false);
  const [showCertifications, setShowCertifications] = useState(false);
  const [certificationSelection, setCertificationSelection] = useState<{
    date: string;
    kind: CertificationKind;
    slot?: CheckSlot;
    title?: string;
  }>();
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();

  const myMember = data.members.find((member) => member.id === myMemberId) ?? null;

  const openNewEvent = (date: string) => {
    setSelectedEvent(undefined);
    setSelectedDate(date);
  };

  const saveEvent = (event: CalendarEvent) => {
    updateData((current) => ({
      ...current,
      events: current.events.some((item) => item.id === event.id)
        ? current.events.map((item) => (item.id === event.id ? event : item))
        : [...current.events, event],
    }));
    setSelectedDate(null);
    setSelectedEvent(undefined);
  };

  const deleteEvent = (id: string) => {
    updateData((current) => ({
      ...current,
      events: current.events.filter((event) => event.id !== id),
    }));
    setSelectedDate(null);
    setSelectedEvent(undefined);
  };

  const savePost = (post: CafePost) => {
    updateData((current) => {
      const postKind = post.kind ?? "daily";
      const replacementKey = `${post.memberId}:${postKind}:${post.date}:${
        postKind === "daily" ? post.slot ?? "morning" : ""
      }:${postKind === "special" ? post.certificationTitle ?? "" : ""}`;
      return {
        ...current,
        posts: [
          ...current.posts.filter(
            (item) => {
              const itemKind = item.kind ?? "daily";
              const itemKey = `${item.memberId}:${itemKind}:${item.date}:${
                itemKind === "daily" ? item.slot ?? "morning" : ""
              }:${itemKind === "special" ? item.certificationTitle ?? "" : ""}`;
              return itemKey !== replacementKey;
            },
          ),
          post,
        ],
      };
    });
  };

  const deletePost = (id: string) => {
    updateData((current) => ({
      ...current,
      posts: current.posts.filter((post) => post.id !== id),
    }));
  };

  const saveBoardPost = (post: BoardPost) => {
    updateData((current) => ({
      ...current,
      boardPosts: current.boardPosts.some((item) => item.id === post.id)
        ? current.boardPosts.map((item) => (item.id === post.id ? post : item))
        : [...current.boardPosts, post],
    }));
  };

  const deleteBoardPost = (id: string) => {
    updateData((current) => ({
      ...current,
      boardPosts: current.boardPosts.filter((post) => post.id !== id),
    }));
  };

  const saveGoal = (goal: Goal) => {
    updateData((current) => ({
      ...current,
      goals: current.goals.some((item) => item.id === goal.id)
        ? current.goals.map((item) => (item.id === goal.id ? goal : item))
        : [...current.goals, goal],
    }));
  };

  const deleteGoal = (id: string) => {
    updateData((current) => ({
      ...current,
      goals: current.goals.filter((goal) => goal.id !== id),
    }));
  };

  const certificationItems = getCertificationCalendarItems(
    month,
    data.posts,
    data.members.length,
  );

  const goCertify = (slot: CheckSlot, date: string) => {
    setCertificationSelection({ date, kind: "daily", slot });
    setActiveTab("check");
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="VIVA RICH 홈">
          <span className="brand-logo">
            <Image src="/viva-rich-logo.png" alt="" width={38} height={38} priority />
          </span>
          <span className="brand-copy">
            <strong>VIVA RICH</strong>
            <small>LIVE RICH, GROW TOGETHER</small>
          </span>
        </a>
        <button
          className={`my-name-chip ${myMember ? "" : "empty"}`}
          onClick={() => setShowNamePicker(true)}
        >
          {myMember ? (
            <>
              <span
                className="member-avatar avatar-sm"
                style={{ background: myMember.color }}
              >
                {myMember.initials}
              </span>
              {myMember.name}
            </>
          ) : (
            <>
              <UserRound size={15} />
              내 이름 선택
            </>
          )}
          <ChevronDown size={14} />
        </button>
      </header>

      <div className="page-content">
        {isLoaded && !myMember && (
          <button className="welcome-card" onClick={() => setShowNamePicker(true)}>
            <div>
              <strong>먼저 내 이름을 선택해 주세요</strong>
              <span>인증 등록, 글쓰기, 마감 알림에 사용돼요. 로그인은 필요 없어요.</span>
            </div>
            <span className="welcome-cta">선택하기</span>
          </button>
        )}

        <CertReminder myMember={myMember} posts={data.posts} onGoCertify={goCertify} />

        <nav className="workspace-tabs" role="tablist" aria-label="보기 선택">
          <button
            className={activeTab === "check" ? "active" : ""}
            role="tab"
            aria-selected={activeTab === "check"}
            onClick={() => setActiveTab("check")}
          >
            인증
          </button>
          <button
            className={activeTab === "calendar" ? "active" : ""}
            role="tab"
            aria-selected={activeTab === "calendar"}
            onClick={() => setActiveTab("calendar")}
          >
            일정
          </button>
          <button
            className={activeTab === "board" ? "active" : ""}
            role="tab"
            aria-selected={activeTab === "board"}
            onClick={() => setActiveTab("board")}
          >
            게시판
          </button>
          <button
            className={activeTab === "goals" ? "active" : ""}
            role="tab"
            aria-selected={activeTab === "goals"}
            onClick={() => setActiveTab("goals")}
          >
            목표
          </button>
        </nav>

        <div className="tab-content" role="tabpanel">
          {activeTab === "check" && (
            <CafeCheckPanel
              key={
                certificationSelection
                  ? `${certificationSelection.kind}:${certificationSelection.date}:${certificationSelection.slot ?? ""}:${certificationSelection.title ?? ""}`
                  : "today"
              }
              members={data.members}
              posts={data.posts}
              myMemberId={myMemberId}
              initialDate={certificationSelection?.date}
              initialKind={certificationSelection?.kind}
              initialSlot={certificationSelection?.slot}
              initialSpecialTitle={certificationSelection?.title}
              onSavePost={savePost}
              onDeletePost={deletePost}
              onRequireName={() => setShowNamePicker(true)}
            />
          )}
          {activeTab === "calendar" && (
            <MonthlyCalendar
              month={month}
              events={data.events}
              certificationItems={certificationItems}
              showCertifications={showCertifications}
              onMonthChange={setMonth}
              onToggleCertifications={() =>
                setShowCertifications((current) => !current)
              }
              onSelectDate={openNewEvent}
              onSelectEvent={(event) => {
                setSelectedDate(event.date);
                setSelectedEvent(event);
              }}
              onSelectCertification={(item) => {
                setCertificationSelection({
                  date: item.date,
                  kind: item.kind,
                  title: item.kind === "special" ? item.title : undefined,
                });
                setActiveTab("check");
              }}
            />
          )}
          {activeTab === "board" && (
            <BoardPanel
              members={data.members}
              boardPosts={data.boardPosts}
              myMemberId={myMemberId}
              onSave={saveBoardPost}
              onDelete={deleteBoardPost}
              onRequireName={() => setShowNamePicker(true)}
            />
          )}
          {activeTab === "goals" && (
            <GoalsPanel
              members={data.members}
              goals={data.goals}
              myMemberId={myMemberId}
              onSave={saveGoal}
              onDelete={deleteGoal}
              onRequireName={() => setShowNamePicker(true)}
            />
          )}
        </div>
      </div>

      {selectedDate && (
        <EventDialog
          date={selectedDate}
          event={selectedEvent}
          onClose={() => {
            setSelectedDate(null);
            setSelectedEvent(undefined);
          }}
          onSave={saveEvent}
          onDelete={deleteEvent}
        />
      )}

      {showNamePicker && (
        <NamePickerDialog
          members={data.members}
          currentId={myMemberId}
          onSelect={setMyMemberId}
          onClose={() => setShowNamePicker(false)}
        />
      )}
    </main>
  );
}
