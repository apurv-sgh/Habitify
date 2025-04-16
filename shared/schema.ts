import { pgTable, text, serial, integer, boolean, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  frequencyDays: text("frequency_days").notNull(), // JSON string of days: "0,1,2,3,4,5,6" (0=Sunday)
  reminderTime: time("reminder_time"),
  color: text("color").notNull().default("#4F46E5"), // Default color
  createdAt: date("created_at").notNull(),
});

export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  date: date("date").notNull(),
  completed: boolean("completed").notNull().default(false),
  status: text("status").notNull().default("pending"), // 'pending', 'completed', 'in_progress'
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertHabitSchema = createInsertSchema(habits).pick({
  name: true,
  description: true,
  frequencyDays: true,
  reminderTime: true,
  color: true,
});

export const insertHabitLogSchema = createInsertSchema(habitLogs).pick({
  habitId: true,
  date: true,
  completed: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

export type InsertHabitLog = z.infer<typeof insertHabitLogSchema>;
export type HabitLog = typeof habitLogs.$inferSelect;

// For frontend usage - stats computation
export interface HabitWithStats extends Habit {
  currentStreak: number;
  completionRate: number;
  logs: HabitLog[];
}

export interface DashboardStats {
  currentStreaks: number;
  completionRate: number;
  totalHabits: number;
}
