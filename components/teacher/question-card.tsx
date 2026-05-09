'use client'
import { createClient } from '@/lib/supabase/client'
import React, { useState } from 'react'
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
    Check,
    X
} from "lucide-react"
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css' // Import the CSS for math symbols
import { ReusableDropdown } from '../dropdown'
import { boolean } from 'zod'
import { Spinner } from '../ui/spinner'
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
    watch,
    id,
}: any) {
    const basePath = `sections.${sectionIndex}.questions.${index}`

    // 1. INITIALIZE CLIENTS
    // Ensure createClient() is called properly (usually from your utils)
    const supabase = React.useMemo(() => createClient(), []);

    // 2. ALL HOOKS AT THE TOP LEVEL
    // Do not call these inside functions or conditionals
    const questionText = useWatch({ control, name: `${basePath}.text` })
    const hasQuestionContent = questionText?.trim().length > 0;
    const currentOptions = useWatch({ control, name: `${basePath}.options` }) || []
    const questionType = useWatch({ control, name: `${basePath}.type` })
    const contentType = useWatch({ control, name: `${basePath}.contentType` })
    const hasCalculator = useWatch({ control, name: `${basePath}.hasCalculator` })
    const aiExplanation = useWatch({ control, name: `${basePath}.aiExplanation` });
    const imageUrl = useWatch({ control, name: `${basePath}.imageUrl` });
    const [activeId, setActiveId] = React.useState<string | null>(null);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [selectedTopicId, setSelectedTopicId] = useState("")
    const [mathLevels, setMathLevels] = React.useState<{ id: string, name: string }[]>([]);
    const [papers, setPapers] = React.useState<{ id: string, name: string, has_calculator: boolean }[]>([]);
    const [topics, setTopics] = React.useState<{ id: string, name: string, math_level_id: string, math_paper_id: string }[]>([]);
    const [subtopics, setSubtopics] = React.useState<{ id: string, name: string, math_level_id: string, math_paper_id: string, math_topic_id: string, }[]>([]);

    const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
        control,
        name: `${basePath}.options`
    })

    const questionErrors = errors?.sections?.[sectionIndex]?.questions?.[index]
    const getMimeType = (url: string) => {
        if (url.endsWith(".png")) return "image/png";
        if (url.endsWith(".jpg") || url.endsWith(".jpeg")) return "image/jpeg";
        if (url.endsWith(".webp")) return "image/webp";
        return "image/png"; // Default
    };


    const generateAIExplanation = async () => {

        if (contentType === 'text' && !questionText) {
            toast.error("Please enter the question text first");
            return;
        }
        if (contentType === 'image' && !imageUrl) {
            toast.error("Please upload an image first");
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch('/api/ai/generate-explanation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: questionText,
                    imageUrl: contentType === 'image' ? imageUrl : null, // ✅ Pass the URL here
                    options: currentOptions.filter((o: any) => o.text),
                    type: questionType
                }),
            });
            if (response.status === 429) {
                toast.error("The AI is a bit busy! Please wait 30 seconds and try again.");
                return;
            }

            if (!response.ok) {
                throw new Error("Something went wrong with the AI.");
            }
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error("File is too large. Max 5MB allowed.");
            return;
        }

        const loadingToast = toast.loading("Uploading image...");

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;
            const filePath = `questions/${fileName}`;

            const { data, error: uploadError } = await supabase.storage
                .from('question-media')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('question-media')
                .getPublicUrl(filePath);

            setValue(`${basePath}.imageUrl`, publicUrl, {
                shouldDirty: true,
                shouldValidate: true
            });

            toast.success("Image uploaded successfully!", { id: loadingToast });
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.message || "Failed to upload image", { id: loadingToast });
        }
    };
    const handleDeleteImage = async () => {
        if (!imageUrl) return;

        // Optional: Only show loading if you want, but a toast is usually enough
        const loadingToast = toast.loading("Deleting image...");

        try {
            // Extract the file path from the full URL
            // Example: .../storage/v1/object/public/question-media/questions/abc.png 
            // We need: 'questions/abc.png'
            const path = imageUrl.split('question-media/')[1];

            if (path) {
                const { error } = await supabase.storage
                    .from('question-media')
                    .remove([path]);

                if (error) {
                    console.error("Storage delete error:", error);
                    // We continue anyway so the user can at least upload a new one
                }
            }

            // 2. Clear the form state
            setValue(`${basePath}.imageUrl`, "", {
                shouldDirty: true,
                shouldValidate: true
            });

            toast.success("Image removed", { id: loadingToast });
        } catch (error) {
            toast.error("Error removing file", { id: loadingToast });
            // Fallback: clear the form anyway
            setValue(`${basePath}.imageUrl`, "");
        }
    };

    // math levels
    React.useEffect(() => {
        const fetchLevels = async () => {
            try {
                const res = await fetch('/api/math-levels/view/');
                const data = await res.json();
                if (Array.isArray(data)) setMathLevels(data);
            } catch (err) {
                console.error("Failed to load math levels", err);
            }
        };
        fetchLevels();
    }, []);

    const selectedMathLevelId = useWatch({
        control,
        name: `${basePath}.mathLevelId`,
        defaultValue: "" // Set a default to match your Select defaultValue
    });

    // papers
    React.useEffect(() => {
        if (!selectedMathLevelId) {
            setPapers([]);
            return;
        }

        const fetchPapers = async () => {
            const res = await fetch(`/api/math-papers/view?mathLevelId=${selectedMathLevelId}`);
            const data = await res.json();
            if (Array.isArray(data)) setPapers(data as any);
        };

        fetchPapers();
    }, [selectedMathLevelId]);

    // 1. Watch the selected paper
    // const selectedPaperId = useWatch({
    //     control,
    //     name: `${basePath}.mathPaperId`,
    // });
    const selectedMathPaperId = useWatch({
        control,
        name: `${basePath}.mathPaperId`,
        defaultValue: "" // Set a default to match your Select defaultValue
    });

    // 2. Derive the state (This runs every re-render)
    const selectedMathPaperHasCalculator = React.useMemo(() => {
        return papers.find(p => p.id === selectedMathPaperId)?.has_calculator ?? false;
    }, [selectedMathPaperId, papers]);

    // 3. Auto-update the question's calculator setting (Optional but helpful)
    React.useEffect(() => {
        if (selectedMathPaperHasCalculator !== undefined) {
            setValue(`${basePath}.hasCalculator`, selectedMathPaperHasCalculator);
        }
    }, [selectedMathPaperHasCalculator, setValue, basePath]);


    // 2. Fetch topics whenever Level or Paper changes
    React.useEffect(() => {
        // Clear subtopics if we lose the Level
        if (!selectedMathLevelId) {
            setTopics([]);
            return;
        }

        const fetchTopics = async () => {
            // We prioritize filtering by Paper, fallback to Level
            // const url = selectedMathPaperId
            //     ? `/api/math-topics/view?paperId=${selectedMathPaperId}`
            //     : `/api/math-topics/view?mathLevelId=${selectedMathLevelId}`;

            const res = await fetch(`/api/math-topics/view?mathLevelId=${selectedMathLevelId}&mathPaperId=${selectedMathPaperId}`);
            const data = await res.json();
            if (Array.isArray(data)) setTopics(data as any);
        };

        fetchTopics();
    }, [selectedMathLevelId, selectedMathPaperId]);

    const selectedMathTopicslId = useWatch({
        control,
        name: `${basePath}.topicId`,
        defaultValue: "" // Set a default to match your Select defaultValue
    });

    // subtopics
    React.useEffect(() => {
        // Clear subtopics if we lose the Level
        if (!selectedMathTopicslId) {
            setSubtopics([]);
            return;
        }

        const fetchSubtopics = async () => {

            const res = await fetch(`/api/math-subtopics/view?mathLevelId=${selectedMathLevelId}&mathPaperId=${selectedMathPaperId}&mathTopicId=${selectedMathTopicslId}`);
            const data = await res.json();
            if (Array.isArray(data)) setSubtopics(data as any);
        };

        fetchSubtopics();
    }, [selectedMathLevelId, selectedMathPaperId, selectedMathTopicslId]);

    const selectedMathSubTopicslId = useWatch({
        control,
        name: `${basePath}.subtopicId`,
        defaultValue: "" // Set a default to match your Select defaultValue
    });



    return (
        <Card
            onClick={() => setActiveId(id)} // ✅ Set active when user clicks anywhere on card
            className={cn(
                "relative group border-l-4 transition-all shadow-sm bg-white overflow-hidden",
                activeId === id ? "border-l-purple-500" : "border-l-transparent"
            )}
        >
            <div className="p-6 space-y-6">

                {/* Header: Index & Tier Selector */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <GripVertical className="h-4 w-4 cursor-grab" />
                        <span className="text-xs font-bold uppercase tracking-wider">Question {index + 1} </span>
                        {/* <p>MST {selectedMathSubTopicslId}</p> */}
                        {/* <p>MP {selectedMathPaperId}</p>
                        <p>MT {selectedMathTopicslId}</p> */}
                    </div>
                    <Tabs
                        value={contentType}
                        onValueChange={(v) => setValue(`${basePath}.contentType`, v)}
                        className="shrink-0"
                    >
                        <TabsList className="h-8 bg-slate-100/50">
                            <TabsTrigger value="text" className="text-[10px] uppercase font-bold px-3 h-6 data-[state=active]:bg-white shadow-none">
                                <Type className="h-3 w-3" />
                            </TabsTrigger>
                            <TabsTrigger value="image" className="text-[10px] uppercase font-bold px-3 h-6 data-[state=active]:bg-white shadow-none">
                                <ImageIcon className="h-3 w-3" />
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                </div>

                <div className="grid grid-cols-2 gap-2 w-full ml-auto">
                    {/* MATH LEVEL */}
                    <ReusableDropdown
                        data={mathLevels}
                        value={selectedMathLevelId}
                        placeholder="LEVEL"
                        className="w-full border-purple-200 bg-purple-50 text-purple-700"
                        disabled={mathLevels.length === 0}
                        onChange={(val) => {
                            setValue(`${basePath}.mathLevelId`, val);
                            setValue(`${basePath}.mathPaperId`, "");
                            setValue(`${basePath}.topicId`, "");
                            setValue(`${basePath}.subtopicId`, "");
                        }}
                    />

                    {/* MATH PAPER */}
                    <ReusableDropdown
                        data={papers}
                        value={selectedMathPaperId}
                        placeholder="PAPER"
                        className="w-full"
                        disabled={!selectedMathLevelId || papers.length === 0}
                        onChange={(val) => {
                            setValue(`${basePath}.mathPaperId`, val);
                            setValue(`${basePath}.topicId`, "");
                            setValue(`${basePath}.subtopicId`, "");
                        }}
                    />

                    {/* MATH TOPIC */}
                    <ReusableDropdown
                        data={topics}
                        value={selectedMathTopicslId}
                        placeholder="TOPIC"
                        className="w-full"
                        disabled={!selectedMathLevelId || !selectedMathPaperId || topics.length === 0}
                        onChange={(val) => {
                            setValue(`${basePath}.topicId`, val);
                            setValue(`${basePath}.subtopicId`, "");
                        }}
                    />

                    {/* MATH SUBTOPIC */}
                    <ReusableDropdown
                        data={subtopics}
                        value={selectedMathSubTopicslId}
                        placeholder="SUBTOPIC"
                        className="w-full"
                        disabled={!selectedMathLevelId || !selectedMathPaperId || !selectedMathTopicslId || subtopics.length === 0}
                        onChange={(val) => {
                            setValue(`${basePath}.subtopicId`, val);
                        }}
                    />
                </div>

                {/* Problem Description */}
                <Field>
                    <FieldLabel className="text-[10px] uppercase font-bold text-slate-500">Problem Description</FieldLabel>
                    {contentType === 'image' ? (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            {/* The Prompt (Context for the image) */}
                            <div className="space-y-2">
                                <FieldLabel className="text-[10px] uppercase font-bold text-slate-500 tracking-tight">
                                    Question Instructions
                                </FieldLabel>
                                <Input
                                    {...register(`${basePath}.text`)}
                                    placeholder="e.g., 'Refer to the diagram below to calculate x...'"
                                    className="text-sm border-slate-200 focus-visible:ring-purple-500 bg-white"
                                />
                            </div>

                            {/* The Upload Area */}
                            <div className="space-y-2">
                                <FieldLabel className="text-[10px] uppercase font-bold text-slate-500 tracking-tight">
                                    Visual Content
                                </FieldLabel>
                                <div className="relative group border-2 border-dashed border-slate-200 rounded-xl min-h-[200px] flex flex-col items-center justify-center bg-slate-50/30 hover:bg-purple-50/50 hover:border-purple-300 transition-all cursor-pointer overflow-hidden">

                                    {/* ✅ FIX: Use the 'imageUrl' variable from your top-level hooks */}
                                    {imageUrl ? (
                                        <div className="relative w-full p-4 flex flex-col items-center">
                                            <div className="relative max-w-full group/img">
                                                <img
                                                    src={imageUrl}
                                                    className="rounded-lg object-contain max-h-[250px] shadow-sm bg-white"
                                                    alt="Question diagram"
                                                />
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="destructive"
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                    onClick={handleDeleteImage} // ✅ Call the new function instead of inline setValue
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>

                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-3 font-medium italic">
                                                Click 'Discard' in the AI section below to refresh logic if image changed
                                            </p>
                                        </div>
                                    ) : (
                                        <label className="w-full h-full p-8 flex flex-col items-center justify-center cursor-pointer">
                                            <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                                <ImageIcon className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <p className="text-xs font-bold text-slate-600">Drag & Drop or Click to Upload</p>
                                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">
                                                PNG, JPG, SVG up to 5MB
                                            </p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
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
                        onValueChange={(v) => {
                            setValue(`${basePath}.type`, v);

                            // If switching to short answer, clear option errors
                            if (v === "short_answer") {
                                setValue(`${basePath}.options`, []); // Clear choices
                            } else {
                                // If switching back to multiple choice, give them 2 empty options
                                setValue(`${basePath}.options`, [
                                    { id: crypto.randomUUID(), text: '', is_correct: false },
                                    { id: crypto.randomUUID(), text: '', is_correct: false }
                                ]);
                            }
                        }}
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
                            {/* Show the specific error for this field */}
                            {errors?.sections?.[sectionIndex]?.questions?.[index]?.correctAnswerText && (
                                <p className="text-red-500 text-[10px] font-bold">
                                    {errors.sections[sectionIndex].questions[index].correctAnswerText.message}
                                </p>
                            )}
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
                        // disabled={isGenerating}
                        disabled={isGenerating || !hasQuestionContent}
                        onClick={generateAIExplanation}
                        className="text-purple-700 bg-purple-50 hover:bg-purple-100 gap-2 h-9 px-4 text-[11px] font-bold uppercase tracking-widest transition-all"
                    >
                        {/* <Sparkles className={cn("h-4 w-4", isGenerating && "animate-spin")} /> */}
                        {isGenerating ? (
                            <Spinner className="h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
                        )}
                        {isGenerating ? "Generating..." : !hasQuestionContent ? "Enter Question Text to use AI" : "AI Explanation"}
                    </Button>

                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 h-9",
                            hasCalculator
                                ? "bg-purple-50 border-purple-200 text-purple-700 shadow-sm"
                                : "bg-slate-50 border-slate-100 text-slate-400"
                        )}>
                            <Calculator className={cn(
                                "h-4 w-4 transition-transform duration-500",
                                hasCalculator ? "scale-110" : "scale-100 opacity-50"
                            )} />

                            <div className="flex flex-col leading-none">
                                <span className="text-[9px] font-black uppercase tracking-wider">
                                    Calculator
                                </span>
                                <span className="text-[8px] font-medium uppercase opacity-70">
                                    {hasCalculator ? "Required" : "Prohibited"}
                                </span>
                            </div>

                            {/* Visual Dot Indicator instead of a Switch */}
                            <div className={cn(
                                "h-1.5 w-1.5 rounded-full ml-1 animate-pulse",
                                hasCalculator ? "bg-purple-500" : "bg-slate-300"
                            )} />
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
        </Card >
    )
}

/**
 * core or extended question
 * choice - type: "short_answer"
 */