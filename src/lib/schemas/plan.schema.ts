import { z } from "zod";

/**
 * Schema for validating draft plan generation requests
 */
export const generateRequestSchema = z.object({
  city_id: z.string().uuid({ message: "city_id must be a valid UUID" }),
  duration_days: z
    .number()
    .int({ message: "duration_days must be an integer" })
    .min(1, { message: "duration_days must be at least 1" })
    .max(5, { message: "duration_days must be at most 5" }),
  trip_intensity: z.enum(["full day", "half day"], {
    errorMap: () => ({ message: "trip_intensity must be 'full day' or 'half day'" }),
  }),
  user_notes: z.string().max(500, { message: "user_notes must be at most 500 characters" }).optional(),
});

export type GenerateDraftPlanRequestDTO = z.infer<typeof generateRequestSchema>;

/**
 * Schema for validating individual plan activities
 */
export const planActivitySchema = z.object({
  day_number: z.number().int().min(1),
  position: z.number().int().min(1),
  name: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  google_maps_url: z.string().url(),
});

/**
 * Schema for validating the complete draft plan response
 */
export const generateResponseSchema = z.object({
  plan: z.object({
    duration_days: z.number().int().min(1).max(5),
    trip_intensity: z.enum(["full day", "half day"]),
    activities: z.array(planActivitySchema).min(1),
    disclaimer: z.string(),
  }),
});

export type GenerateDraftPlanResponseDTO = z.infer<typeof generateResponseSchema>;

/**
 * Schema for validating individual activities when saving a finalized plan
 */
export const savePlanActivitySchema = z.object({
  day_number: z.number().int().min(1),
  position: z.number().int().min(1),
  name: z.string().min(1).max(255),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  notes: z.string().max(500).optional(),
  google_maps_url: z.string().url().nullable().optional(),
});

/**
 * Schema for validating save plan requests
 * Includes refinement to ensure day_number doesn't exceed duration_days
 */
export const saveRequestSchema = z
  .object({
    city_id: z.string().uuid({ message: "city_id must be a valid UUID" }),
    duration_days: z
      .number()
      .int({ message: "duration_days must be an integer" })
      .min(1, { message: "duration_days must be at least 1" })
      .max(5, { message: "duration_days must be at most 5" }),
    trip_intensity: z.enum(["full day", "half day"], {
      errorMap: () => ({ message: "trip_intensity must be 'full day' or 'half day'" }),
    }),
    user_notes: z.string().max(500, { message: "user_notes must be at most 500 characters" }).optional(),
    activities: z.array(savePlanActivitySchema).min(1, { message: "At least one activity is required" }),
  })
  .refine(
    (data) => {
      // Ensure all activities have day_number <= duration_days
      return data.activities.every((activity) => activity.day_number <= data.duration_days);
    },
    {
      message: "All activities must have day_number less than or equal to duration_days",
      path: ["activities"],
    }
  );

export type SavePlanRequestDTO = z.infer<typeof saveRequestSchema>;
export type SavePlanActivityDTO = z.infer<typeof savePlanActivitySchema>;

/**
 * Schema for validating GET /api/plans query parameters
 * Validates pagination and sorting options
 */
export const listPlansQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1, { message: "page must be at least 1" })),
  page_size: z
    .string()
    .optional()
    .default("20")
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .int()
        .min(1, { message: "page_size must be at least 1" })
        .max(100, { message: "page_size must be at most 100" })
    ),
  sort: z
    .enum(["created_at", "updated_at", "duration_days"], {
      errorMap: () => ({ message: "sort must be one of: created_at, updated_at, duration_days" }),
    })
    .optional()
    .default("created_at"),
});

export type ListPlansQueryParams = z.infer<typeof listPlansQuerySchema>;
