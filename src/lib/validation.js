import { z } from 'zod';

export const createTaskSchema = z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    assignedTo: z.string().min(1),
    priority: z.enum(['High', 'Medium', 'Low']),
    assignedDate: z.string(),
    targetDeliveryDate: z.string(),
});

export const reassignSchema = z.object({
    developerId: z.string().min(1),
});

export const statusSchema = z.object({
    status: z.enum(['In Progress', 'R&D Phase', 'Completed']),
    note: z.string().optional(),
});

