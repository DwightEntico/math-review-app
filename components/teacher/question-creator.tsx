"use client"

import React from 'react'
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

    const form = useForm<TestValues>({
        resolver: zodResolver(TestSchema as any),
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
                        text: '',
                        options: [
                            { id: crypto.randomUUID(), text: '', is_correct: false },
                            { id: crypto.randomUUID(), text: '', is_correct: false }
                        ],
                        correctOptionIds: [],
                        correctAnswerText: '',
                        points: 1,
                        isCalculator: false,
                        aiExplanation: '',
                        aiTutorPrompt: ''
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


    // Add this useEffect to watch errors in real-time in the console
    React.useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log("❌ Form Validation Errors:", errors);
        }
    }, [errors]);
    const onSubmit: SubmitHandler<TestValues> = async (data) => {
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
        // await supabase.from('tests').insert(formattedData);
    };
    // const onSubmit = async (data: TestValues) => {
    //     // 1. Calculate the value right here
    //     const calculatedTotalPoints = data.sections.reduce((acc, sec) => {
    //         return acc + (sec.questions?.reduce((qAcc, q) => qAcc + (Number(q.points) || 0), 0) || 0);
    //     }, 0);
    //     // 1. Transform the data to pull is_correct flags into the correctOptionIds array
    //     const finalPayload = {
    //         ...data,
    //         total_points: calculatedTotalPoints, // Now it's "stored" for the DB!
    //         sections: data.sections.map(section => ({
    //             ...section,
    //             questions: section.questions.map(q => {
    //                 if (q.type === 'multiple_choice' && q.options) {
    //                     return {
    //                         ...q,
    //                         // Map the options to find which ones are marked correct
    //                         correctOptionIds: q.options
    //                             .filter(opt => opt.is_correct)
    //                             .map(opt => opt.id)
    //                     };
    //                 }
    //                 return q;
    //             })
    //         }))
    //     };
    //     console.log("✅ Validation Passed! Data:", data);
    //     console.log("🚀 Final Payload for Database:", finalPayload);
    //     console.log("Saving to DB with Total Points:", finalPayload.total_points);
    //     // 2. Send finalPayload to Supabase
    //     // await supabase.from('tests').insert([finalPayload])
    // };
    const handleSaveDraft = () => {
        const currentValues = form.getValues();
        console.log("📝 Draft Data:", currentValues);
        toast.info("Draft data logged to console");
    };


    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="min-h-screen bg-slate-50/50 pb-20">
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
                    <div className="flex items-center gap-3">
                        <Button type="button" variant="outline" className="hidden sm:flex" onClick={handleSaveDraft}>Save Draft</Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className={cn(
                                "gap-2 transition-all",
                                !isValid && Object.keys(errors).length > 0
                                    ? "bg-slate-400 cursor-not-allowed"
                                    : "bg-purple-700 hover:bg-purple-800"
                            )}
                        >
                            <Send className="h-4 w-4" />
                            {isSubmitting ? "Publishing..." : "Publish Test"}
                        </Button>
                        {/* <Button type="submit" disabled={isSubmitting} className="bg-purple-700 hover:bg-purple-800 gap-2">
                            <Send className="h-4 w-4" /> {isSubmitting ? "Publishing..." : "Publish Test"}
                        </Button> */}
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

                                    <div className="flex items-center justify-between mb-2">
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
                                        className="bg-transparent  text-sm resize-none focus:ring-0 shadow-none  min-h-[40px]"
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
                                    <div className="grid grid-cols-5 gap-1 mt-2">
                                        {allQuestions.map((_, i) => (
                                            <div key={i} className="h-7 flex items-center justify-center bg-slate-100 rounded text-[10px] font-bold hover:bg-purple-700 hover:text-white cursor-pointer transition-colors">
                                                {i + 1}
                                            </div>
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
                <QuestionCard
                    key={field.id}
                    control={control}
                    register={register}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                    sectionIndex={sectionIndex}
                    index={qIndex}
                    remove={() => remove(qIndex)}
                />
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