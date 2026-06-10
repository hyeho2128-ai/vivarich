export type EventCategory = "queens" | "economy" | "homework" | "cafe";

export type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  category: EventCategory;
  time?: string;
};

export type Member = {
  id: string;
  name: string;
  initials: string;
  color: string;
};

export type CheckSlot = "morning" | "evening";

export type CafePost = {
  id: string;
  memberId: string;
  title: string;
  url: string;
  date: string;
  slot?: CheckSlot;
  kind?: CertificationKind;
  certificationTitle?: string;
  createdAt: string;
};

export type CertificationKind = "daily" | "weekly" | "monthly" | "special";

export type CertificationCalendarItem = {
  id: string;
  date: string;
  title: string;
  kind: CertificationKind;
  completedCount?: number;
  totalCount?: number;
};

export type TeamData = {
  members: Member[];
  events: CalendarEvent[];
  posts: CafePost[];
};
