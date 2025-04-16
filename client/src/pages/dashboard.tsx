import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, CircleUser, Plus } from "lucide-react";

import StatCard from "@/components/dashboard/stat-card";
import HabitItem from "@/components/habits/habit-item";
import HabitCard from "@/components/habits/habit-card";
import AddHabitDialog from "@/components/habits/add-habit-dialog";
import { Button } from "@/components/ui/button";
import { DashboardStats, Habit, HabitLog, HabitWithStats } from "@shared/schema";

export default function Dashboard() {
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const { toast } = useToast();
  const today = new Date();
  
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });
  
  // Fetch today's habit logs
  const { data: todayHabits, isLoading: todayLoading } = useQuery<HabitLog[]>({
    queryKey: ['/api/habit-logs/date', format(today, 'yyyy-MM-dd')],
  });
  
  // Fetch all habits with stats
  const { data: habitsWithStats, isLoading: habitsLoading } = useQuery<HabitWithStats[]>({
    queryKey: ['/api/habits/stats'],
  });
  
  // Toggle habit completion mutation
  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habitId, date }: { habitId: number; date: Date }) => {
      await apiRequest('POST', '/api/habit-logs/toggle', {
        habitId,
        date: format(date, 'yyyy-MM-dd'),
      });
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/habit-logs/date'] });
      queryClient.invalidateQueries({ queryKey: ['/api/habits/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: "Habit updated",
        description: "Your habit status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update habit status: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Add new habit mutation
  const addHabitMutation = useMutation({
    mutationFn: async (habitData: Partial<Habit>) => {
      return await apiRequest('POST', '/api/habits', habitData);
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/habits/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: "Habit created",
        description: "Your new habit has been created successfully.",
      });
      
      setIsAddHabitOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create habit: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handleToggleHabit = (habitId: number) => {
    toggleHabitMutation.mutate({ habitId, date: today });
  };
  
  const isLoading = statsLoading || todayLoading || habitsLoading;
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-primary" />
              <h1 className="ml-2 text-xl font-semibold text-gray-800">Habitify</h1>
            </div>
            <div>
              <Button onClick={() => setIsAddHabitOpen(true)}>
                <Plus className="h-5 w-5 mr-1" />
                Add Habit
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                title="Current Streaks" 
                value={isLoading ? "..." : `${stats?.currentStreaks || 0}`} 
                icon={<CircleUser />}
                color="primary"
              />
              <StatCard 
                title="Completion Rate" 
                value={isLoading ? "..." : `${stats?.completionRate || 0}%`} 
                icon={<CheckCircle />}
                color="success"
              />
              <StatCard 
                title="Total Habits" 
                value={isLoading ? "..." : `${stats?.totalHabits || 0}`} 
                icon={<Plus />}
                color="warning"
              />
            </div>
          </div>

          {/* Today Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Today</h2>
              <p className="text-gray-500 font-medium">{format(today, 'MMMM d, yyyy')}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              {isLoading ? (
                <p className="text-gray-500 py-4">Loading today's habits...</p>
              ) : (habitsWithStats && habitsWithStats.length === 0) ? (
                <p className="text-gray-500 py-4">No habits created yet. Add your first habit!</p>
              ) : (
                habitsWithStats?.map(habit => {
                  const log = todayHabits?.find(log => log.habitId === habit.id);
                  return (
                    <HabitItem
                      key={habit.id}
                      habit={habit}
                      log={log}
                      onToggle={() => handleToggleHabit(habit.id)}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Habits List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">My Habits</h2>
              {/*<div className="flex space-x-2">
                <Button variant="outline" size="sm" className="text-sm text-gray-500 flex items-center">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="text-sm text-gray-500 flex items-center">
                  <ArrowUpDown className="h-4 w-4 mr-1" />
                  Sort
                </Button>
              </div>*/}
            </div>
            
            {isLoading ? (
              <p className="text-gray-500">Loading habits...</p>
            ) : (habitsWithStats && habitsWithStats.length === 0) ? (
              <div className="text-center py-10">
                <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
                <p className="text-gray-500 mb-4">Create your first habit to start tracking your progress</p>
                <Button onClick={() => setIsAddHabitOpen(true)}>
                  <Plus className="h-5 w-5 mr-1" />
                  Add Habit
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {habitsWithStats?.map(habit => (
                  <HabitCard key={habit.id} habit={habit} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 align-middle">© Habitify by Apurv Singh. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Add Habit Dialog */}
      <AddHabitDialog 
        open={isAddHabitOpen} 
        onOpenChange={setIsAddHabitOpen}
        onSubmit={(data) => addHabitMutation.mutate(data)}
        isPending={addHabitMutation.isPending}
      />
    </div>
  );
}
