import {
  users,
  type User,
  type InsertUser,
  habits,
  type Habit,
  type InsertHabit,
  habitLogs,
  type HabitLog,
  type InsertHabitLog,
  type DashboardStats,
  type HabitWithStats,
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Habit methods
  getHabits(): Promise<Habit[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<boolean>;

  // Habit logs methods
  getHabitLogsForDate(date: Date): Promise<HabitLog[]>;
  getHabitLogsForHabit(habitId: number): Promise<HabitLog[]>;
  getHabitLog(habitId: number, date: Date): Promise<HabitLog | undefined>;
  createOrUpdateHabitLog(log: InsertHabitLog): Promise<HabitLog>;
  toggleHabitCompletion(habitId: number, date: Date): Promise<HabitLog>;

  // Statistics methods
  getDashboardStats(): Promise<DashboardStats>;
  getHabitsWithStats(): Promise<HabitWithStats[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private habits: Map<number, Habit>;
  private habitLogs: Map<string, HabitLog>;
  currentUserId: number;
  currentHabitId: number;
  currentHabitLogId: number;

  constructor() {
    this.users = new Map();
    this.habits = new Map();
    this.habitLogs = new Map();
    this.currentUserId = 1;
    this.currentHabitId = 1;
    this.currentHabitLogId = 1;
    
    // Initialize with some sample habits
    this.initializeData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Habit methods
  async getHabits(): Promise<Habit[]> {
    return Array.from(this.habits.values());
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = this.currentHabitId++;
    const habit: Habit = { 
      ...insertHabit, 
      id,
      createdAt: insertHabit.createdAt || new Date()
    };
    
    this.habits.set(id, habit);
    return habit;
  }

  async updateHabit(id: number, updates: Partial<InsertHabit>): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit) return undefined;

    const updatedHabit = { ...habit, ...updates };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<boolean> {
    return this.habits.delete(id);
  }

  // Habit logs methods
  async getHabitLogsForDate(date: Date): Promise<HabitLog[]> {
    const dateStr = date.toISOString().split('T')[0];
    return Array.from(this.habitLogs.values()).filter(
      log => log.date.toISOString().split('T')[0] === dateStr
    );
  }

  async getHabitLogsForHabit(habitId: number): Promise<HabitLog[]> {
    return Array.from(this.habitLogs.values()).filter(
      log => log.habitId === habitId
    );
  }

  async getHabitLog(habitId: number, date: Date): Promise<HabitLog | undefined> {
    const dateStr = date.toISOString().split('T')[0];
    const key = `${habitId}:${dateStr}`;
    return this.habitLogs.get(key);
  }

  async createOrUpdateHabitLog(insertLog: InsertHabitLog): Promise<HabitLog> {
    const dateStr = insertLog.date.toISOString().split('T')[0];
    const key = `${insertLog.habitId}:${dateStr}`;
    
    // Check if log exists
    const existingLog = this.habitLogs.get(key);
    if (existingLog) {
      const updatedLog = { ...existingLog, ...insertLog };
      this.habitLogs.set(key, updatedLog);
      return updatedLog;
    }
    
    // Create new log
    const id = this.currentHabitLogId++;
    const newLog: HabitLog = { ...insertLog, id };
    this.habitLogs.set(key, newLog);
    return newLog;
  }

  async toggleHabitCompletion(habitId: number, date: Date): Promise<HabitLog> {
    const dateStr = date.toISOString().split('T')[0];
    const key = `${habitId}:${dateStr}`;
    
    // Check if log exists
    const existingLog = this.habitLogs.get(key);
    if (existingLog) {
      const completed = !existingLog.completed;
      const status = completed ? 'completed' : 'pending';
      const updatedLog = { ...existingLog, completed, status };
      this.habitLogs.set(key, updatedLog);
      return updatedLog;
    }
    
    // Create new log with completed status
    const id = this.currentHabitLogId++;
    const newLog: HabitLog = { 
      id, 
      habitId, 
      date, 
      completed: true, 
      status: 'completed' 
    };
    this.habitLogs.set(key, newLog);
    return newLog;
  }

  // Statistics methods
  async getDashboardStats(): Promise<DashboardStats> {
    const habits = await this.getHabits();
    const habitsWithStats = await this.getHabitsWithStats();
    
    // Calculate current streaks
    const currentStreaks = habitsWithStats.reduce((total, habit) => total + habit.currentStreak, 0);
    
    // Calculate completion rate
    const totalLogs = Array.from(this.habitLogs.values());
    const completedCount = totalLogs.filter(log => log.completed).length;
    const completionRate = totalLogs.length > 0 
      ? Math.round((completedCount / totalLogs.length) * 100) 
      : 0;
    
    return {
      currentStreaks,
      completionRate,
      totalHabits: habits.length
    };
  }

  async getHabitsWithStats(): Promise<HabitWithStats[]> {
    const habits = await this.getHabits();
    const habitsWithStats: HabitWithStats[] = [];
    
    for (const habit of habits) {
      const logs = await this.getHabitLogsForHabit(habit.id);
      
      // Calculate current streak
      logs.sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < logs.length; i++) {
        if (logs[i].completed) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      // Calculate completion rate
      const completedCount = logs.filter(log => log.completed).length;
      const completionRate = logs.length > 0 
        ? Math.round((completedCount / logs.length) * 100) 
        : 0;
      
      habitsWithStats.push({
        ...habit,
        currentStreak,
        completionRate,
        logs
      });
    }
    
    return habitsWithStats;
  }

  // Initialize with sample data
  private initializeData() {
    // Create initial habits
    const habit1: InsertHabit = {
      name: "Morning Meditation",
      description: "15 minutes of mindfulness meditation",
      frequencyDays: "1,2,3,4,5", // Monday to Friday
      reminderTime: new Date(0, 0, 0, 6, 0), // 6:00 AM
      color: "#4F46E5",
      createdAt: new Date('2023-03-01')
    };

    const habit2: InsertHabit = {
      name: "Exercise",
      description: "45 minutes workout session",
      frequencyDays: "1,3,5", // Monday, Wednesday, Friday
      reminderTime: new Date(0, 0, 0, 17, 30), // 5:30 PM
      color: "#A855F7",
      createdAt: new Date('2023-03-01')
    };

    const habit3: InsertHabit = {
      name: "Read a Book",
      description: "Read for 30 minutes",
      frequencyDays: "0,1,2,3,4,5,6", // Every day
      reminderTime: new Date(0, 0, 0, 20, 0), // 8:00 PM
      color: "#F97316",
      createdAt: new Date('2023-03-01')
    };

    const habit4: InsertHabit = {
      name: "Drink Water",
      description: "8 glasses throughout the day",
      frequencyDays: "0,1,2,3,4,5,6", // Every day
      reminderTime: new Date(0, 0, 0, 9, 0), // 9:00 AM
      color: "#06B6D4",
      createdAt: new Date('2023-03-01')
    };

    this.createHabit(habit1);
    this.createHabit(habit2);
    this.createHabit(habit3);
    this.createHabit(habit4);

    // Generate some logs for the past 30 days
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      // For each habit, randomly mark as completed or not
      for (let habitId = 1; habitId <= 4; habitId++) {
        const completed = Math.random() > 0.3; // 70% chance of completion
        const status = completed ? 'completed' : 'pending';
        
        this.createOrUpdateHabitLog({
          habitId,
          date,
          completed,
          status
        });
      }
    }
  }
}

export const storage = new MemStorage();
