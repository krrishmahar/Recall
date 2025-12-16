// import { z } from 'zod';

// // Memory Types
// export const MemoryType = z.enum(['future', 'decision', 'failure', 'context']);
// export type MemoryType = z.infer<typeof MemoryType>;

// export const SeverityLevel = z.enum(['low', 'medium', 'high', 'critical']);
// export type SeverityLevel = z.infer<typeof SeverityLevel>;

// // Trigger Types
// export const TriggerType = z.enum(['date', 'event', 'manual']);
// export type TriggerType = z.infer<typeof TriggerType>;

// // Input Schemas
// export const CreateMemoryInput = z.object({
//   title: z.string().min(5, 'Title must be at least 5 characters'),
//   description: z.string().min(20, 'Description must be at least 20 characters'),
//   type: MemoryType,
//   tags: z.array(z.string()).default([]),
//   severity: SeverityLevel.optional(),
//   triggerType: TriggerType.default('manual'),
//   triggerDate: z.string().datetime().optional(),
//   triggerEvent: z.string().optional(),
//   userId: z.string().default('demo-user'),
//   teamId: z.string().default('demo-team'),
// });

// export type CreateMemoryInput = z.infer<typeof CreateMemoryInput>;

// // Memory State
// export interface MemoryState {
//   id: string;
//   title: string;
//   description: string;
//   type: MemoryType;
//   tags: string[];
//   severity?: SeverityLevel;
//   triggerType: TriggerType;
//   triggerDate?: string;
//   triggerEvent?: string;
//   userId: string;
//   teamId: string;
  
//   // AI Analysis
//   aiSummary?: string;
//   aiCategory?: string;
//   rootCause?: string;
//   keyLessons?: string[];
  
//   // Status
//   status: 'active' | 'scheduled' | 'triggered' | 'archived';
//   createdAt: string;
//   triggeredAt?: string;
  
//   // Vector embedding
//   embeddingId?: string;
// }

// // Question Input
// export const AskQuestionInput = z.object({
//   question: z.string().min(5),
//   teamId: z.string().default('demo-team'),
//   limit: z.number().default(5),
// });

// export type AskQuestionInput = z.infer<typeof AskQuestionInput>;

// // RAG Response
// export interface RAGResponse {
//   answer: string;
//   sources: Array<{
//     memoryId: string;
//     title: string;
//     relevance: number;
//   }>;
// }















import { z } from 'zod'

// Memory status enum
export const memoryStatusSchema = z.enum(['active', 'scheduled', 'triggered', 'archived'])

// Memory type enum
export const memoryTypeSchema = z.enum(['future', 'decision', 'failure', 'context'])

// Severity level enum
export const severityLevelSchema = z.enum(['low', 'medium', 'high', 'critical'])

// Trigger type enum
export const triggerTypeSchema = z.enum(['date', 'event', 'manual'])

// Base memory schema
export const memorySchema = z.object({
  id: z.string(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  type: memoryTypeSchema,
  tags: z.array(z.string()).default([]),
  severity: severityLevelSchema.optional(),
  triggerType: triggerTypeSchema.default('manual'),
  triggerDate: z.string().datetime().optional(),
  triggerEvent: z.string().optional(),
  userId: z.string().default('demo-user'),
  teamId: z.string().default('demo-team'),
  
  // AI Analysis
  aiSummary: z.string().optional(),
  aiCategory: z.string().optional(),
  rootCause: z.string().optional(),
  keyLessons: z.array(z.string()).optional(),
  
  // Status
  status: memoryStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  triggeredAt: z.string().optional(),
  
  // Vector embedding
  embeddingId: z.string().optional(),
})

// Schema for creating a memory
export const createMemorySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  type: memoryTypeSchema,
  tags: z.array(z.string()).default([]),
  severity: severityLevelSchema.optional(),
  triggerType: triggerTypeSchema.default('manual'),
  triggerDate: z.string().datetime().optional(),
  triggerEvent: z.string().optional(),
  userId: z.string().default('demo-user'),
  teamId: z.string().default('demo-team'),
})

// Schema for updating a memory
export const updateMemorySchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  type: memoryTypeSchema.optional(),
  tags: z.array(z.string()).optional(),
  severity: severityLevelSchema.optional(),
  status: memoryStatusSchema.optional(),
})

// Schema for asking questions
export const askQuestionSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  teamId: z.string().default('demo-team'),
  limit: z.number().min(1).max(20).default(5),
})

// Types derived from schemas
export type Memory = z.infer<typeof memorySchema>
export type MemoryStatus = z.infer<typeof memoryStatusSchema>
export type MemoryType = z.infer<typeof memoryTypeSchema>
export type SeverityLevel = z.infer<typeof severityLevelSchema>
export type TriggerType = z.infer<typeof triggerTypeSchema>
export type CreateMemoryInput = z.infer<typeof createMemorySchema>
export type UpdateMemoryInput = z.infer<typeof updateMemorySchema>
export type AskQuestionInput = z.infer<typeof askQuestionSchema>