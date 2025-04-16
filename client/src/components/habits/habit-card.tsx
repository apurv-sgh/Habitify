import { MoreVertical, Sun } from "lucide-react";
import { HabitWithStats } from "@shared/schema";
import CalendarHeatmap from "@/components/ui/calendar-heatmap";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HabitCardProps = {
  habit: HabitWithStats;
};

export default function HabitCard({ habit }: HabitCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{habit.name}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">Current streak</p>
        <div className="flex items-center">
          <Sun className="h-5 w-5 text-orange-500 mr-1" />
          <span className="text-lg font-semibold text-gray-800">
            {habit.currentStreak} {habit.currentStreak === 1 ? "day" : "days"}
          </span>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">Last 30 days</p>
        <CalendarHeatmap logs={habit.logs} days={30} />
      </div>
      
      <div>
        <p className="text-sm text-gray-500 mb-2">Overall completion rate</p>
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-green-500 rounded-full" 
            style={{ width: `${habit.completionRate}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2 text-right">{habit.completionRate}%</p>
      </div>
    </div>
  );
}
