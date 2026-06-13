import { toDateKey } from "./date";
import type { CafePost, CheckSlot } from "./types";

// 인증 마감: 오전 = 당일 오전 9시, 저녁 = 다음날 새벽 5시
export const MORNING_DEADLINE_HOUR = 9;
export const EVENING_DEADLINE_HOUR = 5; // 다음날 새벽

// 마감 몇 분 전에 미리 알림을 보낼지
export const REMINDER_BEFORE_MINUTES = 30;

export const SLOT_LABELS: Record<CheckSlot, string> = {
  morning: "오전",
  evening: "저녁",
};

export type SlotWindow = {
  slot: CheckSlot;
  certDate: string; // 인증글이 속하는 날짜
  deadline: Date;
};

function atHour(base: Date, dayOffset: number, hour: number) {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + dayOffset, hour, 0);
}

// 지금 시각 기준으로 진행 중인 인증 창(인증 날짜 + 마감 시각)을 구한다.
export function getSlotWindow(slot: CheckSlot, now: Date): SlotWindow {
  if (slot === "morning") {
    return { slot, certDate: toDateKey(now), deadline: atHour(now, 0, MORNING_DEADLINE_HOUR) };
  }
  // 새벽 5시 전이면 아직 어제 저녁 인증 시간
  if (now.getHours() < EVENING_DEADLINE_HOUR) {
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    return { slot, certDate: toDateKey(yesterday), deadline: atHour(now, 0, EVENING_DEADLINE_HOUR) };
  }
  return { slot, certDate: toDateKey(now), deadline: atHour(now, 1, EVENING_DEADLINE_HOUR) };
}

// 가장 최근에 지나간 저녁 인증 창 (마감 경과 알림용)
export function getLastClosedEveningWindow(now: Date): SlotWindow {
  const offset = now.getHours() < EVENING_DEADLINE_HOUR ? -2 : -1;
  const certDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
  return {
    slot: "evening",
    certDate: toDateKey(certDay),
    deadline: atHour(certDay, 1, EVENING_DEADLINE_HOUR),
  };
}

export function hasDailyPost(
  posts: CafePost[],
  memberId: string,
  dateKey: string,
  slot: CheckSlot,
) {
  return posts.some(
    (post) =>
      (post.kind ?? "daily") === "daily" &&
      post.memberId === memberId &&
      post.date === dateKey &&
      (post.slot ?? "morning") === slot,
  );
}

export function formatRemaining(ms: number) {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
}
