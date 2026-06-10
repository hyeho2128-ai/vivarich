import { toDateKey } from "./date";
import type { TeamData } from "./types";

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();
const dateInMonth = (day: number) => toDateKey(new Date(year, month, day));

export const initialData: TeamData = {
  members: [
    { id: "m1", name: "변혜선", initials: "혜", color: "#5c6f56" },
    { id: "m2", name: "서지영", initials: "지", color: "#b96f54" },
    { id: "m3", name: "이정윤", initials: "정", color: "#6d7f9e" },
    { id: "m4", name: "박선주", initials: "선", color: "#94715e" },
    { id: "m5", name: "최정혜", initials: "최", color: "#7b6c93" },
    { id: "m6", name: "한재선", initials: "한", color: "#557f7b" },
    { id: "m7", name: "송원미", initials: "송", color: "#a4775c" },
    { id: "m8", name: "박민지", initials: "민", color: "#667a58" },
  ],
  events: [
    {
      id: "event-1",
      date: dateInMonth(5),
      title: "정기 줌 미팅",
      category: "queens",
      time: "22:00",
    },
    {
      id: "event-2",
      date: dateInMonth(12),
      title: "미국 CPI 발표",
      category: "economy",
      time: "21:30",
    },
    {
      id: "event-3",
      date: dateInMonth(16),
      title: "이번 달 독서 후기",
      category: "homework",
    },
    {
      id: "event-4",
      date: dateInMonth(20),
      title: "카페 라이브",
      category: "cafe",
      time: "20:00",
    },
  ],
  posts: [
    {
      id: "post-1",
      memberId: "m2",
      title: "6월 2주차 아침 인증",
      url: "https://cafe.naver.com/",
      date: toDateKey(now),
      slot: "morning",
      createdAt: now.toISOString(),
    },
    {
      id: "post-2",
      memberId: "m5",
      title: "오늘의 투자 기록",
      url: "https://cafe.naver.com/",
      date: toDateKey(now),
      slot: "evening",
      createdAt: now.toISOString(),
    },
  ],
};
