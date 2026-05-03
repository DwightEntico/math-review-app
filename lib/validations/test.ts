import * as z from "zod"

// 1. Individual Option Schema
const OptionSchema = z.object({
    id: z.string(),
    // Remove .min(1) here so it doesn't block the form 
    // when the question type is switched or while the teacher is typing.
    text: z.string().default(""), 
    is_correct: z.coerce.boolean().default(false)
})

// 2. Question Schema
const QuestionSchema = z.object({
    id: z.string(),
    type: z.enum(["multiple_choice", "short_answer"]),
    contentType: z.enum(["text", "image"]),
     
    imageUrl: z.string().url().optional().or(z.literal("")),
    tier: z.enum(["core", "extended"]),
    text: z.string().min(1, "Question content is required"),
    options: z.array(OptionSchema).optional().default([]),
  
    correctOptionIds: z.array(z.string()).optional(),
    // correctOptionIds: z.array(z.string()).min(1, "Select at least one correct answer"),
    correctAnswerText: z.string().optional(),
    points: z.number().min(1, "Minimum 1 point"),
    isCalculator: z.boolean().default(false).optional(),
    // aiExplanation: z.string().optional(),
    aiExplanation: z.string().optional(), // Stores the 'perfect' explanation
    aiTutorPrompt: z.string().optional(),
}).superRefine((data, ctx) => {
    // 1. Logic for Multiple Choice
    if (data.type === "multiple_choice") {
        const options = data.options ?? [];

        // Check if there are any options at all
        if (options.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Add at least two choices",
                path: ["options"],
            });
        }
        // 2. Check for Duplicates
        const texts = options
            .map(o => o.text.trim().toLowerCase())
            .filter(t => t !== "");
        const hasDuplicates = new Set(texts).size !== texts.length;

        if (hasDuplicates) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Each choice must be unique",
                path: ["options"] // This will show at the bottom of the options list
            });
        }
        // If options exist, ensure at least one is checked
        // 3. At least one correct
        const hasCorrect = options.some(o => o.is_correct);
        if (!hasCorrect) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Select at least one correct answer",
                path: ["options"]
            });
        }
    }

    // 2. Logic for Short Answer
    if (data.type === "short_answer") {
        if (!data.correctAnswerText || data.correctAnswerText.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Correct answer value is required",
                path: ["correctAnswerText"],
            });
        }
    }
})

// 3. Section Schema
const SectionSchema = z.object({
    id: z.string(),
    title: z.string().min(1, "Section title is required"),
    description: z.string().optional(),
    questions: z.array(QuestionSchema).min(1, "Each section needs at least one question"),
})

// 4. Full Test Schema (Main Export)
export const TestSchema = z.object({
    title: z.string().min(5, "Test title must be at least 5 characters"),
    description: z.string().optional(),
    level: z.string().min(1, "Please select a syllabus level"),
    timeLimit: z.number().min(1, "Time limit must be at least 1 minute"),
    sampleSize: z.number().min(1, "Must pull at least 1 question"),
    sections: z.array(SectionSchema).min(1, "The test must have at least one section"),
})
    // 1. Existing Refinement: Check Sample Size vs Pool
    .refine((data) => {
        const totalPool = data.sections.reduce((acc, sec) => acc + (sec.questions?.length || 0), 0);
        return data.sampleSize <= totalPool;
    }, {
        message: "Sample size cannot be greater than the total number of questions in the pool",
        path: ["sampleSize"],
    })
    // 2. NEW Refinement: Check Total Points
    .refine((data) => {
        const totalPoints = data.sections.reduce((acc, sec) => {
            return acc + (sec.questions?.reduce((qAcc, q) => qAcc + (Number(q.points) || 0), 0) || 0);
        }, 0);
        return totalPoints > 0;
    }, {
        message: "The test must have a total point value greater than 0",
        path: ["sections"], // Highlights the content area if no points are assigned
    });

export type TestValues = z.infer<typeof TestSchema>