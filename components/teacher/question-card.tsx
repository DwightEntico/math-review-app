'use client'

import React from 'react'
import { useFieldArray, useWatch } from "react-hook-form"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    Field,
    FieldDescription,
    FieldLabel,
} from "@/components/ui/field"
import {
    Trash2,
    Sparkles,
    Calculator,
    GripVertical,
    Image as ImageIcon,
    Type,
    Plus,
    Check
} from "lucide-react"
import { cn } from '@/lib/utils'
// import { watch } from 'fs'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css' // Import the CSS for math symbols
/**
 * SUB-COMPONENT: Individual Option Item
 * Prevents Rules of Hooks errors by calling useWatch at the top level of its own component.
 */
function OptionItem({ control, register, basePath, optIndex, removeOption, setValue }: any) {
    const isChecked = useWatch({
        control,
        name: `${basePath}.options.${optIndex}.is_correct`
    });

    return (
        <div className="flex items-center gap-3 group/opt animate-in fade-in slide-in-from-left-1">
            {/* Hidden ID field to keep data consistent */}
            <input type="hidden" {...register(`${basePath}.options.${optIndex}.id`)} />

            <div
                onClick={() => {
                    // Force a boolean toggle
                    const newValue = !isChecked;
                    setValue(`${basePath}.options.${optIndex}.is_correct`, newValue, {
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true
                    });
                }}
                // onClick={() => setValue(`${basePath}.options.${optIndex}.is_correct`, !isChecked, { shouldDirty: true })}
                className={cn(
                    "h-5 w-5 rounded border-2 cursor-pointer flex items-center justify-center transition-all",
                    isChecked
                        ? "bg-purple-700 border-purple-700 shadow-sm"
                        : "border-slate-300 hover:border-purple-400 bg-white"
                )}
            >
                {isChecked && <Check className="h-3.5 w-3.5 text-white stroke-[4px]" />}
            </div>

            <Input
                {...register(`${basePath}.options.${optIndex}.text`)}
                placeholder={`Option ${optIndex + 1}`}
                className="border-none border-b h-9 text-sm focus-visible:ring-0 focus-visible:border-purple-500 rounded-none bg-transparent transition-colors"
            />

            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover/opt:opacity-100 transition-opacity hover:text-red-600"
                onClick={() => removeOption(optIndex)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}

/**
 * MAIN COMPONENT: Question Card
 */
export function QuestionCard({
    control,
    register,
    errors,
    sectionIndex,
    index,
    remove,
    setValue,
    watch
}: any) {
    const basePath = `sections.${sectionIndex}.questions.${index}`

    // Add these two watches at the top level
    const questionText = useWatch({ control, name: `${basePath}.text` })
    const currentOptions = useWatch({ control, name: `${basePath}.options` }) || []

    const questionErrors = errors?.sections?.[sectionIndex]?.questions?.[index]

    // Watch values for conditional rendering
    const questionType = useWatch({ control, name: `${basePath}.type` })
    const contentType = useWatch({ control, name: `${basePath}.contentType` })

    const isCalculator = useWatch({ control, name: `${basePath}.isCalculator` })
    const [isGenerating, setIsGenerating] = React.useState(false);

    // Options Field Array
    const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
        control,
        name: `${basePath}.options`
    })
    const generateAIExplanation = async () => {
        // No more calling watch() here, we use the variables from above
        if (!questionText) {
            toast.error("Please enter a question first");
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch('/api/ai/generate-explanation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: questionText,
                    options: currentOptions.filter((o: any) => o.text),
                    type: questionType
                }),
            });

            const data = await response.json();
            if (data.explanation) {
                setValue(`${basePath}.aiExplanation`, data.explanation, { shouldDirty: true });
                toast.success("Explanation generated!");
            }
        } catch (error) {
            toast.error("Failed to reach AI tutor");
        } finally {
            setIsGenerating(false);
        }
    };

    // CALL HOOKS HERE (Top Level)
    const aiExplanation = useWatch({
        control,
        name: `${basePath}.aiExplanation`
    });
    return (
        <Card className="relative group border-l-4 border-l-transparent hover:border-l-purple-500 transition-all shadow-sm bg-white overflow-hidden">
            <div className="p-6 space-y-6">

                {/* Header: Index & Tier Selector */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <GripVertical className="h-4 w-4 cursor-grab" />
                        <span className="text-xs font-bold uppercase tracking-wider">Question {index + 1}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Select
                            defaultValue="core"
                            onValueChange={(v) => setValue(`${basePath}.tier`, v)}
                        >
                            <SelectTrigger className="w-[110px] h-8 text-[10px] font-bold border-purple-200 text-purple-700 uppercase">
                                <SelectValue placeholder="TIER" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="core">CORE</SelectItem>
                                <SelectItem value="extended">EXTENDED</SelectItem>
                            </SelectContent>
                        </Select>

                        <Tabs value={contentType} onValueChange={(v) => setValue(`${basePath}.contentType`, v)}>
                            <TabsList className="h-8">
                                <TabsTrigger value="text" className="text-[10px] uppercase font-bold px-3">
                                    <Type className="h-3 w-3 mr-1" /> Text
                                </TabsTrigger>
                                <TabsTrigger value="image" className="text-[10px] uppercase font-bold px-3">
                                    <ImageIcon className="h-3 w-3 mr-1" /> Image
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {/* Problem Description */}
                <Field>
                    <FieldLabel className="text-[10px] uppercase font-bold text-slate-500">Problem Description</FieldLabel>
                    {contentType === 'image' ? (
                        <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center bg-slate-50/30 hover:bg-slate-50 transition-colors">
                            <ImageIcon className="h-8 w-8 text-slate-400 mb-2" />
                            <Button type="button" variant="outline" size="sm" className="font-bold">Upload Image</Button>
                        </div>
                    ) : (
                        <Textarea
                            placeholder="Enter your math question (LaTeX supported)..."
                            className="bg-slate-50/30 border-none min-h-[100px] focus-visible:ring-1 text-base leading-relaxed"
                            {...register(`${basePath}.text`)}
                        />
                    )}
                    {/* Change this from correctOptionIds to options */}
                    {questionErrors?.options && (
                        <p className="text-[10px] text-red-500 font-bold ml-8 uppercase italic tracking-tighter">
                            {questionErrors.options.message}
                        </p>
                    )}
                </Field>

                {/* Question Type Selector */}
                <div className="w-full md:w-[220px]">
                    <Select
                        defaultValue="multiple_choice"
                        onValueChange={(v) => setValue(`${basePath}.type`, v)}
                    >
                        <SelectTrigger className="h-10 bg-white border-slate-200 shadow-sm font-medium">
                            <SelectValue placeholder="Select Question Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="multiple_choice">Multiple Choice (Checkboxes)</SelectItem>
                            <SelectItem value="short_answer">Short Answer (Free Text)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Answer Input Logic */}
                <div className="pt-2">
                    {questionType === 'multiple_choice' ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <FieldLabel className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                                    Options
                                </FieldLabel>
                                <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded uppercase">
                                    Mark correct answers
                                </span>
                            </div>

                            <div className="space-y-3">
                                {optionFields.map((opt, optIndex) => (
                                    <OptionItem
                                        key={opt.id}
                                        optIndex={optIndex}
                                        control={control}
                                        register={register}
                                        basePath={basePath}
                                        removeOption={removeOption}
                                        setValue={setValue}
                                    />
                                ))}
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-purple-700 text-xs font-bold gap-2 ml-8 hover:bg-purple-50 h-9"
                                onClick={() => appendOption({ id: crypto.randomUUID(), text: '', is_correct: false })}
                            >
                                <Plus className="h-4 w-4" /> Add Option
                            </Button>
                            {questionErrors?.options && (
                                <p className="text-[10px] text-red-500 font-bold ml-8 uppercase mt-2 italic">
                                    {questionErrors.options.message}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-5 rounded-xl border border-dashed border-slate-200 animate-in fade-in slide-in-from-top-1">
                            <FieldLabel className="text-purple-700 uppercase text-[10px] font-black tracking-widest block mb-3">Correct Answer Value</FieldLabel>
                            <Input
                                placeholder="e.g. 42 or x=5"
                                className="bg-white border-slate-200 h-11 font-mono shadow-sm"
                                {...register(`${basePath}.correctAnswerText`)}
                            />
                            <p className="text-[10px] text-muted-foreground mt-3 italic font-medium opacity-70">
                                Exact match required for auto-grading.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {/* ... Inside QuestionCard, after the Question Type/Answer Logic section ... */}

                {/* FOOTER TOOLBAR */}
                <div className="pt-5 border-t flex items-center justify-between">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isGenerating}
                        onClick={generateAIExplanation}
                        className="text-purple-700 bg-purple-50 hover:bg-purple-100 gap-2 h-9 px-4 text-[11px] font-bold uppercase tracking-widest transition-all"
                    >
                        <Sparkles className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                        {isGenerating ? "Generating..." : "AI Explanation"}
                    </Button>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 h-9">
                            <Calculator className={cn("h-4 w-4 transition-colors", isCalculator ? "text-purple-700" : "text-slate-300")} />
                            <span className="text-[10px] font-bold uppercase text-slate-500">Calc</span>
                            <Switch
                                checked={isCalculator ?? false}
                                onCheckedChange={(checked) => setValue(`${basePath}.isCalculator`, checked)}
                                className="scale-75 data-[state=checked]:bg-purple-700"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                className="w-14 h-9 text-center text-xs font-black border-slate-200 focus-visible:ring-purple-500"
                                {...register(`${basePath}.points`, { valueAsNumber: true })}
                            />
                            <span className="text-[10px] font-black uppercase text-slate-400">Pts</span>
                        </div>

                        <div className="h-6 w-px bg-slate-200 mx-1" />

                        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-red-500 transition-colors" onClick={remove}>
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* AI EXPLANATION SECTION - NOW AT THE VERY BOTTOM */}
                {aiExplanation && (
                    <div className="mt-6 border border-purple-100 rounded-xl overflow-hidden bg-white shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-purple-50/50 px-4 py-2.5 flex items-center justify-between border-b border-purple-100">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                                <span className="text-[10px] font-black text-purple-800 uppercase tracking-widest">
                                    AI Tutor Logic
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[9px] font-bold text-slate-400 hover:text-red-600 uppercase transition-colors"
                                onClick={() => setValue(`${basePath}.aiExplanation`, "")}
                            >
                                Discard
                            </Button>
                        </div>

                        <div className="p-4 bg-slate-50/30">
                            <Tabs defaultValue="preview" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 h-8 bg-slate-100/50 mb-4">
                                    <TabsTrigger value="preview" className="text-[10px] uppercase font-bold tracking-tight">Preview</TabsTrigger>
                                    <TabsTrigger value="edit" className="text-[10px] uppercase font-bold tracking-tight">Edit Raw</TabsTrigger>
                                </TabsList>

                                <TabsContent value="preview" className="mt-0 min-h-[100px]">
                                    <div className="prose prose-sm prose-purple max-w-none text-slate-700 leading-relaxed italic">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkMath]}
                                            rehypePlugins={[rehypeKatex]}
                                        >
                                            {aiExplanation}
                                        </ReactMarkdown>
                                    </div>
                                </TabsContent>

                                <TabsContent value="edit" className="mt-0">
                                    <Textarea
                                        {...register(`${basePath}.aiExplanation`)}
                                        className="text-xs font-mono bg-white border-slate-200 focus-visible:ring-purple-500 min-h-[120px] leading-relaxed shadow-inner p-3"
                                        placeholder="Customize the AI's explanation here..."
                                    />
                                </TabsContent>
                            </Tabs>

                            <p className="text-[9px] text-slate-400 italic mt-4 border-t pt-2 border-slate-100">
                                * This explanation will be available as a hint or post-test review for students.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    )
}