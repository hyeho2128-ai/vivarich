"use client";

import { useEffect, useState } from "react";
import {
  AlarmClock,
  Bell,
  BellRing,
  CheckCircle2,
  CircleAlert,
  X,
} from "lucide-react";
import {
  REMINDER_BEFORE_MINUTES,
  SLOT_LABELS,
  formatRemaining,
  getLastClosedEveningWindow,
  getSlotWindow,
  hasDailyPost,
} from "@/lib/deadlines";
import { toDateKey } from "@/lib/date";
import type { CafePost, CheckSlot, Member } from "@/lib/types";

type CertReminderProps = {
  myMember: Member | null;
  posts: CafePost[];
  onGoCertify: (slot: CheckSlot, date: string) => void;
};

const NOTIFIED_PREFIX = "viva-rich-notified";
const DISMISSED_PREFIX = "viva-rich-banner-dismissed";
const NOTIFY_PROMPT_DISMISSED_KEY = "viva-rich-notify-prompt-dismissed";

function alreadyNotified(key: string) {
  return window.localStorage.getItem(`${NOTIFIED_PREFIX}:${key}`) === "1";
}

function markNotified(key: string) {
  window.localStorage.setItem(`${NOTIFIED_PREFIX}:${key}`, "1");
}

function sendNotification(title: string, body: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/viva-rich-logo.png" });
  } catch {
    // 일부 모바일 브라우저는 페이지 알림 생성을 지원하지 않음
  }
}

