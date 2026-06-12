import { toDateKey } from "./date";
import type {
  CafePost,
  CertificationCalendarItem,
  CertificationKind,
} from "./types";

function postKind(post: CafePost): CertificationKind {
  return post.kind ?? "daily";
}

function memberCountFor(
  posts: CafePost[],
  kind: CertificationKind,
  date: string,
  title?: string,
) {
  return new Set(
    posts
      .filter(
        (post) =>
          postKind(post) === kind &&
          post.date === date &&
          (kind !== "special" || post.certificationTitle === title),
      )
      .map((post) => post.memberId),
  ).size;
}

export function getCertificationCalendarItems(
  month: Date,
  posts: CafePost[],
  totalCount: number,
) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const items: CertificationCalendarItem[] = [];

  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(year, monthIndex, day);
    const dateKey = toDateKey(date);

    items.push({
      id: `daily-${dateKey}`,
      date: dateKey,
      title: "매일 인증",
      kind: "daily",
      completedCount: memberCountFor(posts, "daily", dateKey),
      totalCount,
    });

    if (date.getDay() === 0) {
      items.push({
        id: `weekly-${dateKey}`,
        date: dateKey,
        title: "주간 정산",
        kind: "weekly",
        completedCount: memberCountFor(posts, "weekly", dateKey),
        totalCount,
      });
    }
  }

  // 월말 정산 마감: 매달 첫째 주 일요일 (직전 달 정산)
  const firstOfMonth = new Date(year, monthIndex, 1);
  const firstSundayKey = toDateKey(
    new Date(year, monthIndex, 1 + ((7 - firstOfMonth.getDay()) % 7)),
  );
  const settledMonthNumber = new Date(year, monthIndex, 0).getMonth() + 1;
  items.push({
    id: `monthly-${firstSundayKey}`,
    date: firstSundayKey,
    title: `${settledMonthNumber}월 월말 정산`,
    kind: "monthly",
    completedCount: memberCountFor(posts, "monthly", firstSundayKey),
    totalCount,
  });

  const specialGroups = new Map<string, { date: string; title: string }>();
  posts
    .filter((post) => postKind(post) === "special")
    .forEach((post) => {
      const date = new Date(`${post.date}T00:00:00`);
      if (date.getFullYear() !== year || date.getMonth() !== monthIndex) return;
      const title = post.certificationTitle?.trim() || "특별 인증";
      specialGroups.set(`${post.date}:${title}`, { date: post.date, title });
    });

  specialGroups.forEach(({ date, title }) => {
    items.push({
      id: `special-${date}-${title}`,
      date,
      title,
      kind: "special",
      completedCount: memberCountFor(posts, "special", date, title),
      totalCount,
    });
  });

  return items;
}
