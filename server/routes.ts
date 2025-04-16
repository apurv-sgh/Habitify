import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertHabitSchema, insertHabitLogSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();
  
  // Error handling middleware
  const handleZodError = (err: unknown, res: express.Response) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ message: validationError.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  };

  // GET all habits
  apiRouter.get("/habits", async (req, res) => {
    try {
      const habits = await storage.getHabits();
      res.json(habits);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });

  // GET habits with stats
  apiRouter.get("/habits/stats", async (req, res) => {
    try {
      const habitsWithStats = await storage.getHabitsWithStats();
      res.json(habitsWithStats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch habit statistics" });
    }
  });

  // GET dashboard stats
  apiRouter.get("/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // GET a single habit
  apiRouter.get("/habits/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const habit = await storage.getHabit(parseInt(id));
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.json(habit);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch habit" });
    }
  });

  // POST create a new habit
  apiRouter.post("/habits", async (req, res) => {
    try {
      const habitData = insertHabitSchema.parse({
        ...req.body,
        createdAt: new Date(),
      });
      
      const newHabit = await storage.createHabit(habitData);
      res.status(201).json(newHabit);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // PUT update a habit
  apiRouter.put("/habits/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const habitData = insertHabitSchema.partial().parse(req.body);
      
      const updatedHabit = await storage.updateHabit(parseInt(id), habitData);
      
      if (!updatedHabit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.json(updatedHabit);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // DELETE a habit
  apiRouter.delete("/habits/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteHabit(parseInt(id));
      
      if (!deleted) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete habit" });
    }
  });

  // GET habit logs for a specific date
  apiRouter.get("/habit-logs/date/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const dateObj = new Date(date);
      
      if (isNaN(dateObj.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const logs = await storage.getHabitLogsForDate(dateObj);
      res.json(logs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch habit logs" });
    }
  });

  // POST create or update a habit log
  apiRouter.post("/habit-logs", async (req, res) => {
    try {
      const logData = insertHabitLogSchema.parse({
        ...req.body,
        date: new Date(req.body.date),
      });
      
      const log = await storage.createOrUpdateHabitLog(logData);
      res.status(201).json(log);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // POST toggle habit completion
  apiRouter.post("/habit-logs/toggle", async (req, res) => {
    try {
      const toggleSchema = z.object({
        habitId: z.number(),
        date: z.string().transform(val => new Date(val)),
      });
      
      const { habitId, date } = toggleSchema.parse(req.body);
      
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const log = await storage.toggleHabitCompletion(habitId, date);
      res.json(log);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Mount the API router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}