export function CertReminder({ myMember, posts, onGoCertify }: CertReminderProps) {
  const [now, setNow] = useState<Date | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    "default",
  );
  const [dismissedKeys, setDismissedKeys] = useState<string[]>([]);
  const [promptDismissed, setPromptDismissed] = useState(true);

  useEffect(() => {
    setNow(new Date());
    setPermission("Notification" in window ? Notification.permission : "unsupported");
    setPromptDismissed(
      window.localStorage.getItem(NOTIFY_PROMPT_DISMISSED_KEY) === "1",
    );
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  // 마감 30분 전 / 마감 경과 시 1회 브라우저 알림
  useEffect(() => {
    if (!now || !myMember) return;

    const windows = [getSlotWindow("morning", now), getSlotWindow("evening", now)];
    windows.forEach(({ slot, certDate, deadline }) => {
      if (hasDailyPost(posts, myMember.id, certDate, slot)) return;
      const label = SLOT_LABELS[slot];
      const remindAt = new Date(deadline.getTime() - REMINDER_BEFORE_MINUTES * 60000);

      if (now >= remindAt && now < deadline) {
        const key = `${certDate}:${slot}:before`;
        if (!alreadyNotified(key)) {
          markNotified(key);
          sendNotification(
            `${label} 인증 마감 ${REMINDER_BEFORE_MINUTES}분 전`,
            `${myMember.name}님, ${formatRemaining(deadline.getTime() - now.getTime())} 안에 ${label} 인증을 올려 주세요.`,
          );
        }
      } else if (slot === "morning" && now >= deadline) {
        const key = `${certDate}:${slot}:passed`;
        if (!alreadyNotified(key)) {
          markNotified(key);
          sendNotification(
            "오전 인증 시간이 지났어요",
            `${myMember.name}님, 오늘 오전 인증이 아직 등록되지 않았어요.`,
          );
        }
      }
    });

    // 가장 최근에 마감된 저녁 인증(새벽 5시 경과) 알림
    const lastEvening = getLastClosedEveningWindow(now);
    if (
      now >= lastEvening.deadline &&
      toDateKey(now) ===
        toDateKey(new Date(lastEvening.deadline)) &&
      !hasDailyPost(posts, myMember.id, lastEvening.certDate, "evening")
    ) {
      const key = `${lastEvening.certDate}:evening:passed`;
      if (!alreadyNotified(key)) {
        markNotified(key);
        sendNotification(
          "저녁 인증 시간이 지났어요",
          `${myMember.name}님, 저녁 인증(새벽 5시 마감)이 등록되지 않았어요.`,
        );
      }
    }
  }, [now, myMember, posts]);

  if (!now || !myMember) return null;

  const today = toDateKey(now);
  const morning = getSlotWindow("morning", now);
  const evening = getSlotWindow("evening", now);
  const morningDone = hasDailyPost(posts, myMember.id, morning.certDate, "morning");
  const eveningDone = hasDailyPost(posts, myMember.id, evening.certDate, "evening");
  const isEarlyMorning = evening.certDate !== today; // 새벽 0~5시: 어제 저녁 인증 진행 중

  let banner: {
    key: string;
    tone: "info" | "warn" | "done";
    icon: React.ReactNode;
    text: string;
    slot?: CheckSlot;
    date?: string;
  };

  if (isEarlyMorning && !eveningDone) {
    banner = {
      key: `info:evening:${evening.certDate}`,
      tone: "info",
      icon: <AlarmClock size={18} />,
      text: `어제 저녁 인증 마감까지 ${formatRemaining(evening.deadline.getTime() - now.getTime())} 남았어요 (새벽 5시까지)`,
      slot: "evening",
      date: evening.certDate,
    };
  } else if (!morningDone && now < morning.deadline) {
    banner = {
      key: `info:morning:${morning.certDate}`,
      tone: "info",
      icon: <AlarmClock size={18} />,
      text: `오전 인증 마감까지 ${formatRemaining(morning.deadline.getTime() - now.getTime())} 남았어요 (오전 9시까지)`,
      slot: "morning",
      date: morning.certDate,
    };
  } else if (!morningDone && now >= morning.deadline) {
    banner = {
      key: `warn:morning:${morning.certDate}`,
      tone: "warn",
      icon: <CircleAlert size={18} />,
      text: eveningDone
        ? "오늘 오전 인증 시간이 지났어요."
        : "오전 인증 시간이 지났어요. 저녁 인증은 내일 새벽 5시까지예요.",
      slot: eveningDone ? undefined : "evening",
      date: evening.certDate,
    };
  } else if (!eveningDone) {
    banner = {
      key: `info:evening:${evening.certDate}`,
      tone: "info",
      icon: <AlarmClock size={18} />,
      text: `저녁 인증 마감까지 ${formatRemaining(evening.deadline.getTime() - now.getTime())} 남았어요 (내일 새벽 5시까지)`,
      slot: "evening",
      date: evening.certDate,
    };
  } else {
    banner = {
      key: `done:${today}`,
      tone: "done",
      icon: <CheckCircle2 size={18} />,
      text: morningDone
        ? "오늘 오전·저녁 인증을 모두 마쳤어요. 멋져요!"
        : "저녁 인증을 마쳤어요!",
    };
  }

  const isDismissed = (key: string) =>
    dismissedKeys.includes(key) ||
    window.localStorage.getItem(`${DISMISSED_PREFIX}:${key}`) === "1";

  const dismiss = (key: string) => {
    window.localStorage.setItem(`${DISMISSED_PREFIX}:${key}`, "1");
    setDismissedKeys((current) => [...current, key]);
  };

  const showBanner = !isDismissed(banner.key);
  const showPermission = permission === "default" && !promptDismissed;
  if (!showBanner && !showPermission) return null;

  return (
    <div className="reminder-stack">
      {showBanner && (
        <div className={`reminder-banner reminder-${banner.tone}`}>
          <span className="reminder-icon">{banner.icon}</span>
          <p>{banner.text}</p>
          {banner.slot && banner.date && (
            <button onClick={() => onGoCertify(banner.slot!, banner.date!)}>
              인증하기
            </button>
          )}
          <button
            className="reminder-close"
            onClick={() => dismiss(banner.key)}
            aria-label="알림 닫기"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {showPermission && (
        <div className="reminder-banner reminder-permission">
          <span className="reminder-icon">
            <Bell size={18} />
          </span>
          <p>마감 30분 전과 마감 후에 알림을 받아 보세요.</p>
          <button
            onClick={async () => {
              const result = await Notification.requestPermission();
              setPermission(result);
            }}
          >
            <BellRing size={15} />
            알림 켜기
          </button>
          <button
            className="reminder-close"
            onClick={() => {
              window.localStorage.setItem(NOTIFY_PROMPT_DISMISSED_KEY, "1");
              setPromptDismissed(true);
            }}
            aria-label="알림 안내 닫기"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
