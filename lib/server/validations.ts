import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().trim().min(3).max(30),
  email: z.string().trim().email(),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  username: z.string().trim().min(3).max(30),
  name: z.string().trim().max(100).nullable().optional(),
  bio: z.string().trim().max(500).nullable().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export const createRoadmapSchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(1000).nullable().optional(),
});

export const updateRoadmapSchema = createRoadmapSchema;

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().trim().min(1).nullable().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  completed: z.boolean().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().trim().min(1).nullable().optional(),
});

export const generateRoadmapSchema = z.object({
  goal: z.string().trim().min(3).max(300),
});

export const githubUsernameSchema = z.object({
  githubUsername: z.string().trim().max(100).nullable().optional(),
});

export const leetcodeUsernameSchema = z.object({
  leetcodeUsername: z.string().trim().max(100).nullable().optional(),
});

export const createTodoSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().trim().min(1).nullable().optional(),
});

export const updateTodoSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().trim().min(1).nullable().optional(),
  completed: z.boolean().optional(),
});

export const aiPlanSchema = z.object({
  days: z.number().int().min(1).max(14).optional(),
});