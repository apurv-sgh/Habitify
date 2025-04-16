import { format, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";

export function formatDate(date: Date): string {
  if (isToday(date)) {
    return "Today";
  }
  
  if (isYesterday(date)) {
    return "Yesterday";
  }
  
  if (isThisWeek(date)) {
    return format(date, "EEEE"); // Monday, Tuesday, etc.
  }
  
  if (isThisMonth(date)) {
    return format(date, "MMMM d"); // January 1, etc.
  }
  
  return format(date, "MMMM d, yyyy"); // January 1, 2023, etc.
}

export function generateDateArray(days: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);
    dates.push(date);
  }
  
  return dates.reverse(); // oldest to newest
}

export function calculateStreak(completionDates: Date[]): number {
  if (completionDates.length === 0) return 0;
  
  // Sort dates in descending order
  const sortedDates = [...completionDates].sort((a, b) => b.getTime() - a.getTime());
  
  let streak = 1;
  let currentDate = new Date(sortedDates[0]);
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    
    if (format(sortedDates[i], "yyyy-MM-dd") === format(prevDate, "yyyy-MM-dd")) {
      streak++;
      currentDate = sortedDates[i];
    } else {
      break;
    }
  }
  
  return streak;
}

export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}
