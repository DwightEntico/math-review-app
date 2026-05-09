"use client"

import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray, FormProvider, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { TestSchema, TestValues } from "@/lib/validations/test"
import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2, Save, Clock, Send } from "lucide-react"

import { QuestionCard } from './question-card'
import { Field, FieldDescription, FieldLabel, FieldGroup, FieldSeparator } from "@/components/ui/field"
import { cn } from '@/lib/utils'

export function TestBuilderShell() {
    const supabase = createClient()
    const [activeId, setActiveId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isDraftSaving, setIsDraftSaving] = useState(false);
    const [savedTestId, setSavedTestId] = useState<string | null>(null);
    const form = useForm<TestValues>({
        resolver: zodResolver(TestSchema as any),
        mode: "onChange",
        defaultValues: {
            title: "",
            description: "", // Added to match schema
            level: "igcse",
            timeLimit: 60,
            sampleSize: 10,
            sections: [
                {
                    id: crypto.randomUUID(),
                    title: 'Section 1',
                    description: '',
                    questions: [{
                        id: crypto.randomUUID(),
                        type: 'multiple_choice',
                        contentType: 'text',
                        tier: 'core',
                        mathLevelId: '',
                        mathPaperId: '',
                        text: '',
                        options: [
                            { id: crypto.randomUUID(), text: '', is_correct: false },
                            { id: crypto.randomUUID(), text: '', is_correct: false }
                        ],
                        correctOptionIds: [],
                        correctAnswerText: '',
                        points: 1,
                        hasCalculator: false,
                        aiExplanation: '',
                        aiTutorPrompt: '',
                        imageUrl: ''
                    }]
                }
            ]
        }
    })

    const { register, control, handleSubmit, setValue, watch, formState: { errors, isSubmitting, isValid } } = form

    const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
        control,
        name: "sections"
    })

    // Watch values for the summary panel
    const watchedSections = watch("sections")
    const allQuestions = watchedSections.flatMap(s => s.questions || [])
    const totalPoints = allQuestions.reduce((acc, curr) => acc + (Number(curr.points) || 0), 0)
    // This only runs once the component is in the browser
    useEffect(() => {
        setMounted(true);
    }, []);

    // Add this useEffect to watch errors in real-time in the console
    React.useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log("❌ Form Validation Errors:", errors);
        }
    }, [errors]);

    const onFormError = (errors: any) => {
        // 1. Check if there are errors in the sections
        if (errors.sections) {
            errors.sections.forEach((section: any, sIdx: number) => {
                if (section?.questions) {
                    section.questions.forEach((question: any, qIdx: number) => {
                        if (question) {
                            // 2. Identify the human-readable question number
                            // (qIdx + 1 because arrays start at 0)
                            toast.error(`Error in Question #${qIdx + 1}: Please check the required fields (Question, Choices, Correct answer or image format).`);

                            // 3. Optional: Logging specific details for you during testing
                            console.log(`Question ${qIdx + 1} Errors:`, question);
                        }
                    });
                }
            });
        }

        // 4. Handle global errors (like title or time limit)
        if (errors.title) toast.error("Test Title is required");
        if (errors.timeLimit) toast.error("Please set a valid time limit");
    };


    const handleDataSave = async (data: TestValues, status: 'draft' | 'published', setLoadingState: (loading: boolean) => void) => {
        setLoadingState(true); // Start loading
        const loadingToast = toast.loading(status === 'draft' ? "Saving draft..." : "Publishing test...");
        // 1. Format the data (Transforming is_correct booleans to correctOptionIds array)
        const formattedData = {
            ...data,
            id: savedTestId,
            status, // Inject the status tag
            sections: data.sections.map(section => ({
                ...section,
                questions: section.questions.map(q => {
                    if (q.type === 'multiple_choice') {
                        return {
                            ...q,
                            correctOptionIds: q.options
                                ?.filter(opt => opt.is_correct)
                                .map(opt => opt.id) || []
                        }
                    }
                    return q;
                })
            }))
        };

        // const loadingToast = toast.loading(status === 'draft' ? "Saving draft..." : "Publishing test...");

        try {
            const response = await fetch('/api/tests/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            // ✅ IMPORTANT: Store the ID returned by Supabase
            if (result.testId) {
                setSavedTestId(result.testId);
            }
            toast.success(status === 'draft' ? "Draft saved successfully!" : "Test published!", { id: loadingToast });

            // Optional: If published, you might want to redirect
            // if (status === 'published') router.push('/teacher/dashboard');

            return result;
        } catch (error: any) {
            toast.error(error.message || "Something went wrong", { id: loadingToast });
        } finally {
            setLoadingState(false); // ✅ Stop loading regardless of success/error
        }
    };

    const onSubmit1: SubmitHandler<TestValues> = async (data) => {
        // Before sending to Supabase, we map the is_correct booleans to the ID array
        const formattedData = {
            ...data,
            sections: data.sections.map(section => ({
                ...section,
                questions: section.questions.map(q => {
                    if (q.type === 'multiple_choice') {
                        return {
                            ...q,
                            // Map through options and find which IDs are correct
                            correctOptionIds: q.options
                                ?.filter(opt => opt.is_correct)
                                .map(opt => opt.id) || []
                        }
                    }
                    return q;
                })
            }))
        };

        console.log("Saving to Supabase:", formattedData);
        const loadingToast = toast.loading("Saving your test...");

        try {
            const response = await fetch('/api/tests/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedData),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.error);

            toast.success("Test published successfully!", { id: loadingToast });

            // Optional: Redirect to test list or preview page
            // router.push(`/teacher/tests/${result.testId}`);

        } catch (error: any) {
            toast.error(error.message || "Something went wrong", { id: loadingToast });
        }
        // await supabase.from('tests').insert(formattedData);
    };
    const onSubmit: SubmitHandler<TestValues> = async (data) => {
        await handleDataSave(data, 'published', () => { });
    };
    const handleSaveDraft = () => {
        const currentValues = form.getValues();
        if (!currentValues.title) return toast.error("Title required for draft");

        handleDataSave(currentValues, 'draft', setIsDraftSaving);
    };
    if (!mounted) return null;
    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit, onFormError)} className="min-h-screen bg-slate-50/50 pb-20">
                {/* TOP STICKY BAR */}
                <div className="sticky top-0 z-50 w-full bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-700 p-2 rounded-lg text-white">
                            <Save className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <input
                                {...register("title")}
                                className="text-xl font-semibold w-64 border-none focus:outline-none focus:ring-0 bg-transparent"
                                placeholder="Test Title..."
                            />
                            {errors.title && <span className="text-[10px] text-red-500 font-bold">{errors.title.message}</span>}
                        </div>
                    </div>
                    {/* TOP STICKY BAR */}
                    <div className="flex items-center gap-3">
                        <Button
                            type="button" // Important: type="button" avoids triggering Zod validation
                            variant="outline"
                            onClick={handleSaveDraft}
                            disabled={isSubmitting || isDraftSaving}
                        >
                            {isDraftSaving ? "Saving..." : "Save Draft"}
                        </Button>

                        <Button
                            type="submit" // Triggers Zod validation
                            disabled={isSubmitting}
                            className="bg-purple-700 hover:bg-purple-800"
                        >
                            {isSubmitting ? "Publishing..." : "Publish Test"}
                        </Button>
                    </div>
                </div>

                {/* GLOBAL ERROR SUMMARY */}
                {Object.keys(errors).length > 0 && (
                    <div className="max-w-7xl mx-auto px-4 mt-4">
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-red-500 rounded-full p-1">
                                    <Trash2 className="h-3 w-3 text-white rotate-180" /> {/* Using Trash2 inverted as an alert icon */}
                                </div>
                                <h3 className="text-sm font-bold text-red-800 uppercase tracking-tight">
                                    Submission Blocked: {Object.keys(errors).length} categories of errors found
                                </h3>
                            </div>
                            <ul className="list-disc list-inside text-xs text-red-700 space-y-1 ml-7">
                                {errors.title && <li>Test Title: {errors.title.message}</li>}
                                {errors.sampleSize && <li>Sample Size: {errors.sampleSize.message}</li>}
                                {errors.sections && (
                                    <li>Sections/Questions: Please check your questions for missing text or missing correct answers.</li>
                                )}
                            </ul>

                            {/* <div className="flex gap-4">
                                {questionErrors?.topicId && (
                                    <p className="text-[9px] text-red-500 font-bold uppercase italic">
                                        Topic required
                                    </p>
                                )}
                                {questionErrors?.subtopicId && (
                                    <p className="text-[9px] text-red-500 font-bold uppercase italic">
                                        Subtopic required
                                    </p>
                                )}
                            </div> */}

                        </div>
                    </div>
                )}
                <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT PANEL: GLOBAL SETTINGS */}
                    <aside className="lg:col-span-3 space-y-6">
                        <Card className="p-4 shadow-sm sticky top-24">
                            <FieldGroup className="gap-4">
                                <FieldLabel className="text-xs font-bold uppercase text-muted-foreground">Global Settings</FieldLabel>

                                <Field>
                                    <FieldLabel>Syllabus Level</FieldLabel>
                                    <Select onValueChange={(v) => setValue("level", v)} defaultValue={watch("level")}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="igcse">IGCSE</SelectItem>
                                            <SelectItem value="alevel">A Level</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field>
                                    <FieldLabel>Time Limit (Mins)</FieldLabel>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            className="pl-9"
                                            {...register("timeLimit", { valueAsNumber: true })}
                                        />
                                    </div>
                                    {errors.timeLimit && <FieldDescription className="text-red-500">{errors.timeLimit.message}</FieldDescription>}
                                </Field>
                                <Field>
                                    <FieldLabel>Question Sample Size</FieldLabel>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            type="number"
                                            className="w-24"
                                            {...register("sampleSize", { valueAsNumber: true })}
                                        />
                                        <span className="text-xs text-muted-foreground font-medium">
                                            out of <span className="text-purple-700 font-bold">{allQuestions.length}</span> in pool
                                        </span>
                                    </div>
                                    <FieldDescription>
                                        How many random questions will the student see?
                                    </FieldDescription>
                                    {errors.sampleSize && (
                                        <p className="text-[10px] text-red-500 font-bold mt-1">
                                            {errors.sampleSize.message}
                                        </p>
                                    )}
                                </Field>

                                <FieldSeparator className="my-2" />

                                <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                                    <p className="text-[10px] text-blue-700 leading-relaxed">
                                        <strong>Pro Tip:</strong> Setting a sample size lower than the total pool creates a unique experience for every student.
                                    </p>
                                </div>
                            </FieldGroup>
                        </Card>
                    </aside>

                    {/* CENTER PANEL: CONTENT */}
                    <main className="lg:col-span-6 space-y-12">
                        {sectionFields.map((section, sIndex) => (

                            <div key={section.id} className="space-y-6 border-l-2 border-purple-200 pl-4 ml-2">
                                <Card className="bg-purple-50/50 border-none p-6 shadow-none">

                                    <div className="flex items-center justify-between">
                                        <input
                                            {...register(`sections.${sIndex}.title`)}
                                            className="text-lg font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full"
                                            placeholder="Section Title"
                                        />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeSection(sIndex)}>
                                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                    <Textarea
                                        {...register(`sections.${sIndex}.description`)}
                                        placeholder="Section instructions..."
                                        className="bg-transparent  text-sm resize-none focus:ring-0 shadow-none  min-h-[35px]"
                                    />
                                </Card>

                                <QuestionList
                                    sectionIndex={sIndex}
                                    control={control}
                                    register={register}
                                    errors={errors}
                                    setValue={setValue}
                                />
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => appendSection({ id: crypto.randomUUID(), title: `Section ${sectionFields.length + 1}`, description: '', questions: [] })}
                            className="w-full border-2 border-purple-700 text-purple-700 bg-white hover:bg-purple-50 h-14 font-bold shadow-sm"
                        >
                            <PlusCircle className="h-5 w-5 mr-2" /> Add New Section
                        </Button>
                    </main>

                    {/* RIGHT PANEL: SUMMARY */}
                    <aside className="lg:col-span-3">
                        <Card className="p-4 sticky top-24">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Exam Summary</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span>Total Questions</span>
                                    <span className="font-bold">{allQuestions.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Total Points</span>
                                    <span className="font-bold">{totalPoints}</span>
                                </div>
                                <div className="pt-3 border-t">
                                    <FieldLabel className="text-[10px]">Jump to Question</FieldLabel>
                                    {/* In TestBuilderShell Sidebar */}
                                    {/* Find this section in your Sidebar aside area */}
                                    <div className="grid grid-cols-5 gap-1 mt-2">
                                        {watchedSections.map((section, sIdx) => (
                                            (section.questions || []).map((q, qIdx) => {
                                                // 1. This calculates the global number (1, 2, 3...) across all sections
                                                const previousQuestionsCount = watchedSections
                                                    .slice(0, sIdx)
                                                    .reduce((acc, curr) => acc + (curr.questions?.length || 0), 0);
                                                const displayIndex = previousQuestionsCount + qIdx + 1;

                                                return (
                                                    <div
                                                        key={q.id || `nav-${sIdx}-${qIdx}`} // Stable key
                                                        onClick={() => {
                                                            // 2. Select all question cards currently on the screen
                                                            const allCards = document.querySelectorAll('[id^="question-"]');
                                                            // 3. Find the one matching our current number
                                                            const targetCard = allCards[displayIndex - 1];

                                                            if (targetCard) {
                                                                targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                                setActiveId(q.id);
                                                            } else {
                                                                console.error("Could not find card at index:", displayIndex - 1);
                                                            }
                                                        }}
                                                        className={cn(
                                                            "h-7 flex items-center justify-center bg-slate-100 rounded text-[10px] font-bold hover:bg-purple-700 hover:text-white cursor-pointer transition-colors",
                                                            activeId === q.id && "bg-purple-700 text-white"
                                                        )}
                                                    >
                                                        {displayIndex}
                                                    </div>
                                                );
                                            })
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </aside>
                </div>
            </form>
        </FormProvider>
    )
}

function QuestionList({ sectionIndex, control, register, errors, setValue, watch }: any) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `sections.${sectionIndex}.questions`
    })

    return (
        <div className="space-y-6">
            {fields.map((field, qIndex) => (
                /* This ID must start with "question-" for the querySelectorAll to work */
                <div
                    key={field.id}
                    id={`question-${field.id}`}
                    className="scroll-mt-28" // Important for sticky headers
                >
                    <QuestionCard
                        id={field.id}
                        control={control}
                        register={register}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                        sectionIndex={sectionIndex}
                        index={qIndex}
                        remove={() => remove(qIndex)}
                    />
                </div>
            ))}
            <Button
                type="button"
                variant="ghost"
                className="w-full border-dashed border-2 text-muted-foreground hover:border-purple-300 hover:text-purple-700"
                onClick={() => {
                    // Generate IDs first to link them if needed
                    const opt1Id = crypto.randomUUID();
                    const opt2Id = crypto.randomUUID();

                    append({
                        id: crypto.randomUUID(),
                        type: 'multiple_choice',
                        contentType: 'text',
                        tier: 'core',
                        text: '',
                        options: [
                            { id: opt1Id, text: '' },
                            { id: opt2Id, text: '' }
                        ],
                        // FIX: Start empty, teacher will click checkboxes to add IDs
                        correctOptionIds: [],
                        correctAnswerText: '',
                        points: 1,
                        isCalculator: false,
                    });
                }}
            >
                <PlusCircle className="h-4 w-4 mr-2" /> Add Question
            </Button>
        </div>
    )
}