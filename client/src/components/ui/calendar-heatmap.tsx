import { HabitLog } from "@shared/schema";
import { format, subDays, isEqual } from "date-fns";

type CalendarHeatmapProps = {
  logs: HabitLog[];
  days: number;
};

export default function CalendarHeatmap({ logs, days }: CalendarHeatmapProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const generateCalendarDays = () => {
    const calendarDays = [];
    
    for (let i = 0; i < days; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      
      // Find log for this date
      const log = logs.find(log => 
        isEqual(new Date(log.date).setHours(0, 0, 0, 0), date.getTime())
      );
      
      calendarDays.push({
        date,
        status: log?.completed ? "completed" : log ? "failed" : "empty",
      });
    }
    
    return calendarDays.reverse(); // Reverses to show oldest to newest
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-200";
    }
  };
  
  const calendarDays = generateCalendarDays();
  
  return (
    <div className="flex flex-wrap gap-[2px]">
      {calendarDays.map((day, index) => (
        <div
          key={index}
          className={`w-[14px] h-[14px] rounded-sm ${getStatusColor(day.status)}`}
          title={format(day.date, "MMMM d, yyyy")}
        />
      ))}
    </div>
  );
}
