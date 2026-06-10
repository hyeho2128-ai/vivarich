const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
});

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatMonth(date: Date) {
  return dateFormatter.format(date);
}

export function formatShortDate(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function getCalendarDays(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const start = new Date(year, monthIndex, 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date,
      key: toDateKey(date),
      isCurrentMonth: date.getMonth() === monthIndex,
      isToday: toDateKey(date) === toDateKey(new Date()),
    };
  });
}
