import { Check } from "lucide-react";
import { Habit, HabitLog } from "@shared/schema";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

type HabitItemProps = {
  habit: Habit;
  log?: HabitLog;
  onToggle: () => void;
};

export default function HabitItem({ habit, log, onToggle }: HabitItemProps) {
  const isCompleted = log?.completed || false;
  const status = log?.status || "pending";
  
  const getTime = (date?: Date) => {
    if (!date) return "";
    return format(date, "h:mm a");
  };
  
  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="h-4 w-4 mr-1" />
            Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Pending
          </span>
        );
    }
  };
  
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          className={`w-6 h-6 rounded-full border-2 border-primary mr-3 p-0 flex items-center justify-center hover:bg-primary/10 transition-colors ${
            isCompleted ? "bg-primary/10" : ""
          }`}
          onClick={onToggle}
        >
          {isCompleted && <Check className="h-4 w-4 text-primary" />}
        </Button>
        <div>
          <h3 className="text-base font-medium text-gray-800">{habit.name}</h3>
          <p className="text-sm text-gray-500">
            {habit.reminderTime ? `${getTime(habit.reminderTime)} - ` : ""}
            {habit.description || "No description"}
          </p>
        </div>
      </div>
      <div>{getStatusBadge()}</div>
    </div>
  );
}
