"use client";

import Image from "next/image";
import { useState } from "react";
import { CalendarDays, Link2, Plus } from "lucide-react";
import { CafeCheckPanel } from "./cafe-check-panel";
import { EventDialog } from "./event-dialog";
import { MonthlyCalendar } from "./monthly-calendar";
import { useTeamData } from "@/hooks/use-team-data";
import { getCertificationCalendarItems } from "@/lib/certification-calendar";
import { toDateKey } from "@/lib/date";
import type {
  CalendarEvent,
  CafePost,
  CertificationKind,
} from "@/lib/types";

export function TeamDashboard() {
  const { data, updateData } = useTeamData();
  const [activeTab, setActiveTab] = useState<"check" | "calendar">("check");
  const [showCertifications, setShowCertifications] = useState(false);
  const [certificationSelection, setCertificationSelection] = useState<{
    date: string;
    kind: CertificationKind;
    title?: string;
  }>();
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();

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

  const today = toDateKey(new Date());
  const todayPosts = data.posts.filter(
    (post) => (post.kind ?? "daily") === "daily" && post.date === today,
  );
  const registeredMembers = new Set(todayPosts.map((post) => post.memberId)).size;
  const monthEventCount = data.events.filter((event) => {
    const date = new Date(`${event.date}T00:00:00`);
    return (
      date.getFullYear() === month.getFullYear() &&
      date.getMonth() === month.getMonth()
    );
  }).length;
  const certificationItems = getCertificationCalendarItems(
    month,
    data.posts,
    data.members.length,
  );

  const selectTab = (tab: "check" | "calendar") => {
    setActiveTab(tab);
    window.setTimeout(() => {
      document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  return (
    <main className="app-shell" id="dashboard">
      <header className="topbar">
        <a className="brand" href="#dashboard" aria-label="VIVA RICH 홈">
          <span className="brand-mark">V</span>
          <span className="brand-copy">
            <strong>VIVA RICH</strong>
            <small>Live rich, grow together</small>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="주요 메뉴">
          <button
            className={activeTab === "check" ? "active" : ""}
            onClick={() => selectTab("check")}
          >
            인증
          </button>
          <button
            className={activeTab === "calendar" ? "active" : ""}
            onClick={() => selectTab("calendar")}
          >
            일정
          </button>
        </nav>
      </header>

      <section className="brand-hero">
        <div className="brand-hero-inner">
          <div className="hero-copy">
            <span className="hero-label">VIVA RICH · 8명의 성장 기록</span>
            <h1>
              함께 기록하면,
              <br />
              꾸준함이 자산이 돼요.
            </h1>
            <p>
              아침·저녁 인증 링크와 월별 일정을 한곳에서 간편하게 관리하세요.
            </p>
            <div className="hero-actions">
              <button className="hero-primary" onClick={() => selectTab("check")}>
                인증 링크 등록하기
                <Link2 size={17} />
              </button>
              <button
                className="hero-secondary"
                onClick={() => {
                  setActiveTab("calendar");
                  openNewEvent(today);
                }}
              >
                <Plus size={17} />
                오늘 일정 추가
              </button>
            </div>
          </div>
          <div className="hero-logo-card" aria-hidden="true">
            <Image
              src="/viva-rich-logo.png"
              alt=""
              fill
              priority
              sizes="(max-width: 760px) 180px, 280px"
            />
          </div>
        </div>
      </section>

      <div className="page-content">
        <section className="workspace" id="workspace">
          <div className="workspace-tabs" role="tablist" aria-label="보기 선택">
            <button
              className={activeTab === "check" ? "active" : ""}
              role="tab"
              aria-selected={activeTab === "check"}
              onClick={() => setActiveTab("check")}
            >
              <span className="tab-icon">
                <Link2 size={19} />
              </span>
              <span className="tab-copy">
                <strong>인증</strong>
                <small>{registeredMembers} / {data.members.length}</small>
              </span>
            </button>
            <button
              className={activeTab === "calendar" ? "active" : ""}
              role="tab"
              aria-selected={activeTab === "calendar"}
              onClick={() => setActiveTab("calendar")}
            >
              <span className="tab-icon">
                <CalendarDays size={19} />
              </span>
              <span className="tab-copy">
                <strong>일정</strong>
                <small>이번 달 {monthEventCount}건</small>
              </span>
            </button>
          </div>

          <div className="tab-content" role="tabpanel">
            {activeTab === "check" ? (
            <CafeCheckPanel
              key={
                certificationSelection
                  ? `${certificationSelection.kind}:${certificationSelection.date}:${certificationSelection.title ?? ""}`
                  : "today"
              }
              members={data.members}
              posts={data.posts}
              initialDate={certificationSelection?.date}
              initialKind={certificationSelection?.kind}
              initialSpecialTitle={certificationSelection?.title}
              onSavePost={savePost}
            />
            ) : (
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
                window.setTimeout(() => {
                  document
                    .getElementById("workspace")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 0);
              }}
            />
            )}
          </div>
        </section>
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
    </main>
  );
}
