import { toDateKey } from "./date";
import type { TeamData } from "./types";

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();
const dateInMonth = (day: number) => toDateKey(new Date(year, month, day));

export const initialData: TeamData = {
  members: [
    { id: "m1", name: "변혜선", initials: "혜", color: "#FF6B6B" },
    { id: "m2", name: "서지영", initials: "지", color: "#4D96FF" },
    { id: "m3", name: "이정윤", initials: "정", color: "#20C997" },
    { id: "m4", name: "박선주", initials: "선", color: "#FF9F43" },
    { id: "m5", name: "최정혜", initials: "최", color: "#9775FA" },
    { id: "m6", name: "한재선", initials: "한", color: "#5C7CFA" },
    { id: "m7", name: "송원미", initials: "송", color: "#FF6FB5" },
    { id: "m8", name: "박민지", initials: "민", color: "#51CF66" },
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
  boardPosts: [
    {
      id: "board-1",
      category: "notice",
      title: "게시판 사용 안내",
      content:
        "공지와 자유 글을 나눠서 올릴 수 있어요. 상단에서 내 이름을 선택하면 글쓰기와 인증 등록이 가능해요.",
      authorId: "m1",
      createdAt: now.toISOString(),
    },
  ],
};
