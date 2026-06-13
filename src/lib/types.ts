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

export type BoardCategory = "notice" | "free";

export type BoardPost = {
  id: string;
  category: BoardCategory;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt?: string;
};

export type Goal = {
  id: string;
  memberId: string;
  title: string;
  done: boolean;
  createdAt: string;
};

export type TeamData = {
  members: Member[];
  events: CalendarEvent[];
  posts: CafePost[];
  boardPosts: BoardPost[];
  goals: Goal[];
};
